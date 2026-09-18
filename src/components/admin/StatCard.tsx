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
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
    sky: 'bg-sky-50 text-sky-600',
    rose: 'bg-rose-50 text-rose-600',
  }

  const content = (
    <div className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-5 transition-shadow hover:shadow-sm">
      <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${ACCENTS[accent]}`}>
        <Icon size={22} strokeWidth={2} />
      </span>
      <div>
        <p className="text-2xl font-semibold text-gray-900">{value}</p>
        <p className="text-sm text-gray-500">{label}</p>
        {hint && <p className="mt-0.5 text-xs font-medium text-emerald-600">{hint}</p>}
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