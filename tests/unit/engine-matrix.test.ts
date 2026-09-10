import type { QuizAnswers } from '@/lib/shared/types/quiz.types'
import type { Compound, ResultShape } from '@/lib/shared/types/engine.types'

import { describe, expect, it } from 'vitest'

import { engineService } from '@/lib/server/services/engine/engine.service'

import { answers } from '../helpers/answers'

/**
 * Backend Mapping §7 — the eighteen representative paths, run end to end.
 *
 * This is the acceptance suite for the engine: the doc states, for every path, the exact
 * assembled output a customer should see. Each case below quotes the doc's own input and
 * output columns, so a failure here means the engine and the signed-off spec disagree —
 * not that a test needs updating.
 */
interface MatrixCase {
  path: number
  inputs: string
  answers: QuizAnswers
  shape: ResultShape
  /** Compounds in the base protocol, in order. */
  base: Compound[]
  supporting: Compound | null
  pairsWellWith: Compound | null
}

const REPAIR_BLEND: Compound[] = ['BPC-157', 'TB-500', 'KPV', 'GHK-Cu']
const PERFORM_BLEND: Compound[] = ['CJC-1295', 'Ipamorelin']
const DEFINE_BLEND: Compound[] = ['AOD-9604', 'MOTS-c', 'Tesamorelin']
const RESTORE_BLEND: Compound[] = ['GHK-Cu', 'Epitalon']

const MATRIX: MatrixCase[] = [
  {
    path: 1,
    inputs: 'Recovery / depth_single / gut_mucosal / mechanical / no secondary',
    answers: answers({ lane: 'REPAIR', discriminator: ['gut_mucosal'], qualifier: 'mechanical' }),
    shape: 'SHAPE_1_SINGLE',
    base: ['BPC-157'],
    supporting: null,
    pairsWellWith: null,
  },
  {
    path: 2,
    inputs: 'Recovery / depth_layered / gut_mucosal + connective_skin / active / no secondary',
    answers: answers({
      lane: 'REPAIR',
      depth: 'depth_layered',
      discriminator: ['gut_mucosal', 'connective_skin'],
      qualifier: 'inflammatory_active',
    }),
    shape: 'SHAPE_2_SOLO_BLEND',
    base: REPAIR_BLEND,
    supporting: null,
    pairsWellWith: 'NAD+',
  },
  {
    path: 3,
    inputs: 'Recovery / systemic_multisite / active / RESTORE secondary',
    answers: answers({
      lane: 'REPAIR',
      discriminator: ['systemic_multisite'],
      qualifier: 'inflammatory_active',
      secondaryLanes: ['RESTORE'],
    }),
    shape: 'SHAPE_3_BLEND_PLUS_SINGLE',
    base: REPAIR_BLEND,
    supporting: 'NAD+',
    pairsWellWith: null,
  },
  {
    path: 4,
    inputs: 'Performance / recovery_lag alone / high load / no secondary',
    answers: answers({ lane: 'PERFORM', discriminator: ['recovery_lag'], qualifier: 'load_high' }),
    shape: 'SHAPE_1_SINGLE',
    base: ['Sermorelin'],
    supporting: null,
    pairsWellWith: null,
  },
  {
    path: 5,
    inputs: 'Performance / multidomain_decline / elite / DEFINE secondary',
    answers: answers({
      lane: 'PERFORM',
      discriminator: ['multidomain_decline'],
      qualifier: 'load_elite',
      secondaryLanes: ['DEFINE'],
    }),
    shape: 'SHAPE_3_BLEND_PLUS_SINGLE',
    base: PERFORM_BLEND,
    supporting: 'MOTS-c',
    pairsWellWith: null,
  },
  {
    path: 6,
    inputs: 'Performance / recovery_lag alone / moderate / RESTORE secondary',
    answers: answers({
      lane: 'PERFORM',
      discriminator: ['recovery_lag'],
      qualifier: 'load_moderate',
      secondaryLanes: ['RESTORE'],
    }),
    shape: 'SHAPE_4_TWO_SINGLES',
    base: ['Sermorelin'],
    supporting: 'NAD+',
    pairsWellWith: null,
  },
  {
    path: 7,
    inputs: 'Metabolic / subcutaneous / glp1_naive / no secondary',
    answers: answers({ lane: 'DEFINE', discriminator: ['subcutaneous'], qualifier: 'glp1_naive' }),
    shape: 'SHAPE_1_SINGLE',
    base: ['AOD-9604'],
    supporting: null,
    pairsWellWith: null,
  },
  {
    path: 8,
    inputs: 'Metabolic / visceral / glp1_naive / no secondary',
    answers: answers({ lane: 'DEFINE', discriminator: ['visceral'], qualifier: 'glp1_naive' }),
    shape: 'SHAPE_1_SINGLE',
    base: ['Tesamorelin'],
    supporting: null,
    pairsWellWith: null,
  },
  {
    path: 9,
    inputs: 'Metabolic / metabolic_slowdown / glp1_naive / no secondary',
    answers: answers({
      lane: 'DEFINE',
      discriminator: ['metabolic_slowdown'],
      qualifier: 'glp1_naive',
    }),
    shape: 'SHAPE_1_SINGLE',
    base: ['MOTS-c'],
    supporting: null,
    pairsWellWith: null,
  },
  {
    path: 10,
    inputs: 'Metabolic / mixed / glp1_naive / RESTORE secondary',
    answers: answers({
      lane: 'DEFINE',
      discriminator: ['mixed'],
      qualifier: 'glp1_naive',
      secondaryLanes: ['RESTORE'],
    }),
    shape: 'SHAPE_3_BLEND_PLUS_SINGLE',
    base: DEFINE_BLEND,
    supporting: 'NAD+',
    pairsWellWith: null,
  },
  {
    path: 11,
    inputs: 'Metabolic / any / glp1_active / no secondary',
    answers: answers({ lane: 'DEFINE', discriminator: ['subcutaneous'], qualifier: 'glp1_active' }),
    shape: 'SHAPE_1_SINGLE',
    base: ['Semaglutide', 'Tirzepatide'],
    supporting: null,
    pairsWellWith: null,
  },
  {
    path: 12,
    inputs: 'Metabolic / any / glp1_rebound / no secondary',
    answers: answers({
      lane: 'DEFINE',
      discriminator: ['subcutaneous'],
      qualifier: 'glp1_rebound',
    }),
    shape: 'SHAPE_2_SOLO_BLEND',
    base: DEFINE_BLEND,
    supporting: null,
    pairsWellWith: 'BPC-157',
  },
  {
    path: 13,
    inputs: 'Skin & Longevity / skin_visible alone / no secondary',
    answers: answers({
      lane: 'RESTORE',
      discriminator: ['skin_visible'],
      qualifier: 'rhythm_solid',
    }),
    shape: 'SHAPE_1_SINGLE',
    base: ['GHK-Cu'],
    supporting: null,
    pairsWellWith: null,
  },
  {
    path: 14,
    inputs: 'Skin & Longevity / cellular_energy alone / no secondary',
    answers: answers({
      lane: 'RESTORE',
      discriminator: ['cellular_energy'],
      qualifier: 'rhythm_solid',
    }),
    shape: 'SHAPE_1_SINGLE',
    base: ['NAD+'],
    supporting: null,
    pairsWellWith: null,
  },
  {
    path: 15,
    inputs: 'Skin & Longevity / broad_healthspan / DEFINE secondary',
    answers: answers({
      lane: 'RESTORE',
      discriminator: ['broad_healthspan'],
      qualifier: 'rhythm_broken',
      secondaryLanes: ['DEFINE'],
    }),
    shape: 'SHAPE_3_BLEND_PLUS_SINGLE',
    base: RESTORE_BLEND,
    supporting: 'MOTS-c',
    pairsWellWith: null,
  },
  {
    path: 16,
    inputs: 'Skin & Longevity / broad_healthspan / no secondary',
    answers: answers({
      lane: 'RESTORE',
      discriminator: ['broad_healthspan'],
      qualifier: 'rhythm_broken',
    }),
    shape: 'SHAPE_2_SOLO_BLEND',
    base: RESTORE_BLEND,
    supporting: null,
    pairsWellWith: 'NAD+',
  },
  {
    path: 17,
    inputs: 'Sex drive / desire / no secondary',
    answers: answers({ lane: 'PT141', discriminator: [], qualifier: 'desire' }),
    shape: 'SHAPE_1_SINGLE',
    base: ['PT-141'],
    supporting: null,
    pairsWellWith: null,
  },
  {
    path: 18,
    inputs: 'Sex drive / arousal / PERFORM secondary',
    answers: answers({
      lane: 'PT141',
      discriminator: [],
      qualifier: 'arousal',
      secondaryLanes: ['PERFORM'],
    }),
    shape: 'SHAPE_4_TWO_SINGLES',
    base: ['PT-141'],
    supporting: 'Sermorelin',
    pairsWellWith: null,
  },
]

