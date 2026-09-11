'use client'

import type { ScreenCopy } from '@/lib/shared/types/content.types'

import { useQuizStore } from '@/lib/client/stores/quiz.store'

import { PrimaryButton } from './PrimaryButton'
import { SyncLogo } from './icons/SyncLogo'

/**
 * S1 — the opener, which is laid out differently from every other screen.
 *
 * Centred rather than left-aligned, the wordmark at the top, a motif of concentric rings
 * behind the copy, and a caption under the CTA. The body is set in Satoshi here (not the
 * UI face) — the warm register the copy layer describes is carried by the type as much
 * as the words.
 *
 * Same three rows as `ScreenShell`: this screen carries the longest copy in the quiz, and
 * on a short viewport it would otherwise push Start below the fold.
 */
export function WelcomeScreen({ copy, onStart }: { copy: ScreenCopy; onStart: () => void }) {
  const completedAnswers = useQuizStore((state) => state.completedAnswers)
  const reset = useQuizStore((state) => state.reset)

  /**
   * Starting from welcome after a finished run begins a new one.
   *
   * Only a *completed* quiz is cleared. An unfinished one is left alone, because the
   * guard lets someone step back to this screen mid-quiz and wiping their answers there
   * would be the opposite of helpful.
   */
  const start = () => {
    if (completedAnswers()) reset()
    onStart()
  }

  return (
    <div className="quiz-ground-molten relative h-dvh overflow-hidden">
      {/* Motif — three concentric rings behind the copy. Decorative. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-[34%] left-1/2 grid -translate-x-1/2 -translate-y-1/2 place-items-center"
      >
        <span className="col-start-1 row-start-1 size-[310px] rounded-full border border-white/[0.06]" />
        <span className="col-start-1 row-start-1 size-[230px] rounded-full border border-white/10" />
        <span className="col-start-1 row-start-1 size-[150px] rounded-full border border-white/[0.16]" />
      </div>

      <div className="relative mx-auto grid h-full w-full max-w-[430px] grid-rows-[auto_minmax(0,1fr)_auto] px-[18px] pt-[18px] pb-[calc(18px+env(safe-area-inset-bottom))]">
        <SyncLogo className="text-foreground mx-auto" />

        <div className="overflow-y-auto overscroll-contain">
          <div className="flex min-h-full flex-col justify-center gap-4 py-6 text-center">
            <h1 className="font-display text-display text-foreground font-medium">
              {copy.heading}
            </h1>
            {copy.body?.map((line) => (
              <p key={line} className="font-display text-body text-foreground-secondary">
                {line}
              </p>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <PrimaryButton onClick={start}>{copy.cta}</PrimaryButton>
          {/*
            Design-only line — it is not in the copy layer. Logged in docs/COPY_BACKLOG.md.
          */}
          <p className="text-caption text-foreground-muted text-center">
            About two minutes · No card required
          </p>
        </div>
      </div>
    </div>
  )
}
