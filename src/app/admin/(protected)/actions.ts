'use server'

import { createServiceClient } from '@/lib/supabase/service'
import type { ActionResult } from '@/lib/types'

export interface DashboardOverview {
  upcomingTripsCount: number
  pendingParticipantsCount: number
  publishedCurugsCount: number
  draftArticlesCount: number
}

export async function getDashboardOverview(): Promise<ActionResult<DashboardOverview>> {
  try {
    const supabase = createServiceClient()
    const today = new Date().toISOString().slice(0, 10)

    const [upcomingTrips, pendingParticipants, publishedCurugs, draftArticles] = await Promise.all([
      supabase
        .from('trips')
        .select('id', { count: 'exact', head: true })
        .gte('trip_date', today)
        .not('status', 'eq', 'cancelled'),
      supabase.from('participants').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('curugs').select('id', { count: 'exact', head: true }).eq('is_published', true),
      supabase.from('articles').select('id', { count: 'exact', head: true }).eq('is_published', false),
    ])

    if (upcomingTrips.error) throw upcomingTrips.error
    if (pendingParticipants.error) throw pendingParticipants.error
    if (publishedCurugs.error) throw publishedCurugs.error
    if (draftArticles.error) throw draftArticles.error

    return {
      success: true,
      data: {
        upcomingTripsCount: upcomingTrips.count ?? 0,
        pendingParticipantsCount: pendingParticipants.count ?? 0,
        publishedCurugsCount: publishedCurugs.count ?? 0,
        draftArticlesCount: draftArticles.count ?? 0,
      },
    }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Gagal mengambil ringkasan dashboard',
    }
  }
}