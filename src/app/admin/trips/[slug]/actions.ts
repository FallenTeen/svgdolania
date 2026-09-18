'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createServiceClient } from '@/lib/supabase/service'
import { createClient } from '@/lib/supabase/server'
import { checkAndUpdateTripCapacity } from '@/app/admin/trips/actions'
import { generateAdminApprovalLink } from '@/lib/whatsapp'
import type { ActionResult, Participant, Trip } from '@/lib/types'

const bookingSchema = z
  .object({
    contact_name: z.string().min(1, 'Nama wajib diisi'),
    contact_phone: z.string().min(8, 'Nomor WhatsApp wajib diisi'),
    contact_email: z.union([z.string().email(), z.literal('')]).optional(),
    total_people: z.coerce.number().int().min(1, 'Minimal 1 orang'),
    member_names: z.array(z.string().min(1)),
    notes: z.string().optional().nullable(),
  })
  .refine((data) => data.member_names.length === data.total_people, {
    message: 'Jumlah nama peserta harus sama dengan jumlah orang',
    path: ['member_names'],
  })

// member_names dikirim client sebagai JSON string array, misal
// formData.append('member_names', JSON.stringify(['Andi', 'Budi']))
function parseBookingFormData(formData: FormData) {
  const memberNamesRaw = formData.get('member_names')
  let memberNames: string[] = []
  try {
    memberNames = memberNamesRaw ? JSON.parse(memberNamesRaw as string) : []
  } catch {
    memberNames = []
  }

  return bookingSchema.parse({
    contact_name: formData.get('contact_name'),
    contact_phone: formData.get('contact_phone'),
    contact_email: formData.get('contact_email') || '',
    total_people: formData.get('total_people'),
    member_names: memberNames,
    notes: formData.get('notes') || null,
  })
}

export async function submitBooking(
  tripId: string,
  formData: FormData
): Promise<ActionResult<{ participant: Participant; whatsappLink: string }>> {
  try {
    const parsed = parseBookingFormData(formData)
    const serviceClient = createServiceClient()

    const { data: trip, error: tripError } = await serviceClient
      .from('trips')
      .select('*')
      .eq('id', tripId)
      .single()
    if (tripError || !trip) throw new Error('Trip tidak ditemukan')

    // Cek status login dari session milik request ini sendiri (anon-key client,
    // ikut cookies), BUKAN service client.
    const authedClient = await createClient()
    const {
      data: { user },
    } = await authedClient.auth.getUser()

    const isGuest = !user
    const userId = user?.id ?? null

    if ((trip as Trip).trip_type === 'private' && isGuest) {
      return {
        success: false,
        error: 'Trip ini bersifat privat. Silakan login atau daftar dulu sebelum booking.',
      }
    }

    // RPC atomic (lihat supabase/migrations/0003_booking_transaction.sql): mengunci
    // row trip, menghitung ulang kuota approved, lalu insert participant dengan
    // status 'pending' atau 'waitlist' — semuanya dalam satu transaksi.
    const { data: rpcResult, error: rpcError } = await serviceClient.rpc('book_trip_participant', {
      p_trip_id: tripId,
      p_user_id: userId,
      p_contact_name: parsed.contact_name,
      p_contact_phone: parsed.contact_phone,
      p_contact_email: parsed.contact_email || null,
      p_total_people: parsed.total_people,
      p_member_names: parsed.member_names,
      p_is_guest: isGuest,
      p_private_trip_access_confirmed: false,
      p_notes: parsed.notes || null,
    })

    if (rpcError) throw rpcError

    const inserted = Array.isArray(rpcResult) ? rpcResult[0] : rpcResult

    const { data: participant, error: fetchError } = await serviceClient
      .from('participants')
      .select('*')
      .eq('id', inserted.id)
      .single()
    if (fetchError) throw fetchError

    const whatsappLink = generateAdminApprovalLink(participant as Participant, trip as Trip)

    revalidatePath(`/trips/${(trip as Trip).slug}`)
    revalidatePath('/admin/peserta')

    return {
      success: true,
      data: { participant: participant as Participant, whatsappLink },
      ...(participant.status === 'waitlist'
        ? { error: 'Trip sudah mendekati penuh, kamu masuk waiting list' }
        : {}),
    }
  } catch (err) {
    if (err instanceof z.ZodError) {
      return { success: false, error: err.errors.map((e) => e.message).join(', ') }
    }
    return { success: false, error: err instanceof Error ? err.message : 'Gagal mengirim booking' }
  }
}

export async function getParticipantsByTrip(tripId: string): Promise<ActionResult<Participant[]>> {
  try {
    const supabase = createServiceClient()
    const { data, error } = await supabase.from('participants').select('*').eq('trip_id', tripId)

    if (error) throw error

    const statusOrder: Record<string, number> = { approved: 0, pending: 1, waitlist: 2, rejected: 3 }
    const sorted = (data as Participant[]).sort((a, b) => statusOrder[a.status] - statusOrder[b.status])

    return { success: true, data: sorted }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Gagal mengambil data peserta',
    }
  }
}

export async function approveParticipant(id: string): Promise<ActionResult> {
  try {
    const supabase = createServiceClient()

    const { data: participant, error } = await supabase
      .from('participants')
      .update({ status: 'approved', updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    await checkAndUpdateTripCapacity(participant.trip_id)

    revalidatePath('/admin/peserta')
    return { success: true }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Gagal menyetujui peserta' }
  }
}

export async function rejectParticipant(id: string): Promise<ActionResult> {
  try {
    const supabase = createServiceClient()
    const { error } = await supabase
      .from('participants')
      .update({ status: 'rejected', updated_at: new Date().toISOString() })
      .eq('id', id)

    if (error) throw error

    revalidatePath('/admin/peserta')
    return { success: true }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Gagal menolak peserta' }
  }
}

export async function promoteFromWaitlist(id: string): Promise<ActionResult> {
  try {
    const supabase = createServiceClient()
    const { error } = await supabase
      .from('participants')
      .update({ status: 'pending', updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('status', 'waitlist')

    if (error) throw error

    revalidatePath('/admin/peserta')
    return { success: true }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Gagal mempromosikan peserta dari waitlist',
    }
  }
}