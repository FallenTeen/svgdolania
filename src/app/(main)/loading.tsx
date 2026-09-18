export default function LoadingHome() {
  return (
    <div>
      <div className="h-[560px] w-full animate-pulse bg-[var(--color-primary-soft)] sm:h-[620px]" />
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="mb-8 h-10 w-1/3 animate-pulse rounded-full bg-[var(--color-primary-soft)]" />
        <div className="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="aspect-[4/3] animate-pulse rounded-3xl border-2 border-[var(--color-ink)]/10 bg-white"
            />
          ))}
        </div>
      </div>
    </div>
  )
}
