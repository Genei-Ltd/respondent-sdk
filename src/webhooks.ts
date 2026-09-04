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
 * Standard base64, padded. `Buffer.from(value, 'base64')` ignores characters
 * outside the alphabet and stops at the first `=`, so it happily decodes
 * `<valid signature>garbage` to the valid signature. Reject anything that is
 * not exactly one padded base64 string before decoding.
 */
const BASE64_PATTERN =
  /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/

/**
 * Decode padded standard base64, and only its canonical spelling.
 *
 * The pattern alone still admits several spellings of one digest: the final
 * character of a padded group carries bits that fall outside the decoded bytes,
 * and `Buffer.from` discards them, so `QR==` and `QQ==` both decode to `A`.
 * Re-encoding and comparing rejects every spelling but the canonical one, so a
 * signature has exactly one accepted form.
 */
const decodeStrictBase64 = (value: string): Buffer | undefined => {
  if (value.length === 0 || !BASE64_PATTERN.test(value)) {
    return undefined
  }
  const decoded = Buffer.from(value, 'base64')
  return decoded.toString('base64') === value ? decoded : undefined
}

/**
 * Split a `Respondent-Webhook-Signature` header into its algorithm prefix and
 * its base64 digest.
 *
 * Returns `undefined` when the header is missing, is not in
 * `<algorithm>=<signature>` form, or carries a digest that is not strict
 * padded base64.
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

  if (algorithm.length === 0 || !decodeStrictBase64(signature)) {
    return undefined
  }

  return { algorithm, signature }
}

const readSignatureHeaderValues = (
  headers: Headers | Record<string, string | string[] | undefined>,
): string[] => {
  if (headers instanceof Headers) {
    const raw = headers.get(RESPONDENT_WEBHOOK_SIGNATURE_HEADER)
    // `Headers.get` joins repeated values with `, `. Neither an algorithm name
    // nor a base64 digest can contain a comma, so splitting on it is enough to
    // notice that the delivery carried more than one signature header.
    return raw === null ? [] : raw.split(',')
  }

  const values: string[] = []
  for (const [name, value] of Object.entries(headers)) {
    if (name.toLowerCase() !== RESPONDENT_WEBHOOK_SIGNATURE_HEADER) {
      continue
    }
    if (Array.isArray(value)) {
      values.push(...value)
    } else if (value !== undefined) {
      values.push(...value.split(','))
    }
  }
  return values
}

/**
 * Read the signature header from a `Headers` instance or a plain header map,
 * ignoring case.
 *
 * A delivery must carry exactly one signature header. A repeated header would
 * let an attacker present their own value alongside the real one and hope the
 * wrong one is checked, so a repeated header reads as missing.
 */
export const getWebhookSignatureHeader = (
  headers: Headers | Record<string, string | string[] | undefined>,
): string | undefined => {
  const values = readSignatureHeaderValues(headers)
  return values.length === 1 ? values[0] : undefined
}

export type VerifyWebhookSignatureOptions = {
  /**
   * The raw `Respondent-Webhook-Signature` header value, in
   * `<algorithm>=<base64 signature>` form.
   */
  signatureHeader: string | null | undefined
  /**
   * The webhook's `privateKey`. It is returned when the webhook is created, and
   * again by `GET /v1/webhooks` and `GET /v1/webhooks/{webhookId}`, so a lost
   * key can be read back rather than re-created.
   */
  privateKey: string
  /**
   * Algorithms this call will accept. Defaults to
   * {@link DEFAULT_ALLOWED_SIGNATURE_ALGORITHMS}.
   */
  allowedAlgorithms?: readonly string[]
}

const verifyBytes = (
  signed: Uint8Array,
  {
    signatureHeader,
    privateKey,
    allowedAlgorithms,
  }: VerifyWebhookSignatureOptions,
): boolean => {
  const parsed = parseWebhookSignatureHeader(signatureHeader)
  if (!parsed) {
    return false
  }

  const allowed = allowedAlgorithms ?? DEFAULT_ALLOWED_SIGNATURE_ALGORITHMS
  if (!allowed.includes(parsed.algorithm)) {
    return false
  }

  if (privateKey.length === 0) {
    return false
  }

  const received = decodeStrictBase64(parsed.signature)
  if (!received) {
    return false
  }

  let expected: Buffer
  try {
    expected = createHmac(parsed.algorithm, privateKey).update(signed).digest()
  } catch {
    // `createHmac` throws for algorithms OpenSSL does not know.
    return false
  }

  if (received.length !== expected.length) {
    return false
  }

  return timingSafeEqual(received, expected)
}

