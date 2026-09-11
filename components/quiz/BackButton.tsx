'use client'

import { ChevronLeftIcon } from './icons/ChromeIcons'

/**
 * The round glass back control the frames put at the top-left of every screen after S1.
 *
 * Shared rather than duplicated because S3 carries it outside the progress header — it
 * has no progress bar and no section pill, only this.
 */
export function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Go back"
      className="glass-quiet text-foreground focus-visible:ring-foreground/70 focus-visible:ring-offset-ground-top grid size-11 shrink-0 place-items-center rounded-full focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
    >
      <ChevronLeftIcon />
    </button>
  )
}
