import type { DiscriminatorSignal, Lane } from '@/lib/shared/types/quiz.types'
import type { Compound, ReadVariantId } from '@/lib/shared/types/engine.types'

import { describe, expect, it } from 'vitest'

import { BRANCHES, resolveRecognition } from '@/lib/shared/content/branches.content'
import { BLEND_COPY, COMPOUND_COPY } from '@/lib/shared/content/compounds.content'
import {
  CONTROLS,
  DAY_90_LINE,
  HANDOFF_DISCLAIMER,
  PLAN_SELECTOR,
  READ_INTRO,
  READ_VARIANTS,
  RECOMMEND_LESS,
  STICKY_FOOTER_CTA,
} from '@/lib/shared/content/reveal.content'
import {
  DEPTH_SCREEN,
  EMAIL_SCREEN,
  LANE_OPTIONS,
  NAME_SCREEN,
  NINETY_DAY_SCREEN,
  PRIMARY_GOAL_SCREEN,
  SEX_AT_BIRTH_SCREEN,
  SLEEP_SCREEN,
  STRESS_SCREEN,
  WELCOME_INTERSTITIAL_SCREEN,
  WELCOME_SCREEN,
  secondaryGoalOptions,
} from '@/lib/shared/content/screens.content'

const LANES: Lane[] = ['REPAIR', 'PERFORM', 'DEFINE', 'RESTORE', 'PT141']

/**
 * Option *values* are already bound to the engine's unions by the type system — a screen
 * offering something the engine has never heard of will not compile. These tests cover
 * what types cannot: that the words are actually there, and that the copy is copy rather
 * than markup.
 */
