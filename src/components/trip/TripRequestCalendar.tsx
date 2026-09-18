'use client'

import { useEffect, useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { addMonths, eachDayOfInterval, endOfMonth, endOfWeek, format, isBefore, isSameDay, isSameMonth, startOfDay, startOfMonth, startOfWeek, subMonths } from 'date-fns'
import { id as idLocale } from 'date-fns/locale'
import { CalendarDays, ChevronLeft, ChevronRight, Loader2, MessageCircle, Minus, Plus, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { createTripRequest } from '@/lib/actions/trip-requests'
import { Button } from '@/components/ui/Button'
import type { Curug } from '@/lib/types'

const schema = z.object({
  contact_name: z.string().min(1, 'Nama wajib diisi'),
  contact_phone: z.string().min(8, 'Nomor WhatsApp minimal 8 digit'),
  contact_email: z.union([z.string().email('Format email tidak valid'), z.literal('')]).optional(),
  total_people: z.coerce.number().int().min(1).max(20),
  member_names: z.array(z.object({ name: z.string().min(1, 'Nama wajib diisi') })),
  notes: z.string().max(2000).optional(),
}).refine((data) => data.member_names.length === data.total_people, {
  message: 'Jumlah nama peserta harus sama dengan jumlah orang', path: ['member_names'],
})

type Values = z.output<typeof schema>

export function TripRequestCalendar({ curugs, initialDate }: { curugs: Curug[]; initialDate?: string }) {
  const router = useRouter()
  const [month, setMonth] = useState(() => startOfMonth(new Date()))
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [open, setOpen] = useState(false)
  const [selectedCurugIds, setSelectedCurugIds] = useState<string[]>([])
  const [profile, setProfile] = useState<{ name: string; phone: string; email: string } | null>(null)
  const [success, setSuccess] = useState<{ whatsappLink: string } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const { register, control, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<z.input<typeof schema>, unknown, Values>({
    resolver: zodResolver(schema),
    defaultValues: { contact_name: '', contact_phone: '', contact_email: '', total_people: 1, member_names: [{ name: '' }], notes: '' },
  })
  const { fields, append, remove } = useFieldArray({ control, name: 'member_names' })
  const totalPeople = watch('total_people')

  useEffect(() => {
    if (!initialDate) return
    const parsedDate = new Date(`${initialDate}T00:00:00`)
    if (Number.isNaN(parsedDate.getTime())) return
    const now = new Date()
    if (isBefore(parsedDate, startOfDay(now))) return
    setSelectedDate(parsedDate)
    setMonth(startOfMonth(parsedDate))
    setOpen(true)
    router.replace('/', { scroll: false })
  }, [initialDate, router])

  useEffect(() => {
    const n = Math.max(1, Math.min(20, Number(totalPeople) || 1))
    if (n > fields.length) for (let i = fields.length; i < n; i++) append({ name: '' })
    if (n < fields.length) for (let i = fields.length - 1; i >= n; i--) remove(i)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalPeople])

  useEffect(() => {
    let active = true
    async function loadProfile() {
      const client = createClient()
      const { data: { user } } = await client.auth.getUser()
      if (!user || !active) return
      const { data } = await client.from('profiles').select('full_name, phone').eq('id', user.id).maybeSingle()
      if (!active) return
      setProfile({ name: data?.full_name ?? '', phone: data?.phone ?? '', email: user.email ?? '' })
      if (data?.full_name) setValue('contact_name', data.full_name)
      if (data?.phone) setValue('contact_phone', data.phone)
      if (user.email) setValue('contact_email', user.email)
    }
    loadProfile()
    return () => { active = false }
  }, [setValue])

  const days = useMemo(() => eachDayOfInterval({ start: startOfWeek(startOfMonth(month), { weekStartsOn: 1 }), end: endOfWeek(endOfMonth(month), { weekStartsOn: 1 }) }), [month])
  const today = new Date()

  async function chooseDate(day: Date) {
    if (isBefore(day, startOfDay(today))) return

    const client = createClient()
    const { data: { user } } = await client.auth.getUser()

    if (!user) {
      const next = `/?requestDate=${format(day, 'yyyy-MM-dd')}`
      router.push(`/masuk?redirect=${encodeURIComponent(next)}`)
      return
    }

    setSelectedDate(day)
    setOpen(true)
    setSuccess(null)
    setError(null)
  }

  function toggleCurug(id: string) {
    setSelectedCurugIds((current) => current.includes(id) ? current.filter((x) => x !== id) : [...current, id])
  }

  function onSubmit(values: Values) {
    if (!selectedDate) return
    if (selectedCurugIds.length === 0) { setError('Pilih minimal satu curug tujuan.'); return }
    setError(null)
    const formData = new FormData()
    formData.set('trip_date', format(selectedDate, 'yyyy-MM-dd'))
    formData.set('contact_name', values.contact_name)
    formData.set('contact_phone', values.contact_phone)
    formData.set('contact_email', values.contact_email ?? '')
    formData.set('total_people', String(values.total_people))
    formData.set('member_names', JSON.stringify(values.member_names.map((item) => item.name)))
    formData.set('notes', values.notes ?? '')
    formData.set('curug_ids', JSON.stringify(selectedCurugIds))

    startTransition(async () => {
      const result = await createTripRequest(formData)
      if (!result.success || !result.data) { setError(result.error ?? 'Request gagal dikirim.'); return }
      setSuccess({ whatsappLink: result.data.whatsappLink })
    })
  }

  return (
    <section className="border-t-2 border-[var(--color-ink)] bg-[var(--color-bg)] py-14 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-sun-soft)] px-3 py-1 text-sm font-bold text-[#7a5200]">Request tanggal trip</span>
          <h2 className="mt-3 font-display text-3xl font-extrabold sm:text-4xl">Belum ada trip di tanggalmu?</h2>
          <p className="mt-2 text-[var(--color-ink)]/70">Pilih tanggal yang kamu inginkan, tentukan curug tujuan, lalu kirim request. Admin akan mengecek dan membuat trip setelah disetujui.</p>
          <p className="mt-2 text-sm font-semibold text-[var(--color-primary)]">Login diperlukan untuk mengirim request agar status request bisa kamu pantau.</p>
        </div>

        <div className="mx-auto mt-8 max-w-3xl rounded-3xl border-2 border-[var(--color-ink)] bg-white p-4 shadow-[var(--shadow-pop)] sm:p-6">
          <div className="mb-4 flex items-center justify-between">
            <button type="button" onClick={() => setMonth((m) => subMonths(m, 1))} className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[var(--color-ink)]" aria-label="Bulan sebelumnya"><ChevronLeft size={18} /></button>
            <div className="text-center"><p className="font-display text-lg font-extrabold capitalize">{format(month, 'MMMM yyyy', { locale: idLocale })}</p><p className="text-xs text-[var(--color-ink)]/50">Klik tanggal untuk membuat request</p></div>
            <button type="button" onClick={() => setMonth((m) => addMonths(m, 1))} className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[var(--color-ink)]" aria-label="Bulan berikutnya"><ChevronRight size={18} /></button>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-[var(--color-ink)]/50">
            {['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'].map((day) => <div key={day} className="py-2">{day}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {days.map((day) => {
              const past = isBefore(day, startOfDay(today))
              const outside = !isSameMonth(day, month)
              const selected = selectedDate && isSameDay(day, selectedDate)
              return <button key={day.toISOString()} type="button" disabled={past} onClick={() => chooseDate(day)} className={`min-h-11 rounded-xl border-2 px-1 text-sm font-bold transition ${outside ? 'opacity-25' : ''} ${past ? 'cursor-not-allowed opacity-20' : 'hover:-translate-y-0.5'} ${selected ? 'border-[var(--color-ink)] bg-[var(--color-sun)]' : 'border-transparent hover:border-[var(--color-ink)]/20'}`}>{format(day, 'd')}</button>
            })}
          </div>
        </div>

        {open && selectedDate && (
          <div className="mx-auto mt-6 max-w-3xl rounded-3xl border-2 border-[var(--color-ink)] bg-[var(--color-primary-soft)] p-5 shadow-[var(--shadow-pop)] sm:p-6">
            <div className="mb-5 flex items-start justify-between gap-3">
              <div><p className="text-xs font-bold uppercase tracking-wide text-[var(--color-primary)]">Request untuk</p><h3 className="font-display text-2xl font-extrabold capitalize">{format(selectedDate, 'EEEE, d MMMM yyyy', { locale: idLocale })}</h3></div>
              <button type="button" onClick={() => setOpen(false)} className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-[var(--color-ink)] bg-white" aria-label="Tutup"><X size={16} /></button>
            </div>

            {success ? (
              <div className="rounded-2xl border-2 border-[var(--color-ink)] bg-white p-5 text-center">
                <CalendarDays className="mx-auto mb-3" size={30} />
                <h4 className="font-display text-xl font-extrabold">Request berhasil dikirim</h4>
                <p className="mx-auto mt-2 max-w-md text-sm text-[var(--color-ink)]/70">Admin akan mengecek tanggal dan tujuanmu. Kamu bisa mempercepat konfirmasi dengan mengirim pesan ke WhatsApp admin.</p>
                {success.whatsappLink && <a href={success.whatsappLink} target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex items-center gap-2 rounded-full border-2 border-[var(--color-ink)] bg-[var(--color-whatsapp)] px-5 py-3 font-display font-bold text-white shadow-[var(--shadow-pop-sm)]"><MessageCircle size={18} /> Konfirmasi via WhatsApp</a>}
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div>
                  <p className="mb-2 text-sm font-bold">Curug tujuan <span className="font-normal text-[var(--color-ink)]/50">(bisa lebih dari satu)</span></p>
                  <div className="grid max-h-52 gap-2 overflow-y-auto sm:grid-cols-2">
                    {curugs.map((curug) => <label key={curug.id} className={`flex cursor-pointer items-center gap-2 rounded-xl border-2 px-3 py-2.5 text-sm font-semibold ${selectedCurugIds.includes(curug.id) ? 'border-[var(--color-ink)] bg-white' : 'border-[var(--color-ink)]/10 bg-white/60'}`}><input type="checkbox" checked={selectedCurugIds.includes(curug.id)} onChange={() => toggleCurug(curug.id)} className="h-4 w-4" />{curug.name}</label>)}
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Nama pemesan" error={errors.contact_name?.message}><input {...register('contact_name')} className={inputClass} placeholder="Nama lengkap" /></Field>
                  <Field label="Nomor WhatsApp" error={errors.contact_phone?.message}><input {...register('contact_phone')} className={inputClass} placeholder="08xxxxxxxxxx" inputMode="tel" /></Field>
                  <Field label="Email (opsional)" error={errors.contact_email?.message}><input {...register('contact_email')} className={inputClass} placeholder="nama@email.com" /></Field>
                  <Field label="Jumlah orang" error={errors.total_people?.message}><div className="flex items-center gap-2"><button type="button" onClick={() => setValue('total_people', Math.max(1, Number(totalPeople) - 1))} className="flex h-11 w-11 items-center justify-center rounded-xl border-2 border-[var(--color-ink)] bg-white"><Minus size={16} /></button><input type="number" min={1} max={20} {...register('total_people')} className={`${inputClass} text-center`} /><button type="button" onClick={() => setValue('total_people', Math.min(20, Number(totalPeople) + 1))} className="flex h-11 w-11 items-center justify-center rounded-xl border-2 border-[var(--color-ink)] bg-white"><Plus size={16} /></button></div></Field>
                </div>
                <div className="space-y-2"><p className="text-sm font-bold">Nama peserta</p>{fields.map((field, index) => <Field key={field.id} error={errors.member_names?.[index]?.name?.message}><input {...register(`member_names.${index}.name`)} className={inputClass} placeholder={`Nama peserta ${index + 1}`} /></Field>)}</div>
                <Field label="Catatan tambahan (opsional)"><textarea {...register('notes')} rows={3} className={inputClass} placeholder="Contoh: request jam berangkat, kebutuhan khusus, dll." /></Field>
                {profile && <p className="text-xs font-semibold text-[var(--color-primary-dark)]">Data akun terisi otomatis. Kamu tetap bisa mengubahnya sebelum mengirim.</p>}
                {error && <p className="rounded-xl bg-[var(--color-coral-soft)] px-4 py-3 text-sm font-semibold text-[#8a2e1b]">{error}</p>}
                <Button type="submit" size="lg" disabled={isPending} className="w-full">{isPending && <Loader2 size={18} className="animate-spin" />}{isPending ? 'Mengirim request...' : 'Kirim Request Tanggal'}</Button>
              </form>
            )}
          </div>
        )}
      </div>
    </section>
  )
}

function Field({ label, error, children }: { label?: string; error?: string; children: React.ReactNode }) {
  return <label className="block">{label && <span className="mb-1 block text-sm font-bold text-[var(--color-ink)]/70">{label}</span>}{children}{error && <span className="mt-1 block text-xs font-semibold text-[var(--color-coral)]">{error}</span>}</label>
}

const inputClass = 'w-full rounded-xl border-2 border-[var(--color-ink)]/15 bg-white px-3.5 py-2.5 text-sm font-medium outline-none focus:border-[var(--color-ink)] focus:ring-2 focus:ring-[var(--color-primary)]'
