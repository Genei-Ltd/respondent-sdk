import { createClient } from './generated/client'
import { GeneratedRespondentSdk } from './generated/sdk.gen'
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
  RespondentSdkError,
  RespondentSdkTimeoutError,
  isRespondentSdkError,
  isRespondentSdkTimeoutError,
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
   */
  timeoutMs?: number
}

const createAbortError = (message: string): Error => {
  if (typeof DOMException === 'function') {
    return new DOMException(message, 'AbortError')
  }

  const error = new Error(message)
  error.name = 'AbortError'
  return error
}

class RespondentModule {
  constructor(
    protected readonly sdk: GeneratedRespondentSdk,
    protected readonly headers: AuthHeaders,
  ) {}
}

/**
 * Projects are the unit of recruitment. Create a draft, attach screener
 * questions, then publish.
 *
 * @see https://developers.respondent.io/projects/create-a-project
 */
class ProjectsModule extends RespondentModule {
  /** Retrieve all projects. */
  async list(
    query?: GetV1ProjectsData['query'],
  ): Promise<GetV1ProjectsResponse> {
    const result = await this.sdk.getV1Projects<true>({
      headers: this.headers,
      ...(query ? { query } : {}),
    })
    return result.data
  }

  /** Create a project. The project starts in `DRAFT` status. */
  async create(
    body: PostV1ProjectsData['body'],
  ): Promise<PostV1ProjectsResponse> {
    const result = await this.sdk.postV1Projects<true>({
      body,
      headers: this.headers,
    })
    return result.data
  }

  /** Retrieve a specific project. */
  async retrieve(projectId: string): Promise<GetV1ProjectsByProjectIdResponse> {
    const result = await this.sdk.getV1ProjectsByProjectId<true>({
      headers: this.headers,
      path: { projectId },
    })
    return result.data
  }

  /** Update a project. */
  async update(
    projectId: string,
    body: PatchV1ProjectsByProjectIdData['body'],
  ): Promise<PatchV1ProjectsByProjectIdResponse> {
    const result = await this.sdk.patchV1ProjectsByProjectId<true>({
      body,
      headers: this.headers,
      path: { projectId },
    })
    return result.data
  }

  /** Delete a project. */
  async delete(projectId: string): Promise<void> {
    await this.sdk.deleteV1ProjectsByProjectId<true>({
      headers: this.headers,
      path: { projectId },
    })
  }

