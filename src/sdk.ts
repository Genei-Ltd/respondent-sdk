import { type Client, createClient } from './generated/client'
import {
  deleteV1MessagingConversationsByConversationUidParticipantsByParticipantUserId,
  deleteV1ProjectsByProjectId,
  deleteV1ProjectsByProjectIdQuota,
  deleteV1ProjectsByProjectIdScreenerQuestionsByScreenerQuestionId,
  deleteV1WebhooksByWebhookId,
  getV1Industries,
  getV1JobTitles,
  getV1Lookups,
  getV1MessagingConversations,
  getV1MessagingConversationsByConversationUid,
  getV1MessagingMessages,
  getV1MessagingMessagesByMessageUid,
  getV1MessagingMessagesInbox,
  getV1PricingBalancesSummary,
  getV1ProfilesByProfileId,
  getV1Projects,
  getV1ProjectsByProjectId,
  getV1ProjectsByProjectIdFeasibilityAudienceSizeEstimate,
  getV1ProjectsByProjectIdQuota,
  getV1ProjectsByProjectIdScreenerQuestions,
  getV1ProjectsByProjectIdScreenerQuestionsByScreenerQuestionId,
  getV1ProjectsByProjectIdScreenerResponses,
  getV1ProjectsByProjectIdScreenerResponsesByScreenerResponseId,
  getV1ProjectsByProjectIdScreenerResponsesPayouts,
  getV1Skills,
  getV1TeamRespondents,
  getV1TeamRespondentsProfilesByProfileId,
  getV1Topics,
  getV1Webhooks,
  getV1WebhooksByWebhookId,
  getV1WebhooksByWebhookIdEventTypes,
  patchV1MessagingConversationsByConversationUid,
  patchV1MessagingConversationsByConversationUidRead,
  patchV1ProjectsByProjectId,
  patchV1ProjectsByProjectIdClose,
  patchV1ProjectsByProjectIdPause,
  patchV1ProjectsByProjectIdPublish,
  patchV1ProjectsByProjectIdQuota,
  patchV1ProjectsByProjectIdScreenerQuestionsByScreenerQuestionId,
  patchV1ProjectsByProjectIdScreenerQuestionsOrder,
  patchV1ProjectsByProjectIdScreenerResponsesByScreenerResponseIdAttended,
  patchV1ProjectsByProjectIdScreenerResponsesByScreenerResponseIdCancelBooking,
  patchV1ProjectsByProjectIdScreenerResponsesByScreenerResponseIdCancelBookingReinvite,
  patchV1ProjectsByProjectIdScreenerResponsesByScreenerResponseIdCancelInvite,
  patchV1ProjectsByProjectIdScreenerResponsesByScreenerResponseIdFavorite,
  patchV1ProjectsByProjectIdScreenerResponsesByScreenerResponseIdHide,
  patchV1ProjectsByProjectIdScreenerResponsesByScreenerResponseIdInvite,
  patchV1ProjectsByProjectIdScreenerResponsesByScreenerResponseIdNoShow,
  patchV1ProjectsByProjectIdScreenerResponsesByScreenerResponseIdParticipantCancelBooking,
  patchV1ProjectsByProjectIdScreenerResponsesByScreenerResponseIdQualify,
  patchV1ProjectsByProjectIdScreenerResponsesByScreenerResponseIdReject,
  patchV1ProjectsByProjectIdScreenerResponsesByScreenerResponseIdReport,
  patchV1ProjectsByProjectIdScreenerResponsesByScreenerResponseIdSchedule,
  postV1MessagingConversations,
  postV1MessagingConversationsByConversationUidMessages,
  postV1MessagingConversationsByConversationUidParticipants,
  postV1Profiles,
  postV1Projects,
  postV1ProjectsByProjectIdCopy,
  postV1ProjectsByProjectIdQuota,
  postV1ProjectsByProjectIdScreenerQuestions,
  postV1ProjectsByProjectIdScreenerResponsesByScreenerResponseIdExternalScreenerAnswers,
  postV1ProjectsByProjectIdScreenerResponsesByScreenerResponseIdPayouts,
  postV1ProjectsSuggestions,
  postV1Webhooks,
  postV1WebhooksByWebhookIdSimulate,
  putV1ProjectsByProjectIdExternalScreenerQuestionsBulk,
  putV1ProjectsByProjectIdFilesFormData,
  putV1ProjectsByProjectIdScreenerQuestionsBulk,
  putV1TeamRespondentsBatchInvite,
} from './generated/sdk.gen'
import type {
  DeleteV1MessagingConversationsByConversationUidParticipantsByParticipantUserIdResponse,
  DeleteV1ProjectsByProjectIdQuotaResponse,
  DeleteV1ProjectsByProjectIdScreenerQuestionsByScreenerQuestionIdResponse,
  GetV1IndustriesData,
  GetV1IndustriesResponse,
  GetV1JobTitlesData,
  GetV1JobTitlesResponse,
  GetV1LookupsData,
  GetV1LookupsResponse,
  GetV1MessagingConversationsByConversationUidResponse,
  GetV1MessagingConversationsData,
  GetV1MessagingConversationsResponse,
  GetV1MessagingMessagesByMessageUidResponse,
  GetV1MessagingMessagesData,
  GetV1MessagingMessagesInboxData,
  GetV1MessagingMessagesInboxResponse,
  GetV1MessagingMessagesResponse,
  GetV1PricingBalancesSummaryResponse,
  GetV1ProfilesByProfileIdResponse,
  GetV1ProjectsByProjectIdFeasibilityAudienceSizeEstimateResponse,
  GetV1ProjectsByProjectIdQuotaResponse,
  GetV1ProjectsByProjectIdResponse,
  GetV1ProjectsByProjectIdScreenerQuestionsByScreenerQuestionIdResponse,
  GetV1ProjectsByProjectIdScreenerQuestionsResponse,
  GetV1ProjectsByProjectIdScreenerResponsesByScreenerResponseIdResponse,
  GetV1ProjectsByProjectIdScreenerResponsesData,
  GetV1ProjectsByProjectIdScreenerResponsesPayoutsResponse,
  GetV1ProjectsByProjectIdScreenerResponsesResponse,
  GetV1ProjectsData,
  GetV1ProjectsResponse,
  GetV1SkillsData,
  GetV1SkillsResponse,
  GetV1TeamRespondentsData,
  GetV1TeamRespondentsProfilesByProfileIdResponse,
  GetV1TeamRespondentsResponse,
  GetV1TopicsData,
  GetV1TopicsResponse,
  GetV1WebhooksByWebhookIdEventTypesResponse,
  GetV1WebhooksByWebhookIdResponse,
  GetV1WebhooksResponse,
  PatchV1MessagingConversationsByConversationUidData,
  PatchV1MessagingConversationsByConversationUidReadResponse,
  PatchV1MessagingConversationsByConversationUidResponse,
  PatchV1ProjectsByProjectIdCloseData,
  PatchV1ProjectsByProjectIdCloseResponse,
  PatchV1ProjectsByProjectIdData,
  PatchV1ProjectsByProjectIdPauseData,
  PatchV1ProjectsByProjectIdPauseResponse,
  PatchV1ProjectsByProjectIdPublishResponse,
  PatchV1ProjectsByProjectIdQuotaData,
  PatchV1ProjectsByProjectIdQuotaResponse,
  PatchV1ProjectsByProjectIdResponse,
  PatchV1ProjectsByProjectIdScreenerQuestionsByScreenerQuestionIdData,
  PatchV1ProjectsByProjectIdScreenerQuestionsByScreenerQuestionIdResponse,
  PatchV1ProjectsByProjectIdScreenerQuestionsOrderData,
  PatchV1ProjectsByProjectIdScreenerQuestionsOrderResponse,
  PatchV1ProjectsByProjectIdScreenerResponsesByScreenerResponseIdAttendedResponse,
  PatchV1ProjectsByProjectIdScreenerResponsesByScreenerResponseIdCancelBookingReinviteData,
  PatchV1ProjectsByProjectIdScreenerResponsesByScreenerResponseIdCancelBookingReinviteResponse,
  PatchV1ProjectsByProjectIdScreenerResponsesByScreenerResponseIdCancelBookingResponse,
  PatchV1ProjectsByProjectIdScreenerResponsesByScreenerResponseIdCancelInviteResponse,
  PatchV1ProjectsByProjectIdScreenerResponsesByScreenerResponseIdFavoriteData,
  PatchV1ProjectsByProjectIdScreenerResponsesByScreenerResponseIdFavoriteResponse,
  PatchV1ProjectsByProjectIdScreenerResponsesByScreenerResponseIdHideData,
  PatchV1ProjectsByProjectIdScreenerResponsesByScreenerResponseIdHideResponse,
  PatchV1ProjectsByProjectIdScreenerResponsesByScreenerResponseIdInviteData,
  PatchV1ProjectsByProjectIdScreenerResponsesByScreenerResponseIdInviteResponse,
  PatchV1ProjectsByProjectIdScreenerResponsesByScreenerResponseIdNoShowResponse,
  PatchV1ProjectsByProjectIdScreenerResponsesByScreenerResponseIdParticipantCancelBookingData,
  PatchV1ProjectsByProjectIdScreenerResponsesByScreenerResponseIdParticipantCancelBookingResponse,
  PatchV1ProjectsByProjectIdScreenerResponsesByScreenerResponseIdQualifyData,
  PatchV1ProjectsByProjectIdScreenerResponsesByScreenerResponseIdQualifyResponse,
  PatchV1ProjectsByProjectIdScreenerResponsesByScreenerResponseIdRejectResponse,
  PatchV1ProjectsByProjectIdScreenerResponsesByScreenerResponseIdReportData,
  PatchV1ProjectsByProjectIdScreenerResponsesByScreenerResponseIdReportResponse,
  PatchV1ProjectsByProjectIdScreenerResponsesByScreenerResponseIdScheduleData,
  PatchV1ProjectsByProjectIdScreenerResponsesByScreenerResponseIdScheduleResponse,
  PostV1MessagingConversationsByConversationUidMessagesData,
  PostV1MessagingConversationsByConversationUidMessagesResponse,
  PostV1MessagingConversationsByConversationUidParticipantsData,
  PostV1MessagingConversationsData,
  PostV1MessagingConversationsResponse,
  PostV1ProfilesData,
  PostV1ProjectsByProjectIdCopyResponse,
  PostV1ProjectsByProjectIdQuotaData,
  PostV1ProjectsByProjectIdQuotaResponse,
  PostV1ProjectsByProjectIdScreenerQuestionsData,
  PostV1ProjectsByProjectIdScreenerQuestionsResponse,
  PostV1ProjectsByProjectIdScreenerResponsesByScreenerResponseIdExternalScreenerAnswersData,
  PostV1ProjectsByProjectIdScreenerResponsesByScreenerResponseIdExternalScreenerAnswersResponse,
  PostV1ProjectsByProjectIdScreenerResponsesByScreenerResponseIdPayoutsData,
  PostV1ProjectsData,
  PostV1ProjectsResponse,
  PostV1ProjectsSuggestionsData,
  PostV1ProjectsSuggestionsResponse,
  PostV1WebhooksByWebhookIdSimulateData,
  PostV1WebhooksData,
  PostV1WebhooksResponse,
  PutV1ProjectsByProjectIdExternalScreenerQuestionsBulkData,
  PutV1ProjectsByProjectIdExternalScreenerQuestionsBulkResponse,
  PutV1ProjectsByProjectIdFilesFormDataData,
  PutV1ProjectsByProjectIdFilesFormDataResponse,
  PutV1ProjectsByProjectIdScreenerQuestionsBulkData,
  PutV1ProjectsByProjectIdScreenerQuestionsBulkResponse,
  PutV1TeamRespondentsBatchInviteData,
  PutV1TeamRespondentsBatchInviteResponse,
} from './generated/types.gen'
import {
  RespondentSdkApiError,
  RespondentSdkResponseError,
  RespondentSdkTimeoutError,
  RespondentSdkTransportError,
  isRespondentSdkError,
  redactCredentials,
  redactPayload,
  summarizeRequest,
  summarizeResponseHeaders,
} from './errors'

