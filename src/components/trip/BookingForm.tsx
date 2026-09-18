'use client'

import { useEffect, useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, MessageCircle, Minus, Plus, ShieldCheck, PartyPopper } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { submitBooking } from '@/app/trips/[slug]/actions'
import { Button } from '@/components/ui/Button'
import type { TripWithCurugs } from '@/lib/types'

const bookingSchema = z.object({
  contact_name: z.string().min(1, 'Nama wajib diisi'),
  contact_phone: z.string().min(8, 'Nomor WhatsApp minimal 8 digit'),
  contact_email: z.union([z.string().email('Format email tidak valid'), z.literal('')]).optional(),
  total_people: z.coerce.number().int().min(1, 'Minimal 1 orang').max(20, 'Maksimal 20 orang sekali booking'),
  member_names: z.array(z.object({ name: z.string().min(1, 'Nama peserta wajib diisi') })),
  notes: z.string().optional(),
})
type BookingFormInput = z.input<typeof bookingSchema>
type BookingFormValues = z.output<typeof bookingSchema>

type SubmitState =
  | { status: 'idle' }
  | { status: 'success'; participantStatus: string; whatsappLink: string }
  | { status: 'error'; message: string }


export function BookingForm({ trip }: { trip: TripWithCurugs }) {
  const isFull = trip.status === 'full' || trip.remaining_slots <= 0
  const [profile, setProfile] = useState<{ name: string; phone: string; email: string } | null>(null)
  const [checkingSession, setCheckingSession] = useState(true)
  const [submitState, setSubmitState] = useState<SubmitState>({ status: 'idle' })
  const [isSubmitting, setIsSubmitting] = useState(false)

const {
  register,
  control,
  handleSubmit,
  watch,
  setValue,
  formState: { errors },
} = useForm<BookingFormInput, unknown, BookingFormValues>({
  resolver: zodResolver(bookingSchema),
  defaultValues: {
    contact_name: '',
    contact_phone: '',
    contact_email: '',
    total_people: 1,
    member_names: [{ name: '' }],
    notes: '',
  },
})

  const { fields, append, remove } = useFieldArray({ control, name: 'member_names' })
  const totalPeople = watch('total_people')

  // Sinkronkan jumlah field nama peserta dengan input "jumlah orang"
  useEffect(() => {
    const n = Math.max(1, Math.min(20, Number(totalPeople) || 1))
    if (n > fields.length) {
      for (let i = fields.length; i < n; i++) append({ name: '' })
    } else if (n < fields.length) {
      for (let i = fields.length - 1; i >= n; i--) remove(i)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalPeople])

  // Cek sesi login untuk auto-fill nama & kontak dari profil
  useEffect(() => {
    let active = true
    async function loadSession() {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user || !active) {
        if (active) setCheckingSession(false)
        return
      }

      const { data: profileRow } = await supabase
        .from('profiles')
        .select('full_name, phone')
        .eq('id', user.id)
        .maybeSingle()

      if (!active) return
      const name = profileRow?.full_name ?? ''
      const phone = profileRow?.phone ?? ''
      const email = user.email ?? ''

      setProfile({ name, phone, email })
      if (name) setValue('contact_name', name)
      if (phone) setValue('contact_phone', phone)
      if (email) setValue('contact_email', email)
      setCheckingSession(false)
    }
    loadSession()
    return () => {
      active = false
    }
  }, [setValue])

  const onSubmit = async (values: BookingFormValues) => {
    setIsSubmitting(true)
    setSubmitState({ status: 'idle' })

    const formData = new FormData()
    formData.append('contact_name', values.contact_name)
    formData.append('contact_phone', values.contact_phone)
    formData.append('contact_email', values.contact_email ?? '')
    formData.append('total_people', String(values.total_people))
    formData.append('member_names', JSON.stringify(values.member_names.map((m) => m.name)))
    formData.append('notes', values.notes ?? '')

    const result = await submitBooking(trip.id, formData)
    setIsSubmitting(false)

    if (!result.success || !result.data) {
      setSubmitState({ status: 'error', message: result.error ?? 'Booking gagal, coba lagi ya.' })
      return
    }

    setSubmitState({
      status: 'success',
      participantStatus: result.data.participant.status,
      whatsappLink: result.data.whatsappLink,
    })
  }

  if (submitState.status === 'success') {
    return <BookingSuccess trip={trip} state={submitState} />
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="rounded-3xl border-2 border-[var(--color-ink)] bg-white p-5 shadow-[var(--shadow-pop)] sm:p-6"
    >
      <div className="mb-5 flex items-center justify-between">
        <h3 className="font-display text-xl font-extrabold">
          {isFull ? 'Daftar Waiting List' : 'Form Booking'}
        </h3>
        {profile && !checkingSession && (
          <span className="flex items-center gap-1 rounded-full bg-[var(--color-primary-soft)] px-3 py-1 text-xs font-bold text-[var(--color-primary-dark)]">
            <ShieldCheck size={13} />
            {profile.name || 'Member'} (Member)
          </span>
        )}
      </div>

      {isFull && (
        <div className="mb-5 rounded-2xl border-2 border-[var(--color-coral)] bg-[var(--color-coral-soft)] px-4 py-3 text-sm font-semibold text-[#8a2e1b]">
          Trip sudah penuh, kamu akan masuk waiting list dan dihubungi admin kalau ada slot kosong.
        </div>
      )}

      {!checkingSession && !profile && (
        <p className="mb-5 text-sm text-[var(--color-ink)]/60">
          Sudah pernah booking?{' '}
          <a
            href={`/masuk?redirect=/trips/${trip.slug}`}
            className="font-bold text-[var(--color-primary)] underline underline-offset-2"
          >
            Login untuk isi otomatis
          </a>
          , atau lanjut isi manual di bawah ini.
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Nama pemesan" error={errors.contact_name?.message}>
          <input {...register('contact_name')} className={inputClass(!!errors.contact_name)} placeholder="Nama lengkap" />
        </Field>

        <Field label="Nomor WhatsApp" error={errors.contact_phone?.message}>
          <input
            {...register('contact_phone')}
            className={inputClass(!!errors.contact_phone)}
            placeholder="08xxxxxxxxxx"
            inputMode="tel"
          />
        </Field>

        <Field label="Email (opsional)" error={errors.contact_email?.message}>
          <input {...register('contact_email')} className={inputClass(!!errors.contact_email)} placeholder="nama@email.com" />
        </Field>

        <Field label="Jumlah orang" error={errors.total_people?.message}>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setValue('total_people', Math.max(1, Number(totalPeople) - 1))}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border-2 border-[var(--color-ink)]"
              aria-label="Kurangi jumlah orang"
            >
              <Minus size={16} />
            </button>
            <input
              type="number"
              min={1}
              max={20}
              {...register('total_people')}
              className={`${inputClass(!!errors.total_people)} text-center`}
            />
            <button
              type="button"
              onClick={() => setValue('total_people', Math.min(20, Number(totalPeople) + 1))}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border-2 border-[var(--color-ink)]"
              aria-label="Tambah jumlah orang"
            >
              <Plus size={16} />
            </button>
          </div>
        </Field>
      </div>

      <div className="mt-4 space-y-2">
        <p className="text-sm font-bold text-[var(--color-ink)]/70">Nama peserta</p>
        {fields.map((field, i) => (
          <Field key={field.id} error={errors.member_names?.[i]?.name?.message}>
            <input
              {...register(`member_names.${i}.name` as const)}
              className={inputClass(!!errors.member_names?.[i]?.name)}
              placeholder={`Nama peserta ${i + 1}`}
            />
          </Field>
        ))}
      </div>

      <div className="mt-4">
        <Field label="Catatan tambahan (opsional)">
          <textarea
            {...register('notes')}
            rows={3}
            className={inputClass(false)}
            placeholder="Contoh: bawa anak kecil, request mobil depan, dll."
          />
        </Field>
      </div>

      {submitState.status === 'error' && (
        <p className="mt-4 rounded-2xl bg-[var(--color-coral-soft)] px-4 py-3 text-sm font-semibold text-[#8a2e1b]">
          {submitState.message}
        </p>
      )}

      <Button type="submit" variant={isFull ? 'sun' : 'primary'} size="lg" disabled={isSubmitting} className="mt-5 w-full">
        {isSubmitting && <Loader2 size={18} className="animate-spin" />}
        {isSubmitting ? 'Mengirim...' : isFull ? 'Daftar Waiting List' : 'Kirim Booking'}
      </Button>
    </form>
  )
}

function BookingSuccess({
  trip,
  state,
}: {
  trip: TripWithCurugs
  state: Extract<SubmitState, { status: 'success' }>
}) {
  const isWaitlist = state.participantStatus === 'waitlist'
  return (
    <div className="rounded-3xl border-2 border-[var(--color-ink)] bg-white p-6 text-center shadow-[var(--shadow-pop)]">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border-2 border-[var(--color-ink)] bg-[var(--color-sun)]">
        <PartyPopper size={24} />
      </div>
      <h3 className="font-display text-xl font-extrabold">
        {isWaitlist ? 'Kamu masuk waiting list!' : 'Booking berhasil dikirim!'}
      </h3>
      <p className="mx-auto mt-2 max-w-sm text-sm text-[var(--color-ink)]/70">
        {isWaitlist
          ? `Trip "${trip.title}" sedang mendekati penuh. Kami akan kabari lewat WhatsApp kalau ada slot kosong.`
          : `Booking kamu untuk "${trip.title}" sedang menunggu konfirmasi admin. Biar lebih cepat diproses, langsung kirim ringkasan booking ke admin lewat WhatsApp ya.`}
      </p>
      <a
        href={state.whatsappLink}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-5 inline-flex items-center justify-center gap-2 rounded-full border-2 border-[var(--color-ink)] bg-[var(--color-whatsapp)] px-6 py-3 font-display font-bold text-white shadow-[var(--shadow-pop-sm)] transition-transform hover:-translate-y-0.5 active:translate-x-[3px] active:translate-y-[3px] active:shadow-none"
      >
        <MessageCircle size={18} />
        Konfirmasi via WhatsApp
      </a>
    </div>
  )
}

function Field({
  label,
  error,
  children,
}: {
  label?: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <label className="block">
      {label && <span className="mb-1 block text-sm font-bold text-[var(--color-ink)]/70">{label}</span>}
      {children}
      {error && <span className="mt-1 block text-xs font-semibold text-[var(--color-coral)]">{error}</span>}
    </label>
  )
}

function inputClass(hasError: boolean) {
  return `w-full rounded-xl border-2 bg-white px-3.5 py-2.5 text-sm font-medium outline-none focus:ring-2 focus:ring-[var(--color-primary)] ${
    hasError ? 'border-[var(--color-coral)]' : 'border-[var(--color-ink)]/20'
  }`
}
