import type { Lane, QuizAnswersDraft } from '@/lib/shared/types/quiz.types'

/**
 * The quiz flow.
 *
 * Sixteen steps, but the list is a function of the answers rather than a constant: the
 * branch section is chosen by the primary lane, and PT-141 has no discriminator at all
 * (it is qualifier-only), so that lane runs one step shorter.
 *
 * Step ids double as URL segments — `/quiz/name`, `/quiz/depth` — so the browser back
 * button walks the funnel instead of leaving it.
 */
export type StepId =
  | 'welcome'
  | 'name'
  | 'interstitial'
  | 'sex'
  | 'goal'
  | 'depth'
  | 'secondary'
  | 'discriminator'
  | 'qualifier'
  | 'education'
  | 'sleep'
  | 'stress'
  | 'goal90'
  | 'email'

/** Where the flow lands once `email` is complete. Not a step — it is its own route. */
export const REVEAL_PATH = '/reveal'

const BEFORE_BRANCH: StepId[] = [
  'welcome',
  'name',
  'interstitial',
  'sex',
  'goal',
  'depth',
  'secondary',
]

const AFTER_BRANCH: StepId[] = ['sleep', 'stress', 'goal90', 'email']

/**
 * The ordered steps for a given lane. Before the lane is chosen the flow is only defined
 * up to `goal`, so an undefined lane yields the pre-branch steps alone — which is exactly
 * what the guard needs to stop someone deep-linking past the goal screen.
 */
export const stepsFor = (lane: Lane | undefined): StepId[] => {
  if (!lane) return BEFORE_BRANCH

  const branch: StepId[] =
    lane === 'PT141' ? ['qualifier', 'education'] : ['discriminator', 'qualifier', 'education']

  return [...BEFORE_BRANCH, ...branch, ...AFTER_BRANCH]
}

export const isStepId = (value: string): value is StepId =>
  stepsFor('REPAIR').includes(value as StepId)

/**
 * Whether a step has been answered.
 *
 * Does double duty: it enables the Next button, and it is what the route guard walks to
 * find the furthest step a visitor is actually entitled to see. Screens that ask nothing
 * (`welcome`, `interstitial`, `education`) are complete on arrival.
 */
export const STEP_COMPLETE: Record<StepId, (draft: QuizAnswersDraft) => boolean> = {
  welcome: () => true,
  name: (draft) => Boolean(draft.firstName?.trim()),
  interstitial: () => true,
  sex: (draft) =>
    Boolean(draft.sexAtBirth) &&
    (draft.sexAtBirth !== 'self_describe' || Boolean(draft.sexSelfDescribe?.trim())),
  goal: (draft) => Boolean(draft.lane),
  depth: (draft) => Boolean(draft.depth),
  // A multi-select with nothing ticked is a valid answer — "anything else going on?"
  // can honestly be nothing. It is complete once the array exists.
  secondary: (draft) => Array.isArray(draft.secondaryLanes),
  discriminator: (draft) => Boolean(draft.discriminator?.length),
  qualifier: (draft) => Boolean(draft.qualifier),
  education: () => true,
  sleep: (draft) => Boolean(draft.sleepHours),
  stress: (draft) => Boolean(draft.stressLevel),
  goal90: (draft) => Boolean(draft.ninetyDayGoalText?.trim()),
  email: (draft) => Boolean(draft.email?.trim()),
}

export const isComplete = (step: StepId, draft: QuizAnswersDraft): boolean =>
  STEP_COMPLETE[step](draft)

/**
 * The furthest step the draft entitles someone to see: the first incomplete step, or the
 * reveal if every step is answered.
 */
export const furthestStep = (draft: QuizAnswersDraft): StepId | 'reveal' => {
  const steps = stepsFor(draft.lane)

  return steps.find((step) => !isComplete(step, draft)) ?? 'reveal'
}

export const stepPath = (step: StepId): string => `/quiz/${step}`

export const pathFor = (step: StepId | 'reveal'): string =>
  step === 'reveal' ? REVEAL_PATH : stepPath(step)

/**
 * Where a visitor asking for `requested` should actually end up.
 *
 * Returns null when the request is allowed. Anything at or before the furthest
 * incomplete step is allowed, so back-navigation and editing an earlier answer both
 * work; anything beyond it redirects, so a deep link cannot skip the quiz.
 */
export const redirectTarget = (requested: StepId, draft: QuizAnswersDraft): string | null => {
  const steps = stepsFor(draft.lane)
  const requestedIndex = steps.indexOf(requested)

  // Not a step in this lane's flow at all — e.g. `discriminator` for PT-141.
  if (requestedIndex === -1) return pathFor(furthestStep(draft))

  const furthest = furthestStep(draft)

  if (furthest === 'reveal') return null

  return requestedIndex <= steps.indexOf(furthest) ? null : pathFor(furthest)
}

/** The step before `step`, or null at the start of the flow. */
export const previousStep = (step: StepId, lane: Lane | undefined): StepId | null => {
  const steps = stepsFor(lane)
  const index = steps.indexOf(step)

  return index > 0 ? steps[index - 1] : null
}

/** The step after `step`, or 'reveal' at the end of the flow. */
export const nextStep = (step: StepId, lane: Lane | undefined): StepId | 'reveal' => {
  const steps = stepsFor(lane)
  const index = steps.indexOf(step)

  return index >= 0 && index < steps.length - 1 ? steps[index + 1] : 'reveal'
}

/**
 * The eleven steps that ask a question.
 *
 * The design's progress pill reads "3 of 11" while the flow has fourteen steps — the
 * difference is that welcome, the interstitial and the education screen ask nothing and
 * are excluded from the count. PT-141 has no discriminator screen, so that lane honestly
 * has ten questions rather than eleven and the total is computed per lane instead of
 * being hardcoded to match the drawn frame.
 */
const QUESTION_STEPS: StepId[] = [
  'name',
  'sex',
  'goal',
  'depth',
  'secondary',
  'discriminator',
  'qualifier',
  'sleep',
  'stress',
  'goal90',
  'email',
]

export const isQuestion = (step: StepId): boolean => QUESTION_STEPS.includes(step)

export interface QuestionProgress {
  current: number
  total: number
}

/** Position within the lane's questions, or null on a screen that asks nothing. */
export const questionProgress = (step: StepId, lane: Lane | undefined): QuestionProgress | null => {
  if (!isQuestion(step)) return null

  // Before the lane is chosen the flow is only known as far as the goal screen, which
  // would make the total read "1 of 5" and then jump to "6 of 11" once a lane is picked.
  // Count against a full branching flow instead, so the denominator is stable from the
  // first screen. PT-141 genuinely has ten questions and reports ten.
  const questions = stepsFor(lane ?? 'REPAIR').filter(isQuestion)
  const index = questions.indexOf(step)

  return index === -1 ? null : { current: index + 1, total: questions.length }
}
