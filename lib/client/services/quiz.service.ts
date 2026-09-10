import type { QuizAnswers } from '@/lib/shared/types/quiz.types'
import type { EngineResult } from '@/lib/shared/types/engine.types'

export const API_ROUTES = {
  QUIZ: {
    RESOLVE: '/api/quiz/resolve',
  },
} as const

export interface ApiFieldErrors {
  [field: string]: string[]
}

export class QuizApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly fieldErrors?: ApiFieldErrors,
  ) {
    super(message)
    this.name = 'QuizApiError'
  }
}

/**
 * Resolve answers into a protocol.
 *
 * The engine is server-only — it cannot be called from the browser, by construction —
 * so this round trip is the only way a reveal exists.
 */
export const quizService = {
  resolve: async (answers: QuizAnswers): Promise<EngineResult> => {
    const response = await fetch(API_ROUTES.QUIZ.RESOLVE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(answers),
    })

    if (!response.ok) {
      const body = await response.json().catch(() => ({}))

      throw new QuizApiError(
        body.error ?? 'Could not build your protocol',
        response.status,
        body.fieldErrors,
      )
    }

    return response.json()
  },
}
