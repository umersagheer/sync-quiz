'use client'

import type { Lane } from '@/lib/shared/types/quiz.types'
import type { StepId } from '@/lib/client/quiz-flow/steps'

import { questionProgress } from '@/lib/client/quiz-flow/steps'
import { sectionLabel } from '@/lib/client/quiz-flow/sections'
import { cn } from '@/lib/shared/utils/cn'

import { ChevronLeftIcon } from './icons/ChromeIcons'

interface ProgressHeaderProps {
  step: StepId
  lane: Lane | undefined
  onBack?: () => void
}

/**
 * Back control, a glass pill naming the section, and the segmented progress bar.
 *
 * The counter reflects questions rather than screens — see `questionProgress`. Screens
 * that ask nothing show the pill without a counter, or no header at all.
 */
export function ProgressHeader({ step, lane, onBack }: ProgressHeaderProps) {
  const label = sectionLabel(step, lane)
  const progress = questionProgress(step, lane)

  if (!label) return null

  return (
    <div className="flex flex-col gap-[14px]">
      <div className="flex items-center gap-3">
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            aria-label="Go back"
            className="glass-quiet text-foreground focus-visible:ring-foreground/70 focus-visible:ring-offset-ground-top grid size-11 shrink-0 place-items-center rounded-full focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
          >
            <ChevronLeftIcon />
          </button>
        ) : (
          <span className="size-11 shrink-0" aria-hidden="true" />
        )}

        <p className="glass-quiet rounded-pill text-title text-foreground mx-auto flex items-center gap-2 px-[18px] py-2.5">
          <span className="font-[590]">{label}</span>
          {progress ? (
            <span className="text-foreground-secondary tabular-nums">
              {progress.current} of {progress.total}
            </span>
          ) : null}
        </p>

        <span className="size-11 shrink-0" aria-hidden="true" />
      </div>

      {progress ? (
        <div
          role="progressbar"
          aria-valuenow={progress.current}
          aria-valuemin={1}
          aria-valuemax={progress.total}
          aria-label={`Question ${progress.current} of ${progress.total}`}
          className="flex items-center gap-1.5"
        >
          {Array.from({ length: progress.total }, (_, index) => (
            <span
              key={index}
              className={cn(
                'rounded-pill h-[3px] flex-1',
                index < progress.current ? 'bg-foreground' : 'bg-foreground/25',
              )}
            />
          ))}
        </div>
      ) : null}
    </div>
  )
}
