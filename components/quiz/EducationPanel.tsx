import type { EducationScreen } from '@/lib/shared/types/content.types'

/** The grey-callout education screen that closes each branch. No product mention, no sell. */
export function EducationPanel({ education }: { education: EducationScreen }) {
  return (
    <section className="border-border bg-surface rounded-card flex flex-col gap-3 border p-5">
      {education.body.map((paragraph) => (
        <p key={paragraph} className="text-sm">
          {paragraph}
        </p>
      ))}
    </section>
  )
}
