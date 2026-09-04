import { createHmac, timingSafeEqual } from 'node:crypto'
import * as z from 'zod/v4'

// ============================================================================
// Signature verification
// ============================================================================

/**
 * Header that carries the webhook signature, lower-cased.
 *
 * Node and most HTTP frameworks lower-case incoming header names. The provider
 * documents the header as `Respondent-Webhook-Signature`, inside a code sample
 * that reads it case-sensitively; read it case-insensitively instead.
 *
 * @see https://developers.respondent.io/docs/Webhooks/webhooks
 */
export const RESPONDENT_WEBHOOK_SIGNATURE_HEADER =
  'respondent-webhook-signature'

/**
 * Algorithms accepted by default.
 *
 * NOTE: the provider's docs do NOT state which hash algorithm they sign with.
 * Their sample parses the algorithm out of the `<algorithm>=<signature>` header
 * value and feeds it straight to `createHmac`, and they publish no example
 * header value. Because the algorithm is therefore attacker-controlled, this
 * SDK only accepts algorithms on an allow list; widen it with
 * `allowedAlgorithms` if the provider confirms another one.
 *
 * @see https://developers.respondent.io/docs/Webhooks/webhooks
 */
export const DEFAULT_ALLOWED_SIGNATURE_ALGORITHMS: readonly string[] = [
  'sha256',
  'sha512',
]

export type ParsedWebhookSignature = {
  /** Algorithm named by the header prefix, e.g. `sha256`. */
  algorithm: string
  /** Base64 digest carried by the header. */
  signature: string
}

/**
 * Split a `Respondent-Webhook-Signature` header into its algorithm prefix and
 * its base64 digest. Returns `undefined` when the header is missing or is not
 * in `<algorithm>=<signature>` form.
 */
export const parseWebhookSignatureHeader = (
  header: string | null | undefined,
): ParsedWebhookSignature | undefined => {
  if (typeof header !== 'string') {
    return undefined
  }

  const separatorIndex = header.indexOf('=')
  if (separatorIndex <= 0) {
    return undefined
  }

  const algorithm = header.slice(0, separatorIndex).trim().toLowerCase()
  const signature = header.slice(separatorIndex + 1).trim()

  if (algorithm.length === 0 || signature.length === 0) {
    return undefined
  }

  return { algorithm, signature }
}

/**
 * Read the signature header from a `Headers` instance or a plain header map,
 * ignoring case.
 */
export const getWebhookSignatureHeader = (
  headers: Headers | Record<string, string | string[] | undefined>,
): string | undefined => {
  if (headers instanceof Headers) {
    return headers.get(RESPONDENT_WEBHOOK_SIGNATURE_HEADER) ?? undefined
  }

  for (const [name, value] of Object.entries(headers)) {
    if (name.toLowerCase() !== RESPONDENT_WEBHOOK_SIGNATURE_HEADER) {
      continue
    }
    if (Array.isArray(value)) {
      return value[0]
    }
    return value
  }

  return undefined
}

export type VerifyWebhookSignatureOptions = {
  /**
   * The delivered request body.
   *
   * Prefer the raw body exactly as received (a string or the request bytes).
   * An object is accepted for convenience and is serialised with
   * `JSON.stringify`, which is what the provider's sample does — but that only
   * matches when your re-serialisation is byte-identical to theirs, so raw
   * bytes are safer.
   */
  payload: string | Uint8Array | object
  /**
   * The raw `Respondent-Webhook-Signature` header value, in
   * `<algorithm>=<base64 signature>` form.
   */
  signatureHeader: string | null | undefined
  /** The `privateKey` returned when the webhook was created. */
  privateKey: string
  /**
   * Algorithms this call will accept. Defaults to
   * {@link DEFAULT_ALLOWED_SIGNATURE_ALGORITHMS}.
   */
  allowedAlgorithms?: readonly string[]
}

const toSignedBytes = (payload: string | Uint8Array | object): Uint8Array => {
  if (typeof payload === 'string') {
    return new TextEncoder().encode(payload)
  }
  if (payload instanceof Uint8Array) {
    return payload
  }
  return new TextEncoder().encode(JSON.stringify(payload))
}

