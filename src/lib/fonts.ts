import { Baloo_2, Plus_Jakarta_Sans } from 'next/font/google'

/**
 * Baloo 2 — rounded & bertenaga, dipakai untuk semua heading/display text.
 * Plus Jakarta Sans — netral & mudah dibaca, dipakai untuk body text.
 *
 * Cara pakai di src/app/layout.tsx (root layout kamu yang sudah ada):
 *
 *   import { fontDisplay, fontBody } from '@/lib/fonts'
 *
 *   export default function RootLayout({ children }) {
 *     return (
 *       <html lang="id" className={`${fontDisplay.variable} ${fontBody.variable}`}>
 *         <body className="font-body bg-[var(--color-bg)] text-[var(--color-ink)]">
 *           {children}
 *         </body>
 *       </html>
 *     )
 *   }
 *
 * Lalu pakai className="font-display" di setiap heading yang perlu.
 */

export const fontDisplay = Baloo_2({
  subsets: ['latin'],
  weight: ['600', '700', '800'],
  variable: '--font-display',
  display: 'swap',
})

export const fontBody = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-body',
  display: 'swap',
})
