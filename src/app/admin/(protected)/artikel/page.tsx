import Link from 'next/link'
import { Plus, FileText } from 'lucide-react'
import { getArticlesAdmin } from './actions'
import { formatDateShort } from '@/lib/format'
import { ArticleRowActions } from '@/components/admin/ArticleRowActions'

export default async function AdminArtikelPage() {
  const result = await getArticlesAdmin()
  const articles = result.success && result.data ? result.data : []

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Artikel</h1>
          <p className="mt-1 text-sm text-gray-500">Kelola konten artikel & blog.</p>
        </div>
        <Link
          href="/admin/artikel/new/edit"
          className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
        >
          <Plus size={16} />
          Tulis Artikel Baru
        </Link>
      </div>

      {!result.success && (
        <p className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{result.error}</p>
      )}

      {articles.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-4 py-3 font-medium">Judul</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Diperbarui</th>
                <th className="px-4 py-3 font-medium text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {articles.map((article) => (
                <tr key={article.id}>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{article.title}</p>
                    <p className="text-xs text-gray-400">/{article.slug}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                        article.is_published
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-amber-50 text-amber-700'
                      }`}
                    >
                      {article.is_published ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{formatDateShort(article.updated_at)}</td>
                  <td className="px-4 py-3 text-right">
                    <ArticleRowActions id={article.id} title={article.title} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-white py-16 text-center">
      <FileText size={28} className="mb-2 text-gray-300" />
      <p className="text-sm font-medium text-gray-600">Belum ada artikel</p>
      <p className="mt-1 text-sm text-gray-400">Mulai tulis artikel pertamamu.</p>
    </div>
  )
}