/**
 * Verify a Respondent webhook delivery.
 *
 * The provider signs the request body with HMAC, keyed by the webhook's
 * `privateKey`, and sends the base64 digest in the
 * `Respondent-Webhook-Signature` header prefixed by the algorithm name.
 *
 * The provider documents no timestamp header and no replay protection. Use the
 * `uuid` on the event body to deduplicate deliveries yourself.
 *
 * @see https://developers.respondent.io/docs/Webhooks/webhooks
 */
export const verifyWebhookSignature = ({
  payload,
  signatureHeader,
  privateKey,
  allowedAlgorithms = DEFAULT_ALLOWED_SIGNATURE_ALGORITHMS,
}: VerifyWebhookSignatureOptions): boolean => {
  const parsed = parseWebhookSignatureHeader(signatureHeader)
  if (!parsed) {
    return false
  }

  if (!allowedAlgorithms.includes(parsed.algorithm)) {
    return false
  }

  if (privateKey.length === 0) {
    return false
  }

  let expected: Buffer
  try {
    expected = createHmac(parsed.algorithm, privateKey)
      .update(toSignedBytes(payload))
      .digest()
  } catch {
    // `createHmac` throws for algorithms OpenSSL does not know.
    return false
  }

  let received: Buffer
  try {
    received = Buffer.from(parsed.signature, 'base64')
  } catch {
    return false
  }

  if (received.length !== expected.length) {
    return false
  }

  return timingSafeEqual(received, expected)
}

// ============================================================================
// Event payloads
// ============================================================================

/**
 * A single field change reported by an event.
 */
export type WebhookUpdatedField = z.infer<typeof WebhookUpdatedField>
export const WebhookUpdatedField = z.looseObject({
  /** Name of the field that changed. */
  name: z.string(),
  /** Value before the change. */
  oldValue: z.unknown(),
  /** Value after the change. */
  newValue: z.unknown(),
})

/**
 * Emitted when the `recruitingStatus` of a project changes.
 */
export type ProjectsUpdatedEvent = z.infer<typeof ProjectsUpdatedEvent>
export const ProjectsUpdatedEvent = z.looseObject({
  event: z.literal('PROJECTS.UPDATED'),
  /** Delivery identifier — use it to deduplicate retries. */
  uuid: z.string(),
  /** ISO timestamp of the event. */
  created: z.string(),
  payload: z.looseObject({
    resource: z.looseObject({
      /** Project id. */
      id: z.string(),
      type: z.string(),
      updatedFields: z.array(WebhookUpdatedField),
    }),
  }),
})

/**
 * Emitted when a participant submits a screener response. The payload carries
 * IDs only; fetch the response with
 * `GET /v1/projects/{projectId}/screener-responses/{screenerResponseId}`.
 */
export type ScreenerResponsesCreatedEvent = z.infer<
  typeof ScreenerResponsesCreatedEvent
>
export const ScreenerResponsesCreatedEvent = z.looseObject({
  event: z.literal('SCREENER_RESPONSES.CREATED'),
  uuid: z.string(),
  created: z.string(),
  payload: z.looseObject({
    resource: z.looseObject({
      /** Screener response id. */
      id: z.string(),
      /** Project the response belongs to. */
      projectId: z.string(),
      type: z.string(),
      /** @deprecated Use `projectId`. Removed in February 2027. */
      parentId: z.string().optional(),
    }),
  }),
})

/**
 * Emitted when a participant changes a screener response — status moves to
 * `PAID` or `CANCELLED`, or the response is rejected or made visible again.
 */
export type ScreenerResponsesUpdatedEvent = z.infer<
  typeof ScreenerResponsesUpdatedEvent
