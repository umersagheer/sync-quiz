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
 * Every field keeps a real `<label>` even where the design shows none — a placeholder is
 * not a label; it vanishes on focus and is announced inconsistently. `input` and
 * `textarea` render as separate elements rather than one dynamic tag, because their prop
 * types genuinely differ.
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
      'glass rounded-card text-body text-foreground placeholder:text-foreground-faint w-full px-[18px] py-[15px]',
      'focus-visible:ring-foreground/70 focus-visible:ring-offset-ground-top focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none',
      error && 'border-accent',
    ),
  }

  return (
    <div className="flex w-full flex-col gap-2">
      <label
        htmlFor={name}
        className={cn('text-caption text-foreground-secondary font-[590]', hideLabel && 'sr-only')}
      >
        {label}
      </label>

      {multiline ? <textarea rows={4} {...shared} /> : <input type={type} {...shared} />}

      {error ? (
        <p id={errorId} role="alert" className="text-caption text-accent-soft">
          {error}
        </p>
      ) : null}
    </div>
  )
}
