/**
 * Every wrapper operation, checked against the vendored OpenAPI document.
 *
 * The expected method and path template on each row are written from the
 * provider's spec, not read back from the wrapper, so a helper wired to the
 * wrong generated operation fails here. Each row also asserts that the route it
 * claims really exists in `schemas/openapi.json`.
 */
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { afterEach, describe, expect, it, vi } from 'vitest'
import * as z from 'zod/v4'
import { RespondentSdk } from '../src/index'
import type {
  CreateB2cProjectDto,
  ExternalQuestion,
  PostV1ProjectsByProjectIdScreenerQuestionsData,
  PutV1ProjectsByProjectIdScreenerQuestionsBulkData,
} from '../src/index'

const SpecDocument = z.object({
  paths: z.record(z.string(), z.record(z.string(), z.unknown())),
})

const specJson: unknown = JSON.parse(
  readFileSync(
    fileURLToPath(new URL('../schemas/openapi.json', import.meta.url)),
    'utf-8',
  ),
)
const spec = SpecDocument.parse(specJson)

const PROJECT_ID = 'project-1'
const SCREENER_QUESTION_ID = 'question-1'
const SCREENER_RESPONSE_ID = 'response-1'
const WEBHOOK_ID = 'webhook-1'
const PROFILE_ID = 'profile-1'
const CONVERSATION_UID = 'conversation-1'
const MESSAGE_UID = 'message-1'
const PARTICIPANT_USER_ID = 'participant-1'

const projectBody: CreateB2cProjectDto = {
  publicTitle: 'Coffee habits study',
  publicInternalName: 'coffee-habits',
  targetMarketType: 'b2c',
  typeOfResearch: 'remote',
  targetResearchMethodology: 'oneOnOne',
  participantTimeRequiredMinutes: 30,
  incentiveAmount: 50,
  targetNumberOfParticipants: 5,
  targetProjectTopics: ['topic-1'],
  externalResearcher: {
    researcherId: 'researcher-1',
    researcherName: 'Ada Lovelace',
    bookingUrl: 'https://example.com/book',
  },
}

const externalQuestions: ExternalQuestion[] = [
  { questionId: 'q1', questionType: 'TEXT', text: 'Why coffee?' },
]

const screenerQuestion: PostV1ProjectsByProjectIdScreenerQuestionsData['body'] =
  {
    text: 'How often do you drink coffee?',
    questionType: 'radio',
    answers: [
      { text: 'Daily', answerValue: 1 },
      { text: 'Never', answerValue: 2 },
    ],
  }

const screenerQuestionsBulk: PutV1ProjectsByProjectIdScreenerQuestionsBulkData['body'] =
  [
    {
      text: 'How often do you drink coffee?',
      questionType: 'radio',
      answers: [{ text: 'Daily', answerValue: 1 }],
    },
  ]

type OperationCase = {
  /** `module.method`, used as the test name. */
  name: string
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  /** Path template exactly as the provider's spec declares it. */
  template: string
  /** Path parameter values, in the order they appear in the template. */
  params?: string[]
  /** Expected JSON request body, when the operation sends one. */
  body?: unknown
  /** Expected query string parameters. */
  query?: Record<string, string>
  /** The operation sends a multipart body rather than JSON. */
  multipart?: boolean
  run: (sdk: RespondentSdk) => Promise<unknown>
}

