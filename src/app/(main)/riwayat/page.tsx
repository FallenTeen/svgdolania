import Link from 'next/link'
import { redirect } from 'next/navigation'
import { CalendarClock, CheckCircle2, Clock3, ExternalLink, XCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'

const STATUS_LABEL: Record<string, string> = {
  pending: 'Menunggu Konfirmasi',
  approved: 'Disetujui',
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

  if (!user) redirect('/masuk?redirect=/riwayat')

  const [{ data: participations, error: participationError }, { data: requests, error: requestError }] =
    await Promise.all([
      supabase
        .from('participants')
        .select(`
          id,
          total_people,
          status,
          created_at,
          trips (id, title, slug, trip_date, meeting_point, cover_image_url)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false }),
      supabase
        .from('trip_requests')
        .select(`
          id,
          trip_date,
          total_people,
          member_names,
          notes,
          status,
          admin_notes,
          approved_trip_id,
          created_at,
          trip_request_curugs (curugs (id, name, slug))
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false }),
    ])

  const approvedTripIds = (requests ?? [])
    .map((request) => request.approved_trip_id)
    .filter((id): id is string => Boolean(id))

  const { data: approvedTrips } = approvedTripIds.length
    ? await supabase.from('trips').select('id, title, slug').in('id', approvedTripIds)
    : { data: [] as { id: string; title: string; slug: string }[] }

  const approvedTripMap = new Map((approvedTrips ?? []).map((trip) => [trip.id, trip]))

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <p className="text-sm font-bold text-[var(--color-primary)]">Akun kamu</p>
        <h1 className="mt-1 font-display text-3xl font-extrabold text-[var(--color-ink)]">Riwayat Trip</h1>
        <p className="mt-2 text-sm text-[var(--color-ink)]/65">
          Pantau request tanggal yang kamu kirim dan status pendaftaran trip kamu.
        </p>
      </div>

      <section>
        <div className="mb-4 flex items-center gap-2">
          <CalendarClock size={20} />
          <h2 className="font-display text-xl font-extrabold">Request tanggal trip</h2>
        </div>

        {requestError && (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
            Gagal memuat request tanggal. Coba refresh halaman ini.
          </p>
        )}

        {!requestError && (!requests || requests.length === 0) && (
          <div className="rounded-2xl border-2 border-dashed border-[var(--color-ink)]/15 bg-white px-5 py-8 text-center text-sm text-[var(--color-ink)]/60">
            Belum ada request tanggal. Kamu bisa membuat request dari kalender di halaman utama.
          </div>
        )}

        <ul className="space-y-4">
          {requests?.map((request) => {
            const destinations = (request.trip_request_curugs ?? [])
              .map((item: { curugs: { id: string; name: string; slug: string } | { id: string; name: string; slug: string }[] | null }) =>
                Array.isArray(item.curugs) ? item.curugs[0] : item.curugs
              )
              .filter(Boolean)

            return (
              <li key={request.id} className="rounded-2xl border-2 border-[var(--color-ink)]/10 bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-[var(--color-ink)]/45">Tanggal yang diminta</p>
                    <h3 className="mt-1 font-display text-xl font-extrabold capitalize">
                      {new Date(`${request.trip_date}T00:00:00`).toLocaleDateString('id-ID', {
                        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
                      })}
                    </h3>
                    <p className="mt-1 text-sm text-[var(--color-ink)]/65">{request.total_people} orang</p>
                    {destinations.length > 0 && (
                      <p className="mt-2 text-sm font-semibold text-[var(--color-ink)]">
                        Curug: {destinations.map((curug) => curug?.name).filter(Boolean).join(', ')}
                      </p>
                    )}
                  </div>
                  <span className={`inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${STATUS_COLOR[request.status] ?? 'bg-gray-100 text-gray-700'}`}>
                    {request.status === 'pending' && <Clock3 size={13} />}
                    {request.status === 'approved' && <CheckCircle2 size={13} />}
                    {request.status === 'rejected' && <XCircle size={13} />}
                    {STATUS_LABEL[request.status] ?? request.status}
                  </span>
                </div>

                {request.status === 'pending' && (
                  <p className="mt-4 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
                    Request sedang dicek admin. Setelah disetujui, request ini akan dibuat menjadi trip dan kamu otomatis menjadi peserta pertama.
                  </p>
                )}

                {request.status === 'rejected' && request.admin_notes && (
                  <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
                    <strong>Catatan admin:</strong> {request.admin_notes}
                  </p>
                )}

                {request.status === 'approved' && request.approved_trip_id && approvedTripMap.get(request.approved_trip_id) && (
                  <Link
                    href={`/trips/${approvedTripMap.get(request.approved_trip_id)!.slug}`}
                    className="mt-4 inline-flex items-center gap-2 rounded-xl border-2 border-[var(--color-ink)] bg-[var(--color-sun)] px-4 py-2 text-sm font-bold shadow-[var(--shadow-pop-sm)]"
                  >
                    Lihat trip yang dibuat <ExternalLink size={15} />
                  </Link>
                )}
              </li>
            )
          })}
        </ul>
      </section>

      <section className="mt-12">
        <div className="mb-4 flex items-center gap-2">
          <CheckCircle2 size={20} />
          <h2 className="font-display text-xl font-extrabold">Trip yang kamu ikuti</h2>
        </div>

        {participationError && (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
            Gagal memuat riwayat trip. Coba refresh halaman ini.
          </p>
        )}

        {!participationError && (!participations || participations.length === 0) && (
          <p className="text-sm text-[var(--color-ink)]/60">Belum ada pendaftaran trip.</p>
        )}

        <ul className="space-y-4">
          {participations?.map((p) => {
            const trip = Array.isArray(p.trips) ? p.trips[0] : p.trips
            if (!trip) return null

            return (
              <li key={p.id} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-medium text-gray-900">{trip.title}</h3>
                    <p className="text-sm text-gray-500">
                      {new Date(trip.trip_date).toLocaleDateString('id-ID', {
                        day: 'numeric', month: 'long', year: 'numeric',
                      })}{' '}
                      · {trip.meeting_point}
                    </p>
                    <p className="mt-1 text-sm text-gray-500">{p.total_people} orang</p>
                  </div>
                  <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${STATUS_COLOR[p.status] ?? 'bg-gray-100 text-gray-700'}`}>
                    {STATUS_LABEL[p.status] ?? p.status}
                  </span>
                </div>
              </li>
            )
          })}
        </ul>
      </section>
    </main>
  )
}
