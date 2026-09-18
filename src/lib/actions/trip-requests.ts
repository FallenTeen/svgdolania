'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createServiceClient } from '@/lib/supabase/service'
import { createClient } from '@/lib/supabase/server'
import type { ActionResult, Curug, TripRequest, TripRequestWithCurugs } from '@/lib/types'

const requestSchema = z.object({
  contact_name: z.string().trim().min(1, 'Nama wajib diisi'),
  contact_phone: z.string().trim().min(8, 'Nomor WhatsApp minimal 8 digit'),
  contact_email: z.union([z.string().email('Format email tidak valid'), z.literal('')]).optional(),
  trip_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Tanggal tidak valid'),
  total_people: z.coerce.number().int().min(1, 'Minimal 1 orang').max(20, 'Maksimal 20 orang'),
  member_names: z.array(z.string().trim().min(1, 'Nama peserta wajib diisi')),
  notes: z.string().trim().max(2000, 'Catatan terlalu panjang').optional(),
  curug_ids: z.array(z.string().uuid()).min(1, 'Pilih minimal satu curug'),
}).refine((data) => data.member_names.length === data.total_people, {
  message: 'Jumlah nama peserta harus sama dengan jumlah orang',
  path: ['member_names'],
})

function parseFormData(formData: FormData) {
  const parseJson = <T,>(key: string, fallback: T): T => {
    try {
      const raw = formData.get(key)
      return raw ? JSON.parse(String(raw)) : fallback
    } catch {
      return fallback
    }
  }

  return requestSchema.parse({
    contact_name: formData.get('contact_name'),
    contact_phone: formData.get('contact_phone'),
    contact_email: formData.get('contact_email') || '',
    trip_date: formData.get('trip_date'),
    total_people: formData.get('total_people'),
    member_names: parseJson<string[]>('member_names', []),
    notes: formData.get('notes') || '',
    curug_ids: parseJson<string[]>('curug_ids', []),
  })
}

export async function createTripRequest(
  formData: FormData
): Promise<ActionResult<TripRequest & { whatsappLink: string }>> {
  try {
    const parsed = parseFormData(formData)
    const selectedDate = new Date(`${parsed.trip_date}T00:00:00`)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    if (Number.isNaN(selectedDate.getTime()) || selectedDate < today) {
      return { success: false, error: 'Tanggal trip harus hari ini atau setelahnya.' }
    }

    const supabase = createServiceClient()
    const authClient = await createClient()
    const { data: { user } } = await authClient.auth.getUser()

    if (!user) {
      return { success: false, error: 'Silakan login terlebih dahulu untuk mengirim request trip.' }
    }

    const { data: curugs, error: curugError } = await supabase
      .from('curugs')
      .select('id')
      .in('id', parsed.curug_ids)
      .eq('is_published', true)
    if (curugError) throw curugError
    if ((curugs ?? []).length !== parsed.curug_ids.length) {
      return { success: false, error: 'Ada curug yang tidak tersedia. Silakan pilih ulang.' }
    }

    const { data: request, error } = await supabase
      .from('trip_requests')
      .insert({
        user_id: user.id,
        contact_name: parsed.contact_name,
        contact_phone: parsed.contact_phone,
        contact_email: parsed.contact_email || null,
        trip_date: parsed.trip_date,
        total_people: parsed.total_people,
        member_names: parsed.member_names,
        notes: parsed.notes || null,
        status: 'pending',
      })
      .select()
      .single()
    if (error) throw error

    const { error: pivotError } = await supabase
      .from('trip_request_curugs')
      .insert(parsed.curug_ids.map((curug_id) => ({ request_id: request.id, curug_id })))
    if (pivotError) throw pivotError

    const adminNumber = process.env.NEXT_PUBLIC_ADMIN_WHATSAPP_NUMBER
    const whatsappLink = adminNumber
      ? `https://wa.me/${adminNumber.replace(/\D/g, '')}?text=${encodeURIComponent(
          `Halo Admin, saya baru mengirim request trip untuk ${parsed.trip_date}. Nama: ${parsed.contact_name}. Jumlah: ${parsed.total_people} orang. Mohon konfirmasi request saya.`
        )}`
      : ''

    revalidatePath('/admin/trip-requests')
    return { success: true, data: { ...(request as TripRequest), whatsappLink } }
  } catch (err) {
    if (err instanceof z.ZodError) {
      return { success: false, error: err.issues.map((e) => e.message).join(', ') }
    }
    return { success: false, error: err instanceof Error ? err.message : 'Gagal mengirim request trip' }
  }
}


export async function getMyTripRequests(): Promise<ActionResult<TripRequestWithCurugs[]>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Silakan login terlebih dahulu.' }
    }

    const { data, error } = await supabase
      .from('trip_requests')
      .select(`
        *,
        trip_request_curugs (
          curugs (id, name, slug)
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) throw error

    const requests: TripRequestWithCurugs[] = (data ?? []).map((row) => ({
      ...(row as unknown as TripRequest),
      curugs: (row.trip_request_curugs ?? [])
        .map((item: { curugs: Pick<Curug, 'id' | 'name' | 'slug'> | Pick<Curug, 'id' | 'name' | 'slug'>[] | null }) =>
          Array.isArray(item.curugs) ? item.curugs[0] : item.curugs
        )
        .filter(Boolean) as Pick<Curug, 'id' | 'name' | 'slug'>[],
    }))

    return { success: true, data: requests }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Gagal memuat request trip' }
  }
}