const cases: OperationCase[] = [
  // Projects
  {
    name: 'projects.list',
    method: 'GET',
    template: '/v1/projects',
    query: { status: 'DRAFT' },
    run: (sdk) => sdk.projects.list({ status: 'DRAFT' }),
  },
  {
    name: 'projects.create',
    method: 'POST',
    template: '/v1/projects',
    body: projectBody,
    run: (sdk) => sdk.projects.create(projectBody),
  },
  {
    name: 'projects.retrieve',
    method: 'GET',
    template: '/v1/projects/{projectId}',
    params: [PROJECT_ID],
    run: (sdk) => sdk.projects.retrieve(PROJECT_ID),
  },
  {
    name: 'projects.update',
    method: 'PATCH',
    template: '/v1/projects/{projectId}',
    params: [PROJECT_ID],
    body: { publicDescription: 'A 30 minute chat.' },
    run: (sdk) =>
      sdk.projects.update(PROJECT_ID, {
        publicDescription: 'A 30 minute chat.',
      }),
  },
  {
    name: 'projects.delete',
    method: 'DELETE',
    template: '/v1/projects/{projectId}',
    params: [PROJECT_ID],
    run: (sdk) => sdk.projects.delete(PROJECT_ID),
  },
  {
    name: 'projects.copy',
    method: 'POST',
    template: '/v1/projects/{projectId}/copy',
    params: [PROJECT_ID],
    run: (sdk) => sdk.projects.copy(PROJECT_ID),
  },
  {
    name: 'projects.publish',
    method: 'PATCH',
    template: '/v1/projects/{projectId}/publish',
    params: [PROJECT_ID],
    run: (sdk) => sdk.projects.publish(PROJECT_ID),
  },
  {
    name: 'projects.pause',
    method: 'PATCH',
    template: '/v1/projects/{projectId}/pause',
    params: [PROJECT_ID],
    body: { paused: true },
    run: (sdk) => sdk.projects.pause(PROJECT_ID, { paused: true }),
  },
  {
    name: 'projects.close',
    method: 'PATCH',
    template: '/v1/projects/{projectId}/close',
    params: [PROJECT_ID],
    body: { message: 'Wrapping up' },
    run: (sdk) => sdk.projects.close(PROJECT_ID, { message: 'Wrapping up' }),
  },
  {
    name: 'projects.audienceSizeEstimate',
    method: 'GET',
    template: '/v1/projects/{projectId}/feasibility/audience-size-estimate',
    params: [PROJECT_ID],
    run: (sdk) => sdk.projects.audienceSizeEstimate(PROJECT_ID),
  },
  {
    name: 'projects.replaceExternalScreenerQuestions',
    method: 'PUT',
    template: '/v1/projects/{projectId}/external-screener-questions/bulk',
    params: [PROJECT_ID],
    body: externalQuestions,
    run: (sdk) =>
      sdk.projects.replaceExternalScreenerQuestions(
        PROJECT_ID,
        externalQuestions,
      ),
  },
  {
    name: 'projects.uploadFile',
    method: 'PUT',
    template: '/v1/projects/{projectId}/files/form-data',
    params: [PROJECT_ID],
    query: { type: 'nda' },
    multipart: true,
    run: (sdk) =>
      sdk.projects.uploadFile(
        PROJECT_ID,
        { uploadFile: new File([new Uint8Array([1, 2, 3])], 'nda.pdf') },
        { type: 'nda' },
      ),
  },
  {
    name: 'projects.pitchSuggestions',
    method: 'POST',
    template: '/v1/projects/suggestions',
    body: { name: 'Coffee habits', description: 'A study about coffee.' },
    run: (sdk) =>
      sdk.projects.pitchSuggestions({
        name: 'Coffee habits',
        description: 'A study about coffee.',
      }),
  },

  // Screener questions
  {
    name: 'screenerQuestions.list',
    method: 'GET',
    template: '/v1/projects/{projectId}/screener-questions',
    params: [PROJECT_ID],
    run: (sdk) => sdk.screenerQuestions.list(PROJECT_ID),
  },
  {
    name: 'screenerQuestions.create',
    method: 'POST',
    template: '/v1/projects/{projectId}/screener-questions',
    params: [PROJECT_ID],
    body: screenerQuestion,
    run: (sdk) => sdk.screenerQuestions.create(PROJECT_ID, screenerQuestion),
  },
  {
    name: 'screenerQuestions.replaceAll',
    method: 'PUT',
    template: '/v1/projects/{projectId}/screener-questions/bulk',
    params: [PROJECT_ID],
    body: screenerQuestionsBulk,
    run: (sdk) =>
      sdk.screenerQuestions.replaceAll(PROJECT_ID, screenerQuestionsBulk),
  },
  {
    name: 'screenerQuestions.retrieve',
    method: 'GET',
    template:
      '/v1/projects/{projectId}/screener-questions/{screenerQuestionId}',
    params: [PROJECT_ID, SCREENER_QUESTION_ID],
    run: (sdk) =>
      sdk.screenerQuestions.retrieve(PROJECT_ID, SCREENER_QUESTION_ID),
  },
  {
    name: 'screenerQuestions.update',
    method: 'PATCH',
    template:
      '/v1/projects/{projectId}/screener-questions/{screenerQuestionId}',
    params: [PROJECT_ID, SCREENER_QUESTION_ID],
    body: { text: 'Renamed question' },
    run: (sdk) =>
      sdk.screenerQuestions.update(PROJECT_ID, SCREENER_QUESTION_ID, {
        text: 'Renamed question',
      }),
  },
  {
    name: 'screenerQuestions.delete',
    method: 'DELETE',
    template:
      '/v1/projects/{projectId}/screener-questions/{screenerQuestionId}',
    params: [PROJECT_ID, SCREENER_QUESTION_ID],
    run: (sdk) =>
      sdk.screenerQuestions.delete(PROJECT_ID, SCREENER_QUESTION_ID),
  },
  {
    name: 'screenerQuestions.reorder',
    method: 'PATCH',
    template: '/v1/projects/{projectId}/screener-questions/order',
    params: [PROJECT_ID],
    body: [SCREENER_QUESTION_ID],
    run: (sdk) =>
      sdk.screenerQuestions.reorder(PROJECT_ID, [SCREENER_QUESTION_ID]),
  },

  // Screener responses
  {
    name: 'screenerResponses.list',
    method: 'GET',
    template: '/v1/projects/{projectId}/screener-responses',
    params: [PROJECT_ID],
    query: { status: 'PENDING' },
    run: (sdk) => sdk.screenerResponses.list(PROJECT_ID, { status: 'PENDING' }),
  },
  {
    name: 'screenerResponses.payoutSummary',
    method: 'GET',
    template: '/v1/projects/{projectId}/screener-responses/payouts',
    params: [PROJECT_ID],
    run: (sdk) => sdk.screenerResponses.payoutSummary(PROJECT_ID),
  },
  {
    name: 'screenerResponses.retrieve',
    method: 'GET',
    template:
      '/v1/projects/{projectId}/screener-responses/{screenerResponseId}',
    params: [PROJECT_ID, SCREENER_RESPONSE_ID],
    run: (sdk) =>
      sdk.screenerResponses.retrieve(PROJECT_ID, SCREENER_RESPONSE_ID),
  },
  {
    name: 'screenerResponses.qualify',
    method: 'PATCH',
    template:
      '/v1/projects/{projectId}/screener-responses/{screenerResponseId}/qualify',
    params: [PROJECT_ID, SCREENER_RESPONSE_ID],
    body: {
      qualifyStatus: true,
      qualifiedOverriden: false,
      disqualifyReasons: [],
      message: '',
    },
    run: (sdk) =>
      sdk.screenerResponses.qualify(PROJECT_ID, SCREENER_RESPONSE_ID, {
        qualifyStatus: true,
        qualifiedOverriden: false,
        disqualifyReasons: [],
        message: '',
      }),
  },
  {
    name: 'screenerResponses.invite',
    method: 'PATCH',
    template:
      '/v1/projects/{projectId}/screener-responses/{screenerResponseId}/invite',
    params: [PROJECT_ID, SCREENER_RESPONSE_ID],
    body: { meetingLink: 'https://example.com/session' },
    run: (sdk) =>
      sdk.screenerResponses.invite(PROJECT_ID, SCREENER_RESPONSE_ID, {
        meetingLink: 'https://example.com/session',
      }),
  },
  {
    name: 'screenerResponses.schedule',
    method: 'PATCH',
    template:
      '/v1/projects/{projectId}/screener-responses/{screenerResponseId}/schedule',
    params: [PROJECT_ID, SCREENER_RESPONSE_ID],
    body: { timezone: 'Europe/London', bookedDate: '2026-02-01T10:00:00.000Z' },
    run: (sdk) =>
      sdk.screenerResponses.schedule(PROJECT_ID, SCREENER_RESPONSE_ID, {
        timezone: 'Europe/London',
        bookedDate: '2026-02-01T10:00:00.000Z',
      }),
  },
  {
    name: 'screenerResponses.markAttended',
    method: 'PATCH',
    template:
      '/v1/projects/{projectId}/screener-responses/{screenerResponseId}/attended',
    params: [PROJECT_ID, SCREENER_RESPONSE_ID],
    run: (sdk) =>
      sdk.screenerResponses.markAttended(PROJECT_ID, SCREENER_RESPONSE_ID),
  },
  {
    name: 'screenerResponses.markNoShow',
    method: 'PATCH',
    template:
      '/v1/projects/{projectId}/screener-responses/{screenerResponseId}/no-show',
    params: [PROJECT_ID, SCREENER_RESPONSE_ID],
    run: (sdk) =>
      sdk.screenerResponses.markNoShow(PROJECT_ID, SCREENER_RESPONSE_ID),
  },
  {
    name: 'screenerResponses.reject',
    method: 'PATCH',
    template:
      '/v1/projects/{projectId}/screener-responses/{screenerResponseId}/reject',
    params: [PROJECT_ID, SCREENER_RESPONSE_ID],
    run: (sdk) =>
      sdk.screenerResponses.reject(PROJECT_ID, SCREENER_RESPONSE_ID),
  },
  {
    name: 'screenerResponses.report',
    method: 'PATCH',
    template:
      '/v1/projects/{projectId}/screener-responses/{screenerResponseId}/report',
    params: [PROJECT_ID, SCREENER_RESPONSE_ID],
    body: { reasons: ['NOSHOW'], flaggedMessage: 'Did not attend' },
    run: (sdk) =>
      sdk.screenerResponses.report(PROJECT_ID, SCREENER_RESPONSE_ID, {
        reasons: ['NOSHOW'],
        flaggedMessage: 'Did not attend',
      }),
  },
  {
    name: 'screenerResponses.favorite',
    method: 'PATCH',
    template:
      '/v1/projects/{projectId}/screener-responses/{screenerResponseId}/favorite',
    params: [PROJECT_ID, SCREENER_RESPONSE_ID],
    body: { favorite: true },
    run: (sdk) =>
      sdk.screenerResponses.favorite(PROJECT_ID, SCREENER_RESPONSE_ID, {
        favorite: true,
      }),
  },
  {
    name: 'screenerResponses.hide',
    method: 'PATCH',
    template:
      '/v1/projects/{projectId}/screener-responses/{screenerResponseId}/hide',
    params: [PROJECT_ID, SCREENER_RESPONSE_ID],
    body: { hidden: true },
    run: (sdk) =>
      sdk.screenerResponses.hide(PROJECT_ID, SCREENER_RESPONSE_ID, {
        hidden: true,
      }),
  },
  {
    name: 'screenerResponses.cancelInvite',
    method: 'PATCH',
    template:
      '/v1/projects/{projectId}/screener-responses/{screenerResponseId}/cancel-invite',
    params: [PROJECT_ID, SCREENER_RESPONSE_ID],
    run: (sdk) =>
      sdk.screenerResponses.cancelInvite(PROJECT_ID, SCREENER_RESPONSE_ID),
  },
  {
    name: 'screenerResponses.cancelBooking',
    method: 'PATCH',
    template:
      '/v1/projects/{projectId}/screener-responses/{screenerResponseId}/cancel-booking',
    params: [PROJECT_ID, SCREENER_RESPONSE_ID],
    run: (sdk) =>
      sdk.screenerResponses.cancelBooking(PROJECT_ID, SCREENER_RESPONSE_ID),
  },
  {
    name: 'screenerResponses.cancelBookingAndReinvite',
    method: 'PATCH',
    template:
      '/v1/projects/{projectId}/screener-responses/{screenerResponseId}/cancel-booking-reinvite',
    params: [PROJECT_ID, SCREENER_RESPONSE_ID],
    body: { message: 'Rescheduling' },
    run: (sdk) =>
      sdk.screenerResponses.cancelBookingAndReinvite(
        PROJECT_ID,
        SCREENER_RESPONSE_ID,
        { message: 'Rescheduling' },
      ),
  },
  {
    name: 'screenerResponses.participantCancelBooking',
    method: 'PATCH',
    template:
      '/v1/projects/{projectId}/screener-responses/{screenerResponseId}/participant-cancel-booking',
    params: [PROJECT_ID, SCREENER_RESPONSE_ID],
    body: { message: 'Participant cancelled' },
    run: (sdk) =>
      sdk.screenerResponses.participantCancelBooking(
        PROJECT_ID,
        SCREENER_RESPONSE_ID,
        { message: 'Participant cancelled' },
      ),
  },
  {
    name: 'screenerResponses.ingestExternalScreenerAnswers',
    method: 'POST',
    template:
      '/v1/projects/{projectId}/screener-responses/{screenerResponseId}/external-screener-answers',
    params: [PROJECT_ID, SCREENER_RESPONSE_ID],
    body: {
      answers: [
        { questionId: 'q1', answerText: 'Because coffee', qualifies: true },
      ],
    },
    run: (sdk) =>
      sdk.screenerResponses.ingestExternalScreenerAnswers(
        PROJECT_ID,
        SCREENER_RESPONSE_ID,
        {
          answers: [
            { questionId: 'q1', answerText: 'Because coffee', qualifies: true },
          ],
        },
      ),
  },
  {
    name: 'screenerResponses.payout',
    method: 'POST',
    template:
      '/v1/projects/{projectId}/screener-responses/{screenerResponseId}/payouts',
    params: [PROJECT_ID, SCREENER_RESPONSE_ID],
    body: { payoutCount: 1 },
    run: (sdk) =>
      sdk.screenerResponses.payout(PROJECT_ID, SCREENER_RESPONSE_ID, {
        payoutCount: 1,
      }),
  },

  // Quota
  {
    name: 'quota.create',
    method: 'POST',
    template: '/v1/projects/{projectId}/quota',
    params: [PROJECT_ID],
    body: { version: 'v1' },
    run: (sdk) => sdk.quota.create(PROJECT_ID, { version: 'v1' }),
  },
  {
    name: 'quota.retrieve',
    method: 'GET',
    template: '/v1/projects/{projectId}/quota',
    params: [PROJECT_ID],
    run: (sdk) => sdk.quota.retrieve(PROJECT_ID),
  },
  {
    name: 'quota.update',
    method: 'PATCH',
    template: '/v1/projects/{projectId}/quota',
    params: [PROJECT_ID],
    body: { version: 'v1' },
    run: (sdk) => sdk.quota.update(PROJECT_ID, { version: 'v1' }),
  },
  {
    name: 'quota.delete',
    method: 'DELETE',
    template: '/v1/projects/{projectId}/quota',
    params: [PROJECT_ID],
    run: (sdk) => sdk.quota.delete(PROJECT_ID),
  },

  // Webhooks
  {
    name: 'webhooks.list',
    method: 'GET',
    template: '/v1/webhooks',
    run: (sdk) => sdk.webhooks.list(),
  },
  {
    name: 'webhooks.create',
    method: 'POST',
    template: '/v1/webhooks',
    body: { url: 'https://example.com/hooks/respondent' },
    run: (sdk) =>
      sdk.webhooks.create({ url: 'https://example.com/hooks/respondent' }),
  },
  {
    name: 'webhooks.retrieve',
    method: 'GET',
    template: '/v1/webhooks/{webhookId}',
    params: [WEBHOOK_ID],
    run: (sdk) => sdk.webhooks.retrieve(WEBHOOK_ID),
  },
  {
    name: 'webhooks.deactivate',
    method: 'DELETE',
    template: '/v1/webhooks/{webhookId}',
    params: [WEBHOOK_ID],
    run: (sdk) => sdk.webhooks.deactivate(WEBHOOK_ID),
  },
  {
    name: 'webhooks.listEventTypes',
    method: 'GET',
    template: '/v1/webhooks/{webhookId}/event-types',
    params: [WEBHOOK_ID],
    run: (sdk) => sdk.webhooks.listEventTypes(WEBHOOK_ID),
  },
  {
    name: 'webhooks.simulate',
    method: 'POST',
    template: '/v1/webhooks/{webhookId}/simulate',
    params: [WEBHOOK_ID],
    body: { event: 'PROJECTS.UPDATED' },
    run: (sdk) =>
      sdk.webhooks.simulate(WEBHOOK_ID, { event: 'PROJECTS.UPDATED' }),
  },

  // Pricing
  {
    name: 'pricing.balanceSummary',
    method: 'GET',
    template: '/v1/pricing/balances/summary',
    run: (sdk) => sdk.pricing.balanceSummary(),
  },

  // Profiles
  {
    name: 'profiles.retrieve',
    method: 'GET',
    template: '/v1/profiles/{profileId}',
    params: [PROFILE_ID],
    run: (sdk) => sdk.profiles.retrieve(PROFILE_ID),
  },
  {
    name: 'profiles.createTestParticipant',
    method: 'POST',
    template: '/v1/profiles',
    body: {
      email: 'test@example.com',
      workEmail: 'test@example.com',
      firstName: 'Ada',
      lastName: 'Lovelace',
      password: 'hunter2hunter2',
      gender: 'female',
    },
    run: (sdk) =>
      sdk.profiles.createTestParticipant({
        email: 'test@example.com',
        workEmail: 'test@example.com',
        firstName: 'Ada',
        lastName: 'Lovelace',
        password: 'hunter2hunter2',
        gender: 'female',
      }),
  },

  // Team respondents
  {
    name: 'teamRespondents.list',
    method: 'GET',
    template: '/v1/team-respondents',
    query: { page: '2' },
    run: (sdk) => sdk.teamRespondents.list({ page: 2 }),
  },
  {
    name: 'teamRespondents.retrieve',
    method: 'GET',
    template: '/v1/team-respondents/profiles/{profileId}',
    params: [PROFILE_ID],
    run: (sdk) => sdk.teamRespondents.retrieve(PROFILE_ID),
  },
  {
    name: 'teamRespondents.batchInvite',
    method: 'PUT',
    template: '/v1/team-respondents/batch-invite',
    body: {
      projectId: PROJECT_ID,
      participants: [{ profileId: PROFILE_ID, skipScreenerQuestions: false }],
      message: 'Come back?',
    },
    run: (sdk) =>
      sdk.teamRespondents.batchInvite({
        projectId: PROJECT_ID,
        participants: [{ profileId: PROFILE_ID, skipScreenerQuestions: false }],
        message: 'Come back?',
      }),
  },

  // Messaging — conversations
  {
    name: 'messaging.conversations.list',
    method: 'GET',
    template: '/v1/messaging/conversations',
    run: (sdk) => sdk.messaging.conversations.list(),
  },
  {
    name: 'messaging.conversations.create',
    method: 'POST',
    template: '/v1/messaging/conversations',
    body: { projectId: PROJECT_ID, participantUserIds: [PARTICIPANT_USER_ID] },
    run: (sdk) =>
      sdk.messaging.conversations.create({
        projectId: PROJECT_ID,
        participantUserIds: [PARTICIPANT_USER_ID],
      }),
  },
  {
    name: 'messaging.conversations.retrieve',
    method: 'GET',
    template: '/v1/messaging/conversations/{conversationUid}',
    params: [CONVERSATION_UID],
    run: (sdk) => sdk.messaging.conversations.retrieve(CONVERSATION_UID),
  },
  {
    name: 'messaging.conversations.update',
    method: 'PATCH',
    template: '/v1/messaging/conversations/{conversationUid}',
    params: [CONVERSATION_UID],
    body: { name: 'Renamed' },
    run: (sdk) =>
      sdk.messaging.conversations.update(CONVERSATION_UID, { name: 'Renamed' }),
  },
  {
    name: 'messaging.conversations.markAsRead',
    method: 'PATCH',
    template: '/v1/messaging/conversations/{conversationUid}/read',
    params: [CONVERSATION_UID],
    run: (sdk) => sdk.messaging.conversations.markAsRead(CONVERSATION_UID),
  },
  {
    name: 'messaging.conversations.addParticipant',
    method: 'POST',
    template: '/v1/messaging/conversations/{conversationUid}/participants',
    params: [CONVERSATION_UID],
    body: { participantUserId: PARTICIPANT_USER_ID },
    run: (sdk) =>
      sdk.messaging.conversations.addParticipant(CONVERSATION_UID, {
        participantUserId: PARTICIPANT_USER_ID,
      }),
  },
  {
    name: 'messaging.conversations.removeParticipant',
    method: 'DELETE',
    template:
      '/v1/messaging/conversations/{conversationUid}/participants/{participantUserId}',
    params: [CONVERSATION_UID, PARTICIPANT_USER_ID],
    run: (sdk) =>
      sdk.messaging.conversations.removeParticipant(
        CONVERSATION_UID,
        PARTICIPANT_USER_ID,
      ),
  },

  // Messaging — messages
  {
    name: 'messaging.messages.list',
    method: 'GET',
    template: '/v1/messaging/messages',
    run: (sdk) => sdk.messaging.messages.list(),
  },
  {
    name: 'messaging.messages.retrieve',
    method: 'GET',
    template: '/v1/messaging/messages/{messageUid}',
    params: [MESSAGE_UID],
    run: (sdk) => sdk.messaging.messages.retrieve(MESSAGE_UID),
  },
  {
    name: 'messaging.messages.inbox',
    method: 'GET',
    template: '/v1/messaging/messages/inbox',
    run: (sdk) => sdk.messaging.messages.inbox(),
  },
  {
    name: 'messaging.messages.create',
    method: 'POST',
    template: '/v1/messaging/conversations/{conversationUid}/messages',
    params: [CONVERSATION_UID],
    body: { body: 'Hello' },
    run: (sdk) =>
      sdk.messaging.messages.create(CONVERSATION_UID, { body: 'Hello' }),
  },

  // Lookups
  {
    name: 'lookups.values',
    method: 'GET',
    template: '/v1/lookups',
    query: { pick: 'gender' },
    run: (sdk) => sdk.lookups.values({ pick: ['gender'] }),
  },
  {
    name: 'lookups.industries',
    method: 'GET',
    template: '/v1/industries',
    run: (sdk) => sdk.lookups.industries(),
  },
  {
    name: 'lookups.jobTitles',
    method: 'GET',
    template: '/v1/job-titles',
    run: (sdk) => sdk.lookups.jobTitles(),
  },
  {
    name: 'lookups.skills',
    method: 'GET',
    template: '/v1/skills',
    run: (sdk) => sdk.lookups.skills(),
  },
  {
    name: 'lookups.topics',
    method: 'GET',
    template: '/v1/topics',
    query: { pageSize: '1' },
    run: (sdk) => sdk.lookups.topics({ pageSize: 1 }),
  },
]

