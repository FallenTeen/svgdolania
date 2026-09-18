import Link from 'next/link'
import { CalendarDays, ChevronRight, MapPin, Users } from 'lucide-react'

import { getTripRequests } from './actions'

function formatDate(date: string) {
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(`${date}T00:00:00`))
}

function statusLabel(status: string) {
  switch (status) {
    case 'pending':
      return 'Menunggu'
    case 'approved':
      return 'Disetujui'
    case 'rejected':
      return 'Ditolak'
    default:
      return status
  }
}

function statusClass(status: string) {
  switch (status) {
    case 'pending':
      return 'bg-amber-50 text-amber-700'
    case 'approved':
      return 'bg-emerald-50 text-emerald-700'
    case 'rejected':
      return 'bg-red-50 text-red-700'
    default:
      return 'bg-gray-100 text-gray-700'
  }
}

export default async function TripRequestsPage() {
  const result = await getTripRequests()

  if (!result.success) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-5">
        <h1 className="font-semibold text-red-800">
          Gagal mengambil request trip
        </h1>
        <p className="mt-1 text-sm text-red-700">
          {result.error}
        </p>
      </div>
    )
  }

  const requests = result.data ?? []

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">
          Request Trip
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Kelola permintaan tanggal trip dari calon peserta.
        </p>
      </div>

      {requests.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white px-5 py-12 text-center">
          <CalendarDays
            size={32}
            className="mx-auto text-gray-400"
          />
          <h2 className="mt-3 font-medium text-gray-900">
            Belum ada request trip
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Request dari peserta akan muncul di halaman ini.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map((request) => (
            <Link
              key={request.id}
              href={`/admin/trip-requests/${request.id}/approve`}
              className="block rounded-xl border border-gray-200 bg-white p-4 transition hover:border-gray-300 hover:shadow-sm sm:p-5"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-semibold text-gray-900">
                      {request.contact_name}
                    </h2>

                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusClass(
                        request.status
                      )}`}
                    >
                      {statusLabel(request.status)}
                    </span>
                  </div>

                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2 text-sm text-gray-500">
                    <span className="inline-flex items-center gap-1.5">
                      <CalendarDays size={15} />
                      {formatDate(request.trip_date)}
                    </span>

                    <span className="inline-flex items-center gap-1.5">
                      <Users size={15} />
                      {request.total_people} orang
                    </span>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {request.curugs.map((curug) => (
                      <span
                        key={curug.id}
                        className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700"
                      >
                        <MapPin size={12} />
                        {curug.name}
                      </span>
                    ))}
                  </div>

                  {request.contact_phone && (
                    <p className="mt-3 text-xs text-gray-400">
                      {request.contact_phone}
                      {request.contact_email
                        ? ` · ${request.contact_email}`
                        : ''}
                    </p>
                  )}
                </div>

                <ChevronRight
                  size={20}
                  className="shrink-0 text-gray-400"
                />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}