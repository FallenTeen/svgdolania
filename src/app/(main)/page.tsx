import type { Metadata } from 'next'
import Link from 'next/link'
import {
  Compass,
  MapPin,
  ShieldCheck,
  Wallet,
  MessageCircle,
  Search,
  CalendarCheck,
  PartyPopper,
  ArrowRight,
  Star,
} from 'lucide-react'
import { getCurugs } from '@/app/admin/curugs/actions'
import { getTrips } from '@/lib/actions/trips'
import { getArticles } from '@/lib/actions/artikel'
import { HeroCarousel } from '@/components/home/HeroCarousel'
import { CurugCard } from '@/components/curug/CurugCard'
import { TripCard } from '@/components/trip/TripCard'
import { ArticleCard } from '@/components/artikel/ArticleCard'
import { ButtonLink } from '@/components/ui/Button'
import { SectionHeading, WaveDivider } from '@/components/ui/WaveDivider'
import { normalizePhoneNumber } from '@/lib/whatsapp'
import { TripRequestCalendar } from '@/components/trip/TripRequestCalendar'

export const metadata: Metadata = {
  title: 'Explore Curug Banyumas — Katalog & Trip Air Terjun Banyumas',
  description:
    'Temukan curug terbaik di Banyumas dan gabung trip explore bareng rombongan. Dari yang santai buat keluarga sampai yang menantang buat pecinta trekking.',
}

const HOW_IT_WORKS = [
  {
    icon: Search,
    title: '1. Pilih curug atau trip',
    description:
      'Cek katalog curug lengkap dengan info akses, fasilitas, dan tingkat kesulitan. Atau langsung lihat jadwal trip terbuka.',
  },
  {
    icon: CalendarCheck,
    title: '2. Isi form booking',
    description:
      'Cukup isi nama, kontak, dan jumlah peserta. Nggak perlu transfer dulu — kami hubungi kamu setelah booking masuk.',
  },
  {
    icon: PartyPopper,
    title: '3. Konfirmasi & berangkat',
    description:
      'Admin konfirmasi via WhatsApp, kamu tinggal siapin bekal dan datang di titik kumpul sesuai jadwal.',
  },
]

const VALUE_PROPS = [
  {
    icon: ShieldCheck,
    title: 'Info akses yang bisa dipercaya',
    description:
      'Setiap curug punya info jarak, durasi trek, dan fasilitas yang kami cek langsung — bukan cuma copy-paste dari internet.',
  },
  {
    icon: Wallet,
    title: 'Harga transparan dari awal',
    description:
      'Tiket masuk, biaya parkir, sampai harga trip ditampilkan jelas di setiap halaman. Nggak ada biaya siluman.',
  },
  {
    icon: MessageCircle,
    title: 'Dibantu admin lewat WhatsApp',
    description:
      'Ada pertanyaan sebelum booking? Tim kami siap dibalas cepat lewat WhatsApp, dari soal jalur sampai jadwal trip privat.',
  },
]

