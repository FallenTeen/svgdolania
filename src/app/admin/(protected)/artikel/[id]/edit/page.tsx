import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { getArticleById } from '../../actions'
import { ArticleForm } from '@/components/admin/ArticleForm'

export default async function AdminArtikelEditPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const isNew = id === 'new'

  const article = isNew ? null : (await getArticleById(id)).data ?? null
  if (!isNew && !article) notFound()

  return (
    <div>
      <Link
        href="/admin/artikel"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-800"
      >
        <ArrowLeft size={15} />
        Kembali ke daftar artikel
      </Link>
      <h1 className="mb-5 text-xl font-semibold text-gray-900">
        {isNew ? 'Tulis Artikel Baru' : `Edit Artikel`}
      </h1>
      <ArticleForm article={article} />
    </div>
  )
}