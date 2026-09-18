import Link from 'next/link'
import { CalendarClock, UserCheck, MapPin, FileEdit, ArrowRight } from 'lucide-react'
import { getDashboardOverview } from './actions'
import { StatCard } from '@/components/admin/StatCard'

export default async function AdminOverviewPage() {
  const result = await getDashboardOverview()
  const stats = result.success && result.data
    ? result.data
    : { upcomingTripsCount: 0, pendingParticipantsCount: 0, publishedCurugsCount: 0, draftArticlesCount: 0 }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">Ringkasan cepat kondisi katalog & trip kamu hari ini.</p>
      </div>

      {!result.success && (
        <p className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{result.error}</p>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Trip upcoming"
          value={stats.upcomingTripsCount}
          icon={CalendarClock}
          href="/admin/trips"
          accent="sky"
        />
        <StatCard
          label="Peserta butuh approval"
          value={stats.pendingParticipantsCount}
          icon={UserCheck}
          href="/admin/peserta"
          accent="amber"
          hint={stats.pendingParticipantsCount > 0 ? 'Perlu segera dicek' : undefined}
        />
        <StatCard
          label="Curug published"
          value={stats.publishedCurugsCount}
          icon={MapPin}
          href="/admin/curugs"
          accent="emerald"
        />
        <StatCard
          label="Artikel draft"
          value={stats.draftArticlesCount}
          icon={FileEdit}
          href="/admin/artikel"
          accent="rose"
        />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <QuickLink href="/admin/peserta" title="Approve peserta pending" description="Lihat dan setujui/tolak booking yang masuk." />
        <QuickLink href="/admin/trips/new/edit" title="Buat trip baru" description="Jadwalkan trip publik atau privat." />
        <QuickLink href="/admin/curugs/new/edit" title="Tambah curug baru" description="Lengkapi data & galeri foto curug." />
        <QuickLink href="/admin/artikel/new/edit" title="Tulis artikel baru" description="Buat konten untuk katalog artikel." />
      </div>
    </div>
  )
}

function QuickLink({ href, title, description }: { href: string; title: string; description: string }) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4 transition-shadow hover:shadow-sm"
    >
      <div>
        <p className="text-sm font-semibold text-gray-900">{title}</p>
        <p className="mt-0.5 text-sm text-gray-500">{description}</p>
      </div>
      <ArrowRight size={18} className="shrink-0 text-gray-400" />
    </Link>
  )
}