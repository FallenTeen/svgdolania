'use client'

import { useRouter } from 'next/navigation'
import { formatDateShort } from '@/lib/format'

interface TripLite {
  id: string
  title: string
  trip_date: string
}

export function TripFilterSelect({
  trips,
  activeTripId,
}: {
  trips: TripLite[]
  activeTripId?: string
}) {
  const router = useRouter()

  return (
    <select
      value={activeTripId ?? ''}
      onChange={(e) => {
        const value = e.target.value
        router.push(value ? `/admin/peserta?trip=${value}` : '/admin/peserta')
      }}
      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 sm:w-72"
    >
      <option value="">Semua peserta pending</option>
      {trips.map((trip) => (
        <option key={trip.id} value={trip.id}>
          {trip.title} — {formatDateShort(trip.trip_date)}
        </option>
      ))}
    </select>
  )
}