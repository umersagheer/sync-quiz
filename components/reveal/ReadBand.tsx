import type { Lane } from '@/lib/shared/types/quiz.types'
import type { ReadVariantId } from '@/lib/shared/types/engine.types'

import { BRANCHES } from '@/lib/shared/content/branches.content'
import { READ_VARIANTS, REVEAL_CHROME } from '@/lib/shared/content/reveal.content'
import { SyncLogo } from '@/components/quiz/icons/SyncLogo'

/**
 * The read — the emotional beat before commerce, on the molten ground.
 *
 * The frame draws an eyebrow, a 29px headline, *two* body paragraphs and a footer. Our
 * ten read variants are a single signed paragraph each, so the headline and second
 * paragraph do not exist for nine of ten lanes and cannot be invented — these are the
 * associative claims Reid signs.
 *
 * Rather than render an empty slot or fabricate copy, the signed paragraph is set at the
 * headline's size. It is the read; giving it the weight the frame gives its headline is
 * truer to "this is the emotional beat" than demoting it to body text under a blank.
 * When the richer copy lands, the headline slot goes back above it.
 */
export function ReadBand({
  firstName,
  lane,
  readVariant,
  answerCount,
  onDismiss,
}: {
  firstName: string
  lane: Lane
  readVariant: ReadVariantId
  answerCount: number
  onDismiss: () => void
}) {
  const eyebrow = REVEAL_CHROME.readEyebrow.replace('[name]', firstName.trim().toUpperCase())

  return (
    <header className="reveal-band flex flex-col gap-5 px-5 pt-10 pb-9">
      <div className="flex items-center justify-between">
        <SyncLogo className="text-foreground" />
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Start over"
          className="glass-quiet text-foreground focus-visible:ring-foreground/70 grid size-9 place-items-center rounded-full text-[0.8125rem] focus-visible:ring-2 focus-visible:outline-none"
        >
          <span aria-hidden="true">✕</span>
        </button>
      </div>

      <p className="text-accent-soft font-mono text-[0.6875rem] leading-[0.875rem] font-medium tracking-[0.08em]">
        {eyebrow}
      </p>

      {/*
        Set as a lead paragraph rather than at the frame's 29px headline size. The frame's
        headline is one short line above two body paragraphs; our signed read variants are
        two or three sentences, and at headline size they swallow the band. This keeps the
        signed words and gives them the weight they can carry.
      */}
      <p className="font-display text-foreground text-[1.0625rem] leading-[1.5rem]">
        {READ_VARIANTS[readVariant]}
      </p>

      <p className="text-foreground-muted font-mono text-[0.625rem] leading-[0.8125rem] font-medium tracking-[0.08em]">
        BASED ON {answerCount} ANSWERS &nbsp;·&nbsp; {BRANCHES[lane].title.toUpperCase()} LANE
      </p>
    </header>
  )
}
