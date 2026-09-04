import { describe, expect, it } from 'vitest'
import * as z from 'zod/v4'
import { zGender, zScreenerResponseStatus, zWebhookEventType } from '../src/zod'

describe('generated Zod schemas', () => {
  it('exports one schema per OpenAPI component schema', () => {
    expect(zGender.parse('nonbinary')).toBe('nonbinary')
    expect(zGender.safeParse('not-a-gender').success).toBe(false)
    expect(zGender.options).toContain('prefernottoanswer')
  })

  it('composes into schemas written against zod/v4', () => {
    const participant = z.object({
      gender: zGender,
      status: zScreenerResponseStatus,
    })

    const parsed = participant.parse({ gender: 'female', status: 'PENDING' })
    expect(parsed).toEqual({ gender: 'female', status: 'PENDING' })
  })

  it('covers the webhook event type enum', () => {
    expect(zWebhookEventType.options).toEqual([
      'PROJECTS.UPDATED',
      'SCREENER_RESPONSES.CREATED',
      'SCREENER_RESPONSES.UPDATED',
      'MESSAGES.CREATED',
      'CONVERSATIONS.CREATED',
    ])
  })
})
