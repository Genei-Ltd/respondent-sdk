# Changelog

Every user-visible change goes here, newest first. Breaking changes are marked
**Breaking** and say what to write instead.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and
this package follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

The package has not been published yet, so these changes ship as part of the
first release and carry no compatibility shims. They are recorded because the
repository's own consumers track `main`.

### Changed

- **Breaking.** `RespondentSdkApiError` and `RespondentSdkResponseError` no
  longer carry the `Response`. A `Response`'s headers are written by the server
  and by every hop in between, so an error holding one could reproduce a
  credential a proxy echoed back. They expose `status`, `statusText` and a
  `responseHeaders` map instead, which keeps only a short allow-list of header
  names — `retry-after`, the rate-limit headers, `content-type`, `date` and the
  request-id headers — with the API key and secret scrubbed out of their values.
  Every other header is dropped, name included, because a header name is
  server-controlled too.

  Migration: read `error.status` and `error.statusText` directly, and
  `error.responseHeaders['retry-after']` in place of
  `error.response.headers.get('retry-after')`. The response body is still on
  `error.payload`.

- **Breaking.** The generated client is no longer a class.
  `GeneratedRespondentSdk` is gone; every operation is exported as a standalone
  function taking the client as an argument. The class carried a public static
  registry of every instance ever constructed, so
  `GeneratedRespondentSdk.__registry.get().client.getConfig().headers` returned
  `x-api-key` and `x-api-secret` in plain text to any caller.

  Migration: `new GeneratedRespondentSdk({ client }).getV1Projects(options)`
  becomes `getV1Projects({ client, ...options })`, importing the operation by
  name from the package root. `RespondentSdk` is unaffected.

- **Breaking.** `RespondentSdk` rejects a `timeoutMs` above `2_147_483_647`
  (about 24.8 days). `setTimeout` wraps a longer delay round to 1ms, so such a
  deadline aborted every request almost immediately instead of never firing.

- **Breaking.** `RespondentSdkError` is now an abstract base class. It used to
  be the single concrete error, generic over the payload
  (`RespondentSdkError<TPayload>`), carrying `status`, `statusText`, `payload`,
  `response` and the `Request` object. Failures now raise one of four
  subclasses — `RespondentSdkApiError` (non-2xx, and the only one with
  `payload`), `RespondentSdkTransportError` (no response arrived),
  `RespondentSdkResponseError` (undecodable body on a success status) and
  `RespondentSdkTimeoutError` (the configured `timeoutMs` elapsed).

  Migration: stop constructing or instantiating `RespondentSdkError`, and stop
  reading `status` off it. Catch with `isRespondentSdkError(error)` and narrow
  with `isRespondentSdkApiError` / `isRespondentSdkTransportError` /
  `isRespondentSdkResponseError` / `isRespondentSdkTimeoutError` before reading
  fields. `error.request` is now a redacted summary (`url`, `method`,
  `headers`), not a `Request`: it never holds the API credentials.

- **Breaking.** `verifyWebhookSignature` is replaced by two functions that each
  name the bytes they hash: `verifyWebhookSignatureFromRawBody({ rawBody, ... })`
  and `verifyWebhookSignatureFromParsedBody({ parsedBody, ... })`. The old
  function took one `payload` of `string | Uint8Array | object` and silently
  `JSON.stringify`-ed an object, which implied the two readings were
  interchangeable. The provider does not document which bytes it signs, so they
  are not.

  Migration: pass the wire bytes to `verifyWebhookSignatureFromRawBody` — read
  the body before any JSON parsing. Use
  `verifyWebhookSignatureFromParsedBody` only if a captured delivery shows the
  provider's `JSON.stringify` form is the one that verifies. Every other option
  (`signatureHeader`, `privateKey`, `allowedAlgorithms`) is unchanged.

- **Breaking.** `verifyAndDedupeWebhook` takes `claimAndStore` in place of
  `recordDelivery`, and its accepted outcome is `status: 'stored'` rather than
  `status: 'accepted'`. `recordDelivery(uuid)` returned a boolean and recorded
  the id alone; a caller that processed the event afterwards and threw lost the
  delivery, because the id was already claimed and every retry read as a
  duplicate.

  Migration: `claimAndStore(event)` receives the whole parsed event and returns
  `'stored'` or `'duplicate'`. Persist the event and claim its `uuid` in one
  atomic commit — an inbox row, or an enqueue inside the claiming transaction —
  then answer 2xx and do the business work from that stored record, with its own
  retries. Claiming the `uuid` is not "processed". The README's webhook section
  shows the whole handler.

### Added

- `WebhookDeliveryClaim` and `WebhookDeliveryStore` types for the
  `claimAndStore` callback, replacing `WebhookDeliveryRecorder`.

### Fixed

- Errors are scrubbed of the API key and secret. Allow-listed response header
  values, `statusText`, and the payload — along with the message, code and
  detail read back out of it — all have any occurrence of either credential
  replaced with `[redacted]`. An upstream that reflects `x-api-key` into
  `X-Request-Id` or into an error message can no longer put it on a normal,
  loggable error.

- `verifyAndDedupeWebhook` decodes a `Uint8Array` body with fatal UTF-8
  validation. The lenient decoder substituted U+FFFD for an invalid sequence,
  `JSON.parse` accepted the repaired text, and the event handed to
  `claimAndStore` was one the provider never sent. Such a body is now reported
  as `malformed_body`.

- Webhook signature digests are accepted only in their canonical base64
  spelling. The padded form carries bits outside the decoded bytes, so `QR==`
  and `QQ==` both decoded to the same digest; only the canonical spelling is
  accepted now.
