import { describe, expect, it } from 'vitest'

import { quizAnswersSchema } from '@/lib/server/validations/quiz.schema'

import { answers } from '../helpers/answers'

/**
 * The schema is the only thing standing between a malformed client payload and the
 * engine. The engine's lane tables end in catch-all rules, so an invalid combination
 * would not throw — it would quietly resolve to *something* and recommend it.
 *
 * Note that the cross-lane cases below are *type-valid*: `QuizAnswers` keeps
 * `discriminator` and `qualifier` as flat unions so a half-finished quiz is still
 * expressible while the customer is answering it. That is a deliberate trade, and it is
 * precisely why this schema is discriminated on lane — the compile-time check cannot
 * exist, so the runtime one has to.
 */
describe('quiz answers schema', () => {
  it('accepts a well-formed answer set for every lane', () => {
    const valid = [
      answers({ lane: 'REPAIR', discriminator: ['gut_mucosal'], qualifier: 'mechanical' }),
      answers({ lane: 'PERFORM', discriminator: ['recovery_lag'], qualifier: 'load_high' }),
      answers({ lane: 'DEFINE', discriminator: ['visceral'], qualifier: 'glp1_naive' }),
      answers({ lane: 'RESTORE', discriminator: ['skin_visible'], qualifier: 'rhythm_solid' }),
      answers({ lane: 'PT141', discriminator: [], qualifier: 'desire' }),
    ]

    for (const input of valid) {
      expect(quizAnswersSchema.safeParse(input).success, input.lane).toBe(true)
    }
  })

  /** The reason the schema is discriminated rather than flat. */
  it('rejects a qualifier borrowed from another lane', () => {
    const input = answers({
      lane: 'REPAIR',
      discriminator: ['gut_mucosal'],
      qualifier: 'load_elite',
    })

    expect(quizAnswersSchema.safeParse(input).success).toBe(false)
  })

  it('rejects a discriminator borrowed from another lane', () => {
    const input = answers({
      lane: 'RESTORE',
      discriminator: ['gut_mucosal'],
      qualifier: 'rhythm_solid',
    })

    expect(quizAnswersSchema.safeParse(input).success).toBe(false)
  })

  /** Lane C is single-select — "the pinch test". */
  it('rejects more than one DEFINE discriminator', () => {
    const input = answers({
      lane: 'DEFINE',
      discriminator: ['visceral', 'subcutaneous'],
      qualifier: 'glp1_naive',
    })

    expect(quizAnswersSchema.safeParse(input).success).toBe(false)
  })

  /** Lane E is qualifier-only. */
  it('rejects a PT141 discriminator', () => {
    const input = answers({
      lane: 'PT141',
      discriminator: ['gut_mucosal'],
      qualifier: 'desire',
    })

    expect(quizAnswersSchema.safeParse(input).success).toBe(false)
  })

  it('rejects an empty discriminator on a multi-select lane', () => {
    const input = answers({ lane: 'REPAIR', discriminator: [], qualifier: 'mechanical' })

    expect(quizAnswersSchema.safeParse(input).success).toBe(false)
  })

  it('rejects a secondary goal that repeats the primary', () => {
    const input = answers({
      lane: 'REPAIR',
      discriminator: ['gut_mucosal'],
      qualifier: 'mechanical',
      secondaryLanes: ['REPAIR'],
    })

    expect(quizAnswersSchema.safeParse(input).success).toBe(false)
  })

  it('requires a self-description when sex at birth is self_describe', () => {
    const base = answers({
      lane: 'REPAIR',
      discriminator: ['gut_mucosal'],
      qualifier: 'mechanical',
    })

    expect(quizAnswersSchema.safeParse({ ...base, sexAtBirth: 'self_describe' }).success).toBe(
      false,
    )
    expect(
      quizAnswersSchema.safeParse({
        ...base,
        sexAtBirth: 'self_describe',
        sexSelfDescribe: 'Non-binary',
      }).success,
    ).toBe(true)
  })

  it('rejects a malformed email', () => {
    const base = answers({
      lane: 'REPAIR',
      discriminator: ['gut_mucosal'],
      qualifier: 'mechanical',
    })

    expect(quizAnswersSchema.safeParse({ ...base, email: 'not-an-email' }).success).toBe(false)
  })
})

/**
 * Regression: PT-141 has no discriminator screen, so a real client never sets the field.
 * Requiring it to be present — even as an empty array — meant every customer in that
 * lane got a 400 and no reveal. Caught by the walkthrough test, not by inspection.
 */
describe('PT141 discriminator', () => {
  it('accepts a submission with no discriminator field at all', () => {
    const base = answers({ lane: 'PT141', discriminator: [], qualifier: 'desire' })
    const { discriminator: _omitted, ...withoutDiscriminator } = base

    const result = quizAnswersSchema.safeParse(withoutDiscriminator)

    expect(result.success).toBe(true)
    expect(result.success && result.data.discriminator).toEqual([])
  })
})
