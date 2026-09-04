# Maintainer Guide

Follow this workflow whenever the SDK surface changes or the provider ships new
endpoints:

1. Run `pnpm run generate` to refresh `schemas/openapi.json` and
   `src/generated/**`. The script fetches the provider's OpenAPI document,
   validates it, regenerates the client and Zod schemas, then formats the
   output.
2. Read the generated diff, then follow the checklist in `AGENTS.md` to update
   the `RespondentSdk` wrapper, the docs and the tests.
3. Verify:
   ```zsh
   pnpm run check
   ```
   That runs schema validation, type-check, lint, format check, tests and build.
4. Publish:
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
