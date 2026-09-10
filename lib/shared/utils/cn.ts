import type { ClassValue } from 'clsx'

import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merge Tailwind classes, last-wins on conflicts.
 *
 * `twMerge` is the load-bearing half: without it a caller's `className` cannot
 * override a component's internal classes — both land in the class list and the
 * result depends on stylesheet order rather than intent.
 */
export const cn = (...inputs: ClassValue[]): string => twMerge(clsx(inputs))
