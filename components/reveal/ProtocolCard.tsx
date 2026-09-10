import type { Protocol } from '@/lib/shared/types/engine.types'
import type { CompoundCopy } from '@/lib/shared/types/content.types'
import type { ResultShape, Compound, BlendId } from '@/lib/shared/types/engine.types'
import type { Lane } from '@/lib/shared/types/quiz.types'

import Image from 'next/image'

import { BLEND_COPY, COMPOUND_COPY } from '@/lib/shared/content/compounds.content'
import { BRANCHES } from '@/lib/shared/content/branches.content'

export type CardRole = 'base' | 'adjunct'

const copyFor = (protocol: Protocol): CompoundCopy | undefined =>
  protocol.kind === 'blend'
    ? BLEND_COPY[protocol.id as BlendId]
    : COMPOUND_COPY[protocol.compounds[0] as Compound]

/**
 * A protocol card — the same component the frames draw three times.
 *
 * `role` drives the pill and the eyebrow suffix; everything else is identical, which is
 * why this is one component with a prop rather than three near-copies.
 *
 * Where the client has not written a compound's copy, the card says so plainly instead of
 * rendering a blank. These are therapeutic claims about compounded molecules and are not
 * ours to invent.
 */
export function ProtocolCard({
  protocol,
  role,
  lane,
  shape,
}: {
  protocol: Protocol
  role: CardRole
  lane: Lane
  shape: ResultShape
}) {
  const copy = copyFor(protocol)
  const name = copy?.displayName ?? protocol.compounds.join(' + ')
  const laneLabel = BRANCHES[lane].title.toUpperCase()
  const eyebrow = role === 'adjunct' ? `${laneLabel} · ADJUNCT` : laneLabel
  const paragraph =
    copy?.paragraphByShape?.[shape] ??
    (copy?.card.status === 'written' ? copy.card.paragraph : null)

  return (
    <article className="bg-card text-card-foreground rounded-option border-card-hairline flex flex-col gap-4 border p-5">
      <div className="flex items-start gap-4">
        {copy?.image ? (
          <Image
            src={copy.image}
            alt=""
            width={72}
            height={92}
            className="rounded-field shrink-0 object-cover"
          />
        ) : null}

        <div className="flex min-w-0 flex-col gap-1">
          <p className="text-accent font-mono text-[0.625rem] leading-[0.8125rem] font-medium tracking-[0.08em]">
            {eyebrow}
          </p>
          <h2 className="font-display text-[1.625rem] leading-[1.9375rem] font-medium">{name}</h2>
          {copy?.formLine ? (
            <p className="text-card-faint-foreground font-display text-[0.75rem] leading-[1.0625rem]">
              {copy.formLine}
            </p>
          ) : null}
        </div>
      </div>

      {copy?.card.status === 'written' ? (
        <ul className="grid grid-cols-2 gap-2">
          {copy.card.chips.map((chip) => (
            <li
              key={chip}
              className="bg-chip rounded-field font-display px-3 py-2 text-[0.75rem] leading-[1rem] font-medium"
            >
              {chip}
            </li>
          ))}
        </ul>
      ) : null}

      {paragraph ? (
        <p className="text-card-muted-foreground font-display text-[0.875rem] leading-[1.25rem]">
          {paragraph}
        </p>
      ) : (
        <p className="border-card-hairline text-card-faint-foreground rounded-field border border-dashed p-3 text-[0.75rem]">
          Copy pending from the client —{' '}
          {copy?.card.status === 'pending' ? copy.card.awaiting : 'card copy'}. See
          docs/COPY_BACKLOG.md.
        </p>
      )}

      <div className="border-card-hairline flex items-center justify-between border-t pt-4">
        {copy?.monthlyPrice != null ? (
          <p className="font-display flex items-baseline gap-1.5">
            <span className="text-[1.4375rem] leading-[1.75rem] font-medium">
              ${copy.monthlyPrice.toFixed(2)}
            </span>
            <span className="text-card-faint-foreground text-[0.75rem]">per month</span>
          </p>
        ) : (
          <p className="text-card-faint-foreground text-[0.75rem]">Price pending</p>
        )}

        <span className="bg-chip text-accent rounded-pill px-2.5 py-1 font-mono text-[0.5625rem] font-medium tracking-[0.08em]">
          {role === 'adjunct' ? 'ADJUNCT' : 'BASE'}
        </span>
      </div>
    </article>
  )
}
