/**
 * Transport-level regressions, exercised against real HTTP servers so the
 * behaviour under test is Node's `fetch`, not a stub of it.
 */
import { createServer, type IncomingMessage, type Server } from 'node:http'
import type { AddressInfo } from 'node:net'
import { afterEach, describe, expect, it } from 'vitest'
import { RespondentSdk, RespondentSdkTransportError } from '../src/index'

const API_KEY = 'client-id-84f2'
const API_SECRET = 'client-secret-9d31'

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

const readBody = async (request: IncomingMessage): Promise<Buffer> => {
  const chunks: Buffer[] = []
  for await (const chunk of request) {
    if (typeof chunk === 'string') {
      chunks.push(Buffer.from(chunk, 'utf-8'))
    } else if (Buffer.isBuffer(chunk)) {
      chunks.push(chunk)
    }
  }
  return Buffer.concat(chunks)
}

afterEach(async () => {
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

describe('redirects', () => {
  it('refuses a cross-origin redirect instead of forwarding credentials', async () => {
    // Node forwards custom headers across an origin-changing redirect, unlike
    // `Authorization`, so following one would hand `x-api-key` and
    // `x-api-secret` to the redirect target.
    const receivedByTarget: Record<string, string | string[] | undefined>[] = []
    const targetUrl = await startServer((request, response) => {
      receivedByTarget.push(request.headers)
      response.writeHead(200, { 'Content-Type': 'application/json' })
      response.end('{}')
    })

    const redirectingUrl = await startServer((_request, response) => {
      response.writeHead(302, { Location: `${targetUrl}/v1/projects` })
      response.end()
    })

    const sdk = new RespondentSdk({
      apiKey: API_KEY,
      apiSecret: API_SECRET,
      baseUrl: redirectingUrl,
    })

    const error: unknown = await sdk.projects
      .list()
      .catch((caught: unknown) => caught)

    expect(error).toBeInstanceOf(RespondentSdkTransportError)
    expect(receivedByTarget).toHaveLength(0)
  })

  it('refuses a same-origin redirect too', async () => {
    let hits = 0
    const baseUrl = await startServer((request, response) => {
      hits += 1
      if (request.url === '/v1/projects') {
        response.writeHead(302, { Location: '/v1/projects-moved' })
        response.end()
        return
      }
      response.writeHead(200, { 'Content-Type': 'application/json' })
      response.end('{}')
    })

    // A configured timeout rebuilds the request, so check `redirect: 'error'`
    // survives that too.
    const sdk = new RespondentSdk({
      apiKey: API_KEY,
      apiSecret: API_SECRET,
      baseUrl,
      timeoutMs: 5_000,
    })

    await expect(sdk.projects.list()).rejects.toBeInstanceOf(
      RespondentSdkTransportError,
    )
    expect(hits).toBe(1)
  })
})

describe('multipart upload', () => {
  it('sends one multipart part with a boundary Fetch chose', async () => {
    const received: { headers: IncomingMessage['headers']; body: string }[] = []
    const baseUrl = await startServer((request, response) => {
      void readBody(request).then((body) => {
        received.push({
          headers: request.headers,
          body: body.toString('utf-8'),
        })
        response.writeHead(200, { 'Content-Type': 'application/json' })
        response.end('{}')
      })
    })

    const sdk = new RespondentSdk({
      apiKey: API_KEY,
      apiSecret: API_SECRET,
      baseUrl,
    })

    const file = new File(
      [new Uint8Array([0x25, 0x50, 0x44, 0x46])],
      'nda.pdf',
      {
        type: 'application/pdf',
      },
    )

    await sdk.projects.uploadFile(
      'project-1',
      { uploadFile: file },
      { type: 'nda' },
    )

    expect(received).toHaveLength(1)
    const call = received[0]
    if (!call) {
      throw new Error('no request captured')
    }

    const contentType = call.headers['content-type']
    expect(contentType).toMatch(/^multipart\/form-data; boundary=.+/)

    const boundary = /boundary=(.+)$/.exec(contentType ?? '')?.[1]
    expect(boundary).toBeTruthy()
    // The boundary in the header is the one the body actually uses.
    expect(call.body).toContain(`--${String(boundary)}`)
    expect(call.body).toContain(
      'Content-Disposition: form-data; name="uploadFile"; filename="nda.pdf"',
    )
    expect(call.body).toContain('Content-Type: application/pdf')
    expect(call.body).toContain('%PDF')

    // Fetch owns the framing: either a length it computed or chunked encoding,
    // never a value the caller guessed.
    const declaredLength = call.headers['content-length']
    if (declaredLength !== undefined) {
      expect(Number(declaredLength)).toBe(Buffer.byteLength(call.body))
    } else {
      expect(call.headers['transfer-encoding']).toBe('chunked')
    }
  })
})
