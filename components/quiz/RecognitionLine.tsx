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
    <aside role="status" className="glass rounded-card relative pt-4 pr-[18px] pb-4 pl-5">
      {/*
        The bar is a sibling of the card in the frame, not a child of it — so the 20px
        left padding never applies to it and it sits 8px from the card's edge, spanning
        the full content box. Nesting it inside the padding pushes the text column in by
        another 12px and the card reads cramped.
      */}
      <span
        aria-hidden="true"
        className="bg-accent absolute top-4 bottom-4 left-2 w-[3px] rounded-full"
      />

      <div className="flex flex-col gap-2">
        <p className="text-eyebrow text-accent-soft font-[590]">{eyebrow}</p>
        <p className="text-note text-foreground">{text}</p>
      </div>
    </aside>
  )
}
