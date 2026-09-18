'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'

const magicLinkSchema = z.object({
  email: z.string().email('Format email tidak valid'),
})

type MagicLinkFormValues = z.infer<typeof magicLinkSchema>

export function MagicLinkForm() {
  const [sent, setSent] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<MagicLinkFormValues>({
    resolver: zodResolver(magicLinkSchema),
  })

  const onSubmit = async (values: MagicLinkFormValues) => {
    setFormError(null)
    setIsSubmitting(true)

    const supabase = createClient()

    const { error } = await supabase.auth.signInWithOtp({
      email: values.email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    setIsSubmitting(false)

    if (error) {
      setFormError('Gagal mengirim link login, coba lagi beberapa saat.')
      return
    }

    setSent(true)
  }

  if (sent) {
    return (
      <p className="rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
        Cek email kamu untuk link login. Kalau tidak muncul dalam beberapa menit,
        cek folder spam.
      </p>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3" noValidate>
      <div>
        <label
          htmlFor="participant-email"
          className="mb-1 block text-sm font-medium text-gray-700"
        >
          Email kamu
        </label>
        <input
          id="participant-email"
          type="email"
          autoComplete="email"
          {...register('email')}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          placeholder="kamu@email.com"
        />
        {errors.email && (
          <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
        )}
      </div>

      {formError && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
          {formError}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? 'Mengirim...' : 'Kirim Link Login'}
      </button>
    </form>
  )
}

export default MagicLinkForm