describe('§7 test matrix', () => {
  it.each(MATRIX)('path $path — $inputs', (testCase) => {
    const result = engineService.resolve(testCase.answers)

    expect(result.shape).toBe(testCase.shape)
    expect(result.base.compounds).toEqual(testCase.base)
    expect(result.supporting?.compounds[0] ?? null).toBe(testCase.supporting)
    expect(result.pairsWellWith).toBe(testCase.pairsWellWith)
  })

  it('covers all eighteen paths', () => {
    expect(MATRIX).toHaveLength(18)
    expect(MATRIX.map((c) => c.path)).toEqual(Array.from({ length: 18 }, (_, i) => i + 1))
  })

  /** §4: recommend-less is Shape 1 alone; every other shape gets the full reveal. */
  it('uses the recommend-less template only on shape 1', () => {
    for (const testCase of MATRIX) {
      const result = engineService.resolve(testCase.answers)
      const expected = testCase.shape === 'SHAPE_1_SINGLE' ? 'recommend_less' : 'standard'

      expect(result.template, `path ${testCase.path}`).toBe(expected)
    }
  })

  /** §4: the pairs-well-with card exists only on a solo blend. */
  it('offers pairs-well-with only on shape 2', () => {
    for (const testCase of MATRIX) {
      const result = engineService.resolve(testCase.answers)

      if (testCase.shape === 'SHAPE_2_SOLO_BLEND') {
        expect(result.pairsWellWith, `path ${testCase.path}`).not.toBeNull()
      } else {
        expect(result.pairsWellWith, `path ${testCase.path}`).toBeNull()
      }
    }
  })

  /** §7A duplicate check: "No duplicate molecules across any of the 18 assembled outputs." */
  it('never repeats a molecule within an assembled stack', () => {
    for (const testCase of MATRIX) {
      const result = engineService.resolve(testCase.answers)
      const stack = [
        ...result.base.compounds,
        ...(result.supporting?.compounds ?? []),
        ...(result.pairsWellWith ? [result.pairsWellWith] : []),
      ]

      expect(new Set(stack).size, `path ${testCase.path} stack ${stack.join(' + ')}`).toBe(
        stack.length,
      )
    }
  })
})