/**
 * Production base URL for the Partner API.
 *
 * The provider's OpenAPI document only declares the staging server, so this
 * value comes from the docs.
 *
 * @see https://developers.respondent.io/reference/introduction-1
 */
export const RESPONDENT_PRODUCTION_BASE_URL = 'https://api.respondent.io'

/**
 * Staging base URL for the Partner API. Staging is a separate environment with
 * its own credentials, its own webhooks and its own lookup IDs.
 *
 * @see https://developers.respondent.io/reference/staging-vs-production
 */
export const RESPONDENT_STAGING_BASE_URL = 'https://api-staging.respondent.io'

const API_KEY_HEADER_NAME = 'x-api-key'
const API_SECRET_HEADER_NAME = 'x-api-secret'

/**
 * The largest delay `setTimeout` honours. A longer delay wraps round to 1ms in
 * Node and in browsers, so a caller asking for a very long deadline would have
 * every request aborted almost at once. Rejected at construction instead.
 */
const MAX_TIMEOUT_MS = 2_147_483_647

/**
 * Every module declares its own `readonly #client` and `readonly #headers`.
 * They are ECMAScript private fields, so they are neither enumerable nor
 * reachable by reflection, and no accessor exposes them: logging or serialising
 * a `RespondentSdk`, or any of its modules, cannot print the API key and
 * secret. A shared base class cannot hold them, because a `protected` getter is
 * only private to the type-checker and is an ordinary public property at
 * runtime. The credential objects exist once and are shared by reference. The
 * generated operations are plain functions taking the client as an argument, so
 * nothing else holds a reference to it either.
 */

type AuthHeaders = {
  [API_KEY_HEADER_NAME]: string
  [API_SECRET_HEADER_NAME]: string
}

export type RespondentSdkOptions = {
  /**
   * Partner API Client ID, sent as the `x-api-key` header.
   */
  apiKey: string
  /**
   * Partner API Client Secret, sent as the `x-api-secret` header.
   */
  apiSecret: string
  /**
   * Base URL for the Partner API. Defaults to
   * {@link RESPONDENT_PRODUCTION_BASE_URL}. Pass
   * {@link RESPONDENT_STAGING_BASE_URL} to target staging.
   */
  baseUrl?: string
  /**
   * Abort in-flight HTTP requests when they exceed this timeout (in
   * milliseconds).
   *
   * The deadline covers reading the response body, not just receiving the
   * response headers, so a server that answers and then stalls still trips it.
   */
  timeoutMs?: number
}

/**
 * Per-call request controls. Every operation takes this as an optional last
 * argument.
 */
export type RespondentRequestOptions = {
  /**
   * Cancel this request.
   *
   * The call rejects with the signal's `reason` exactly as you set it, so
   * `controller.abort(myError)` surfaces `myError`. A `timeoutMs` deadline, if
   * one is configured, still applies alongside it.
   */
  signal?: AbortSignal
}

const requestControls = (
  options: RespondentRequestOptions | undefined,
): { signal?: AbortSignal } =>
  options?.signal ? { signal: options.signal } : {}

/**
 * Projects are the unit of recruitment. Create a draft, attach screener
 * questions, then publish.
 *
 * @see https://developers.respondent.io/projects/create-a-project
 */
class ProjectsModule {
  readonly #client: Client
  readonly #headers: AuthHeaders

  constructor(client: Client, headers: AuthHeaders) {
    this.#client = client
    this.#headers = headers
  }

