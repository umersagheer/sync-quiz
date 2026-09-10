import { describe, expect, it } from 'vitest'

import { POST } from '@/app/api/quiz/resolve/route'

import { answers } from '../helpers/answers'

const post = (body: unknown, raw?: string) =>
  POST(
    new Request('http://localhost/api/quiz/resolve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: raw ?? JSON.stringify(body),
    }),
  )

/**
 * The route is the only way a reveal exists — the engine is server-only and cannot be
 * called from the browser. Zod is the gate in front of it, and it has to be: the engine's
 * lane tables end in catch-all rules, so a malformed payload would not throw, it would
 * resolve to *something* and recommend it to a real person.
 */
describe('POST /api/quiz/resolve', () => {
  it('resolves a valid submission', async () => {
    const response = await post(
      answers({ lane: 'REPAIR', discriminator: ['gut_mucosal'], qualifier: 'mechanical' }),
    )
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.shape).toBe('SHAPE_1_SINGLE')
    expect(body.base.compounds).toEqual(['BPC-157'])
    expect(body.readVariant).toBe('fallback_repair')
  })

  it('rejects a cross-lane qualifier with field errors, not a 500', async () => {
    const response = await post({
      ...answers({ lane: 'REPAIR', discriminator: ['gut_mucosal'], qualifier: 'mechanical' }),
      qualifier: 'load_elite',
    })
    const body = await response.json()

    expect(response.status).toBe(400)
    expect(body.fieldErrors).toBeDefined()
    expect(body.error).toBeTruthy()
  })

  it('rejects an incomplete submission', async () => {
    const response = await post({ firstName: 'Alex' })

    expect(response.status).toBe(400)
  })

  it('rejects a malformed body without throwing', async () => {
    const response = await post(undefined, 'not json at all')
    const body = await response.json()

    expect(response.status).toBe(400)
    expect(body.error).toBe('Expected a JSON body')
  })

  it('rejects a secondary goal that repeats the primary', async () => {
    const response = await post(
      answers({
        lane: 'REPAIR',
        discriminator: ['gut_mucosal'],
        qualifier: 'mechanical',
        secondaryLanes: ['REPAIR'],
      }),
    )

    expect(response.status).toBe(400)
  })

  /** Shape 3 — the path the first Figma reveal frame draws. */
  it('assembles a blend plus a supporting single', async () => {
    const response = await post(
      answers({
        lane: 'REPAIR',
        discriminator: ['systemic_multisite'],
        qualifier: 'inflammatory_active',
        secondaryLanes: ['RESTORE'],
      }),
    )
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.shape).toBe('SHAPE_3_BLEND_PLUS_SINGLE')
    expect(body.base.id).toBe('REPAIR')
    expect(body.supporting.compounds).toEqual(['NAD+'])
  })
})
