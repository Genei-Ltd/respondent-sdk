# Maintainer Guide

Development needs **Node 22.18 or newer** (`devEngines.runtime` in
`package.json`); `@hey-api/openapi-ts`, ESLint and Vitest all require it. The
published package targets Node 18 (`engines.node`).

Follow this workflow whenever the SDK surface changes or the provider ships new
endpoints:

1. Run `pnpm run schema:update` to refresh `schemas/openapi.json`. It is the
   only script that touches the network: it fetches the provider's document,
   normalises it (see `scripts/normalize-openapi.ts`), validates it in memory,
   and only then replaces the vendored file, atomically.
2. Run `pnpm run generate` to regenerate the client and Zod schemas from the
   vendored document. Generation never fetches, so any commit regenerates
   byte-identical output.
3. Read both diffs, then follow the checklist in `AGENTS.md` to update the
   `RespondentSdk` wrapper, the docs and the tests.
4. Verify:
   ```zsh
   pnpm run check
   ```
   That runs schema validation, `generate:check`, type-check, lint, format
   check, build and tests.
5. Publish:
   - Update the version (`pnpm version <patch|minor|major>`).
   - Push the version commit and tag (`git push && git push --tags`).
   - `pnpm publish` when you are ready to release.

## Version guidelines

- **patch**: bug fixes, documentation updates.
- **minor**: new endpoints, non-breaking wrapper changes.
- **major**: breaking changes to the wrapper surface.

## Supply-chain policy

`pnpm-workspace.yaml` sets `minimumReleaseAge`, so pnpm refuses dependency
versions published in the last seven days. If a fresh release fails to resolve,
that is why. Do not work around it.
