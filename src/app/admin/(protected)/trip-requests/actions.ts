'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createServiceClient } from '@/lib/supabase/service'
import { createClient } from '@/lib/supabase/server'
import { slugify } from '@/lib/slugify'
import type { ActionResult, Trip, TripRequestWithCurugs } from '@/lib/types'

async function requireAdmin() {
  const client = await createClient()
  const { data: { user } } = await client.auth.getUser()
  if (!user) throw new Error('UNAUTHORIZED')

  const { data: profile } = await client.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') throw new Error('FORBIDDEN')
}

export async function getTripRequests(): Promise<ActionResult<TripRequestWithCurugs[]>> {
  try {
    await requireAdmin()
    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from('trip_requests')
      .select(`*, trip_request_curugs ( curugs ( id, name, slug ) )`)
      .order('trip_date', { ascending: true })
      .order('created_at', { ascending: true })
    if (error) throw error

    const rows = (data ?? []).map((row: any) => {
      const { trip_request_curugs, ...request } = row
      return {
        ...request,
        curugs: (trip_request_curugs ?? []).map((item: any) => item.curugs).filter(Boolean),
      } as TripRequestWithCurugs
    })

    return { success: true, data: rows }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Gagal mengambil request trip' }
  }
}

export async function getTripRequestById(id: string): Promise<ActionResult<TripRequestWithCurugs>> {
  try {
    await requireAdmin()
    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from('trip_requests')
      .select(`*, trip_request_curugs ( curugs ( id, name, slug ) )`)
      .eq('id', id)
      .single()
    if (error || !data) throw error ?? new Error('Request tidak ditemukan')

    const { trip_request_curugs, ...request } = data as any
    return {
      success: true,
      data: {
        ...request,
        curugs: (trip_request_curugs ?? []).map((item: any) => item.curugs).filter(Boolean),
      } as TripRequestWithCurugs,
    }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Request tidak ditemukan' }
  }
}

const approvalSchema = z.object({
  title: z.string().trim().min(1, 'Judul trip wajib diisi'),
  description: z.string().optional(),
  itinerary: z.string().optional(),
  trip_type: z.enum(['public', 'private']),
  trip_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  meeting_point: z.string().optional(),
  meeting_time: z.string().optional(),
  price_per_person: z.coerce.number().int().min(0),
  max_participants: z.coerce.number().int().min(1),
  terms_and_conditions: z.string().optional(),
  cover_image_url: z.string().optional(),
  curug_ids: z.array(z.string().uuid()).min(1, 'Pilih minimal satu curug'),
})

async function uniqueSlug(title: string) {
  const supabase = createServiceClient()
  const base = slugify(title) || `trip-${Date.now()}`
  let candidate = base
  let suffix = 1
  while (true) {
    const { data } = await supabase.from('trips').select('id').eq('slug', candidate).maybeSingle()
    if (!data) return candidate
    suffix += 1
    candidate = `${base}-${suffix}`
  }
}

function parseApprovalForm(formData: FormData) {
  let curugIds: string[] = []
  try {
    curugIds = JSON.parse(String(formData.get('curug_ids') ?? '[]'))
  } catch {
    curugIds = []
  }

  return approvalSchema.parse({
    title: formData.get('title'),
    description: formData.get('description') ?? '',
    itinerary: formData.get('itinerary') ?? '',
    trip_type: formData.get('trip_type'),
    trip_date: formData.get('trip_date'),
    meeting_point: formData.get('meeting_point') ?? '',
    meeting_time: formData.get('meeting_time') ?? '',
    price_per_person: formData.get('price_per_person'),
    max_participants: formData.get('max_participants'),
    terms_and_conditions: formData.get('terms_and_conditions') ?? '',
    cover_image_url: formData.get('cover_image_url') ?? '',
    curug_ids: curugIds,
  })
}

export async function approveTripRequest(
  requestId: string,
  formData: FormData
): Promise<ActionResult<Trip>> {
  try {
    await requireAdmin()
    const parsed = parseApprovalForm(formData)
    const supabase = createServiceClient()

    const { data: request, error: requestError } = await supabase
      .from('trip_requests')
      .select('status, total_people, trip_date')
      .eq('id', requestId)
      .single()
    if (requestError || !request) throw requestError ?? new Error('Request tidak ditemukan')
    if (request.status !== 'pending') return { success: false, error: 'Request ini sudah diproses.' }
    if (parsed.max_participants < request.total_people) {
      return { success: false, error: `Kuota minimal ${request.total_people} orang karena requester otomatis menjadi peserta pertama.` }
    }

    const { data: validCurugs, error: curugError } = await supabase
      .from('curugs')
      .select('id')
      .in('id', parsed.curug_ids)
      .eq('is_published', true)
    if (curugError) throw curugError
    if ((validCurugs ?? []).length !== parsed.curug_ids.length) {
      return { success: false, error: 'Ada curug yang sudah tidak tersedia. Silakan pilih ulang.' }
    }

    const slug = await uniqueSlug(parsed.title)
    const { data: tripId, error: rpcError } = await supabase.rpc('approve_trip_request', {
      p_request_id: requestId,
      p_title: parsed.title,
      p_slug: slug,
      p_description: parsed.description ?? '',
      p_itinerary: parsed.itinerary ?? '',
      p_trip_type: parsed.trip_type,
      p_trip_date: parsed.trip_date,
      p_meeting_point: parsed.meeting_point ?? '',
      p_meeting_time: parsed.meeting_time || null,
      p_price_per_person: parsed.price_per_person,
      p_max_participants: parsed.max_participants,
      p_terms_and_conditions: parsed.terms_and_conditions ?? '',
      p_cover_image_url: parsed.cover_image_url ?? '',
      p_curug_ids: parsed.curug_ids,
    })
    if (rpcError) throw rpcError

    const { data: trip, error: tripError } = await supabase.from('trips').select('*').eq('id', tripId).single()
    if (tripError || !trip) throw tripError ?? new Error('Trip berhasil dibuat tetapi detail tidak ditemukan')

    revalidatePath('/admin/trip-requests')
    revalidatePath('/admin/trips')
    revalidatePath('/admin/peserta')
    revalidatePath('/trips')
    revalidatePath('/')
    return { success: true, data: trip as Trip }
  } catch (err) {
    if (err instanceof z.ZodError) return { success: false, error: err.issues.map((e) => e.message).join(', ') }
    return { success: false, error: err instanceof Error ? err.message : 'Gagal menyetujui request' }
  }
}

export async function rejectTripRequest(requestId: string, adminNotes = ''): Promise<ActionResult> {
  try {
    await requireAdmin()
    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from('trip_requests')
      .update({ status: 'rejected', admin_notes: adminNotes || null, updated_at: new Date().toISOString() })
      .eq('id', requestId)
      .eq('status', 'pending')
      .select('id')
      .maybeSingle()
    if (error) throw error
    if (!data) return { success: false, error: 'Request tidak ditemukan atau sudah diproses.' }

    revalidatePath('/admin/trip-requests')
    return { success: true }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Gagal menolak request' }
  }
}
