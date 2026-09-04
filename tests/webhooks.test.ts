import { createHmac } from 'node:crypto'
import { describe, expect, it } from 'vitest'
import {
  ConversationsCreatedEvent,
  ProjectsUpdatedEvent,
  RESPONDENT_WEBHOOK_SIGNATURE_HEADER,
  ScreenerResponsesCreatedEvent,
  UnknownWebhookEvent,
  WebhookEvent,
  getWebhookSignatureHeader,
  parseWebhookSignatureHeader,
  verifyWebhookSignature,
} from '../src/webhooks'

const PRIVATE_KEY = '44450f9c-f43c-4c26-98cb-53bdc0f49fde'

const EVENT = {
  event: 'SCREENER_RESPONSES.CREATED',
  uuid: '006a4577-43d6-448a-a3d6-1a63581ca217',
  created: '2026-01-08T23:09:08.239Z',
  payload: {
    resource: {
      id: '69603913cd7d6158385a1ff7',
      projectId: '69603913cd7d6158385a1ff6',
      type: 'screener-responses',
    },
  },
}

const RAW_BODY = JSON.stringify(EVENT)

const sign = (body: string, algorithm = 'sha256', key = PRIVATE_KEY) =>
  `${algorithm}=${createHmac(algorithm, key).update(body).digest('base64')}`

describe('parseWebhookSignatureHeader', () => {
  it('splits the algorithm prefix from the digest', () => {
    expect(parseWebhookSignatureHeader('sha256=abc123')).toEqual({
      algorithm: 'sha256',
      signature: 'abc123',
    })
  })

  it('returns undefined for malformed headers', () => {
    expect(parseWebhookSignatureHeader(undefined)).toBeUndefined()
    expect(parseWebhookSignatureHeader('')).toBeUndefined()
    expect(parseWebhookSignatureHeader('no-separator')).toBeUndefined()
    expect(parseWebhookSignatureHeader('=abc123')).toBeUndefined()
    expect(parseWebhookSignatureHeader('sha256=')).toBeUndefined()
  })
})

describe('getWebhookSignatureHeader', () => {
  it('reads the header case-insensitively from a plain map', () => {
    expect(
      getWebhookSignatureHeader({
        'Respondent-Webhook-Signature': 'sha256=abc',
      }),
    ).toBe('sha256=abc')
  })

  it('reads the header from a Headers instance', () => {
    const headers = new Headers({
      [RESPONDENT_WEBHOOK_SIGNATURE_HEADER]: 'sha256=abc',
    })
    expect(getWebhookSignatureHeader(headers)).toBe('sha256=abc')
  })
})

describe('verifyWebhookSignature', () => {
  it('accepts a known-good signature over the raw body', () => {
    expect(
      verifyWebhookSignature({
        payload: RAW_BODY,
        signatureHeader: sign(RAW_BODY),
        privateKey: PRIVATE_KEY,
      }),
    ).toBe(true)
  })

  it('accepts an object payload, matching the provider sample', () => {
    expect(
      verifyWebhookSignature({
        payload: EVENT,
        signatureHeader: sign(JSON.stringify(EVENT)),
        privateKey: PRIVATE_KEY,
      }),
    ).toBe(true)
  })

  it('accepts raw bytes', () => {
    expect(
      verifyWebhookSignature({
        payload: new TextEncoder().encode(RAW_BODY),
        signatureHeader: sign(RAW_BODY),
        privateKey: PRIVATE_KEY,
      }),
    ).toBe(true)
  })

  it('rejects a tampered payload', () => {
    const signature = sign(RAW_BODY)
    const tampered = RAW_BODY.replace(
      '69603913cd7d6158385a1ff7',
      '000000000000000000000000',
    )

    expect(tampered).not.toBe(RAW_BODY)
    expect(
      verifyWebhookSignature({
        payload: tampered,
        signatureHeader: signature,
        privateKey: PRIVATE_KEY,
      }),
    ).toBe(false)
  })

  it('rejects a signature made with a different key', () => {
    expect(
      verifyWebhookSignature({
        payload: RAW_BODY,
        signatureHeader: sign(RAW_BODY, 'sha256', 'not-the-private-key'),
        privateKey: PRIVATE_KEY,
      }),
    ).toBe(false)
  })

  it('rejects a missing or malformed header', () => {
    expect(
      verifyWebhookSignature({
        payload: RAW_BODY,
        signatureHeader: undefined,
        privateKey: PRIVATE_KEY,
      }),
    ).toBe(false)
    expect(
      verifyWebhookSignature({
        payload: RAW_BODY,
        signatureHeader: 'nonsense',
        privateKey: PRIVATE_KEY,
      }),
    ).toBe(false)
  })

  it('rejects an algorithm outside the allow list', () => {
    // The header names the algorithm, so a downgrade must not be honoured.
    expect(
      verifyWebhookSignature({
        payload: RAW_BODY,
        signatureHeader: sign(RAW_BODY, 'md5'),
        privateKey: PRIVATE_KEY,
      }),
    ).toBe(false)
  })

  it('honours an explicitly widened allow list', () => {
    expect(
      verifyWebhookSignature({
        payload: RAW_BODY,
        signatureHeader: sign(RAW_BODY, 'sha1'),
        privateKey: PRIVATE_KEY,
        allowedAlgorithms: ['sha1'],
      }),
    ).toBe(true)
  })

  it('rejects an empty private key', () => {
    expect(
      verifyWebhookSignature({
        payload: RAW_BODY,
        signatureHeader: sign(RAW_BODY),
        privateKey: '',
      }),
    ).toBe(false)
  })
})

