# Project Guidelines

This document records the manual steps we expect every agent to perform after
the Respondent SDK client is regenerated (for example, when the provider's
OpenAPI document changes or new endpoints appear). Follow the checklist to keep
the repository consistent.

---

## Package management with pnpm

This project uses **pnpm**. Always use pnpm instead of npm, Bun or Yarn.

- **Install dependencies**: `pnpm install` / `pnpm add` / `pnpm remove`
- **Run scripts**: `pnpm run <script>`

New dependency versions must be at least seven days old before pnpm will
install them (`minimumReleaseAge` in `pnpm-workspace.yaml`). If a just-released
version fails to resolve, this is why. Do not work around it.

### Key scripts

- `pnpm run generate` — fetch the OpenAPI document, validate it, regenerate
  `src/generated/**`, format the result.
- `pnpm run tc` — type-check without emitting.
- `pnpm run lint` — ESLint across the repository.
- `pnpm run test` — Vitest.
- `pnpm run format` / `pnpm run format:write` — Prettier check / fix.
- `pnpm run build` — dual ESM/CJS bundles in `dist/` via tsdown.
- `pnpm run check` — everything above, in the order used before publishing.

---

## After regenerating the client

- **Review the generated diff**
  - Inspect `src/generated/**` for new, renamed or removed endpoints and types.
  - Note breaking changes (signature changes, removed fields) so downstream
    wrappers can be updated.
  - Check whether `scripts/fetch-openapi.ts` still reports the same
    `"default": null` normalisations. If the provider fixed those schemas, the
    warning disappears and the workaround can be removed.

- **Update the `RespondentSdk` wrapper**
  - Make sure the modules (`projects`, `screenerQuestions`, `screenerResponses`,
    `quota`, `webhooks`, `pricing`, `profiles`, `teamRespondents`, `messaging`,
    `lookups`) expose any newly generated operations.
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
  - If new event types appear on `WebhookEventType`, add matching Zod schemas
    and extend the `WebhookEvent` union.

- **Refresh documentation**
  - Sync `README.md` usage examples and the module list with the wrapper.
  - Record breaking changes in the release notes.

- **Pre-publish checks**
  - Run `pnpm run check`.
  - Confirm package metadata (version, exports) still matches the build output.

---

## Code conventions

- Use `type`, not `interface`.
- Use `import type` for type-only imports.
- No TypeScript enums; prefer union literal types.
- Prefix unused parameters with `_`.
- Prettier formatting: no semicolons, single quotes, trailing commas.
- Never hand-edit `src/generated/**`; change the generator config or the fetch
  script instead.

Keep this file up to date whenever the workflow changes.
