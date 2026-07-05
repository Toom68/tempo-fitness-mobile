import { SkeletonWorkoutCard } from "@/components/shared/skeleton-card";

export default function WorkoutsLoading() {
  return (
    <div className="space-y-5 md:space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-6 w-28 animate-pulse rounded-md bg-muted" />
          <div className="h-4 w-36 animate-pulse rounded-md bg-muted" />
        </div>
        <div className="h-8 w-20 animate-pulse rounded-md bg-muted" />
      </div>
      <div className="space-y-2 md:space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonWorkoutCard key={i} />
        ))}
      </div>
    </div>
  );
}
