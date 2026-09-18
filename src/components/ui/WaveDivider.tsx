/**
 * Gelombang air sebagai pembatas antar-section — satu motif "berani" yang
 * dipakai konsisten di beberapa titik kunci (bukan di semua section) supaya
 * jadi ciri khas, bukan dekorasi berulang yang tumpul.
 */
export function WaveDivider({
  color,
  flip = false,
}: {
  /** Nilai CSS var atau hex warna yang akan MENGISI gelombang, biasanya warna section di bawahnya */
  color: string
  flip?: boolean
}) {
  return (
    <div aria-hidden className={`w-full overflow-hidden leading-none ${flip ? 'rotate-180' : ''}`}>
      <svg viewBox="0 0 1440 60" className="block h-8 w-full md:h-14" preserveAspectRatio="none">
        <path
          d="M0,24 C220,60 380,0 620,18 C860,36 1040,54 1220,28 C1320,14 1400,10 1440,16 L1440,60 L0,60 Z"
          fill={color}
        />
      </svg>
    </div>
  )
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string
  title: string
  description?: string
  action?: { href: string; label: string }
}) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow && (
          <span className="mb-2 inline-block rounded-full bg-[var(--color-sun-soft)] px-3 py-1 text-sm font-bold text-[#7a5200] font-display">
            {eyebrow}
          </span>
        )}
        <h2 className="font-display text-3xl font-extrabold text-[var(--color-ink)] sm:text-4xl">
          {title}
        </h2>
        {description && <p className="mt-2 max-w-xl text-[var(--color-ink)]/70">{description}</p>}
      </div>
      {action && (
        <a
          href={action.href}
          className="inline-flex shrink-0 items-center gap-1 font-display font-bold text-[var(--color-primary)] underline decoration-2 underline-offset-4 hover:text-[var(--color-primary-dark)]"
        >
          {action.label}
        </a>
      )}
    </div>
  )
}
