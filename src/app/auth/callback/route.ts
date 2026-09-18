import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/riwayat'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Kalau exchange code gagal (link kadaluarsa/sudah dipakai), balik ke home
  // dengan query param sederhana supaya UI bisa tampilkan pesan error.
  return NextResponse.redirect(`${origin}/?auth_error=1`)
}