import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

const STATUS_LABEL: Record<string, string> = {
  pending: 'Menunggu Konfirmasi',
  approved: 'Terkonfirmasi',
  rejected: 'Ditolak',
  waitlist: 'Waiting List',
}

const STATUS_COLOR: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  approved: 'bg-emerald-100 text-emerald-700',
  rejected: 'bg-red-100 text-red-700',
  waitlist: 'bg-gray-100 text-gray-700',
}

export default async function RiwayatPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/')
  }

  const { data: participations, error } = await supabase
    .from('participants')
    .select(
      `
      id,
      total_people,
      status,
      created_at,
      trips (
        id,
        title,
        slug,
        trip_date,
        meeting_point,
        cover_image_url
      )
    `
    )
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-semibold text-gray-900">Riwayat Trip Kamu</h1>

      {error && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
          Gagal memuat riwayat trip. Coba refresh halaman ini.
        </p>
      )}

      {!error && (!participations || participations.length === 0) && (
        <p className="text-sm text-gray-500">
          Kamu belum pernah mendaftar trip apa pun. Yuk explore curug dulu!
        </p>
      )}

      <ul className="space-y-4">
        {participations?.map((p) => {
          const trip = Array.isArray(p.trips) ? p.trips[0] : p.trips
          if (!trip) return null

          return (
            <li key={p.id} className="rounded-xl border border-gray-200 p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-medium text-gray-900">{trip.title}</h2>
                  <p className="text-sm text-gray-500">
                    {new Date(trip.trip_date).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}{' '}
                    · {trip.meeting_point}
                  </p>
                  <p className="mt-1 text-sm text-gray-500">{p.total_people} orang</p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${
                    STATUS_COLOR[p.status] ?? 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {STATUS_LABEL[p.status] ?? p.status}
                </span>
              </div>
            </li>
          )
        })}
      </ul>
    </main>
  )
}