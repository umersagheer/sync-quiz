import type { Metadata, Viewport } from 'next'

import { Inter } from 'next/font/google'

import { Providers } from './providers'

import '@/styles/globals.css'

/**
 * PLACEHOLDER typeface — the real one is in Figma, which was unreachable when
 * this was written. `next/font` keeps the swap to this one declaration.
 */
const appSans = Inter({
  variable: '--font-app-sans',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'SYNC — Find your protocol',
  description:
    'Answer a few questions and see the peptide protocol matched to your goals, reviewed by a licensed clinician.',
}

export const viewport: Viewport = {
  themeColor: '#2a0e14',
}

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" className={`${appSans.variable} h-full`}>
      <body className="bg-background text-foreground flex min-h-full flex-col font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
