import type { Metadata } from 'next'
import Link from 'next/link'
import { BookOpen, ChevronLeft, ChevronRight } from 'lucide-react'
import { getArticles } from '@/lib/actions/artikel'
import { ArticleCard } from '@/components/artikel/ArticleCard'

export const metadata: Metadata = {
  title: 'Artikel | Explore Curug Banyumas',
  description: 'Tips, panduan, dan cerita seputar explore curug di Banyumas.',
}

export default async function ArtikelPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const { page } = await searchParams
  const currentPage = Math.max(Number(page) || 1, 1)
  const result = await getArticles({ page: currentPage, perPage: 10 })
  const { articles, totalPages } = result.data ?? { articles: [], totalPages: 1 }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="mb-8">
        <span className="mb-2 inline-block rounded-full bg-[var(--color-sky-soft)] px-3 py-1 text-sm font-bold text-[#0f5b6b] font-display">
          Baca-baca dulu
        </span>
        <h1 className="font-display text-4xl font-extrabold text-[var(--color-ink)] sm:text-5xl">
          Artikel & Panduan
        </h1>
        <p className="mt-2 max-w-xl text-[var(--color-ink)]/70">
          Tips persiapan trekking, rekomendasi spot foto, sampai cerita di balik nama-nama curug
          di Banyumas.
        </p>
      </div>

      {articles.length === 0 ? (
        <div className="flex flex-col items-center rounded-3xl border-2 border-dashed border-[var(--color-ink)]/30 bg-white/50 px-6 py-16 text-center">
          <BookOpen size={40} className="mb-4 text-[var(--color-sky)]/60" />
          <p className="font-display text-lg font-bold text-[var(--color-ink)]">Belum ada artikel</p>
          <p className="mt-1 text-sm text-[var(--color-ink)]/60">Nantikan cerita seru dari kami segera.</p>
        </div>
      ) : (
        <>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-10 flex items-center justify-center gap-3">
              <PageLink page={currentPage - 1} disabled={currentPage <= 1}>
                <ChevronLeft size={16} />
              </PageLink>
              <span className="font-display text-sm font-bold text-[var(--color-ink)]/70">
                Halaman {currentPage} dari {totalPages}
              </span>
              <PageLink page={currentPage + 1} disabled={currentPage >= totalPages}>
                <ChevronRight size={16} />
              </PageLink>
            </div>
          )}
        </>
      )}
    </div>
  )
}

function PageLink({
  page,
  disabled,
  children,
}: {
  page: number
  disabled: boolean
  children: React.ReactNode
}) {
  if (disabled) {
    return (
      <span className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[var(--color-ink)]/15 text-[var(--color-ink)]/30">
        {children}
      </span>
    )
  }
  return (
    <Link
      href={`/artikel?page=${page}`}
      className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[var(--color-ink)] bg-white shadow-[var(--shadow-pop-sm)] transition-transform hover:-translate-y-0.5"
    >
      {children}
    </Link>
  )
}
