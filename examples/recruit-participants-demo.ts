/**
 * End-to-end recruitment demo against the Respondent staging environment.
 *
 * Run with:
 *   RESPONDENT_API_KEY=... RESPONDENT_API_SECRET=... \
 *     pnpm exec tsx examples/recruit-participants-demo.ts
 *
 * The script creates a draft B2C project, adds a screener question, publishes
 * it, then walks the first screener response through the recruitment
 * lifecycle. It only ever talks to staging.
 */
import {
  RESPONDENT_STAGING_BASE_URL,
  RespondentSdk,
  isRespondentSdkError,
} from '../src/index'

const apiKey = process.env.RESPONDENT_API_KEY
const apiSecret = process.env.RESPONDENT_API_SECRET

if (!apiKey || !apiSecret) {
  console.error(
    'Set RESPONDENT_API_KEY and RESPONDENT_API_SECRET before running this demo.',
  )
  process.exit(1)
}

const respondent = new RespondentSdk({
  apiKey,
  apiSecret,
  baseUrl: RESPONDENT_STAGING_BASE_URL,
  timeoutMs: 30_000,
})

async function main(): Promise<void> {
  // Lookup IDs differ between staging and production, so resolve them here
  // rather than hardcoding them.
  const topics = await respondent.lookups.topics({ pageSize: 1 })
  const topicId = topics.results[0]?.id
  if (!topicId) {
    throw new Error('No project topics available on this environment')
  }

  const project = await respondent.projects.create({
    publicTitle: 'Coffee habits study',
    publicInternalName: 'coffee-habits-demo',
    targetMarketType: 'b2c',
    typeOfResearch: 'remote',
    targetResearchMethodology: 'oneOnOne',
    participantTimeRequiredMinutes: 30,
    incentiveAmount: 50,
    targetNumberOfParticipants: 5,
    externalResearcher: {
      researcherId: 'researcher-1',
      researcherName: 'Ada Lovelace',
      // Required when targetResearchMethodology is oneOnOne or focusGroup.
      bookingUrl: 'https://example.com/book',
    },
    targetProjectTopics: [topicId],
  })

  console.log('Created draft project', project.id)

  await respondent.screenerQuestions.create(project.id, {
    text: 'How often do you drink coffee?',
    questionType: 'radio',
    answers: [
      // answerValue 1 qualifies, 2 disqualifies.
      { text: 'Daily', answerValue: 1 },
      { text: 'Never', answerValue: 2 },
    ],
  })

  await respondent.projects.update(project.id, {
    publicDescription: 'A 30 minute chat about how you drink coffee.',
  })

  await respondent.projects.publish(project.id)
  console.log('Published project', project.id)

  const estimate = await respondent.projects.audienceSizeEstimate(project.id)
  console.log('Audience size estimate', estimate)

  const responses = await respondent.screenerResponses.list(project.id, {
    status: 'PENDING',
    pageSize: 1,
  })

  const first = responses.results?.[0]
  if (!first) {
    console.log('No screener responses yet — participants apply over time.')
    return
  }

  await respondent.screenerResponses.qualify(project.id, first.id, {
    qualifyStatus: true,
    qualifiedOverriden: false,
    disqualifyReasons: [],
    message: '',
  })

  await respondent.screenerResponses.invite(project.id, first.id, {
    meetingLink: 'https://example.com/session',
    bookingLink: 'https://example.com/book',
  })

  console.log('Invited participant', first.id)
  console.log(
    'Call screenerResponses.markAttended once the session is complete — that ' +
      'is what starts the incentive payment.',
  )
}

main().catch((error: unknown) => {
  if (isRespondentSdkError(error)) {
    console.error(
      `Respondent API error ${String(error.status)}: ${error.message}`,
      error.payload,
    )
  } else {
    console.error(error)
  }
  process.exitCode = 1
})
