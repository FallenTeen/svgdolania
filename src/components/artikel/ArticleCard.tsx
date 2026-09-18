import Link from 'next/link'
import { BookOpen } from 'lucide-react'
import type { Article } from '@/lib/types'
import { formatDateShort } from '@/lib/format'

export function ArticleCard({ article }: { article: Article }) {
  return (
    <Link
      href={`/artikel/${article.slug}`}
      className="group block overflow-hidden rounded-3xl border-2 border-[var(--color-ink)] bg-white shadow-[var(--shadow-pop)] transition-transform hover:-translate-y-1"
    >
      <div className="aspect-[16/10] w-full overflow-hidden border-b-2 border-[var(--color-ink)] bg-[var(--color-sky-soft)]">
        {article.cover_image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={article.cover_image_url}
            alt={article.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-[var(--color-sky)]/50">
            <BookOpen size={32} />
          </div>
        )}
      </div>
      <div className="p-4">
        {article.published_at && (
          <p className="text-xs font-bold uppercase tracking-wide text-[var(--color-ink)]/40">
            {formatDateShort(article.published_at)}
          </p>
        )}
        <h3 className="mt-1 font-display text-lg font-extrabold leading-snug text-[var(--color-ink)]">
          {article.title}
        </h3>
        {article.excerpt && (
          <p className="mt-2 line-clamp-2 text-sm text-[var(--color-ink)]/65">{article.excerpt}</p>
        )}
      </div>
    </Link>
  )
}