export type VerifyWebhookSignatureFromRawBodyOptions =
  VerifyWebhookSignatureOptions & {
    /**
     * The delivered body exactly as it arrived on the wire, before any JSON
     * parsing — `new Uint8Array(await request.arrayBuffer())`.
     *
     * Prefer the bytes over `await request.text()`: `text()` decodes
     * leniently, so it has already replaced any invalid UTF-8 sequence with
     * U+FFFD by the time this SDK sees the body, and invalid UTF-8 can only be
     * detected from the bytes.
     */
    rawBody: string | Uint8Array
  }

/**
 * Verify a Respondent webhook delivery against the bytes that were actually
 * delivered.
 *
 * **Which bytes the provider signs is not documented.** Their only sample
 * hashes `JSON.stringify(request.body)` — a parsed and re-serialised object —
 * and they publish no example header, no algorithm and no reference delivery.
 * Re-serialising is not guaranteed to reproduce the wire bytes, so this SDK
 * offers both readings and does not claim either is correct:
 *
 * - this function hashes the wire bytes;
 * - {@link verifyWebhookSignatureFromParsedBody} hashes
 *   `JSON.stringify(parsedBody)`, matching the provider's sample.
 *
 * Start here, and settle the question with a real delivery (send one from the
 * dashboard, or call `respondent.webhooks.simulate`) before you rely on it.
 *
 * The provider documents no timestamp header and no replay protection, so
 * authenticity is all this proves. Use {@link verifyAndDedupeWebhook}, or
 * deduplicate on the event `uuid` yourself.
 *
 * @see https://developers.respondent.io/docs/Webhooks/webhooks
 */
export const verifyWebhookSignatureFromRawBody = ({
  rawBody,
  ...options
}: VerifyWebhookSignatureFromRawBodyOptions): boolean =>
  verifyBytes(
    typeof rawBody === 'string' ? new TextEncoder().encode(rawBody) : rawBody,
    options,
  )

export type VerifyWebhookSignatureFromParsedBodyOptions =
  VerifyWebhookSignatureOptions & {
    /** The delivery body after `JSON.parse`. */
    parsedBody: unknown
  }

/**
 * Verify a Respondent webhook delivery the way the provider's sample does, by
 * hashing `JSON.stringify(parsedBody)`.
 *
 * This only matches when your re-serialisation reproduces the exact bytes the
 * provider hashed: key order survives `JSON.parse` / `JSON.stringify`, but
 * whitespace, escaping and number formatting do not have to. Prefer
 * {@link verifyWebhookSignatureFromRawBody} unless a real delivery shows this
 * form is the one that verifies.
 *
 * @see https://developers.respondent.io/docs/Webhooks/webhooks
 */
