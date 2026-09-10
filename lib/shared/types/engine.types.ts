import type { Lane, QuizAnswers } from './quiz.types'

export type Compound =
  | 'BPC-157'
  | 'TB-500'
  | 'KPV'
  | 'GHK-Cu'
  | 'Sermorelin'
  | 'CJC-1295'
  | 'Ipamorelin'
  | 'AOD-9604'
  | 'Tesamorelin'
  | 'MOTS-c'
  | 'NAD+'
  | 'Epitalon'
  | 'PT-141'
  | 'Semaglutide'
  | 'Tirzepatide'

export type BlendId = 'REPAIR' | 'PERFORM' | 'DEFINE' | 'RESTORE'

export type ResultShape =
  'SHAPE_1_SINGLE' | 'SHAPE_2_SOLO_BLEND' | 'SHAPE_3_BLEND_PLUS_SINGLE' | 'SHAPE_4_TWO_SINGLES'

export type RevealTemplate = 'standard' | 'recommend_less'

export type ReadVariantId =
  | 'sharp_bodycomp_low_sleep'
  | 'sharp_visceral_high_stress'
  | 'sharp_systemic_recovery_low_sleep'
  | 'sharp_flat_energy_high_stress'
  | 'sharp_libido_high_stress'
  | 'fallback_repair'
  | 'fallback_perform'
  | 'fallback_define'
  | 'fallback_restore'
  | 'fallback_pt141'

/**
 * `glp1_continuation` is the Lane C `glp1_active` outcome. The engine deliberately
 * cannot name the molecule: §3 resolves it to "Semaglutide OR Tirzepatide, matched to
 * customer's script at intake". Both candidates travel in `compounds` and the clinician
 * picks — guessing here would put the wrong GLP-1 in front of someone already on one.
 */
export type ProtocolKind = 'single' | 'blend' | 'glp1_continuation'

export const GLP1_CONTINUATION = 'GLP1_CONTINUATION' as const

export interface Protocol {
  kind: ProtocolKind
  id: Compound | BlendId | typeof GLP1_CONTINUATION
  compounds: Compound[]
}

/** Which §2/§3/§4 rules fired. Carried so the test matrix can assert on them. */
export type RuleId = 'R1' | 'R2' | 'R3' | 'R4' | 'R5' | 'R6' | 'R7' | 'R8'

export interface EngineResult {
  shape: ResultShape
  template: RevealTemplate
  lane: Lane
  /** True when R2 read the primary lane as layered (blend-earning). */
  layered: boolean
  base: Protocol
  /** The cross-lane secondary single, per R4/R8. Null on shapes 1 and 2. */
  supporting: Protocol | null
  /** §4A curated pairing. Shape 2 only — null everywhere else. */
  pairsWellWith: Compound | null
  readVariant: ReadVariantId
  rulesFired: RuleId[]
}

/**
 * §6 — everything passed by token into the clinical intake, which re-asks none of it.
 * `chosenPlanLength` is set at the reveal (S10), so it is absent until then.
 */
export interface HandoffPayload {
  answers: QuizAnswers
  assembledStack: EngineResult
  chosenPlanLength: 1 | 3 | 6 | null
}
