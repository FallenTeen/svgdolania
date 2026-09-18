'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createServiceClient } from '@/lib/supabase/service'
import { slugify } from '@/lib/slugify'
import type { ActionResult, Trip, TripWithCurugs } from '@/lib/types'

const tripSchema = z.object({
  title: z.string().min(1, 'Judul trip wajib diisi'),
  description: z.string().optional().nullable(),
  itinerary: z.string().optional().nullable(),
  trip_type: z.enum(['public', 'private']),
  trip_date: z.string().refine((val) => {
    const date = new Date(val)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return date >= today
  }, 'Tanggal trip tidak boleh di masa lalu'),
  meeting_point: z.string().optional().nullable(),
  meeting_time: z.string().optional().nullable(),
  price_per_person: z.coerce.number().nonnegative('Harga tidak boleh negatif'),
  max_participants: z.coerce.number().int().positive('Kuota harus lebih dari 0'),
  terms_and_conditions: z.string().optional().nullable(),
  cover_image_url: z.string().optional().nullable(),
})

function parseTripFormData(formData: FormData) {
  const raw: Record<string, unknown> = {}
  for (const [key, value] of formData.entries()) {
    if (key !== 'curug_ids') raw[key] = value
  }
  return tripSchema.parse(raw)
}

// curug_ids dikirim client sebagai JSON string array, misal
// formData.append('curug_ids', JSON.stringify(['uuid-1', 'uuid-2']))
function parseCurugIds(formData: FormData): string[] {
  const raw = formData.get('curug_ids')
  if (!raw) return []
  try {
    const ids = JSON.parse(raw as string)
    return Array.isArray(ids) ? ids : []
  } catch {
    return []
  }
}

async function generateUniqueSlug(title: string, excludeId?: string): Promise<string> {
  const supabase = createServiceClient()
  const base = slugify(title)
  let candidate = base
  let suffix = 1

  while (true) {
    let query = supabase.from('trips').select('id').eq('slug', candidate)
    if (excludeId) query = query.neq('id', excludeId)
    const { data } = await query.maybeSingle()
    if (!data) return candidate
    suffix += 1
    candidate = `${base}-${suffix}`
  }
}

function mapTripRow(row: any): TripWithCurugs {
  const approvedCount = (row.participants || [])
    .filter((p: any) => p.status === 'approved')
    .reduce((sum: number, p: any) => sum + p.total_people, 0)

  const { trip_curugs, participants, ...tripFields } = row

  return {
    ...tripFields,
    curugs: (trip_curugs || []).map((tc: any) => tc.curugs),
    approved_count: approvedCount,
    remaining_slots: Math.max(tripFields.max_participants - approvedCount, 0),
  }
}

export async function getTrips(filter?: {
  status?: string
  type?: string
}): Promise<ActionResult<TripWithCurugs[]>> {
  try {
    const supabase = createServiceClient()
    let query = supabase
      .from('trips')
      .select(
        `*, trip_curugs ( curugs ( id, name, slug ) ), participants ( total_people, status )`
      )
      .order('trip_date', { ascending: true })

    if (filter?.status) query = query.eq('status', filter.status)
    if (filter?.type) query = query.eq('trip_type', filter.type)

    const { data, error } = await query
    if (error) throw error

    return { success: true, data: (data || []).map(mapTripRow) }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Gagal mengambil data trip',
    }
  }
}

export async function getTripBySlug(slug: string): Promise<ActionResult<TripWithCurugs>> {
  try {
    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from('trips')
      .select(
        `*, trip_curugs ( curugs ( id, name, slug, cover_image_url, short_description ) ), participants ( total_people, status )`
      )
      .eq('slug', slug)
      .single()

    if (error) throw error

    return { success: true, data: mapTripRow(data) }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Trip tidak ditemukan',
    }
  }
}

