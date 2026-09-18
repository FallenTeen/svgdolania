'use client'

import { useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Save, Search } from 'lucide-react'
import { approveTripRequest } from '@/app/admin/(protected)/trip-requests/actions'
import type { TripRequestWithCurugs } from '@/lib/types'
import { ImageUploader } from '@/components/admin/ImageUploader'
import { uploadTripImage } from '@/app/admin/(protected)/trips/actions'

export function TripRequestApprovalForm({ request, curugOptions }: { request: TripRequestWithCurugs; curugOptions: { id: string; name: string }[] }) {
  const router = useRouter()
  const [title, setTitle] = useState(`Explore ${request.curugs.map((c) => c.name).join(' + ')}`)
  const [description, setDescription] = useState('')
  const [itinerary, setItinerary] = useState('')
  const [tripType, setTripType] = useState<'public' | 'private'>('public')
  const [tripDate, setTripDate] = useState(request.trip_date.slice(0, 10))
  const [meetingTime, setMeetingTime] = useState('')
  const [meetingPoint, setMeetingPoint] = useState('')
  const [price, setPrice] = useState('0')
  const [maxParticipants, setMaxParticipants] = useState(String(Math.max(request.total_people, 10)))
  const [terms, setTerms] = useState('')
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null)
  const [selectedCurugIds, setSelectedCurugIds] = useState<string[]>(request.curugs.map((c) => c.id))
  const [search, setSearch] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const filtered = useMemo(() => curugOptions.filter((c) => c.name.toLowerCase().includes(search.toLowerCase())), [curugOptions, search])

  function toggle(id: string) { setSelectedCurugIds((current) => current.includes(id) ? current.filter((x) => x !== id) : [...current, id]) }
  function submit(e: React.FormEvent) {
    e.preventDefault(); setError(null)
    if (!title.trim()) return setError('Judul trip wajib diisi')
    if (!tripDate) return setError('Tanggal trip wajib diisi')
    if (selectedCurugIds.length === 0) return setError('Pilih minimal satu curug')
    if (Number(maxParticipants) < request.total_people) return setError(`Kuota minimal ${request.total_people} orang karena requester otomatis menjadi peserta pertama.`)
    const fd = new FormData()
    fd.set('title', title); fd.set('description', description); fd.set('itinerary', itinerary); fd.set('trip_type', tripType); fd.set('trip_date', tripDate); fd.set('meeting_time', meetingTime); fd.set('meeting_point', meetingPoint); fd.set('price_per_person', price); fd.set('max_participants', maxParticipants); fd.set('terms_and_conditions', terms); fd.set('cover_image_url', coverImageUrl ?? ''); fd.set('curug_ids', JSON.stringify(selectedCurugIds))
    startTransition(async () => {
      const result = await approveTripRequest(request.id, fd)
      if (!result.success || !result.data) { setError(result.error ?? 'Gagal membuat trip dari request'); return }
      router.push(`/admin/trips/${result.data.id}/edit`)
      router.refresh()
    })
  }

  return <form onSubmit={submit} className="mx-auto max-w-3xl space-y-6">
    <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"><strong>Draft dari request:</strong> tanggal, jumlah peserta, kontak requester, dan curug tujuan sudah dibawa dari request. Saat disetujui, requester otomatis menjadi peserta pertama dengan status approved.</div>
    <Section title="Detail Trip"><Field label="Judul trip"><input value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} /></Field><Field label="Deskripsi"><textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className={inputClass} /></Field><Field label="Itinerary"><textarea value={itinerary} onChange={(e) => setItinerary(e.target.value)} rows={4} className={inputClass} placeholder="07.00 Kumpul..." /></Field></Section>
    <Section title="Jadwal"><div className="grid gap-4 sm:grid-cols-2"><Field label="Tanggal trip"><input type="date" value={tripDate} onChange={(e) => setTripDate(e.target.value)} className={inputClass} /></Field><Field label="Jam kumpul"><input type="time" value={meetingTime} onChange={(e) => setMeetingTime(e.target.value)} className={inputClass} /></Field></div><Field label="Titik kumpul"><input value={meetingPoint} onChange={(e) => setMeetingPoint(e.target.value)} className={inputClass} /></Field></Section>
    <Section title="Harga & Kuota"><div className="grid gap-4 sm:grid-cols-2"><Field label="Harga per orang (Rp)"><input type="number" min={0} value={price} onChange={(e) => setPrice(e.target.value)} className={inputClass} /></Field><Field label="Kuota maksimal"><input type="number" min={request.total_people} value={maxParticipants} onChange={(e) => setMaxParticipants(e.target.value)} className={inputClass} /></Field></div></Section>
    <Section title="Tipe Trip"><div className="space-y-2"><Radio checked={tripType === 'public'} onChange={() => setTripType('public')} title="Publik" desc="Tampil di katalog trip." /><Radio checked={tripType === 'private'} onChange={() => setTripType('private')} title="Privat" desc="Hanya diakses melalui link." /></div></Section>
    <Section title="Curug Tujuan"><div className="relative"><Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari curug..." className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm" /></div><div className="mt-2 max-h-56 space-y-1 overflow-y-auto rounded-lg border border-gray-200 p-2">{filtered.map((c) => <label key={c.id} className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-gray-50"><input type="checkbox" checked={selectedCurugIds.includes(c.id)} onChange={() => toggle(c.id)} />{c.name}</label>)}</div></Section>
    <Section title="Syarat & Ketentuan"><textarea value={terms} onChange={(e) => setTerms(e.target.value)} rows={3} className={inputClass} /></Section>
    <Section title="Cover Image"><ImageUploader label="Cover Image" value={coverImageUrl} onChange={setCoverImageUrl} uploadAction={uploadTripImage} /></Section>
    {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
    <button type="submit" disabled={isPending} className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60">{isPending ? <><Loader2 size={17} className="animate-spin" /> Membuat trip...</> : <><Save size={17} /> Approve & Buat Trip</>}</button>
  </form>
}

function Section({ title, children }: { title: string; children: React.ReactNode }) { return <section className="space-y-4 rounded-xl border border-gray-200 bg-white p-4 sm:p-5"><h2 className="text-sm font-semibold text-gray-900">{title}</h2>{children}</section> }
function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="block"><span className="mb-1 block text-sm font-medium text-gray-700">{label}</span>{children}</label> }
function Radio({ checked, onChange, title, desc }: { checked: boolean; onChange: () => void; title: string; desc: string }) { return <label className="flex cursor-pointer gap-3 rounded-lg border border-gray-200 p-3"><input type="radio" checked={checked} onChange={onChange} /> <span><span className="block text-sm font-medium text-gray-900">{title}</span><span className="text-xs text-gray-500">{desc}</span></span></label> }
const inputClass = 'w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500'
