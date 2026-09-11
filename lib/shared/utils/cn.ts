import type { ClassValue } from 'clsx'

import { clsx } from 'clsx'
import { extendTailwindMerge } from 'tailwind-merge'

/**
 * Every `--text-*` size token in styles/globals.css.
 *
 * Exported only so `tests/unit/cn.test.ts` can read the stylesheet back and fail if the
 * two ever drift — a missing entry here is invisible in the source and shows up only as
 * a class silently vanishing in the browser.
 */
export const TEXT_SIZE_TOKENS = [
  'display-lg',
  'display',
  'display-md',
  'display-sm',
  'lead',
  'field',
  'title',
  'body',
  'note',
  'eyebrow',
  'sub',
  'caption',
] as const

/**
 * tailwind-merge, taught about this project's custom type scale.
 *
 * Without this it cannot tell `text-title` (a font size from `@theme`) from
 * `text-on-selected` (a colour), files both under one conflict group, and silently keeps
 * only whichever came last. That cost the primary button its text colour and the text
 * field its font size — both invisible in the source and visible only in the browser.
 */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [{ text: [...TEXT_SIZE_TOKENS] }],
    },
  },
})

/**
 * Merge Tailwind classes, last-wins on genuine conflicts.
 *
 * `twMerge` is the load-bearing half: without it a caller's `className` cannot override
 * a component's internal classes — both land in the class list and the result depends on
 * stylesheet order rather than intent.
 */
export const cn = (...inputs: ClassValue[]): string => twMerge(clsx(inputs))
