'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { List, CalendarDays, ChevronLeft, ChevronRight, X } from 'lucide-react'
import { TripStatusBadge, TripTypeBadge } from '@/components/ui/Badge'
import { formatDateShort, formatCurrency } from '@/lib/format'
import { TripRowActions } from '@/components/admin/TripRowActions'
import type { TripWithCurugs } from '@/lib/types'

const MONTH_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
]
const WEEKDAY_LABELS = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']

function toDateKey(dateString: string): string {
  return dateString.slice(0, 10)
}

export function TripListCalendar({ trips }: { trips: TripWithCurugs[] }) {
  const [mode, setMode] = useState<'list' | 'calendar'>('list')

  return (
    <div>
      <div className="mb-4 inline-flex rounded-lg border border-gray-200 bg-white p-1">
        <ModeButton active={mode === 'list'} onClick={() => setMode('list')} icon={List} label="List" />
        <ModeButton active={mode === 'calendar'} onClick={() => setMode('calendar')} icon={CalendarDays} label="Kalender" />
      </div>

      {mode === 'list' ? <TripListTable trips={trips} /> : <TripCalendarView trips={trips} />}
    </div>
  )
}

function ModeButton({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean
  onClick: () => void
  icon: typeof List
  label: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
        active ? 'bg-emerald-600 text-white' : 'text-gray-500 hover:bg-gray-100'
      }`}
    >
      <Icon size={15} />
      {label}
    </button>
  )
}

function TripListTable({ trips }: { trips: TripWithCurugs[] }) {
  if (trips.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-white py-16 text-center">
        <CalendarDays size={28} className="mb-2 text-gray-300" />
        <p className="text-sm font-medium text-gray-600">Belum ada trip</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
          <tr>
            <th className="px-4 py-3 font-medium">Tanggal</th>
            <th className="px-4 py-3 font-medium">Judul</th>
            <th className="px-4 py-3 font-medium">Tipe</th>
            <th className="px-4 py-3 font-medium">Sisa Kuota</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium text-right">Aksi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {trips.map((trip) => (
            <tr key={trip.id}>
              <td className="whitespace-nowrap px-4 py-3 text-gray-600">{formatDateShort(trip.trip_date)}</td>
              <td className="px-4 py-3">
                <p className="font-medium text-gray-900">{trip.title}</p>
                <p className="text-xs text-gray-400">{formatCurrency(trip.price_per_person)} / orang</p>
              </td>
              <td className="px-4 py-3">
                {trip.trip_type === 'private' ? (
                  <TripTypeBadge type="private" />
                ) : (
                  <span className="inline-flex rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
                    Publik
                  </span>
                )}
              </td>
              <td className="px-4 py-3 text-gray-600">
                {trip.remaining_slots} / {trip.max_participants}
              </td>
              <td className="px-4 py-3">
                <TripStatusBadge status={trip.status} />
              </td>
              <td className="px-4 py-3 text-right">
                <TripRowActions id={trip.id} title={trip.title} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function TripCalendarView({ trips }: { trips: TripWithCurugs[] }) {
  const today = new Date()
  const [cursor, setCursor] = useState(new Date(today.getFullYear(), today.getMonth(), 1))
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  const tripsByDate = useMemo(() => {
    const map = new Map<string, TripWithCurugs[]>()
    for (const trip of trips) {
      const key = toDateKey(trip.trip_date)
      const list = map.get(key) ?? []
      list.push(trip)
      map.set(key, list)
    }
    return map
  }, [trips])

  const year = cursor.getFullYear()
  const month = cursor.getMonth()
  const firstDayOfMonth = new Date(year, month, 1)
  const startWeekday = firstDayOfMonth.getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const cells: (number | null)[] = [
    ...Array.from({ length: startWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]
  while (cells.length % 7 !== 0) cells.push(null)

  const selectedTrips = selectedDate ? (tripsByDate.get(selectedDate) ?? []) : []

  function dateKeyFor(day: number) {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  }

  const todayKey = toDateKey(today.toISOString())

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <div className="rounded-xl border border-gray-200 bg-white p-4 lg:col-span-2">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm font-semibold text-gray-900">
            {MONTH_NAMES[month]} {year}
          </p>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setCursor(new Date(year, month - 1, 1))}
              className="flex h-7 w-7 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100"
              aria-label="Bulan sebelumnya"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              type="button"
              onClick={() => setCursor(new Date(year, month + 1, 1))}
              className="flex h-7 w-7 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100"
              aria-label="Bulan berikutnya"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-px overflow-hidden rounded-lg border border-gray-100 bg-gray-100 text-center text-xs">
          {WEEKDAY_LABELS.map((label) => (
            <div key={label} className="bg-gray-50 py-2 font-medium text-gray-500">
              {label}
            </div>
          ))}
          {cells.map((day, i) => {
            if (day === null) return <div key={i} className="min-h-20 bg-white" />
            const key = dateKeyFor(day)
            const dayTrips = tripsByDate.get(key) ?? []
            const isToday = key === todayKey
            const isSelected = key === selectedDate

            return (
              <button
                type="button"
                key={i}
                onClick={() => setSelectedDate(dayTrips.length > 0 ? key : null)}
                className={`flex min-h-20 flex-col items-center gap-1 bg-white p-1.5 text-left transition-colors ${
                  isSelected ? 'ring-2 ring-inset ring-emerald-500' : ''
                } ${dayTrips.length > 0 ? 'cursor-pointer hover:bg-emerald-50' : 'cursor-default'}`}
              >
                <span
                  className={`flex h-6 w-6 items-center justify-center rounded-full text-xs ${
                    isToday ? 'bg-emerald-600 font-semibold text-white' : 'text-gray-700'
                  }`}
                >
                  {day}
                </span>
                {dayTrips.length > 0 && (
                  <span className="flex items-center gap-0.5">
                    {dayTrips.slice(0, 3).map((t) => (
                      <span
                        key={t.id}
                        className={`h-1.5 w-1.5 rounded-full ${
                          t.trip_type === 'private' ? 'bg-sky-500' : 'bg-emerald-500'
                        }`}
                      />
                    ))}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4">
        {!selectedDate ? (
          <p className="text-sm text-gray-400">Klik tanggal yang bertanda titik untuk lihat detail trip.</p>
        ) : (
          <div>
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-semibold text-gray-900">{formatDateShort(selectedDate)}</p>
              <button
                type="button"
                onClick={() => setSelectedDate(null)}
                className="flex h-6 w-6 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100"
                aria-label="Tutup"
              >
                <X size={14} />
              </button>
            </div>
            <div className="space-y-3">
              {selectedTrips.map((trip) => (
                <div key={trip.id} className="rounded-lg border border-gray-100 p-3">
                  <div className="mb-1 flex items-center gap-2">
                    <p className="text-sm font-medium text-gray-900">{trip.title}</p>
                    {trip.trip_type === 'private' && <TripTypeBadge type="private" />}
                  </div>
                  <p className="mb-2 text-xs text-gray-500">
                    Sisa {trip.remaining_slots} / {trip.max_participants} kuota
                  </p>
                  <div className="flex items-center gap-3 text-xs font-medium">
                    <Link href={`/admin/trips/${trip.id}/edit`} className="text-emerald-600 hover:underline">
                      Edit
                    </Link>
                    <Link href={`/admin/peserta?trip=${trip.id}`} className="text-emerald-600 hover:underline">
                      Lihat peserta
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}