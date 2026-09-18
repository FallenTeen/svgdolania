import Link from 'next/link'
import type { LucideIcon } from 'lucide-react'

export function StatCard({
  label,
  value,
  icon: Icon,
  href,
  accent = 'emerald',
  hint,
}: {
  label: string
  value: number | string
  icon: LucideIcon
  href?: string
  accent?: 'emerald' | 'amber' | 'sky' | 'rose'
  hint?: string
}) {
  const ACCENTS: Record<string, string> = {
    emerald: 'bg-[var(--color-primary-soft)] text-[var(--color-primary-dark)]',
    amber: 'bg-[var(--color-sun-soft)] text-[#7a5200]',
    sky: 'bg-[var(--color-sky-soft)] text-[#0f5b6b]',
    rose: 'bg-[var(--color-coral-soft)] text-[#8a2e1b]',
  }

  const content = (
    <div className="flex items-center gap-4 rounded-2xl border-2 border-[var(--color-ink)] bg-[var(--color-card)] p-5 shadow-[var(--shadow-pop-sm)] transition-transform hover:-translate-y-0.5">
      <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${ACCENTS[accent]}`}>
        <Icon size={22} strokeWidth={2.25} />
      </span>
      <div>
        <p className="font-display text-2xl font-extrabold text-[var(--color-ink)]">{value}</p>
        <p className="text-sm text-[var(--color-ink)]/60">{label}</p>
        {hint && <p className="mt-0.5 text-xs font-bold text-[var(--color-primary)]">{hint}</p>}
      </div>
    </div>
  )

  if (href) {
    return (
      <Link href={href} className="block">
        {content}
      </Link>
    )
  }
  return content
}
