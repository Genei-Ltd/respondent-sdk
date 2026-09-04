/**
 * Refreshes the vendored Respondent.io Partner API OpenAPI document.
 *
 * Usage: tsx scripts/update-openapi.ts
 *
 * The vendored copy in `schemas/openapi.json` is the single input to
 * `pnpm run generate`; this script is the only thing that touches the network.
 * The fetched document is pretty-printed, normalised (see
 * `scripts/normalize-openapi.ts` — it is not stored verbatim) and fully
 * validated in memory. Only then does it atomically replace the vendored file,
 * so a broken upstream document can never leave a broken spec behind.
 */
import SwaggerParser from '@apidevtools/swagger-parser'
import { rename, rm, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import {
  describeNormalization,
  normalizeOpenApiDocument,
  type OpenApiDocument,
} from './normalize-openapi'

const SPEC_URL = 'https://developers.respondent.io/api-reference/openapi.json'
const OUTPUT_PATH = fileURLToPath(
  new URL('../schemas/openapi.json', import.meta.url),
)
const TEMP_PATH = `${OUTPUT_PATH}.tmp`

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

async function main(): Promise<void> {
  console.log(`Fetching ${SPEC_URL} ...`)
  const response = await fetch(SPEC_URL)

  if (!response.ok) {
    throw new Error(
      `Failed to fetch OpenAPI document: ${String(response.status)} ${response.statusText}`,
    )
  }

  const fetched: unknown = await response.json()

  if (!isRecord(fetched)) {
    throw new Error('Fetched document is not a JSON object')
  }

  const document: OpenApiDocument = fetched

  if (typeof document.openapi !== 'string') {
    throw new Error('Fetched document is missing a top-level `openapi` version')
  }

  const pathCount = Object.keys(document.paths ?? {}).length
  if (pathCount === 0) {
    throw new Error('Fetched document contains no paths')
  }

  for (const change of describeNormalization(
    normalizeOpenApiDocument(document),
  )) {
    console.warn(change)
  }

  // Validate the normalised document before it can replace the vendored file.
  await SwaggerParser.validate(structuredClone(document) as never)

  const schemaCount = Object.keys(document.components?.schemas ?? {}).length

  try {
    await writeFile(
      TEMP_PATH,
      `${JSON.stringify(document, null, 2)}\n`,
      'utf-8',
    )
    await rename(TEMP_PATH, OUTPUT_PATH)
  } finally {
    await rm(TEMP_PATH, { force: true })
  }

  console.log(
    `Wrote ${OUTPUT_PATH} (openapi ${document.openapi}, ${String(pathCount)} paths, ${String(schemaCount)} schemas)`,
  )
  console.log(
    `Servers declared by the provider: ${
      (document.servers ?? []).map((server) => server.url).join(', ') || 'none'
    }`,
  )
  console.log('Now run `pnpm run generate` to regenerate the client.')
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
})