describe('quiz content', () => {
  const everyString = (value: unknown): string[] => {
    if (typeof value === 'string') return [value]
    if (Array.isArray(value)) return value.flatMap(everyString)
    if (value && typeof value === 'object') return Object.values(value).flatMap(everyString)

    return []
  }

  const ALL_COPY = everyString([
    WELCOME_SCREEN,
    NAME_SCREEN,
    WELCOME_INTERSTITIAL_SCREEN,
    SEX_AT_BIRTH_SCREEN,
    PRIMARY_GOAL_SCREEN,
    DEPTH_SCREEN,
    SLEEP_SCREEN,
    STRESS_SCREEN,
    NINETY_DAY_SCREEN,
    EMAIL_SCREEN,
    BRANCHES,
    READ_VARIANTS,
    READ_INTRO,
    PLAN_SELECTOR,
    DAY_90_LINE,
    CONTROLS,
    STICKY_FOOTER_CTA,
    RECOMMEND_LESS,
    HANDOFF_DISCLAIMER,
    BLEND_COPY,
    COMPOUND_COPY,
  ])

  /**
   * These are TypeScript string literals, not JSX — an HTML entity here reaches the
   * customer as the literal text "what&apos;s". Caught three of these by eye while
   * transcribing, which is three too many to keep relying on eyes.
   */
  it('contains no HTML entities', () => {
    const entity = /&(?:[a-zA-Z]+|#\d+);/

    for (const text of ALL_COPY) {
      expect(entity.test(text), `HTML entity in: ${text.slice(0, 80)}`).toBe(false)
    }
  })

  /** The source doc uses straight quotes throughout; curly ones are a transcription slip. */
  it('uses the same quote characters as the source document', () => {
    for (const text of ALL_COPY) {
      expect(/[‘’“”]/.test(text), `curly quote in: ${text.slice(0, 80)}`).toBe(false)
    }
  })

  it('has no empty copy', () => {
    for (const text of ALL_COPY) {
      expect(text.trim().length, 'empty string in content').toBeGreaterThan(0)
    }
  })
})

describe('screens', () => {
  it('offers every lane on the primary goal screen', () => {
    expect(LANE_OPTIONS.map((option) => option.value).sort()).toEqual([...LANES].sort())
    expect(PRIMARY_GOAL_SCREEN.select).toBe('single')
  })

  /** S7 offers the four goals *not* chosen at S5, derived so the two lists cannot drift. */
  it.each(LANES)('excludes %s from its own secondary goals', (lane) => {
    const options = secondaryGoalOptions(lane)

    expect(options).toHaveLength(4)
    expect(options.map((option) => option.value)).not.toContain(lane)
  })

  it('marks the self-describe option as taking free text', () => {
    const selfDescribe = SEX_AT_BIRTH_SCREEN.options.find((o) => o.value === 'self_describe')

    expect(selfDescribe?.freeText).toBe(true)
  })
})

describe('branches', () => {
  it('covers every lane', () => {
    for (const lane of LANES) {
      expect(BRANCHES[lane], lane).toBeDefined()
      expect(BRANCHES[lane].qualifier.options.length, `${lane} qualifier`).toBeGreaterThan(0)
      expect(BRANCHES[lane].education.body.length, `${lane} education`).toBeGreaterThan(0)
    }
  })

  /** R6 — PT-141 is qualifier-only, matching the engine and the Zod schema. */
  it('gives PT141 no discriminator', () => {
    expect(BRANCHES.PT141.discriminator).toBeNull()
  })

  /** "The pinch test" — single-select, which is why Lane C's 2+ boxes rule is dead. */
  it('makes the body-composition discriminator single-select', () => {
    expect(BRANCHES.DEFINE.discriminator?.select).toBe('single')
  })

  it.each(['REPAIR', 'PERFORM', 'RESTORE'] as const)('makes %s multi-select', (lane) => {
    expect(BRANCHES[lane].discriminator?.select).toBe('multi')
  })
})

describe('recognition lines', () => {
  const fired = (lane: Lane, signals: DiscriminatorSignal[]) =>
    resolveRecognition(lane, signals)?.id

  it('fires the gut-plus-structural line for REPAIR', () => {
    expect(fired('REPAIR', ['gut_mucosal', 'localised_soft_tissue'])).toBe('gut_plus_structural')
    expect(fired('REPAIR', ['gut_mucosal', 'systemic_multisite'])).toBe('gut_plus_structural')
  })

  it('falls back to the multi-site beat on other REPAIR combinations', () => {
    expect(fired('REPAIR', ['localised_soft_tissue', 'connective_skin'])).toBe('multi_site')
  })

  /** Deliberate silence — the build note says no recognition on a single box. */
  it.each([
    ['gut_mucosal'],
    ['localised_soft_tissue'],
    ['connective_skin'],
    ['systemic_multisite'],
  ])('fires nothing for REPAIR with only %s', (signal) => {
    expect(resolveRecognition('REPAIR', [signal as DiscriminatorSignal])).toBeNull()
  })

  it('fires the system-shift line for PERFORM on 2+ boxes or multidomain_decline', () => {
    expect(fired('PERFORM', ['recovery_lag', 'sleep_gh'])).toBe('system_shift')
    expect(fired('PERFORM', ['multidomain_decline'])).toBe('system_shift')
  })

  it('fires the alternate beat for PERFORM recovery_lag alone', () => {
    expect(fired('PERFORM', ['recovery_lag'])).toBe('recovery_lag_alone')
  })

  it('fires a line for every DEFINE answer', () => {
    expect(fired('DEFINE', ['visceral'])).toBe('visceral_or_mixed')
    expect(fired('DEFINE', ['mixed'])).toBe('visceral_or_mixed')
    expect(fired('DEFINE', ['subcutaneous'])).toBe('subcutaneous')
    expect(fired('DEFINE', ['metabolic_slowdown'])).toBe('metabolic_slowdown')
  })

  it('fires the overlapping-clocks line for RESTORE on 2+ or broad_healthspan', () => {
    expect(fired('RESTORE', ['skin_visible', 'circadian'])).toBe('overlapping_clocks')
    expect(fired('RESTORE', ['broad_healthspan'])).toBe('overlapping_clocks')
  })

  it('fires the alternate beats for RESTORE single boxes', () => {
    expect(fired('RESTORE', ['skin_visible'])).toBe('skin_visible_alone')
    expect(fired('RESTORE', ['cellular_energy'])).toBe('cellular_energy_alone')
  })

  /** circadian alone has no documented beat, and escalates to a blend regardless. */
  it('fires nothing for RESTORE circadian alone', () => {
    expect(resolveRecognition('RESTORE', ['circadian'])).toBeNull()
  })

  it('always fires for PT141, which has no discriminator', () => {
    expect(fired('PT141', [])).toBe('desire_vs_arousal')
  })
})

describe('reveal', () => {
  const READ_IDS: ReadVariantId[] = [
    'sharp_bodycomp_low_sleep',
    'sharp_visceral_high_stress',
    'sharp_systemic_recovery_low_sleep',
    'sharp_flat_energy_high_stress',
    'sharp_libido_high_stress',
    'fallback_repair',
    'fallback_perform',
    'fallback_define',
    'fallback_restore',
    'fallback_pt141',
  ]

  it('has copy for all ten read variants', () => {
    for (const id of READ_IDS) {
      expect(READ_VARIANTS[id]?.length, id).toBeGreaterThan(50)
    }
  })

  it('keeps every read distinct', () => {
    expect(new Set(Object.values(READ_VARIANTS)).size).toBe(READ_IDS.length)
  })

  /** LOCKED in §5.4 — the default and the framing line are not ours to change. */
  it('defaults the plan selector to three months', () => {
    expect(PLAN_SELECTOR.defaultMonths).toBe(3)
    expect(PLAN_SELECTOR.options.filter((option) => option.recommended)).toHaveLength(1)
    expect(PLAN_SELECTOR.options.find((option) => option.recommended)?.months).toBe(3)
    expect(PLAN_SELECTOR.clinicalLine).toBe(
      'Peptide protocols are clinically recommended to run for at least 3 months to signal your body properly.',
    )
  })

  /** §5.7 — "Add-anything turns the engine into a shop." */
  it('offers no generic add control', () => {
    expect(Object.values(CONTROLS).join(' ').toLowerCase()).not.toContain('add ')
  })

  it('substitutes the name into the read and the recommend-less header', () => {
    expect(READ_INTRO).toContain('[name]')
    expect(RECOMMEND_LESS.heading).toContain('[name]')
  })
})

/**
 * The copy backlog, asserted rather than described.
 *
 * Most reveal copy is still with the client. This test names exactly what is missing, so
 * delivery is visible progress rather than a silent pass — and so nobody can flip a
 * `pending` marker to `written` without supplying real words. Update these lists as copy
 * lands; see docs/COPY_BACKLOG.md.
 */
describe('copy backlog', () => {
  /**
   * NAD+ came from the copy layer's worked example; BPC-157 and TB-500 were harvested
   * from the reveal frames in Phase 5. Everything else is still with the client.
   */
  const WRITTEN_COMPOUNDS: Compound[] = ['NAD+', 'BPC-157', 'TB-500']

  it('has the copy that actually exists', () => {
    expect(BLEND_COPY.REPAIR.card.status).toBe('written')
    for (const compound of WRITTEN_COMPOUNDS) {
      expect(COMPOUND_COPY[compound].card.status, compound).toBe('written')
    }
  })

  /**
   * The reveal frames settled the open question from Phase 2: card copy is written per
   * answer pattern, not per compound. BPC-157 argues a different case as a solo
   * recommend-less result than it does carrying an adjunct.
   */
  it('varies BPC-157 by result shape', () => {
    expect(COMPOUND_COPY['BPC-157'].paragraphByShape?.SHAPE_1_SINGLE).toBeTruthy()
    expect(COMPOUND_COPY['BPC-157'].paragraphByShape?.SHAPE_1_SINGLE).not.toBe(
      COMPOUND_COPY['BPC-157'].card.status === 'written'
        ? COMPOUND_COPY['BPC-157'].card.paragraph
        : null,
    )
  })

  it('marks every other protocol as pending', () => {
    const stillPending = (Object.keys(COMPOUND_COPY) as Compound[]).filter(
      (compound) =>
        COMPOUND_COPY[compound].card.status === 'pending' && !WRITTEN_COMPOUNDS.includes(compound),
    )

    expect(stillPending).toHaveLength(Object.keys(COMPOUND_COPY).length - WRITTEN_COMPOUNDS.length)
    expect(BLEND_COPY.PERFORM.card.status).toBe('pending')
    expect(BLEND_COPY.DEFINE.card.status).toBe('pending')
    expect(BLEND_COPY.RESTORE.card.status).toBe('pending')
  })

  it('gives written cards exactly four benefit chips', () => {
    for (const copy of [
      BLEND_COPY.REPAIR.card,
      ...WRITTEN_COMPOUNDS.map((compound) => COMPOUND_COPY[compound].card),
    ]) {
      if (copy.status !== 'written') throw new Error('expected written copy')

      expect(copy.chips).toHaveLength(4)
      expect(copy.paragraph.length).toBeGreaterThan(50)
    }
  })

  /** Only the Recovery lane is priced, from the confirmed Figma frames. */
  it('prices only what the client has actually priced', () => {
    expect(BLEND_COPY.REPAIR.monthlyPrice).toBe(340)
    expect(COMPOUND_COPY['BPC-157'].monthlyPrice).toBe(225)
    expect(COMPOUND_COPY['TB-500'].monthlyPrice).toBe(185)

    const priced = (Object.keys(COMPOUND_COPY) as Compound[]).filter(
      (compound) => COMPOUND_COPY[compound].monthlyPrice !== null,
    )

    expect(priced.sort()).toEqual(['BPC-157', 'TB-500'])
  })
})
