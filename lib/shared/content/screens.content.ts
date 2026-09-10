import type { Depth, Lane, SexAtBirth, SleepHours, StressLevel } from '../types/quiz.types'
import type { ChoiceOption, ChoiceScreen, ScreenCopy, TextScreen } from '../types/content.types'

/**
 * Screens 1-9, transcribed verbatim from The Quiz — Copy Layer v2.1.
 *
 * Option values are typed against the engine's own unions, so a screen that offers a
 * value the engine has never heard of is a compile error rather than a runtime surprise.
 * That bond is the reason this file imports from `quiz.types` at all.
 *
 * `[name]` is left in place as a literal token; the flow substitutes it. Screen numbering
 * follows the copy layer, which is authoritative on screens and matches the Figma frames.
 */

/** S1 · WELCOME · WARM */
export const WELCOME_SCREEN: ScreenCopy = {
  register: 'warm',
  heading: "You've probably already tried the obvious things.",
  body: [
    "If you're here, it's because something's not adding up — the effort you're putting in isn't matching what you're getting back. That's worth two minutes.",
    "We'll ask the questions your GP didn't, then show you what actually fits. If the honest answer is one molecule, that's what you'll get.",
  ],
  cta: 'Start',
}

/** S2 · NAME · DIRECT */
export const NAME_SCREEN: TextScreen = {
  register: 'direct',
  heading: 'What should we call you?',
}

/** S3 · WELCOME INTERSTITIAL · WARM. Not a question. */
export const WELCOME_INTERSTITIAL_SCREEN: ScreenCopy = {
  register: 'warm',
  heading: "Welcome, [name]. Two minutes — let's see what fits.",
  cta: 'Continue',
}

/** S4 · SEX ASSIGNED AT BIRTH · DIRECT */
export const SEX_AT_BIRTH_OPTIONS: ChoiceOption<SexAtBirth>[] = [
  { value: 'female', label: 'Female' },
  { value: 'male', label: 'Male' },
  { value: 'self_describe', label: 'Prefer to self-describe', freeText: true },
]

export const SEX_AT_BIRTH_SCREEN: ChoiceScreen<SexAtBirth> = {
  register: 'direct',
  heading: 'Sex assigned at birth.',
  select: 'single',
  options: SEX_AT_BIRTH_OPTIONS,
}

/** S5 · PRIMARY GOAL · DIRECT · SINGLE-SELECT. Sets the lane per Backend R1. */
export const LANE_OPTIONS: ChoiceOption<Lane>[] = [
  { value: 'REPAIR', label: 'Recover — from injury, training, or gut issues' },
  { value: 'PERFORM', label: 'Perform — build, train, recover harder' },
  { value: 'DEFINE', label: 'Change my body composition' },
  { value: 'RESTORE', label: 'Age slower — skin, energy, longevity' },
  { value: 'PT141', label: 'Sex drive and arousal' },
]

export const PRIMARY_GOAL_SCREEN: ChoiceScreen<Lane> = {
  register: 'direct',
  heading: "What's the most important thing you want to focus on first?",
  body: ["Pick the one that matters most. You'll add the others next."],
  select: 'single',
  options: LANE_OPTIONS,
}

/** S6 · DEPTH · DIRECT · SINGLE-SELECT */
export const DEPTH_OPTIONS: ChoiceOption<Depth>[] = [
  { value: 'depth_single', label: 'One clear thing' },
  { value: 'depth_layered', label: "A few, and they're connected" },
]

export const DEPTH_SCREEN: ChoiceScreen<Depth> = {
  register: 'direct',
  heading: 'Is it one clear thing — or a few things at once?',
  body: ['Both are common. The answer just changes what we build.'],
  select: 'single',
  options: DEPTH_OPTIONS,
}

/** Fires on depth_layered only. Same screen as the answer, not its own screen. */
export const DEPTH_RECOGNITION_LINE =
  'Most people arrive with more than one — usually it means the system is under load, not that any one part has failed.'

/**
 * S7 · SECONDARY GOALS · DIRECT · MULTI-SELECT, NO RANKING.
 *
 * Options are the four goals not chosen at S5, so they are derived from `LANE_OPTIONS`
 * rather than listed again — one list, no chance of the two drifting.
 */
export const SECONDARY_GOALS_SCREEN: Omit<ChoiceScreen<Lane>, 'options'> = {
  register: 'direct',
  heading: 'Anything else going on?',
  body: [
    "Tick anything else you'd want addressed. Anything you pick becomes part of what we build.",
  ],
  select: 'multi',
}

export const secondaryGoalOptions = (primary: Lane): ChoiceOption<Lane>[] =>
  LANE_OPTIONS.filter((option) => option.value !== primary)

/** S8A · SLEEP · DIRECT. Feeds the read. */
export const SLEEP_OPTIONS: ChoiceOption<SleepHours>[] = [
  { value: 'sleep_under_5', label: 'Under 5' },
  { value: 'sleep_5_6', label: '5 to 6' },
  { value: 'sleep_6_7', label: '6 to 7' },
  { value: 'sleep_7_8', label: '7 to 8' },
  { value: 'sleep_8_plus', label: '8 or more' },
]

export const SLEEP_SCREEN: ChoiceScreen<SleepHours> = {
  register: 'direct',
  heading: 'How many hours are you actually sleeping most nights?',
  select: 'single',
  options: SLEEP_OPTIONS,
}

/** S8B · STRESS · WARM-ADJACENT. Feeds the read. */
export const STRESS_OPTIONS: ChoiceOption<StressLevel>[] = [
  { value: 'stress_steady', label: 'Steady — nothing out of the ordinary' },
  { value: 'stress_managing', label: "Managing, but there's a lot on" },
  { value: 'stress_stretched', label: 'Stretched thin — running above what feels sustainable' },
  { value: 'stress_empty', label: 'Running on empty — no reserves left' },
]

export const STRESS_SCREEN: ChoiceScreen<StressLevel> = {
  register: 'warm_adjacent',
  heading: 'How have the last few months felt?',
  body: ["Work, life, whatever's been going on — the honest version."],
  select: 'single',
  options: STRESS_OPTIONS,
}

/** S8C · 90-DAY CAPTURE · WARM · FREE TEXT. Quoted back at week 8. */
export const NINETY_DAY_SCREEN: TextScreen = {
  register: 'warm',
  heading: "90 days from now — what's different?",
  body: [
    'Your words. This is the line your clinician reads back at day 90 to check what actually moved.',
  ],
  placeholder: 'In 90 days I want to…',
}

/** S9 · EMAIL · DIRECT · GATES THE REVEAL. */
export const EMAIL_SCREEN: TextScreen = {
  register: 'direct',
  heading: 'Where should we send your personalised protocol?',
  body: [
    "Your read and your assembled stack — then you'll move into the clinical assessment with a licensed provider. You won't be asked any of this twice.",
  ],
  cta: 'Show me my personalised protocol',
}
