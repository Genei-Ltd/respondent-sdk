/**
 * Packaging smoke test: the built bundles load in both module systems and every
 * path in the export map exists.
 *
 * `pnpm run check` builds before it tests, so this normally just loads what is
 * already there; run on its own it builds first.
 */
import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { beforeAll, describe, expect, it } from 'vitest'
import * as z from 'zod/v4'

const projectRoot = fileURLToPath(new URL('..', import.meta.url))
const distPath = (file: string) => `${projectRoot}dist/${file}`

const require = createRequire(import.meta.url)

const packageJsonRaw: unknown = JSON.parse(
  readFileSync(`${projectRoot}package.json`, 'utf-8'),
)
const packageJson = z
  .object({ exports: z.record(z.string(), z.unknown()) })
  .parse(packageJsonRaw)

const collectExportTargets = (
  node: unknown,
  found: string[] = [],
): string[] => {
  if (typeof node === 'string') {
    found.push(node)
    return found
  }
  if (typeof node === 'object' && node !== null) {
    for (const value of Object.values(node)) {
      collectExportTargets(value, found)
    }
  }
  return found
}

beforeAll(() => {
  if (!existsSync(distPath('index.mjs'))) {
    execFileSync('pnpm', ['run', 'build'], {
      cwd: projectRoot,
      stdio: 'inherit',
    })
  }
}, 300_000)

describe('package exports', () => {
  it('lists only files that exist', () => {
    const targets = collectExportTargets(packageJson.exports)

    expect(targets.length).toBeGreaterThan(0)
    for (const target of targets) {
      expect(
        existsSync(`${projectRoot}${target.replace(/^\.\//, '')}`),
        `missing export target ${target}`,
      ).toBe(true)
    }
  })

  it('loads the root entry as ESM and CJS', async () => {
    const esm: unknown = await import(pathToFileURL(distPath('index.mjs')).href)
    const cjs: unknown = require(distPath('index.cjs'))

    for (const loaded of [esm, cjs]) {
      expect(typeof Reflect.get(Object(loaded), 'RespondentSdk')).toBe(
        'function',
      )
      expect(typeof Reflect.get(Object(loaded), 'RespondentSdkApiError')).toBe(
        'function',
      )
      expect(
        Reflect.get(Object(loaded), 'RESPONDENT_PRODUCTION_BASE_URL'),
      ).toBe('https://api.respondent.io')
    }
  })

  it('loads the ./webhooks subpath as ESM and CJS', async () => {
    const esm: unknown = await import(
      pathToFileURL(distPath('webhooks.mjs')).href
    )
    const cjs: unknown = require(distPath('webhooks.cjs'))

    for (const loaded of [esm, cjs]) {
      expect(
        typeof Reflect.get(Object(loaded), 'verifyWebhookSignatureFromRawBody'),
      ).toBe('function')
      expect(typeof Reflect.get(Object(loaded), 'verifyAndDedupeWebhook')).toBe(
        'function',
      )
      expect(Reflect.get(Object(loaded), 'WebhookEvent')).toBeTruthy()
    }
  })

  it('loads the ./zod subpath as ESM and CJS', async () => {
    const esm: unknown = await import(pathToFileURL(distPath('zod.mjs')).href)
    const cjs: unknown = require(distPath('zod.cjs'))

    for (const loaded of [esm, cjs]) {
      expect(Reflect.get(Object(loaded), 'zGender')).toBeTruthy()
    }
  })

  it('runs a request through the built ESM bundle', async () => {
    type SdkModule = {
      RespondentSdk: new (options: { apiKey: string; apiSecret: string }) => {
        projects: { list: () => Promise<unknown> }
      }
    }

    const isSdkModule = (value: unknown): value is SdkModule =>
      typeof Reflect.get(Object(value), 'RespondentSdk') === 'function'

    const loaded: unknown = await import(
      pathToFileURL(distPath('index.mjs')).href
    )
    if (!isSdkModule(loaded)) {
      throw new Error('the built bundle does not export RespondentSdk')
    }

    const requests: Request[] = []
    const originalFetch = globalThis.fetch
    const stub: typeof fetch = (input) => {
      requests.push(new Request(input))
      return Promise.resolve(
        new Response('{"page":1,"results":[]}', {
          headers: { 'Content-Type': 'application/json' },
        }),
      )
    }
    globalThis.fetch = stub

    try {
      const sdk = new loaded.RespondentSdk({
        apiKey: 'client-id',
        apiSecret: 'client-secret',
      })
      await sdk.projects.list()
    } finally {
      globalThis.fetch = originalFetch
    }

    expect(requests[0]?.url).toBe('https://api.respondent.io/v1/projects')
    expect(requests[0]?.headers.get('x-api-key')).toBe('client-id')
  })
})
