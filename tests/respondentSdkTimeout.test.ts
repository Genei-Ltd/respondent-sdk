import { createServer, type Server } from 'node:http'
import type { AddressInfo } from 'node:net'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  RespondentSdk,
  RespondentSdkTimeoutError,
  isRespondentSdkTimeoutError,
} from '../src/index'

const servers: Server[] = []

const startServer = async (
  handler: Parameters<typeof createServer>[1],
): Promise<string> => {
  const server = createServer(handler)
  servers.push(server)
  await new Promise<void>((resolve) => {
    server.listen(0, '127.0.0.1', resolve)
  })
  const address: AddressInfo | string | null = server.address()
  if (address === null || typeof address === 'string') {
    throw new Error('server did not bind to a port')
  }
  return `http://127.0.0.1:${String(address.port)}`
}

afterEach(async () => {
  vi.unstubAllGlobals()
  await Promise.all(
    servers.splice(0).map(
      (server) =>
        new Promise<void>((resolve) => {
          server.closeAllConnections()
          server.close(() => {
            resolve()
          })
        }),
    ),
  )
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
    expect(error.request?.headers['x-api-key']).toBe('[redacted]')
  })

  it('trips on a response that sends headers and then stalls the body', async () => {
    // `fetch` resolves once the headers arrive, so a deadline that stops there
    // would leave this request pending for ever.
    const baseUrl = await startServer((_request, response) => {
      response.writeHead(200, { 'Content-Type': 'application/json' })
      response.write('{"page":1,')
      // Never finish the body.
    })

    const sdk = new RespondentSdk({
      apiKey: 'client-id',
      apiSecret: 'client-secret',
      baseUrl,
      timeoutMs: 50,
    })

    const started = Date.now()
    const error: unknown = await sdk.projects
      .list()
      .catch((caught: unknown) => caught)

    expect(isRespondentSdkTimeoutError(error)).toBe(true)
    expect(Date.now() - started).toBeLessThan(5_000)
  })

  it('sends a request body unchanged under a timeout', async () => {
    // The timeout wraps the request in a new `Request`, which must not lose or
    // disturb the body.
    const bodies: string[] = []
    const baseUrl = await startServer((request, response) => {
      const chunks: string[] = []
      request.setEncoding('utf-8')
      request.on('data', (chunk: string) => chunks.push(chunk))
      request.on('end', () => {
        bodies.push(chunks.join(''))
        response.writeHead(200, { 'Content-Type': 'application/json' })
        response.end('{"id":"project-1"}')
      })
    })

    const sdk = new RespondentSdk({
      apiKey: 'client-id',
      apiSecret: 'client-secret',
      baseUrl,
      timeoutMs: 5_000,
    })

    await sdk.projects.close('project-1', { message: 'Wrapping up' })

    expect(bodies).toEqual(['{"message":"Wrapping up"}'])
  })

  it('leaves fast requests alone', async () => {
    const baseUrl = await startServer((_request, response) => {
      response.writeHead(200, { 'Content-Type': 'application/json' })
      response.end(JSON.stringify({ page: 1, results: [] }))
    })

    const sdk = new RespondentSdk({
      apiKey: 'client-id',
      apiSecret: 'client-secret',
      baseUrl,
      timeoutMs: 5_000,
    })

    await expect(sdk.projects.list()).resolves.toEqual({
      page: 1,
      results: [],
    })
  })
})

describe('caller aborts', () => {
  it('rejects with the caller reason, without a timeout configured', async () => {
    const baseUrl = await startServer((_request, response) => {
      response.writeHead(200, { 'Content-Type': 'application/json' })
      // Never respond; the caller aborts instead.
      void response
    })

    const sdk = new RespondentSdk({
      apiKey: 'client-id',
      apiSecret: 'client-secret',
      baseUrl,
    })

    const reason = new Error('caller changed their mind')
    const controller = new AbortController()
    setTimeout(() => {
      controller.abort(reason)
    }, 20)

    await expect(
      sdk.projects.list(undefined, { signal: controller.signal }),
    ).rejects.toBe(reason)
  })

  it('rejects with the caller reason alongside a timeout', async () => {
    const baseUrl = await startServer((_request, response) => {
      response.writeHead(200, { 'Content-Type': 'application/json' })
      void response
    })

    const sdk = new RespondentSdk({
      apiKey: 'client-id',
      apiSecret: 'client-secret',
      baseUrl,
      timeoutMs: 10_000,
    })

    const reason = new Error('caller changed their mind')
    const controller = new AbortController()
    setTimeout(() => {
      controller.abort(reason)
    }, 20)

    await expect(
      sdk.projects.retrieve('project-1', { signal: controller.signal }),
    ).rejects.toBe(reason)
  })

  it('rejects immediately when the signal is already aborted', async () => {
    const baseUrl = await startServer((_request, response) => {
      response.end('{}')
    })

    const sdk = new RespondentSdk({
      apiKey: 'client-id',
      apiSecret: 'client-secret',
      baseUrl,
      timeoutMs: 10_000,
    })

    const reason = new Error('already gone')
    await expect(
      sdk.projects.list(undefined, { signal: AbortSignal.abort(reason) }),
    ).rejects.toBe(reason)
  })
})