/**
 * The public delegates on `respondent.messaging`. They forward to
 * `messaging.conversations.*` and `messaging.messages.*`, so their routes are
 * already claimed in `cases`; they live in their own table to keep the
 * "every route exactly once" assertion endpoint-based.
 */
const delegateCases: OperationCase[] = [
  {
    name: 'messaging.listConversations',
    method: 'GET',
    template: '/v1/messaging/conversations',
    run: (sdk) => sdk.messaging.listConversations(),
  },
  {
    name: 'messaging.createConversation',
    method: 'POST',
    template: '/v1/messaging/conversations',
    body: { projectId: PROJECT_ID, participantUserIds: [PARTICIPANT_USER_ID] },
    run: (sdk) =>
      sdk.messaging.createConversation({
        projectId: PROJECT_ID,
        participantUserIds: [PARTICIPANT_USER_ID],
      }),
  },
  {
    name: 'messaging.listMessages',
    method: 'GET',
    template: '/v1/messaging/messages',
    run: (sdk) => sdk.messaging.listMessages(),
  },
  {
    name: 'messaging.createMessage',
    method: 'POST',
    template: '/v1/messaging/conversations/{conversationUid}/messages',
    params: [CONVERSATION_UID],
    body: { body: 'Hello' },
    run: (sdk) =>
      sdk.messaging.createMessage(CONVERSATION_UID, { body: 'Hello' }),
  },
  {
    name: 'messaging.inbox',
    method: 'GET',
    template: '/v1/messaging/messages/inbox',
    run: (sdk) => sdk.messaging.inbox(),
  },
]

