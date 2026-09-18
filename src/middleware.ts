import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  const { supabaseResponse, user, supabase } = await updateSession(request)

  const { pathname } = request.nextUrl
  const isAdminRoute = pathname.startsWith('/admin')
  const isLoginRoute = pathname === '/admin/login'

  // Belum login & mengakses halaman admin selain /admin/login -> lempar ke login
  if (isAdminRoute && !isLoginRoute && !user) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/admin/login'
    redirectUrl.search = ''
    return NextResponse.redirect(redirectUrl)
  }

  // Sudah login (dan memang admin) tapi membuka /admin/login lagi -> lempar balik ke dashboard.
  // Ini penyebab bug "diminta login lagi" sebelumnya: halaman /admin/login selalu
  // tampil apa adanya tanpa pernah mengecek sesi yang sudah ada.
  // Role tetap dicek di sini (bukan cuma cek `user`) supaya akun peserta biasa yang
  // login lewat magic link di halaman publik tidak ikut ke-redirect ke dashboard admin
  // lalu dilempar balik ke /admin/login oleh layout admin -> infinite redirect loop.
  if (isLoginRoute && user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role === 'admin') {
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = '/admin'
      redirectUrl.search = ''
      return NextResponse.redirect(redirectUrl)
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}