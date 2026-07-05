import { SkeletonStatCard, SkeletonWorkoutCard } from "@/components/shared/skeleton-card";

export default function DashboardLoading() {
  return (
    <div className="space-y-5 md:space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-6 w-44 animate-pulse rounded-md bg-muted" />
          <div className="h-4 w-32 animate-pulse rounded-md bg-muted" />
        </div>
        <div className="h-8 w-20 animate-pulse rounded-md bg-muted" />
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonStatCard key={i} />
        ))}
      </div>

      {/* Two summary cards */}
      <div className="grid gap-3 md:gap-4 lg:grid-cols-2">
        <div className="rounded-xl border bg-card p-4 space-y-3">
          <div className="h-4 w-20 animate-pulse rounded-md bg-muted" />
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex justify-between">
              <div className="h-3 w-24 animate-pulse rounded-md bg-muted" />
              <div className="h-3 w-10 animate-pulse rounded-md bg-muted" />
            </div>
          ))}
        </div>
        <div className="rounded-xl border bg-card p-4 space-y-3">
          <div className="h-4 w-32 animate-pulse rounded-md bg-muted" />
          <div className="flex items-end gap-2 h-32">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="flex flex-1 flex-col items-center gap-1">
                <div className="w-full animate-pulse rounded-t bg-muted" style={{ height: `${20 + Math.random() * 60}%` }} />
                <div className="h-3 w-4 animate-pulse rounded bg-muted" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent workouts */}
      <div className="space-y-2 md:space-y-3">
        <div className="h-5 w-36 animate-pulse rounded-md bg-muted mb-3" />
        {Array.from({ length: 3 }).map((_, i) => (
          <SkeletonWorkoutCard key={i} />
        ))}
      </div>
    </div>
  );
}
