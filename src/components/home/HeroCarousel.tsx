'use client'

import { useEffect, useState } from 'react'

export function HeroCarousel({ images }: { images: { src: string; alt: string }[] }) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (images.length <= 1) return
    const timer = setInterval(() => setIndex((i) => (i + 1) % images.length), 4500)
    return () => clearInterval(timer)
  }, [images.length])

  if (images.length === 0) {
    return <div className="absolute inset-0 bg-[var(--color-primary)]" />
  }

  return (
    <div className="absolute inset-0">
      {images.map((img, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={img.src + i}
          src={img.src}
          alt={img.alt}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${
            i === index ? 'opacity-100' : 'opacity-0'
          }`}
        />
      ))}
      {images.length > 1 && (
        <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-1.5">
          {images.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full transition-all ${
                i === index ? 'w-6 bg-[var(--color-sun)]' : 'w-1.5 bg-white/60'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