>
export const ScreenerResponsesUpdatedEvent = z.looseObject({
  event: z.literal('SCREENER_RESPONSES.UPDATED'),
  uuid: z.string(),
  created: z.string(),
  payload: z.looseObject({
    resource: z.looseObject({
      /** Screener response id. */
      id: z.string(),
      /** Project the response belongs to. */
      projectId: z.string(),
      type: z.string(),
      updatedFields: z.array(WebhookUpdatedField),
      /** @deprecated Use `projectId`. Removed in February 2027. */
      parentId: z.string().optional(),
    }),
  }),
})

/**
 * An attachment carried by a participant message.
 */
export type WebhookMessageAttachment = z.infer<typeof WebhookMessageAttachment>
export const WebhookMessageAttachment = z.looseObject({
  uid: z.string(),
  url: z.string(),
  contentType: z.string(),
})

/**
 * Emitted when a participant sends a message. Researcher-sent messages do not
 * produce events.
 */
export type MessagesCreatedEvent = z.infer<typeof MessagesCreatedEvent>
export const MessagesCreatedEvent = z.looseObject({
  event: z.literal('MESSAGES.CREATED'),
  uuid: z.string(),
  created: z.string(),
  payload: z.looseObject({
    resource: z.looseObject({
      messageId: z.string(),
      messageBody: z.string(),
      attachments: z.array(WebhookMessageAttachment).optional(),
      projectId: z.string().optional(),
      conversationId: z.string(),
      senderType: z.string(),
      profileId: z.string().optional(),
      organizationId: z.string().optional(),
      teamId: z.string().optional(),
      webhookId: z.string().optional(),
      createdAt: z.string().optional(),
      updatedAt: z.string().optional(),
    }),
  }),
})

/**
 * A messaging user, as embedded in a conversation payload.
 */
export type WebhookConversationUser = z.infer<typeof WebhookConversationUser>
export const WebhookConversationUser = z.looseObject({
  uid: z.string(),
  foreignId: z.string().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
})

/**
 * A conversation participant.
 */
export type WebhookConversationParticipant = z.infer<
  typeof WebhookConversationParticipant
>
export const WebhookConversationParticipant = z.looseObject({
  uid: z.string(),
  foreignId: z.string().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  read: z.boolean().optional(),
  deleted: z.boolean().optional(),
})

/**
 * Emitted when a new conversation is created with a participant.
 */
export type ConversationsCreatedEvent = z.infer<
  typeof ConversationsCreatedEvent
>
export const ConversationsCreatedEvent = z.looseObject({
  event: z.literal('CONVERSATIONS.CREATED'),
  uuid: z.string(),
  created: z.string(),
  payload: z.looseObject({
    resource: z.looseObject({
      conversation: z.looseObject({
        uid: z.string(),
        name: z.string().optional(),
        deleted: z.boolean().optional(),
        locked: z.boolean().optional(),
        read: z.boolean().optional(),
        createdAt: z.string().optional(),
        updatedAt: z.string().optional(),
        metadata: z
          .looseObject({
            projectId: z.string().optional(),
            researcherUserId: z.string().optional(),
            externalResearcherId: z.string().optional(),
          })
          .optional(),
        user: WebhookConversationUser.optional(),
        participants: z.array(WebhookConversationParticipant).optional(),
      }),
      organizationId: z.string().optional(),
      teamId: z.string().optional(),
      webhookId: z.string().optional(),
    }),
  }),
})

// ============================================================================
// Union type for all events
// ============================================================================

/**
 * Every webhook event the Partner API can deliver.
 */
export type WebhookEvent = z.infer<typeof WebhookEvent>
export const WebhookEvent = z.discriminatedUnion('event', [
  ProjectsUpdatedEvent,
  ScreenerResponsesCreatedEvent,
  ScreenerResponsesUpdatedEvent,
  MessagesCreatedEvent,
  ConversationsCreatedEvent,
])

/**
 * Fallback shape for event types this SDK does not know about yet.
 */
export type UnknownWebhookEvent = z.infer<typeof UnknownWebhookEvent>
export const UnknownWebhookEvent = z.looseObject({
  event: z.string(),
  uuid: z.string(),
  created: z.string(),
  payload: z.unknown(),
})
