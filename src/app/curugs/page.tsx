import type { Metadata } from 'next'
import { TreePalm } from 'lucide-react'
import { getCurugs } from '@/app/admin/curugs/actions'
import { CurugCard } from '@/components/curug/CurugCard'
import { CurugFilters } from '@/components/curug/CurugFilters'
import type { Curug, Difficulty } from '@/lib/types'

export const metadata: Metadata = {
  title: 'Katalog Curug | Explore Curug Banyumas',
  description:
    'Jelajahi puluhan curug di Kabupaten Banyumas, lengkap dengan info tingkat kesulitan, harga tiket, dan fasilitas. Cari dan filter sesuai gaya jalan-jalanmu.',
}

type SearchParams = {
  q?: string
  difficulty?: string
  tags?: string
  facilities?: string
}

function filterCurugs(curugs: Curug[], params: SearchParams): Curug[] {
  const q = params.q?.trim().toLowerCase()
  const difficulty = params.difficulty?.split(',').filter(Boolean) as Difficulty[] | undefined
  const tags = params.tags?.split(',').filter(Boolean)
  const facilities = params.facilities?.split(',').filter(Boolean)

  return curugs
    .filter((c) => c.is_published)
    .filter((c) => (q ? c.name.toLowerCase().includes(q) || c.alt_name?.toLowerCase().includes(q) : true))
    .filter((c) => (difficulty?.length ? c.difficulty && difficulty.includes(c.difficulty) : true))
    .filter((c) => (tags?.length ? tags.every((t) => c.tags.includes(t)) : true))
    .filter((c) => (facilities?.length ? facilities.every((f) => c.facilities.includes(f)) : true))
}

export default async function CurugsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const result = await getCurugs()
  const allCurugs = result.success && result.data ? result.data : []
  const curugs = filterCurugs(allCurugs, params)

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="mb-8">
        <span className="mb-2 inline-block rounded-full bg-[var(--color-sun-soft)] px-3 py-1 text-sm font-bold text-[#7a5200] font-display">
          {allCurugs.filter((c) => c.is_published).length} curug siap dijelajahi
        </span>
        <h1 className="font-display text-4xl font-extrabold text-[var(--color-ink)] sm:text-5xl">
          Katalog Curug Banyumas
        </h1>
        <p className="mt-2 max-w-xl text-[var(--color-ink)]/70">
          Dari yang landai buat piknik keluarga sampai yang trek-nya bikin ngos-ngosan. Cari sesuai
          mood eksplorasimu.
        </p>
      </div>

      <CurugFilters />

      {curugs.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
          {curugs.map((curug) => (
            <CurugCard key={curug.id} curug={curug} />
          ))}
        </div>
      )}
    </div>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center rounded-3xl border-2 border-dashed border-[var(--color-ink)]/30 bg-white/50 px-6 py-16 text-center">
      <TreePalm size={40} className="mb-4 text-[var(--color-primary)]/50" />
      <p className="font-display text-lg font-bold text-[var(--color-ink)]">
        Belum ada curug yang cocok
      </p>
      <p className="mt-1 text-sm text-[var(--color-ink)]/60">
        Coba longgarkan filter atau ganti kata kunci pencarian kamu.
      </p>
    </div>
  )
}
