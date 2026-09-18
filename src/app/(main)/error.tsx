'use client'

import { useEffect } from 'react'
import { AlertTriangle } from 'lucide-react'
import { ButtonLink } from '@/components/ui/Button'

export default function MainError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Muncul di Vercel Function Logs / browser console supaya gampang di-debug.
    console.error('Public route error:', error)
  }, [error])

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-4 py-16 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-[var(--color-ink)] bg-[var(--color-coral-soft)]">
        <AlertTriangle size={24} className="text-[var(--color-coral)]" />
      </span>
      <h1 className="mt-4 font-display text-2xl font-extrabold text-[var(--color-ink)]">
        Ada yang salah di halaman ini
      </h1>
      <p className="mt-2 text-sm text-[var(--color-ink)]/70">
        Coba muat ulang halamannya. Kalau masih terjadi, kabari admin ya.
      </p>
      <div className="mt-6 flex gap-3">
        <button
          type="button"
          onClick={() => reset()}
          className="rounded-full border-2 border-[var(--color-ink)] bg-[var(--color-primary)] px-5 py-2.5 font-display font-bold text-white shadow-[var(--shadow-pop-sm)]"
        >
          Coba lagi
        </button>
        <ButtonLink href="/" variant="outline">
          Kembali ke beranda
        </ButtonLink>
      </div>
    </div>
  )
}