  /** Copy a project, including its screener questions. */
  async copy(
    projectId: string,
  ): Promise<PostV1ProjectsByProjectIdCopyResponse> {
    const result = await this.sdk.postV1ProjectsByProjectIdCopy<true>({
      headers: this.headers,
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
  ): Promise<PatchV1ProjectsByProjectIdPublishResponse> {
    const result = await this.sdk.patchV1ProjectsByProjectIdPublish<true>({
      headers: this.headers,
      path: { projectId },
    })
    return result.data
  }

  /** Pause a project. */
  async pause(
    projectId: string,
    body: PatchV1ProjectsByProjectIdPauseData['body'],
  ): Promise<PatchV1ProjectsByProjectIdPauseResponse> {
    const result = await this.sdk.patchV1ProjectsByProjectIdPause<true>({
      body,
      headers: this.headers,
      path: { projectId },
    })
    return result.data
  }

  /** Close a project. Projects with unpaid participants cannot be closed. */
  async close(
    projectId: string,
    body: PatchV1ProjectsByProjectIdCloseData['body'],
  ): Promise<PatchV1ProjectsByProjectIdCloseResponse> {
    const result = await this.sdk.patchV1ProjectsByProjectIdClose<true>({
      body,
      headers: this.headers,
      path: { projectId },
    })
    return result.data
  }

  /** Retrieve the audience size estimate for a project's targeting. */
  async audienceSizeEstimate(
    projectId: string,
  ): Promise<GetV1ProjectsByProjectIdFeasibilityAudienceSizeEstimateResponse> {
    const result =
      await this.sdk.getV1ProjectsByProjectIdFeasibilityAudienceSizeEstimate<true>(
        {
          headers: this.headers,
          path: { projectId },
        },
      )
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
  ): Promise<PutV1ProjectsByProjectIdExternalScreenerQuestionsBulkResponse> {
    const result =
      await this.sdk.putV1ProjectsByProjectIdExternalScreenerQuestionsBulk<true>(
        {
          body,
          headers: this.headers,
          path: { projectId },
        },
      )
    return result.data
  }

  /**
   * Upload a project file (NDA, picture or attachment) as multipart form data.
   * The project must be in draft status, and only `nda` files are supported
   * today.
   *
   * `Content-Type` and `Content-Length` are required by the endpoint, so you
   * must supply them yourself — the SDK cannot compute the multipart boundary
   * on your behalf.
   */
  async uploadFile(
    projectId: string,
    body: PutV1ProjectsByProjectIdFilesFormDataData['body'],
    query: PutV1ProjectsByProjectIdFilesFormDataData['query'],
    headers: Omit<
      PutV1ProjectsByProjectIdFilesFormDataData['headers'],
      typeof API_KEY_HEADER_NAME | typeof API_SECRET_HEADER_NAME
    >,
  ): Promise<PutV1ProjectsByProjectIdFilesFormDataResponse> {
    const result = await this.sdk.putV1ProjectsByProjectIdFilesFormData<true>({
      body,
      headers: { ...this.headers, ...headers },
      path: { projectId },
      query,
    })
    return result.data
  }

  /** Get AI-generated project title and description suggestions. */
  async pitchSuggestions(
    body: PostV1ProjectsSuggestionsData['body'],
  ): Promise<PostV1ProjectsSuggestionsResponse> {
    const result = await this.sdk.postV1ProjectsSuggestions<true>({
      body,
      headers: this.headers,
    })
    return result.data
  }
}

/**
 * Screener questions belong to a project. A project may hold at most 40.
 */
class ScreenerQuestionsModule extends RespondentModule {
  /** Retrieve the screener questions on a project. */
  async list(
    projectId: string,
  ): Promise<GetV1ProjectsByProjectIdScreenerQuestionsResponse> {
    const result =
      await this.sdk.getV1ProjectsByProjectIdScreenerQuestions<true>({
        headers: this.headers,
        path: { projectId },
      })
    return result.data
  }

  /** Create a single screener question. */
  async create(
    projectId: string,
    body: PostV1ProjectsByProjectIdScreenerQuestionsData['body'],
  ): Promise<PostV1ProjectsByProjectIdScreenerQuestionsResponse> {
    const result =
      await this.sdk.postV1ProjectsByProjectIdScreenerQuestions<true>({
        body,
        headers: this.headers,
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
  ): Promise<PutV1ProjectsByProjectIdScreenerQuestionsBulkResponse> {
    const result =
      await this.sdk.putV1ProjectsByProjectIdScreenerQuestionsBulk<true>({
        body,
        headers: this.headers,
        path: { projectId },
      })
    return result.data
  }

  /** Retrieve a specific screener question. */
  async retrieve(
    projectId: string,
    screenerQuestionId: string,
  ): Promise<GetV1ProjectsByProjectIdScreenerQuestionsByScreenerQuestionIdResponse> {
    const result =
      await this.sdk.getV1ProjectsByProjectIdScreenerQuestionsByScreenerQuestionId<true>(
        {
          headers: this.headers,
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
  ): Promise<PatchV1ProjectsByProjectIdScreenerQuestionsByScreenerQuestionIdResponse> {
    const result =
      await this.sdk.patchV1ProjectsByProjectIdScreenerQuestionsByScreenerQuestionId<true>(
        {
          body,
          headers: this.headers,
          path: { projectId, screenerQuestionId },
        },
      )
    return result.data
  }

  /** Delete a screener question. */
  async delete(
    projectId: string,
    screenerQuestionId: string,
  ): Promise<DeleteV1ProjectsByProjectIdScreenerQuestionsByScreenerQuestionIdResponse> {
    const result =
      await this.sdk.deleteV1ProjectsByProjectIdScreenerQuestionsByScreenerQuestionId<true>(
        {
          headers: this.headers,
          path: { projectId, screenerQuestionId },
        },
      )
    return result.data
  }

  /** Reorder screener questions by passing their IDs in the desired order. */
  async reorder(
    projectId: string,
    body: PatchV1ProjectsByProjectIdScreenerQuestionsOrderData['body'],
  ): Promise<PatchV1ProjectsByProjectIdScreenerQuestionsOrderResponse> {
    const result =
      await this.sdk.patchV1ProjectsByProjectIdScreenerQuestionsOrder<true>({
        body,
        headers: this.headers,
        path: { projectId },
      })
    return result.data
  }
}

/**
 * Screener responses are the participants who applied to a project. The
 * lifecycle is qualify -> invite -> schedule -> mark as attended, and marking a
 * participant as attended is what starts the incentive payment.
 */
class ScreenerResponsesModule extends RespondentModule {
  /** List the screener responses on a project. */
  async list(
    projectId: string,
    query?: GetV1ProjectsByProjectIdScreenerResponsesData['query'],
  ): Promise<GetV1ProjectsByProjectIdScreenerResponsesResponse> {
    const result =
      await this.sdk.getV1ProjectsByProjectIdScreenerResponses<true>({
        headers: this.headers,
        path: { projectId },
        ...(query ? { query } : {}),
      })
    return result.data
  }

  /** Retrieve payout counts for a project. */
  async payoutSummary(
    projectId: string,
  ): Promise<GetV1ProjectsByProjectIdScreenerResponsesPayoutsResponse> {
    const result =
      await this.sdk.getV1ProjectsByProjectIdScreenerResponsesPayouts<true>({
        headers: this.headers,
        path: { projectId },
      })
    return result.data
  }

  /** View a specific screener response. */
  async retrieve(
    projectId: string,
    screenerResponseId: string,
  ): Promise<GetV1ProjectsByProjectIdScreenerResponsesByScreenerResponseIdResponse> {
    const result =
      await this.sdk.getV1ProjectsByProjectIdScreenerResponsesByScreenerResponseId<true>(
        {
          headers: this.headers,
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
  ): Promise<PatchV1ProjectsByProjectIdScreenerResponsesByScreenerResponseIdQualifyResponse> {
    const result =
      await this.sdk.patchV1ProjectsByProjectIdScreenerResponsesByScreenerResponseIdQualify<true>(
        {
          body,
          headers: this.headers,
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
  ): Promise<PatchV1ProjectsByProjectIdScreenerResponsesByScreenerResponseIdInviteResponse> {
    const result =
      await this.sdk.patchV1ProjectsByProjectIdScreenerResponsesByScreenerResponseIdInvite<true>(
        {
          body,
          headers: this.headers,
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
  ): Promise<PatchV1ProjectsByProjectIdScreenerResponsesByScreenerResponseIdScheduleResponse> {
    const result =
      await this.sdk.patchV1ProjectsByProjectIdScreenerResponsesByScreenerResponseIdSchedule<true>(
        {
          body,
          headers: this.headers,
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
  ): Promise<PatchV1ProjectsByProjectIdScreenerResponsesByScreenerResponseIdAttendedResponse> {
    const result =
      await this.sdk.patchV1ProjectsByProjectIdScreenerResponsesByScreenerResponseIdAttended<true>(
        {
          headers: this.headers,
          path: { projectId, screenerResponseId },
        },
      )
    return result.data
  }

  /** Mark a participant as a no-show. */
  async markNoShow(
    projectId: string,
    screenerResponseId: string,
  ): Promise<PatchV1ProjectsByProjectIdScreenerResponsesByScreenerResponseIdNoShowResponse> {
    const result =
      await this.sdk.patchV1ProjectsByProjectIdScreenerResponsesByScreenerResponseIdNoShow<true>(
        {
          headers: this.headers,
          path: { projectId, screenerResponseId },
        },
      )
    return result.data
  }

  /** Mark a participant as rejected. */
  async reject(
    projectId: string,
    screenerResponseId: string,
  ): Promise<PatchV1ProjectsByProjectIdScreenerResponsesByScreenerResponseIdRejectResponse> {
    const result =
      await this.sdk.patchV1ProjectsByProjectIdScreenerResponsesByScreenerResponseIdReject<true>(
        {
          headers: this.headers,
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
  ): Promise<PatchV1ProjectsByProjectIdScreenerResponsesByScreenerResponseIdReportResponse> {
    const result =
      await this.sdk.patchV1ProjectsByProjectIdScreenerResponsesByScreenerResponseIdReport<true>(
        {
          body,
          headers: this.headers,
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
  ): Promise<PatchV1ProjectsByProjectIdScreenerResponsesByScreenerResponseIdFavoriteResponse> {
    const result =
      await this.sdk.patchV1ProjectsByProjectIdScreenerResponsesByScreenerResponseIdFavorite<true>(
        {
          body,
          headers: this.headers,
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
  ): Promise<PatchV1ProjectsByProjectIdScreenerResponsesByScreenerResponseIdHideResponse> {
    const result =
      await this.sdk.patchV1ProjectsByProjectIdScreenerResponsesByScreenerResponseIdHide<true>(
        {
          body,
          headers: this.headers,
          path: { projectId, screenerResponseId },
        },
      )
    return result.data
  }

  /** Cancel an invitation. */
  async cancelInvite(
    projectId: string,
    screenerResponseId: string,
  ): Promise<PatchV1ProjectsByProjectIdScreenerResponsesByScreenerResponseIdCancelInviteResponse> {
    const result =
      await this.sdk.patchV1ProjectsByProjectIdScreenerResponsesByScreenerResponseIdCancelInvite<true>(
        {
          headers: this.headers,
          path: { projectId, screenerResponseId },
        },
      )
    return result.data
  }

  /** Cancel a booking. */
  async cancelBooking(
    projectId: string,
    screenerResponseId: string,
  ): Promise<PatchV1ProjectsByProjectIdScreenerResponsesByScreenerResponseIdCancelBookingResponse> {
    const result =
      await this.sdk.patchV1ProjectsByProjectIdScreenerResponsesByScreenerResponseIdCancelBooking<true>(
        {
          headers: this.headers,
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
  ): Promise<PatchV1ProjectsByProjectIdScreenerResponsesByScreenerResponseIdCancelBookingReinviteResponse> {
    const result =
      await this.sdk.patchV1ProjectsByProjectIdScreenerResponsesByScreenerResponseIdCancelBookingReinvite<true>(
        {
          body,
          headers: this.headers,
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
  ): Promise<PatchV1ProjectsByProjectIdScreenerResponsesByScreenerResponseIdParticipantCancelBookingResponse> {
    const result =
      await this.sdk.patchV1ProjectsByProjectIdScreenerResponsesByScreenerResponseIdParticipantCancelBooking<true>(
        {
          body,
          headers: this.headers,
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
  ): Promise<PostV1ProjectsByProjectIdScreenerResponsesByScreenerResponseIdExternalScreenerAnswersResponse> {
    const result =
      await this.sdk.postV1ProjectsByProjectIdScreenerResponsesByScreenerResponseIdExternalScreenerAnswers<true>(
        {
          body,
          headers: this.headers,
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
  ): Promise<void> {
    await this.sdk.postV1ProjectsByProjectIdScreenerResponsesByScreenerResponseIdPayouts<true>(
      {
        body,
        headers: this.headers,
        path: { projectId, screenerResponseId },
      },
    )
  }
}

/**
 * Quotas cap how many participants a project accepts per demographic segment.
 */
class QuotaModule extends RespondentModule {
  /** Create the quota for a project. */
  async create(
    projectId: string,
    body: PostV1ProjectsByProjectIdQuotaData['body'],
  ): Promise<PostV1ProjectsByProjectIdQuotaResponse> {
    const result = await this.sdk.postV1ProjectsByProjectIdQuota<true>({
      body,
      headers: this.headers,
      path: { projectId },
    })
    return result.data
  }

  /** Retrieve the quota for a project. */
  async retrieve(
    projectId: string,
  ): Promise<GetV1ProjectsByProjectIdQuotaResponse> {
    const result = await this.sdk.getV1ProjectsByProjectIdQuota<true>({
      headers: this.headers,
      path: { projectId },
    })
    return result.data
  }

  /** Update the quota for a project. */
  async update(
    projectId: string,
    body: PatchV1ProjectsByProjectIdQuotaData['body'],
  ): Promise<PatchV1ProjectsByProjectIdQuotaResponse> {
    const result = await this.sdk.patchV1ProjectsByProjectIdQuota<true>({
      body,
      headers: this.headers,
      path: { projectId },
    })
    return result.data
  }

  /** Delete the quota for a project. */
  async delete(
    projectId: string,
  ): Promise<DeleteV1ProjectsByProjectIdQuotaResponse> {
    const result = await this.sdk.deleteV1ProjectsByProjectIdQuota<true>({
      headers: this.headers,
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
class WebhooksModule extends RespondentModule {
  /** Retrieve the team's webhook. */
  async list(): Promise<GetV1WebhooksResponse> {
    const result = await this.sdk.getV1Webhooks<true>({
      headers: this.headers,
    })
    return result.data
  }

  /**
   * Create a webhook. The response carries the `privateKey` used to sign
   * deliveries — store it, and pass it to `verifyWebhookSignature`.
   */
  async create(
    body: PostV1WebhooksData['body'],
  ): Promise<PostV1WebhooksResponse> {
    const result = await this.sdk.postV1Webhooks<true>({
      body,
      headers: this.headers,
    })
    return result.data
  }

  /** Retrieve a specific webhook. */
  async retrieve(webhookId: string): Promise<GetV1WebhooksByWebhookIdResponse> {
    const result = await this.sdk.getV1WebhooksByWebhookId<true>({
      headers: this.headers,
      path: { webhookId },
    })
    return result.data
  }

  /** Deactivate a webhook. */
  async deactivate(webhookId: string): Promise<void> {
    await this.sdk.deleteV1WebhooksByWebhookId<true>({
      headers: this.headers,
      path: { webhookId },
    })
  }

  /** Retrieve the event types a webhook is subscribed to. */
  async listEventTypes(
    webhookId: string,
  ): Promise<GetV1WebhooksByWebhookIdEventTypesResponse> {
    const result = await this.sdk.getV1WebhooksByWebhookIdEventTypes<true>({
      headers: this.headers,
      path: { webhookId },
    })
    return result.data
  }

  /** Send a simulated event to the webhook's URL. */
  async simulate(
    webhookId: string,
    body: PostV1WebhooksByWebhookIdSimulateData['body'],
  ): Promise<void> {
    await this.sdk.postV1WebhooksByWebhookIdSimulate<true>({
      body,
      headers: this.headers,
      path: { webhookId },
    })
  }
}

/** Credit and incentive balances for the team. */
class PricingModule extends RespondentModule {
  /** View the credit and incentive balance. */
  async balanceSummary(): Promise<GetV1PricingBalancesSummaryResponse> {
    const result = await this.sdk.getV1PricingBalancesSummary<true>({
      headers: this.headers,
    })
    return result.data
  }
}

/** Participant profiles. */
class ProfilesModule extends RespondentModule {
  /** Retrieve a participant profile. */
  async retrieve(profileId: string): Promise<GetV1ProfilesByProfileIdResponse> {
    const result = await this.sdk.getV1ProfilesByProfileId<true>({
      headers: this.headers,
      path: { profileId },
    })
    return result.data
  }

  /**
   * Create a test participant. Staging only — this endpoint is rejected in
   * production.
   */
  async createTestParticipant(body: PostV1ProfilesData['body']): Promise<void> {
    await this.sdk.postV1Profiles<true>({
      body,
      headers: this.headers,
    })
  }
}

/** Past participants of the team's projects. */
class TeamRespondentsModule extends RespondentModule {
  /** Search past participants. */
  async list(
    query?: GetV1TeamRespondentsData['query'],
  ): Promise<GetV1TeamRespondentsResponse> {
    const result = await this.sdk.getV1TeamRespondents<true>({
      headers: this.headers,
      ...(query ? { query } : {}),
    })
    return result.data
  }

  /** Retrieve a past participant's profile. */
  async retrieve(
    profileId: string,
  ): Promise<GetV1TeamRespondentsProfilesByProfileIdResponse> {
    const result = await this.sdk.getV1TeamRespondentsProfilesByProfileId<true>(
      {
        headers: this.headers,
        path: { profileId },
      },
    )
    return result.data
  }

  /** Invite multiple past participants to a project. */
  async batchInvite(
    body: PutV1TeamRespondentsBatchInviteData['body'],
  ): Promise<PutV1TeamRespondentsBatchInviteResponse> {
    const result = await this.sdk.putV1TeamRespondentsBatchInvite<true>({
      body,
      headers: this.headers,
    })
    return result.data
  }
}

class ConversationsModule extends RespondentModule {
  /** Retrieve all conversations. */
  async list(
    query?: GetV1MessagingConversationsData['query'],
  ): Promise<GetV1MessagingConversationsResponse> {
    const result = await this.sdk.getV1MessagingConversations<true>({
      headers: this.headers,
      ...(query ? { query } : {}),
    })
    return result.data
  }

  /** Create a conversation. */
  async create(
    body: PostV1MessagingConversationsData['body'],
  ): Promise<PostV1MessagingConversationsResponse> {
    const result = await this.sdk.postV1MessagingConversations<true>({
      body,
      headers: this.headers,
    })
    return result.data
  }

  /** Retrieve a specific conversation. */
  async retrieve(
    conversationUid: string,
  ): Promise<GetV1MessagingConversationsByConversationUidResponse> {
    const result =
      await this.sdk.getV1MessagingConversationsByConversationUid<true>({
        headers: this.headers,
        path: { conversationUid },
      })
    return result.data
  }

  /** Update a conversation. */
  async update(
    conversationUid: string,
    body: PatchV1MessagingConversationsByConversationUidData['body'],
  ): Promise<PatchV1MessagingConversationsByConversationUidResponse> {
    const result =
      await this.sdk.patchV1MessagingConversationsByConversationUid<true>({
        body,
        headers: this.headers,
        path: { conversationUid },
      })
    return result.data
  }

  /** Mark a conversation as read. */
  async markAsRead(
    conversationUid: string,
  ): Promise<PatchV1MessagingConversationsByConversationUidReadResponse> {
    const result =
      await this.sdk.patchV1MessagingConversationsByConversationUidRead<true>({
        headers: this.headers,
        path: { conversationUid },
      })
    return result.data
  }

  /** Add a participant to a conversation. */
  async addParticipant(
    conversationUid: string,
    body: PostV1MessagingConversationsByConversationUidParticipantsData['body'],
  ): Promise<void> {
    await this.sdk.postV1MessagingConversationsByConversationUidParticipants<true>(
      {
        body,
        headers: this.headers,
        path: { conversationUid },
      },
    )
  }

  /** Remove a participant from a conversation. */
  async removeParticipant(
    conversationUid: string,
    participantUserId: string,
  ): Promise<DeleteV1MessagingConversationsByConversationUidParticipantsByParticipantUserIdResponse> {
    const result =
      await this.sdk.deleteV1MessagingConversationsByConversationUidParticipantsByParticipantUserId<true>(
        {
          headers: this.headers,
          path: { conversationUid, participantUserId },
        },
      )
    return result.data
  }
}

class MessagesModule extends RespondentModule {
  /** Retrieve all messages. */
  async list(
    query?: GetV1MessagingMessagesData['query'],
  ): Promise<GetV1MessagingMessagesResponse> {
    const result = await this.sdk.getV1MessagingMessages<true>({
      headers: this.headers,
      ...(query ? { query } : {}),
    })
    return result.data
  }

  /** Retrieve a specific message. */
  async retrieve(
    messageUid: string,
  ): Promise<GetV1MessagingMessagesByMessageUidResponse> {
    const result = await this.sdk.getV1MessagingMessagesByMessageUid<true>({
      headers: this.headers,
      path: { messageUid },
    })
    return result.data
  }

  /** Retrieve unread conversations. */
  async inbox(
    query?: GetV1MessagingMessagesInboxData['query'],
  ): Promise<GetV1MessagingMessagesInboxResponse> {
    const result = await this.sdk.getV1MessagingMessagesInbox<true>({
      headers: this.headers,
      ...(query ? { query } : {}),
    })
    return result.data
  }

  /** Create a message in a conversation. */
  async create(
    conversationUid: string,
    body: PostV1MessagingConversationsByConversationUidMessagesData['body'],
  ): Promise<PostV1MessagingConversationsByConversationUidMessagesResponse> {
    const result =
      await this.sdk.postV1MessagingConversationsByConversationUidMessages<true>(
        {
          body,
          headers: this.headers,
          path: { conversationUid },
        },
      )
    return result.data
  }
}

/**
 * Messaging with participants. `MESSAGES.CREATED` and `CONVERSATIONS.CREATED`
 * webhooks fire only for participant-sent messages, never researcher-sent ones.
 */
class MessagingModule extends RespondentModule {
  public readonly conversations: ConversationsModule
  public readonly messages: MessagesModule

  constructor(sdk: GeneratedRespondentSdk, headers: AuthHeaders) {
    super(sdk, headers)
    this.conversations = new ConversationsModule(sdk, headers)
    this.messages = new MessagesModule(sdk, headers)
  }

  /** Retrieve all conversations. */
  listConversations(
    query?: GetV1MessagingConversationsData['query'],
  ): Promise<GetV1MessagingConversationsResponse> {
    return this.conversations.list(query)
  }

  /** Create a conversation. */
  createConversation(
    body: PostV1MessagingConversationsData['body'],
  ): Promise<PostV1MessagingConversationsResponse> {
    return this.conversations.create(body)
  }

  /** Retrieve all messages. */
  listMessages(
    query?: GetV1MessagingMessagesData['query'],
  ): Promise<GetV1MessagingMessagesResponse> {
    return this.messages.list(query)
  }

  /** Create a message in a conversation. */
  createMessage(
    conversationUid: string,
    body: PostV1MessagingConversationsByConversationUidMessagesData['body'],
  ): Promise<PostV1MessagingConversationsByConversationUidMessagesResponse> {
    return this.messages.create(conversationUid, body)
  }

  /** Retrieve unread conversations. */
  inbox(
    query?: GetV1MessagingMessagesInboxData['query'],
  ): Promise<GetV1MessagingMessagesInboxResponse> {
    return this.messages.inbox(query)
  }
}

/**
 * Reference data used to build project targeting.
 *
 * Lookup IDs for industries, skills, topics and job titles differ between
 * staging and production, so resolve them at runtime per environment instead of
 * hardcoding them.
 */
class LookupsModule extends RespondentModule {
  /** Retrieve lookup values for the requested groups. */
  async values(
    query: GetV1LookupsData['query'],
  ): Promise<GetV1LookupsResponse> {
    const result = await this.sdk.getV1Lookups<true>({
      headers: this.headers,
      query,
    })
    return result.data
  }

  /** Retrieve the industry list. */
  async industries(
    query?: GetV1IndustriesData['query'],
  ): Promise<GetV1IndustriesResponse> {
    const result = await this.sdk.getV1Industries<true>({
      headers: this.headers,
      ...(query ? { query } : {}),
    })
    return result.data
  }

  /** Retrieve the job title list. */
  async jobTitles(
    query?: GetV1JobTitlesData['query'],
  ): Promise<GetV1JobTitlesResponse> {
    const result = await this.sdk.getV1JobTitles<true>({
      headers: this.headers,
      ...(query ? { query } : {}),
    })
    return result.data
  }

  /** Retrieve the skill list. */
  async skills(query?: GetV1SkillsData['query']): Promise<GetV1SkillsResponse> {
    const result = await this.sdk.getV1Skills<true>({
      headers: this.headers,
      ...(query ? { query } : {}),
    })
    return result.data
  }

  /** Retrieve the topics list. */
  async topics(query?: GetV1TopicsData['query']): Promise<GetV1TopicsResponse> {
    const result = await this.sdk.getV1Topics<true>({
      headers: this.headers,
      ...(query ? { query } : {}),
    })
    return result.data
  }
}

/**
 * Ergonomic wrapper around the generated Respondent Partner API client.
 *
 * Credentials are sent on every request as the `x-api-key` and `x-api-secret`
 * headers, non-2xx responses raise {@link RespondentSdkError}, and each helper
 * returns the typed response body.
 */
export class RespondentSdk {
  private readonly _sdk: GeneratedRespondentSdk
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
    const resolvedTimeoutMs = timeoutMs

    if (
      resolvedTimeoutMs !== undefined &&
      (!Number.isFinite(resolvedTimeoutMs) || resolvedTimeoutMs <= 0)
    ) {
      throw new Error('RespondentSdk timeoutMs must be a positive number')
    }

    const authHeaders: AuthHeaders = {
      [API_KEY_HEADER_NAME]: apiKey,
      [API_SECRET_HEADER_NAME]: apiSecret,
    }

    const clientInstance = createClient({
      baseUrl: baseUrl ?? RESPONDENT_PRODUCTION_BASE_URL,
      headers: authHeaders,
      responseStyle: 'fields',
      throwOnError: true,
    })

    if (resolvedTimeoutMs !== undefined) {
      const inflightTimeouts = new WeakMap<Request, () => void>()

      const finalizeRequest = (request?: Request) => {
        if (!request) {
          return
        }
        const cleanup = inflightTimeouts.get(request)
        cleanup?.()
        inflightTimeouts.delete(request)
      }

      clientInstance.interceptors.request.use((request, options) => {
        const controller = new AbortController()
        const originalSignal = request.signal
        let abortForwarder: (() => void) | undefined
        let timeoutId: ReturnType<typeof setTimeout> | undefined
        let cleanedUp = false

        const cleanup = () => {
          if (cleanedUp) {
            return
          }
          cleanedUp = true
          if (timeoutId !== undefined) {
            clearTimeout(timeoutId)
          }
          if (abortForwarder) {
            originalSignal.removeEventListener('abort', abortForwarder)
          }
        }

        controller.signal.addEventListener('abort', cleanup, { once: true })

        if (originalSignal.aborted) {
          controller.abort(
            createAbortError('Request aborted before timeout was applied'),
          )
        } else {
          abortForwarder = () => {
            controller.abort(
              createAbortError('Request aborted before timeout elapsed'),
            )
          }
          originalSignal.addEventListener('abort', abortForwarder, {
            once: true,
          })
        }

        const timedRequest = new Request(request, {
          signal: controller.signal,
        })
        inflightTimeouts.set(timedRequest, cleanup)

        if (!controller.signal.aborted) {
          timeoutId = setTimeout(() => {
            controller.abort(
              new RespondentSdkTimeoutError({
                timeoutMs: resolvedTimeoutMs,
                request: timedRequest,
              }),
            )
          }, resolvedTimeoutMs)
        }

        const originalFetch = options.fetch
        options.fetch = async (input, init) => {
          try {
            return await (originalFetch
              ? originalFetch(input, init)
              : globalThis.fetch(input, init))
          } finally {
            finalizeRequest(timedRequest)
          }
        }

        return timedRequest
      })

      clientInstance.interceptors.response.use((response, request) => {
        finalizeRequest(request)
        return response
      })

      clientInstance.interceptors.error.use((error, _response, request) => {
        finalizeRequest(request)
        return error
      })
    }

    clientInstance.interceptors.error.use((error, response, request) => {
      if (isRespondentSdkError(error) || isRespondentSdkTimeoutError(error)) {
        return error
      }

      return new RespondentSdkError({
        payload: error,
        response,
        request,
      })
    })

    this._sdk = new GeneratedRespondentSdk({ client: clientInstance })
    this.projects = new ProjectsModule(this._sdk, authHeaders)
    this.screenerQuestions = new ScreenerQuestionsModule(this._sdk, authHeaders)
    this.screenerResponses = new ScreenerResponsesModule(this._sdk, authHeaders)
    this.quota = new QuotaModule(this._sdk, authHeaders)
    this.webhooks = new WebhooksModule(this._sdk, authHeaders)
    this.pricing = new PricingModule(this._sdk, authHeaders)
    this.profiles = new ProfilesModule(this._sdk, authHeaders)
    this.teamRespondents = new TeamRespondentsModule(this._sdk, authHeaders)
    this.messaging = new MessagingModule(this._sdk, authHeaders)
    this.lookups = new LookupsModule(this._sdk, authHeaders)
  }
}