function buildWaLink(): string | null {
  const adminNumber = process.env.NEXT_PUBLIC_ADMIN_WHATSAPP_NUMBER
  if (!adminNumber) return null
  const message = 'Halo Admin, saya mau tanya-tanya soal curug dan trip di Explore Curug Banyumas.'
  return `https://wa.me/${normalizePhoneNumber(adminNumber)}?text=${encodeURIComponent(message)}`
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ requestDate?: string }>
}) {
  const { requestDate } = await searchParams

  const [curugsResult, tripsResult, articlesResult] = await Promise.all([
    getCurugs(),
    getTrips({ status: 'open', type: 'public' }),
    getArticles({ page: 1, perPage: 3 }),
  ])

  const publishedCurugs = (curugsResult.data ?? []).filter((c) => c.is_published)
  const featuredCurugs = publishedCurugs.slice(0, 6)
  const openTrips = tripsResult.data ?? []
  const nearestTrips = openTrips.slice(0, 3)
  const latestArticles = articlesResult.data?.articles ?? []

  const heroImages = featuredCurugs
    .filter((c) => c.cover_image_url)
    .slice(0, 5)
    .map((c) => ({ src: c.cover_image_url as string, alt: c.name }))

  const stats = [
    { label: 'Curug terdaftar', value: publishedCurugs.length },
    { label: 'Trip terbuka saat ini', value: openTrips.length },
    {
      label: 'Kecamatan tercakup',
      value: new Set(publishedCurugs.map((c) => c.district).filter(Boolean)).size,
    },
  ]

  const waLink = buildWaLink()

  return (
    <div>
      {/* Hero */}
      <section className="relative flex min-h-[600px] items-end overflow-hidden border-b-2 border-[var(--color-ink)] sm:min-h-[680px]">
        <HeroCarousel images={heroImages} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/10" />

        <div className="relative mx-auto w-full max-w-6xl px-4 pb-14 pt-28 sm:px-6 sm:pb-16">
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

          {/* Stat strip */}
          <div className="mt-10 grid max-w-xl grid-cols-3 gap-3 border-t-2 border-white/20 pt-6">
            {stats.map((stat) => (
              <div key={stat.label}>
                <p className="font-display text-2xl font-extrabold text-white sm:text-3xl">
                  {stat.value}+
                </p>
                <p className="mt-0.5 text-xs font-semibold text-white/70 sm:text-sm">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Kenapa pilih kami */}
      <section className="bg-[var(--color-bg)] py-14 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <SectionHeading
            eyebrow="Kenapa explore bareng kami"
            title="Eksplorasi curug jadi lebih gampang & tenang"
            description="Kami bantu urusan info akses dan koordinasi rombongan, kamu tinggal fokus menikmati perjalanan."
          />
          <div className="grid gap-5 sm:grid-cols-3">
            {VALUE_PROPS.map((item) => {
              const Icon = item.icon
              return (
                <div
                  key={item.title}
                  className="rounded-3xl border-2 border-[var(--color-ink)] bg-white p-6 shadow-[var(--shadow-pop)]"
                >
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl border-2 border-[var(--color-ink)] bg-[var(--color-primary-soft)] text-[var(--color-primary)]">
                    <Icon size={22} strokeWidth={2.5} />
                  </span>
                  <h3 className="mt-4 font-display text-lg font-extrabold text-[var(--color-ink)]">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm text-[var(--color-ink)]/70">{item.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <WaveDivider color="var(--color-primary-soft)" />

      {/* Curug Pilihan */}
      <section className="bg-[var(--color-primary-soft)] py-14 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <SectionHeading
            eyebrow="Favorit pengunjung"
            title="Curug Pilihan"
            description="Beberapa curug paling sering direkomendasikan komunitas jalan-jalan lokal."
            action={{ href: '/curugs', label: 'Lihat semua curug' }}
          />
          {featuredCurugs.length === 0 ? (
            <p className="rounded-2xl border-2 border-dashed border-[var(--color-ink)]/20 bg-white/60 px-5 py-8 text-center text-[var(--color-ink)]/60">
              Katalog curug sedang disiapkan — cek lagi sebentar lagi ya.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3">
              {featuredCurugs.map((curug) => (
                <CurugCard key={curug.id} curug={curug} />
              ))}
            </div>
          )}
        </div>
      </section>

      <WaveDivider color="var(--color-bg)" flip />

      {/* Cara kerja */}
      <section className="bg-[var(--color-bg)] py-14 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <SectionHeading
            eyebrow="Simpel kok"
            title="Cara booking trip"
            description="Tiga langkah dari lihat katalog sampai jalan bareng rombongan."
          />
          <div className="grid gap-5 sm:grid-cols-3">
            {HOW_IT_WORKS.map((step) => {
              const Icon = step.icon
              return (
                <div key={step.title} className="relative">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-[var(--color-ink)] bg-[var(--color-sun)] shadow-[var(--shadow-pop-sm)]">
                    <Icon size={24} strokeWidth={2.5} className="text-[var(--color-ink)]" />
                  </div>
                  <h3 className="mt-4 font-display text-lg font-extrabold text-[var(--color-ink)]">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--color-ink)]/70">
                    {step.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Trip Terdekat */}
      <section className="bg-[var(--color-sky-soft)] py-14 sm:py-20">
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

      {/* Request tanggal trip */}
      <TripRequestCalendar curugs={publishedCurugs} initialDate={requestDate} />

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

      {/* CTA akhir */}
      <section className="border-t-2 border-[var(--color-ink)] bg-[var(--color-primary)] py-16 text-white sm:py-20">
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-5 px-4 text-center sm:px-6">
          <span className="inline-flex items-center gap-1.5 rounded-full border-2 border-white/40 bg-white/10 px-3 py-1 text-sm font-bold backdrop-blur">
            <Star size={14} className="fill-[var(--color-sun)] text-[var(--color-sun)]" />
            Masih ragu mau ke curug mana?
          </span>
          <h2 className="font-display text-3xl font-extrabold leading-tight sm:text-4xl">
            Tanya dulu ke admin, gratis kok
          </h2>
          <p className="max-w-lg text-white/85">
            Ceritain rencana trip kamu — solo, keluarga, atau rombongan — nanti admin bantu
            rekomendasiin curug dan trip yang paling cocok.
          </p>
          <div className="mt-2 flex flex-wrap justify-center gap-3">
            {waLink && (
              <ButtonLink href={waLink} variant="whatsapp" size="lg" external>
                <MessageCircle size={18} />
                Chat Admin di WhatsApp
              </ButtonLink>
            )}
            <ButtonLink href="/trips" variant="sun" size="lg">
              Lihat Semua Trip
              <ArrowRight size={18} />
            </ButtonLink>
          </div>
        </div>
      </section>
    </div>
  )
}
