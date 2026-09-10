import 'server-only'

import type { DiscriminatorSignal, Lane, Qualifier } from '@/lib/shared/types/quiz.types'
import type { Compound } from '@/lib/shared/types/engine.types'

/**
 * §3 — lane triggers. Each lane resolves (discriminator boxes + qualifier) to exactly
 * one base outcome.
 *
 * The doc's tables are written as rows, several of which are overrides: rows marked
 * "(any count)" or "any pattern" match alongside more specific rows. A customer who
 * ticks only `systemic_multisite` with a `mechanical` qualifier matches Lane A row 1
 * (single) *and* row 5 (blend). Ordering the rules with overrides first is what makes
 * resolution deterministic, and the override winning is what the escalation signals
 * mean clinically — `systemic_multisite` is "All of it", which is not a one-vial answer.
 *
 * Rules are evaluated top to bottom; the first match wins. Every lane ends in a
 * catch-all so resolution is total.
 */
export type BaseOutcome =
  { kind: 'blend' } | { kind: 'single'; compound: Compound } | { kind: 'glp1_continuation' }

export interface LaneContext {
  boxes: DiscriminatorSignal[]
  qualifier: Qualifier
}

export interface LaneRule {
  /** Stable id, quoted from the doc's trigger-condition column. Asserted in tests. */
  id: string
  when: (context: LaneContext) => boolean
  /** A fixed outcome, or one derived from the answers where the doc locks a tiebreak. */
  outcome: BaseOutcome | ((context: LaneContext) => BaseOutcome)
}

const BLEND: BaseOutcome = { kind: 'blend' }

const single = (compound: Compound): BaseOutcome => ({ kind: 'single', compound })

const has = (context: LaneContext, signal: DiscriminatorSignal) => context.boxes.includes(signal)

const layeredByCount = (context: LaneContext) => context.boxes.length >= 2

/** §3 Lane C tiebreaker, locked in the v2.1 change log. */
const DEFINE_SINGLE_BY_PATTERN: Partial<Record<DiscriminatorSignal, Compound>> = {
  subcutaneous: 'AOD-9604',
  visceral: 'Tesamorelin',
  metabolic_slowdown: 'MOTS-c',
}

const LANE_A_REPAIR: LaneRule[] = [
  { id: 'systemic_multisite', when: (c) => has(c, 'systemic_multisite'), outcome: BLEND },
  { id: '2+ boxes', when: layeredByCount, outcome: BLEND },
  {
    id: '1 box + mechanical',
    when: (c) => c.qualifier === 'mechanical',
    outcome: single('BPC-157'),
  },
  { id: 'inflammatory_active', when: (c) => c.qualifier === 'inflammatory_active', outcome: BLEND },
  // inflammatory_intermittent: "not single-path → escalates". The Copy Layer's inline
  // summary omits this row entirely; Backend Lane A row 2 defines it.
  { id: 'intermittent escalates', when: () => true, outcome: BLEND },
]

const LANE_B_PERFORM: LaneRule[] = [
  { id: 'multidomain_decline', when: (c) => has(c, 'multidomain_decline'), outcome: BLEND },
  { id: '2+ boxes', when: layeredByCount, outcome: BLEND },
  { id: 'elite load', when: (c) => c.qualifier === 'load_elite', outcome: BLEND },
  { id: 'recovery_lag alone', when: (c) => has(c, 'recovery_lag'), outcome: single('Sermorelin') },
  // A single box that is not recovery_lag: "no single-path defined". Backend row 5.
  { id: 'no single-path defined', when: () => true, outcome: BLEND },
]

const LANE_C_DEFINE: LaneRule[] = [
  {
    id: 'glp1_active',
    when: (c) => c.qualifier === 'glp1_active',
    outcome: { kind: 'glp1_continuation' },
  },
  { id: 'glp1_rebound', when: (c) => c.qualifier === 'glp1_rebound', outcome: BLEND },
  { id: 'mixed pattern', when: (c) => has(c, 'mixed'), outcome: BLEND },
  // Unreachable: the Copy Layer specifies Lane C's discriminator as SINGLE-SELECT
  // ("the pinch test"), and `mixed` is how that lane expresses two patterns at once.
  // Kept because Backend §3 defines it, and pinned dead by test.
  { id: '2+ boxes', when: layeredByCount, outcome: BLEND },
  {
    id: 'pattern + naive',
    when: (c) => DEFINE_SINGLE_BY_PATTERN[c.boxes[0]] !== undefined,
    outcome: (c) => single(DEFINE_SINGLE_BY_PATTERN[c.boxes[0]]!),
  },
  { id: 'no pattern matched', when: () => true, outcome: BLEND },
]

const LANE_D_RESTORE: LaneRule[] = [
  { id: 'broad_healthspan', when: (c) => has(c, 'broad_healthspan'), outcome: BLEND },
  { id: '2+ boxes', when: layeredByCount, outcome: BLEND },
  { id: 'skin_visible alone', when: (c) => has(c, 'skin_visible'), outcome: single('GHK-Cu') },
  { id: 'cellular_energy alone', when: (c) => has(c, 'cellular_energy'), outcome: single('NAD+') },
  // circadian alone is the deliberate asymmetry: a single box that still escalates.
  { id: 'circadian escalates', when: () => true, outcome: BLEND },
]

/**
 * R6 — hormonal returns a single only and takes no depth read; the blend is phase 2.
 * The qualifier (desire / arousal / both) does not change the molecule at launch.
 */
const LANE_E_PT141: LaneRule[] = [
  { id: 'always single', when: () => true, outcome: single('PT-141') },
]

export const LANE_RULES: Record<Lane, LaneRule[]> = {
  REPAIR: LANE_A_REPAIR,
  PERFORM: LANE_B_PERFORM,
  DEFINE: LANE_C_DEFINE,
  RESTORE: LANE_D_RESTORE,
  PT141: LANE_E_PT141,
}

export interface LaneResolution {
  outcome: BaseOutcome
  /** The id of the rule that fired, for tracing and tests. */
  trigger: string
}

export const resolveLane = (lane: Lane, context: LaneContext): LaneResolution => {
  const rule = LANE_RULES[lane].find((candidate) => candidate.when(context))

  if (!rule) {
    throw new Error(`No lane rule matched for ${lane}. Lane rule tables must be exhaustive.`)
  }

  const outcome = typeof rule.outcome === 'function' ? rule.outcome(context) : rule.outcome

  return { outcome, trigger: rule.id }
}
