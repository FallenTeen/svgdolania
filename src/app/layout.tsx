import type { Metadata } from 'next'
import { fontDisplay, fontBody } from '@/lib/fonts'
import '@/styles/tokens.css'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL('https://dolania-three.vercel.app'),
  title: {
    default: 'Explore Curug Banyumas — Katalog & Trip Air Terjun Banyumas',
    template: '%s',
  },
  description:
    'Temukan curug terbaik di Banyumas dan gabung trip explore bareng rombongan.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={`${fontDisplay.variable} ${fontBody.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-[var(--color-bg)] font-body text-[var(--color-ink)]">
        {children}
      </body>
    </html>
  )
}
