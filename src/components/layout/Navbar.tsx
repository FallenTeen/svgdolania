'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, Droplets } from 'lucide-react'

const LINKS = [
  { href: '/', label: 'Home' },
  { href: '/curugs', label: 'Katalog Curug' },
  { href: '/trips', label: 'Trip' },
  { href: '/artikel', label: 'Artikel' },
]

export function Navbar() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-40 border-b-2 border-[var(--color-ink)] bg-[var(--color-bg)]/95 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-display text-xl font-extrabold text-[var(--color-primary)]">
          <span className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-[var(--color-ink)] bg-[var(--color-sun)] shadow-[var(--shadow-pop-sm)]">
            <Droplets size={18} strokeWidth={2.5} className="text-[var(--color-ink)]" />
          </span>
          Explore Curug
          <span className="hidden text-[var(--color-coral)] sm:inline">Banyumas</span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {LINKS.map((link) => {
            const isActive = pathname === link.href || pathname?.startsWith(`${link.href}/`)
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-full px-4 py-2 font-display text-sm font-bold transition-colors ${
                  isActive
                    ? 'bg-[var(--color-primary)] text-white'
                    : 'text-[var(--color-ink)] hover:bg-[var(--color-primary-soft)]'
                }`}
              >
                {link.label}
              </Link>
            )
          })}
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[var(--color-ink)] md:hidden"
          aria-label={open ? 'Tutup menu' : 'Buka menu'}
          aria-expanded={open}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      {open && (
        <div className="border-t-2 border-[var(--color-ink)] bg-[var(--color-bg)] px-4 py-3 md:hidden">
          <div className="flex flex-col gap-1">
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-xl px-3 py-2.5 font-display text-base font-bold text-[var(--color-ink)] hover:bg-[var(--color-primary-soft)]"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  )
}
