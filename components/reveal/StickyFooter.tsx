'use client'

import Link from 'next/link'

import { REVEAL_CHROME } from '@/lib/shared/content/reveal.content'

/**
 * The conversion mechanism — §5.8 marks it CRITICAL: visible at every scroll position.
 *
 * `fixed` rather than `sticky` so it survives the whole page, padded for the iOS home
 * indicator so it does not sit under the system gesture bar.
 */
export function StickyFooter({ months, total }: { months: number; total: string | null }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-20">
      <div className="bg-reveal-page border-card-hairline mx-auto flex w-full max-w-[430px] items-center justify-between gap-3 border-t px-5 pt-4 pb-[calc(16px+env(safe-area-inset-bottom))]">
        <span className="flex shrink-0 flex-col whitespace-nowrap">
          <span className="text-card-faint-foreground font-mono text-[0.6875rem] tracking-[0.06em]">
            {months}-month plan
          </span>
          <span className="font-display text-card-foreground text-[1.25rem] font-medium tabular-nums">
            {total ?? 'Price pending'}
          </span>
        </span>

        <Link
          href="/assessment"
          className="bg-card-foreground text-reveal-page rounded-pill focus-visible:ring-accent shrink-0 px-5 py-3.5 font-mono text-[0.8125rem] font-medium focus-visible:ring-2 focus-visible:outline-none"
        >
          {REVEAL_CHROME.footerCta} →
        </Link>
      </div>
    </div>
  )
}
