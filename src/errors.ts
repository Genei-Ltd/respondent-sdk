/**
 * Placeholder written over credential-bearing header values.
 */
export const REDACTED_HEADER_VALUE = '[redacted]'

/**
 * The two values that must never appear on an error.
 */
export type RespondentCredentials = {
  apiKey: string
  apiSecret: string
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

const replaceCredential = (value: string, credential: string): string =>
  credential.length === 0
    ? value
    : value.split(credential).join(REDACTED_HEADER_VALUE)

/**
 * Server-controlled text with both credentials replaced by `[redacted]`: a
 * plain string replace of the exact API key and the exact API secret. Nothing
 * between this process and the Partner API is under our control, and a gateway
 * that reflects either credential back would otherwise put it on an ordinary,
 * loggable error.
 */
export const redactCredentials = (
  value: string,
  { apiKey, apiSecret }: RespondentCredentials,
): string => {
  // Longest first: if one credential contains the other, replacing the shorter
  // one first would leave a fragment of the longer one behind.
  const [first, second] =
    apiKey.length >= apiSecret.length
      ? [apiKey, apiSecret]
      : [apiSecret, apiKey]
  return replaceCredential(replaceCredential(value, first), second)
}

/**
 * The decoded error body with both credentials replaced, scrubbed as JSON text
 * and parsed back. A payload that cannot round-trip through JSON is dropped.
 */
export const redactPayload = (
  payload: unknown,
  credentials: RespondentCredentials,
): unknown => {
  if (payload === undefined) {
    return undefined
  }
  try {
    const scrubbed: unknown = JSON.parse(
      redactCredentials(JSON.stringify(payload), credentials),
    )
    return scrubbed
  } catch {
    return undefined
  }
}

/**
 * Header names whose values never appear on an error. `x-api-key` and
 * `x-api-secret` are the Partner API credentials; the rest are here so a proxy
 * or a future auth scheme cannot leak through this path either.
 */
const REDACTED_HEADER_NAMES: readonly string[] = [
  'x-api-key',
  'x-api-secret',
  'authorization',
  'proxy-authorization',
  'cookie',
  'set-cookie',
]

/**
 * What an error says about the request that produced it.
 *
 * This is deliberately not the `Request` object: a `Request` carries the API
 * credentials in its headers, so logging one — or serialising an error that
 * holds one — would print them. Errors do not carry the `Response` either: its
 * headers are written by the server, names as well as values, so an allow-list
 * of names with the values scrubbed is the only form of them that is safe to
 * keep.
 */
export type RespondentRequestSummary = {
  /** Absolute request URL, including the query string. */
  url: string
  /** Uppercase HTTP method. */
  method: string
  /** Request headers, with every credential-bearing value redacted. */
  headers: Record<string, string>
}

/**
 * Build a loggable summary of a request, redacting credentials.
 */
export const summarizeRequest = (
  request: Request | undefined,
): RespondentRequestSummary | undefined => {
  if (!request) {
    return undefined
  }

  const headers: Record<string, string> = {}
  request.headers.forEach((value, name) => {
    headers[name] = REDACTED_HEADER_NAMES.includes(name.toLowerCase())
      ? REDACTED_HEADER_VALUE
      : value
  })

  return { url: request.url, method: request.method, headers }
}

/**
 * Response header names whose value may be reproduced on an error: backoff,
 * rate limits, body framing, the server date and request identifiers. A
 * response header is server-controlled in its name as well as its value, so a
 * name outside this list is dropped along with its value, and a value that is
 * kept is passed through {@link redactCredentials} first.
 */
const REPRODUCIBLE_RESPONSE_HEADER_NAMES: readonly string[] = [
  'retry-after',
  'ratelimit',
  'ratelimit-limit',
  'ratelimit-policy',
  'ratelimit-remaining',
  'ratelimit-reset',
  'x-ratelimit-limit',
  'x-ratelimit-remaining',
  'x-ratelimit-reset',
  'content-type',
  'date',
  'correlation-id',
  'request-id',
  'traceparent',
  'x-correlation-id',
  'x-request-id',
  'x-trace-id',
]

/**
 * Response headers, reduced to the allow-listed names with their values
 * scrubbed. Every other header — name included — is dropped.
 */
export const summarizeResponseHeaders = (
  response: Response,
  credentials: RespondentCredentials,
): Record<string, string> => {
  const summarized: Record<string, string> = {}
  response.headers.forEach((value, name) => {
    const lowercased = name.toLowerCase()
    if (REPRODUCIBLE_RESPONSE_HEADER_NAMES.includes(lowercased)) {
      summarized[lowercased] = redactCredentials(value, credentials)
    }
  })
  return summarized
}

const toNonEmptyString = (value: unknown): string | undefined => {
  if (typeof value !== 'string') {
    return undefined
  }
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : undefined
}

/**
 * The Partner API does not document an error response schema, and the OpenAPI
 * document declares no error bodies. The only field named anywhere in the docs
 * is `error` (see the 402 on "Trigger manual payout"), so we probe the common
 * field names and fall back to the HTTP status line.
 *
 * @see https://developers.respondent.io/screener-responses/trigger-manual-payout
 */
const extractMessage = (
  payload: unknown,
  status: number,
  statusText: string,
): string => {
  const stringPayload = toNonEmptyString(payload)
  if (stringPayload) {
    return stringPayload
  }

  if (isRecord(payload)) {
    for (const key of ['error', 'message', 'detail']) {
      const candidate = toNonEmptyString(payload[key])
      if (candidate) {
        return candidate
      }
    }
  }

  const parts = ['Respondent request failed', `with status ${String(status)}`]
  if (statusText) {
    parts.push(`(${statusText})`)
  }
  return parts.join(' ')
}

type StructuredFields = {
  code?: string
  detail?: string
}

const extractStructuredFields = (payload: unknown): StructuredFields => {
  if (!isRecord(payload)) {
    return {}
  }

  const fields: StructuredFields = {}

  const code = toNonEmptyString(payload.code) ?? toNonEmptyString(payload.error)
  if (code) {
    fields.code = code
  }

  const detail =
    toNonEmptyString(payload.detail) ?? toNonEmptyString(payload.message)
  if (detail) {
    fields.detail = detail
  }

  return fields
}

export type RespondentSdkErrorOptions = {
  /** The request that failed, already redacted. */
  request?: RespondentRequestSummary
  /** The underlying error, when one exists. */
  cause?: unknown
}

/**
 * Base class for every error this SDK raises. Catch it to handle any Respondent
 * failure; narrow to a subclass to tell the failure modes apart.
 *
 * - {@link RespondentSdkApiError} — the API answered with a non-2xx status.
 * - {@link RespondentSdkTransportError} — the request never produced a
 *   response (DNS failure, connection reset, refused redirect).
 * - {@link RespondentSdkResponseError} — a successful response whose body could
 *   not be decoded.
 * - {@link RespondentSdkTimeoutError} — the configured `timeoutMs` elapsed.
 */
export abstract class RespondentSdkError extends Error {
  /**
   * The failed request, with credential headers redacted. Absent when the
   * failure happened before a request object existed.
   */
  public readonly request?: RespondentRequestSummary

  constructor(message: string, options: RespondentSdkErrorOptions = {}) {
    super(message, 'cause' in options ? { cause: options.cause } : undefined)
    this.name = 'RespondentSdkError'
    if (options.request) {
      this.request = options.request
    }
  }
}

export const isRespondentSdkError = (
  error: unknown,
): error is RespondentSdkError => error instanceof RespondentSdkError

export type RespondentSdkApiErrorOptions<TPayload = unknown> =
  RespondentSdkErrorOptions & {
    /**
     * The decoded error body, or the raw text when it was not JSON, already
     * scrubbed of the credentials.
     */
    payload: TPayload
    /** HTTP status code the API answered with. */
    status: number
    /** HTTP status text, already scrubbed of the credentials. */
    statusText: string
    /**
     * Response headers, reduced to the allow-listed names with their values
     * scrubbed. See {@link summarizeResponseHeaders}.
     */
    responseHeaders: Record<string, string>
  }

/**
 * Raised when the Partner API answers with a non-2xx status.
 */
export class RespondentSdkApiError<
  TPayload = unknown,
> extends RespondentSdkError {
  /** HTTP status code. */
  public readonly status: number
  public readonly statusText: string
  /** The decoded error body, or the raw text when it was not JSON. */
  public readonly payload: TPayload
  /** Response headers, reduced to the allow-listed names. */
  public readonly responseHeaders: Record<string, string>
  public readonly code?: string
  public readonly detail?: string

  constructor(options: RespondentSdkApiErrorOptions<TPayload>) {
    const { payload, status, statusText, responseHeaders } = options
    super(extractMessage(payload, status, statusText), options)
    this.name = 'RespondentSdkApiError'
    this.status = status
    this.statusText = statusText
    this.payload = payload
    this.responseHeaders = responseHeaders

    const structured = extractStructuredFields(payload)
    this.code = structured.code
    this.detail = structured.detail

    Error.captureStackTrace(this, RespondentSdkApiError)
  }
}

export const isRespondentSdkApiError = (
  error: unknown,
): error is RespondentSdkApiError => error instanceof RespondentSdkApiError

/**
 * Raised when the request never produced a response: DNS failure, connection
 * reset, TLS failure, or a redirect the SDK refuses to follow. The underlying
 * error is on `cause`.
 *
 * The SDK sets `redirect: 'error'` because Node forwards `x-api-key` and
 * `x-api-secret` across an origin-changing redirect, which would hand the
 * credentials to whatever host the redirect names.
 */
export class RespondentSdkTransportError extends RespondentSdkError {
  constructor(options: RespondentSdkErrorOptions = {}) {
    const detail =
      options.cause instanceof Error ? `: ${options.cause.message}` : ''
    super(
      `Respondent request failed before a response arrived${detail}`,
      options,
    )
    this.name = 'RespondentSdkTransportError'
    Error.captureStackTrace(this, RespondentSdkTransportError)
  }
}

export const isRespondentSdkTransportError = (
  error: unknown,
): error is RespondentSdkTransportError =>
  error instanceof RespondentSdkTransportError

export type RespondentSdkResponseErrorOptions = RespondentSdkErrorOptions & {
  /** Status of the successful response whose body could not be decoded. */
  status: number
  /** HTTP status text, already scrubbed of the credentials. */
  statusText: string
  /**
   * Response headers, reduced to the allow-listed names with their values
   * scrubbed. `content-type` is on that list, and it is usually what explains
   * the decoding failure.
   */
  responseHeaders: Record<string, string>
}

/**
 * Raised when the API answers with a success status but the body cannot be
 * decoded — for example invalid JSON returned with HTTP 200. The underlying
 * `SyntaxError` is on `cause`.
 */
export class RespondentSdkResponseError extends RespondentSdkError {
  /** HTTP status code of the undecodable response. */
  public readonly status: number
  /** HTTP status text of the undecodable response. */
  public readonly statusText: string
  /** Response headers, reduced to the allow-listed names. */
  public readonly responseHeaders: Record<string, string>

  constructor(options: RespondentSdkResponseErrorOptions) {
    super(
      `Respondent returned a ${String(options.status)} response whose body could not be decoded`,
      options,
    )
    this.name = 'RespondentSdkResponseError'
    this.status = options.status
    this.statusText = options.statusText
    this.responseHeaders = options.responseHeaders
    Error.captureStackTrace(this, RespondentSdkResponseError)
  }
}

export const isRespondentSdkResponseError = (
  error: unknown,
): error is RespondentSdkResponseError =>
  error instanceof RespondentSdkResponseError

export type RespondentSdkTimeoutErrorOptions = RespondentSdkErrorOptions & {
  timeoutMs: number
}

/**
 * Raised when a request is aborted because it exceeded the configured
 * `timeoutMs`. The deadline covers reading the response body, not just the
 * response headers. Treat it as a retryable failure.
 */
export class RespondentSdkTimeoutError extends RespondentSdkError {
  public readonly timeoutMs: number

  constructor(options: RespondentSdkTimeoutErrorOptions) {
    super(
      `Respondent request aborted after exceeding timeout of ${String(options.timeoutMs)}ms`,
      options,
    )
    this.name = 'RespondentSdkTimeoutError'
    this.timeoutMs = options.timeoutMs
    Error.captureStackTrace(this, RespondentSdkTimeoutError)
  }
}

export const isRespondentSdkTimeoutError = (
  error: unknown,
): error is RespondentSdkTimeoutError =>
  error instanceof RespondentSdkTimeoutError
