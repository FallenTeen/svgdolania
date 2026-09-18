'use client'

import { useRef, useState } from 'react'
import { ImagePlus, Loader2, X } from 'lucide-react'
import type { ActionResult } from '@/lib/types'

export function ImageUploader({
  label,
  value,
  onChange,
  uploadAction,
}: {
  label: string
  value: string | null
  onChange: (url: string | null) => void
  uploadAction: (file: File) => Promise<ActionResult<string>>
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleFile(file: File | undefined) {
    if (!file) return
    setError(null)
    setIsUploading(true)
    const result = await uploadAction(file)
    setIsUploading(false)
    if (!result.success || !result.data) {
      setError(result.error ?? 'Gagal mengunggah gambar')
      return
    }
    onChange(result.data)
  }

  return (
    <div>
      <p className="mb-2 block text-sm font-medium text-gray-700">{label}</p>

      {value ? (
        <div className="relative inline-block">
          <img
            src={value}
            alt="Preview"
            className="h-32 w-52 rounded-lg border border-gray-200 object-cover"
          />
          <button
            type="button"
            onClick={() => onChange(null)}
            className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-white text-gray-600 shadow ring-1 ring-gray-200 hover:text-red-600"
            aria-label="Hapus gambar"
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={isUploading}
          className="flex h-32 w-52 flex-col items-center justify-center gap-1.5 rounded-lg border-2 border-dashed border-gray-300 text-gray-400 transition-colors hover:border-emerald-400 hover:text-emerald-600 disabled:opacity-60"
        >
          {isUploading ? <Loader2 size={20} className="animate-spin" /> : <ImagePlus size={20} />}
          <span className="text-xs font-medium">{isUploading ? 'Mengunggah...' : 'Pilih gambar'}</span>
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />

      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  )
}