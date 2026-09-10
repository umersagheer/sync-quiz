'use client'

import type { Protocol } from '@/lib/shared/types/engine.types'

import { useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { useQuizResult } from '@/lib/client/queries/quiz.query'
import { useQuizStore } from '@/lib/client/stores/quiz.store'
import { BLEND_COPY, COMPOUND_COPY } from '@/lib/shared/content/compounds.content'
import {
  CARD_LABELS,
  DAY_90_LINE,
  HANDOFF_DISCLAIMER,
  PLAN_SELECTOR,
  READ_INTRO,
  READ_VARIANTS,
  RECOMMEND_LESS,
  STICKY_FOOTER_CTA,
} from '@/lib/shared/content/reveal.content'

const withName = (text: string, name: string | undefined) =>
  text.replace('[name]', name?.trim() || 'there')

const copyFor = (protocol: Protocol) =>
  protocol.kind === 'blend'
    ? BLEND_COPY[protocol.id as keyof typeof BLEND_COPY]
    : COMPOUND_COPY[protocol.compounds[0]]

/**
 * The reveal — Screen 10, structural only.
 *
 * Phase 5 builds this properly against the Figma frames: the plan selector, running
 * total, sticky footer and swap/remove controls. What exists here is enough to prove the
 * whole chain works end to end — real answers through the real engine to real copy.
 *
 * Where the client has not written card copy yet, that is rendered as an explicit
 * pending state rather than a blank. Those chips and paragraphs are therapeutic claims
 * about compounded molecules; showing invented ones would be worse than showing none.
 */
function ProtocolCard({ protocol, label }: { protocol: Protocol; label: string }) {
  const copy = copyFor(protocol)
  const name = copy?.displayName ?? protocol.compounds.join(' + ')

  return (
    <section className="bg-card text-card-foreground rounded-card flex flex-col gap-4 p-5">
      <p className="text-xs tracking-[0.18em] uppercase opacity-60">{label}</p>
      <h2 className="text-xl font-semibold">{name}</h2>

      {copy?.card.status === 'written' ? (
        <>
          <ul className="grid grid-cols-2 gap-2">
            {copy.card.chips.map((chip) => (
              <li key={chip} className="rounded-control bg-black/5 px-3 py-2 text-xs">
                {chip}
              </li>
            ))}
          </ul>
          <p className="text-sm">{copy.card.paragraph}</p>
        </>
      ) : (
        <p className="rounded-control border border-dashed border-current/30 p-3 text-xs opacity-70">
          Copy pending from the client — {copy?.card.awaiting ?? 'card copy'}. See
          docs/COPY_BACKLOG.md.
        </p>
      )}

      <p className="text-sm font-medium">
        {copy?.monthlyPrice ? `From $${copy.monthlyPrice}/month` : 'Price pending'}
      </p>
    </section>
  )
}

export function Reveal() {
  const router = useRouter()
  const hydrated = useQuizStore((state) => state.hydrated)
  const firstName = useQuizStore((state) => state.answers.firstName)
  const completedAnswers = useQuizStore((state) => state.completedAnswers)
  const reset = useQuizStore((state) => state.reset)

  const answers = hydrated ? completedAnswers() : null
  const { data: result, isPending, error } = useQuizResult(answers)

  useEffect(() => {
    if (hydrated && !answers) router.replace('/quiz/welcome')
  }, [hydrated, answers, router])

  if (!hydrated || !answers) return null

  if (error) {
    return (
      <main className="mx-auto flex w-full max-w-[430px] flex-col gap-4 px-6 py-10">
        <h1 className="text-xl font-semibold">We couldn&apos;t build your protocol</h1>
        <p className="text-muted-foreground text-sm">{error.message}</p>
      </main>
    )
  }

  if (isPending || !result) {
    return (
      <main className="mx-auto w-full max-w-[430px] px-6 py-10">
        <p role="status" className="text-muted-foreground text-sm">
          Building your protocol…
        </p>
      </main>
    )
  }

  const recommendLess = result.template === 'recommend_less'

  return (
    <main className="mx-auto flex w-full max-w-[430px] flex-col gap-8 px-6 py-10 pb-32">
      {/* 5.1 — the read. Warm register, opens the page. */}
      <header className="flex flex-col gap-3">
        <p className="text-muted-foreground text-xs tracking-[0.18em] uppercase">
          {withName(READ_INTRO, firstName)}
        </p>
        <p className="text-base leading-relaxed">{READ_VARIANTS[result.readVariant]}</p>
      </header>

      {recommendLess ? (
        <section className="flex flex-col gap-3">
          <h1 className="text-2xl font-semibold text-balance">
            {withName(RECOMMEND_LESS.heading, firstName)}
          </h1>
          <p className="text-muted-foreground text-sm">{RECOMMEND_LESS.body}</p>
        </section>
      ) : null}

      <ProtocolCard protocol={result.base} label={CARD_LABELS.base} />

      {result.supporting ? (
        <ProtocolCard protocol={result.supporting} label={CARD_LABELS.supporting} />
      ) : null}

      {result.pairsWellWith ? (
        <ProtocolCard
          protocol={{ kind: 'single', id: result.pairsWellWith, compounds: [result.pairsWellWith] }}
          label={CARD_LABELS.pairsWellWith}
        />
      ) : null}

      {/* 5.4 — plan selector. Phase 5 makes this interactive with a running total. */}
      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">{PLAN_SELECTOR.heading}</h2>
        <p className="text-muted-foreground text-xs">{PLAN_SELECTOR.clinicalLine}</p>
        <p className="text-muted-foreground text-xs">{DAY_90_LINE}</p>
      </section>

      <p className="text-muted-foreground text-xs">{HANDOFF_DISCLAIMER}</p>

      <div className="flex flex-col gap-3">
        <Link
          href="/assessment"
          className="bg-primary text-primary-foreground rounded-control focus-visible:ring-ring focus-visible:ring-offset-background px-6 py-4 text-center text-sm font-semibold focus-visible:ring-2 focus-visible:ring-offset-2"
        >
          {STICKY_FOOTER_CTA}
        </Link>
        <button
          type="button"
          onClick={() => {
            reset()
            router.push('/quiz/welcome')
          }}
          className="text-muted-foreground rounded-control focus-visible:ring-ring py-2 text-xs focus-visible:ring-2"
        >
          Start over
        </button>
      </div>
    </main>
  )
}
