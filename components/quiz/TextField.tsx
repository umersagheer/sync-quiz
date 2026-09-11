'use client'

import type { ChangeEvent } from 'react'

import { cn } from '@/lib/shared/utils/cn'

interface TextFieldProps {
  label: string
  name: string
  value: string
  onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  onBlur?: () => void
  type?: 'text' | 'email'
  placeholder?: string
  error?: string
  hideLabel?: boolean
  multiline?: boolean
  maxLength?: number
  autoFocus?: boolean
}

/**
 * A labelled text input on a glass field.
 *
 * S2 and S9 draw a visible label above the field — "First name", "Email address" — so it
 * is shown by default. S8C's textarea has none, and only that screen passes `hideLabel`;
 * the label still renders for screen readers, because a placeholder is not a label. It
 * vanishes on focus and is announced inconsistently.
 *
 * `input` and `textarea` render as separate elements rather than one dynamic tag, because
 * their prop types genuinely differ.
 */
export function TextField({
  label,
  name,
  value,
  onChange,
  onBlur,
  type = 'text',
  placeholder,
  error,
  hideLabel,
  multiline,
  maxLength,
  autoFocus,
}: TextFieldProps) {
  const errorId = `${name}-error`

  const shared = {
    id: name,
    name,
    value,
    onChange,
    onBlur,
    placeholder,
    maxLength,
    autoFocus,
    'aria-invalid': error ? true : undefined,
    'aria-describedby': error ? errorId : undefined,
    className: cn(
      'glass text-field text-foreground placeholder:text-foreground-faint w-full px-6 py-[18px]',
      // The single-line field is drawn as a pill (r=31 on a 62px box); the textarea takes
      // the same 26px corner the education sheet uses.
      multiline ? 'rounded-sheet resize-none' : 'rounded-pill',
      'focus-visible:ring-foreground/70 focus-visible:ring-offset-ground-top focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none',
      error && 'border-accent',
    ),
  }

  return (
    <div className="flex w-full flex-col gap-[7px]">
      {/* The frames indent the label 4px past the field's own edge. */}
      <label
        htmlFor={name}
        className={cn(
          'text-caption text-foreground-muted pl-1 font-[590] tracking-[0.02em]',
          hideLabel && 'sr-only',
        )}
      >
        {label}
      </label>

      {multiline ? <textarea rows={3} {...shared} /> : <input type={type} {...shared} />}

      {error ? (
        <p id={errorId} role="alert" className="text-caption text-accent-soft pl-1">
          {error}
        </p>
      ) : null}
    </div>
  )
}
