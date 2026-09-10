import type { DiscriminatorSignal, Lane, Qualifier } from './quiz.types'

/**
 * Voice register, per the copy layer's appendix. Carried on each screen because the
 * design treats the three differently — warm screens are emotional beats, direct screens
 * are where the customer is working or choosing.
 */
export type Register = 'warm' | 'direct' | 'warm_adjacent'

export interface ChoiceOption<V extends string> {
  value: V
  label: string
  /**
   * Secondary line under the label. Only the lane options carry one — every other
   * screen's options are a single line, matching the copy layer exactly.
   */
  description?: string
  /** Reveals a free-text field when chosen — S4's "prefer to self-describe". */
  freeText?: boolean
}

export interface ScreenCopy {
  register: Register
  heading: string
  /** Sub-lines under the heading, in order. */
  body?: string[]
  cta?: string
}

export interface ChoiceScreen<V extends string> extends ScreenCopy {
  select: 'single' | 'multi'
  options: ChoiceOption<V>[]
}

export interface TextScreen extends ScreenCopy {
  placeholder?: string
}

/**
 * A same-screen callout that fires on specific answers.
 *
 * Most branches define a primary line plus alternate beats, and several combinations
 * deliberately fire nothing — Branch A stays silent on a single box. Rules are evaluated
 * in order and the first match wins; no match is a valid outcome.
 */
export interface RecognitionRule {
  id: string
  text: string
  when: (signals: DiscriminatorSignal[]) => boolean
}

export interface EducationScreen {
  heading: string
  body: string[]
  cta: string
}

export interface DiscriminatorScreen {
  select: 'single' | 'multi'
  heading: string
  body?: string
  options: ChoiceOption<DiscriminatorSignal>[]
}

export interface QualifierScreen {
  heading: string
  body?: string
  options: ChoiceOption<Qualifier>[]
}

export interface BranchContent {
  lane: Lane
  title: string
  /** Null for PT-141, which is qualifier-only with no discriminator. */
  discriminator: DiscriminatorScreen | null
  qualifier: QualifierScreen
  recognition: RecognitionRule[]
  education: EducationScreen
}

/**
 * Reveal card copy.
 *
 * A discriminated union rather than nullable fields: most of this copy is still unwritten
 * ("Amelia to write" throughout §5.2–5.6), and a component must not be able to render a
 * blank as though it were signed copy. `pending` forces the caller to branch.
 *
 * Nothing here is invented. These are therapeutic claims about compounded 503A
 * molecules — the copy layer records that Reid signs the associative framing and Amelia
 * signs the paragraphs. Unsigned words must never reach a customer or a client deck.
 */
export type CardCopy =
  | {
      status: 'written'
      chips: [string, string, string, string]
      paragraph: string
    }
  | {
      status: 'pending'
      awaiting: string
    }

export interface CompoundCopy {
  displayName: string
  card: CardCopy
  /** Monthly price at the base plan length, in USD. Null where the client has not priced it. */
  monthlyPrice: number | null
}
