import type { SleepHours, StressLevel } from '@/lib/shared/types/quiz.types'

import { describe, expect, it } from 'vitest'

import { engineService } from '@/lib/server/services/engine/engine.service'

import { answers } from '../helpers/answers'

const LOW: SleepHours[] = ['sleep_under_5', 'sleep_5_6', 'sleep_6_7']
const NOT_LOW: SleepHours[] = ['sleep_7_8', 'sleep_8_plus']
const HIGH: StressLevel[] = ['stress_stretched', 'stress_empty']
const NOT_HIGH: StressLevel[] = ['stress_steady', 'stress_managing']

/** §5 — every customer gets exactly one read: a sharp pairing, or the lane fallback. */
describe('read variant selection', () => {
  describe('sharp pairings', () => {
    it('fires body-comp + low sleep for a DEFINE customer under seven hours', () => {
      const result = engineService.resolve(
        answers({
          lane: 'DEFINE',
          discriminator: ['subcutaneous'],
          qualifier: 'glp1_naive',
          sleepHours: 'sleep_5_6',
        }),
      )

      expect(result.readVariant).toBe('sharp_bodycomp_low_sleep')
    })

    it('fires visceral + high stress', () => {
      const result = engineService.resolve(
        answers({
          lane: 'DEFINE',
          discriminator: ['visceral'],
          qualifier: 'glp1_naive',
          stressLevel: 'stress_empty',
        }),
      )

      expect(result.readVariant).toBe('sharp_visceral_high_stress')
    })

    it('fires systemic recovery + low sleep', () => {
      const result = engineService.resolve(
        answers({
          lane: 'REPAIR',
          discriminator: ['systemic_multisite'],
          qualifier: 'inflammatory_active',
          sleepHours: 'sleep_under_5',
        }),
      )

      expect(result.readVariant).toBe('sharp_systemic_recovery_low_sleep')
    })

    it('fires flat energy + high stress', () => {
      const result = engineService.resolve(
        answers({
          lane: 'RESTORE',
          discriminator: ['cellular_energy'],
          qualifier: 'rhythm_broken',
          stressLevel: 'stress_stretched',
        }),
      )

      expect(result.readVariant).toBe('sharp_flat_energy_high_stress')
    })

    it('fires sex drive + high stress', () => {
      const result = engineService.resolve(
        answers({
          lane: 'PT141',
          discriminator: [],
          qualifier: 'desire',
          stressLevel: 'stress_empty',
        }),
      )

      expect(result.readVariant).toBe('sharp_libido_high_stress')
    })

    /**
     * Neither doc defines precedence among the sharp reads, only that exactly one
     * fires. A DEFINE customer who ticks `visceral`, sleeps badly and is running on
     * empty qualifies for two. Document order decides — it is the only ordering either
     * doc asserts.
     */
    it('prefers the earlier read when two sharp pairings both qualify', () => {
      const result = engineService.resolve(
        answers({
          lane: 'DEFINE',
          discriminator: ['visceral'],
          qualifier: 'glp1_naive',
          sleepHours: 'sleep_5_6',
          stressLevel: 'stress_empty',
        }),
      )

      expect(result.readVariant).toBe('sharp_bodycomp_low_sleep')
    })
  })

  describe('thresholds', () => {
    it.each(LOW)('treats %s as under seven hours', (sleepHours) => {
      const result = engineService.resolve(
        answers({
          lane: 'DEFINE',
          discriminator: ['subcutaneous'],
          qualifier: 'glp1_naive',
          sleepHours,
        }),
      )

      expect(result.readVariant).toBe('sharp_bodycomp_low_sleep')
    })

    it.each(NOT_LOW)('treats %s as seven hours or more', (sleepHours) => {
      const result = engineService.resolve(
        answers({
          lane: 'DEFINE',
          discriminator: ['subcutaneous'],
          qualifier: 'glp1_naive',
          sleepHours,
        }),
      )

      expect(result.readVariant).toBe('fallback_define')
    })

    /**
     * "High stress" is never formally defined — only the prose labels. Both
     * `stress_stretched` ("running above what feels sustainable") and `stress_empty`
     * count: excluding stretched would leave that whole cohort with no sharp read for
     * no stated reason. Flagged for the client.
     */
    it.each(HIGH)('treats %s as high stress', (stressLevel) => {
      const result = engineService.resolve(
        answers({ lane: 'PT141', discriminator: [], qualifier: 'desire', stressLevel }),
      )

      expect(result.readVariant).toBe('sharp_libido_high_stress')
    })

    it.each(NOT_HIGH)('treats %s as ordinary stress', (stressLevel) => {
      const result = engineService.resolve(
        answers({ lane: 'PT141', discriminator: [], qualifier: 'desire', stressLevel }),
      )

      expect(result.readVariant).toBe('fallback_pt141')
    })
  })

  describe('lane fallbacks', () => {
    it('falls back to the primary lane when no sharp pairing fires', () => {
      const cases = [
        {
          lane: 'REPAIR',
          discriminator: ['gut_mucosal'],
          qualifier: 'mechanical',
          expected: 'fallback_repair',
        },
        {
          lane: 'PERFORM',
          discriminator: ['recovery_lag'],
          qualifier: 'load_high',
          expected: 'fallback_perform',
        },
        {
          lane: 'DEFINE',
          discriminator: ['subcutaneous'],
          qualifier: 'glp1_naive',
          expected: 'fallback_define',
        },
        {
          lane: 'RESTORE',
          discriminator: ['skin_visible'],
          qualifier: 'rhythm_solid',
          expected: 'fallback_restore',
        },
        { lane: 'PT141', discriminator: [], qualifier: 'desire', expected: 'fallback_pt141' },
      ] as const

      for (const testCase of cases) {
        const result = engineService.resolve(
          answers({
            lane: testCase.lane,
            discriminator: [...testCase.discriminator],
            qualifier: testCase.qualifier,
          }),
        )

        expect(result.readVariant, testCase.lane).toBe(testCase.expected)
      }
    })
  })
})