export const verifyWebhookSignatureFromParsedBody = ({
  parsedBody,
  ...options
}: VerifyWebhookSignatureFromParsedBodyOptions): boolean => {
  const serialized = JSON.stringify(parsedBody)
  if (typeof serialized !== 'string') {
    return false
  }
  return verifyBytes(new TextEncoder().encode(serialized), options)
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

// ============================================================================
// Replay-safe delivery handling
// ============================================================================

/**
 * What the caller's atomic step did with a delivery.
 *
 * - `stored` — this call durably persisted the event and claimed its `uuid`.
 * - `duplicate` — the `uuid` was already claimed, so the event is already
 *   stored and must not be stored twice.
 */
export type WebhookDeliveryClaim = 'stored' | 'duplicate'

/**
 * Durably store a delivery and claim its `uuid`, in ONE atomic step.
 *
 * Writing the event down and claiming the `uuid` must commit together — a
 * unique index on `uuid` plus an "insert, ignore conflict" statement that
 * writes the whole event, or an enqueue and the claim inside one transaction.
 * Two things go wrong otherwise:
 *
 * - claim and store as separate steps, and a crash between them loses the
 *   delivery: the `uuid` is claimed, so every retry reads as a duplicate, and
 *   the event was never written down;
 * - check and claim as separate steps, and two concurrent copies of the same
 *   replay both look new.
 *
 * **Claiming the `uuid` is not "processed".** It records only that the event is
 * safely written down. Inserting the `uuid` on its own is not enough: store the
 * event with it. Do the business work afterwards, reading it back from the
 * stored row and retrying from there. If that work throws, the row is still
 * there to retry, so the delivery is not lost even though the provider's next
 * redelivery is correctly reported a duplicate.
 *
 * ```ts
 * const claimAndStore = async (event: UnknownWebhookEvent) => {
 *   const inserted = await db
 *     .insertInto('respondent_webhook_inbox')
 *     .values({ uuid: event.uuid, payload: JSON.stringify(event) })
 *     .onConflict((c) => c.column('uuid').doNothing())
 *     .executeTakeFirst()
 *   return inserted.numInsertedOrUpdatedRows === 1n ? 'stored' : 'duplicate'
 * }
 * ```
 */
export type WebhookDeliveryStore = (
  event: UnknownWebhookEvent,
) => WebhookDeliveryClaim | Promise<WebhookDeliveryClaim>

/**
 * What {@link verifyAndDedupeWebhook} decided about a delivery.
 */
export type WebhookDeliveryOutcome =
  | {
      /**
       * Signature verified, body parsed, and `claimAndStore` reported that it
       * stored this event. It is written down, not processed.
       */
      status: 'stored'
      uuid: string
      /**
       * The delivery body, exactly as it was handed to `claimAndStore`. Narrow
       * it to a known event with `WebhookEvent.safeParse(outcome.event)`.
       */
      event: UnknownWebhookEvent
    }
  | { status: 'invalid_signature' }
  | {
      /**
       * The signature verified, but the body is not an event this SDK can
       * read: not valid UTF-8, not valid JSON, or not a webhook event shape.
       */
      status: 'malformed_body'
      cause: unknown
    }
  | {
      /** The signature was valid but this `uuid` was already stored. */
      status: 'duplicate'
      uuid: string
    }

/**
 * `fatal`, so an invalid sequence throws instead of becoming U+FFFD.
 *
 * The lenient decoder substitutes the replacement character, `JSON.parse` then
 * accepts the repaired text, and the event handed to `claimAndStore` is one the
 * provider never sent. A delivery whose signature verifies is valid UTF-8, so
 * anything else is a corrupted body.
 */
const UTF8_DECODER = new TextDecoder('utf-8', { fatal: true })

const decodeRawBody = (rawBody: string | Uint8Array): string => {
  if (typeof rawBody === 'string') {
    return rawBody
  }
  try {
    return UTF8_DECODER.decode(rawBody)
  } catch {
    // Caught by the `JSON.parse` guard in `verifyAndDedupeWebhook`, which
    // reports it as `malformed_body` with this error as the cause.
    throw new TypeError(
      'Webhook body is not valid UTF-8, so it cannot be the JSON that was signed',
    )
  }
}

export type VerifyAndDedupeWebhookOptions =
  VerifyWebhookSignatureFromRawBodyOptions & {
    /**
     * Atomically store the event and claim its `uuid`; see
     * {@link WebhookDeliveryStore}.
     */
    claimAndStore: WebhookDeliveryStore
  }

/**
 * Verify a delivery, parse it, hand it to your store, and reject replays.
 *
 * HMAC proves the delivery came from someone holding the `privateKey`; it does
 * not prove the delivery is fresh. The provider sends no timestamp header, and
 * retries up to five times, so a captured delivery stays valid forever unless
 * you record what you have already taken in.
 *
 * The handler this is built for has four steps, in this order:
 *
 * 1. verify the raw bytes;
 * 2. store the event and claim its `uuid` atomically — that is
 *    `claimAndStore`;
 * 3. answer 2xx;
 * 4. process the work from the stored row, with its own retries, and mark that
 *    row processed when it succeeds.
 *
 * Doing the business work before answering, or instead of storing, is what this
 * function is designed to stop. A `uuid` claimed for work that then throws is a
 * delivery the provider will retry and you will discard.
 *
 * An error thrown by `claimAndStore` propagates out of this call: nothing was
 * claimed and nothing was stored, so answer non-2xx and let the provider retry.
 *
 * Verification uses the raw wire bytes; see
 * {@link verifyWebhookSignatureFromRawBody} for why that choice is not settled.
 */
export const verifyAndDedupeWebhook = async ({
  claimAndStore,
  ...options
}: VerifyAndDedupeWebhookOptions): Promise<WebhookDeliveryOutcome> => {
  if (!verifyWebhookSignatureFromRawBody(options)) {
    return { status: 'invalid_signature' }
  }

  // Decoding is inside the guard: a body that is not valid UTF-8 is a malformed
  // body, exactly like one that is not valid JSON.
  let body: unknown
  try {
    body = JSON.parse(decodeRawBody(options.rawBody))
  } catch (cause: unknown) {
    return { status: 'malformed_body', cause }
  }

  const parsed = UnknownWebhookEvent.safeParse(body)
  if (!parsed.success) {
    return { status: 'malformed_body', cause: parsed.error }
  }

  const { uuid } = parsed.data
  if ((await claimAndStore(parsed.data)) === 'duplicate') {
    return { status: 'duplicate', uuid }
  }

  return { status: 'stored', uuid, event: parsed.data }
}
