import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  /**
   * `/` is the funnel's entry point and only ever forwards to the first step.
   *
   * This lives here rather than as a `redirect()` inside `app/page.tsx` because a
   * redirect-only page still has to be prerendered and served, and Vercel returned a
   * platform 404 for it — the route existed in the manifest but resolved to no output.
   * A config redirect is handled by the routing layer before any page is involved, so
   * there is nothing to mis-resolve.
   *
   * `app/page.tsx` keeps its own redirect as a belt-and-braces fallback for any host
   * that ignores this.
   */
  async redirects() {
    return [{ source: '/', destination: '/quiz/welcome', permanent: false }]
  },
}

export default nextConfig
