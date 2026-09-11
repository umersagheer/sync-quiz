'use client'

import type { ScreenCopy } from '@/lib/shared/types/content.types'

import { BackButton } from './BackButton'
import { PrimaryButton } from './PrimaryButton'

/**
 * S3 — the welcome interstitial.
 *
 * A centred composition rather than the left-aligned question layout: concentric rings
 * around a lit core at roughly the middle of the screen, then the greeting and its
 * sub-line sitting low, then the CTA. The heading and the sub-line are two texts in the
 * frame, set in different faces and weights — the copy layer runs them together as one
 * sentence, so `screens.content.ts` splits it and records why.
 *
 * The frame gives this screen no back control. It gets one anyway: the only thing behind
 * it is the name field, and a customer who mistyped their name has nowhere to go.
 *
 * The ground is the question screens' `quiz-ground`, not the welcome screen's warmer
 * `quiz-ground-molten`. S1 is the only frame in the flow on the warmer texture — every
 * other frame, this one included, shares one image and one dimming gradient.
 */
export function InterstitialScreen({
  copy,
  heading,
  onContinue,
  onBack,
}: {
  copy: ScreenCopy
  heading: string
  onContinue: () => void
  onBack?: () => void
}) {
  return (
    <div className="quiz-ground relative h-dvh overflow-hidden">
      {/*
        Decorative — three rings and a core, concentric, centred on the screen rather
        than on the copy. Absolute because it genuinely sits behind the layout.
      */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-[45%] left-1/2 grid -translate-x-1/2 -translate-y-1/2 place-items-center"
      >
        <span className="col-start-1 row-start-1 size-[280px] rounded-full border border-white/[0.08]" />
        <span className="col-start-1 row-start-1 size-[200px] rounded-full border border-white/[0.14]" />
        <span className="col-start-1 row-start-1 size-[120px] rounded-full border border-white/[0.22]" />
        <span className="bg-foreground shadow-motif col-start-1 row-start-1 size-14 rounded-full" />
      </div>

      <div className="relative mx-auto grid h-full w-full max-w-[430px] grid-rows-[auto_minmax(0,1fr)_auto] px-[18px] pt-[14px] pb-[calc(16px+env(safe-area-inset-bottom))]">
        <div>{onBack ? <BackButton onClick={onBack} /> : null}</div>

        {/*
          The copy sits low, not centred: in the frame its baseline is at roughly 72% of
          the screen. `dvh` rather than a percentage — percentage padding resolves against
          the container's *width*, which would collapse the gap on a narrow phone.
        */}
        <div className="flex flex-col justify-end gap-2 pb-[16dvh] text-center">
          <h1 className="text-display-lg text-foreground font-bold">{heading}</h1>
          {copy.body?.map((line) => (
            <p key={line} className="text-lead text-foreground-secondary">
              {line}
            </p>
          ))}
        </div>

        <PrimaryButton onClick={onContinue}>{copy.cta}</PrimaryButton>
      </div>
    </div>
  )
}
