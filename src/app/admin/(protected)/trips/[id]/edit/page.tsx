import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { createServiceClient } from '@/lib/supabase/service'
import { TripForm } from '@/components/admin/TripForm'
import type { Trip } from '@/lib/types'

type EditableTrip = Trip & { curug_ids: string[] }

async function getTripForEdit(id: string): Promise<EditableTrip | null> {
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('trips')
    .select('*, trip_curugs ( curug_id )')
    .eq('id', id)
    .single()

  if (error || !data) return null

  const { trip_curugs, ...trip } = data as any
  return { ...trip, curug_ids: (trip_curugs ?? []).map((tc: any) => tc.curug_id) }
}

async function getPublishedCurugOptions(): Promise<{ id: string; name: string }[]> {
  const supabase = createServiceClient()
  const { data } = await supabase
    .from('curugs')
    .select('id, name')
    .eq('is_published', true)
    .order('name', { ascending: true })
  return data ?? []
}

export default async function AdminTripEditPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const isNew = id === 'new'

  const [trip, curugOptions] = await Promise.all([
    isNew ? Promise.resolve(null) : getTripForEdit(id),
    getPublishedCurugOptions(),
  ])
  if (!isNew && !trip) notFound()

  return (
    <div>
      <Link
        href="/admin/trips"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-800"
      >
        <ArrowLeft size={15} />
        Kembali ke daftar trip
      </Link>
      <h1 className="mb-5 text-xl font-semibold text-gray-900">{isNew ? 'Buat Trip Baru' : 'Edit Trip'}</h1>
      <TripForm trip={trip} curugOptions={curugOptions} />
    </div>
  )
}