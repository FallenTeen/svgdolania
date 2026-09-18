import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { createServiceClient } from '@/lib/supabase/service'
import { CurugForm } from '@/components/admin/CurugForm'
import type { Curug } from '@/lib/types'

async function getCurugForEdit(id: string): Promise<Curug | null> {
  const supabase = createServiceClient()
  const { data } = await supabase.from('curugs').select('*').eq('id', id).single()
  return (data as Curug) ?? null
}

export default async function AdminCurugEditPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const isNew = id === 'new'

  const curug = isNew ? null : await getCurugForEdit(id)
  if (!isNew && !curug) notFound()

  return (
    <div>
      <Link
        href="/admin/curugs"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-800"
      >
        <ArrowLeft size={15} />
        Kembali ke daftar curug
      </Link>
      <h1 className="mb-5 text-xl font-semibold text-gray-900">
        {isNew ? 'Tambah Curug Baru' : 'Edit Curug'}
      </h1>
      <CurugForm curug={curug} />
    </div>
  )
}