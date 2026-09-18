import type { Metadata } from 'next'
import { LogIn } from 'lucide-react'
import { MagicLinkForm } from '@/components/participant/MagicLinkForm'

export const metadata: Metadata = {
  title: 'Masuk — Explore Curug Banyumas',
}

export default async function MasukPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>
}) {
  const { redirect } = await searchParams

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-16 sm:px-6">
      <div className="rounded-3xl border-2 border-[var(--color-ink)] bg-white p-6 shadow-[var(--shadow-pop)] sm:p-8">
        <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border-2 border-[var(--color-ink)] bg-[var(--color-sun)]">
          <LogIn size={20} strokeWidth={2.5} />
        </span>
        <h1 className="text-center font-display text-2xl font-extrabold text-[var(--color-ink)]">
          Masuk ke akun kamu
        </h1>
        <p className="mt-2 text-center text-sm text-[var(--color-ink)]/70">
          Masukkan email kamu, kami kirim link login — tanpa perlu ingat password.
        </p>

        <div className="mt-6">
          <MagicLinkForm redirectTo={redirect} />
        </div>
      </div>
    </div>
  )
}
