import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  REDACTED_HEADER_VALUE,
  RESPONDENT_PRODUCTION_BASE_URL,
  type RespondentRequestEvent,
  RespondentSdk,
  RespondentSdkApiError,
  RespondentSdkTimeoutError,
  RespondentSdkTransportError,
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
  vi.stubGlobal(
    'fetch',
    vi.fn(async (request: Request) => handler(request)),
  )
}

/** A fetch that never answers and rejects with the abort reason when aborted. */
const stubHangingFetch = () => {
  vi.stubGlobal(
    'fetch',
    vi.fn(
      (request: Request) =>
        new Promise<Response>((_resolve, reject) => {
          const fail = () => {
            const reason: unknown = request.signal.reason
            reject(reason instanceof Error ? reason : new Error('aborted'))
          }
          // A caller may abort before fetch is even reached.
          if (request.signal.aborted) {
            fail()
            return
          }
          request.signal.addEventListener('abort', fail)
        }),
    ),
  )
}

const createSdk = (overrides?: { timeoutMs?: number }) => {
  const events: RespondentRequestEvent[] = []
  const sdk = new RespondentSdk({
    apiKey: 'client-id-84f2',
    apiSecret: 'client-secret-9d31',
    onRequestSettled: (event) => {
      events.push(event)
    },
    ...overrides,
  })
  return { sdk, events }
}

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('onRequestSettled', () => {
  it('reports a success once, with the status and a redacted request', async () => {
    stubFetch(() => jsonResponse({ page: 1, results: [] }))
    const { sdk, events } = createSdk()

    await sdk.projects.list()

    expect(events).toHaveLength(1)
    expect(events[0]).toMatchObject({
      status: 200,
      request: {
        method: 'GET',
        url: `${RESPONDENT_PRODUCTION_BASE_URL}/v1/projects`,
      },
    })
    expect(events[0]?.error).toBeUndefined()
    expect(events[0]?.request.headers['x-api-key']).toBe(REDACTED_HEADER_VALUE)
    expect(events[0]?.request.headers['x-api-secret']).toBe(
      REDACTED_HEADER_VALUE,
    )
    expect(events[0]?.durationMs).toBeGreaterThanOrEqual(0)
  })

  it('reports a non-2xx once, with the status and the API error', async () => {
    stubFetch(() => jsonResponse({ error: 'nope' }, { status: 400 }))
    const { sdk, events } = createSdk()

    await expect(sdk.projects.list()).rejects.toBeInstanceOf(
      RespondentSdkApiError,
    )

    expect(events).toHaveLength(1)
    expect(events[0]?.status).toBe(400)
    expect(events[0]?.error).toBeInstanceOf(RespondentSdkApiError)
  })

  it('reports a transport failure with the error and no status', async () => {
    stubFetch(() => {
      throw new TypeError('fetch failed')
    })
    const { sdk, events } = createSdk()

    await expect(sdk.projects.list()).rejects.toBeInstanceOf(
      RespondentSdkTransportError,
    )

    expect(events).toHaveLength(1)
    expect(events[0]?.status).toBeUndefined()
    expect(events[0]?.error).toBeInstanceOf(RespondentSdkTransportError)
  })

  it('reports a timeout with the timeout error', async () => {
    stubHangingFetch()
    const { sdk, events } = createSdk({ timeoutMs: 5 })

    await expect(sdk.projects.list()).rejects.toBeInstanceOf(
      RespondentSdkTimeoutError,
    )

    expect(events).toHaveLength(1)
    expect(events[0]?.status).toBeUndefined()
    expect(events[0]?.error).toBeInstanceOf(RespondentSdkTimeoutError)
  })

  it('reports a caller abort with the caller reason', async () => {
    stubHangingFetch()
    const { sdk, events } = createSdk()
    const controller = new AbortController()
    const reason = new Error('user navigated away')

    const pending = sdk.projects.list(undefined, { signal: controller.signal })
    controller.abort(reason)

    await expect(pending).rejects.toBe(reason)
    expect(events).toHaveLength(1)
    expect(events[0]?.error).toBe(reason)
  })

  it('is silent when no hook is configured', async () => {
    stubFetch(() => jsonResponse({ page: 1, results: [] }))
    const sdk = new RespondentSdk({
      apiKey: 'client-id-84f2',
      apiSecret: 'client-secret-9d31',
    })

    await expect(sdk.projects.list()).resolves.toMatchObject({ page: 1 })
  })
})
