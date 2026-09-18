export default function LoadingCurugs() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="mb-8 h-10 w-2/3 animate-pulse rounded-full bg-[var(--color-primary-soft)] sm:w-1/3" />
      <div className="mb-8 h-14 w-full animate-pulse rounded-full bg-white" />
      <div className="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="aspect-[4/3] animate-pulse rounded-3xl border-2 border-[var(--color-ink)]/10 bg-white"
          />
        ))}
      </div>
    </div>
  )
}
