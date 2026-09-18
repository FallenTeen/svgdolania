import Link from 'next/link'
import { Plus, MapPin } from 'lucide-react'
import { getCurugs } from '@/app/admin/curugs/actions'
import { DifficultyBadge } from '@/components/ui/Badge'
import { CurugRowActions } from '@/components/admin/CurugRowActions'

export default async function AdminCurugsPage() {
  const result = await getCurugs()
  const curugs = result.success && result.data ? result.data : []

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Curug</h1>
          <p className="mt-1 text-sm text-gray-500">Kelola katalog data curug.</p>
        </div>
        <Link
          href="/admin/curugs/new/edit"
          className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
        >
          <Plus size={16} />
          Tambah Curug
        </Link>
      </div>

      {!result.success && (
        <p className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{result.error}</p>
      )}

      {curugs.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-white py-16 text-center">
          <MapPin size={28} className="mb-2 text-gray-300" />
          <p className="text-sm font-medium text-gray-600">Belum ada data curug</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-4 py-3 font-medium">Curug</th>
                <th className="px-4 py-3 font-medium">Kesulitan</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {curugs.map((curug) => (
                <tr key={curug.id}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {curug.cover_image_url ? (
                        <img
                          src={curug.cover_image_url}
                          alt={curug.name}
                          className="h-10 w-14 rounded-md object-cover"
                        />
                      ) : (
                        <div className="flex h-10 w-14 items-center justify-center rounded-md bg-gray-100 text-gray-300">
                          <MapPin size={16} />
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-gray-900">{curug.name}</p>
                        <p className="text-xs text-gray-400">
                          {curug.village || curug.district
                            ? [curug.village, curug.district].filter(Boolean).join(', ')
                            : '-'}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <DifficultyBadge difficulty={curug.difficulty} />
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                        curug.is_published ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {curug.is_published ? 'Published' : 'Unpublished'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <CurugRowActions id={curug.id} name={curug.name} />
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