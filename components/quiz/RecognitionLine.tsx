/**
 * A same-screen recognition callout — the red-bar treatment in the copy layer.
 *
 * `role="status"` because it appears in response to the customer's answer rather than
 * being present on load; without it a screen-reader user gets no signal that anything
 * changed.
 */
export function RecognitionLine({ text }: { text: string }) {
  return (
    <p role="status" className="border-primary bg-surface border-l-2 py-2 pl-4 text-sm">
      {text}
    </p>
  )
}
