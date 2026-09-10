'use client'

import Link from 'next/link'

import { REVEAL_CHROME } from '@/lib/shared/content/reveal.content'

/**
 * The conversion mechanism — §5.8 marks it CRITICAL: visible at every scroll position.
 *
 * A vertical stack, not a row: the price line sits above a full-width CTA, matching
 * frame `1:1099`. Laying it out as a single row squeezed the total under the button and
 * the two overlapped on narrow screens.
 *
 * The frame applies Figma's `GLASS` material here, so this carries a real backdrop blur —
 * content scrolls visibly underneath it, which is the whole point of a floating bar.
 */
export function StickyFooter({ months, total }: { months: number; total: string | null }) {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-20 flex justify-center">
      <div className="pointer-events-auto w-full max-w-[430px]">
        {/* Full-bleed with only the top corners rounded, per the frame — not an inset card. */}
        <div
          className="flex flex-col gap-2 rounded-t-[32px] p-3 pb-[calc(12px+env(safe-area-inset-bottom))] backdrop-blur-2xl backdrop-saturate-150"
          style={{
            backgroundColor: 'rgb(252 248 241 / 0.72)',
            boxShadow: '0 -8px 24px rgb(29 29 27 / 0.12), inset 0 1px 1px rgb(255 255 255 / 0.6)',
          }}
        >
          <div className="flex items-baseline justify-between gap-3 px-2 pt-1">
            <span className="text-card-muted-foreground font-mono text-[0.75rem] tracking-[0.08em] uppercase">
              {months}-month plan
            </span>
            <span className="font-display text-card-foreground text-[1.375rem] leading-[1.75rem] font-medium tabular-nums">
              {total ?? 'Price pending'}
            </span>
          </div>

          <Link
            href="/assessment"
            className="bg-card-foreground text-reveal-page rounded-pill focus-visible:ring-accent flex items-center justify-center gap-2 px-5 py-4 font-mono text-[0.875rem] font-medium focus-visible:ring-2 focus-visible:outline-none"
          >
            {REVEAL_CHROME.footerCta}
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