export async function createTrip(formData: FormData): Promise<ActionResult<Trip>> {
  try {
    const parsed = parseTripFormData(formData)
    const curugIds = parseCurugIds(formData)
    const slug = await generateUniqueSlug(parsed.title)
    const supabase = createServiceClient()

    const { data: trip, error } = await supabase
      .from('trips')
      .insert({ ...parsed, slug, status: 'open' })
      .select()
      .single()

    if (error) throw error

    if (curugIds.length > 0) {
      const rows = curugIds.map((curugId) => ({ trip_id: trip.id, curug_id: curugId }))
      const { error: pivotError } = await supabase.from('trip_curugs').insert(rows)
      if (pivotError) throw pivotError
    }

    revalidatePath('/admin/trips')
    revalidatePath('/trips')
    return { success: true, data: trip as Trip }
  } catch (err) {
    if (err instanceof z.ZodError) {
      return { success: false, error: err.errors.map((e) => e.message).join(', ') }
    }
    return { success: false, error: err instanceof Error ? err.message : 'Gagal membuat trip' }
  }
}

export async function updateTrip(id: string, formData: FormData): Promise<ActionResult<Trip>> {
  try {
    const parsed = parseTripFormData(formData)
    const curugIds = parseCurugIds(formData)
    const supabase = createServiceClient()

    const { data: existing, error: fetchError } = await supabase
      .from('trips')
      .select('title, slug')
      .eq('id', id)
      .single()
    if (fetchError) throw fetchError

    const slug =
      existing.title !== parsed.title ? await generateUniqueSlug(parsed.title, id) : existing.slug

    const { data: trip, error } = await supabase
      .from('trips')
      .update({ ...parsed, slug, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    // Ganti relasi trip_curugs: hapus yang lama, insert ulang sesuai pilihan admin saat ini.
    const { error: deleteError } = await supabase.from('trip_curugs').delete().eq('trip_id', id)
    if (deleteError) throw deleteError

    if (curugIds.length > 0) {
      const rows = curugIds.map((curugId) => ({ trip_id: id, curug_id: curugId }))
      const { error: pivotError } = await supabase.from('trip_curugs').insert(rows)
      if (pivotError) throw pivotError
    }

    revalidatePath('/admin/trips')
    revalidatePath('/trips')
    revalidatePath(`/trips/${slug}`)
    return { success: true, data: trip as Trip }
  } catch (err) {
    if (err instanceof z.ZodError) {
      return { success: false, error: err.errors.map((e) => e.message).join(', ') }
    }
    return { success: false, error: err instanceof Error ? err.message : 'Gagal memperbarui trip' }
  }
}

export async function updateTripStatus(id: string, status: string): Promise<ActionResult> {
  try {
    const validStatuses = ['open', 'full', 'closed', 'cancelled']
    if (!validStatuses.includes(status)) {
      return { success: false, error: 'Status tidak valid' }
    }

    const supabase = createServiceClient()
    const { error } = await supabase
      .from('trips')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)

    if (error) throw error

    revalidatePath('/admin/trips')
    revalidatePath('/trips')
    return { success: true }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Gagal memperbarui status trip',
    }
  }
}

export async function deleteTrip(id: string): Promise<ActionResult> {
  try {
    const supabase = createServiceClient()
    // trip_curugs dan participants ikut terhapus otomatis lewat FK on delete cascade.
    const { error } = await supabase.from('trips').delete().eq('id', id)
    if (error) throw error

    revalidatePath('/admin/trips')
    revalidatePath('/trips')
    return { success: true }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Gagal menghapus trip' }
  }
}

/**
 * Dipanggil setiap ada participant baru yang di-approve (lihat approveParticipant
 * di src/app/trips/[slug]/actions.ts). Kalau kuota sudah penuh, trip otomatis
 * ditandai 'full'.
 */
export async function checkAndUpdateTripCapacity(tripId: string): Promise<ActionResult> {
  try {
    const supabase = createServiceClient()

    const { data: trip, error: tripError } = await supabase
      .from('trips')
      .select('max_participants, status')
      .eq('id', tripId)
      .single()
    if (tripError) throw tripError

    const { data: approved, error: participantsError } = await supabase
      .from('participants')
      .select('total_people')
      .eq('trip_id', tripId)
      .eq('status', 'approved')
    if (participantsError) throw participantsError

    const approvedTotal = (approved || []).reduce((sum, p) => sum + p.total_people, 0)

    if (approvedTotal >= trip.max_participants && trip.status === 'open') {
      const { error } = await supabase
        .from('trips')
        .update({ status: 'full', updated_at: new Date().toISOString() })
        .eq('id', tripId)
      if (error) throw error

      revalidatePath('/admin/trips')
      revalidatePath('/trips')
    }

    return { success: true }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Gagal memeriksa kapasitas trip',
    }
  }
}