  /** Retrieve all projects. */
  async list(
    query?: GetV1ProjectsData['query'],
    options?: RespondentRequestOptions,
  ): Promise<GetV1ProjectsResponse> {
    const result = await getV1Projects<true>({
      client: this.#client,
      headers: this.#headers,
      ...requestControls(options),
      ...(query ? { query } : {}),
    })
    return result.data
  }

  /** Create a project. The project starts in `DRAFT` status. */
  async create(
    body: PostV1ProjectsData['body'],
    options?: RespondentRequestOptions,
  ): Promise<PostV1ProjectsResponse> {
    const result = await postV1Projects<true>({
      client: this.#client,
      body,
      headers: this.#headers,
      ...requestControls(options),
    })
    return result.data
  }

  /** Retrieve a specific project. */
  async retrieve(
    projectId: string,
    options?: RespondentRequestOptions,
  ): Promise<GetV1ProjectsByProjectIdResponse> {
    const result = await getV1ProjectsByProjectId<true>({
      client: this.#client,
      headers: this.#headers,
      ...requestControls(options),
      path: { projectId },
    })
    return result.data
  }

  /** Update a project. */
  async update(
    projectId: string,
    body: PatchV1ProjectsByProjectIdData['body'],
    options?: RespondentRequestOptions,
  ): Promise<PatchV1ProjectsByProjectIdResponse> {
    const result = await patchV1ProjectsByProjectId<true>({
      client: this.#client,
      body,
      headers: this.#headers,
      ...requestControls(options),
      path: { projectId },
    })
    return result.data
  }

  /** Delete a project. */
  async delete(
    projectId: string,
    options?: RespondentRequestOptions,
  ): Promise<void> {
    await deleteV1ProjectsByProjectId<true>({
      client: this.#client,
      headers: this.#headers,
      ...requestControls(options),
      path: { projectId },
    })
  }

  /** Copy a project, including its screener questions. */
  async copy(
    projectId: string,
    options?: RespondentRequestOptions,
  ): Promise<PostV1ProjectsByProjectIdCopyResponse> {
    const result = await postV1ProjectsByProjectIdCopy<true>({
      client: this.#client,
      headers: this.#headers,
      ...requestControls(options),
      path: { projectId },
    })
    return result.data
  }

  /**
   * Publish a project. `publicDescription` is required at publish time.
   *
   * Newly created production projects are paused by default.
   */
  async publish(
    projectId: string,
    options?: RespondentRequestOptions,
  ): Promise<PatchV1ProjectsByProjectIdPublishResponse> {
    const result = await patchV1ProjectsByProjectIdPublish<true>({
      client: this.#client,
      headers: this.#headers,
      ...requestControls(options),
      path: { projectId },
    })
    return result.data
  }

  /** Pause a project. */
  async pause(
    projectId: string,
    body: PatchV1ProjectsByProjectIdPauseData['body'],
    options?: RespondentRequestOptions,
  ): Promise<PatchV1ProjectsByProjectIdPauseResponse> {
    const result = await patchV1ProjectsByProjectIdPause<true>({
      client: this.#client,
      body,
      headers: this.#headers,
      ...requestControls(options),
      path: { projectId },
    })
    return result.data
  }

  /** Close a project. Projects with unpaid participants cannot be closed. */
  async close(
    projectId: string,
    body: PatchV1ProjectsByProjectIdCloseData['body'],
    options?: RespondentRequestOptions,
  ): Promise<PatchV1ProjectsByProjectIdCloseResponse> {
    const result = await patchV1ProjectsByProjectIdClose<true>({
      client: this.#client,
      body,
      headers: this.#headers,
      ...requestControls(options),
      path: { projectId },
    })
    return result.data
  }

  /** Retrieve the audience size estimate for a project's targeting. */
  async audienceSizeEstimate(
    projectId: string,
    options?: RespondentRequestOptions,
  ): Promise<GetV1ProjectsByProjectIdFeasibilityAudienceSizeEstimateResponse> {
    const result =
      await getV1ProjectsByProjectIdFeasibilityAudienceSizeEstimate<true>({
        client: this.#client,
        headers: this.#headers,
        ...requestControls(options),
        path: { projectId },
      })
    return result.data
  }

  /**
   * Replace the external screener questions on a project. Only available to
   * external-screener organizations.
   *
   * @see https://developers.respondent.io/docs/Screener-responses/external-screeners
   */
  async replaceExternalScreenerQuestions(
    projectId: string,
    body: PutV1ProjectsByProjectIdExternalScreenerQuestionsBulkData['body'],
    options?: RespondentRequestOptions,
  ): Promise<PutV1ProjectsByProjectIdExternalScreenerQuestionsBulkResponse> {
    const result =
      await putV1ProjectsByProjectIdExternalScreenerQuestionsBulk<true>({
        client: this.#client,
        body,
        headers: this.#headers,
        ...requestControls(options),
        path: { projectId },
      })
    return result.data
  }

  /**
   * Upload a project file (NDA, picture or attachment) as multipart form data.
   * The project must be in draft status, and only `nda` files are supported
   * today. Accepted formats are PDF and DOCX.
   *
   * ```ts
   * await respondent.projects.uploadFile(
   *   projectId,
   *   { uploadFile: new File([bytes], 'nda.pdf', { type: 'application/pdf' }) },
   *   { type: 'nda' },
   * )
   * ```
   *
   * The endpoint's description asks for `Content-Type` and `Content-Length`
   * headers. Fetch sets both from the multipart body — including the boundary,
   * which no caller can know in advance — so the SDK strips those two header
   * parameters out of the vendored spec instead of asking you for values you
   * cannot compute. See `scripts/normalize-openapi.ts`.
   */
  async uploadFile(
    projectId: string,
    body: PutV1ProjectsByProjectIdFilesFormDataData['body'],
    query: PutV1ProjectsByProjectIdFilesFormDataData['query'],
    options?: RespondentRequestOptions,
  ): Promise<PutV1ProjectsByProjectIdFilesFormDataResponse> {
    const result = await putV1ProjectsByProjectIdFilesFormData<true>({
      client: this.#client,
      body,
      headers: this.#headers,
      ...requestControls(options),
      path: { projectId },
      query,
    })
    return result.data
  }

  /** Get AI-generated project title and description suggestions. */
  async pitchSuggestions(
    body: PostV1ProjectsSuggestionsData['body'],
    options?: RespondentRequestOptions,
  ): Promise<PostV1ProjectsSuggestionsResponse> {
    const result = await postV1ProjectsSuggestions<true>({
      client: this.#client,
      body,
      headers: this.#headers,
      ...requestControls(options),
    })
    return result.data
  }
}

/**
 * Screener questions belong to a project. A project may hold at most 40.
 */
class ScreenerQuestionsModule {
  readonly #client: Client
  readonly #headers: AuthHeaders

  constructor(client: Client, headers: AuthHeaders) {
    this.#client = client
    this.#headers = headers
  }

  /** Retrieve the screener questions on a project. */
  async list(
    projectId: string,
    options?: RespondentRequestOptions,
  ): Promise<GetV1ProjectsByProjectIdScreenerQuestionsResponse> {
    const result = await getV1ProjectsByProjectIdScreenerQuestions<true>({
      client: this.#client,
      headers: this.#headers,
      ...requestControls(options),
      path: { projectId },
    })
    return result.data
  }

  /** Create a single screener question. */
  async create(
    projectId: string,
    body: PostV1ProjectsByProjectIdScreenerQuestionsData['body'],
    options?: RespondentRequestOptions,
  ): Promise<PostV1ProjectsByProjectIdScreenerQuestionsResponse> {
    const result = await postV1ProjectsByProjectIdScreenerQuestions<true>({
      client: this.#client,
      body,
      headers: this.#headers,
      ...requestControls(options),
      path: { projectId },
    })
    return result.data
  }

