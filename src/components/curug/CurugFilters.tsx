'use client'

import { useCallback, useEffect, useState, useTransition } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { Search, X, SlidersHorizontal } from 'lucide-react'
import { TagChip } from '@/components/ui/Badge'
import { formatTagLabel, formatFacilityLabel } from '@/lib/format'

const DIFFICULTY_OPTIONS: { value: string; label: string }[] = [
  { value: 'mudah', label: 'Santai' },
  { value: 'menengah', label: 'Menengah' },
  { value: 'sulit', label: 'Menantang' },
]

const TAG_OPTIONS = ['pemula', 'keluarga', 'hobi_foto', 'adventure', 'dekat_kota']
const FACILITY_OPTIONS = ['toilet', 'warung', 'mushola', 'area_camping']

function getMulti(params: URLSearchParams, key: string): string[] {
  return params.get(key)?.split(',').filter(Boolean) ?? []
}

export function CurugFilters() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const [query, setQuery] = useState(searchParams.get('q') ?? '')
  const [showFilters, setShowFilters] = useState(false)

  const difficulty = getMulti(searchParams, 'difficulty')
  const tags = getMulti(searchParams, 'tags')
  const facilities = getMulti(searchParams, 'facilities')
  const activeCount = difficulty.length + tags.length + facilities.length

  const updateParams = useCallback(
    (mutate: (params: URLSearchParams) => void) => {
      const params = new URLSearchParams(searchParams.toString())
      mutate(params)
      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`, { scroll: false })
      })
    },
    [router, pathname, searchParams]
  )

  // Debounce search 300ms lalu tulis ke URL (?q=...)
  useEffect(() => {
    const handle = setTimeout(() => {
      const currentQ = searchParams.get('q') ?? ''
      if (query === currentQ) return
      updateParams((params) => {
        if (query) params.set('q', query)
        else params.delete('q')
      })
    }, 300)
    return () => clearTimeout(handle)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query])

  function toggleMulti(key: string, value: string, current: string[]) {
    updateParams((params) => {
      const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value]
      if (next.length) params.set(key, next.join(','))
      else params.delete(key)
    })
  }

  function clearAll() {
    setQuery('')
    updateParams((params) => {
      params.delete('q')
      params.delete('difficulty')
      params.delete('tags')
      params.delete('facilities')
    })
  }

  return (
    <div className="mb-8">
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search
            size={18}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-ink)]/40"
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari nama curug, misal &quot;Cipendok&quot;..."
            className="w-full rounded-full border-2 border-[var(--color-ink)] bg-white py-3 pl-11 pr-4 font-medium shadow-[var(--shadow-pop-sm)] outline-none placeholder:text-[var(--color-ink)]/40 focus:ring-2 focus:ring-[var(--color-primary)]"
          />
        </div>
        <button
          type="button"
          onClick={() => setShowFilters((v) => !v)}
          className="flex items-center justify-center gap-2 rounded-full border-2 border-[var(--color-ink)] bg-[var(--color-sun)] px-5 py-3 font-display font-bold shadow-[var(--shadow-pop-sm)] sm:w-auto"
        >
          <SlidersHorizontal size={16} />
          Filter
          {activeCount > 0 && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--color-ink)] text-xs text-white">
              {activeCount}
            </span>
          )}
        </button>
      </div>

      {showFilters && (
        <div className="mt-4 space-y-4 rounded-3xl border-2 border-dashed border-[var(--color-ink)]/30 bg-white/60 p-4">
          <FilterGroup label="Tingkat kesulitan">
            {DIFFICULTY_OPTIONS.map((opt) => (
              <TagChip
                key={opt.value}
                as="button"
                active={difficulty.includes(opt.value)}
                onClick={() => toggleMulti('difficulty', opt.value, difficulty)}
              >
                {opt.label}
              </TagChip>
            ))}
          </FilterGroup>

          <FilterGroup label="Cocok untuk">
            {TAG_OPTIONS.map((tag) => (
              <TagChip
                key={tag}
                as="button"
                active={tags.includes(tag)}
                onClick={() => toggleMulti('tags', tag, tags)}
              >
                {formatTagLabel(tag)}
              </TagChip>
            ))}
          </FilterGroup>

          <FilterGroup label="Fasilitas">
            {FACILITY_OPTIONS.map((f) => (
              <TagChip
                key={f}
                as="button"
                active={facilities.includes(f)}
                onClick={() => toggleMulti('facilities', f, facilities)}
              >
                {formatFacilityLabel(f)}
              </TagChip>
            ))}
          </FilterGroup>

          {(activeCount > 0 || query) && (
            <button
              type="button"
              onClick={clearAll}
              className="flex items-center gap-1 text-sm font-bold text-[var(--color-coral)] hover:underline"
            >
              <X size={14} />
              Reset semua filter
            </button>
          )}
        </div>
      )}

      {isPending && <p className="mt-2 text-xs text-[var(--color-ink)]/40">Memuat...</p>}
    </div>
  )
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-2 text-sm font-bold text-[var(--color-ink)]/70">{label}</p>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  )
}
