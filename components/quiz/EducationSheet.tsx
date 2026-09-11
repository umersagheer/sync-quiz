import type { EducationScreen } from '@/lib/shared/types/content.types'

import { PrimaryButton } from './PrimaryButton'

/**
 * The education screen, drawn as an iOS bottom sheet.
 *
 * The one screen in the flow that asks nothing — plain-language biology, no product
 * mention, no sell. It reaches the bottom of the viewport with only its top corners
 * rounded, and carries its own CTA rather than using the shell's footer.
 *
 * The body scrolls inside the sheet rather than the sheet growing past the viewport: this
 * is the longest copy in the quiz, and on a short screen it would otherwise carry its own
 * CTA off the bottom — the same failure the shell's three rows exist to prevent.
 *
 * The lead paragraph is set heavier than the body, which is how the frames separate the
 * claim from its explanation.
 */
export function EducationSheet({
  education,
  eyebrow,
  onContinue,
}: {
  education: EducationScreen
  eyebrow: string
  onContinue: () => void
}) {
  const [lead, ...rest] = education.body

  return (
    <section className="glass flex max-h-full min-h-[74dvh] flex-col rounded-t-[40px] px-[18px] pt-2.5 pb-[calc(18px+env(safe-area-inset-bottom))]">
      <span
        aria-hidden="true"
        className="bg-foreground-faint mx-auto h-[5px] w-9 shrink-0 rounded-full"
      />

      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto overscroll-contain pt-4">
        <p className="text-eyebrow text-accent-soft font-[590]">{eyebrow}</p>

        <h1 className="font-display text-display-md text-foreground font-medium">
          {education.heading}
        </h1>

        {lead ? <p className="text-lead text-foreground font-[590]">{lead}</p> : null}

        {rest.map((paragraph) => (
          <p key={paragraph} className="text-title text-foreground-secondary">
            {paragraph}
          </p>
        ))}

        <hr className="border-glass-hairline" />

        {/*
          Design-only line — it does not appear in the copy layer. Logged in
          docs/COPY_BACKLOG.md as words that never went through copy review.
        */}
        <p className="text-caption text-foreground-muted">
          No product mentioned on this screen — education only.
        </p>
      </div>

      <PrimaryButton variant="plain" onClick={onContinue} className="mt-4 shrink-0">
        {education.cta}
      </PrimaryButton>
    </section>
  )
}