  /**
   * Replace every screener question on a project in one call. Questions that
   * are absent from the payload are removed.
   */
  async replaceAll(
    projectId: string,
    body: PutV1ProjectsByProjectIdScreenerQuestionsBulkData['body'],
    options?: RespondentRequestOptions,
  ): Promise<PutV1ProjectsByProjectIdScreenerQuestionsBulkResponse> {
    const result = await putV1ProjectsByProjectIdScreenerQuestionsBulk<true>({
      client: this.#client,
      body,
      headers: this.#headers,
      ...requestControls(options),
      path: { projectId },
    })
    return result.data
  }

  /** Retrieve a specific screener question. */
  async retrieve(
    projectId: string,
    screenerQuestionId: string,
    options?: RespondentRequestOptions,
  ): Promise<GetV1ProjectsByProjectIdScreenerQuestionsByScreenerQuestionIdResponse> {
    const result =
      await getV1ProjectsByProjectIdScreenerQuestionsByScreenerQuestionId<true>(
        {
          client: this.#client,
          headers: this.#headers,
          ...requestControls(options),
          path: { projectId, screenerQuestionId },
        },
      )
    return result.data
  }

  /** Update a screener question. */
  async update(
    projectId: string,
    screenerQuestionId: string,
    body: PatchV1ProjectsByProjectIdScreenerQuestionsByScreenerQuestionIdData['body'],
    options?: RespondentRequestOptions,
  ): Promise<PatchV1ProjectsByProjectIdScreenerQuestionsByScreenerQuestionIdResponse> {
    const result =
      await patchV1ProjectsByProjectIdScreenerQuestionsByScreenerQuestionId<true>(
        {
          client: this.#client,
          body,
          headers: this.#headers,
          ...requestControls(options),
          path: { projectId, screenerQuestionId },
        },
      )
    return result.data
  }

  /** Delete a screener question. */
  async delete(
    projectId: string,
    screenerQuestionId: string,
    options?: RespondentRequestOptions,
  ): Promise<DeleteV1ProjectsByProjectIdScreenerQuestionsByScreenerQuestionIdResponse> {
    const result =
      await deleteV1ProjectsByProjectIdScreenerQuestionsByScreenerQuestionId<true>(
        {
          client: this.#client,
          headers: this.#headers,
          ...requestControls(options),
          path: { projectId, screenerQuestionId },
        },
      )
    return result.data
  }

  /** Reorder screener questions by passing their IDs in the desired order. */
  async reorder(
    projectId: string,
    body: PatchV1ProjectsByProjectIdScreenerQuestionsOrderData['body'],
    options?: RespondentRequestOptions,
  ): Promise<PatchV1ProjectsByProjectIdScreenerQuestionsOrderResponse> {
    const result = await patchV1ProjectsByProjectIdScreenerQuestionsOrder<true>(
      {
        client: this.#client,
        body,
        headers: this.#headers,
        ...requestControls(options),
        path: { projectId },
      },
    )
    return result.data
  }
}

/**
 * Screener responses are the participants who applied to a project. The
 * lifecycle is qualify -> invite -> schedule -> mark as attended, and marking a
 * participant as attended is what starts the incentive payment.
 */
class ScreenerResponsesModule {
  readonly #client: Client
  readonly #headers: AuthHeaders

  constructor(client: Client, headers: AuthHeaders) {
    this.#client = client
    this.#headers = headers
  }

  /** List the screener responses on a project. */
  async list(
    projectId: string,
    query?: GetV1ProjectsByProjectIdScreenerResponsesData['query'],
    options?: RespondentRequestOptions,
  ): Promise<GetV1ProjectsByProjectIdScreenerResponsesResponse> {
    const result = await getV1ProjectsByProjectIdScreenerResponses<true>({
      client: this.#client,
      headers: this.#headers,
      ...requestControls(options),
      path: { projectId },
      ...(query ? { query } : {}),
    })
    return result.data
  }

  /** Retrieve payout counts for a project. */
  async payoutSummary(
    projectId: string,
    options?: RespondentRequestOptions,
  ): Promise<GetV1ProjectsByProjectIdScreenerResponsesPayoutsResponse> {
    const result = await getV1ProjectsByProjectIdScreenerResponsesPayouts<true>(
      {
        client: this.#client,
        headers: this.#headers,
        ...requestControls(options),
        path: { projectId },
      },
    )
    return result.data
  }

  /** View a specific screener response. */
  async retrieve(
    projectId: string,
    screenerResponseId: string,
    options?: RespondentRequestOptions,
  ): Promise<GetV1ProjectsByProjectIdScreenerResponsesByScreenerResponseIdResponse> {
    const result =
      await getV1ProjectsByProjectIdScreenerResponsesByScreenerResponseId<true>(
        {
          client: this.#client,
          headers: this.#headers,
          ...requestControls(options),
          path: { projectId, screenerResponseId },
        },
      )
    return result.data
  }

  /** Qualify or disqualify a participant. */
  async qualify(
    projectId: string,
    screenerResponseId: string,
    body: PatchV1ProjectsByProjectIdScreenerResponsesByScreenerResponseIdQualifyData['body'],
    options?: RespondentRequestOptions,
  ): Promise<PatchV1ProjectsByProjectIdScreenerResponsesByScreenerResponseIdQualifyResponse> {
    const result =
      await patchV1ProjectsByProjectIdScreenerResponsesByScreenerResponseIdQualify<true>(
        {
          client: this.#client,
          body,
          headers: this.#headers,
          ...requestControls(options),
          path: { projectId, screenerResponseId },
        },
      )
    return result.data
  }

  /** Invite a participant. */
  async invite(
    projectId: string,
    screenerResponseId: string,
    body: PatchV1ProjectsByProjectIdScreenerResponsesByScreenerResponseIdInviteData['body'],
    options?: RespondentRequestOptions,
  ): Promise<PatchV1ProjectsByProjectIdScreenerResponsesByScreenerResponseIdInviteResponse> {
    const result =
      await patchV1ProjectsByProjectIdScreenerResponsesByScreenerResponseIdInvite<true>(
        {
          client: this.#client,
          body,
          headers: this.#headers,
          ...requestControls(options),
          path: { projectId, screenerResponseId },
        },
      )
    return result.data
  }

  /** Schedule a participant for a moderated session. */
  async schedule(
    projectId: string,
    screenerResponseId: string,
    body: PatchV1ProjectsByProjectIdScreenerResponsesByScreenerResponseIdScheduleData['body'],
    options?: RespondentRequestOptions,
  ): Promise<PatchV1ProjectsByProjectIdScreenerResponsesByScreenerResponseIdScheduleResponse> {
    const result =
      await patchV1ProjectsByProjectIdScreenerResponsesByScreenerResponseIdSchedule<true>(
        {
          client: this.#client,
          body,
          headers: this.#headers,
          ...requestControls(options),
          path: { projectId, screenerResponseId },
        },
      )
    return result.data
  }

  /**
   * Mark a participant as attended.
   *
   * This triggers the incentive payment process, so only call it once the
   * session is complete.
   */
  async markAttended(
    projectId: string,
    screenerResponseId: string,
    options?: RespondentRequestOptions,
  ): Promise<PatchV1ProjectsByProjectIdScreenerResponsesByScreenerResponseIdAttendedResponse> {
    const result =
      await patchV1ProjectsByProjectIdScreenerResponsesByScreenerResponseIdAttended<true>(
        {
          client: this.#client,
          headers: this.#headers,
          ...requestControls(options),
          path: { projectId, screenerResponseId },
        },
      )
    return result.data
  }

