'use client'

import type { ChoiceOption } from '@/lib/shared/types/content.types'

import { cn } from '@/lib/shared/utils/cn'

interface OptionGroupProps<V extends string> {
  legend: string
  name: string
  options: ChoiceOption<V>[]
  /** A single value for radios, or the ticked set for checkboxes. */
  value: V | V[] | undefined
  onChange: (value: V) => void
  multiple?: boolean
  className?: string
}

/**
 * A radio or checkbox group built from real inputs.
 *
 * The inputs are visually hidden rather than replaced by divs, so arrow-key navigation,
 * Space and Enter, form semantics and screen-reader announcement all come from the
 * platform instead of being reimplemented. The label is the control — clicking anywhere
 * on the card works because the input lives inside it.
 *
 * Phase 4 styles this via `peer-checked:` on the visible span; the structure does not
 * need to change for that.
 */
export function OptionGroup<V extends string>({
  legend,
  name,
  options,
  value,
  onChange,
  multiple = false,
  className,
}: OptionGroupProps<V>) {
  const selected = (option: V) => (Array.isArray(value) ? value.includes(option) : value === option)

  return (
    <fieldset className={cn('flex flex-col gap-3', className)}>
      <legend className="sr-only">{legend}</legend>

      {options.map((option) => (
        <label
          key={option.value}
          className={cn(
            'border-border bg-surface rounded-control flex cursor-pointer items-start gap-3 border p-4',
            'focus-within:ring-ring focus-within:ring-2 focus-within:ring-offset-2',
            'focus-within:ring-offset-background',
            selected(option.value) && 'border-border-strong bg-surface-muted',
          )}
        >
          <input
            type={multiple ? 'checkbox' : 'radio'}
            name={name}
            value={option.value}
            checked={selected(option.value)}
            onChange={() => onChange(option.value)}
            className="mt-1 shrink-0"
          />
          <span className="text-sm">{option.label}</span>
        </label>
      ))}
    </fieldset>
  )
}
