/**
 * Smoke tests for the built bundles, on the oldest runtime the package claims
 * to support.
 *
 * `engines.node` promises Node 18, but the development toolchain — Vite,
 * Vitest, ESLint, tsdown — needs Node 20 or newer, so nothing here may depend
 * on it. Plain `node:test` and `node:assert`, against `dist/`, with `zod` as
 * the only installed dependency. Build first: `pnpm run build`.
 *
 * This is the whole of the packaging coverage: what loads, what the export map
 * promises, and the transport behaviour the bundles have to keep. The Vitest
 * suites next to it run against `src/`.
 */
import { createHmac } from 'node:crypto'
import { existsSync, readFileSync } from 'node:fs'
import { createServer } from 'node:http'
import { createRequire } from 'node:module'
import { File } from 'node:buffer'
import { after, test } from 'node:test'
import assert from 'node:assert/strict'
import { fileURLToPath, pathToFileURL } from 'node:url'

const projectRoot = fileURLToPath(new URL('..', import.meta.url))
const distPath = (file) => `${projectRoot}dist/${file}`
const require = createRequire(import.meta.url)

if (!existsSync(distPath('index.mjs'))) {
  throw new Error('dist/ is missing — run `pnpm run build` first')
}

const API_KEY = 'client-id-84f2'
const API_SECRET = 'client-secret-9d31'

const servers = []

const startServer = async (handler) => {
  const server = createServer(handler)
  servers.push(server)
  await new Promise((resolve) => {
    server.listen(0, '127.0.0.1', resolve)
  })
  return `http://127.0.0.1:${server.address().port}`
}

after(async () => {
  await Promise.all(
    servers.splice(0).map(
      (server) =>
        new Promise((resolve) => {
          server.closeAllConnections()
          server.close(resolve)
        }),
    ),
  )
})

const readBody = async (request) => {
  const chunks = []
  for await (const chunk of request) {
    chunks.push(Buffer.from(chunk))
  }
  return Buffer.concat(chunks).toString('utf-8')
}

const esm = await import(pathToFileURL(distPath('index.mjs')).href)
const cjs = require(distPath('index.cjs'))

test('every export map target exists', () => {
  const packageJson = JSON.parse(
    readFileSync(`${projectRoot}package.json`, 'utf-8'),
  )

  const targets = []
  const collect = (node) => {
    if (typeof node === 'string') {
      targets.push(node)
      return
    }
    if (typeof node === 'object' && node !== null) {
      Object.values(node).forEach(collect)
    }
  }
  collect(packageJson.exports)

  assert.ok(targets.length > 0)
  for (const target of targets) {
    assert.ok(
      existsSync(`${projectRoot}${target.replace(/^\.\//, '')}`),
      `missing export target ${target}`,
    )
  }
})

test('the root entry loads as ESM and as CJS', () => {
  for (const loaded of [esm, cjs]) {
    assert.equal(typeof loaded.RespondentSdk, 'function')
    assert.equal(typeof loaded.RespondentSdkApiError, 'function')
    assert.equal(
      loaded.RESPONDENT_PRODUCTION_BASE_URL,
      'https://api.respondent.io',
    )
  }
})

test('the ./webhooks subpath loads and verifies a signature', async () => {
  const loaded = [
    await import(pathToFileURL(distPath('webhooks.mjs')).href),
    require(distPath('webhooks.cjs')),
  ]

  const privateKey = '44450f9c-f43c-4c26-98cb-53bdc0f49fde'
  const rawBody = JSON.stringify({
    event: 'PROJECTS.UPDATED',
    uuid: '4aae25da-dd7b-4e2d-bb6a-9177dec83baa',
    created: '2026-01-08T23:09:42.677Z',
    payload: { resource: { id: 'p', type: 'projects', updatedFields: [] } },
  })
  const digest = createHmac('sha256', privateKey)
    .update(rawBody)
    .digest('base64')

  for (const webhooks of loaded) {
    assert.ok(webhooks.WebhookEvent)
    assert.equal(
      webhooks.verifyWebhookSignatureFromRawBody({
        rawBody,
        signatureHeader: `sha256=${digest}`,
        privateKey,
      }),
      true,
    )
    assert.equal(
      webhooks.verifyWebhookSignatureFromRawBody({
        rawBody,
        signatureHeader: `sha256=${digest}`,
        privateKey: 'wrong-key',
      }),
      false,
    )

    const outcome = await webhooks.verifyAndDedupeWebhook({
      rawBody,
      signatureHeader: `sha256=${digest}`,
      privateKey,
      claimAndStore: () => 'stored',
    })
    assert.equal(outcome.status, 'stored')
  }
})

