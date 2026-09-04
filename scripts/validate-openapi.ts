/**
 * Validates the vendored OpenAPI document with `@apidevtools/swagger-parser`,
 * and checks it is still in the normal form `scripts/update-openapi.ts`
 * produces (see `scripts/normalize-openapi.ts`).
 *
 * Usage: tsx scripts/validate-openapi.ts schemas/openapi.json [...]
 */
import SwaggerParser from '@apidevtools/swagger-parser'
import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import {
  describeNormalization,
  isNormalizationClean,
  normalizeOpenApiDocument,
  type OpenApiDocument,
} from './normalize-openapi'

const isOpenApiDocument = (value: unknown): value is OpenApiDocument =>
  typeof value === 'object' &&
  value !== null &&
  !Array.isArray(value) &&
  typeof Reflect.get(value, 'openapi') === 'string'

async function validateSchema(filePath: string): Promise<void> {
  const absolutePath = resolve(filePath)
  const raw = await readFile(absolutePath, 'utf-8')
  const parsed: unknown = JSON.parse(raw)

  if (!isOpenApiDocument(parsed)) {
    throw new Error(`Not an OpenAPI document: ${absolutePath}`)
  }

  await SwaggerParser.validate(structuredClone(parsed) as never)

  const report = normalizeOpenApiDocument(structuredClone(parsed))
  if (!isNormalizationClean(report)) {
    throw new Error(
      [
        `${filePath}: not in normal form. Re-run \`pnpm run schema:update\`.`,
        ...describeNormalization(report).map((line) => `  - ${line}`),
      ].join('\n'),
    )
  }

  console.log(`${filePath}: valid, normalised OpenAPI schema`)
}

async function main(): Promise<void> {
  const targets = process.argv.slice(2)

  if (targets.length === 0) {
    console.error('Usage: tsx scripts/validate-openapi.ts <file> [...]')
    process.exitCode = 1
    return
  }

  const results = await Promise.allSettled(targets.map(validateSchema))

  let failures = 0
  for (const result of results) {
    if (result.status === 'rejected') {
      failures += 1
      const reason: unknown = result.reason
      console.error(reason instanceof Error ? reason.message : reason)
    }
  }

  if (failures > 0) {
    process.exitCode = 1
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
})
