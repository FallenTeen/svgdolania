import Link from 'next/link'
import { MapPin, Users } from 'lucide-react'
import type { TripWithCurugs } from '@/lib/types'
import { TripStatusBadge, TripTypeBadge } from '@/components/ui/Badge'
import { formatDayMonth, formatCurrency } from '@/lib/format'

export function TripCard({ trip }: { trip: TripWithCurugs }) {
  const { day, month } = formatDayMonth(trip.trip_date)
  const quotaPct = Math.min(
    Math.round((trip.approved_count / Math.max(trip.max_participants, 1)) * 100),
    100
  )

  return (
    <Link
      href={`/trips/${trip.slug}`}
      className="group flex gap-4 overflow-hidden rounded-3xl border-2 border-[var(--color-ink)] bg-white p-4 shadow-[var(--shadow-pop)] transition-transform hover:-translate-y-1"
    >
      <div className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-2xl border-2 border-[var(--color-ink)] bg-[var(--color-sun)] font-display">
        <span className="text-xl font-extrabold leading-none">{day}</span>
        <span className="text-xs font-bold uppercase">{month}</span>
      </div>

      <div className="min-w-0 flex-1">
        <div className="mb-1 flex flex-wrap items-center gap-1.5">
          <TripStatusBadge status={trip.status} />
          <TripTypeBadge type={trip.trip_type} />
        </div>
        <h3 className="truncate font-display text-lg font-extrabold text-[var(--color-ink)] group-hover:underline">
          {trip.title}
        </h3>

        {trip.curugs.length > 0 && (
          <p className="mt-0.5 flex items-center gap-1 truncate text-sm text-[var(--color-ink)]/60">
            <MapPin size={13} className="shrink-0" />
            {trip.curugs.map((c) => c.name).join(' + ')}
          </p>
        )}

        <div className="mt-3 flex items-center justify-between">
          <span className="font-display font-extrabold text-[var(--color-primary)]">
            {formatCurrency(trip.price_per_person)}
            <span className="ml-1 text-xs font-medium text-[var(--color-ink)]/50">/orang</span>
          </span>
          <span className="flex items-center gap-1 text-xs font-semibold text-[var(--color-ink)]/60">
            <Users size={13} />
            {trip.approved_count}/{trip.max_participants}
          </span>
        </div>

        <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-[var(--color-ink)]/10">
          <div
            className="h-full rounded-full bg-[var(--color-primary)]"
            style={{ width: `${quotaPct}%` }}
          />
        </div>
      </div>
    </Link>
  )
}
