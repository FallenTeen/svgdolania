'use client'

import Link from 'next/link'
import { Pencil, Users, Trash2 } from 'lucide-react'
import { ConfirmButton } from '@/components/admin/ConfirmButton'
import { deleteTrip } from '@/lib/actions/trips'

export function TripRowActions({ id, title }: { id: string; title: string }) {
  return (
    <div className="flex items-center justify-end gap-1">
      <Link
        href={`/admin/peserta?trip=${id}`}
        className="flex h-8 w-8 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-800"
        aria-label={`Lihat peserta ${title}`}
        title="Lihat peserta"
      >
        <Users size={15} />
      </Link>
      <Link
        href={`/admin/trips/${id}/edit`}
        className="flex h-8 w-8 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-800"
        aria-label={`Edit ${title}`}
        title="Edit"
      >
        <Pencil size={15} />
      </Link>
      <ConfirmButton
        onConfirm={() => deleteTrip(id)}
        confirmMessage={`Hapus trip "${title}"? Semua data peserta trip ini akan ikut terhapus.`}
        className="flex h-8 w-8 items-center justify-center rounded-md text-gray-500 hover:bg-red-50 hover:text-red-600"
      >
        <Trash2 size={15} />
      </ConfirmButton>
    </div>
  )
}