import Link from 'next/link'
import { Plus } from 'lucide-react'
import { getTrips } from '@/lib/actions/trips'
import { TripListCalendar } from '@/components/admin/TripListCalendar'

export default async function AdminTripsPage() {
  const result = await getTrips()
  const trips = result.success && result.data ? result.data : []

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Trip & Availability</h1>
          <p className="mt-1 text-sm text-gray-500">Kelola jadwal trip dan kuota peserta.</p>
        </div>
        <Link
          href="/admin/trips/new/edit"
          className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
        >
          <Plus size={16} />
          Buat Trip Baru
        </Link>
      </div>

      {!result.success && (
        <p className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{result.error}</p>
      )}

      <TripListCalendar trips={trips} />
    </div>
  )
}