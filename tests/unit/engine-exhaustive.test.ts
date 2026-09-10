import type {
  DiscriminatorSignal,
  Lane,
  Qualifier,
  QuizAnswers,
  SleepHours,
  StressLevel,
} from '@/lib/shared/types/quiz.types'

import { describe, expect, it } from 'vitest'

import { engineService } from '@/lib/server/services/engine/engine.service'
import { FORMULARY, isBlendEligible } from '@/lib/server/constants/formulary.constants'

import { answers } from '../helpers/answers'

const LANES: Lane[] = ['REPAIR', 'PERFORM', 'DEFINE', 'RESTORE', 'PT141']

const SLEEP: SleepHours[] = ['sleep_under_5', 'sleep_5_6', 'sleep_6_7', 'sleep_7_8', 'sleep_8_plus']

const STRESS: StressLevel[] = [
  'stress_steady',
  'stress_managing',
  'stress_stretched',
  'stress_empty',
]

const SIGNALS: Record<Lane, DiscriminatorSignal[]> = {
  REPAIR: ['localised_soft_tissue', 'gut_mucosal', 'connective_skin', 'systemic_multisite'],
  PERFORM: ['recovery_lag', 'body_comp_stall', 'sleep_gh', 'multidomain_decline'],
  DEFINE: ['subcutaneous', 'visceral', 'mixed', 'metabolic_slowdown'],
  RESTORE: ['skin_visible', 'circadian', 'cellular_energy', 'broad_healthspan'],
  PT141: [],
}

const QUALIFIERS: Record<Lane, Qualifier[]> = {
  REPAIR: ['inflammatory_active', 'inflammatory_intermittent', 'mechanical'],
  PERFORM: ['load_light', 'load_moderate', 'load_high', 'load_elite'],
  DEFINE: ['glp1_naive', 'glp1_active', 'glp1_rebound'],
  RESTORE: ['rhythm_solid', 'rhythm_broken', 'rhythm_shifted', 'rhythm_fine'],
  PT141: ['desire', 'arousal', 'both'],
}

const nonEmptySubsets = <T>(items: T[]): T[][] =>
  Array.from({ length: 2 ** items.length }, (_, mask) =>
    items.filter((_item, index) => mask & (1 << index)),
  ).filter((subset) => subset.length > 0)

const subsets = <T>(items: T[]): T[][] =>
  Array.from({ length: 2 ** items.length }, (_, mask) =>
    items.filter((_item, index) => mask & (1 << index)),
  )

/**
 * Discriminator sets a real customer can produce. Lane C is single-select ("the pinch
 * test") and Lane E has no discriminator at all, so neither takes arbitrary subsets.
 */
const discriminatorSets = (lane: Lane): DiscriminatorSignal[][] => {
  if (lane === 'PT141') return [[]]
  if (lane === 'DEFINE') return SIGNALS.DEFINE.map((signal) => [signal])

  return nonEmptySubsets(SIGNALS[lane])
}

const everyAnswerSet = (): QuizAnswers[] => {
  const all: QuizAnswers[] = []

  for (const lane of LANES) {
    const secondaryOptions = subsets(LANES.filter((candidate) => candidate !== lane))

    for (const discriminator of discriminatorSets(lane)) {
      for (const qualifier of QUALIFIERS[lane]) {
        for (const secondaryLanes of secondaryOptions) {
          for (const sleepHours of SLEEP) {
            for (const stressLevel of STRESS) {
              all.push(
                answers({
                  lane,
                  discriminator,
                  qualifier,
                  secondaryLanes,
                  sleepHours,
                  stressLevel,
                }),
              )
            }
          }
        }
      }
    }
  }

  return all
}

/**
 * §7A scans the eighteen sampled paths and reports them clean. This runs the same four
 * checks across every answer combination a customer can actually produce, because
 * eighteen samples cannot prove "every path resolves to a definite output" — and the
 * consequence of a gap is a blank or duplicated molecule in front of a real patient.
 */
describe('exhaustive resolution sweep', () => {
  const all = everyAnswerSet()

  it('generates the full answer space', () => {
    expect(all.length).toBeGreaterThan(10_000)
  })

  it('resolves every path to a definite, formulary-cleared output', () => {
    for (const input of all) {
      const result = engineService.resolve(input)
      const stack = [
        ...result.base.compounds,
        ...(result.supporting?.compounds ?? []),
        ...(result.pairsWellWith ? [result.pairsWellWith] : []),
      ]

      expect(result.base.compounds.length, JSON.stringify(input)).toBeGreaterThan(0)

      for (const compound of stack) {
        expect(Object.hasOwn(FORMULARY, compound), `${compound} missing from formulary`).toBe(true)
      }
    }
  })

  it('never repeats a molecule within a stack', () => {
    for (const input of all) {
      const result = engineService.resolve(input)
      const stack = [
        ...result.base.compounds,
        ...(result.supporting?.compounds ?? []),
        ...(result.pairsWellWith ? [result.pairsWellWith] : []),
      ]

      expect(new Set(stack).size, `${input.lane}: ${stack.join(' + ')}`).toBe(stack.length)
    }
  })

  /** R3 — at most one advanced blend, ever. The supporting protocol is always a single. */
  it('never assembles two blends', () => {
    for (const input of all) {
      const result = engineService.resolve(input)

      expect(result.supporting?.kind ?? 'single', JSON.stringify(input)).not.toBe('blend')
    }
  })

  /** GLP-1 medications are standalone 503A only and are never blended. */
  it('never places a non-blend-eligible compound inside a blend', () => {
    for (const input of all) {
      const result = engineService.resolve(input)

      if (result.base.kind !== 'blend') continue

      for (const compound of result.base.compounds) {
        expect(isBlendEligible(compound), `${compound} is not blend eligible`).toBe(true)
      }
    }
  })

  /** §4 — shape, template and the pairs-well-with card must stay consistent. */
  it('keeps shape, template and pairing consistent', () => {
    for (const input of all) {
      const result = engineService.resolve(input)
      const context = JSON.stringify(input)

      expect(result.template, context).toBe(
        result.shape === 'SHAPE_1_SINGLE' ? 'recommend_less' : 'standard',
      )
      expect(result.pairsWellWith === null, context).toBe(result.shape !== 'SHAPE_2_SOLO_BLEND')
      expect(result.supporting === null, context).toBe(
        result.shape === 'SHAPE_1_SINGLE' || result.shape === 'SHAPE_2_SOLO_BLEND',
      )
    }
  })

  it('always selects exactly one read variant', () => {
    for (const input of all) {
      const result = engineService.resolve(input)

      expect(result.readVariant, JSON.stringify(input)).toBeTruthy()
    }
  })
})
