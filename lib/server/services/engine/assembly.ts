import 'server-only'

import type { Lane } from '@/lib/shared/types/quiz.types'
import type {
  BlendId,
  Compound,
  Protocol,
  ResultShape,
  RevealTemplate,
  RuleId,
} from '@/lib/shared/types/engine.types'
import type { BaseOutcome } from './lane-resolution'

import { GLP1_CONTINUATION } from '@/lib/shared/types/engine.types'
import {
  BLEND_COMPOUNDS,
  LANE_BLEND,
  LANE_DEFAULT_SINGLE,
  PAIRS_WELL_WITH,
  R7_SUBSTITUTIONS,
} from '@/lib/server/constants/engine.constants'

/**
 * Lane order as the primary-goal screen presents it. Used only to pick which secondary
 * survives when a customer flags more than one.
 *
 * §4 defines shapes for zero or one secondary and the reveal draws exactly one
 * supporting card, but the secondary-goals screen is an uncapped multi-select over the
 * four remaining goals with no ranking — so ticking three has no defined result. We
 * resolve the first in this order and pass the full set to the handoff, so nothing the
 * customer asked for is lost even though only one is merchandised. Raised with the
 * client: capping the screen at one selection is the better fix and is their call.
 */
const LANE_PRIORITY: Lane[] = ['REPAIR', 'PERFORM', 'DEFINE', 'RESTORE', 'PT141']

export const selectSecondaryLane = (secondaries: Lane[], primary: Lane): Lane | null =>
  LANE_PRIORITY.find((lane) => lane !== primary && secondaries.includes(lane)) ?? null

const blendProtocol = (blend: BlendId): Protocol => ({
  kind: 'blend',
  id: blend,
  compounds: BLEND_COMPOUNDS[blend],
})

const singleProtocol = (compound: Compound): Protocol => ({
  kind: 'single',
  id: compound,
  compounds: [compound],
})

/** §3 Lane C glp1_active — molecule deliberately unresolved until intake. */
const glp1ContinuationProtocol = (): Protocol => ({
  kind: 'glp1_continuation',
  id: GLP1_CONTINUATION,
  compounds: ['Semaglutide', 'Tirzepatide'],
})

export const toProtocol = (lane: Lane, outcome: BaseOutcome): Protocol => {
  if (outcome.kind === 'glp1_continuation') return glp1ContinuationProtocol()
  if (outcome.kind === 'single') return singleProtocol(outcome.compound)

  const blend = LANE_BLEND[lane]

  if (!blend) {
    throw new Error(`Lane ${lane} resolved to a blend but has none defined.`)
  }

  return blendProtocol(blend)
}

export interface DedupResult {
  compound: Compound | null
  substituted: boolean
}

/**
 * R7 — adjunct/blend dedup.
 *
 * If the adjunct molecule is already inside the base blend, substitute per the §2A
 * table; where no substitute exists, drop the adjunct and show the blend solo.
 *
 * Under the current tables this never fires: an adjunct reaches here either as an R8
 * cross-lane default (and a secondary lane is by definition not the primary lane) or as
 * a pairs-well-with (none of which is a member of its own blend). It is implemented as
 * a guard, and `tests/unit/engine-constants.test.ts` pins both routes closed so that a
 * future change to a blend or an R8 default fails the suite rather than shipping a
 * duplicate molecule to a customer.
 */
export const dedupAgainstBlend = (base: Protocol, adjunct: Compound): DedupResult => {
  if (base.kind !== 'blend') return { compound: adjunct, substituted: false }

  const blend = base.id as BlendId

  if (!BLEND_COMPOUNDS[blend].includes(adjunct)) {
    return { compound: adjunct, substituted: false }
  }

  return { compound: R7_SUBSTITUTIONS[blend][adjunct] ?? null, substituted: true }
}

export interface Assembly {
  shape: ResultShape
  template: RevealTemplate
  base: Protocol
  supporting: Protocol | null
  pairsWellWith: Compound | null
  rulesFired: RuleId[]
}

export interface AssembleInput {
  base: Protocol
  secondaryLane: Lane | null
  /** Rules already fired upstream (R1, R2, R6) — assembly appends its own. */
  rulesFired: RuleId[]
}

/**
 * §4 — combine the primary result and any cross-lane secondary into one of four shapes.
 *
 * R3 caps the stack at one advanced blend; R4 caps each secondary at a single; R5 keeps
 * the primary's earned result intact regardless of how deep the secondary reads.
 */
export const assemble = ({ base, secondaryLane, rulesFired }: AssembleInput): Assembly => {
  // R3 (one blend max) and R5 (primary wins) are structural invariants of this
  // function rather than events — there is no branch that could violate them — so they
  // are not listed in `rulesFired`, matching how §7 reports each path.
  const rules = [...rulesFired]
  const baseIsBlend = base.kind === 'blend'

  if (!secondaryLane) {
    // Shape 2 is the only reveal that carries a pairs-well-with card. A solo *single*
    // is Shape 1, which the Copy Layer holds to "recommend-less discipline" — no
    // pairing, deliberately, even though there is room for one.
    if (!baseIsBlend) {
      return {
        shape: 'SHAPE_1_SINGLE',
        template: 'recommend_less',
        base,
        supporting: null,
        pairsWellWith: null,
        rulesFired: rules,
      }
    }

    const pairing = PAIRS_WELL_WITH[base.id as BlendId]
    const deduped = dedupAgainstBlend(base, pairing)

    return {
      shape: 'SHAPE_2_SOLO_BLEND',
      template: 'standard',
      base,
      supporting: null,
      pairsWellWith: deduped.compound,
      rulesFired: deduped.substituted ? [...rules, 'R7'] : rules,
    }
  }

  // R4 + R8 — the secondary bolts on exactly one single, chosen by that lane's default.
  rules.push('R4', 'R8')

  const deduped = dedupAgainstBlend(base, LANE_DEFAULT_SINGLE[secondaryLane])

  if (deduped.substituted) rules.push('R7')

  return {
    shape: baseIsBlend ? 'SHAPE_3_BLEND_PLUS_SINGLE' : 'SHAPE_4_TWO_SINGLES',
    // Shape 4 is two singles, but it still draws a supporting card, a plan selector and
    // a running total — the recommend-less template is scoped to Shape 1 alone.
    template: 'standard',
    base,
    supporting: deduped.compound ? singleProtocol(deduped.compound) : null,
    pairsWellWith: null,
    rulesFired: rules,
  }
}
