import type { Lane, QuizAnswersDraft } from '@/lib/shared/types/quiz.types'

import { describe, expect, it } from 'vitest'

import {
  furthestStep,
  isComplete,
  nextStep,
  previousStep,
  redirectTarget,
  stepsFor,
} from '@/lib/client/quiz-flow/steps'

import { answers } from '../helpers/answers'

const LANES: Lane[] = ['REPAIR', 'PERFORM', 'DEFINE', 'RESTORE', 'PT141']

describe('step machine', () => {
  it('runs the same steps before the branch for every lane', () => {
    for (const lane of LANES) {
      expect(stepsFor(lane).slice(0, 7), lane).toEqual([
        'welcome',
        'name',
        'interstitial',
        'sex',
        'goal',
        'depth',
        'secondary',
      ])
    }
  })

  /** PT-141 is qualifier-only — R6, and the copy layer's Branch E has no discriminator. */
  it('skips the discriminator for PT141 and only PT141', () => {
    expect(stepsFor('PT141')).not.toContain('discriminator')
    expect(stepsFor('PT141')).toHaveLength(13)

    for (const lane of LANES.filter((l) => l !== 'PT141')) {
      expect(stepsFor(lane), lane).toContain('discriminator')
      expect(stepsFor(lane), lane).toHaveLength(14)
    }
  })

  /** Before a lane is picked the flow is only defined as far as the goal screen. */
  it('stops at the pre-branch steps when no lane is chosen', () => {
    expect(stepsFor(undefined)).toHaveLength(7)
    expect(stepsFor(undefined)).not.toContain('sleep')
  })

  it('ends every lane on the email gate', () => {
    for (const lane of LANES) {
      expect(stepsFor(lane).at(-1), lane).toBe('email')
    }
  })

  it('walks forwards to the reveal and backwards to the start', () => {
    expect(nextStep('email', 'REPAIR')).toBe('reveal')
    expect(nextStep('secondary', 'REPAIR')).toBe('discriminator')
    expect(nextStep('secondary', 'PT141')).toBe('qualifier')
    expect(previousStep('welcome', 'REPAIR')).toBeNull()
    expect(previousStep('qualifier', 'PT141')).toBe('secondary')
    expect(previousStep('qualifier', 'REPAIR')).toBe('discriminator')
  })
})

describe('step completeness', () => {
  it('treats screens that ask nothing as already answered', () => {
    for (const step of ['welcome', 'interstitial', 'education'] as const) {
      expect(isComplete(step, {}), step).toBe(true)
    }
  })

  it('requires a self-description only when self_describe is chosen', () => {
    expect(isComplete('sex', { sexAtBirth: 'female' })).toBe(true)
    expect(isComplete('sex', { sexAtBirth: 'self_describe' })).toBe(false)
    expect(isComplete('sex', { sexAtBirth: 'self_describe', sexSelfDescribe: 'Non-binary' })).toBe(
      true,
    )
  })

  /**
   * "Anything else going on?" can honestly be nothing, so an empty multi-select is a
   * real answer — but an absent one is not, or the guard would let someone skip it.
   */
  it('accepts no secondary goals but not an unanswered screen', () => {
    expect(isComplete('secondary', { secondaryLanes: [] })).toBe(true)
    expect(isComplete('secondary', {})).toBe(false)
  })

  it('rejects whitespace-only text answers', () => {
    expect(isComplete('name', { firstName: '   ' })).toBe(false)
    expect(isComplete('goal90', { ninetyDayGoalText: '  ' })).toBe(false)
  })
})

describe('route guard', () => {
  const partial = (patch: QuizAnswersDraft): QuizAnswersDraft => ({ secondaryLanes: [], ...patch })

  it('sends a cold visitor to the first unanswered step', () => {
    expect(furthestStep({})).toBe('name')
    expect(redirectTarget('email', {})).toBe('/quiz/name')
    expect(redirectTarget('sleep', {})).toBe('/quiz/name')
  })

  it('allows the step a visitor is up to, and every step behind it', () => {
    const draft = partial({ firstName: 'Alex', sexAtBirth: 'female' })

    expect(redirectTarget('goal', draft)).toBeNull()
    expect(redirectTarget('name', draft)).toBeNull()
    expect(redirectTarget('welcome', draft)).toBeNull()
  })

  it('blocks a step beyond where the answers reach', () => {
    const draft = partial({ firstName: 'Alex', sexAtBirth: 'female' })

    expect(redirectTarget('depth', draft)).toBe('/quiz/goal')
  })

  /** `discriminator` is not part of the PT-141 flow at all. */
  it('redirects a step that does not exist in this lane', () => {
    const draft = partial({
      firstName: 'Alex',
      sexAtBirth: 'female',
      lane: 'PT141',
      depth: 'depth_single',
    })

    expect(redirectTarget('discriminator', draft)).toBe('/quiz/qualifier')
  })

  it('lets a completed quiz through to any step', () => {
    const complete = answers({
      lane: 'REPAIR',
      discriminator: ['gut_mucosal'],
      qualifier: 'mechanical',
    })

    expect(furthestStep(complete)).toBe('reveal')
    expect(redirectTarget('name', complete)).toBeNull()
    expect(redirectTarget('email', complete)).toBeNull()
  })

  it('routes a completed quiz to the reveal', () => {
    const complete = answers({ lane: 'PT141', discriminator: [], qualifier: 'desire' })

    expect(furthestStep(complete)).toBe('reveal')
  })
})
