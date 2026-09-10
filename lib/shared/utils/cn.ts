import type { ClassValue } from 'clsx'

import { clsx } from 'clsx'
import { extendTailwindMerge } from 'tailwind-merge'

/**
 * tailwind-merge, taught about this project's custom type scale.
 *
 * Without this it cannot tell `text-title` (a font size from `@theme`) from
 * `text-on-selected` (a colour), files both under one conflict group, and silently keeps
 * only whichever came last. That cost the primary button its text colour and the text
 * field its font size — both invisible in the source and visible only in the browser.
 *
 * Any new `--text-*` token in styles/globals.css has to be added here too.
 */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [
        { text: ['display', 'display-md', 'display-sm', 'title', 'body', 'sub', 'caption'] },
      ],
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
