import { defineConfig } from '@hey-api/openapi-ts'

export default defineConfig({
  // The vendored document is the only input, so generation is reproducible and
  // offline. `pnpm run schema:update` is the only thing that refreshes it.
  input: './schemas/openapi.json',
  // `scripts/generate-check.sh` points this at a scratch directory so it can
  // diff the regenerated output against the committed one.
  output: process.env.RESPONDENT_GENERATED_OUTPUT ?? './src/generated',
  plugins: [
    '@hey-api/typescript',
    {
      name: '@hey-api/client-fetch',
      // The provider's spec only declares the staging server, so pin the
      // generated client's default to production explicitly.
      baseUrl: 'https://api.respondent.io',
    },
    {
      client: '@hey-api/client-fetch',
      name: '@hey-api/sdk',
      operations: {
        // Flat functions, not an instance class. The class strategies emit a
        // public static registry of every instance ever constructed, and each
        // instance holds its configured client, so reading
        // `client.getConfig().headers` off a registered instance hands any
        // caller `x-api-key` and `x-api-secret` in plain text. Flat functions
        // take the client as an argument, so the configured one never leaves a
        // `#private` field.
        nesting: 'id',
        strategy: 'flat',
      },
    },
    {
      name: 'zod',
      compatibilityVersion: 4,
    },
  ],
})
