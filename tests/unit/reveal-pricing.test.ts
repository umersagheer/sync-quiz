import type { EngineResult } from '@/lib/shared/types/engine.types'

import { describe, expect, it } from 'vitest'

import { formatPrice, priceOf, runningTotal, stackOf } from '@/lib/client/reveal/pricing'

const shape34: EngineResult = {
  shape: 'SHAPE_4_TWO_SINGLES',
  template: 'standard',
  lane: 'REPAIR',
  layered: false,
  base: { kind: 'single', id: 'BPC-157', compounds: ['BPC-157'] },
  supporting: { kind: 'single', id: 'TB-500', compounds: ['TB-500'] },
  pairsWellWith: null,
  readVariant: 'fallback_repair',
  rulesFired: ['R1'],
}

const unpriced: EngineResult = {
  ...shape34,
  base: { kind: 'single', id: 'Sermorelin', compounds: ['Sermorelin'] },
  supporting: null,
}

describe('reveal pricing', () => {
  it('prices what the frames price', () => {
    expect(priceOf('BPC-157')).toBe(225)
    expect(priceOf('TB-500')).toBe(185)
    expect(priceOf('REPAIR')).toBe(340)
  })

  it('has no price for compounds the client has not priced', () => {
    expect(priceOf('Sermorelin')).toBeNull()
    expect(priceOf('NAD+')).toBeNull()
  })

  it('totals the assembled stack', () => {
    expect(runningTotal(stackOf(shape34), 3)).toBe(410)
  })

  it('drops the adjunct from the total when it is removed', () => {
    expect(runningTotal(stackOf(shape34, { adjunctRemoved: true }), 3)).toBe(225)
  })

  it('adds the pairs-well-with price when it is added', () => {
    const stack = stackOf(shape34, { adjunctRemoved: true, pairingAdded: 65 })

    expect(runningTotal(stack, 3)).toBe(290)
  })

  /**
   * The point of returning null rather than a partial sum: a footer that quietly
   * under-reports a total is worse than one that admits it does not know.
   */
  it('returns null when any component is unpriced', () => {
    expect(runningTotal(stackOf(unpriced), 3)).toBeNull()
    expect(formatPrice(null)).toBeNull()
  })

  it('formats to two decimals', () => {
    expect(formatPrice(410)).toBe('$410.00')
  })

  /**
   * The plan-length model is unknown — the frames show $289/month for a 3-month plan on
   * a $225 + $185 stack, which is not the sum, a percentage of it, or either part. Until
   * the client supplies it, plan length deliberately does not change the total, and this
   * test records that as a known gap rather than an accident.
   */
  it('does not yet vary by plan length — model still outstanding', () => {
    const stack = stackOf(shape34)

    expect(runningTotal(stack, 1)).toBe(runningTotal(stack, 3))
    expect(runningTotal(stack, 6)).toBe(runningTotal(stack, 3))
  })
})
