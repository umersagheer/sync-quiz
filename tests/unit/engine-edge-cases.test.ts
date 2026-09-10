import { describe, expect, it } from 'vitest'

import { engineService } from '@/lib/server/services/engine/engine.service'
import { LANE_RULES } from '@/lib/server/services/engine/lane-resolution'

import { answers } from '../helpers/answers'

/**
 * Cases §7 does not cover, all of them places where the doc's lane tables have two rows
 * that match the same answers. §3 is written as a list of rows, not an ordered decision
 * tree, so these pin the order the engine reads them in.
 */
describe('lane resolution edge cases', () => {
  describe('Lane A — REPAIR', () => {
    /**
     * The one that actually bites: `systemic_multisite` alone with a `mechanical`
     * qualifier matches "1 box + mechanical → BPC-157 single" AND
     * "systemic_multisite (any count) → REPAIR blend". The escalation signal wins —
     * "All of it, don't repair like I did" is not a one-vial answer.
     */
    it('escalates systemic_multisite even with a mechanical qualifier', () => {
      const result = engineService.resolve(
        answers({ lane: 'REPAIR', discriminator: ['systemic_multisite'], qualifier: 'mechanical' }),
      )

      expect(result.base.kind).toBe('blend')
      expect(result.base.id).toBe('REPAIR')
    })

    /** Backend Lane A row 2 — the row the Copy Layer's inline summary drops entirely. */
    it('escalates a single box with an intermittent qualifier', () => {
      const result = engineService.resolve(
        answers({
          lane: 'REPAIR',
          discriminator: ['gut_mucosal'],
          qualifier: 'inflammatory_intermittent',
        }),
      )

      expect(result.base.kind).toBe('blend')
    })

    it('returns the single only for one box with a mechanical qualifier', () => {
      const result = engineService.resolve(
        answers({ lane: 'REPAIR', discriminator: ['gut_mucosal'], qualifier: 'mechanical' }),
      )

      expect(result.base.compounds).toEqual(['BPC-157'])
    })
  })

  describe('Lane B — PERFORM', () => {
    it('escalates recovery_lag alone when the load is elite', () => {
      const result = engineService.resolve(
        answers({ lane: 'PERFORM', discriminator: ['recovery_lag'], qualifier: 'load_elite' }),
      )

      expect(result.base.kind).toBe('blend')
    })

    /** Backend Lane B row 5 — a single box that is not recovery_lag has no single path. */
    it.each(['body_comp_stall', 'sleep_gh'] as const)('escalates %s alone', (signal) => {
      const result = engineService.resolve(
        answers({ lane: 'PERFORM', discriminator: [signal], qualifier: 'load_moderate' }),
      )

      expect(result.base.kind).toBe('blend')
    })
  })

  describe('Lane C — DEFINE', () => {
    /** glp1_active is "any pattern" — it must outrank every discriminator row. */
    it.each(['subcutaneous', 'visceral', 'mixed', 'metabolic_slowdown'] as const)(
      'returns the continuation single for glp1_active regardless of pattern (%s)',
      (signal) => {
        const result = engineService.resolve(
          answers({ lane: 'DEFINE', discriminator: [signal], qualifier: 'glp1_active' }),
        )

        expect(result.base.kind).toBe('glp1_continuation')
        expect(result.base.compounds).toEqual(['Semaglutide', 'Tirzepatide'])
      },
    )

    /**
     * Backend §3 Lane C defines a "2+ boxes -> DEFINE blend" row, but the Copy Layer
     * specifies this discriminator as SINGLE-SELECT ("the pinch test") and `mixed` is
     * how the lane expresses two patterns at once — so the row can never fire. Pinned
     * dead rather than deleted: if the screen ever becomes multi-select, this test says
     * so instead of the row quietly coming alive.
     */
    it('has an unreachable 2+ boxes rule while the pinch test stays single-select', () => {
      const multiSelect = LANE_RULES.DEFINE.find((rule) => rule.id === '2+ boxes')

      expect(multiSelect, 'the 2+ boxes row should still exist').toBeDefined()
      expect(multiSelect!.when({ boxes: ['visceral'], qualifier: 'glp1_naive' })).toBe(false)
    })

    it('escalates glp1_rebound regardless of pattern', () => {
      const result = engineService.resolve(
        answers({ lane: 'DEFINE', discriminator: ['subcutaneous'], qualifier: 'glp1_rebound' }),
      )

      expect(result.base.kind).toBe('blend')
    })
  })

  describe('Lane D — RESTORE', () => {
    /** The deliberate asymmetry: one box that still escalates. */
    it('escalates circadian alone', () => {
      const result = engineService.resolve(
        answers({ lane: 'RESTORE', discriminator: ['circadian'], qualifier: 'rhythm_broken' }),
      )

      expect(result.base.kind).toBe('blend')
    })

    /** Every Lane D row reads "any" for the qualifier — it feeds the handoff only. */
    it('ignores the rhythm qualifier when resolving', () => {
      const qualifiers = ['rhythm_solid', 'rhythm_broken', 'rhythm_shifted', 'rhythm_fine'] as const
      const results = qualifiers.map((qualifier) =>
        engineService.resolve(
          answers({ lane: 'RESTORE', discriminator: ['skin_visible'], qualifier }),
        ),
      )

      for (const result of results) {
        expect(result.base.compounds).toEqual(['GHK-Cu'])
      }
    })
  })

  describe('Lane E — PT141', () => {
    /** R6 — single only, and the qualifier does not change the molecule at launch. */
    it.each(['desire', 'arousal', 'both'] as const)('returns PT-141 for %s', (qualifier) => {
      const result = engineService.resolve(answers({ lane: 'PT141', discriminator: [], qualifier }))

      expect(result.base.compounds).toEqual(['PT-141'])
      expect(result.rulesFired).toContain('R6')
    })

    it('takes no depth read', () => {
      const result = engineService.resolve(
        answers({ lane: 'PT141', discriminator: [], qualifier: 'both', depth: 'depth_layered' }),
      )

      expect(result.layered).toBe(false)
      expect(result.rulesFired).not.toContain('R2')
    })
  })
})

describe('cross-lane secondaries', () => {
  /**
   * The open conflict: the secondary-goals screen is an uncapped multi-select, but §4
   * defines shapes for at most one secondary and the reveal draws one supporting card.
   * We resolve the first by the goal screen's own lane order and carry the rest to the
   * handoff. Raised with the client — capping the screen is the better fix.
   */
  it('resolves at most one supporting protocol when several lanes are flagged', () => {
    const result = engineService.resolve(
      answers({
        lane: 'REPAIR',
        discriminator: ['gut_mucosal'],
        qualifier: 'mechanical',
        secondaryLanes: ['RESTORE', 'PERFORM', 'DEFINE'],
      }),
    )

    expect(result.shape).toBe('SHAPE_4_TWO_SINGLES')
    // PERFORM outranks DEFINE and RESTORE in goal-screen order.
    expect(result.supporting?.compounds).toEqual(['Sermorelin'])
  })

  it('ignores a secondary that repeats the primary lane', () => {
    const result = engineService.resolve(
      answers({
        lane: 'REPAIR',
        discriminator: ['gut_mucosal'],
        qualifier: 'mechanical',
        secondaryLanes: ['REPAIR'],
      }),
    )

    expect(result.shape).toBe('SHAPE_1_SINGLE')
    expect(result.supporting).toBeNull()
  })
})
