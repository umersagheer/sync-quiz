import { redirect } from 'next/navigation'

/**
 * The quiz starts at its first step rather than duplicating the welcome screen here.
 * `/quiz/welcome` owns S1 so the flow has exactly one entry point and the step machine
 * stays the single source of truth for order.
 */
export default function Home() {
  redirect('/quiz/welcome')
}
