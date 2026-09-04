import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  RESPONDENT_PRODUCTION_BASE_URL,
  RESPONDENT_STAGING_BASE_URL,
  RespondentSdk,
  RespondentSdkError,
  isRespondentSdkError,
} from '../src/index'

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
    apiKey: 'client-id',
    apiSecret: 'client-secret',
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
          apiKey: 'client-id',
          apiSecret: 'client-secret',
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
      expect(request.headers.get('x-api-key')).toBe('client-id')
      expect(request.headers.get('x-api-secret')).toBe('client-secret')
    }
  })
})

describe('operations', () => {
  it('forwards query parameters and returns the parsed body', async () => {
    const payload = {
      page: 2,
      pageSize: 10,
      results: [{ id: 'project-1' }],
    }
    const calls = stubFetch(() => jsonResponse(payload))

    const projects = await createSdk().projects.list({
      page: 2,
      pageSize: 10,
      status: 'DRAFT',
    })

    const url = new URL(calls[0]?.url ?? '')
    expect(url.pathname).toBe('/v1/projects')
    expect(url.searchParams.get('page')).toBe('2')
    expect(url.searchParams.get('pageSize')).toBe('10')
    expect(url.searchParams.get('status')).toBe('DRAFT')
    expect(projects).toEqual(payload)
  })

  it('interpolates path parameters and sends the request body', async () => {
    let sentBody: unknown
    const calls = stubFetch(async (request) => {
      sentBody = await request.json()
      return jsonResponse({ id: 'response-1', qualified: true })
    })

    await createSdk().screenerResponses.qualify('project-1', 'response-1', {
      qualifyStatus: true,
      qualifiedOverriden: false,
      disqualifyReasons: [],
      message: '',
    })

    expect(calls[0]?.method).toBe('PATCH')
    expect(new URL(calls[0]?.url ?? '').pathname).toBe(
      '/v1/projects/project-1/screener-responses/response-1/qualify',
    )
    expect(sentBody).toEqual({
      qualifyStatus: true,
      qualifiedOverriden: false,
      disqualifyReasons: [],
      message: '',
    })
  })
})

describe('error handling', () => {
  it('raises RespondentSdkError for non-2xx responses', async () => {
    stubFetch(() =>
      jsonResponse(
        { error: 'Project has unpaid participants and cannot be closed' },
        { status: 400, statusText: 'Bad Request' },
      ),
    )

    const error: unknown = await createSdk()
      .projects.close('project-1', { message: 'Wrapping up' })
      .catch((caught: unknown) => caught)

    expect(isRespondentSdkError(error)).toBe(true)
    if (!(error instanceof RespondentSdkError)) {
      throw new Error('expected a RespondentSdkError')
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

    if (!(error instanceof RespondentSdkError)) {
      throw new Error('expected a RespondentSdkError')
    }
    expect(error.status).toBe(500)
    expect(error.message).toBe(
      'Respondent request failed with status 500 (Internal Error)',
    )
  })
})
