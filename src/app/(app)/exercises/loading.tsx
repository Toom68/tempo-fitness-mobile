import { SkeletonExerciseCard } from "@/components/shared/skeleton-card";

export default function ExercisesLoading() {
  return (
    <div className="space-y-5 md:space-y-6">
      <div className="space-y-2">
        <div className="h-6 w-32 animate-pulse rounded-md bg-muted" />
        <div className="h-4 w-48 animate-pulse rounded-md bg-muted" />
      </div>
      <div className="h-10 w-full animate-pulse rounded-lg bg-muted" />
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 9 }).map((_, i) => (
          <SkeletonExerciseCard key={i} />
        ))}
      </div>
    </div>
  );
}
