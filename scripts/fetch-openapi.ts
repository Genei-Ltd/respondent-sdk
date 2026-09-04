/**
 * Vendors the Respondent.io Partner API OpenAPI document into `schemas/openapi.json`.
 *
 * The provider publishes a single OpenAPI 3.0 document, so this script only
 * fetches, sanity-checks and pretty-prints it. The document is stored verbatim
 * (apart from formatting) so that diffs against the provider stay readable.
 */
import { writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const SPEC_URL = 'https://developers.respondent.io/api-reference/openapi.json'
const OUTPUT_PATH = resolve(
  import.meta.dirname,
  '..',
  'schemas',
  'openapi.json',
)

type OpenApiDocument = Record<string, unknown> & {
  openapi?: unknown
  info?: { title?: unknown; version?: unknown }
  paths?: Record<string, unknown>
  components?: { schemas?: Record<string, unknown> }
  servers?: { url?: string }[]
}

/**
 * The provider ships two string properties with `"default": null`
 * (`ProfileLocation.zipcode` and `ScreenerResponseInvitation.message`). That is
 * not valid against their own declared `"type": "string"`, and it makes the Zod
 * generator emit `z.string().optional().default(null)`, which does not compile.
 *
 * Drop the `default` in that case, and report every removal so the workaround
 * disappears from the log once the provider fixes the spec.
 */
function normalizeNullDefaults(document: OpenApiDocument): string[] {
  const removed: string[] = []

  const visit = (node: unknown, path: string): void => {
    if (Array.isArray(node)) {
      node.forEach((entry, index) => {
        visit(entry, `${path}[${String(index)}]`)
      })
      return
    }

    if (typeof node !== 'object' || node === null) {
      return
    }

    const record: Record<string, unknown> = node as Record<string, unknown>

    if ('default' in record && record.default === null) {
      const type = record.type
      const isNullable =
        record.nullable === true ||
        type === 'null' ||
        (Array.isArray(type) && type.includes('null'))

      if (!isNullable) {
        delete record.default
        removed.push(path)
      }
    }

    for (const [key, value] of Object.entries(record)) {
      visit(value, `${path}.${key}`)
    }
  }

  visit(document, '$')
  return removed
}

async function main(): Promise<void> {
  console.log(`Fetching ${SPEC_URL} ...`)
  const response = await fetch(SPEC_URL)

  if (!response.ok) {
    throw new Error(
      `Failed to fetch OpenAPI document: ${String(response.status)} ${response.statusText}`,
    )
  }

  const document = (await response.json()) as OpenApiDocument

  if (typeof document.openapi !== 'string') {
    throw new Error('Fetched document is missing a top-level `openapi` version')
  }

  const removedDefaults = normalizeNullDefaults(document)
  for (const location of removedDefaults) {
    console.warn(`Removed invalid \`"default": null\` at ${location}`)
  }

  const pathCount = Object.keys(document.paths ?? {}).length
  const schemaCount = Object.keys(document.components?.schemas ?? {}).length

  if (pathCount === 0) {
    throw new Error('Fetched document contains no paths')
  }

  await writeFile(
    OUTPUT_PATH,
    `${JSON.stringify(document, null, 2)}\n`,
    'utf-8',
  )

  console.log(
    `Wrote ${OUTPUT_PATH} (openapi ${document.openapi}, ${String(pathCount)} paths, ${String(schemaCount)} schemas)`,
  )
  console.log(
    `Servers declared by the provider: ${
      (document.servers ?? []).map((server) => server.url).join(', ') || 'none'
    }`,
  )
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
})
