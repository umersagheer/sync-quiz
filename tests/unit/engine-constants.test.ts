import type { Lane } from '@/lib/shared/types/quiz.types'
import type { BlendId, Compound } from '@/lib/shared/types/engine.types'

import { describe, expect, it } from 'vitest'

import {
  BLEND_COMPOUNDS,
  LANE_BLEND,
  LANE_DEFAULT_SINGLE,
  LANE_FALLBACK_READ,
  PAIRS_WELL_WITH,
  R7_SUBSTITUTIONS,
} from '@/lib/shared/constants/engine.constants'
import { FORMULARY } from '@/lib/shared/constants/formulary.constants'

const LANES: Lane[] = ['REPAIR', 'PERFORM', 'DEFINE', 'RESTORE', 'PT141']
const BLENDS: BlendId[] = ['REPAIR', 'PERFORM', 'DEFINE', 'RESTORE']

const isInFormulary = (compound: Compound) => Object.hasOwn(FORMULARY, compound)

/**
 * The engine tables are exhaustive `Record<Union, T>` lookups, so a missing lane
 * is already a compile error. What the type system cannot see is that the tables
 * reference each other *by value*: a compound named as a blend member or an R7
 * substitute is just a string, and if it fell out of the formulary it would
 * resolve to `undefined` at runtime and reach a customer as a blank line on the
 * reveal. These assertions close that gap.
 */
describe('engine constants', () => {
  it('covers every lane', () => {
    for (const lane of LANES) {
      expect(LANE_FALLBACK_READ[lane], `fallback read for ${lane}`).toBeDefined()
      expect(LANE_DEFAULT_SINGLE[lane], `R8 default for ${lane}`).toBeDefined()
      expect(LANE_BLEND, `blend mapping for ${lane}`).toHaveProperty(lane)
    }
  })

  it('only names compounds that exist in the formulary', () => {
    for (const blend of BLENDS) {
      for (const compound of BLEND_COMPOUNDS[blend]) {
        expect(isInFormulary(compound), `${blend} blend names ${compound}`).toBe(true)
      }
    }

    for (const lane of LANES) {
      const compound = LANE_DEFAULT_SINGLE[lane]

      expect(isInFormulary(compound), `R8 default for ${lane} is ${compound}`).toBe(true)
    }

    for (const blend of BLENDS) {
      const compound = PAIRS_WELL_WITH[blend]

      expect(isInFormulary(compound), `${blend} pairs-well-with ${compound}`).toBe(true)
    }

    for (const blend of BLENDS) {
      for (const [collides, substitute] of Object.entries(R7_SUBSTITUTIONS[blend])) {
        expect(isInFormulary(collides as Compound), `R7 ${blend} collision ${collides}`).toBe(true)
        expect(isInFormulary(substitute as Compound), `R7 ${blend} substitute ${substitute}`).toBe(
          true,
        )
      }
    }
  })

  /**
   * R7 fires when an adjunct molecule is already inside the primary blend. There
   * are exactly two routes an adjunct can arrive by, and under the current
   * tables neither can produce a collision:
   *
   *   - R8 cross-lane default — a secondary lane is by definition not the
   *     primary lane, so the four §2A rows all describe pairings R4 prevents.
   *   - pairs-well-with — none of the four is a member of its own blend.
   *
   * So R7 is a guard, not a live rule. That is worth pinning rather than
   * assuming: change an R8 default or a blend composition and this test reports
   * it, instead of a duplicate molecule quietly reaching a customer.
   */
  describe('R7 dedup', () => {
    it('is unreachable via an R8 cross-lane default', () => {
      for (const primary of BLENDS) {
        for (const secondary of LANES) {
          if (secondary === primary) continue

          expect(
            BLEND_COMPOUNDS[primary],
            `${secondary} default ${LANE_DEFAULT_SINGLE[secondary]} collides with the ${primary} blend`,
          ).not.toContain(LANE_DEFAULT_SINGLE[secondary])
        }
      }
    })

    it('is unreachable via pairs-well-with', () => {
      for (const blend of BLENDS) {
        expect(
          BLEND_COMPOUNDS[blend],
          `${blend} pairs-well-with ${PAIRS_WELL_WITH[blend]}, which is in its own blend`,
        ).not.toContain(PAIRS_WELL_WITH[blend])
      }
    })

    /**
     * Known defect in Backend Mapping §2A, pinned deliberately.
     *
     * The REPAIR row substitutes BPC-157 → TB-500, but TB-500 is itself a REPAIR
     * blend component, so applying the substitution would re-trigger the rule it
     * resolves. The doc justifies it on mechanism ("different mechanism from
     * BPC-157") while R7's trigger is molecule presence — the two do not agree.
     * PERFORM, DEFINE and RESTORE all substitute out of their blend correctly.
     *
     * It is unreachable (see above), which is why it has survived sign-off. Raised
     * with the client; if §2A is corrected, this test fails and should be deleted
     * rather than updated.
     */
    it('has one substitution that would not actually dedup — REPAIR, per §2A as written', () => {
      const substitute = R7_SUBSTITUTIONS.REPAIR['BPC-157']

      expect(substitute).toBe('TB-500')
      expect(BLEND_COMPOUNDS.REPAIR).toContain(substitute)

      const clean = BLENDS.filter((blend) => blend !== 'REPAIR')

      for (const blend of clean) {
        for (const value of Object.values(R7_SUBSTITUTIONS[blend])) {
          expect(BLEND_COMPOUNDS[blend], `${blend} substitute ${value}`).not.toContain(value)
        }
      }
    })
  })
})
