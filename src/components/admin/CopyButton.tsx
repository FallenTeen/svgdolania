'use client'

import { useState } from 'react'
import { Copy, Check } from 'lucide-react'

export function CopyButton({ value, label }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // Clipboard API bisa gagal di browser lama/insecure context — abaikan saja.
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800"
      title="Salin"
    >
      {copied ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
      {label ?? (copied ? 'Tersalin' : 'Salin')}
    </button>
  )
}