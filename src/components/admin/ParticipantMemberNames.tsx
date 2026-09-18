'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

export function ParticipantMemberNames({ names }: { names: string[] }) {
  const [open, setOpen] = useState(false)

  if (names.length <= 1) {
    return <p className="text-xs text-gray-500">{names[0] ?? '-'}</p>
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-gray-800"
      >
        {names.length} nama anggota
        {open ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
      </button>
      {open && (
        <ul className="mt-1 list-disc space-y-0.5 pl-4 text-xs text-gray-500">
          {names.map((name, i) => (
            <li key={i}>{name}</li>
          ))}
        </ul>
      )}
    </div>
  )
}