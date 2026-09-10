import { describe, expect, it } from 'vitest'

import { cn } from '@/lib/shared/utils/cn'

/**
 * Regression: tailwind-merge does not know this project's `--text-*` tokens, so it
 * classified `text-title` (a size) and `text-on-selected` (a colour) as one conflict
 * group and dropped the earlier one. The primary button lost its text colour and
 * rendered white-on-white; nothing in the source looked wrong.
 */
describe('cn', () => {
  it('keeps a custom text size and a custom text colour together', () => {
    const result = cn('text-title text-on-selected')

    expect(result).toContain('text-title')
    expect(result).toContain('text-on-selected')
  })

  it.each([
    ['text-display', 'text-foreground'],
    ['text-body', 'text-foreground-secondary'],
    ['text-caption', 'text-accent-soft'],
    ['text-sub', 'text-on-selected-muted'],
  ])('keeps %s alongside %s', (size, colour) => {
    const result = cn(`${size} ${colour}`)

    expect(result).toContain(size)
    expect(result).toContain(colour)
  })

  /** Genuine conflicts must still collapse, or the helper is pointless. */
  it('still resolves real conflicts last-wins', () => {
    expect(cn('text-body', 'text-display')).toBe('text-display')
    expect(cn('text-foreground', 'text-accent')).toBe('text-accent')
    expect(cn('p-2', 'p-4')).toBe('p-4')
  })
})
