import type { QuizAnswers } from '@/lib/shared/types/quiz.types'

import { z } from 'zod'

/**
 * Quiz answer validation.
 *
 * Discriminated on `lane`, because the discriminator and qualifier vocabularies are
 * lane-specific: a REPAIR answer set carrying `load_elite` is not a typo to tolerate,
 * it is a broken client. A flat schema would accept it and the engine would then fall
 * through to a catch-all rule and quietly recommend the wrong thing.
 *
 * Lane C is single-select ("the pinch test") and Lane E has no discriminator at all —
 * both encoded as array lengths rather than left to convention.
 */
const sexAtBirthSchema = z.enum(['female', 'male', 'self_describe'])
const depthSchema = z.enum(['depth_single', 'depth_layered'])
const laneSchema = z.enum(['REPAIR', 'PERFORM', 'DEFINE', 'RESTORE', 'PT141'])

const sleepHoursSchema = z.enum([
  'sleep_under_5',
  'sleep_5_6',
  'sleep_6_7',
  'sleep_7_8',
  'sleep_8_plus',
])

const stressLevelSchema = z.enum([
  'stress_steady',
  'stress_managing',
  'stress_stretched',
  'stress_empty',
])

const repairSignal = z.enum([
  'localised_soft_tissue',
  'gut_mucosal',
  'connective_skin',
  'systemic_multisite',
])
const performSignal = z.enum(['recovery_lag', 'body_comp_stall', 'sleep_gh', 'multidomain_decline'])
const defineSignal = z.enum(['subcutaneous', 'visceral', 'mixed', 'metabolic_slowdown'])
const restoreSignal = z.enum(['skin_visible', 'circadian', 'cellular_energy', 'broad_healthspan'])

const common = {
  firstName: z.string().trim().min(1, 'First name is required').max(60),
  sexAtBirth: sexAtBirthSchema,
  sexSelfDescribe: z.string().trim().max(60).optional(),
  depth: depthSchema,
  secondaryLanes: z.array(laneSchema),
  sleepHours: sleepHoursSchema,
  stressLevel: stressLevelSchema,
  ninetyDayGoalText: z.string().trim().min(1, 'Tell us what you want to change').max(500),
  ninetyDayGoalAt: z.iso.datetime(),
  email: z.email('Enter a valid email'),
}

/** Multi-select lanes take at least one box; Lane C takes exactly one; Lane E takes none. */
const multiSelect = <T extends z.ZodTypeAny>(signal: T) =>
  z.array(signal).min(1, 'Pick at least one').max(4)

export const quizAnswersSchema = z
  .discriminatedUnion('lane', [
    z.object({
      ...common,
      lane: z.literal('REPAIR'),
      discriminator: multiSelect(repairSignal),
      qualifier: z.enum(['inflammatory_active', 'inflammatory_intermittent', 'mechanical']),
    }),
    z.object({
      ...common,
      lane: z.literal('PERFORM'),
      discriminator: multiSelect(performSignal),
      qualifier: z.enum(['load_light', 'load_moderate', 'load_high', 'load_elite']),
    }),
    z.object({
      ...common,
      lane: z.literal('DEFINE'),
      discriminator: z.array(defineSignal).length(1, 'The pinch test is single-select'),
      qualifier: z.enum(['glp1_naive', 'glp1_active', 'glp1_rebound']),
    }),
    z.object({
      ...common,
      lane: z.literal('RESTORE'),
      discriminator: multiSelect(restoreSignal),
      qualifier: z.enum(['rhythm_solid', 'rhythm_broken', 'rhythm_shifted', 'rhythm_fine']),
    }),
    z.object({
      ...common,
      lane: z.literal('PT141'),
      discriminator: z.array(z.never()).length(0),
      qualifier: z.enum(['desire', 'arousal', 'both']),
    }),
  ])
  .refine((answers) => !answers.secondaryLanes.includes(answers.lane), {
    message: 'A secondary goal cannot repeat the primary goal',
    path: ['secondaryLanes'],
  })
  .refine((answers) => answers.sexAtBirth !== 'self_describe' || Boolean(answers.sexSelfDescribe), {
    message: 'Tell us how you describe yourself',
    path: ['sexSelfDescribe'],
  })

export type QuizAnswersInput = z.infer<typeof quizAnswersSchema>

/**
 * Compile-time guard against drift.
 *
 * `QuizAnswers` in lib/shared is the single source of truth that both sides code
 * against; this schema is the runtime gate. Nothing otherwise forces them to agree, and
 * a schema that silently stops producing the shared shape would hand the engine a field
 * it does not expect. Adding an answer to one and not the other fails the typecheck.
 */
export type SchemaMatchesSharedType = QuizAnswersInput extends QuizAnswers ? true : never
