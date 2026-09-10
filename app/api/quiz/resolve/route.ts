import { NextResponse } from 'next/server'

import { engineService } from '@/lib/server/services/engine/engine.service'
import { quizAnswersSchema } from '@/lib/server/validations/quiz.schema'

/**
 * Resolve a completed quiz into a protocol.
 *
 * No controller layer: the handler validates and calls the engine directly. Zod is the
 * gate — the engine's lane tables end in catch-alls, so an invalid combination would not
 * throw, it would quietly resolve to *something* and recommend it. That is the failure
 * this validation exists to prevent.
 */
export async function POST(request: Request) {
  let payload: unknown

  try {
    payload = await request.json()
  } catch {
    return NextResponse.json({ error: 'Expected a JSON body' }, { status: 400 })
  }

  const parsed = quizAnswersSchema.safeParse(payload)

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: 'Those answers are incomplete or invalid',
        fieldErrors: parsed.error.flatten().fieldErrors,
      },
      { status: 400 },
    )
  }

  return NextResponse.json(engineService.resolve(parsed.data))
}
