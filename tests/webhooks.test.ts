import { createHmac } from 'node:crypto'
import { describe, expect, it, vi } from 'vitest'
import {
  ConversationsCreatedEvent,
  ProjectsUpdatedEvent,
  RESPONDENT_WEBHOOK_SIGNATURE_HEADER,
  ScreenerResponsesCreatedEvent,
  UnknownWebhookEvent,
  WebhookEvent,
  getWebhookSignatureHeader,
  parseWebhookSignatureHeader,
  verifyAndDedupeWebhook,
  verifyWebhookSignatureFromParsedBody,
  verifyWebhookSignatureFromRawBody,
} from '../src/webhooks'
import type { WebhookDeliveryClaim } from '../src/webhooks'

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

const signBytes = (bytes: Uint8Array, key = PRIVATE_KEY) =>
  `sha256=${createHmac('sha256', key).update(bytes).digest('base64')}`

/**
 * A valid webhook event whose bytes hold a lone 0xFF, which is not a valid
 * UTF-8 sequence. A lenient decode turns it into U+FFFD and leaves JSON that
 * parses into a storable event the provider never sent.
 */
const INVALID_UTF8_BODY = Buffer.concat([
  Buffer.from(
    '{"event":"SCREENER_RESPONSES.CREATED","uuid":"utf8-probe","created":"2026-01-08T23:09:08.239Z","payload":{"note":"',
  ),
  Buffer.from([0xff]),
  Buffer.from('"}}'),
])

const digestOf = (body: string, key = PRIVATE_KEY) =>
  createHmac('sha256', key).update(body).digest('base64')

const BASE64_ALPHABET =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'

/**
 * Re-spell a padded base64 digest with non-zero padding bits. The last data
 * character of a padded group carries bits that fall outside the decoded
 * bytes, so nudging it up by one changes the spelling and nothing else.
 */
const withNonZeroPaddingBits = (digest: string): string => {
  const index = digest.indexOf('=') - 1
  const character = digest[index]
  if (index < 0 || character === undefined) {
    throw new Error('digest is not padded')
  }
  const respelled = BASE64_ALPHABET[BASE64_ALPHABET.indexOf(character) + 1]
  if (respelled === undefined) {
    throw new Error('digest is not canonical')
  }
  return digest.slice(0, index) + respelled + digest.slice(index + 1)
}

