'use client'

import { useRef, useState } from 'react'
import { ImagePlus, Loader2, X } from 'lucide-react'
import type { ActionResult } from '@/lib/types'

export function GalleryUploader({
  value,
  onChange,
  uploadAction,
}: {
  value: string[]
  onChange: (urls: string[]) => void
  uploadAction: (file: File) => Promise<ActionResult<string>>
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return
    setError(null)
    setIsUploading(true)

    const files = Array.from(fileList)
    const uploaded: string[] = []
    let failCount = 0

    for (const file of files) {
      const result = await uploadAction(file)
      if (result.success && result.data) {
        uploaded.push(result.data)
      } else {
        failCount += 1
      }
    }

    setIsUploading(false)
    if (uploaded.length > 0) onChange([...value, ...uploaded])
    if (failCount > 0) setError(`${failCount} gambar gagal diunggah`)
  }

  function removeAt(index: number) {
    onChange(value.filter((_, i) => i !== index))
  }

  return (
    <div>
      <p className="mb-2 block text-sm font-medium text-gray-700">Galeri Foto</p>

      <div
        onDragOver={(e) => {
          e.preventDefault()
          setIsDragging(true)
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault()
          setIsDragging(false)
          handleFiles(e.dataTransfer.files)
        }}
        onClick={() => inputRef.current?.click()}
        className={`flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-lg border-2 border-dashed px-4 py-6 text-center transition-colors ${
          isDragging
            ? 'border-emerald-500 bg-emerald-50 text-emerald-600'
            : 'border-gray-300 text-gray-400 hover:border-emerald-400 hover:text-emerald-600'
        }`}
      >
        {isUploading ? <Loader2 size={20} className="animate-spin" /> : <ImagePlus size={20} />}
        <p className="text-sm font-medium">
          {isUploading ? 'Mengunggah...' : 'Seret & lepas foto di sini, atau klik untuk pilih'}
        </p>
        <p className="text-xs text-gray-400">Bisa pilih beberapa foto sekaligus</p>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}

      {value.length > 0 && (
        <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
          {value.map((url, i) => (
            <div key={url + i} className="group relative aspect-square overflow-hidden rounded-lg border border-gray-200">
              <img src={url} alt={`Galeri ${i + 1}`} className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => removeAt(i)}
                className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-white/90 text-gray-600 opacity-0 shadow ring-1 ring-gray-200 transition-opacity group-hover:opacity-100 hover:text-red-600"
                aria-label="Hapus foto"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}