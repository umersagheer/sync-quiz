import { readFileSync } from 'node:fs'

import { describe, expect, it } from 'vitest'

import { cn, TEXT_SIZE_TOKENS } from '@/lib/shared/utils/cn'

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

  /**
   * The list in `cn.ts` is hand-maintained, so guard it against the stylesheet rather
   * than against memory: a new `--text-*` token that nobody registers is exactly the bug
   * this file exists to catch.
   */
  it('knows every --text-* token declared in globals.css', () => {
    const css = readFileSync(new URL('../../styles/globals.css', import.meta.url), 'utf8')
    const declared = [...css.matchAll(/^\s*--text-([a-z0-9-]+):/gm)]
      .map(([, name]) => name)
      // `--text-display--line-height` is a modifier on `display`, not a size of its own.
      .filter((name) => !name.includes('--'))

    expect(declared.length).toBeGreaterThan(0)
    expect([...new Set(declared)].sort()).toEqual([...TEXT_SIZE_TOKENS].sort())
  })

  /** Genuine conflicts must still collapse, or the helper is pointless. */
  it('still resolves real conflicts last-wins', () => {
    expect(cn('text-body', 'text-display')).toBe('text-display')
    expect(cn('text-foreground', 'text-accent')).toBe('text-accent')
    expect(cn('p-2', 'p-4')).toBe('p-4')
  })
})
