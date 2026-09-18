import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import DOMPurify from 'isomorphic-dompurify'
import { getArticleBySlug, getRelatedArticles } from '@/lib/actions/artikel'
import { ArticleCard } from '@/components/artikel/ArticleCard'
import { formatDateLong } from '@/lib/format'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const result = await getArticleBySlug(slug)
  if (!result.success || !result.data) return { title: 'Artikel tidak ditemukan' }

  const article = result.data
  return {
    title: `${article.title} — Explore Curug Banyumas`,
    description: article.excerpt ?? undefined,
    openGraph: {
      title: article.title,
      description: article.excerpt ?? undefined,
      images: article.cover_image_url ? [{ url: article.cover_image_url }] : undefined,
    },
  }
}

export default async function ArticleDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const result = await getArticleBySlug(slug)
  if (!result.success || !result.data) notFound()
  const article = result.data

  const relatedResult = await getRelatedArticles(article.id, 3)
  const related = relatedResult.data ?? []

  const cleanHtml = article.content_html ? DOMPurify.sanitize(article.content_html) : ''

  return (
    <article className="mx-auto max-w-[700px] px-4 py-10 sm:px-6 sm:py-14">
      {article.published_at && (
        <p className="text-sm font-bold uppercase tracking-wide text-[var(--color-ink)]/40">
          {formatDateLong(article.published_at)}
        </p>
      )}
      <h1 className="mt-2 font-display text-3xl font-extrabold leading-tight text-[var(--color-ink)] sm:text-4xl">
        {article.title}
      </h1>
      {article.excerpt && (
        <p className="mt-3 text-lg text-[var(--color-ink)]/70">{article.excerpt}</p>
      )}

      {article.cover_image_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={article.cover_image_url}
          alt={article.title}
          className="mt-6 w-full rounded-3xl border-2 border-[var(--color-ink)] object-cover shadow-[var(--shadow-pop)]"
        />
      )}

      <div className="article-content mt-8" dangerouslySetInnerHTML={{ __html: cleanHtml }} />

      {related.length > 0 && (
        <section className="mt-16 border-t-2 border-dashed border-[var(--color-ink)]/20 pt-10">
          <h2 className="mb-5 font-display text-2xl font-extrabold">Artikel terkait</h2>
          <div className="grid gap-5 sm:grid-cols-3">
            {related.map((a) => (
              <ArticleCard key={a.id} article={a} />
            ))}
          </div>
        </section>
      )}
    </article>
  )
}
