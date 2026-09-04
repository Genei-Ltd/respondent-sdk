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
        containerName: 'GeneratedRespondentSdk',
        methods: 'instance',
        nesting: 'id',
        strategy: 'single',
      },
    },
    {
      name: 'zod',
      compatibilityVersion: 4,
    },
  ],
})
