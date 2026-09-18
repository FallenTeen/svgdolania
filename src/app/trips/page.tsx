import type { Metadata } from 'next'
import { Compass } from 'lucide-react'
import { getTrips } from '@/app/admin/trips/actions'
import { TripCard } from '@/components/trip/TripCard'

export const metadata: Metadata = {
  title: 'Trip Explore Curug | Explore Curug Banyumas',
  description:
    'Jadwal trip explore curug terbuka di Banyumas — booking langsung, cek sisa kuota, dan gabung bareng rombongan lain.',
}

export default async function TripsPage() {
  const result = await getTrips({ status: 'open', type: 'public' })
  const trips = result.success && result.data ? result.data : []

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="mb-8">
        <span className="mb-2 inline-block rounded-full bg-[var(--color-sun-soft)] px-3 py-1 text-sm font-bold text-[#7a5200] font-display">
          {trips.length} trip siap dibooking
        </span>
        <h1 className="font-display text-4xl font-extrabold text-[var(--color-ink)] sm:text-5xl">
          Trip Explore Terdekat
        </h1>
        <p className="mt-2 max-w-xl text-[var(--color-ink)]/70">
          Nggak perlu repot cari teman jalan sendiri — gabung trip bareng rombongan lain, kuota
          terbatas jadi lebih rapi.
        </p>
      </div>

      {trips.length === 0 ? (
        <div className="flex flex-col items-center rounded-3xl border-2 border-dashed border-[var(--color-ink)]/30 bg-white/50 px-6 py-16 text-center">
          <Compass size={40} className="mb-4 text-[var(--color-primary)]/50" />
          <p className="font-display text-lg font-bold text-[var(--color-ink)]">
            Belum ada trip terbuka saat ini
          </p>
          <p className="mt-1 text-sm text-[var(--color-ink)]/60">
            Cek lagi beberapa hari ke depan, atau follow media sosial kami untuk info trip baru.
          </p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2">
          {trips.map((trip) => (
            <TripCard key={trip.id} trip={trip} />
          ))}
        </div>
      )}
    </div>
  )
}
