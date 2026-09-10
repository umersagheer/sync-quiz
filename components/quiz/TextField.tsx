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
  /** Hide the label visually but keep it for screen readers. */
  hideLabel?: boolean
  multiline?: boolean
  maxLength?: number
  autoFocus?: boolean
}

/**
 * A labelled text input.
 *
 * Every field gets a real `<label>` even where the design shows none — a placeholder is
 * not a label; it disappears on focus and screen readers announce it inconsistently.
 * `input` and `textarea` are rendered as separate elements rather than one dynamic tag,
 * because their prop types genuinely differ and casting between them hides real errors.
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
      'border-border bg-surface rounded-control w-full border px-4 py-3 text-sm',
      'focus-visible:ring-ring focus-visible:ring-offset-background focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none',
      error && 'border-primary',
    ),
  }

  return (
    <div className="flex w-full flex-col gap-2">
      <label htmlFor={name} className={cn('text-sm font-medium', hideLabel && 'sr-only')}>
        {label}
      </label>

      {multiline ? <textarea rows={4} {...shared} /> : <input type={type} {...shared} />}

      {error ? (
        <p id={errorId} role="alert" className="text-primary text-xs">
          {error}
        </p>
      ) : null}
    </div>
  )
}
