import { QueryClient } from '@tanstack/react-query'

/**
 * The single QueryClient for the app.
 *
 * It lives here rather than inside `app/providers.tsx` so non-React code can
 * reach the cache — the quiz store needs to clear it when a session is reset,
 * and doing that at the call sites misses paths.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
})
