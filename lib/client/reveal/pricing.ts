import type { Compound, EngineResult } from '@/lib/shared/types/engine.types'

import { BLEND_COPY, COMPOUND_COPY } from '@/lib/shared/content/compounds.content'

export type PlanMonths = 1 | 3 | 6

export const PLAN_MONTHS: PlanMonths[] = [1, 3, 6]
export const DEFAULT_PLAN_MONTHS: PlanMonths = 3

/** The monthly price of one protocol, or null where the client has not priced it. */
export const priceOf = (id: string): number | null =>
  (BLEND_COPY[id as keyof typeof BLEND_COPY] ?? COMPOUND_COPY[id as Compound])?.monthlyPrice ?? null

export interface StackItem {
  id: string
  monthly: number | null
}

/**
 * The running total for the current stack at the selected plan length.
 *
 * Returns null when any component is unpriced, so the footer can say "Price pending"
 * rather than quietly under-reporting a total.
 *
 * The plan-length model is genuinely unknown: the frames show $289/month for a 3-month
 * plan on a stack whose parts are $225 and $185, and $289 is not derivable from those by
 * any discount we can infer — it is not the sum, a percentage of it, or either part. So
 * `months` is accepted and deliberately not applied yet. When the client supplies the
 * model, it goes here and nowhere else.
 */
export const runningTotal = (items: StackItem[], _months: PlanMonths): number | null => {
  if (items.length === 0) return null
  if (items.some((item) => item.monthly === null)) return null

  return items.reduce((sum, item) => sum + (item.monthly ?? 0), 0)
}

/** The protocols currently in the stack, in display order. */
export const stackOf = (
  result: EngineResult,
  options: { adjunctRemoved?: boolean; pairingAdded?: number | null } = {},
): StackItem[] => {
  const items: StackItem[] = [
    { id: String(result.base.id), monthly: priceOf(String(result.base.id)) },
  ]

  if (result.supporting && !options.adjunctRemoved) {
    items.push({ id: String(result.supporting.id), monthly: priceOf(String(result.supporting.id)) })
  }

  if (options.pairingAdded != null) {
    items.push({ id: 'pairs-well-with', monthly: options.pairingAdded })
  }

  return items
}

export const formatPrice = (value: number | null): string | null =>
  value === null ? null : `$${value.toFixed(2)}`
