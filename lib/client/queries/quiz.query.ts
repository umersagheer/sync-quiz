import type { QuizAnswers } from '@/lib/shared/types/quiz.types'

import { useQuery } from '@tanstack/react-query'

import { quizService } from '@/lib/client/services/quiz.service'

export const QUIZ_QUERY_KEYS = {
  all: ['quiz'] as const,
  results: () => [...QUIZ_QUERY_KEYS.all, 'result'] as const,
  result: (answers: QuizAnswers | null) => [...QUIZ_QUERY_KEYS.results(), answers] as const,
}

/**
 * The reveal's data.
 *
 * A query rather than a mutation: resolution is a pure function of the answers, so a
 * refresh should recompute from what is stored rather than replay a cached command. The
 * answers are part of the key, so editing an earlier answer invalidates the result
 * automatically instead of showing a stale protocol.
 */
export function useQuizResult(answers: QuizAnswers | null) {
  return useQuery({
    queryKey: QUIZ_QUERY_KEYS.result(answers),
    queryFn: () => quizService.resolve(answers!),
    enabled: answers !== null,
    staleTime: Infinity,
    retry: false,
  })
}
