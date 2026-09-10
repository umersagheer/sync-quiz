import type { Lane } from './quiz.types'

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

export interface Protocol {
  kind: 'single' | 'blend'
  id: Compound | BlendId
  compounds: Compound[]
}

export interface EngineResult {
  shape: ResultShape
  template: RevealTemplate
  lane: Lane
  base: Protocol
  supporting: Protocol | null
  pairsWellWith: Compound | null
  readVariant: ReadVariantId
}