describe('webhook event schemas', () => {
  it('parses a screener response created event', () => {
    const parsed = ScreenerResponsesCreatedEvent.parse(EVENT)
    expect(parsed.payload.resource.projectId).toBe('69603913cd7d6158385a1ff6')
  })

  it('narrows through the discriminated union', () => {
    const result = WebhookEvent.safeParse({
      event: 'PROJECTS.UPDATED',
      uuid: '4aae25da-dd7b-4e2d-bb6a-9177dec83baa',
      created: '2026-01-08T23:09:42.677Z',
      payload: {
        resource: {
          id: '69603934cd7d6158385a200c',
          type: 'projects',
          updatedFields: [
            {
              name: 'recruitingStatus',
              oldValue: 'RECRUITING',
              newValue: 'RECRUITED',
            },
          ],
        },
      },
    })

    expect(result.success).toBe(true)
    if (!result.success) {
      return
    }
    if (result.data.event === 'PROJECTS.UPDATED') {
      expect(result.data.payload.resource.updatedFields[0]?.newValue).toBe(
        'RECRUITED',
      )
    }
  })

  it('keeps fields the schema does not name', () => {
    const parsed = ProjectsUpdatedEvent.parse({
      event: 'PROJECTS.UPDATED',
      uuid: 'a',
      created: 'b',
      somethingNew: 'kept',
      payload: {
        resource: { id: 'p', type: 'projects', updatedFields: [] },
      },
    })

    expect(parsed.somethingNew).toBe('kept')
  })

  it('parses a conversation created event', () => {
    const parsed = ConversationsCreatedEvent.parse({
      event: 'CONVERSATIONS.CREATED',
      uuid: 'ede25382-a2e4-4a81-b591-a311ec302e4f',
      created: '2026-01-08T23:08:28.975Z',
      payload: {
        resource: {
          conversation: {
            uid: '04576ba9-2309-4f3b-82b4-2771fe737085',
            name: 'Conversation Test',
            participants: [{ uid: 'fe799a09-08ac-4486-8dee-4f69dc1b5153' }],
          },
          teamId: '67c4f87adbb9ff9dc5322fe0',
        },
      },
    })

    expect(parsed.payload.resource.conversation.participants).toHaveLength(1)
  })

  it('rejects an unknown event type, which UnknownWebhookEvent accepts', () => {
    const body = {
      event: 'SOMETHING.NEW',
      uuid: 'a',
      created: 'b',
      payload: { resource: {} },
    }

    expect(WebhookEvent.safeParse(body).success).toBe(false)
    expect(UnknownWebhookEvent.parse(body).event).toBe('SOMETHING.NEW')
  })
})
