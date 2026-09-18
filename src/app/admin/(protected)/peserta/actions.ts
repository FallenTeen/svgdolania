'use server'

import { createServiceClient } from '@/lib/supabase/service'
import type { ActionResult, Participant, Trip } from '@/lib/types'

export interface PendingParticipantRow {
  participant: Participant
  trip: Pick<Trip, 'id' | 'title' | 'slug' | 'trip_date'>
}

/**
 * Semua peserta berstatus 'pending' lintas trip, diurutkan dari trip terdekat.
 * Dipakai sebagai default view halaman /admin/peserta supaya admin langsung
 * melihat apa yang butuh action tanpa harus pilih trip dulu.
 */
export async function getAllPendingParticipants(): Promise<ActionResult<PendingParticipantRow[]>> {
  try {
    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from('participants')
      .select('*, trips ( id, title, slug, trip_date )')
      .eq('status', 'pending')
      .order('created_at', { ascending: true })

    if (error) throw error

    const rows: PendingParticipantRow[] = (data as any[])
      .filter((row) => row.trips)
      .map((row) => {
        const { trips, ...participant } = row
        return { participant: participant as Participant, trip: trips }
      })
      .sort(
        (a, b) => new Date(a.trip.trip_date).getTime() - new Date(b.trip.trip_date).getTime()
      )

    return { success: true, data: rows }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Gagal mengambil data peserta pending',
    }
  }
}

/** Daftar trip ringkas (id, title, tanggal) untuk dropdown filter di halaman peserta. */
export async function getTripsLite(): Promise<
  ActionResult<Pick<Trip, 'id' | 'title' | 'slug' | 'trip_date' | 'trip_type'>[]>
> {
  try {
    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from('trips')
      .select('id, title, slug, trip_date, trip_type')
      .order('trip_date', { ascending: false })

    if (error) throw error
    return { success: true, data: data as any }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Gagal mengambil data trip' }
  }
}