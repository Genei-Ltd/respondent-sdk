import { afterEach, describe, expect, it, vi } from 'vitest'
import { RespondentSdk, RespondentSdkTimeoutError } from '../src/index'
import { isRespondentSdkTimeoutError } from '../src/errors'

afterEach(() => {
  vi.unstubAllGlobals()
  vi.useRealTimers()
})

describe('request timeouts', () => {
  it('aborts and raises RespondentSdkTimeoutError', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(
        (request: Request) =>
          new Promise<Response>((_resolve, reject) => {
            request.signal.addEventListener('abort', () => {
              reject(request.signal.reason as Error)
            })
          }),
      ),
    )

    const sdk = new RespondentSdk({
      apiKey: 'client-id',
      apiSecret: 'client-secret',
      timeoutMs: 5,
    })

    const error: unknown = await sdk.projects
      .list()
      .catch((caught: unknown) => caught)

    expect(isRespondentSdkTimeoutError(error)).toBe(true)
    if (!(error instanceof RespondentSdkTimeoutError)) {
      throw new Error('expected a RespondentSdkTimeoutError')
    }
    expect(error.timeoutMs).toBe(5)
    expect(error.message).toContain('5ms')
  })

  it('leaves fast requests alone', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(
        () =>
          new Response(JSON.stringify({ page: 1, results: [] }), {
            headers: { 'Content-Type': 'application/json' },
          }),
      ),
    )

    const sdk = new RespondentSdk({
      apiKey: 'client-id',
      apiSecret: 'client-secret',
      timeoutMs: 5_000,
    })

    await expect(sdk.projects.list()).resolves.toEqual({
      page: 1,
      results: [],
    })
  })
})
