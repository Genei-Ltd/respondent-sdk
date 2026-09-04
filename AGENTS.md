# Project Guidelines

This document records the manual steps we expect every agent to perform after
the Respondent SDK client is regenerated (for example, when the provider's
OpenAPI document changes or new endpoints appear). Follow the checklist to keep
the repository consistent.

---

## Toolchain

Development needs **Node 22.18 or newer** (`devEngines.runtime` in
`package.json`): `@hey-api/openapi-ts`, ESLint and Vitest all require it. The
published package still targets Node 18 (`engines.node`), so runtime code must
not use newer APIs — `scripts/**` and `eslint.config.mjs` avoid
`import.meta.dirname` for the same reason.

## Package management with pnpm

This project uses **pnpm**. Always use pnpm instead of npm, Bun or Yarn.

- **Install dependencies**: `pnpm install` / `pnpm add` / `pnpm remove`
- **Run scripts**: `pnpm run <script>`

New dependency versions must be at least seven days old before pnpm will
install them (`minimumReleaseAge` in `pnpm-workspace.yaml`). If a just-released
version fails to resolve, this is why. Do not work around it.

### Key scripts

- `pnpm run schema:update` — the only script that touches the network. Fetches
  the provider's OpenAPI document, normalises it, validates it in memory, then
  replaces `schemas/openapi.json` atomically.
- `pnpm run generate` — validate the vendored document and regenerate
  `src/generated/**` from it. Offline, and reproducible from any commit.
- `pnpm run generate:check` — regenerate into a scratch directory and fail if it
  differs from the committed output.
- `pnpm run schema:validate` — validate the vendored document and check it is
  still in normal form.
- `pnpm run tc` — type-check without emitting.
- `pnpm run lint` — ESLint across the repository.
- `pnpm run test` — Vitest.
- `pnpm run format` / `pnpm run format:write` — Prettier check / fix.
- `pnpm run build` — dual ESM/CJS bundles in `dist/` via tsdown.
- `pnpm run check` — schema validation, `generate:check`, type-check, lint,
  format check, build, then tests. It does not fetch the spec.

---

## After refreshing the schema

- **Review the schema diff**
  - `pnpm run schema:update`, then read the `schemas/openapi.json` diff.
  - Check which normalisations `scripts/normalize-openapi.ts` still reports. If
    the provider fixes a schema, its warning disappears and the workaround can
    be deleted. Every normalisation must stay documented in the README's
    "Known quirks in the provider's spec".
  - Then run `pnpm run generate` and commit the generated output with the spec;
    `generate:check` fails otherwise.

## After regenerating the client

- **Review the generated diff**
  - Inspect `src/generated/**` for new, renamed or removed endpoints and types.
  - Note breaking changes (signature changes, removed fields) so downstream
    wrappers can be updated.

- **Update the `RespondentSdk` wrapper**
  - Make sure the modules (`projects`, `screenerQuestions`, `screenerResponses`,
    `quota`, `webhooks`, `pricing`, `profiles`, `teamRespondents`, `messaging`,
    `lookups`) expose any newly generated operations.
  - Every wrapper operation takes an optional trailing
    `options?: RespondentRequestOptions` and spreads `requestControls(options)`
    into the generated call, so callers can pass an `AbortSignal`.
  - Add a row to `tests/respondentSdkOperations.test.ts` for each new operation.
    That test fails unless the table covers every non-deprecated route in the
    spec exactly once.
  - Adjust method signatures to mirror schema updates (new required properties,
    renamed path params).
  - Copy endpoint docstrings from `src/generated/sdk.gen.ts` into the wrapper
    JSDoc so the surfaced helpers stay documented.
  - Skip endpoints the provider marks deprecated; they stay reachable through
    the generated client.
  - Run `pnpm run tc`. If meaningful behaviour changed, add or update tests.

- **Update the webhook module**
  - `src/webhooks.ts` is hand-written: the provider does not describe webhook
    payloads or the signature scheme in the OpenAPI document.
  - If the provider documents the signing algorithm, replace the allow-list
    comment in `DEFAULT_ALLOWED_SIGNATURE_ALGORITHMS` with the documented value.
  - If a real delivery settles which bytes are signed, say so in the README and
    keep both `verifyWebhookSignatureFromRawBody` and
    `verifyWebhookSignatureFromParsedBody` until it does.
  - If new event types appear on `WebhookEventType`, add matching Zod schemas
    and extend the `WebhookEvent` union.

- **Refresh documentation**
  - Sync `README.md` usage examples and the module list with the wrapper.
  - Record every user-visible change in `CHANGELOG.md`, under `## [Unreleased]`.
    This is where release notes live. A breaking change is marked **Breaking**
    and says what to write instead — no check enforces it, so it is on you.

- **Pre-publish checks**
  - Run `pnpm run check`.
  - Confirm `CHANGELOG.md` describes everything in the release, and move the
    `Unreleased` entries under the new version heading.
  - Confirm package metadata (version, exports) still matches the build output.

---

## Code conventions

- Use `type`, not `interface`.
- Use `import type` for type-only imports.
- No TypeScript enums; prefer union literal types.
- Prefix unused parameters with `_`.
- Prettier formatting: no semicolons, single quotes, trailing commas.
- Never hand-edit `src/generated/**` or `schemas/openapi.json`; change
  `scripts/normalize-openapi.ts` or `openapi-ts.config.ts` and regenerate.
- Never expose the API credentials on an enumerable property; they live in
  `#private` fields, and errors carry a redacted request summary.

Keep this file up to date whenever the workflow changes.
