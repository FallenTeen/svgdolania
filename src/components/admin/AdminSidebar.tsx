'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  MapPin,
  CalendarDays,
  ClipboardList,
  Users,
  Newspaper,
  LogOut,
  Menu,
  X,
  Droplets,
  ExternalLink,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const NAV_ITEMS = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/curugs', label: 'Curug', icon: MapPin },
  { href: '/admin/trips', label: 'Trip & Availability', icon: CalendarDays },
  { href: '/admin/trip-requests', label: 'Request Trip', icon: ClipboardList },
  { href: '/admin/peserta', label: 'Peserta', icon: Users },
  { href: '/admin/artikel', label: 'Artikel', icon: Newspaper },
]

function isActivePath(pathname: string, href: string, exact?: boolean) {
  if (exact) return pathname === href
  return pathname === href || pathname.startsWith(`${href}/`)
}

function Brand() {
  return (
    <div className="flex items-center gap-2.5 px-5 py-4">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-[var(--color-ink)] bg-[var(--color-primary)] text-white shadow-[var(--shadow-pop-sm)]">
        <Droplets size={17} strokeWidth={2.5} />
      </span>
      <div className="leading-tight">
        <p className="font-display text-sm font-extrabold text-[var(--color-ink)]">Explore Curug</p>
        <p className="text-xs text-[var(--color-ink)]/50">Panel Admin</p>
      </div>
    </div>
  )
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()
  const router = useRouter()
  const [loggingOut, setLoggingOut] = useState(false)

  async function handleLogout() {
    setLoggingOut(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/admin/login')
    router.refresh()
  }

  return (
    <div className="flex h-full flex-col">
      <div className="hidden border-b-2 border-[var(--color-ink)]/10 md:block">
        <Brand />
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {NAV_ITEMS.map((item) => {
          const active = isActivePath(pathname ?? '', item.href, item.exact)
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors ${
                active
                  ? 'bg-[var(--color-primary)] text-white'
                  : 'text-[var(--color-ink)]/70 hover:bg-[var(--color-primary-soft)] hover:text-[var(--color-ink)]'
              }`}
            >
              <Icon size={18} strokeWidth={2.25} />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="space-y-1 border-t-2 border-[var(--color-ink)]/10 px-3 py-4">
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-[var(--color-ink)]/70 transition-colors hover:bg-[var(--color-primary-soft)] hover:text-[var(--color-ink)]"
        >
          <ExternalLink size={18} strokeWidth={2.25} />
          Lihat situs publik
        </a>
        <button
          type="button"
          onClick={handleLogout}
          disabled={loggingOut}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-[var(--color-coral)] transition-colors hover:bg-[var(--color-coral-soft)] disabled:opacity-60"
        >
          <LogOut size={18} strokeWidth={2.25} />
          {loggingOut ? 'Keluar...' : 'Logout'}
        </button>
      </div>
    </div>
  )
}

export function AdminSidebar() {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 border-r-2 border-[var(--color-ink)]/10 bg-[var(--color-card)] md:block">
        <div className="sticky top-0 h-screen">
          <SidebarContent />
        </div>
      </aside>

      {/* Mobile topbar */}
      <div className="sticky top-0 z-30 flex items-center justify-between border-b-2 border-[var(--color-ink)]/10 bg-[var(--color-card)] px-4 py-3 md:hidden">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-[var(--color-ink)] bg-[var(--color-primary)] text-white">
            <Droplets size={15} strokeWidth={2.5} />
          </span>
          <p className="font-display text-sm font-extrabold text-[var(--color-ink)]">Panel Admin</p>
        </div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Buka menu"
          className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-[var(--color-ink)]/15 text-[var(--color-ink)]/70"
        >
          <Menu size={20} />
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="absolute inset-0 bg-[var(--color-ink)]/40"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute inset-y-0 left-0 w-72 max-w-[85vw] border-r-2 border-[var(--color-ink)] bg-[var(--color-card)] shadow-[var(--shadow-pop-lg)]">
            <div className="flex items-center justify-between border-b-2 border-[var(--color-ink)]/10">
              <Brand />
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Tutup menu"
                className="mr-3 flex h-9 w-9 items-center justify-center rounded-full text-[var(--color-ink)]/50 hover:bg-black/5"
              >
                <X size={20} />
              </button>
            </div>
            <SidebarContent onNavigate={() => setOpen(false)} />
          </div>
        </div>
      )}
    </>
  )
}
