'use client'

import { useCallback, useEffect, useState } from 'react'
import { X, ChevronLeft, ChevronRight, Images } from 'lucide-react'

export function Gallery({ images, name }: { images: string[]; name: string }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  const close = useCallback(() => setActiveIndex(null), [])
  const prev = useCallback(
    () => setActiveIndex((i) => (i === null ? null : (i - 1 + images.length) % images.length)),
    [images.length]
  )
  const next = useCallback(
    () => setActiveIndex((i) => (i === null ? null : (i + 1) % images.length)),
    [images.length]
  )

  useEffect(() => {
    if (activeIndex === null) return
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') close()
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') next()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [activeIndex, close, prev, next])

  if (!images.length) return null

  return (
    <div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {images.map((src, i) => (
          <button
            key={src + i}
            type="button"
            onClick={() => setActiveIndex(i)}
            className="group relative aspect-square overflow-hidden rounded-2xl border-2 border-[var(--color-ink)] shadow-[var(--shadow-pop-sm)]"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt={`${name} - foto ${i + 1}`}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
              loading="lazy"
            />
            {i === 3 && images.length > 4 && (
              <div className="absolute inset-0 flex items-center justify-center gap-1.5 bg-black/60 font-display font-bold text-white">
                <Images size={16} />+{images.length - 4}
              </div>
            )}
          </button>
        ))}
      </div>

      {activeIndex !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={close}
          role="dialog"
          aria-modal="true"
          aria-label={`Galeri foto ${name}`}
        >
          <button
            type="button"
            onClick={close}
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full border-2 border-white text-white"
            aria-label="Tutup galeri"
          >
            <X size={20} />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              prev()
            }}
            className="absolute left-2 flex h-11 w-11 items-center justify-center rounded-full border-2 border-white text-white sm:left-6"
            aria-label="Foto sebelumnya"
          >
            <ChevronLeft size={22} />
          </button>

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={images[activeIndex]}
            alt={`${name} - foto ${activeIndex + 1}`}
            className="max-h-[85vh] max-w-full rounded-xl object-contain"
            onClick={(e) => e.stopPropagation()}
          />

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              next()
            }}
            className="absolute right-2 flex h-11 w-11 items-center justify-center rounded-full border-2 border-white text-white sm:right-6"
            aria-label="Foto berikutnya"
          >
            <ChevronRight size={22} />
          </button>

          <p className="absolute bottom-4 font-display text-sm font-bold text-white/70">
            {activeIndex + 1} / {images.length}
          </p>
        </div>
      )}
    </div>
  )
}
