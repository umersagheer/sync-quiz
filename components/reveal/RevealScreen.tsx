'use client'

import type { PlanMonths } from '@/lib/client/reveal/pricing'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'

import {
  DEFAULT_PLAN_MONTHS,
  formatPrice,
  runningTotal,
  stackOf,
} from '@/lib/client/reveal/pricing'
import { useQuizResult } from '@/lib/client/queries/quiz.query'
import { useQuizStore } from '@/lib/client/stores/quiz.store'
import { BLEND_COPY, COMPOUND_COPY } from '@/lib/shared/content/compounds.content'
import { PAIRS_WELL_WITH_CARD, REVEAL_CHROME } from '@/lib/shared/content/reveal.content'

import { CondensedHeader } from './CondensedHeader'
import { ProtocolCard } from './ProtocolCard'
import { ReadBand } from './ReadBand'
import {
  PairsWellWithCard,
  PlanSelector,
  RevealControls,
  SectionLabel,
  TrustBlock,
} from './RevealChrome'
import { StickyFooter } from './StickyFooter'

const displayName = (id: string) =>
  (BLEND_COPY[id as keyof typeof BLEND_COPY] ?? COMPOUND_COPY[id as never])?.displayName ?? id

/**
 * Screen 10 — the reveal.
 *
 * One shape switch drives the whole page: Shape 1 gets the trust block, Shape 2 the
 * pairs-well-with card, Shapes 3 and 4 a supporting protocol. The engine decides which;
 * this component only renders it.
 */
export function RevealScreen() {
  const router = useRouter()
  const hydrated = useQuizStore((state) => state.hydrated)
  const answers = useQuizStore((state) => state.answers)
  const completedAnswers = useQuizStore((state) => state.completedAnswers)
  const reset = useQuizStore((state) => state.reset)

  const [months, setMonths] = useState<PlanMonths>(DEFAULT_PLAN_MONTHS)
  const [adjunctRemoved, setAdjunctRemoved] = useState(false)
  const [pairingAdded, setPairingAdded] = useState(false)

  const complete = hydrated ? completedAnswers() : null
  const { data: result, isPending, error } = useQuizResult(complete)

  useEffect(() => {
    if (hydrated && !complete) router.replace('/quiz/welcome')
  }, [hydrated, complete, router])

  const stack = useMemo(
    () =>
      result
        ? stackOf(result, {
            adjunctRemoved,
            pairingAdded: pairingAdded ? PAIRS_WELL_WITH_CARD.price : null,
          })
        : [],
    [result, adjunctRemoved, pairingAdded],
  )

  const total = formatPrice(runningTotal(stack, months))
  const stackName = stack.map((item) => displayName(item.id)).join(' + ')

  if (!hydrated || !complete) return null

  if (error) {
    return (
      <main className="bg-reveal-page text-card-foreground mx-auto flex min-h-dvh w-full max-w-[430px] flex-col justify-center gap-4 px-5">
        <h1 className="font-display text-display-sm text-card-foreground font-medium">
          We couldn&apos;t build your protocol
        </h1>
        <p className="text-card-muted-foreground font-display text-sm">{error.message}</p>
      </main>
    )
  }

  if (isPending || !result) {
    return (
      <main className="bg-reveal-page flex min-h-dvh items-center justify-center">
        <p role="status" className="text-card-muted-foreground font-display text-sm">
          Building your protocol…
        </p>
      </main>
    )
  }

  const startOver = () => {
    reset()
    router.push('/quiz/welcome')
  }

  return (
    <div className="bg-reveal-page min-h-dvh">
      <CondensedHeader stackName={stackName} onDismiss={startOver} />

      <div className="mx-auto w-full max-w-[430px] pb-[168px]">
        <ReadBand
          firstName={answers.firstName ?? ''}
          lane={result.lane}
          readVariant={result.readVariant}
          answerCount={11}
          shape={result.shape}
          onDismiss={startOver}
        />

        {/*
          The frames' vertical rhythm, which is not a single gap: the first label sits
          10px under the band, a card 9px under its label, and the block that follows the
          base protocol a deliberate 76px below it — that gap is the page's one real
          breath, and the same in all three shapes. The plan selector then comes ~48px
          after whatever preceded it.
        */}
        <div className="flex flex-col px-5 pt-[10px]">
          <section className="flex flex-col gap-[9px]">
            <SectionLabel>{REVEAL_CHROME.baseLabel}</SectionLabel>
            <ProtocolCard
              protocol={result.base}
              role="base"
              lane={result.lane}
              shape={result.shape}
            />
          </section>

          {result.supporting && !adjunctRemoved ? (
            <section className="mt-[76px] flex flex-col gap-[9px]">
              <SectionLabel>{REVEAL_CHROME.supportingLabel}</SectionLabel>
              <ProtocolCard
                protocol={result.supporting}
                role="adjunct"
                lane={result.lane}
                shape={result.shape}
              />
            </section>
          ) : null}

          {result.shape === 'SHAPE_2_SOLO_BLEND' ? (
            <section className="mt-[76px] flex flex-col gap-[9px]">
              <SectionLabel>{REVEAL_CHROME.pairsLabel}</SectionLabel>
              <PairsWellWithCard added={pairingAdded} onAdd={() => setPairingAdded(true)} />
            </section>
          ) : null}

          {result.shape === 'SHAPE_1_SINGLE' ? <TrustBlock className="mt-[76px]" /> : null}

          <PlanSelector months={months} onChange={setMonths} total={total} className="mt-12" />

          <RevealControls
            canRemoveAdjunct={Boolean(result.supporting)}
            adjunctRemoved={adjunctRemoved}
            onRemoveAdjunct={() => setAdjunctRemoved((was) => !was)}
            onStartOver={startOver}
            className="mt-6"
          />
        </div>
      </div>

      <StickyFooter months={months} total={total} />
    </div>
  )
}
