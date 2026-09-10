import type { Lane, QuizAnswersDraft } from '@/lib/shared/types/quiz.types'
import type { StepId } from '@/lib/client/quiz-flow/steps'

import { describe, expect, it } from 'vitest'

import { POST } from '@/app/api/quiz/resolve/route'
import { isComplete, nextStep, redirectTarget, stepsFor } from '@/lib/client/quiz-flow/steps'
import { BRANCHES } from '@/lib/shared/content/branches.content'

/**
 * The end-to-end test, without a browser.
 *
 * Walks the step machine from the first screen to the reveal for every lane, answering
 * each screen the way a customer would — from the content layer's own option lists, so
 * the answers are the exact values the UI would send — then posts the result to the real
 * route handler.
 *
 * This is what proves Phases 1, 2 and 3 actually connect: content supplies the options,
 * the flow collects them, the schema accepts them, the engine resolves them. A break
 * anywhere in that chain fails here rather than in front of the client.
 */
const answerFor = (step: StepId, lane: Lane): QuizAnswersDraft => {
  const branch = BRANCHES[lane]

  switch (step) {
    case 'name':
      return { firstName: 'Alex' }
    case 'sex':
      return { sexAtBirth: 'female' }
    case 'goal':
      return { lane }
    case 'depth':
      return { depth: 'depth_single' }
    case 'secondary':
      return { secondaryLanes: [] }
    case 'discriminator':
      return { discriminator: [branch.discriminator!.options[0].value] }
    case 'qualifier':
      return { qualifier: branch.qualifier.options[0].value }
    case 'sleep':
      return { sleepHours: 'sleep_7_8' }
    case 'stress':
      return { stressLevel: 'stress_steady' }
    case 'goal90':
      return {
        ninetyDayGoalText: 'Feel like myself again',
        ninetyDayGoalAt: '2026-09-10T12:00:00.000Z',
      }
    case 'email':
      return { email: 'alex@example.com' }
    default:
      return {}
  }
}

const walk = (lane: Lane) => {
  let draft: QuizAnswersDraft = { secondaryLanes: [] }
  const visited: StepId[] = []
  let step: StepId | 'reveal' = 'welcome'

  while (step !== 'reveal') {
    // The guard must permit every step we reach by walking forwards honestly.
    expect(redirectTarget(step, draft), `${lane} blocked at ${step}`).toBeNull()

    visited.push(step)
    draft = { ...draft, ...answerFor(step, lane) }

    expect(isComplete(step, draft), `${lane} could not complete ${step}`).toBe(true)

    step = nextStep(step, draft.lane)
  }

  return { draft, visited }
}

const LANES: Lane[] = ['REPAIR', 'PERFORM', 'DEFINE', 'RESTORE', 'PT141']

describe('full walkthrough', () => {
  it.each(LANES)('%s reaches the reveal with a resolvable submission', async (lane) => {
    const { draft, visited } = walk(lane)

    expect(visited).toEqual(stepsFor(lane))

    const response = await POST(
      new Request('http://localhost/api/quiz/resolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(draft),
      }),
    )
    const result = await response.json()

    expect(response.status, `${lane}: ${JSON.stringify(result)}`).toBe(200)
    expect(result.lane).toBe(lane)
    expect(result.base.compounds.length).toBeGreaterThan(0)
    expect(result.readVariant).toBeTruthy()
  })

  it('carries a cross-lane secondary through to a supporting protocol', async () => {
    const { draft } = walk('REPAIR')

    const response = await POST(
      new Request('http://localhost/api/quiz/resolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...draft, secondaryLanes: ['RESTORE'] }),
      }),
    )
    const result = await response.json()

    expect(response.status).toBe(200)
    expect(result.supporting?.compounds).toEqual(['NAD+'])
  })

  /** The options a customer can actually pick must be values the schema accepts. */
  it.each(LANES)('offers only schema-valid options for %s', async (lane) => {
    const branch = BRANCHES[lane]
    const options = branch.discriminator?.options ?? []

    for (const option of options) {
      const { draft } = walk(lane)
      const response = await POST(
        new Request('http://localhost/api/quiz/resolve', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...draft, discriminator: [option.value] }),
        }),
      )

      expect(response.status, `${lane} / ${option.value}`).toBe(200)
    }
  })
})
