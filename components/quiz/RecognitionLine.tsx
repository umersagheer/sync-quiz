/**
 * A same-screen recognition callout.
 *
 * Drawn as a glass card with an accent left bar and an eyebrow — the copy layer calls
 * these "red-bar callouts". `role="status"` because it appears in response to an answer
 * rather than on load; without it a screen-reader user gets no signal anything changed.
 */
export function RecognitionLine({
  text,
  eyebrow = 'WE SEE THIS OFTEN',
}: {
  text: string
  eyebrow?: string
}) {
  return (
    <aside role="status" className="glass rounded-card px-5 py-[15px]">
      <div className="border-accent flex flex-col gap-[7px] border-l-2 pl-3">
        <p className="text-accent-soft text-[0.6875rem] leading-[0.9375rem] font-[590] tracking-[0.08em]">
          {eyebrow}
        </p>
        <p className="text-[0.90625rem] leading-[1.25rem] text-white/90">{text}</p>
      </div>
    </aside>
  )
}
