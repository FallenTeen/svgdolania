import { Leaf, Sun, Flame } from 'lucide-react'
import type { Difficulty, TripStatus } from '@/lib/types'

const DIFFICULTY_CONFIG: Record<
  Difficulty,
  { label: string; icon: typeof Leaf; bg: string; fg: string; border: string }
> = {
  mudah: { label: 'Santai', icon: Leaf, bg: 'var(--color-primary-soft)', fg: 'var(--color-primary-dark)', border: 'var(--color-primary)' },
  menengah: { label: 'Menengah', icon: Sun, bg: 'var(--color-sun-soft)', fg: '#7a5200', border: '#c98f10' },
  sulit: { label: 'Menantang', icon: Flame, bg: 'var(--color-coral-soft)', fg: '#8a2e1b', border: 'var(--color-coral)' },
}

export function DifficultyBadge({ difficulty }: { difficulty: Difficulty | null }) {
  if (!difficulty) return null
  const c = DIFFICULTY_CONFIG[difficulty]
  const Icon = c.icon
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full border-2 px-2.5 py-1 text-xs font-bold font-display"
      style={{ backgroundColor: c.bg, color: c.fg, borderColor: c.border }}
    >
      <Icon size={13} strokeWidth={2.5} />
      {c.label}
    </span>
  )
}

const TRIP_STATUS_CONFIG: Record<TripStatus, { label: string; bg: string; fg: string }> = {
  open: { label: 'Slot terbuka', bg: 'var(--color-primary-soft)', fg: 'var(--color-primary-dark)' },
  full: { label: 'Penuh', bg: 'var(--color-coral-soft)', fg: '#8a2e1b' },
  closed: { label: 'Ditutup', bg: '#eee', fg: '#555' },
  cancelled: { label: 'Dibatalkan', bg: '#eee', fg: '#555' },
}

export function TripStatusBadge({ status }: { status: TripStatus }) {
  const c = TRIP_STATUS_CONFIG[status]
  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold font-display"
      style={{ backgroundColor: c.bg, color: c.fg }}
    >
      {c.label}
    </span>
  )
}

export function TripTypeBadge({ type }: { type: 'public' | 'private' }) {
  if (type === 'public') return null
  return (
    <span
      className="inline-flex items-center rounded-full border-2 px-2.5 py-1 text-xs font-bold font-display"
      style={{ backgroundColor: 'var(--color-sky-soft)', color: '#0f5b6b', borderColor: 'var(--color-sky)' }}
    >
      Trip privat
    </span>
  )
}

/** Chip putus-putus ala peta jalur — dipakai untuk tag & fasilitas, bisa jadi filter interaktif */
export function TagChip({
  children,
  active = false,
  onClick,
  as = 'span',
}: {
  children: React.ReactNode
  active?: boolean
  onClick?: () => void
  as?: 'span' | 'button'
}) {
  const classes = `trail-dashed inline-flex items-center rounded-full border-2 px-3 py-1.5 text-sm font-semibold transition-colors ${
    active
      ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]'
      : 'bg-white text-[var(--color-ink)] border-[var(--color-ink)] hover:bg-[var(--color-primary-soft)]'
  }`

  if (as === 'button') {
    return (
      <button type="button" onClick={onClick} className={classes}>
        {children}
      </button>
    )
  }
  return <span className={classes}>{children}</span>
}
