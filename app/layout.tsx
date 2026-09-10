import type { Metadata, Viewport } from 'next'

import localFont from 'next/font/local'
import { Source_Code_Pro } from 'next/font/google'

import { Providers } from './providers'

import '@/styles/globals.css'

/**
 * Satoshi carries every heading in the design. Self-hosted from Fontshare (ITF Free
 * Font License, included in app/fonts) — only the two weights the design actually uses.
 */
const satoshi = localFont({
  src: [
    { path: './fonts/Satoshi-Regular.woff2', weight: '400', style: 'normal' },
    { path: './fonts/Satoshi-Medium.woff2', weight: '500', style: 'normal' },
  ],
  variable: '--font-satoshi',
  display: 'swap',
})

/** Used for exactly one thing: the primary button label. */
const sourceCode = Source_Code_Pro({
  subsets: ['latin'],
  weight: ['600'],
  variable: '--font-source-code',
  display: 'swap',
})

/**
 * The body face is SF Pro, which cannot be redistributed — but the `-apple-system`
 * stack in `--font-sans` renders the genuine face on iPhone and Mac, where this design
 * is aimed. Elsewhere it falls back to the platform UI font, which is the right
 * behaviour for a design built on iOS conventions.
 */
export const metadata: Metadata = {
  title: 'SYNC — Find your protocol',
  description:
    'Answer a few questions and see the peptide protocol matched to your goals, reviewed by a licensed clinician.',
}

export const viewport: Viewport = {
  themeColor: '#12080b',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" className={`${satoshi.variable} ${sourceCode.variable} h-full`}>
      <body className="text-foreground flex min-h-full flex-col font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
