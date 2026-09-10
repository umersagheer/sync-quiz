'use client'

import type { ButtonHTMLAttributes } from 'react'

import { cn } from '@/lib/shared/utils/cn'

interface PrimaryButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * `mono` is the quiz's standard action — Source Code Pro, uppercase, the one place the
   * design uses a monospace face. `plain` is the education sheet's button, which the
   * frames set in SF Pro at sentence case; it reads as dismissing a sheet rather than
   * advancing the funnel.
   */
  variant?: 'mono' | 'plain'
}

export function PrimaryButton({ className, variant = 'mono', ...props }: PrimaryButtonProps) {
  return (
    <button
      type="button"
      {...props}
      className={cn(
        'bg-selected text-on-selected rounded-pill shadow-glass-lg w-full px-6 py-[17px] font-semibold',
        variant === 'mono'
          ? 'text-title font-mono tracking-[-0.005em] uppercase'
          : 'text-title font-sans font-[590]',
        'focus-visible:ring-foreground/70 focus-visible:ring-offset-ground-top focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none',
        'transition-opacity duration-150 disabled:cursor-not-allowed disabled:opacity-35',
        className,
      )}
    />
  )
}
