import { inspect } from 'node:util'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  RESPONDENT_PRODUCTION_BASE_URL,
  RESPONDENT_STAGING_BASE_URL,
  RespondentSdk,
  RespondentSdkApiError,
  RespondentSdkResponseError,
  RespondentSdkTransportError,
  isRespondentSdkApiError,
  isRespondentSdkError,
} from '../src/index'

const API_KEY = 'client-id-84f2'
const API_SECRET = 'client-secret-9d31'

const jsonResponse = (body: unknown, init?: ResponseInit) =>
  new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
    ...init,
  })

const stubFetch = (
  handler: (request: Request) => Response | Promise<Response>,
) => {
  const calls: Request[] = []
  const mock = vi.fn(async (request: Request) => {
    calls.push(request)
    return handler(request)
  })
  vi.stubGlobal('fetch', mock)
  return calls
}

const createSdk = (overrides?: { baseUrl?: string }) =>
  new RespondentSdk({
    apiKey: API_KEY,
    apiSecret: API_SECRET,
    ...overrides,
  })

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('RespondentSdk construction', () => {
  it('defaults to the production base URL', async () => {
    const calls = stubFetch(() => jsonResponse({ page: 1, results: [] }))

    await createSdk().projects.list()

    expect(calls[0]?.url).toBe(`${RESPONDENT_PRODUCTION_BASE_URL}/v1/projects`)
  })

  it('targets staging when the staging base URL is supplied', async () => {
    const calls = stubFetch(() => jsonResponse({ page: 1, results: [] }))

    await createSdk({ baseUrl: RESPONDENT_STAGING_BASE_URL }).projects.list()

    expect(calls[0]?.url).toBe(`${RESPONDENT_STAGING_BASE_URL}/v1/projects`)
  })

  it('rejects a non-positive timeout', () => {
    expect(
      () =>
        new RespondentSdk({
          apiKey: API_KEY,
          apiSecret: API_SECRET,
          timeoutMs: 0,
        }),
    ).toThrow('RespondentSdk timeoutMs must be a positive number')
  })
})

describe('authentication headers', () => {
  it('sends x-api-key and x-api-secret on every request', async () => {
    const calls = stubFetch(() => jsonResponse({ page: 1, results: [] }))

    const sdk = createSdk()
    await sdk.projects.list()
    await sdk.pricing.balanceSummary()

    expect(calls).toHaveLength(2)
    for (const request of calls) {
      expect(request.headers.get('x-api-key')).toBe(API_KEY)
      expect(request.headers.get('x-api-secret')).toBe(API_SECRET)
    }
  })
})

describe('credential exposure', () => {
  const containsCredentials = (value: string) =>
    value.includes(API_KEY) || value.includes(API_SECRET)

  it('keeps credentials out of the SDK instance and its modules', () => {
    const sdk = createSdk()

    expect(containsCredentials(JSON.stringify(sdk))).toBe(false)
    expect(containsCredentials(inspect(sdk, { depth: null }))).toBe(false)
    expect(
      containsCredentials(inspect(sdk, { depth: null, showHidden: true })),
    ).toBe(false)
    expect(containsCredentials(JSON.stringify(sdk.projects))).toBe(false)
    expect(containsCredentials(inspect(sdk.messaging, { depth: null }))).toBe(
      false,
    )
    expect(Object.keys(sdk.projects)).toEqual([])
  })

  it('keeps credentials out of thrown errors', async () => {
    stubFetch(() =>
      jsonResponse({ error: 'Nope' }, { status: 403, statusText: 'Forbidden' }),
    )

    const error: unknown = await createSdk()
      .projects.retrieve('project-1')
      .catch((caught: unknown) => caught)

    if (!(error instanceof RespondentSdkApiError)) {
      throw new Error('expected a RespondentSdkApiError')
    }

    expect(containsCredentials(JSON.stringify(error))).toBe(false)
    expect(containsCredentials(inspect(error, { depth: null }))).toBe(false)
    expect(containsCredentials(String(error.stack))).toBe(false)
  })

  it('reports a redacted request summary', async () => {
    stubFetch(() => jsonResponse({ error: 'Nope' }, { status: 403 }))

    const error: unknown = await createSdk()
      .projects.retrieve('project-1')
      .catch((caught: unknown) => caught)

    if (!(error instanceof RespondentSdkApiError)) {
      throw new Error('expected a RespondentSdkApiError')
    }

    expect(error.request?.method).toBe('GET')
    expect(error.request?.url).toBe(
      `${RESPONDENT_PRODUCTION_BASE_URL}/v1/projects/project-1`,
    )
    expect(error.request?.headers['x-api-key']).toBe('[redacted]')
    expect(error.request?.headers['x-api-secret']).toBe('[redacted]')
  })
})

describe('error handling', () => {
  it('raises RespondentSdkApiError for non-2xx responses', async () => {
    stubFetch(() =>
      jsonResponse(
        { error: 'Project has unpaid participants and cannot be closed' },
        { status: 400, statusText: 'Bad Request' },
      ),
    )

    const error: unknown = await createSdk()
      .projects.close('project-1', { message: 'Wrapping up' })
      .catch((caught: unknown) => caught)

    expect(isRespondentSdkApiError(error)).toBe(true)
    expect(isRespondentSdkError(error)).toBe(true)
    if (!(error instanceof RespondentSdkApiError)) {
      throw new Error('expected a RespondentSdkApiError')
    }
    expect(error.status).toBe(400)
    expect(error.message).toBe(
      'Project has unpaid participants and cannot be closed',
    )
    expect(error.payload).toEqual({
      error: 'Project has unpaid participants and cannot be closed',
    })
  })

  it('falls back to the status line when the body carries no message', async () => {
    stubFetch(
      () => new Response('', { status: 500, statusText: 'Internal Error' }),
    )

    const error: unknown = await createSdk()
      .pricing.balanceSummary()
      .catch((caught: unknown) => caught)

    if (!(error instanceof RespondentSdkApiError)) {
      throw new Error('expected a RespondentSdkApiError')
    }
    expect(error.status).toBe(500)
    expect(error.message).toBe(
      'Respondent request failed with status 500 (Internal Error)',
    )
  })

  it('raises RespondentSdkResponseError for an undecodable success body', async () => {
    stubFetch(
      () =>
        new Response('{ not json', {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
    )

    const error: unknown = await createSdk()
      .projects.list()
      .catch((caught: unknown) => caught)

    if (!(error instanceof RespondentSdkResponseError)) {
      throw new Error('expected a RespondentSdkResponseError')
    }
    // The status is not the failure, so this must not look like an API error.
    expect(isRespondentSdkApiError(error)).toBe(false)
    expect(error.status).toBe(200)
    expect(error.message).toContain('could not be decoded')
    expect(error.cause).toBeInstanceOf(SyntaxError)
  })

  it('raises RespondentSdkTransportError when no response arrives', async () => {
    const networkFailure = new TypeError('fetch failed')
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.reject(networkFailure)),
    )

    const error: unknown = await createSdk()
      .projects.list()
      .catch((caught: unknown) => caught)

    if (!(error instanceof RespondentSdkTransportError)) {
      throw new Error('expected a RespondentSdkTransportError')
    }
    expect(isRespondentSdkApiError(error)).toBe(false)
    expect(error.cause).toBe(networkFailure)
    expect(error.message).toContain('fetch failed')
    expect(error.request?.headers['x-api-key']).toBe('[redacted]')
  })
})
