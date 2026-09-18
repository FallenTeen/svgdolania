import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { CalendarDays, Clock, MapPin, Users, Wallet, FileText } from 'lucide-react'
import { getTripBySlug } from '@/app/trips/actions'
import { getCurugBySlug } from '@/app/admin/curugs/actions'
import { TripStatusBadge, TripTypeBadge, DifficultyBadge } from '@/components/ui/Badge'
import { BookingForm } from '@/components/trip/BookingForm'
import { PrivateTripGate } from '@/components/trip/PrivateTripGate'
import { normalizePhoneNumber } from '@/lib/whatsapp'
import { formatDateLong, formatCurrency } from '@/lib/format'

function buildAvailabilityInquiryLink(tripTitle: string): string | null {
  const adminNumber = process.env.NEXT_PUBLIC_ADMIN_WHATSAPP_NUMBER
  if (!adminNumber) return null
  const message = [
    'Halo Admin, saya ingin menanyakan ketersediaan slot untuk trip privat berikut:',
    '',
    `Trip: ${tripTitle}`,
    '',
    'Apakah masih ada slot tersedia? Terima kasih.',
  ].join('\n')
  return `https://wa.me/${normalizePhoneNumber(adminNumber)}?text=${encodeURIComponent(message)}`
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const result = await getTripBySlug(slug)
  if (!result.success || !result.data) return { title: 'Trip tidak ditemukan' }
  return {
    title: `${result.data.title} — Explore Curug Banyumas`,
    description: result.data.description ?? undefined,
  }
}

export default async function TripDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const result = await getTripBySlug(slug)
  if (!result.success || !result.data) notFound()
  const trip = result.data

  const curugDetails = await Promise.all(
    trip.curugs.map(async (c) => {
      const r = await getCurugBySlug(c.slug)
      return r.success ? r.data : null
    })
  )
  const attachedCurugs = curugDetails.filter((c): c is NonNullable<typeof c> => Boolean(c))

  const availabilityLink = buildAvailabilityInquiryLink(trip.title)

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="mb-6 flex flex-wrap items-center gap-2">
        <TripStatusBadge status={trip.status} />
        <TripTypeBadge type={trip.trip_type} />
      </div>

      <h1 className="font-display text-3xl font-extrabold text-[var(--color-ink)] sm:text-4xl">
        {trip.title}
      </h1>

      {trip.description && (
        <p className="mt-3 max-w-2xl text-[var(--color-ink)]/70">{trip.description}</p>
      )}

      <div className="mt-10 grid gap-10 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          {/* Quick facts */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <QuickFact icon={<CalendarDays size={16} />} label="Tanggal" value={formatDateLong(trip.trip_date)} />
            <QuickFact icon={<Clock size={16} />} label="Jam kumpul" value={trip.meeting_time ?? '-'} />
            <QuickFact icon={<MapPin size={16} />} label="Titik kumpul" value={trip.meeting_point ?? '-'} />
            <QuickFact icon={<Wallet size={16} />} label="Harga/orang" value={formatCurrency(trip.price_per_person)} />
          </div>

          <div className="flex items-center gap-3 rounded-2xl border-2 border-dashed border-[var(--color-ink)]/30 px-4 py-3">
            <Users size={18} className="text-[var(--color-primary)]" />
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-[var(--color-ink)]/10">
              <div
                className="h-full rounded-full bg-[var(--color-primary)]"
                style={{
                  width: `${Math.min(
                    Math.round((trip.approved_count / Math.max(trip.max_participants, 1)) * 100),
                    100
                  )}%`,
                }}
              />
            </div>
            <span className="shrink-0 font-display text-sm font-bold">
              {trip.approved_count}/{trip.max_participants} peserta
            </span>
          </div>

          {trip.itinerary && (
            <section>
              <h2 className="mb-3 font-display text-2xl font-extrabold">Itinerary</h2>
              <p className="whitespace-pre-line leading-relaxed text-[var(--color-ink)]/80">
                {trip.itinerary}
              </p>
            </section>
          )}

          {attachedCurugs.length > 0 && (
            <section>
              <h2 className="mb-4 font-display text-2xl font-extrabold">
                Curug yang dikunjungi{attachedCurugs.length > 1 ? ' (Combo)' : ''}
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {attachedCurugs.map((curug) => (
                  <Link
                    key={curug.id}
                    href={`/curugs/${curug.slug}`}
                    className="flex gap-3 overflow-hidden rounded-2xl border-2 border-[var(--color-ink)] bg-white p-3 shadow-[var(--shadow-pop-sm)] transition-transform hover:-translate-y-0.5"
                  >
                    <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-[var(--color-ink)]/20 bg-[var(--color-primary-soft)]">
                      {curug.cover_image_url && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={curug.cover_image_url} alt={curug.name} className="h-full w-full object-cover" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-display font-bold">{curug.name}</p>
                      <div className="mt-1"><DifficultyBadge difficulty={curug.difficulty} /></div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {trip.terms_and_conditions && (
            <section className="rounded-3xl border-2 border-[var(--color-ink)]/15 bg-white/60 p-5">
              <h3 className="mb-2 flex items-center gap-2 font-display text-lg font-extrabold">
                <FileText size={16} />
                Syarat & Ketentuan
              </h3>
              <p className="whitespace-pre-line text-sm text-[var(--color-ink)]/70">
                {trip.terms_and_conditions}
              </p>
            </section>
          )}
        </div>

        {/* Booking column */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          {trip.status === 'cancelled' || trip.status === 'closed' ? (
            <div className="rounded-3xl border-2 border-[var(--color-ink)]/20 bg-white/60 p-5 text-center">
              <p className="font-display font-bold text-[var(--color-ink)]/70">
                Trip ini sudah {trip.status === 'cancelled' ? 'dibatalkan' : 'ditutup'}.
              </p>
            </div>
          ) : trip.trip_type === 'private' ? (
            <PrivateTripGate trip={trip} availabilityWaLink={availabilityLink ?? '#'} />
          ) : (
            <BookingForm trip={trip} />
          )}
        </div>
      </div>
    </div>
  )
}

function QuickFact({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl border-2 border-[var(--color-ink)] bg-white p-3 shadow-[var(--shadow-pop-sm)]">
      <p className="flex items-center gap-1 text-xs font-semibold text-[var(--color-ink)]/50">
        {icon}
        {label}
      </p>
      <p className="mt-1 truncate font-display font-bold text-[var(--color-ink)]">{value}</p>
    </div>
  )
}
