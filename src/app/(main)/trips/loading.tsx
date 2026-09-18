export default function LoadingTrips() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="mb-8 h-10 w-2/3 animate-pulse rounded-full bg-[var(--color-primary-soft)] sm:w-1/3" />
      <div className="grid gap-5 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-32 animate-pulse rounded-3xl border-2 border-[var(--color-ink)]/10 bg-white" />
        ))}
      </div>
    </div>
  )
}
