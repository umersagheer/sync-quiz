import type {
  DiscriminatorSignal,
  Lane,
  Qualifier,
  QuizAnswers,
  SleepHours,
  StressLevel,
} from '@/lib/shared/types/quiz.types'

export interface AnswerOverrides {
  lane: Lane
  discriminator: DiscriminatorSignal[]
  qualifier: Qualifier
  secondaryLanes?: Lane[]
  depth?: QuizAnswers['depth']
  sleepHours?: SleepHours
  stressLevel?: StressLevel
}

/**
 * Build a complete answer set from just the fields a case cares about.
 *
 * Sleep and stress default to values that fire no sharp read (`sleep_7_8`,
 * `stress_steady`). §7 states its inputs only as far as they affect the product, so
 * neutral defaults keep each matrix case asserting what the doc actually pins — and
 * incidentally pin the lane fallback reads too.
 */
export const answers = ({
  lane,
  discriminator,
  qualifier,
  secondaryLanes = [],
  depth = 'depth_single',
  sleepHours = 'sleep_7_8',
  stressLevel = 'stress_steady',
}: AnswerOverrides): QuizAnswers => ({
  firstName: 'Alex',
  sexAtBirth: 'female',
  lane,
  depth,
  secondaryLanes,
  discriminator,
  qualifier,
  sleepHours,
  stressLevel,
  ninetyDayGoalText: 'Feel like myself again',
  ninetyDayGoalAt: '2026-09-10T12:00:00.000Z',
  email: 'alex@example.com',
})
