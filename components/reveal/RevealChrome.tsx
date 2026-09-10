'use client'

import type { PlanMonths } from '@/lib/client/reveal/pricing'

import { PLAN_MONTHS } from '@/lib/client/reveal/pricing'
import {
  PLAN_SELECTOR,
  REVEAL_CHROME,
  TRUST_BLOCK,
  PAIRS_WELL_WITH_CARD,
} from '@/lib/shared/content/reveal.content'
import { cn } from '@/lib/shared/utils/cn'

/** A small uppercase section label. The reveal uses these to head every block. */
export function SectionLabel({ children }: { children: string }) {
  return (
    <p className="text-accent font-mono text-[0.625rem] leading-[0.8125rem] font-medium tracking-[0.08em]">
      {children}
    </p>
  )
}

/**
 * The plan selector.
 *
 * Backed by a real `<select>` so it gets the platform picker on mobile and full keyboard
 * support, with the visible row styled over it. §5.4 locks the default to 3 months and
 * the framing line to its exact words.
 */
export function PlanSelector({
  months,
  onChange,
  total,
}: {
  months: PlanMonths
  onChange: (months: PlanMonths) => void
  total: string | null
}) {
  return (
    <section className="flex flex-col gap-3">
      <SectionLabel>{REVEAL_CHROME.planLabel}</SectionLabel>

      <div className="bg-card border-card-hairline rounded-option relative border">
        <label htmlFor="plan-length" className="sr-only">
          Plan length
        </label>
        <select
          id="plan-length"
          value={months}
          onChange={(event) => onChange(Number(event.target.value) as PlanMonths)}
          className="focus-visible:ring-accent absolute inset-0 h-full w-full cursor-pointer opacity-0 focus-visible:ring-2"
        >
          {PLAN_MONTHS.map((value) => (
            <option key={value} value={value}>
              {value}-month plan
            </option>
          ))}
        </select>

        <div className="text-card-foreground pointer-events-none flex items-center justify-between px-5 py-4">
          <span className="flex flex-col gap-0.5">
            <span className="font-display text-[1rem] font-medium">{months}-month plan</span>
            <span className="text-card-faint-foreground font-display text-[0.75rem]">
              {total ? `${total} /month` : 'Price pending'}
            </span>
          </span>
          <span aria-hidden="true" className="text-card-faint-foreground">
            ⌄
          </span>
        </div>
      </div>

      <p className="text-card-faint-foreground font-mono text-[0.625rem] tracking-[0.08em]">
        {REVEAL_CHROME.planDefaultNote}
      </p>

      {/* §5.4 — verbatim, do not reword. */}
      <p className="border-accent bg-card text-card-muted-foreground rounded-field font-display border-l-2 px-4 py-3 text-[0.8125rem] leading-[1.1875rem]">
        {PLAN_SELECTOR.clinicalLine}
      </p>
    </section>
  )
}

/** Shape 1 only — the trust artefact of the whole system. */
export function TrustBlock() {
  return (
    <section className="border-accent flex flex-col gap-3 border-l-2 pl-4">
      <SectionLabel>{TRUST_BLOCK.eyebrow}</SectionLabel>
      <h2 className="font-display text-card-foreground text-[1.25rem] leading-[1.5rem] font-medium">
        {TRUST_BLOCK.heading}
      </h2>
      {TRUST_BLOCK.body.map((line) => (
        <p
          key={line}
          className="text-card-muted-foreground font-display text-[0.875rem] leading-[1.25rem]"
        >
          {line}
        </p>
      ))}
    </section>
  )
}

/** Shape 2 only. The single AOV path in the whole reveal — there is no generic "add". */
export function PairsWellWithCard({ added, onAdd }: { added: boolean; onAdd: () => void }) {
  return (
    <article className="bg-card text-card-foreground rounded-option border-card-hairline flex flex-col gap-3 border p-5">
      <p className="text-accent font-mono text-[0.5625rem] font-medium tracking-[0.08em]">
        {PAIRS_WELL_WITH_CARD.eyebrow}
      </p>
      <h3 className="font-display text-[1.25rem] font-medium">{PAIRS_WELL_WITH_CARD.name}</h3>
      <p className="text-card-faint-foreground font-display text-[0.75rem]">
        ${PAIRS_WELL_WITH_CARD.price.toFixed(2)} per month
      </p>
      <p className="text-card-muted-foreground font-display text-[0.8125rem] leading-[1.1875rem]">
        {PAIRS_WELL_WITH_CARD.body}
      </p>
      <button
        type="button"
        onClick={onAdd}
        disabled={added}
        className={cn(
          'border-card-hairline rounded-pill mt-1 border px-4 py-3 font-mono text-[0.6875rem] font-medium tracking-[0.08em]',
          'focus-visible:ring-accent focus-visible:ring-2 focus-visible:outline-none',
          added && 'opacity-45',
        )}
      >
        {added ? 'ADDED' : `+  ${REVEAL_CHROME.addToProtocol}`}
      </button>
    </article>
  )
}

/**
 * The controls. `SWAP THE BASE` is rendered disabled on purpose: neither the copy layer
 * nor the backend mapping defines what it swaps to, and inventing a swap rule would mean
 * inventing a clinical decision. Flagged for the client.
 */
export function RevealControls({
  canRemoveAdjunct,
  adjunctRemoved,
  onRemoveAdjunct,
  onStartOver,
}: {
  canRemoveAdjunct: boolean
  adjunctRemoved: boolean
  onRemoveAdjunct: () => void
  onStartOver: () => void
}) {
  // On the cream page these are white pills with a hairline, not glass on dark.
  const control =
    'bg-card border-card-hairline text-card-foreground rounded-pill font-mono border px-5 py-3.5 text-[0.6875rem] font-medium tracking-[0.08em] focus-visible:ring-accent focus-visible:ring-2 focus-visible:outline-none'

  return (
    <section className="flex flex-col items-center gap-4">
      <div className="flex w-full flex-wrap gap-3">
        <button
          type="button"
          disabled
          title="Awaiting a defined swap rule"
          className={cn(control, 'flex-1 opacity-40')}
        >
          {REVEAL_CHROME.swapBase}
        </button>
        {canRemoveAdjunct ? (
          <button
            type="button"
            onClick={onRemoveAdjunct}
            className={cn(control, 'flex-1', adjunctRemoved && 'opacity-45')}
          >
            {adjunctRemoved ? 'ADJUNCT REMOVED' : REVEAL_CHROME.removeAdjunct}
          </button>
        ) : null}
      </div>

      <button
        type="button"
        onClick={onStartOver}
        className="text-card-muted-foreground font-display focus-visible:ring-accent rounded-field text-[0.875rem] underline underline-offset-4 focus-visible:ring-2 focus-visible:outline-none"
      >
        {REVEAL_CHROME.startOver}
      </button>

      <p className="text-card-faint-foreground font-display text-center text-[0.8125rem] leading-[1.125rem]">
        {REVEAL_CHROME.billingNote}
      </p>
      <p className="text-card-faint-foreground text-center font-mono text-[0.625rem] tracking-[0.08em]">
        {REVEAL_CHROME.clinicianNote}
      </p>
    </section>
  )
}
