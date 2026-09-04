/**
 * Normalisations applied to the provider's OpenAPI document while it is
 * vendored into `schemas/openapi.json`.
 *
 * The vendored document is therefore NOT byte-for-byte what the provider
 * publishes. Every change is listed here, is reported when the schema is
 * refreshed, and is re-checked by `scripts/validate-openapi.ts` so the vendored
 * file can never drift out of normal form.
 */

export type OpenApiDocument = Record<string, unknown> & {
  openapi?: unknown
  info?: { title?: unknown; version?: unknown }
  paths?: Record<string, unknown>
  components?: { schemas?: Record<string, unknown> }
  servers?: { url?: string }[]
}

export type NormalizationReport = {
  /** JSON paths where an invalid `"default": null` was removed. */
  removedNullDefaults: string[]
  /** `METHOD /path` entries where a transport header parameter was removed. */
  removedTransportHeaders: string[]
  /** `METHOD /path` entries where a binary multipart property became required. */
  requiredBinaryProperties: string[]
}

export const isNormalizationClean = (report: NormalizationReport): boolean =>
  report.removedNullDefaults.length === 0 &&
  report.removedTransportHeaders.length === 0 &&
  report.requiredBinaryProperties.length === 0

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const asRecord = (value: unknown): Record<string, unknown> | undefined =>
  isRecord(value) ? value : undefined

const isUnknownArray = (value: unknown): value is unknown[] =>
  Array.isArray(value)

const HTTP_METHODS = [
  'get',
  'put',
  'post',
  'delete',
  'options',
  'head',
  'patch',
  'trace',
]

/**
 * Transport-level headers that Fetch owns. The provider declares them as
 * required header parameters on the multipart upload, which makes the generated
 * signature ask callers for values they cannot compute: the multipart boundary
 * is chosen by the serializer, so a hand-written `Content-Type` loses it and a
 * hand-written `Content-Length` is a guess.
 *
 * Removing them lets Fetch set both correctly from the `FormData` body.
 */
const TRANSPORT_HEADER_PARAMETERS = ['content-type', 'content-length']

/**
 * The provider ships two string properties with `"default": null`
 * (`ProfileLocation.zipcode` and `ScreenerResponseInvitation.message`). That is
 * not valid against their own declared `"type": "string"`, and it makes the Zod
 * generator emit `z.string().optional().default(null)`, which does not compile.
 *
 * Drop the `default` in that case, and report every removal so the workaround
 * disappears from the log once the provider fixes the spec.
 */
const removeNullDefaults = (document: OpenApiDocument): string[] => {
  const removed: string[] = []

  const visit = (node: unknown, path: string): void => {
    if (Array.isArray(node)) {
      node.forEach((entry, index) => {
        visit(entry, `${path}[${String(index)}]`)
      })
      return
    }

    const record = asRecord(node)
    if (!record) {
      return
    }

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

const eachOperation = (
  document: OpenApiDocument,
  visit: (operation: Record<string, unknown>, label: string) => void,
): void => {
  for (const [path, pathItem] of Object.entries(document.paths ?? {})) {
    const item = asRecord(pathItem)
    if (!item) {
      continue
    }
    for (const method of HTTP_METHODS) {
      const operation = asRecord(item[method])
      if (operation) {
        visit(operation, `${method.toUpperCase()} ${path}`)
      }
    }
  }
}

/** Strip `Content-Type` / `Content-Length` header parameters. */
const removeTransportHeaderParameters = (
  document: OpenApiDocument,
): string[] => {
  const removed: string[] = []

  eachOperation(document, (operation, label) => {
    const parameters = operation.parameters
    if (!Array.isArray(parameters)) {
      return
    }

    const kept = parameters.filter((parameter) => {
      const record = asRecord(parameter)
      if (record?.in !== 'header') {
        return true
      }
      const name = record.name
      if (
        typeof name !== 'string' ||
        !TRANSPORT_HEADER_PARAMETERS.includes(name.toLowerCase())
      ) {
        return true
      }
      removed.push(`${label} (${name})`)
      return false
    })

    if (kept.length !== parameters.length) {
      operation.parameters = kept
    }
  })

  return removed
}

/**
 * The upload endpoint's only body property, `uploadFile`, is not marked
 * required, so the generated type allows an empty multipart body. An upload
 * with no file is never a useful call, so require every binary property of a
 * multipart body.
 */
const requireBinaryMultipartProperties = (
  document: OpenApiDocument,
): string[] => {
  const changed: string[] = []

  eachOperation(document, (operation, label) => {
    const requestBody = asRecord(operation.requestBody)
    const content = asRecord(requestBody?.content)
    if (!content) {
      return
    }

    for (const [mediaType, mediaObject] of Object.entries(content)) {
      if (!mediaType.startsWith('multipart/')) {
        continue
      }
      const schema = asRecord(asRecord(mediaObject)?.schema)
      const properties = asRecord(schema?.properties)
      if (!schema || !properties) {
        continue
      }

      const declared: unknown = schema.required
      const existing: unknown[] = isUnknownArray(declared) ? declared : []
      const required: unknown[] = [...existing]

      for (const [name, property] of Object.entries(properties)) {
        if (asRecord(property)?.format !== 'binary') {
          continue
        }
        if (required.includes(name)) {
          continue
        }
        required.push(name)
        changed.push(`${label} (${name})`)
      }

      if (required.length !== existing.length) {
        schema.required = required
      }
    }
  })

  return changed
}

/**
 * Apply every normalisation in place and report what changed. Running it twice
 * over the same document reports no changes the second time.
 */
export const normalizeOpenApiDocument = (
  document: OpenApiDocument,
): NormalizationReport => ({
  removedNullDefaults: removeNullDefaults(document),
  removedTransportHeaders: removeTransportHeaderParameters(document),
  requiredBinaryProperties: requireBinaryMultipartProperties(document),
})

export const describeNormalization = (
  report: NormalizationReport,
): string[] => [
  ...report.removedNullDefaults.map(
    (location) => `Removed invalid \`"default": null\` at ${location}`,
  ),
  ...report.removedTransportHeaders.map(
    (location) => `Removed transport header parameter from ${location}`,
  ),
  ...report.requiredBinaryProperties.map(
    (location) => `Marked binary multipart property required on ${location}`,
  ),
]
