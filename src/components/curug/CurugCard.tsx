import Link from 'next/link'
import { Clock, Ticket, MapPin } from 'lucide-react'
import type { Curug } from '@/lib/types'
import { DifficultyBadge } from '@/components/ui/Badge'
import { formatDuration, formatCurrency } from '@/lib/format'

export function CurugCard({ curug }: { curug: Curug }) {
  return (
    <Link
      href={`/curugs/${curug.slug}`}
      className="group block overflow-hidden rounded-3xl border-2 border-[var(--color-ink)] bg-[var(--color-card)] shadow-[var(--shadow-pop)] transition-transform hover:-translate-y-1"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden border-b-2 border-[var(--color-ink)] bg-[var(--color-primary-soft)]">
        {curug.cover_image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={curug.cover_image_url}
            alt={curug.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-[var(--color-primary)]/40">
            <MapPin size={36} />
          </div>
        )}
        <div className="absolute left-3 top-3">
          <DifficultyBadge difficulty={curug.difficulty} />
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-display text-lg font-extrabold leading-tight text-[var(--color-ink)]">
          {curug.name}
        </h3>
        {curug.district && (
          <p className="mt-0.5 flex items-center gap-1 text-sm text-[var(--color-ink)]/60">
            <MapPin size={13} />
            {curug.village ? `${curug.village}, ` : ''}
            {curug.district}
          </p>
        )}

        <div className="mt-3 flex items-center justify-between border-t border-dashed border-[var(--color-ink)]/20 pt-3 text-sm">
          <span className="flex items-center gap-1 font-semibold text-[var(--color-ink)]/80">
            <Clock size={14} />
            {formatDuration(curug.trek_duration_minutes)}
          </span>
          <span className="flex items-center gap-1 font-bold text-[var(--color-primary)]">
            <Ticket size={14} />
            {formatCurrency(curug.ticket_price)}
          </span>
        </div>
      </div>
    </Link>
  )
}