test('the ./zod subpath loads as ESM and as CJS', async () => {
  const zodEsm = await import(pathToFileURL(distPath('zod.mjs')).href)
  const zodCjs = require(distPath('zod.cjs'))

  for (const loaded of [zodEsm, zodCjs]) {
    assert.ok(loaded.zGender)
  }
})

test('the built bundle sends a request', async () => {
  const received = []
  const baseUrl = await startServer((request, response) => {
    received.push(request)
    response.writeHead(200, { 'Content-Type': 'application/json' })
    response.end('{"page":1,"results":[]}')
  })

  const sdk = new esm.RespondentSdk({
    apiKey: API_KEY,
    apiSecret: API_SECRET,
    baseUrl,
  })
  await sdk.projects.list()

  assert.equal(received.length, 1)
  assert.equal(received[0].url, '/v1/projects')
  assert.equal(received[0].headers['x-api-key'], API_KEY)
})

test('a redirect is refused rather than followed with the credentials', async () => {
  const receivedByTarget = []
  const targetUrl = await startServer((request, response) => {
    receivedByTarget.push(request.headers)
    response.writeHead(200, { 'Content-Type': 'application/json' })
    response.end('{}')
  })
  const redirectingUrl = await startServer((_request, response) => {
    response.writeHead(302, { Location: `${targetUrl}/v1/projects` })
    response.end()
  })

  const sdk = new esm.RespondentSdk({
    apiKey: API_KEY,
    apiSecret: API_SECRET,
    baseUrl: redirectingUrl,
  })

  const error = await sdk.projects.list().catch((caught) => caught)

  assert.equal(error.name, 'RespondentSdkTransportError')
  assert.equal(receivedByTarget.length, 0)
})

test('a stalled response trips the configured timeout', async () => {
  const baseUrl = await startServer(() => {
    // Never answer.
  })

  const sdk = new esm.RespondentSdk({
    apiKey: API_KEY,
    apiSecret: API_SECRET,
    baseUrl,
    timeoutMs: 250,
  })

  const error = await sdk.projects.list().catch((caught) => caught)

  assert.equal(error.name, 'RespondentSdkTimeoutError')
  assert.equal(error.timeoutMs, 250)
})

test('a file upload is sent as multipart with the boundary Fetch chose', async () => {
  const received = []
  const baseUrl = await startServer((request, response) => {
    void readBody(request).then((body) => {
      received.push({ headers: request.headers, body })
      response.writeHead(200, { 'Content-Type': 'application/json' })
      response.end('{}')
    })
  })

  const sdk = new esm.RespondentSdk({
    apiKey: API_KEY,
    apiSecret: API_SECRET,
    baseUrl,
  })

  const file = new File([new Uint8Array([0x25, 0x50, 0x44, 0x46])], 'nda.pdf', {
    type: 'application/pdf',
  })
  await sdk.projects.uploadFile(
    'project-1',
    { uploadFile: file },
    { type: 'nda' },
  )

  assert.equal(received.length, 1)
  const contentType = received[0].headers['content-type']
  assert.match(contentType, /^multipart\/form-data; boundary=.+/)

  const boundary = /boundary=(.+)$/.exec(contentType)[1]
  assert.ok(received[0].body.includes(`--${boundary}`))
  assert.ok(
    received[0].body.includes(
      'Content-Disposition: form-data; name="uploadFile"; filename="nda.pdf"',
    ),
  )
  assert.ok(received[0].body.includes('%PDF'))
})
