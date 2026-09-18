import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import {
  Clock,
  Ticket,
  Car,
  MapPin,
  Navigation,
  CalendarDays,
  AlertTriangle,
  Sparkles,
} from 'lucide-react'
import { getCurugBySlug, getCurugs } from '@/app/admin/curugs/actions'
import { getTrips } from '@/app/admin/trips/actions'
import { DifficultyBadge, TagChip } from '@/components/ui/Badge'
import { ButtonLink } from '@/components/ui/Button'
import { Gallery } from '@/components/curug/Gallery'
import { TripCard } from '@/components/trip/TripCard'
import { formatDuration, formatDistance, formatCurrency, formatFacilityLabel, formatTagLabel } from '@/lib/format'

export async function generateStaticParams() {
  const result = await getCurugs()
  if (!result.success || !result.data) return []
  return result.data.filter((c) => c.is_published).map((c) => ({ slug: c.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const result = await getCurugBySlug(slug)
  if (!result.success || !result.data) return { title: 'Curug tidak ditemukan' }

  const curug = result.data
  const title = `${curug.name} — Explore Curug Banyumas`
  const description =
    curug.short_description ?? `Info lengkap ${curug.name} di ${curug.district ?? 'Banyumas'}.`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: curug.cover_image_url ? [{ url: curug.cover_image_url }] : undefined,
    },
  }
}

export default async function CurugDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const result = await getCurugBySlug(slug)
  if (!result.success || !result.data) notFound()
  const curug = result.data

  const tripsResult = await getTrips({ status: 'open' })
  const relatedTrips = (tripsResult.data ?? []).filter((trip) =>
    trip.curugs.some((c) => c.id === curug.id)
  )

  const allImages = [curug.cover_image_url, ...curug.gallery].filter(
    (src): src is string => Boolean(src)
  )

  return (
    <div>
      {/* Hero */}
      <div className="relative h-[46vh] min-h-[320px] w-full overflow-hidden border-b-2 border-[var(--color-ink)] bg-[var(--color-primary-soft)]">
        {curug.cover_image_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={curug.cover_image_url} alt={curug.name} className="h-full w-full object-cover" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 mx-auto max-w-6xl px-4 pb-6 sm:px-6 sm:pb-8">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <DifficultyBadge difficulty={curug.difficulty} />
            {curug.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-white/90 px-2.5 py-1 text-xs font-bold text-[var(--color-ink)] font-display"
              >
                {formatTagLabel(tag)}
              </span>
            ))}
          </div>
          <h1 className="font-display text-3xl font-extrabold text-white drop-shadow-sm sm:text-5xl">
            {curug.name}
          </h1>
          {(curug.village || curug.district) && (
            <p className="mt-1 flex items-center gap-1 font-semibold text-white/90">
              <MapPin size={16} />
              {curug.village ? `${curug.village}, ` : ''}
              {curug.district}
            </p>
          )}
        </div>
      </div>

      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-10 sm:px-6 sm:py-14 lg:grid-cols-3">
        {/* Main column */}
        <div className="space-y-10 lg:col-span-2">
          {allImages.length > 0 && (
            <section>
              <h2 className="mb-4 font-display text-2xl font-extrabold">Galeri</h2>
              <Gallery images={allImages} name={curug.name} />
            </section>
          )}

          {curug.long_description && (
            <section>
              <h2 className="mb-3 font-display text-2xl font-extrabold">Tentang {curug.name}</h2>
              <p className="whitespace-pre-line leading-relaxed text-[var(--color-ink)]/80">
                {curug.long_description}
              </p>
            </section>
          )}

          {curug.access_notes && (
            <section className="rounded-3xl border-2 border-[var(--color-coral)] bg-[var(--color-coral-soft)] p-5">
              <h3 className="mb-2 flex items-center gap-2 font-display text-lg font-extrabold text-[#8a2e1b]">
                <AlertTriangle size={18} />
                Kondisi akses jalan
              </h3>
              <p className="text-[#7a2c1a]/90">{curug.access_notes}</p>
            </section>
          )}

          {relatedTrips.length > 0 && (
            <section>
              <h2 className="mb-4 font-display text-2xl font-extrabold">
                Trip yang mengunjungi {curug.name}
              </h2>
              <div className="grid gap-5 sm:grid-cols-2">
                {relatedTrips.map((trip) => (
                  <TripCard key={trip.id} trip={trip} />
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Sidebar info */}
        <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-3xl border-2 border-[var(--color-ink)] bg-white p-5 shadow-[var(--shadow-pop)]">
            <h3 className="mb-4 font-display text-lg font-extrabold">Info Praktis</h3>
            <dl className="grid grid-cols-2 gap-4 text-sm">
              <InfoItem icon={<Clock size={16} />} label="Estimasi trek" value={formatDuration(curug.trek_duration_minutes)} />
              <InfoItem icon={<Navigation size={16} />} label="Jarak dari kota" value={formatDistance(curug.distance_from_city_km)} />
              <InfoItem icon={<Ticket size={16} />} label="Tiket masuk" value={formatCurrency(curug.ticket_price)} />
              <InfoItem icon={<Car size={16} />} label="Parkir" value={formatCurrency(curug.parking_price)} />
            </dl>
            {curug.best_time_to_visit && (
              <div className="mt-4 flex items-start gap-2 rounded-2xl bg-[var(--color-sun-soft)] p-3 text-sm">
                <CalendarDays size={16} className="mt-0.5 shrink-0 text-[#7a5200]" />
                <div>
                  <p className="font-bold text-[#7a5200]">Waktu terbaik</p>
                  <p className="text-[#7a5200]/80">{curug.best_time_to_visit}</p>
                </div>
              </div>
            )}

            {curug.google_maps_url && (
              <ButtonLink href={curug.google_maps_url} external variant="primary" className="mt-5 w-full">
                <MapPin size={16} />
                Buka di Google Maps
              </ButtonLink>
            )}
          </div>

          {curug.facilities.length > 0 && (
            <div className="rounded-3xl border-2 border-[var(--color-ink)] bg-white p-5 shadow-[var(--shadow-pop)]">
              <h3 className="mb-3 flex items-center gap-2 font-display text-lg font-extrabold">
                <Sparkles size={16} />
                Fasilitas
              </h3>
              <div className="flex flex-wrap gap-2">
                {curug.facilities.map((f) => (
                  <TagChip key={f}>{formatFacilityLabel(f)}</TagChip>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}

function InfoItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div>
      <dt className="flex items-center gap-1.5 text-[var(--color-ink)]/50">
        {icon}
        {label}
      </dt>
      <dd className="mt-0.5 font-display font-bold text-[var(--color-ink)]">{value}</dd>
    </div>
  )
}