  /** Mark a participant as a no-show. */
  async markNoShow(
    projectId: string,
    screenerResponseId: string,
    options?: RespondentRequestOptions,
  ): Promise<PatchV1ProjectsByProjectIdScreenerResponsesByScreenerResponseIdNoShowResponse> {
    const result =
      await patchV1ProjectsByProjectIdScreenerResponsesByScreenerResponseIdNoShow<true>(
        {
          client: this.#client,
          headers: this.#headers,
          ...requestControls(options),
          path: { projectId, screenerResponseId },
        },
      )
    return result.data
  }

  /** Mark a participant as rejected. */
  async reject(
    projectId: string,
    screenerResponseId: string,
    options?: RespondentRequestOptions,
  ): Promise<PatchV1ProjectsByProjectIdScreenerResponsesByScreenerResponseIdRejectResponse> {
    const result =
      await patchV1ProjectsByProjectIdScreenerResponsesByScreenerResponseIdReject<true>(
        {
          client: this.#client,
          headers: this.#headers,
          ...requestControls(options),
          path: { projectId, screenerResponseId },
        },
      )
    return result.data
  }

  /** Report a participant. */
  async report(
    projectId: string,
    screenerResponseId: string,
    body: PatchV1ProjectsByProjectIdScreenerResponsesByScreenerResponseIdReportData['body'],
    options?: RespondentRequestOptions,
  ): Promise<PatchV1ProjectsByProjectIdScreenerResponsesByScreenerResponseIdReportResponse> {
    const result =
      await patchV1ProjectsByProjectIdScreenerResponsesByScreenerResponseIdReport<true>(
        {
          client: this.#client,
          body,
          headers: this.#headers,
          ...requestControls(options),
          path: { projectId, screenerResponseId },
        },
      )
    return result.data
  }

  /** Mark a participant as a favorite. */
  async favorite(
    projectId: string,
    screenerResponseId: string,
    body: PatchV1ProjectsByProjectIdScreenerResponsesByScreenerResponseIdFavoriteData['body'],
    options?: RespondentRequestOptions,
  ): Promise<PatchV1ProjectsByProjectIdScreenerResponsesByScreenerResponseIdFavoriteResponse> {
    const result =
      await patchV1ProjectsByProjectIdScreenerResponsesByScreenerResponseIdFavorite<true>(
        {
          client: this.#client,
          body,
          headers: this.#headers,
          ...requestControls(options),
          path: { projectId, screenerResponseId },
        },
      )
    return result.data
  }

  /** Hide a participant from the project's response list. */
  async hide(
    projectId: string,
    screenerResponseId: string,
    body: PatchV1ProjectsByProjectIdScreenerResponsesByScreenerResponseIdHideData['body'],
    options?: RespondentRequestOptions,
  ): Promise<PatchV1ProjectsByProjectIdScreenerResponsesByScreenerResponseIdHideResponse> {
    const result =
      await patchV1ProjectsByProjectIdScreenerResponsesByScreenerResponseIdHide<true>(
        {
          client: this.#client,
          body,
          headers: this.#headers,
          ...requestControls(options),
          path: { projectId, screenerResponseId },
        },
      )
    return result.data
  }

  /** Cancel an invitation. */
  async cancelInvite(
    projectId: string,
    screenerResponseId: string,
    options?: RespondentRequestOptions,
  ): Promise<PatchV1ProjectsByProjectIdScreenerResponsesByScreenerResponseIdCancelInviteResponse> {
    const result =
      await patchV1ProjectsByProjectIdScreenerResponsesByScreenerResponseIdCancelInvite<true>(
        {
          client: this.#client,
          headers: this.#headers,
          ...requestControls(options),
          path: { projectId, screenerResponseId },
        },
      )
    return result.data
  }

  /** Cancel a booking. */
  async cancelBooking(
    projectId: string,
    screenerResponseId: string,
    options?: RespondentRequestOptions,
  ): Promise<PatchV1ProjectsByProjectIdScreenerResponsesByScreenerResponseIdCancelBookingResponse> {
    const result =
      await patchV1ProjectsByProjectIdScreenerResponsesByScreenerResponseIdCancelBooking<true>(
        {
          client: this.#client,
          headers: this.#headers,
          ...requestControls(options),
          path: { projectId, screenerResponseId },
        },
      )
    return result.data
  }

  /** Cancel a booking and re-invite the participant. */
  async cancelBookingAndReinvite(
    projectId: string,
    screenerResponseId: string,
    body: PatchV1ProjectsByProjectIdScreenerResponsesByScreenerResponseIdCancelBookingReinviteData['body'],
    options?: RespondentRequestOptions,
  ): Promise<PatchV1ProjectsByProjectIdScreenerResponsesByScreenerResponseIdCancelBookingReinviteResponse> {
    const result =
      await patchV1ProjectsByProjectIdScreenerResponsesByScreenerResponseIdCancelBookingReinvite<true>(
        {
          client: this.#client,
          body,
          headers: this.#headers,
          ...requestControls(options),
          path: { projectId, screenerResponseId },
        },
      )
    return result.data
  }

  /** Cancel a booking on the participant's behalf. */
  async participantCancelBooking(
    projectId: string,
    screenerResponseId: string,
    body: PatchV1ProjectsByProjectIdScreenerResponsesByScreenerResponseIdParticipantCancelBookingData['body'],
    options?: RespondentRequestOptions,
  ): Promise<PatchV1ProjectsByProjectIdScreenerResponsesByScreenerResponseIdParticipantCancelBookingResponse> {
    const result =
      await patchV1ProjectsByProjectIdScreenerResponsesByScreenerResponseIdParticipantCancelBooking<true>(
        {
          client: this.#client,
          body,
          headers: this.#headers,
          ...requestControls(options),
          path: { projectId, screenerResponseId },
        },
      )
    return result.data
  }

  /**
   * Post the answers collected by your own screener back to Respondent. Rows
   * upsert idempotently per `questionId`.
   */
  async ingestExternalScreenerAnswers(
    projectId: string,
    screenerResponseId: string,
    body: PostV1ProjectsByProjectIdScreenerResponsesByScreenerResponseIdExternalScreenerAnswersData['body'],
    options?: RespondentRequestOptions,
  ): Promise<PostV1ProjectsByProjectIdScreenerResponsesByScreenerResponseIdExternalScreenerAnswersResponse> {
    const result =
      await postV1ProjectsByProjectIdScreenerResponsesByScreenerResponseIdExternalScreenerAnswers<true>(
        {
          client: this.#client,
          body,
          headers: this.#headers,
          ...requestControls(options),
          path: { projectId, screenerResponseId },
        },
      )
    return result.data
  }

  /** Trigger a manual payout for a participant. */
  async payout(
    projectId: string,
    screenerResponseId: string,
    body: PostV1ProjectsByProjectIdScreenerResponsesByScreenerResponseIdPayoutsData['body'],
    options?: RespondentRequestOptions,
  ): Promise<void> {
    await postV1ProjectsByProjectIdScreenerResponsesByScreenerResponseIdPayouts<true>(
      {
        client: this.#client,
        body,
        headers: this.#headers,
        ...requestControls(options),
        path: { projectId, screenerResponseId },
      },
    )
  }
}

/**
 * Quotas cap how many participants a project accepts per demographic segment.
 */
class QuotaModule {
  readonly #client: Client
  readonly #headers: AuthHeaders

  constructor(client: Client, headers: AuthHeaders) {
    this.#client = client
    this.#headers = headers
  }

  /** Create the quota for a project. */
  async create(
    projectId: string,
    body: PostV1ProjectsByProjectIdQuotaData['body'],
    options?: RespondentRequestOptions,
  ): Promise<PostV1ProjectsByProjectIdQuotaResponse> {
    const result = await postV1ProjectsByProjectIdQuota<true>({
      client: this.#client,
      body,
      headers: this.#headers,
      ...requestControls(options),
      path: { projectId },
    })
    return result.data
  }

