import { notFound } from 'next/navigation'

import { QuizStep } from '@/components/quiz/QuizStep'
import { isStepId, stepsFor } from '@/lib/client/quiz-flow/steps'

/** Pre-render every step; the guard inside decides whether a visitor may see it. */
export function generateStaticParams() {
  return stepsFor('REPAIR').map((step) => ({ step }))
}

export default async function QuizStepPage({ params }: PageProps<'/quiz/[step]'>) {
  const { step } = await params

  if (!isStepId(step)) notFound()

  return <QuizStep step={step} />
}
