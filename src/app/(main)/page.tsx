import type { Metadata } from 'next'
import { Compass, MapPin } from 'lucide-react'
import { getCurugs } from '@/app/admin/curugs/actions'
import { getTrips } from '@/app/trips/actions'
import { getArticles } from '@/app/artikel/actions'
import { HeroCarousel } from '@/components/home/HeroCarousel'
import { CurugCard } from '@/components/curug/CurugCard'
import { TripCard } from '@/components/trip/TripCard'
import { ArticleCard } from '@/components/artikel/ArticleCard'
import { ButtonLink } from '@/components/ui/Button'
import { SectionHeading, WaveDivider } from '@/components/ui/WaveDivider'

export const metadata: Metadata = {
  title: 'Explore Curug Banyumas — Katalog & Trip Air Terjun Banyumas',
  description:
    'Temukan curug terbaik di Banyumas dan gabung trip explore bareng rombongan. Dari yang santai buat keluarga sampai yang menantang buat pecinta trekking.',
}

export default async function HomePage() {
  const [curugsResult, tripsResult, articlesResult] = await Promise.all([
    getCurugs(),
    getTrips({ status: 'open', type: 'public' }),
    getArticles({ page: 1, perPage: 3 }),
  ])

  const featuredCurugs = (curugsResult.data ?? []).filter((c) => c.is_published).slice(0, 6)
  const nearestTrips = (tripsResult.data ?? []).slice(0, 3)
  const latestArticles = articlesResult.data?.articles ?? []

  const heroImages = featuredCurugs
    .filter((c) => c.cover_image_url)
    .slice(0, 5)
    .map((c) => ({ src: c.cover_image_url as string, alt: c.name }))

  return (
    <div>
      {/* Hero */}
      <section className="relative flex min-h-[560px] items-end overflow-hidden border-b-2 border-[var(--color-ink)] sm:min-h-[620px]">
        <HeroCarousel images={heroImages} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />

        <div className="relative mx-auto w-full max-w-6xl px-4 pb-16 pt-24 sm:px-6 sm:pb-20">
          <span className="mb-4 inline-flex items-center gap-1.5 rounded-full border-2 border-white/40 bg-white/10 px-3 py-1 text-sm font-bold text-white backdrop-blur">
            <MapPin size={14} />
            Kabupaten Banyumas, Jawa Tengah
          </span>
          <h1 className="max-w-2xl font-display text-4xl font-extrabold leading-[1.1] text-white drop-shadow sm:text-6xl">
            Susuri curug tersembunyi di lereng Slamet
          </h1>
          <p className="mt-4 max-w-lg text-lg text-white/85">
            Katalog curug lengkap dengan info akses & fasilitas, plus trip bareng rombongan biar
            eksplorasi kamu makin seru dan nggak sendirian.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <ButtonLink href="/curugs" variant="sun" size="lg">
              <Compass size={18} />
              Jelajahi Katalog Curug
            </ButtonLink>
            <ButtonLink href="/trips" variant="outline" size="lg">
              Lihat Trip Terdekat
            </ButtonLink>
          </div>
        </div>
      </section>

      {/* Curug Pilihan */}
      <section className="bg-[var(--color-bg)] py-14 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <SectionHeading
            eyebrow="Favorit pengunjung"
            title="Curug Pilihan"
            description="Beberapa curug paling sering direkomendasikan komunitas jalan-jalan lokal."
            action={{ href: '/curugs', label: 'Lihat semua curug' }}
          />
          <div className="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3">
            {featuredCurugs.map((curug) => (
              <CurugCard key={curug.id} curug={curug} />
            ))}
          </div>
        </div>
      </section>

      <WaveDivider color="var(--color-primary-soft)" />

      {/* Trip Terdekat */}
      <section className="bg-[var(--color-primary-soft)] py-14 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <SectionHeading
            eyebrow="Ayo gabung"
            title="Trip Terdekat"
            description="Booking sekarang sebelum slotnya keburu penuh."
            action={{ href: '/trips', label: 'Lihat semua trip' }}
          />
          {nearestTrips.length === 0 ? (
            <p className="rounded-2xl border-2 border-dashed border-[var(--color-ink)]/20 bg-white/60 px-5 py-8 text-center text-[var(--color-ink)]/60">
              Belum ada trip terbuka saat ini — cek lagi beberapa hari ke depan ya.
            </p>
          ) : (
            <div className="grid gap-5 sm:grid-cols-3">
              {nearestTrips.map((trip) => (
                <TripCard key={trip.id} trip={trip} />
              ))}
            </div>
          )}
        </div>
      </section>

      <WaveDivider color="var(--color-bg)" flip />

      {/* Artikel Terbaru */}
      {latestArticles.length > 0 && (
        <section className="bg-[var(--color-bg)] py-14 sm:py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <SectionHeading
              eyebrow="Baca-baca dulu"
              title="Artikel Terbaru"
              description="Tips, panduan, dan cerita seputar explore curug."
              action={{ href: '/artikel', label: 'Lihat semua artikel' }}
            />
            <div className="grid gap-5 sm:grid-cols-3">
              {latestArticles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
