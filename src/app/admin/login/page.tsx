'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Droplets, Eye, EyeOff, LoaderCircle, TriangleAlert } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const loginSchema = z.object({
  email: z.string().min(1, 'Email wajib diisi').email('Format email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
})

type LoginFormValues = z.infer<typeof loginSchema>

export default function AdminLoginPage() {
  const [formError, setFormError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (values: LoginFormValues) => {
    setFormError(null)
    setIsSubmitting(true)

    const supabase = createClient()

    const { data: signInData, error: signInError } =
      await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      })

    if (signInError || !signInData.user) {
      setFormError('Email atau password salah.')
      setIsSubmitting(false)
      return
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', signInData.user.id)
      .single()

    if (profileError || profile?.role !== 'admin') {
      await supabase.auth.signOut()
      setFormError('Akun ini tidak memiliki akses admin.')
      setIsSubmitting(false)
      return
    }

    // Full reload (bukan router.push) dengan sengaja: memastikan request pertama ke
    // /admin dibaca ulang oleh middleware dengan cookie sesi yang baru saja ditulis,
    // tanpa terganggu client-side router cache Next.js yang kadang masih menyimpan
    // payload lama dari sebelum login.
    window.location.href = '/admin'
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[var(--color-bg)] px-4 py-12">
      {/* Aksen dekoratif ala peta jalur, konsisten dengan halaman publik */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            'radial-gradient(var(--color-ink) 1.5px, transparent 1.5px)',
          backgroundSize: '22px 22px',
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-16 -top-16 h-56 w-56 rounded-full bg-[var(--color-sun-soft)] blur-2xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-20 -right-10 h-64 w-64 rounded-full bg-[var(--color-sky-soft)] blur-2xl"
      />

      <div className="relative w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center text-center">
          <span className="mb-3 flex h-14 w-14 items-center justify-center rounded-full border-2 border-[var(--color-ink)] bg-[var(--color-primary)] text-white shadow-[var(--shadow-pop-sm)]">
            <Droplets size={26} strokeWidth={2.5} />
          </span>
          <h1 className="font-display text-2xl font-extrabold text-[var(--color-ink)]">
            Explore Curug Banyumas
          </h1>
          <p className="mt-1 text-sm text-[var(--color-ink)]/60">Masuk ke panel admin</p>
        </div>

        <div className="rounded-2xl border-2 border-[var(--color-ink)] bg-[var(--color-card)] p-6 shadow-[var(--shadow-pop)] sm:p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-sm font-semibold text-[var(--color-ink)]"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                autoFocus
                {...register('email')}
                className="w-full rounded-xl border-2 border-[var(--color-ink)]/15 bg-white px-3.5 py-2.5 text-sm text-[var(--color-ink)] outline-none transition-colors focus:border-[var(--color-primary)]"
                placeholder="admin@example.com"
              />
              {errors.email && (
                <p className="mt-1.5 text-xs font-medium text-[var(--color-coral)]">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block text-sm font-semibold text-[var(--color-ink)]"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  {...register('password')}
                  className="w-full rounded-xl border-2 border-[var(--color-ink)]/15 bg-white px-3.5 py-2.5 pr-10 text-sm text-[var(--color-ink)] outline-none transition-colors focus:border-[var(--color-primary)]"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-[var(--color-ink)]/40 hover:text-[var(--color-ink)]"
                  aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1.5 text-xs font-medium text-[var(--color-coral)]">
                  {errors.password.message}
                </p>
              )}
            </div>

            {formError && (
              <div className="flex items-start gap-2 rounded-xl border-2 border-[var(--color-coral)] bg-[var(--color-coral-soft)] px-3.5 py-2.5 text-sm font-medium text-[#8a2e1b]">
                <TriangleAlert size={16} className="mt-0.5 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full items-center justify-center gap-2 rounded-full border-2 border-[var(--color-ink)] bg-[var(--color-primary)] px-4 py-2.5 font-display text-sm font-bold text-white shadow-[var(--shadow-pop-sm)] transition-transform hover:-translate-y-0.5 active:translate-x-[3px] active:translate-y-[3px] active:shadow-none disabled:pointer-events-none disabled:opacity-60"
            >
              {isSubmitting && <LoaderCircle size={16} className="animate-spin" />}
              {isSubmitting ? 'Memproses...' : 'Masuk'}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-[var(--color-ink)]/40">
          Halaman ini khusus untuk admin Explore Curug Banyumas.
        </p>
      </div>
    </main>
  )
}
