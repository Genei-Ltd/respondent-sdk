# @coloop-ai/respondent-sdk

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://github.com/Genei-Ltd/respondent-sdk/blob/main/LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-blue?logo=typescript)](https://www.typescriptlang.org/)

Type-safe client bindings for the [Respondent.io](https://www.respondent.io/)
Partner API. Operations are generated from the provider's OpenAPI document and
wrapped in an ergonomic SDK.

> ⚠️ This project is maintained by CoLoop and is not affiliated with or endorsed
> by Respondent.io — review their API terms before use.

## Installation

```bash
pnpm add @coloop-ai/respondent-sdk
```

`zod` is a runtime dependency (`^3.25.0 || ^4.0.0`); the webhook schemas and the
generated Zod schemas import from `zod/v4`.

## Quick start

```ts
import { RespondentSdk } from '@coloop-ai/respondent-sdk'

const respondent = new RespondentSdk({
  apiKey: process.env.RESPONDENT_API_KEY!, // sent as x-api-key
  apiSecret: process.env.RESPONDENT_API_SECRET!, // sent as x-api-secret
  timeoutMs: 10_000, // abort requests that hang for 10s
})

const project = await respondent.projects.create({
  publicTitle: 'Coffee habits study',
  publicInternalName: 'coffee-habits-q1',
  targetMarketType: 'b2c',
  typeOfResearch: 'remote',
  targetResearchMethodology: 'oneOnOne',
  participantTimeRequiredMinutes: 30,
  incentiveAmount: 50,
  targetNumberOfParticipants: 5,
  externalResearcher: {
    researcherId: 'researcher-1',
    researcherName: 'Ada Lovelace',
    bookingUrl: 'https://example.com/book',
  },
  targetProjectTopics: [topicId],
})

await respondent.screenerQuestions.create(project.id, {
  text: 'How often do you drink coffee?',
  questionType: 'radio',
  answers: [
    { text: 'Daily', answerValue: 1 }, // 1 qualifies
    { text: 'Never', answerValue: 2 }, // 2 disqualifies
  ],
})

await respondent.projects.publish(project.id)
```

Then walk each applicant through the recruitment lifecycle:

```ts
const responses = await respondent.screenerResponses.list(project.id, {
  status: 'PENDING',
})

for (const response of responses.results ?? []) {
  await respondent.screenerResponses.qualify(project.id, response.id, {
    qualifyStatus: true,
    qualifiedOverriden: false,
    disqualifyReasons: [],
    message: '',
  })

  await respondent.screenerResponses.invite(project.id, response.id, {
    meetingLink: 'https://example.com/session',
    bookingLink: 'https://example.com/book',
  })
}

// Only after the session has actually happened — this starts the payment.
await respondent.screenerResponses.markAttended(project.id, responseId)
```

A runnable version lives in [`examples/recruit-participants-demo.ts`](./examples/recruit-participants-demo.ts).

## Environments

| Environment | Base URL                            |
| ----------- | ----------------------------------- |
| Production  | `https://api.respondent.io`         |
| Staging     | `https://api-staging.respondent.io` |

Production is the default. Target staging by passing the exported constant:

```ts
import {
  RESPONDENT_STAGING_BASE_URL,
  RespondentSdk,
} from '@coloop-ai/respondent-sdk'

const respondent = new RespondentSdk({
  apiKey: process.env.RESPONDENT_STAGING_API_KEY!,
  apiSecret: process.env.RESPONDENT_STAGING_API_SECRET!,
  baseUrl: RESPONDENT_STAGING_BASE_URL,
})
```

Staging and production are separate worlds: separate credentials, separate
webhooks, and **different lookup IDs** for industries, skills, topics and job
titles. Resolve lookup IDs at runtime with `respondent.lookups.*` instead of
hardcoding them.

The provider's OpenAPI document only declares the staging server. The production
URL comes from
[their docs](https://developers.respondent.io/reference/introduction-1), and the
generated client's default is pinned to production in `openapi-ts.config.ts`.

## Authentication

Every request carries two headers, `x-api-key` (Client ID) and `x-api-secret`
(Client Secret). Credentials are issued by the Respondent Partner team; they are
not self-serve, and production access requires a reviewed staging demo and a
signed MSA. There is no OAuth flow and no documented scope model.

## Error handling

Every helper raises a `RespondentSdkError` when the API responds with a non-2xx
status. The error exposes the HTTP status, the parsed payload, and the original
request/response objects:

```ts
import { RespondentSdk, isRespondentSdkError } from '@coloop-ai/respondent-sdk'

try {
  await respondent.projects.close(projectId, {})
} catch (error) {
  if (!isRespondentSdkError(error)) throw error

  if (error.status === 429) {
    console.warn('Respondent throttled request', error.payload)
    return
  }

  throw new Error(
    `Failed to close project (${String(error.status)}): ${error.message}`,
  )
}
```

The provider does not document an error response schema, and their OpenAPI
document declares no error bodies. `RespondentSdkError` therefore probes the
`error`, `message` and `detail` fields for a human-readable message and falls
back to the HTTP status line. `error.payload` always holds the raw body.

Rate limits are documented as 250 requests/second (burst 500, 1,000,000/day) in
production and 50 requests/second (burst 100, 200,000/day) in staging. The 429
response body and any `Retry-After` header are undocumented.

## Request timeouts

Set `timeoutMs` to abort requests that exceed a duration. The SDK rejects with a
`RespondentSdkTimeoutError`, which you can treat as retryable:

```ts
import {
  RespondentSdk,
  RespondentSdkTimeoutError,
} from '@coloop-ai/respondent-sdk'

const respondent = new RespondentSdk({
  apiKey: process.env.RESPONDENT_API_KEY!,
  apiSecret: process.env.RESPONDENT_API_SECRET!,
  timeoutMs: 5_000,
})

try {
  await respondent.projects.list()
} catch (error) {
  if (error instanceof RespondentSdkTimeoutError) {
    console.warn('Respondent request timed out, retrying shortly')
  }
}
```

## Pagination

List endpoints take `page` (default `1`), `pageSize` (default `50`) and
`includeCount` (default `false`), and return `{ totalResults?, page, pageSize, results }`.
`totalResults` is only present when you pass `includeCount: true`.

## High-level methods

`RespondentSdk` groups operations into modules:

- `respondent.projects` — `list`, `create`, `retrieve`, `update`, `delete`,
  `copy`, `publish`, `pause`, `close`, `audienceSizeEstimate`,
  `replaceExternalScreenerQuestions`, `uploadFile`, `pitchSuggestions`.
- `respondent.screenerQuestions` — `list`, `create`, `replaceAll`, `retrieve`,
  `update`, `delete`, `reorder`.
- `respondent.screenerResponses` — `list`, `retrieve`, `payoutSummary`,
  `qualify`, `invite`, `schedule`, `markAttended`, `markNoShow`, `reject`,
  `report`, `favorite`, `hide`, `cancelInvite`, `cancelBooking`,
  `cancelBookingAndReinvite`, `participantCancelBooking`,
  `ingestExternalScreenerAnswers`, `payout`.
- `respondent.quota` — `create`, `retrieve`, `update`, `delete`.
- `respondent.webhooks` — `list`, `create`, `retrieve`, `deactivate`,
  `listEventTypes`, `simulate`.
- `respondent.pricing` — `balanceSummary`.
- `respondent.profiles` — `retrieve`, `createTestParticipant` (staging only).
- `respondent.teamRespondents` — `list`, `retrieve`, `batchInvite`.
- `respondent.messaging` — `conversations` (`list`, `create`, `retrieve`,
  `update`, `markAsRead`, `addParticipant`, `removeParticipant`) and `messages`
  (`list`, `retrieve`, `inbox`, `create`). Convenience delegates
  (`listConversations`, `createConversation`, `listMessages`, `createMessage`,
  `inbox`) sit on the module itself.
- `respondent.lookups` — `values`, `industries`, `jobTitles`, `skills`,
  `topics`.

Endpoints the provider marks deprecated (`GET /v1/teams/{teamId}/projects`,
`POST /v1/messaging/messages`, the team-scoped inbox, and the deprecated
add-participant route) are not wrapped. They remain reachable through the
generated client.

## Webhooks

Webhook payloads and the signature scheme are not in the provider's OpenAPI
document, so `@coloop-ai/respondent-sdk/webhooks` hand-models them with Zod, and
adds signature verification.

```ts
import {
  WebhookEvent,
  getWebhookSignatureHeader,
  verifyWebhookSignature,
} from '@coloop-ai/respondent-sdk/webhooks'

export async function handleWebhook(request: Request) {
  // Verify against the RAW body, before any JSON parsing.
  const rawBody = await request.text()

  const valid = verifyWebhookSignature({
    payload: rawBody,
    signatureHeader: getWebhookSignatureHeader(request.headers),
    privateKey: process.env.RESPONDENT_WEBHOOK_PRIVATE_KEY!,
  })

  if (!valid) {
    return new Response('Forbidden', { status: 403 })
  }

  const parsed = WebhookEvent.safeParse(JSON.parse(rawBody))
  if (!parsed.success) {
    console.warn('Unhandled webhook payload', parsed.error)
    return new Response('OK')
  }

  switch (parsed.data.event) {
    case 'SCREENER_RESPONSES.CREATED': {
      const { id, projectId } = parsed.data.payload.resource
      // Payloads carry IDs only — fetch the response to read it.
      const response = await respondent.screenerResponses.retrieve(
        projectId,
        id,
      )
      break
    }
    case 'PROJECTS.UPDATED': {
      console.log(parsed.data.payload.resource.updatedFields)
      break
    }
  }

  return new Response('OK')
}
```

The five event types are `PROJECTS.UPDATED`, `SCREENER_RESPONSES.CREATED`,
`SCREENER_RESPONSES.UPDATED`, `MESSAGES.CREATED` and `CONVERSATIONS.CREATED`.
`WebhookEvent` doubles as the discriminated-union type
(`import type { WebhookEvent }`) and the union validator
(`WebhookEvent.safeParse`). Every event schema is a loose object, so fields the
provider adds later are preserved rather than stripped.
`UnknownWebhookEvent` accepts event types this SDK does not model yet.

### What the provider documents, and what it does not

The `privateKey` used for signing is returned by `POST /v1/webhooks` (and by
`GET /v1/webhooks`). The provider's
[only signing sample](https://developers.respondent.io/docs/Webhooks/webhooks)
shows an HMAC over the body, base64-encoded, delivered in the
`Respondent-Webhook-Signature` header as `<algorithm>=<signature>`.

Three gaps matter:

1. **The hash algorithm is not documented.** Their sample parses the algorithm
   out of the header value itself and publishes no example header. Because the
   header is attacker-controlled, `verifyWebhookSignature` only accepts
   algorithms on an allow list (`sha256`, `sha512` by default). Widen it with
   `allowedAlgorithms` once the provider confirms which one they send.
2. **They sign `JSON.stringify(body)`, not a documented raw body.** Pass the raw
   body you received; that is byte-exact by construction. Passing an object is
   supported for convenience and re-serialises with `JSON.stringify`, which only
   matches if your serialisation is byte-identical to theirs.
3. **There is no timestamp header and no replay protection.** Deduplicate on the
   `uuid` field of the event body yourself.

Other operational facts: each team has exactly one active webhook, events fire
only for projects created via the API, you must return 2xx within 3 seconds, and
failures are retried up to five times at ten-minute intervals. Webhooks
configured in staging do not carry over to production.

## Generated Zod schemas

Every OpenAPI component schema is also emitted as a Zod schema under
`@coloop-ai/respondent-sdk/zod`, named `z<SchemaName>`. Use them to compose the
provider's enums into your own schemas:

```ts
import * as z from 'zod/v4'
import { zGender, zScreenerResponseStatus } from '@coloop-ai/respondent-sdk/zod'

const Participant = z.object({
  gender: zGender,
  status: zScreenerResponseStatus,
})
```

The generated file imports from `zod/v4`, which resolves on both `zod@3.25+`
and `zod@4`.

## Generated client access

If you need full control over request options, work with the generated client
directly:

```ts
import { GeneratedRespondentSdk, sdk } from '@coloop-ai/respondent-sdk'

const client = sdk.createClient({
  baseUrl: 'https://api.respondent.io',
  headers: {
    'x-api-key': process.env.RESPONDENT_API_KEY!,
    'x-api-secret': process.env.RESPONDENT_API_SECRET!,
  },
  responseStyle: 'body',
})

const raw = new GeneratedRespondentSdk({ client })
const response = await raw.getV1Projects({
  headers: {
    'x-api-key': process.env.RESPONDENT_API_KEY!,
    'x-api-secret': process.env.RESPONDENT_API_SECRET!,
  },
  query: { status: 'DRAFT' },
})
```

The provider declares `x-api-key` and `x-api-secret` as required header
parameters on every operation rather than as an OpenAPI security scheme, so the
generated types require them per call even when the client already sets them.

All request/response types are exported from `@coloop-ai/respondent-sdk`.

## Known quirks in the provider's spec

Recorded here so they are not mistaken for SDK bugs:

- `CreateB2cProjectDto.targetGenders` / `CreateB2bProjectDto.targetGenders` is a
  single `Gender`, while every other demographic target
  (`targetEthnicities`, `targetAgeGroups`, `targetEducation`,
  `targetHouseholdIncome`) is an array. The plural name is misleading.
- `QualifyScreenerResponseDto` marks all four fields required, including the
  misspelled `qualifiedOverriden` and the `disqualifyReasons` / `message` fields
  that only apply when disqualifying.
- `ProfileLocation.zipcode` and `ScreenerResponseInvitation.message` declare
  `"type": "string"` with `"default": null`. `scripts/fetch-openapi.ts` strips
  those defaults during vendoring — without that the Zod generator emits code
  that does not compile — and logs each removal.
- `ScreenerResponsesPaginatedDto` does not mark `results` required, while the
  other paginated DTOs do, so `response.results` is optional there alone.
- `PUT /v1/projects/{projectId}/files/form-data` declares `Content-Type` and
  `Content-Length` as required header parameters, so `projects.uploadFile`
  requires you to pass them.
- The document declares no security scheme, no error schemas and no 429
  responses, and its `servers` block lists staging only.

## Scripts

- `pnpm run generate` – fetch and validate the spec, regenerate
  `src/generated/**`.
- `pnpm run tc` – type-check without emitting.
- `pnpm run lint` – ESLint across the repository.
- `pnpm run test` – Vitest.
- `pnpm run format` – Prettier check.
- `pnpm run build` – dual ESM/CJS bundles in `dist/` via tsdown.
- `pnpm run check` – all of the above, in publish order.

## License

Released under the MIT License. See `LICENSE` for details.
