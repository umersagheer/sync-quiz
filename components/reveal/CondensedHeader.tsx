'use client'

import { useEffect, useState } from 'react'

import { REVEAL_CHROME } from '@/lib/shared/content/reveal.content'
import { cn } from '@/lib/shared/utils/cn'

/**
 * The header that pins once the read band has scrolled away (frame `1:1099`).
 *
 * It carries the assembled stack name so the customer always knows what they are looking
 * at. Hidden until the scroll passes the band, then it slides in.
 */
export function CondensedHeader({ stackName }: { stackName: string }) {
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
        'fixed inset-x-0 top-0 z-20 transition-transform duration-200',
        pinned ? 'translate-y-0' : '-translate-y-full',
      )}
    >
      <div className="bg-reveal-page border-card-hairline mx-auto flex w-full max-w-[430px] items-center justify-between gap-3 border-b px-5 py-3">
        <span className="flex flex-col">
          <span className="text-card-faint-foreground font-mono text-[0.5625rem] font-medium tracking-[0.08em]">
            {REVEAL_CHROME.condensedLabel}
          </span>
          <span className="font-display text-card-foreground text-[0.9375rem] font-medium">
            {stackName}
          </span>
        </span>
      </div>
    </div>
  )
}
