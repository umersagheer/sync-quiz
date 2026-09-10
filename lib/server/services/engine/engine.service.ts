import 'server-only'

import type { QuizAnswers } from '@/lib/shared/types/quiz.types'
import type { EngineResult, RuleId } from '@/lib/shared/types/engine.types'

import { assemble, selectSecondaryLane, toProtocol } from './assembly'
import { resolveLane } from './lane-resolution'
import { selectReadVariant } from './read-variant'

/**
 * The quiz engine.
 *
 * Turns a completed quiz into one definite product recommendation, per Backend Mapping
 * v2.1: R1 sets the lane, R2 reads depth, §3 resolves the lane to a base, §4 assembles
 * the base with any cross-lane secondary into one of four shapes, and §5 picks the read.
 *
 * This module and everything it imports are server-only by construction. The mapping
 * from a customer's answers to a named compound is a promotional claim about unapproved
 * 503A drugs, so it must never be bundled into the browser — `import 'server-only'`
 * turns that from a convention into a build failure.
 */
export const engineService = {
  resolve: (answers: QuizAnswers): EngineResult => {
    // R1 — the goal screen sets the lane, and the lane sets the base.
    const { lane } = answers
    const rulesFired: RuleId[] = ['R1']

    // R2 — depth reads from the depth answer and the discriminator box count together.
    // R6 exempts the hormonal lane: it returns a single regardless, so there is no
    // depth read to take.
    const isHormonal = lane === 'PT141'
    const layered =
      !isHormonal && (answers.depth === 'depth_layered' || answers.discriminator.length >= 2)

    rulesFired.push(isHormonal ? 'R6' : 'R2')

    const { outcome } = resolveLane(lane, {
      boxes: answers.discriminator,
      qualifier: answers.qualifier,
    })

    const base = toProtocol(lane, outcome)
    const secondaryLane = selectSecondaryLane(answers.secondaryLanes, lane)

    const assembly = assemble({ base, secondaryLane, rulesFired })

    const readVariant = selectReadVariant({
      lane,
      boxes: answers.discriminator,
      sleepHours: answers.sleepHours,
      stressLevel: answers.stressLevel,
    })

    return {
      shape: assembly.shape,
      template: assembly.template,
      lane,
      layered,
      base: assembly.base,
      supporting: assembly.supporting,
      pairsWellWith: assembly.pairsWellWith,
      readVariant,
      rulesFired: assembly.rulesFired,
    }
  },
}
