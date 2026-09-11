'use client'

import type { ReactNode } from 'react'
import type { Register } from '@/lib/shared/types/content.types'

import { useCallback, useEffect, useRef, useState } from 'react'

import { cn } from '@/lib/shared/utils/cn'

/** The frames optically size the heading down as it gets longer: 32 / 30 / 28. */
type HeadingSize = 'lg' | 'md' | 'sm'

const HEADING_SIZE: Record<HeadingSize, string> = {
  lg: 'text-display',
  md: 'text-display-md',
  sm: 'text-display-sm',
}

/** The padded, centred column every row shares. */
const COLUMN = 'mx-auto w-full max-w-[430px] px-[18px]'

interface ScreenShellProps {
  heading?: string
  headingSize?: HeadingSize
  body?: string[]
  register?: Register
  /** The welcome screen sits on the warmer "molten" ground. */
  ground?: 'field' | 'molten'
  header?: ReactNode
  children?: ReactNode
  footer?: ReactNode
  /**
   * A bottom-anchored, full-bleed sheet. The education screen is drawn this way — it
   * reaches both edges and the bottom of the viewport, so it cannot sit inside the
   * padded column the question screens use.
   */
  sheet?: ReactNode
}

/**
 * The frame every quiz screen sits in: a fixed header, a scrolling middle, a fixed CTA.
 *
 * The frames are drawn at 402x874, where every screen fits without scrolling. Real
 * devices are shorter — the Branch A discriminator runs 766px from the back control to
 * the bottom of the CTA, against roughly 553px of viewport on an iPhone SE — so the
 * options would push Continue below the fold and scroll the progress bar away with it.
 * Both are exactly what a customer needs to see on an eleven-question quiz.
 *
 * Three grid rows rather than two `position: fixed` bars, for two reasons. The keyboard:
 * a fixed bottom bar on iOS Safari hides behind or jitters against the keyboard, because
 * the visual viewport shrinks while the layout viewport does not, and three screens here
 * take text input. And the bookkeeping: fixed bars mean hand-maintaining padding equal to
 * their heights on every screen, which drifts.
 *
 * `minmax(0, 1fr)` rather than `1fr` is load-bearing — a bare `1fr` row takes
 * `min-height: auto`, so tall content grows the grid past the viewport and pushes the
 * footer back off-screen, which is the silent way this whole arrangement fails.
 */
export function ScreenShell({
  heading,
  headingSize = 'lg',
  body,
  register,
  ground = 'field',
  header,
  children,
  footer,
  sheet,
}: ScreenShellProps) {
  const scroller = useRef<HTMLDivElement>(null)
  const [clipped, setClipped] = useState(false)

  /**
   * Whether content continues below the fold.
   *
   * The frames carry no "more below" cue because nothing in them overflows, so the fade
   * is ours. It has to be measured rather than styled: CSS cannot ask whether an element
   * scrolls, and a fade applied unconditionally would blur the last option on every
   * screen that fits.
   */
  const measure = useCallback(() => {
    const element = scroller.current

    if (!element) return

    const remaining = element.scrollHeight - element.clientHeight - element.scrollTop

    setClipped(element.scrollHeight - element.clientHeight > 1 && remaining > 2)
  }, [])

  useEffect(() => {
    const element = scroller.current

    if (!element) return

    measure()

    // The viewport and the content both change size — the recognition card appears on an
    // answer, and the URL bar collapses on scroll — so watch the scroller and its column.
    const observer = new ResizeObserver(measure)

    observer.observe(element)
    if (element.firstElementChild) observer.observe(element.firstElementChild)

    return () => observer.disconnect()
  }, [measure])

  const groundClass = ground === 'molten' ? 'quiz-ground-molten' : 'quiz-ground'

  if (sheet) {
    return (
      <div
        data-register={register}
        className={cn('grid h-dvh grid-rows-[auto_minmax(0,1fr)]', groundClass)}
      >
        {header ? <div className={cn(COLUMN, 'pt-[14px]')}>{header}</div> : <div />}
        <div className="mx-auto flex min-h-0 w-full max-w-[430px] flex-col justify-end">
          {sheet}
        </div>
      </div>
    )
  }

  return (
    <div
      data-register={register}
      className={cn('grid h-dvh grid-rows-[auto_minmax(0,1fr)_auto]', groundClass)}
    >
      {header ? <div className={cn(COLUMN, 'pt-[14px]')}>{header}</div> : <div />}

      <div
        ref={scroller}
        onScroll={measure}
        className={cn('overflow-y-auto overscroll-contain', clipped && 'quiz-scroll-clipped')}
      >
        <div className={cn(COLUMN, 'flex flex-col gap-6 pt-6 pb-2')}>
          {heading || body ? (
            <header className="flex flex-col gap-3">
              {heading ? (
                <h1
                  className={cn(
                    'font-display text-foreground font-medium',
                    HEADING_SIZE[headingSize],
                  )}
                >
                  {heading}
                </h1>
              ) : null}
              {body?.map((line) => (
                <p key={line} className="text-body text-foreground-secondary">
                  {line}
                </p>
              ))}
            </header>
          ) : null}

          {children ? <div className="flex flex-col gap-6">{children}</div> : null}
        </div>
      </div>

      {footer ? (
        <div className={cn(COLUMN, 'pt-4 pb-[calc(16px+env(safe-area-inset-bottom))]')}>
          {footer}
        </div>
      ) : (
        <div />
      )}
    </div>
  )
}
