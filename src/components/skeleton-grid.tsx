export function SkeletonGrid() {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 4 }).map((_, idx) => (
        <div key={idx} className="panel h-28 animate-pulse bg-white/[0.04]" />
      ))}
    </div>
  )
}