  /** Retrieve the quota for a project. */
  async retrieve(
    projectId: string,
    options?: RespondentRequestOptions,
  ): Promise<GetV1ProjectsByProjectIdQuotaResponse> {
    const result = await getV1ProjectsByProjectIdQuota<true>({
      client: this.#client,
      headers: this.#headers,
      ...requestControls(options),
      path: { projectId },
    })
    return result.data
  }

  /** Update the quota for a project. */
  async update(
    projectId: string,
    body: PatchV1ProjectsByProjectIdQuotaData['body'],
    options?: RespondentRequestOptions,
  ): Promise<PatchV1ProjectsByProjectIdQuotaResponse> {
    const result = await patchV1ProjectsByProjectIdQuota<true>({
      client: this.#client,
      body,
      headers: this.#headers,
      ...requestControls(options),
      path: { projectId },
    })
    return result.data
  }

  /** Delete the quota for a project. */
  async delete(
    projectId: string,
    options?: RespondentRequestOptions,
  ): Promise<DeleteV1ProjectsByProjectIdQuotaResponse> {
    const result = await deleteV1ProjectsByProjectIdQuota<true>({
      client: this.#client,
      headers: this.#headers,
      ...requestControls(options),
      path: { projectId },
    })
    return result.data
  }
}

/**
 * Each team has at most one active webhook, and it receives every event for
 * projects created under that team through the API.
 *
 * @see https://developers.respondent.io/docs/Webhooks/webhooks
 */
class WebhooksModule {
  readonly #client: Client
  readonly #headers: AuthHeaders

  constructor(client: Client, headers: AuthHeaders) {
    this.#client = client
    this.#headers = headers
  }

  /** Retrieve the team's webhook, including its signing `privateKey`. */
  async list(
    options?: RespondentRequestOptions,
  ): Promise<GetV1WebhooksResponse> {
    const result = await getV1Webhooks<true>({
      client: this.#client,
      headers: this.#headers,
      ...requestControls(options),
    })
    return result.data
  }

  /**
   * Create a webhook. The response carries the `privateKey` used to sign
   * deliveries — store it, and pass it to the verification helpers in
   * `@coloop-ai/respondent-sdk/webhooks`.
   *
   * The key is not create-only: `list()` and `retrieve()` answer with the same
   * `WebhookDto`, so a lost key can be read back rather than re-created.
   */
  async create(
    body: PostV1WebhooksData['body'],
    options?: RespondentRequestOptions,
  ): Promise<PostV1WebhooksResponse> {
    const result = await postV1Webhooks<true>({
      client: this.#client,
      body,
      headers: this.#headers,
      ...requestControls(options),
    })
    return result.data
  }

  /** Retrieve a specific webhook, including its signing `privateKey`. */
  async retrieve(
    webhookId: string,
    options?: RespondentRequestOptions,
  ): Promise<GetV1WebhooksByWebhookIdResponse> {
    const result = await getV1WebhooksByWebhookId<true>({
      client: this.#client,
      headers: this.#headers,
      ...requestControls(options),
      path: { webhookId },
    })
    return result.data
  }

  /** Deactivate a webhook. */
  async deactivate(
    webhookId: string,
    options?: RespondentRequestOptions,
  ): Promise<void> {
    await deleteV1WebhooksByWebhookId<true>({
      client: this.#client,
      headers: this.#headers,
      ...requestControls(options),
      path: { webhookId },
    })
  }

  /** Retrieve the event types a webhook is subscribed to. */
  async listEventTypes(
    webhookId: string,
    options?: RespondentRequestOptions,
  ): Promise<GetV1WebhooksByWebhookIdEventTypesResponse> {
    const result = await getV1WebhooksByWebhookIdEventTypes<true>({
      client: this.#client,
      headers: this.#headers,
      ...requestControls(options),
      path: { webhookId },
    })
    return result.data
  }

  /** Send a simulated event to the webhook's URL. */
  async simulate(
    webhookId: string,
    body: PostV1WebhooksByWebhookIdSimulateData['body'],
    options?: RespondentRequestOptions,
  ): Promise<void> {
    await postV1WebhooksByWebhookIdSimulate<true>({
      client: this.#client,
      body,
      headers: this.#headers,
      ...requestControls(options),
      path: { webhookId },
    })
  }
}

/** Credit and incentive balances for the team. */
class PricingModule {
  readonly #client: Client
  readonly #headers: AuthHeaders

  constructor(client: Client, headers: AuthHeaders) {
    this.#client = client
    this.#headers = headers
  }

  /** View the credit and incentive balance. */
  async balanceSummary(
    options?: RespondentRequestOptions,
  ): Promise<GetV1PricingBalancesSummaryResponse> {
    const result = await getV1PricingBalancesSummary<true>({
      client: this.#client,
      headers: this.#headers,
      ...requestControls(options),
    })
    return result.data
  }
}

/** Participant profiles. */
class ProfilesModule {
  readonly #client: Client
  readonly #headers: AuthHeaders

  constructor(client: Client, headers: AuthHeaders) {
    this.#client = client
    this.#headers = headers
  }

  /** Retrieve a participant profile. */
  async retrieve(
    profileId: string,
    options?: RespondentRequestOptions,
  ): Promise<GetV1ProfilesByProfileIdResponse> {
    const result = await getV1ProfilesByProfileId<true>({
      client: this.#client,
      headers: this.#headers,
      ...requestControls(options),
      path: { profileId },
    })
    return result.data
  }

  /**
   * Create a test participant. Staging only — this endpoint is rejected in
   * production.
   */
  async createTestParticipant(
    body: PostV1ProfilesData['body'],
    options?: RespondentRequestOptions,
  ): Promise<void> {
    await postV1Profiles<true>({
      client: this.#client,
      body,
      headers: this.#headers,
      ...requestControls(options),
    })
  }
}

/** Past participants of the team's projects. */
class TeamRespondentsModule {
  readonly #client: Client
  readonly #headers: AuthHeaders

  constructor(client: Client, headers: AuthHeaders) {
    this.#client = client
    this.#headers = headers
  }

  /** Search past participants. */
  async list(
    query?: GetV1TeamRespondentsData['query'],
    options?: RespondentRequestOptions,
  ): Promise<GetV1TeamRespondentsResponse> {
    const result = await getV1TeamRespondents<true>({
      client: this.#client,
      headers: this.#headers,
      ...requestControls(options),
      ...(query ? { query } : {}),
    })
    return result.data
  }

  /** Retrieve a past participant's profile. */
  async retrieve(
    profileId: string,
    options?: RespondentRequestOptions,
  ): Promise<GetV1TeamRespondentsProfilesByProfileIdResponse> {
    const result = await getV1TeamRespondentsProfilesByProfileId<true>({
      client: this.#client,
      headers: this.#headers,
      ...requestControls(options),
      path: { profileId },
    })
    return result.data
  }

  /** Invite multiple past participants to a project. */
  async batchInvite(
    body: PutV1TeamRespondentsBatchInviteData['body'],
    options?: RespondentRequestOptions,
  ): Promise<PutV1TeamRespondentsBatchInviteResponse> {
    const result = await putV1TeamRespondentsBatchInvite<true>({
      client: this.#client,
      body,
      headers: this.#headers,
      ...requestControls(options),
    })
    return result.data
  }
}

class ConversationsModule {
  readonly #client: Client
  readonly #headers: AuthHeaders

  constructor(client: Client, headers: AuthHeaders) {
    this.#client = client
    this.#headers = headers
  }

  /** Retrieve all conversations. */
  async list(
    query?: GetV1MessagingConversationsData['query'],
    options?: RespondentRequestOptions,
  ): Promise<GetV1MessagingConversationsResponse> {
    const result = await getV1MessagingConversations<true>({
      client: this.#client,
      headers: this.#headers,
      ...requestControls(options),
      ...(query ? { query } : {}),
    })
    return result.data
  }

