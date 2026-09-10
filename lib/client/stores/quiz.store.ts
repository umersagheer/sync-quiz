import type { QuizAnswers, QuizAnswersDraft } from '@/lib/shared/types/quiz.types'

import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

interface QuizState {
  // State
  answers: QuizAnswersDraft
  hydrated: boolean

  // Actions
  setAnswers: (patch: QuizAnswersDraft) => void
  reset: () => void

  // Helpers
  /** The completed answer set, or null while any field is still missing. */
  completedAnswers: () => QuizAnswers | null
}

const EMPTY: QuizAnswersDraft = { secondaryLanes: [] }

const REQUIRED: (keyof QuizAnswers)[] = [
  'firstName',
  'sexAtBirth',
  'lane',
  'depth',
  'secondaryLanes',
  'qualifier',
  'sleepHours',
  'stressLevel',
  'ninetyDayGoalText',
  'ninetyDayGoalAt',
  'email',
]

export const useQuizStore = create<QuizState>()(
  persist(
    (set, get) => ({
      answers: EMPTY,
      hydrated: false,

      setAnswers: (patch) => set((state) => ({ answers: { ...state.answers, ...patch } })),
      reset: () => set({ answers: EMPTY }),

      completedAnswers: () => {
        const { answers } = get()
        const missing = REQUIRED.some((field) => answers[field] === undefined)

        // PT-141 is qualifier-only, so an empty discriminator is correct there and only
        // there. Everywhere else the lane branch must have been answered.
        const needsDiscriminator = answers.lane !== 'PT141'

        if (missing || (needsDiscriminator && !answers.discriminator?.length)) return null

        return answers as QuizAnswers
      },
    }),
    {
      name: 'sync-quiz',
      /**
       * sessionStorage, deliberately.
       *
       * These answers are health-adjacent — sleep, stress, sexual function, GLP-1 use.
       * localStorage would leave them on a shared device indefinitely. sessionStorage
       * survives a refresh, which is what a sixteen-step funnel needs, and clears when
       * the tab closes, which is what the data deserves.
       */
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({ answers: state.answers }) as unknown as QuizState,
      onRehydrateStorage: () => (state) => {
        // Until this fires, the store holds defaults rather than the visitor's answers,
        // and the route guard would bounce someone mid-quiz back to the start.
        if (state) state.hydrated = true
      },
    },
  ),
)
