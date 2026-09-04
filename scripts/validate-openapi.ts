/**
 * Validates the vendored OpenAPI document with `@apidevtools/swagger-parser`.
 *
 * Usage: tsx scripts/validate-openapi.ts schemas/openapi.json [...]
 */
import SwaggerParser from '@apidevtools/swagger-parser'
import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'

async function validateSchema(filePath: string): Promise<void> {
  const absolutePath = resolve(filePath)
  const raw = await readFile(absolutePath, 'utf-8')
  const parsed: unknown = JSON.parse(raw)

  if (
    typeof parsed !== 'object' ||
    parsed === null ||
    typeof (parsed as { openapi?: unknown }).openapi !== 'string'
  ) {
    throw new Error(`Not an OpenAPI document: ${absolutePath}`)
  }

  await SwaggerParser.validate(structuredClone(parsed) as never)
  console.log(`${filePath}: valid OpenAPI schema`)
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