describe('parseWebhookSignatureHeader', () => {
  it('splits the algorithm prefix from the digest', () => {
    const digest = createHmac('sha256', PRIVATE_KEY)
      .update(RAW_BODY)
      .digest('base64')

    expect(parseWebhookSignatureHeader(`sha256=${digest}`)).toEqual({
      algorithm: 'sha256',
      signature: digest,
    })
  })

  it('returns undefined for malformed headers', () => {
    expect(parseWebhookSignatureHeader(undefined)).toBeUndefined()
    expect(parseWebhookSignatureHeader('')).toBeUndefined()
    expect(parseWebhookSignatureHeader('no-separator')).toBeUndefined()
    expect(parseWebhookSignatureHeader('=abc123')).toBeUndefined()
    expect(parseWebhookSignatureHeader('sha256=')).toBeUndefined()
  })

  it('rejects digests that are not strict base64', () => {
    const digest = createHmac('sha256', PRIVATE_KEY)
      .update(RAW_BODY)
      .digest('base64')

    // `Buffer.from(..., 'base64')` would silently ignore all of these.
    expect(parseWebhookSignatureHeader(`sha256=${digest}!!!`)).toBeUndefined()
    expect(
      parseWebhookSignatureHeader(`sha256=${digest} trailing`),
    ).toBeUndefined()
    expect(parseWebhookSignatureHeader('sha256=abc123')).toBeUndefined()
    expect(parseWebhookSignatureHeader('sha256=****')).toBeUndefined()
  })

  it('rejects a digest whose padding bits are not zero', () => {
    const digest = digestOf(RAW_BODY)
    const respelled = withNonZeroPaddingBits(digest)

    // Same bytes, a second spelling: `Buffer.from` drops the extra bits.
    expect(respelled).not.toBe(digest)
    expect(Buffer.from(respelled, 'base64')).toEqual(
      Buffer.from(digest, 'base64'),
    )

    expect(parseWebhookSignatureHeader(`sha256=${digest}`)).toBeTruthy()
    expect(parseWebhookSignatureHeader(`sha256=${respelled}`)).toBeUndefined()
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

  it('treats a repeated header as missing', () => {
    const headers = new Headers()
    headers.append(RESPONDENT_WEBHOOK_SIGNATURE_HEADER, 'sha256=abc')
    headers.append(RESPONDENT_WEBHOOK_SIGNATURE_HEADER, 'sha256=def')

    expect(getWebhookSignatureHeader(headers)).toBeUndefined()
    expect(
      getWebhookSignatureHeader({
        'respondent-webhook-signature': ['sha256=abc', 'sha256=def'],
      }),
    ).toBeUndefined()
    expect(
      getWebhookSignatureHeader({
        'respondent-webhook-signature': 'sha256=abc, sha256=def',
      }),
    ).toBeUndefined()
  })
})

describe('verifyWebhookSignatureFromRawBody', () => {
  it('accepts a known-good signature over the raw body', () => {
    expect(
      verifyWebhookSignatureFromRawBody({
        rawBody: RAW_BODY,
        signatureHeader: sign(RAW_BODY),
        privateKey: PRIVATE_KEY,
      }),
    ).toBe(true)
  })

  it('accepts raw bytes', () => {
    expect(
      verifyWebhookSignatureFromRawBody({
        rawBody: new TextEncoder().encode(RAW_BODY),
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
      verifyWebhookSignatureFromRawBody({
        rawBody: tampered,
        signatureHeader: signature,
        privateKey: PRIVATE_KEY,
      }),
    ).toBe(false)
  })

  it('rejects a signature made with a different key', () => {
    expect(
      verifyWebhookSignatureFromRawBody({
        rawBody: RAW_BODY,
        signatureHeader: sign(RAW_BODY, 'sha256', 'not-the-private-key'),
        privateKey: PRIVATE_KEY,
      }),
    ).toBe(false)
  })

  it('rejects a missing or malformed header', () => {
    expect(
      verifyWebhookSignatureFromRawBody({
        rawBody: RAW_BODY,
        signatureHeader: undefined,
        privateKey: PRIVATE_KEY,
      }),
    ).toBe(false)
    expect(
      verifyWebhookSignatureFromRawBody({
        rawBody: RAW_BODY,
        signatureHeader: 'nonsense',
        privateKey: PRIVATE_KEY,
      }),
    ).toBe(false)
  })

  it('rejects a valid signature with trailing junk appended', () => {
    expect(
      verifyWebhookSignatureFromRawBody({
        rawBody: RAW_BODY,
        signatureHeader: `${sign(RAW_BODY)}garbage`,
        privateKey: PRIVATE_KEY,
      }),
    ).toBe(false)
  })

  it('rejects a correct signature re-spelled with non-zero padding bits', () => {
    // A digest must have exactly one accepted spelling.
    expect(
      verifyWebhookSignatureFromRawBody({
        rawBody: RAW_BODY,
        signatureHeader: `sha256=${withNonZeroPaddingBits(digestOf(RAW_BODY))}`,
        privateKey: PRIVATE_KEY,
      }),
    ).toBe(false)
  })

  it('rejects an algorithm outside the allow list', () => {
    // The header names the algorithm, so a downgrade must not be honoured.
    expect(
      verifyWebhookSignatureFromRawBody({
        rawBody: RAW_BODY,
        signatureHeader: sign(RAW_BODY, 'md5'),
        privateKey: PRIVATE_KEY,
      }),
    ).toBe(false)
  })

  it('honours an explicitly widened allow list', () => {
    expect(
      verifyWebhookSignatureFromRawBody({
        rawBody: RAW_BODY,
        signatureHeader: sign(RAW_BODY, 'sha1'),
        privateKey: PRIVATE_KEY,
        allowedAlgorithms: ['sha1'],
      }),
    ).toBe(true)
  })

  it('rejects an empty private key', () => {
    expect(
      verifyWebhookSignatureFromRawBody({
        rawBody: RAW_BODY,
        signatureHeader: sign(RAW_BODY),
        privateKey: '',
      }),
    ).toBe(false)
  })
})

describe('verifyWebhookSignatureFromParsedBody', () => {
  it('accepts a signature over JSON.stringify(parsedBody)', () => {
    expect(
      verifyWebhookSignatureFromParsedBody({
        parsedBody: EVENT,
        signatureHeader: sign(JSON.stringify(EVENT)),
        privateKey: PRIVATE_KEY,
      }),
    ).toBe(true)
  })

  it('does not match a body whose wire bytes differ from its re-serialisation', () => {
    // The provider never states which bytes it signs, so the two helpers are
    // genuinely different checks — this is why they are separate functions.
    const spacedBody = JSON.stringify(EVENT, null, 2)
    const signature = sign(spacedBody)

    expect(
      verifyWebhookSignatureFromRawBody({
        rawBody: spacedBody,
        signatureHeader: signature,
        privateKey: PRIVATE_KEY,
      }),
    ).toBe(true)
    expect(
      verifyWebhookSignatureFromParsedBody({
        parsedBody: JSON.parse(spacedBody),
        signatureHeader: signature,
        privateKey: PRIVATE_KEY,
      }),
    ).toBe(false)
  })
})

describe('verifyAndDedupeWebhook', () => {
  /**
   * The inbox the README documents: one row per delivery, holding the whole
   * event, written and claimed in the same step.
   */
  const inbox = () => {
    const rows = new Map<
      string,
      { event: UnknownWebhookEvent; processed: boolean }
    >()
    return {
      rows,
      claimAndStore: vi.fn(
        (event: UnknownWebhookEvent): WebhookDeliveryClaim => {
          if (rows.has(event.uuid)) {
            return 'duplicate'
          }
          rows.set(event.uuid, { event, processed: false })
          return 'stored'
        },
      ),
    }
  }

  it('stores a first delivery and reports a replay of the same uuid', async () => {
    const store = inbox()
    const options = {
      rawBody: RAW_BODY,
      signatureHeader: sign(RAW_BODY),
      privateKey: PRIVATE_KEY,
      claimAndStore: store.claimAndStore,
    }

    const first = await verifyAndDedupeWebhook(options)
    expect(first).toEqual({
      status: 'stored',
      uuid: EVENT.uuid,
      event: EVENT,
    })
    expect(store.rows.get(EVENT.uuid)?.event).toEqual(EVENT)

    const replay = await verifyAndDedupeWebhook(options)
    expect(replay).toEqual({ status: 'duplicate', uuid: EVENT.uuid })
  })

  it('rejects a bad signature without touching the store', async () => {
    const store = inbox()

    expect(
      await verifyAndDedupeWebhook({
        rawBody: RAW_BODY,
        signatureHeader: sign(RAW_BODY, 'sha256', 'wrong-key'),
        privateKey: PRIVATE_KEY,
        claimAndStore: store.claimAndStore,
      }),
    ).toEqual({ status: 'invalid_signature' })
    expect(store.claimAndStore).not.toHaveBeenCalled()
  })

  it('reports a body that is signed but not a webhook event', async () => {
    const store = inbox()
    const rawBody = '{"not":"an event"}'

    const outcome = await verifyAndDedupeWebhook({
      rawBody,
      signatureHeader: sign(rawBody),
      privateKey: PRIVATE_KEY,
      claimAndStore: store.claimAndStore,
    })

    expect(outcome.status).toBe('malformed_body')
    expect(store.claimAndStore).not.toHaveBeenCalled()
  })

  it('reports invalid UTF-8 as a malformed body, without substituting', async () => {
    const store = inbox()

    const outcome = await verifyAndDedupeWebhook({
      rawBody: INVALID_UTF8_BODY,
      // Signed over the bytes, so the signature check passes and the encoding
      // is the only thing that can reject this delivery.
      signatureHeader: signBytes(INVALID_UTF8_BODY),
      privateKey: PRIVATE_KEY,
      claimAndStore: store.claimAndStore,
    })

    expect(outcome.status).toBe('malformed_body')
    if (outcome.status !== 'malformed_body') {
      throw new Error('expected a malformed body')
    }
    expect(String(outcome.cause)).toContain('UTF-8')
    // Nothing was stored, so a lenient decode cannot have slipped a repaired
    // event past the inbox.
    expect(store.claimAndStore).not.toHaveBeenCalled()
    expect(store.rows.size).toBe(0)
  })

  it('stores a valid multi-byte body unchanged', async () => {
    // The other half of the fatal decode: valid UTF-8 must still round-trip,
    // multi-byte characters included.
    const store = inbox()
    const event = {
      ...EVENT,
      payload: { resource: { note: 'café — naïve 😀' } },
    }
    const bytes = Buffer.from(JSON.stringify(event), 'utf-8')

    const outcome = await verifyAndDedupeWebhook({
      rawBody: bytes,
      signatureHeader: signBytes(bytes),
      privateKey: PRIVATE_KEY,
      claimAndStore: store.claimAndStore,
    })

    expect(outcome).toEqual({ status: 'stored', uuid: EVENT.uuid, event })
  })

  it('does not lose the work when processing the stored event throws', async () => {
    // The whole point of storing the event rather than only its uuid: the
    // delivery survives a processor that blows up. Under the documented order
    // — verify, store, answer 2xx, then process from the row — a throw leaves
    // the row pending, so the work still happens.
    const store = inbox()
    const processed: string[] = []
    let processorThrows = true

    const processStoredRow = (uuid: string) => {
      const row = store.rows.get(uuid)
      if (!row) {
        throw new Error(`nothing stored for ${uuid}`)
      }
      if (processorThrows) {
        processorThrows = false
        throw new Error('business processing failed')
      }
      row.processed = true
      processed.push(uuid)
    }

    const deliver = async () => {
      const outcome = await verifyAndDedupeWebhook({
        rawBody: RAW_BODY,
        signatureHeader: sign(RAW_BODY),
        privateKey: PRIVATE_KEY,
        claimAndStore: store.claimAndStore,
      })
      // The handler answers 2xx here, then processes from the stored row.
      if (outcome.status === 'stored') {
        try {
          processStoredRow(outcome.uuid)
        } catch {
          // Left for the inbox worker to retry.
        }
      }
      return outcome
    }

    expect((await deliver()).status).toBe('stored')
    expect(processed).toEqual([])
    expect(store.rows.get(EVENT.uuid)?.processed).toBe(false)

    // The provider redelivers. The event is already stored, so this is a
    // duplicate — and that is safe, because the work is still pending.
    expect(await deliver()).toEqual({ status: 'duplicate', uuid: EVENT.uuid })

    // Retrying from the stored row does the work, exactly once.
    processStoredRow(EVENT.uuid)
    expect(processed).toEqual([EVENT.uuid])
    expect(store.rows.get(EVENT.uuid)?.processed).toBe(true)
  })

  it('claims nothing when the atomic step throws, so the retry is not a duplicate', async () => {
    const store = inbox()
    const options = {
      rawBody: RAW_BODY,
      signatureHeader: sign(RAW_BODY),
      privateKey: PRIVATE_KEY,
    }

    await expect(
      verifyAndDedupeWebhook({
        ...options,
        claimAndStore: () => {
          throw new Error('database unavailable')
        },
      }),
    ).rejects.toThrow('database unavailable')

    // Nothing was written down, so the provider's retry is a fresh delivery.
    const retry = await verifyAndDedupeWebhook({
      ...options,
      claimAndStore: store.claimAndStore,
    })
    expect(retry).toEqual({
      status: 'stored',
      uuid: EVENT.uuid,
      event: EVENT,
    })
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
