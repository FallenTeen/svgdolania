'use client'

import Link from 'next/link'
import { Pencil, Trash2 } from 'lucide-react'
import { ConfirmButton } from '@/components/admin/ConfirmButton'
import { deleteCurug } from '@/app/admin/curugs/actions'

export function CurugRowActions({ id, name }: { id: string; name: string }) {
  return (
    <div className="flex items-center justify-end gap-1">
      <Link
        href={`/admin/curugs/${id}/edit`}
        className="flex h-8 w-8 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-800"
        aria-label={`Edit ${name}`}
      >
        <Pencil size={15} />
      </Link>
      <ConfirmButton
        onConfirm={() => deleteCurug(id)}
        confirmMessage={`Hapus (unpublish) curug "${name}"?`}
        className="flex h-8 w-8 items-center justify-center rounded-md text-gray-500 hover:bg-red-50 hover:text-red-600"
      >
        <Trash2 size={15} />
      </ConfirmButton>
    </div>
  )
}