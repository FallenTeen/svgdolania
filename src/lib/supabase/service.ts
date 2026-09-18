import { createClient } from '@supabase/supabase-js'

/**
 * Supabase client yang memakai SERVICE ROLE KEY dan melewati (bypass) Row Level Security.
 *
 * PENTING:
 * - Hanya boleh dipanggil dari Server Action / Route Handler ("use server").
 * - JANGAN PERNAH di-import di Client Component atau file yang bisa ter-bundle ke browser.
 * - Dipakai di sini karena operasi admin (CRUD curug/trip, approve peserta, dll)
 *   perlu bebas dari RLS policy yang membatasi user biasa.
 */
export function createServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceKey) {
    throw new Error(
      'Missing Supabase service role environment variables (NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY)'
    )
  }

  return createClient(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}