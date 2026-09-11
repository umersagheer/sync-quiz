import type { Lane } from '@/lib/shared/types/quiz.types'
import type { ReadVariantId, ResultShape } from '@/lib/shared/types/engine.types'

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
  shape,
  onDismiss,
}: {
  firstName: string
  lane: Lane
  readVariant: ReadVariantId
  answerCount: number
  shape: ResultShape
  onDismiss: () => void
}) {
  const eyebrow = REVEAL_CHROME.readEyebrow.replace('[name]', firstName.trim().toUpperCase())

  // The band needs a minimum height, not just its content's: the fade to cream occupies
  // the bottom third, so a content-height band cuts hard against the page instead of
  // dissolving into it. The frame fixes it at 540px, but the frame's read carries a
  // headline and two paragraphs where ours has one signed paragraph — at 540 the extra
  // 70px is dead dark space. Raise this to 540 when the missing read copy arrives.
  return (
    <header className="reveal-band flex min-h-[470px] flex-col gap-5 px-5 pt-10 pb-14">
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

      <p className="font-mono text-[0.6875rem] leading-[0.875rem] font-medium tracking-[0.08em] text-[var(--color-read-eyebrow)]">
        {eyebrow}
      </p>

      {/*
        Set as a lead paragraph rather than at the frame's 29px headline size. The frame's
        headline is one short line above two body paragraphs; our signed read variants are
        two or three sentences, and at headline size they swallow the band. This keeps the
        signed words and gives them the weight they can carry.
      */}
      <p className="font-display text-[1.0625rem] leading-[1.5rem] text-[rgb(252_248_241_/_0.92)]">
        {READ_VARIANTS[readVariant]}
      </p>

      {/*
        The marker under the read changes with the shape: the two-protocol reveal counts
        answers and names the lane, while the solo shapes just say what you got.

        Pushed to the bottom of the band, where the fade has already turned the
        background cream — which is why it is set in dark text, not light.
      */}
      <div className="mt-auto flex flex-col gap-4">
        <span aria-hidden="true" className="h-px w-full bg-[rgb(252_248_241_/_0.28)]" />
        <p className="font-mono text-[0.625rem] leading-[0.8125rem] font-medium tracking-[0.08em] text-[rgb(29_29_27_/_0.55)]">
          {shape === 'SHAPE_2_SOLO_BLEND'
            ? 'BLEND'
            : shape === 'SHAPE_1_SINGLE'
              ? 'SINGLE'
              : `BASED ON ${answerCount} ANSWERS \u00a0·\u00a0 ${BRANCHES[lane].title.toUpperCase()} LANE`}
        </p>
      </div>
    </header>
  )
}
