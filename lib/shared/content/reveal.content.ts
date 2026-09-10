import type { ReadVariantId } from '../types/engine.types'

/**
 * Section 5 — the reveal (Screen 10), transcribed verbatim.
 *
 * The read is the emotional beat before commerce: exactly one of ten variants fires,
 * sharp pairings first, then the lane fallback. The engine picks which
 * (`lib/server/services/engine/read-variant.ts`); this file holds the words.
 *
 * Each read is a single paragraph. The bold trigger labels in the source doc are spec
 * annotations, not customer-facing headlines — the only heading on the read block is
 * READ_INTRO.
 */
export const READ_INTRO = "Here's what we see, [name]."

/**
 * Exhaustive by construction: adding a `ReadVariantId` without copy is a compile error.
 * Reid signs the associative framing on all ten — do not reword them.
 */
export const READ_VARIANTS: Record<ReadVariantId, string> = {
  sharp_bodycomp_low_sleep:
    "You want your body to change — and you're sleeping under seven hours. Most of your growth hormone releases in deep sleep, which means short sleep quietly works against the change you're putting effort into. It's the same pattern in most people who plateau despite doing the work.",
  sharp_visceral_high_stress:
    "Firm, deep fat around your middle — and the last few months running on empty. Those track together more often than most people are told. Sustained stress drives your body to store fat there specifically. It's the fat pattern that responds to your nervous system, not your fork.",
  sharp_systemic_recovery_low_sleep:
    "You don't bounce back the way you used to, and you're under-sleeping. Both of those run on the same overnight window. If sleep is short, recovery can't complete — and if recovery can't complete, the next day starts already behind.",
  sharp_flat_energy_high_stress:
    'Flat energy and months of running on empty. Your body burns through its cellular energy reserves faster under sustained stress than under almost anything else. The tiredness has a biology behind it, not a scheduling problem.',
  sharp_libido_high_stress:
    'Your sex drive has shifted — and the last few months have been heavy. Those two are more connected than most people are ever told. Desire is one of the first things to drop when the system is under sustained load.',
  fallback_repair:
    "You told us where it's showing up and how long it's been going on. Whether the problem is one tissue or the whole system is the distinction a clinician uses to decide what to actually target. You just gave us the answer.",
  fallback_perform:
    'What you flagged separates "needs to train harder" from "the system that recovers you has shifted." A clinician reads those two together, not one at a time.',
  fallback_define:
    "Where the fat sits and how your metabolism behaves are two different mechanisms. You told us which one is yours — and that's the distinction most plans skip.",
  fallback_restore:
    'Skin, sleep and energy look like three separate complaints. They run on the same internal clock — and you told us which one is loudest.',
  fallback_pt141:
    "Desire and response come from different systems. You told us which one shifted — that's the whole read, and one most people are never asked to make.",
}

/** §5.2 / §5.3 / §5.6 — card headers. `[name]` is substituted by the flow. */
export const CARD_LABELS = {
  base: 'Your base',
  supporting: 'Supporting protocol',
  pairsWellWith: 'Pairs well with',
  addToProtocol: 'Add to my protocol',
} as const

/**
 * §5.4 — plan selector. LOCKED: the default is 3 months and the clinical framing line is
 * verbatim. Do not reword `clinicalLine`.
 */
export const PLAN_SELECTOR = {
  heading: 'Choose your plan.',
  options: [
    { months: 1, label: '1 month', recommended: false },
    { months: 3, label: '3 months', recommended: true },
    { months: 6, label: '6 months', recommended: false },
  ],
  defaultMonths: 3,
  clinicalLine:
    'Peptide protocols are clinically recommended to run for at least 3 months to signal your body properly.',
} as const

/** §5.5 — one line, directly under the plan selector. */
export const DAY_90_LINE =
  'At day 90, your clinician reviews what moved and adjusts the next cycle around it.'

/**
 * §5.7 — controls. There is deliberately no "add" control: pairs-well-with is the only
 * AOV path, and only on Shape 2. "Add-anything turns the engine into a shop."
 */
export const CONTROLS = {
  swapBase: 'Swap the base',
  removeSupporting: 'Remove supporting protocol',
  startOver: 'Start over',
} as const

/** §5.8 — sticky footer. The conversion mechanism; visible at every scroll position. */
export const STICKY_FOOTER_CTA = 'Begin clinical assessment →'

/**
 * §5.9 — the recommend-less reveal, Shape 1 only. Warm throughout: the copy layer calls
 * it "the trust artefact of the whole system". No pairs-well-with card, by design.
 */
export const RECOMMEND_LESS = {
  heading: 'One molecule, [name]. On purpose.',
  body: "Your answers point one clear direction. So we're not padding it — one variable means at day 90 you'll know exactly what worked, instead of guessing which of five things did. That's the honest call, even if it's the smaller cart.",
  moleculeLine:
    "It's the compound built for the pattern you described. Nothing else earns a place yet.",
} as const

/** §5.10 — handoff, shown on every reveal variant. */
export const HANDOFF_DISCLAIMER =
  "This is a personalised match, not a prescription. Everything you've entered passes to your clinical assessment — a licensed provider makes the final call. Peptide therapy is prescribed at a provider's discretion."