  /** Create a conversation. */
  async create(
    body: PostV1MessagingConversationsData['body'],
    options?: RespondentRequestOptions,
  ): Promise<PostV1MessagingConversationsResponse> {
    const result = await postV1MessagingConversations<true>({
      client: this.#client,
      body,
      headers: this.#headers,
      ...requestControls(options),
    })
    return result.data
  }

  /** Retrieve a specific conversation. */
  async retrieve(
    conversationUid: string,
    options?: RespondentRequestOptions,
  ): Promise<GetV1MessagingConversationsByConversationUidResponse> {
    const result = await getV1MessagingConversationsByConversationUid<true>({
      client: this.#client,
      headers: this.#headers,
      ...requestControls(options),
      path: { conversationUid },
    })
    return result.data
  }

  /** Update a conversation. */
  async update(
    conversationUid: string,
    body: PatchV1MessagingConversationsByConversationUidData['body'],
    options?: RespondentRequestOptions,
  ): Promise<PatchV1MessagingConversationsByConversationUidResponse> {
    const result = await patchV1MessagingConversationsByConversationUid<true>({
      client: this.#client,
      body,
      headers: this.#headers,
      ...requestControls(options),
      path: { conversationUid },
    })
    return result.data
  }

  /** Mark a conversation as read. */
  async markAsRead(
    conversationUid: string,
    options?: RespondentRequestOptions,
  ): Promise<PatchV1MessagingConversationsByConversationUidReadResponse> {
    const result =
      await patchV1MessagingConversationsByConversationUidRead<true>({
        client: this.#client,
        headers: this.#headers,
        ...requestControls(options),
        path: { conversationUid },
      })
    return result.data
  }

  /** Add a participant to a conversation. */
  async addParticipant(
    conversationUid: string,
    body: PostV1MessagingConversationsByConversationUidParticipantsData['body'],
    options?: RespondentRequestOptions,
  ): Promise<void> {
    await postV1MessagingConversationsByConversationUidParticipants<true>({
      client: this.#client,
      body,
      headers: this.#headers,
      ...requestControls(options),
      path: { conversationUid },
    })
  }

  /** Remove a participant from a conversation. */
  async removeParticipant(
    conversationUid: string,
    participantUserId: string,
    options?: RespondentRequestOptions,
  ): Promise<DeleteV1MessagingConversationsByConversationUidParticipantsByParticipantUserIdResponse> {
    const result =
      await deleteV1MessagingConversationsByConversationUidParticipantsByParticipantUserId<true>(
        {
          client: this.#client,
          headers: this.#headers,
          ...requestControls(options),
          path: { conversationUid, participantUserId },
        },
      )
    return result.data
  }
}

class MessagesModule {
  readonly #client: Client
  readonly #headers: AuthHeaders

  constructor(client: Client, headers: AuthHeaders) {
    this.#client = client
    this.#headers = headers
  }

  /** Retrieve all messages. */
  async list(
    query?: GetV1MessagingMessagesData['query'],
    options?: RespondentRequestOptions,
  ): Promise<GetV1MessagingMessagesResponse> {
    const result = await getV1MessagingMessages<true>({
      client: this.#client,
      headers: this.#headers,
      ...requestControls(options),
      ...(query ? { query } : {}),
    })
    return result.data
  }

  /** Retrieve a specific message. */
  async retrieve(
    messageUid: string,
    options?: RespondentRequestOptions,
  ): Promise<GetV1MessagingMessagesByMessageUidResponse> {
    const result = await getV1MessagingMessagesByMessageUid<true>({
      client: this.#client,
      headers: this.#headers,
      ...requestControls(options),
      path: { messageUid },
    })
    return result.data
  }

  /** Retrieve unread conversations. */
  async inbox(
    query?: GetV1MessagingMessagesInboxData['query'],
    options?: RespondentRequestOptions,
  ): Promise<GetV1MessagingMessagesInboxResponse> {
    const result = await getV1MessagingMessagesInbox<true>({
      client: this.#client,
      headers: this.#headers,
      ...requestControls(options),
      ...(query ? { query } : {}),
    })
    return result.data
  }

  /** Create a message in a conversation. */
  async create(
    conversationUid: string,
    body: PostV1MessagingConversationsByConversationUidMessagesData['body'],
    options?: RespondentRequestOptions,
  ): Promise<PostV1MessagingConversationsByConversationUidMessagesResponse> {
    const result =
      await postV1MessagingConversationsByConversationUidMessages<true>({
        client: this.#client,
        body,
        headers: this.#headers,
        ...requestControls(options),
        path: { conversationUid },
      })
    return result.data
  }
}

/**
 * Messaging with participants. `MESSAGES.CREATED` and `CONVERSATIONS.CREATED`
 * webhooks fire only for participant-sent messages, never researcher-sent ones.
 */
class MessagingModule {
  public readonly conversations: ConversationsModule
  public readonly messages: MessagesModule

  constructor(client: Client, headers: AuthHeaders) {
    this.conversations = new ConversationsModule(client, headers)
    this.messages = new MessagesModule(client, headers)
  }

  /** Retrieve all conversations. */
  listConversations(
    query?: GetV1MessagingConversationsData['query'],
    options?: RespondentRequestOptions,
  ): Promise<GetV1MessagingConversationsResponse> {
    return this.conversations.list(query, options)
  }

  /** Create a conversation. */
  createConversation(
    body: PostV1MessagingConversationsData['body'],
    options?: RespondentRequestOptions,
  ): Promise<PostV1MessagingConversationsResponse> {
    return this.conversations.create(body, options)
  }

  /** Retrieve all messages. */
  listMessages(
    query?: GetV1MessagingMessagesData['query'],
    options?: RespondentRequestOptions,
  ): Promise<GetV1MessagingMessagesResponse> {
    return this.messages.list(query, options)
  }

  /** Create a message in a conversation. */
  createMessage(
    conversationUid: string,
    body: PostV1MessagingConversationsByConversationUidMessagesData['body'],
    options?: RespondentRequestOptions,
  ): Promise<PostV1MessagingConversationsByConversationUidMessagesResponse> {
    return this.messages.create(conversationUid, body, options)
  }

  /** Retrieve unread conversations. */
  inbox(
    query?: GetV1MessagingMessagesInboxData['query'],
    options?: RespondentRequestOptions,
  ): Promise<GetV1MessagingMessagesInboxResponse> {
    return this.messages.inbox(query, options)
  }
}

/**
 * Reference data used to build project targeting.
 *
 * Lookup IDs for industries, skills, topics and job titles differ between
 * staging and production, so resolve them at runtime per environment instead of
 * hardcoding them.
 */
class LookupsModule {
  readonly #client: Client
  readonly #headers: AuthHeaders

  constructor(client: Client, headers: AuthHeaders) {
    this.#client = client
    this.#headers = headers
  }

  /** Retrieve lookup values for the requested groups. */
  async values(
    query: GetV1LookupsData['query'],
    options?: RespondentRequestOptions,
  ): Promise<GetV1LookupsResponse> {
    const result = await getV1Lookups<true>({
      client: this.#client,
      headers: this.#headers,
      ...requestControls(options),
      query,
    })
    return result.data
  }

  /** Retrieve the industry list. */
  async industries(
    query?: GetV1IndustriesData['query'],
    options?: RespondentRequestOptions,
  ): Promise<GetV1IndustriesResponse> {
    const result = await getV1Industries<true>({
      client: this.#client,
      headers: this.#headers,
      ...requestControls(options),
      ...(query ? { query } : {}),
    })
    return result.data
  }

  /** Retrieve the job title list. */
  async jobTitles(
    query?: GetV1JobTitlesData['query'],
    options?: RespondentRequestOptions,
  ): Promise<GetV1JobTitlesResponse> {
    const result = await getV1JobTitles<true>({
      client: this.#client,
      headers: this.#headers,
      ...requestControls(options),
      ...(query ? { query } : {}),
    })
    return result.data
  }

