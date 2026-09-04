import { defineConfig } from '@hey-api/openapi-ts'

export default defineConfig({
  input: './schemas/openapi.json',
  output: './src/generated',
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
