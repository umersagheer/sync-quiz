import type { EducationScreen } from '@/lib/shared/types/content.types'

import { PrimaryButton } from './PrimaryButton'

/**
 * The education screen, drawn as an iOS bottom sheet.
 *
 * The one screen in the flow that asks nothing — plain-language biology, no product
 * mention, no sell. It reaches the bottom of the viewport with only its top corners
 * rounded, and carries its own CTA rather than using the shell's footer.
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
    <section className="glass flex min-h-[74dvh] flex-col gap-4 rounded-t-[40px] px-[18px] pt-2.5 pb-[calc(18px+env(safe-area-inset-bottom))]">
      <span aria-hidden="true" className="bg-foreground-faint mx-auto h-[5px] w-9 rounded-full" />

      <p className="text-accent-soft text-[0.6875rem] leading-[0.9375rem] font-[590] tracking-[0.08em]">
        {eyebrow}
      </p>

      <h1 className="font-display text-display-md text-foreground font-medium">
        {education.heading}
      </h1>

      {lead ? (
        <p className="text-foreground text-[1.125rem] leading-[1.625rem] font-[590]">{lead}</p>
      ) : null}

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

      <PrimaryButton variant="plain" onClick={onContinue} className="mt-auto">
        {education.cta}
      </PrimaryButton>
    </section>
  )
}