type SignalCase = {
  /** `module.method`, used as the test name. */
  name: string
  run: (sdk: RespondentSdk, signal: AbortSignal) => Promise<unknown>
}

/**
 * One method per module, plus one messaging delegate: every wrapper operation
 * spreads the same `requestControls(options)`, so one row per group is enough
 * to catch a module that forgot the trailing options argument.
 */
const signalCases: SignalCase[] = [
  {
    name: 'projects.list',
    run: (sdk, signal) => sdk.projects.list(undefined, { signal }),
  },
  {
    name: 'screenerQuestions.list',
    run: (sdk, signal) => sdk.screenerQuestions.list(PROJECT_ID, { signal }),
  },
  {
    name: 'screenerResponses.list',
    run: (sdk, signal) =>
      sdk.screenerResponses.list(PROJECT_ID, undefined, { signal }),
  },
  {
    name: 'quota.retrieve',
    run: (sdk, signal) => sdk.quota.retrieve(PROJECT_ID, { signal }),
  },
  {
    name: 'webhooks.list',
    run: (sdk, signal) => sdk.webhooks.list({ signal }),
  },
  {
    name: 'pricing.balanceSummary',
    run: (sdk, signal) => sdk.pricing.balanceSummary({ signal }),
  },
  {
    name: 'profiles.retrieve',
    run: (sdk, signal) => sdk.profiles.retrieve(PROFILE_ID, { signal }),
  },
  {
    name: 'teamRespondents.list',
    run: (sdk, signal) => sdk.teamRespondents.list(undefined, { signal }),
  },
  {
    name: 'messaging.conversations.list',
    run: (sdk, signal) =>
      sdk.messaging.conversations.list(undefined, { signal }),
  },
  {
    name: 'messaging.messages.list',
    run: (sdk, signal) => sdk.messaging.messages.list(undefined, { signal }),
  },
  {
    name: 'messaging.listConversations',
    run: (sdk, signal) =>
      sdk.messaging.listConversations(undefined, { signal }),
  },
  {
    name: 'lookups.values',
    run: (sdk, signal) => sdk.lookups.values({ pick: ['gender'] }, { signal }),
  },
]

