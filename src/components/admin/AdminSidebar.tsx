'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  MapPin,
  CalendarDays,
  Users,
  Newspaper,
  LogOut,
  Menu,
  X,
  Droplets,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const NAV_ITEMS = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/curugs', label: 'Curug', icon: MapPin },
  { href: '/admin/trips', label: 'Trip & Availability', icon: CalendarDays },
  { href: '/admin/peserta', label: 'Peserta', icon: Users },
  { href: '/admin/artikel', label: 'Artikel', icon: Newspaper },
]

function isActivePath(pathname: string, href: string, exact?: boolean) {
  if (exact) return pathname === href
  return pathname === href || pathname.startsWith(`${href}/`)
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
      <div className="flex items-center gap-2 border-b border-gray-200 px-5 py-4">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-white">
          <Droplets size={16} strokeWidth={2.5} />
        </span>
        <div className="leading-tight">
          <p className="text-sm font-semibold text-gray-900">Explore Curug</p>
          <p className="text-xs text-gray-500">Panel Admin</p>
        </div>
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
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                active
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <Icon size={18} strokeWidth={2} />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-gray-200 px-3 py-4">
        <button
          type="button"
          onClick={handleLogout}
          disabled={loggingOut}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-60"
        >
          <LogOut size={18} strokeWidth={2} />
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
      <aside className="hidden w-64 shrink-0 border-r border-gray-200 bg-white md:block">
        <div className="sticky top-0 h-screen">
          <SidebarContent />
        </div>
      </aside>

      {/* Mobile topbar */}
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3 md:hidden">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-white">
            <Droplets size={16} strokeWidth={2.5} />
          </span>
          <p className="text-sm font-semibold text-gray-900">Panel Admin</p>
        </div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Buka menu"
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-300 text-gray-600"
        >
          <Menu size={20} />
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute inset-y-0 left-0 w-72 max-w-[85vw] bg-white shadow-xl">
            <div className="flex items-center justify-end px-3 pt-3">
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Tutup menu"
                className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100"
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