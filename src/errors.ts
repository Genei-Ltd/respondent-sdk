export type RespondentSdkErrorOptions<TPayload = unknown> = {
  payload: TPayload
  /**
   * Absent when the failure happened before a response arrived, for example a
   * DNS or connection error.
   */
  response?: Response
  /** Absent when the request object itself could not be built. */
  request?: Request
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

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
const extractMessage = (payload: unknown, response?: Response): string => {
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

  const parts = ['Respondent request failed']
  if (response?.status) {
    parts.push(`with status ${String(response.status)}`)
  }
  if (response?.statusText) {
    parts.push(`(${response.statusText})`)
  }
  return parts.join(' ').trim()
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

/**
 * Raised for every non-2xx response returned by the Respondent Partner API.
 */
export class RespondentSdkError<TPayload = unknown> extends Error {
  /** HTTP status code, or `0` when the request never reached the server. */
  public readonly status: number
  public readonly statusText: string
  public readonly payload: TPayload
  public readonly response?: Response
  public readonly request?: Request
  public readonly code?: string
  public readonly detail?: string

  constructor(options: RespondentSdkErrorOptions<TPayload>) {
    const { payload, response, request } = options
    super(extractMessage(payload, response))
    this.name = 'RespondentSdkError'
    this.status = response?.status ?? 0
    this.statusText = response?.statusText ?? ''
    this.payload = payload
    this.response = response
    this.request = request

    const structured = extractStructuredFields(payload)
    this.code = structured.code
    this.detail = structured.detail

    Error.captureStackTrace(this, RespondentSdkError)
  }
}

export const isRespondentSdkError = (
  error: unknown,
): error is RespondentSdkError => error instanceof RespondentSdkError

export type RespondentSdkTimeoutErrorOptions = {
  timeoutMs: number
  request?: Request
}

/**
 * Raised when a request is aborted because it exceeded the configured
 * `timeoutMs`. Treat it as a retryable failure.
 */
export class RespondentSdkTimeoutError extends Error {
  public readonly timeoutMs: number
  public readonly request?: Request

  constructor({ timeoutMs, request }: RespondentSdkTimeoutErrorOptions) {
    super(
      `Respondent request aborted after exceeding timeout of ${String(timeoutMs)}ms`,
    )
    this.name = 'RespondentSdkTimeoutError'
    this.timeoutMs = timeoutMs
    this.request = request

    Error.captureStackTrace(this, RespondentSdkTimeoutError)
  }
}

export const isRespondentSdkTimeoutError = (
  error: unknown,
): error is RespondentSdkTimeoutError =>
  error instanceof RespondentSdkTimeoutError