const expandTemplate = (template: string, params: string[]): string => {
  let index = 0
  return template.replace(/\{[^}]+\}/g, () => {
    const value = params[index]
    index += 1
    if (value === undefined) {
      throw new Error(`Missing path parameter ${String(index)} for ${template}`)
    }
    return value
  })
}

const hitsDocumentedRoute = async (entry: OperationCase) => {
  const params = entry.params ?? []
  const expectedPath = expandTemplate(entry.template, params)

  // The route must exist in the vendored spec with this method.
  expect(
    Reflect.get(spec.paths[entry.template] ?? {}, entry.method.toLowerCase()),
  ).toBeTruthy()

  const requests: { request: Request; body: string }[] = []
  vi.stubGlobal(
    'fetch',
    vi.fn(async (request: Request) => {
      requests.push({ request, body: await request.text() })
      return new Response(JSON.stringify({ ok: true }), {
        headers: { 'Content-Type': 'application/json' },
      })
    }),
  )

  const sdk = new RespondentSdk({
    apiKey: 'client-id',
    apiSecret: 'client-secret',
  })
  await entry.run(sdk)

  expect(requests).toHaveLength(1)
  const call = requests[0]
  if (!call) {
    throw new Error('no request captured')
  }

  const url = new URL(call.request.url)
  expect(call.request.method).toBe(entry.method)
  expect(url.pathname).toBe(expectedPath)

  for (const [key, value] of Object.entries(entry.query ?? {})) {
    expect(url.searchParams.get(key)).toBe(value)
  }

  if (entry.multipart) {
    expect(call.request.headers.get('content-type')).toMatch(
      /^multipart\/form-data; boundary=/,
    )
  } else if (entry.body === undefined) {
    expect(call.body).toBe('')
  } else {
    expect(JSON.parse(call.body)).toEqual(entry.body)
    expect(call.request.headers.get('content-type')).toBe('application/json')
  }
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('wrapper operations', () => {
  it('covers every non-deprecated operation in the spec exactly once', () => {
    const wrapped = new Set(
      cases.map((entry) => `${entry.method} ${entry.template}`),
    )

    const documented = new Set<string>()
    for (const [path, item] of Object.entries(spec.paths)) {
      for (const [method, operation] of Object.entries(item)) {
        if (
          typeof operation !== 'object' ||
          operation === null ||
          Reflect.get(operation, 'deprecated') === true
        ) {
          continue
        }
        documented.add(`${method.toUpperCase()} ${path}`)
      }
    }

    expect(cases).toHaveLength(wrapped.size)
    expect([...wrapped].sort()).toEqual([...documented].sort())
  })

  it.each(cases)('$name hits the documented route', hitsDocumentedRoute)
})

describe('messaging delegates', () => {
  it.each(delegateCases)('$name hits the documented route', hitsDocumentedRoute)
})

describe('request signals', () => {
  it.each(signalCases)('$name forwards the caller signal', async (entry) => {
    vi.stubGlobal(
      'fetch',
      vi.fn((request: Request) => {
        // Mirror `fetch`: an already-aborted signal rejects with its reason.
        if (request.signal.aborted) {
          return Promise.reject(request.signal.reason as Error)
        }
        return Promise.resolve(
          new Response('{}', {
            headers: { 'Content-Type': 'application/json' },
          }),
        )
      }),
    )

    const sdk = new RespondentSdk({
      apiKey: 'client-id',
      apiSecret: 'client-secret',
    })
    const controller = new AbortController()
    const reason = new Error('caller cancelled')
    controller.abort(reason)

    // The signal only reaches the request if the method forwards `options`.
    await expect(entry.run(sdk, controller.signal)).rejects.toBe(reason)
  })
})
