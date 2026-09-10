'use client'

import { useEffect, useState } from 'react'

import { REVEAL_CHROME } from '@/lib/shared/content/reveal.content'
import { cn } from '@/lib/shared/utils/cn'

/**
 * The header that pins once the read band has scrolled away (frame `1:1099`).
 *
 * Translucent cream with a backdrop blur — the frame uses Figma's `GLASS` material and a
 * 72% fill, so the page shows through as it scrolls under. It carries the assembled stack
 * name and a dismiss control, so the customer always knows what they are looking at and
 * can leave from anywhere on a long page.
 */
export function CondensedHeader({
  stackName,
  onDismiss,
}: {
  stackName: string
  onDismiss: () => void
}) {
  const [pinned, setPinned] = useState(false)

  useEffect(() => {
    const onScroll = () => setPinned(window.scrollY > 320)

    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })

    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div
      aria-hidden={!pinned}
      className={cn(
        'fixed inset-x-0 top-0 z-20 flex justify-center transition-transform duration-200',
        pinned ? 'translate-y-0' : '-translate-y-full',
      )}
    >
      <div
        className="border-card-hairline flex w-full max-w-[430px] items-center justify-between gap-3 border-b px-5 py-3.5 backdrop-blur-2xl backdrop-saturate-150"
        style={{ backgroundColor: 'rgb(252 248 241 / 0.72)' }}
      >
        <span className="flex min-w-0 flex-col">
          <span className="text-accent font-mono text-[0.5625rem] font-medium tracking-[0.08em]">
            {REVEAL_CHROME.condensedLabel}
          </span>
          <span className="font-display text-card-foreground truncate text-[1rem] font-medium">
            {stackName}
          </span>
        </span>

        <button
          type="button"
          onClick={onDismiss}
          tabIndex={pinned ? 0 : -1}
          aria-label="Start over"
          className="text-card-muted-foreground focus-visible:ring-accent grid size-[34px] shrink-0 place-items-center rounded-full bg-[rgb(29_29_27_/_0.06)] text-[0.8125rem] focus-visible:ring-2 focus-visible:outline-none"
        >
          <span aria-hidden="true">✕</span>
        </button>
      </div>
    </div>
  )
}
