import 'server-only'

import type {
  DiscriminatorSignal,
  Lane,
  SleepHours,
  StressLevel,
} from '@/lib/shared/types/quiz.types'
import type { ReadVariantId } from '@/lib/shared/types/engine.types'

import { HIGH_STRESS, LANE_FALLBACK_READ, LOW_SLEEP } from '@/lib/server/constants/engine.constants'

export interface ReadContext {
  lane: Lane
  boxes: DiscriminatorSignal[]
  sleepHours: SleepHours
  stressLevel: StressLevel
}

const lowSleep = (context: ReadContext) =>
  (LOW_SLEEP as readonly string[]).includes(context.sleepHours)

const highStress = (context: ReadContext) =>
  (HIGH_STRESS as readonly string[]).includes(context.stressLevel)

const has = (context: ReadContext, signal: DiscriminatorSignal) => context.boxes.includes(signal)

interface SharpRead {
  id: ReadVariantId
  when: (context: ReadContext) => boolean
}

/**
 * §5 — the five sharp pairings, in document order.
 *
 * Neither doc defines precedence *among* the sharp reads, only that they are all
 * evaluated before any fallback and that "every customer gets exactly one read". A
 * DEFINE customer who ticks `visceral`, sleeps under seven hours and is running on empty
 * qualifies for two. Document order is the tiebreak: both the Backend §5 table and the
 * Copy Layer list them in this sequence, so it is the only ordering either doc asserts.
 *
 * Two triggers are named loosely enough to be ambiguous, and both resolve to the
 * narrower reading here:
 *
 *   - "Systemic recovery" -> `systemic_multisite` (Lane A), not Lane B's
 *     `multidomain_decline`, which is a performance decline rather than a repair signal.
 *   - "Flat energy" -> `cellular_energy` (Lane D), not Lane C's `metabolic_slowdown`.
 *
 * Reading either one wider would only take a customer away from a lane fallback that
 * already fits them, so the narrow reading is the safer default. Flagged for the client.
 */
const SHARP_READS: SharpRead[] = [
  {
    id: 'sharp_bodycomp_low_sleep',
    when: (c) => c.lane === 'DEFINE' && lowSleep(c),
  },
  {
    id: 'sharp_visceral_high_stress',
    when: (c) => has(c, 'visceral') && highStress(c),
  },
  {
    id: 'sharp_systemic_recovery_low_sleep',
    when: (c) => has(c, 'systemic_multisite') && lowSleep(c),
  },
  {
    id: 'sharp_flat_energy_high_stress',
    when: (c) => has(c, 'cellular_energy') && highStress(c),
  },
  {
    id: 'sharp_libido_high_stress',
    when: (c) => c.lane === 'PT141' && highStress(c),
  },
]

/** Sharp pairings first; if none fire, the primary lane's fallback. Always exactly one. */
export const selectReadVariant = (context: ReadContext): ReadVariantId =>
  SHARP_READS.find((read) => read.when(context))?.id ?? LANE_FALLBACK_READ[context.lane]
