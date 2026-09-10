'use client'

import type { ButtonHTMLAttributes } from 'react'

import { cn } from '@/lib/shared/utils/cn'

export function PrimaryButton({ className, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      {...props}
      className={cn(
        'bg-primary text-primary-foreground rounded-control w-full px-6 py-4 text-sm font-semibold',
        'focus-visible:ring-ring focus-visible:ring-offset-background focus-visible:ring-2 focus-visible:ring-offset-2',
        'disabled:cursor-not-allowed disabled:opacity-40',
        className,
      )}
    />
  )
}
