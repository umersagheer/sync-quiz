import type { Lane } from '@/lib/shared/types/quiz.types'
import type { StepId } from './steps'

import { BRANCHES } from '@/lib/shared/content/branches.content'

/**
 * The label in the progress pill, transcribed from the frames.
 *
 * Fixed for the shared screens; the branch screens carry the lane's own title, which is
 * why this is a function rather than a plain lookup. The education screen swaps the
 * counter for a phrase, since it asks nothing.
 */
const FIXED: Partial<Record<StepId, string>> = {
  name: 'About you',
  sex: 'About you',
  goal: 'Your goals',
  depth: 'Your goals',
  secondary: 'Your goals',
  sleep: 'Cross-signals',
  stress: 'Cross-signals',
  goal90: 'Your read',
  email: 'Almost there',
}

export const sectionLabel = (step: StepId, lane: Lane | undefined): string | null => {
  if (step === 'welcome' || step === 'interstitial') return null

  const title = lane ? BRANCHES[lane].title : ''

  if (step === 'education') return `${title} · why we asked`
  if (step === 'discriminator' || step === 'qualifier') return title

  return FIXED[step] ?? null
}
