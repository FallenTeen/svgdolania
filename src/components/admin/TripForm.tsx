'use client'

import { useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Save, Search, ExternalLink } from 'lucide-react'
import { createTrip, updateTrip } from '@/app/trips/actions'
import { uploadTripImage } from '@/app/admin/(protected)/trips/actions'
import { ImageUploader } from '@/components/admin/ImageUploader'
import { CopyButton } from '@/components/admin/CopyButton'
import type { Trip } from '@/lib/types'

type EditableTrip = Trip & { curug_ids: string[] }

export function TripForm({
  trip,
  curugOptions,
}: {
  trip: EditableTrip | null
  curugOptions: { id: string; name: string }[]
}) {
  const router = useRouter()
  const isNew = !trip

  const [title, setTitle] = useState(trip?.title ?? '')
  const [description, setDescription] = useState(trip?.description ?? '')
  const [itinerary, setItinerary] = useState(trip?.itinerary ?? '')
  const [tripType, setTripType] = useState<'public' | 'private'>(trip?.trip_type ?? 'public')
  const [tripDate, setTripDate] = useState(trip?.trip_date?.slice(0, 10) ?? '')
  const [meetingTime, setMeetingTime] = useState(trip?.meeting_time?.slice(0, 5) ?? '')
  const [meetingPoint, setMeetingPoint] = useState(trip?.meeting_point ?? '')
  const [pricePerPerson, setPricePerPerson] = useState(trip?.price_per_person?.toString() ?? '0')
  const [maxParticipants, setMaxParticipants] = useState(trip?.max_participants?.toString() ?? '10')
  const [terms, setTerms] = useState(trip?.terms_and_conditions ?? '')
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(trip?.cover_image_url ?? null)
  const [selectedCurugIds, setSelectedCurugIds] = useState<string[]>(trip?.curug_ids ?? [])
  const [search, setSearch] = useState('')

  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const filteredCurugOptions = useMemo(
    () => curugOptions.filter((c) => c.name.toLowerCase().includes(search.toLowerCase())),
    [curugOptions, search]
  )

  function toggleCurug(id: string) {
    setSelectedCurugIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!title.trim()) return setError('Judul trip wajib diisi')
    if (!tripDate) return setError('Tanggal trip wajib diisi')

    const formData = new FormData()
    formData.set('title', title)
    formData.set('description', description)
    formData.set('itinerary', itinerary)
    formData.set('trip_type', tripType)
    formData.set('trip_date', tripDate)
    formData.set('meeting_time', meetingTime)
    formData.set('meeting_point', meetingPoint)
    formData.set('price_per_person', pricePerPerson)
    formData.set('max_participants', maxParticipants)
    formData.set('terms_and_conditions', terms)
    formData.set('cover_image_url', coverImageUrl ?? '')
    formData.set('curug_ids', JSON.stringify(selectedCurugIds))

    startTransition(async () => {
      const result = isNew ? await createTrip(formData) : await updateTrip(trip!.id, formData)
      if (!result.success || !result.data) {
        setError(result.error ?? 'Gagal menyimpan trip')
        return
      }
      // Redirect ke halaman edit trip (bukan list) supaya admin langsung lihat
      // link preview & tombol copy link (khusus trip privat).
      router.push(`/admin/trips/${result.data.id}/edit`)
      router.refresh()
    })
  }

  const previewUrl = trip ? `/trips/${trip.slug}` : null

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-3xl space-y-6">
      {previewUrl && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-gray-200 bg-white p-4">
          <div>
            <p className="text-sm font-medium text-gray-900">Link halaman publik trip ini</p>
            <a
              href={previewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-emerald-600 hover:underline"
            >
              {previewUrl} <ExternalLink size={12} />
            </a>
          </div>
          {trip!.trip_type === 'private' && (
            <CopyButton
              value={typeof window !== 'undefined' ? `${window.location.origin}${previewUrl}` : previewUrl}
              label="Copy Link Trip"
            />
          )}
        </div>
      )}

      <Section title="Detail Trip">
        <Field label="Judul trip">
          <input value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} placeholder="Explore Curug Cipendok" />
        </Field>
        <Field label="Deskripsi">
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className={inputClass} />
        </Field>
        <Field label="Itinerary">
          <textarea value={itinerary} onChange={(e) => setItinerary(e.target.value)} rows={4} className={inputClass} placeholder="07.00 Kumpul di titik meeting point&#10;08.00 Berangkat trekking..." />
        </Field>
      </Section>

      <Section title="Jadwal">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Tanggal trip">
            <input type="date" value={tripDate} onChange={(e) => setTripDate(e.target.value)} className={inputClass} />
          </Field>
          <Field label="Jam kumpul">
            <input type="time" value={meetingTime} onChange={(e) => setMeetingTime(e.target.value)} className={inputClass} />
          </Field>
        </div>
        <Field label="Titik kumpul">
          <input value={meetingPoint} onChange={(e) => setMeetingPoint(e.target.value)} className={inputClass} />
        </Field>
      </Section>

      <Section title="Harga & Kuota">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Harga per orang (Rp)">
            <input type="number" min={0} value={pricePerPerson} onChange={(e) => setPricePerPerson(e.target.value)} className={inputClass} />
          </Field>
          <Field label="Kuota maksimal">
            <input type="number" min={1} value={maxParticipants} onChange={(e) => setMaxParticipants(e.target.value)} className={inputClass} />
          </Field>
        </div>
      </Section>

      <Section title="Tipe Trip">
        <div className="space-y-2">
          <RadioOption
            checked={tripType === 'public'}
            onChange={() => setTripType('public')}
            title="Publik"
            description="Tampil di katalog trip dan bisa dibooking siapa saja."
          />
          <RadioOption
            checked={tripType === 'private'}
            onChange={() => setTripType('private')}
            title="Privat"
            description="Tidak tampil di katalog. Hanya bisa diakses lewat link yang kamu bagikan manual."
          />
        </div>
      </Section>

      <Section title="Curug Tujuan">
        <div className="relative">
          <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari curug..."
            className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>
        <div className="max-h-56 space-y-1 overflow-y-auto rounded-lg border border-gray-200 p-2">
          {filteredCurugOptions.length === 0 && (
            <p className="px-2 py-1 text-sm text-gray-400">Tidak ada curug ditemukan</p>
          )}
          {filteredCurugOptions.map((c) => (
            <label key={c.id} className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-gray-50">
              <input
                type="checkbox"
                checked={selectedCurugIds.includes(c.id)}
                onChange={() => toggleCurug(c.id)}
                className="h-3.5 w-3.5 accent-emerald-600"
              />
              {c.name}
            </label>
          ))}
        </div>
        <p className="text-xs text-gray-400">{selectedCurugIds.length} curug dipilih (bisa lebih dari satu untuk trip combo)</p>
      </Section>

      <Section title="Syarat & Ketentuan">
        <textarea value={terms} onChange={(e) => setTerms(e.target.value)} rows={3} className={inputClass} />
      </Section>

      <Section title="Cover Image">
        <ImageUploader label="Cover Image" value={coverImageUrl} onChange={setCoverImageUrl} uploadAction={uploadTripImage} />
      </Section>

      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

      <div className="flex justify-end border-t border-gray-100 pt-4">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
        >
          {isPending ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
          {isNew ? 'Simpan Trip' : 'Simpan Perubahan'}
        </button>
      </div>
    </form>
  )
}

const inputClass =
  'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500'

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-4 rounded-xl border border-gray-200 bg-white p-5">
      <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
      {children}
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>
      {children}
    </div>
  )
}

function RadioOption({
  checked,
  onChange,
  title,
  description,
}: {
  checked: boolean
  onChange: () => void
  title: string
  description: string
}) {
  return (
    <label
      className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors ${
        checked ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 hover:bg-gray-50'
      }`}
    >
      <input type="radio" checked={checked} onChange={onChange} className="mt-1 h-4 w-4 accent-emerald-600" />
      <span>
        <span className="block text-sm font-medium text-gray-900">{title}</span>
        <span className="block text-xs text-gray-500">{description}</span>
      </span>
    </label>
  )
}