  /** Retrieve the skill list. */
  async skills(
    query?: GetV1SkillsData['query'],
    options?: RespondentRequestOptions,
  ): Promise<GetV1SkillsResponse> {
    const result = await getV1Skills<true>({
      client: this.#client,
      headers: this.#headers,
      ...requestControls(options),
      ...(query ? { query } : {}),
    })
    return result.data
  }

  /** Retrieve the topics list. */
  async topics(
    query?: GetV1TopicsData['query'],
    options?: RespondentRequestOptions,
  ): Promise<GetV1TopicsResponse> {
    const result = await getV1Topics<true>({
      client: this.#client,
      headers: this.#headers,
      ...requestControls(options),
      ...(query ? { query } : {}),
    })
    return result.data
  }
}

/**
 * Statuses whose responses must not carry a body.
 */
const NULL_BODY_STATUSES: readonly number[] = [101, 103, 204, 205, 304]

/**
 * Read the whole response body, then rebuild the response around the buffered
 * bytes.
 *
 * `fetch` resolves as soon as the response headers arrive, so a deadline that
 * stops there does not cover a server that sends headers and then stalls the
 * body. Buffering under the same abort signal keeps the deadline alive until
 * the body is complete. The Partner API returns small JSON documents and the
 * SDK never streams, so holding a whole body in memory costs nothing.
 */
const bufferResponseBody = async (response: Response): Promise<Response> => {
  if (
    response.body === null ||
    response.status < 200 ||
    NULL_BODY_STATUSES.includes(response.status)
  ) {
    return response
  }

  const body = await response.arrayBuffer()
  const buffered = new Response(body, {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers,
  })
  // `Response.url` is read-only and is not carried over by the constructor.
  Object.defineProperty(buffered, 'url', {
    value: response.url,
    configurable: true,
  })
  return buffered
}

/**
 * Ergonomic wrapper around the generated Respondent Partner API client.
 *
 * Credentials are sent on every request as the `x-api-key` and `x-api-secret`
 * headers, failures raise a {@link RespondentSdkError} subclass, and each
 * helper returns the typed response body.
 */
export class RespondentSdk {
  public readonly projects: ProjectsModule
  public readonly screenerQuestions: ScreenerQuestionsModule
  public readonly screenerResponses: ScreenerResponsesModule
  public readonly quota: QuotaModule
  public readonly webhooks: WebhooksModule
  public readonly pricing: PricingModule
  public readonly profiles: ProfilesModule
  public readonly teamRespondents: TeamRespondentsModule
  public readonly messaging: MessagingModule
  public readonly lookups: LookupsModule

  constructor({ apiKey, apiSecret, baseUrl, timeoutMs }: RespondentSdkOptions) {
    if (
      timeoutMs !== undefined &&
      (!Number.isFinite(timeoutMs) || timeoutMs <= 0)
    ) {
      throw new Error('RespondentSdk timeoutMs must be a positive number')
    }

    if (timeoutMs !== undefined && timeoutMs > MAX_TIMEOUT_MS) {
      throw new Error(
        `RespondentSdk timeoutMs must be at most ${String(MAX_TIMEOUT_MS)}ms (about 24.8 days); setTimeout clamps a longer delay to 1ms, which would abort every request immediately`,
      )
    }

    // One object, shared by reference with every module, never stored on an
    // enumerable property.
    const authHeaders: AuthHeaders = {
      [API_KEY_HEADER_NAME]: apiKey,
      [API_SECRET_HEADER_NAME]: apiSecret,
    }

    // Everything the SERVER writes is scrubbed of these before it goes on an
    // error. Held only by the interceptor closure below, like `authHeaders`.
    const credentials = { apiKey, apiSecret }

    const clientInstance = createClient({
      baseUrl: baseUrl ?? RESPONDENT_PRODUCTION_BASE_URL,
      headers: authHeaders,
      responseStyle: 'fields',
      throwOnError: true,
      // Node forwards custom headers — including `x-api-key` and
      // `x-api-secret` — across an origin-changing redirect, so following one
      // would hand the credentials to whatever host the redirect names. A
      // partner API has no reason to redirect, so refuse instead of following.
      redirect: 'error',
    })

    if (timeoutMs !== undefined) {
      const deadlineMs = timeoutMs

      clientInstance.interceptors.request.use((request, options) => {
        const controller = new AbortController()
        const callerSignal = request.signal
        const timedRequest = new Request(request, { signal: controller.signal })

        let timeoutId: ReturnType<typeof setTimeout> | undefined
        let forwardAbort: (() => void) | undefined
        let finished = false

        const finish = () => {
          if (finished) {
            return
          }
          finished = true
          if (timeoutId !== undefined) {
            clearTimeout(timeoutId)
          }
          if (forwardAbort) {
            callerSignal.removeEventListener('abort', forwardAbort)
          }
        }

        if (callerSignal.aborted) {
          // Forward the caller's own reason, unchanged.
          controller.abort(callerSignal.reason)
          finish()
        } else {
          forwardAbort = () => {
            controller.abort(callerSignal.reason)
          }
          callerSignal.addEventListener('abort', forwardAbort, { once: true })

          timeoutId = setTimeout(() => {
            controller.abort(
              new RespondentSdkTimeoutError({
                timeoutMs: deadlineMs,
                request: summarizeRequest(timedRequest),
              }),
            )
          }, deadlineMs)
        }

        const baseFetch = options.fetch ?? globalThis.fetch
        options.fetch = async (input, init) => {
          try {
            // Buffering happens inside the deadline, so it also covers a
            // stalled response body.
            return await bufferResponseBody(await baseFetch(input, init))
          } finally {
            finish()
          }
        }

        return timedRequest
      })
    }

    clientInstance.interceptors.error.use((error, response, request) => {
      if (isRespondentSdkError(error)) {
        return error
      }

      // An abort the SDK did not raise belongs to the caller: surface their
      // `signal.reason` exactly as they set it.
      if (request?.signal.aborted) {
        return error
      }

      const summary = summarizeRequest(request)

      if (!response) {
        return new RespondentSdkTransportError({
          request: summary,
          cause: error,
        })
      }

      if (response.ok) {
        // A success status whose body could not be decoded — invalid JSON on a
        // 200, for example. The status is not the failure, so this must not
        // look like an API error.
        return new RespondentSdkResponseError({
          status: response.status,
          statusText: redactCredentials(response.statusText, credentials),
          responseHeaders: summarizeResponseHeaders(response, credentials),
          request: summary,
          cause: error,
        })
      }

      // `message`, `code` and `detail` are read back out of the payload by
      // `RespondentSdkApiError`, so scrubbing the payload covers them too.
      return new RespondentSdkApiError({
        payload: redactPayload(error, credentials),
        status: response.status,
        statusText: redactCredentials(response.statusText, credentials),
        responseHeaders: summarizeResponseHeaders(response, credentials),
        request: summary,
      })
    })

    this.projects = new ProjectsModule(clientInstance, authHeaders)
    this.screenerQuestions = new ScreenerQuestionsModule(
      clientInstance,
      authHeaders,
    )
    this.screenerResponses = new ScreenerResponsesModule(
      clientInstance,
      authHeaders,
    )
    this.quota = new QuotaModule(clientInstance, authHeaders)
    this.webhooks = new WebhooksModule(clientInstance, authHeaders)
    this.pricing = new PricingModule(clientInstance, authHeaders)
    this.profiles = new ProfilesModule(clientInstance, authHeaders)
    this.teamRespondents = new TeamRespondentsModule(
      clientInstance,
      authHeaders,
    )
    this.messaging = new MessagingModule(clientInstance, authHeaders)
    this.lookups = new LookupsModule(clientInstance, authHeaders)
  }
}
