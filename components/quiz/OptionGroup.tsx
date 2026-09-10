'use client'

import type { ComponentType, SVGProps } from 'react'
import type { ChoiceOption } from '@/lib/shared/types/content.types'

import { cn } from '@/lib/shared/utils/cn'

import { CheckIcon } from './icons/ChromeIcons'

type IconComponent = ComponentType<SVGProps<SVGSVGElement>>

interface OptionGroupProps<V extends string> {
  legend: string
  name: string
  options: ChoiceOption<V>[]
  value: V | V[] | undefined
  onChange: (value: V) => void
  multiple?: boolean
  /** Leading icon per option value — the lane list on S5 uses these. */
  icons?: Record<string, IconComponent>
  /** Secondary line under the label, e.g. "From injury, training, or gut issues". */
  descriptions?: Record<string, string>
  className?: string
}

/**
 * The option list — `Lane options` in Figma, and the pattern every question screen
 * repeats.
 *
 * Structure mirrors the Auto Layout tree: a vertical stack (gap 10) of horizontal rows
 * (gap 14) holding icon, label stack (gap 2) and the check indicator.
 *
 * The input stays a real radio or checkbox, visually hidden inside its label, so arrow
 * keys, Space, form semantics and screen-reader announcement all keep working. Selected
 * styling hangs off `group-has-[:checked]:` rather than `peer-checked:` — a peer variant
 * compiles to a sibling combinator and cannot reach nested children, which is most of
 * what needs to change colour here.
 */
export function OptionGroup<V extends string>({
  legend,
  name,
  options,
  value,
  onChange,
  multiple = false,
  icons,
  descriptions,
  className,
}: OptionGroupProps<V>) {
  const selected = (option: V) => (Array.isArray(value) ? value.includes(option) : value === option)

  return (
    <fieldset className={cn('flex flex-col gap-[9px]', className)}>
      <legend className="sr-only">{legend}</legend>

      {options.map((option) => {
        const Icon = icons?.[option.value]
        const description = descriptions?.[option.value]

        return (
          <label key={option.value} className="group block cursor-pointer">
            <input
              type={multiple ? 'checkbox' : 'radio'}
              name={name}
              value={option.value}
              checked={selected(option.value)}
              onChange={() => onChange(option.value)}
              className="sr-only"
            />

            <span
              className={cn(
                'glass rounded-option flex items-center gap-[14px] px-[18px] py-[14px]',
                'transition-[background-color,box-shadow] duration-150',
                // Selected flips the card to a near-solid white surface.
                'group-has-[:checked]:bg-selected group-has-[:checked]:bg-none',
                'group-has-[:checked]:shadow-glass-lg group-has-[:checked]:border-transparent',
                // Focus must read against both the glass and the white card.
                'group-has-[:focus-visible]:ring-foreground/70 group-has-[:focus-visible]:ring-offset-ground-top group-has-[:focus-visible]:ring-2 group-has-[:focus-visible]:ring-offset-2',
              )}
            >
              {Icon ? (
                <Icon className="text-foreground group-has-[:checked]:text-accent size-7 shrink-0" />
              ) : null}

              <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="text-title text-foreground group-has-[:checked]:text-on-selected font-[590]">
                  {option.label}
                </span>
                {description ? (
                  <span className="text-sub text-foreground-secondary group-has-[:checked]:text-on-selected-muted">
                    {description}
                  </span>
                ) : null}
              </span>

              <span
                aria-hidden="true"
                className={cn(
                  'grid size-[26px] shrink-0 place-items-center',
                  'border-glass-hairline-strong border',
                  // The frames use a circle for single-select and a rounded square for
                  // multi-select — the same affordance difference as native controls.
                  multiple ? 'rounded-[8px]' : 'rounded-full',
                  'group-has-[:checked]:bg-accent group-has-[:checked]:border-accent group-has-[:checked]:text-white',
                )}
              >
                <CheckIcon className="opacity-0 group-has-[:checked]:opacity-100" />
              </span>
            </span>
          </label>
        )
      })}
    </fieldset>
  )
}
