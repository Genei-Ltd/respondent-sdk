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

- **Breaking.** `RespondentSdkError` is now an abstract base class. It used to
  be the single concrete error, generic over the payload
  (`RespondentSdkError<TPayload>`), carrying `status`, `statusText`, `payload`,
  `response` and the `Request` object. Failures now raise one of four
  subclasses — `RespondentSdkApiError` (non-2xx, and the only one with
  `status` / `payload` / `response`), `RespondentSdkTransportError` (no response
  arrived), `RespondentSdkResponseError` (undecodable body on a success status)
  and `RespondentSdkTimeoutError` (the configured `timeoutMs` elapsed).

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

- Webhook signature digests are accepted only in their canonical base64
  spelling. The padded form carries bits outside the decoded bytes, so `QR==`
  and `QQ==` both decoded to the same digest; only the canonical spelling is
  accepted now.
