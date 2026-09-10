import 'server-only'

import type { Lane } from '@/lib/shared/types/quiz.types'
import type { BlendId, Compound, ReadVariantId } from '@/lib/shared/types/engine.types'

export const LANE_BLEND: Record<Lane, BlendId | null> = {
  REPAIR: 'REPAIR',
  PERFORM: 'PERFORM',
  DEFINE: 'DEFINE',
  RESTORE: 'RESTORE',
  PT141: null,
}

export const BLEND_COMPOUNDS: Record<BlendId, Compound[]> = {
  REPAIR: ['BPC-157', 'TB-500', 'KPV', 'GHK-Cu'],
  PERFORM: ['CJC-1295', 'Ipamorelin'],
  DEFINE: ['AOD-9604', 'MOTS-c', 'Tesamorelin'],
  RESTORE: ['GHK-Cu', 'Epitalon'],
}

/** R8 — cross-lane secondary defaults. */
export const LANE_DEFAULT_SINGLE: Record<Lane, Compound> = {
  REPAIR: 'BPC-157',
  PERFORM: 'Sermorelin',
  DEFINE: 'MOTS-c',
  RESTORE: 'NAD+',
  PT141: 'PT-141',
}

/** §4A — one curated single per base, shown only on Shape 2. */
export const PAIRS_WELL_WITH: Record<BlendId, Compound> = {
  REPAIR: 'NAD+',
  PERFORM: 'MOTS-c',
  DEFINE: 'BPC-157',
  RESTORE: 'NAD+',
}

/**
 * R7 — adjunct/blend dedup substitutions (§2A, locked).
 * Keyed by blend, then by the colliding adjunct. If an adjunct collides and no
 * substitute is listed, the adjunct is dropped and the blend shows solo.
 */
export const R7_SUBSTITUTIONS: Record<BlendId, Partial<Record<Compound, Compound>>> = {
  REPAIR: { 'BPC-157': 'TB-500' },
  PERFORM: { Sermorelin: 'MOTS-c' },
  DEFINE: { 'MOTS-c': 'BPC-157' },
  RESTORE: { 'GHK-Cu': 'NAD+' },
}

export const LANE_FALLBACK_READ: Record<Lane, ReadVariantId> = {
  REPAIR: 'fallback_repair',
  PERFORM: 'fallback_perform',
  DEFINE: 'fallback_define',
  RESTORE: 'fallback_restore',
  PT141: 'fallback_pt141',
}

export const LOW_SLEEP = ['sleep_under_5', 'sleep_5_6', 'sleep_6_7'] as const

export const HIGH_STRESS = ['stress_stretched', 'stress_empty'] as const
