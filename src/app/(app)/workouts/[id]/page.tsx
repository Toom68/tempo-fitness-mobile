import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Calendar, Dumbbell, Pencil, Play } from "lucide-react";
import Link from "next/link";
import { formatDate, formatDuration } from "@/lib/utils";
import { notFound } from "next/navigation";
import { DeleteWorkoutButton } from "@/components/workout/delete-workout-button";
import { BackHeader } from "@/components/shared/back-header";
import { RepeatWorkoutButton } from "@/components/workout/repeat-workout-button";

export default async function WorkoutDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: workout } = await supabase
    .from("workouts")
    .select(`
      *,
      workout_exercises(
        id,
        order,
        notes,
        exercise:exercises(id, name, muscle_group, equipment),
        workout_sets(id, set_number, reps, weight, rpe, completed)
      )
    `)
    .eq("id", id)
    .eq("user_id", user!.id)
    .single();

  if (!workout) notFound();

  const exercises = workout.workout_exercises ?? [];
  exercises.sort((a: { order: number }, b: { order: number }) => a.order - b.order);

  return (
    <div className="space-y-5 md:space-y-6">
      <BackHeader
        title={workout.name}
        href="/workouts"
        rightSlot={
          <>
            <Link href={`/workouts/${id}/session`}>
              <Button size="sm" className="gap-2">
                <Play className="h-4 w-4" /> <span className="hidden sm:inline">Start Session</span><span className="sm:hidden">Start</span>
              </Button>
            </Link>
            <RepeatWorkoutButton workoutId={id} />
            <Link href={`/workouts/${id}/edit`}>
              <Button variant="outline" size="icon">
                <Pencil className="h-4 w-4" />
              </Button>
            </Link>
          </>
        }
      />

      <div className="flex items-center gap-2 text-xs text-muted-foreground md:gap-3 md:text-sm">
        <span className="flex items-center gap-1">
          <Calendar className="h-3.5 w-3.5" /> {formatDate(workout.date)}
        </span>
        {workout.duration ? (
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" /> {formatDuration(workout.duration)}
          </span>
        ) : null}
      </div>

      {workout.notes && (
        <Card>
          <CardContent className="py-4">
            <p className="text-sm text-muted-foreground">{workout.notes}</p>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3 md:space-y-4">
        {exercises.map((we: any) => {
          const sets = we.workout_sets ?? [];
          sets.sort((a: { set_number: number }, b: { set_number: number }) => a.set_number - b.set_number);
          const exercise = we.exercise;

          return (
            <Card key={we.id}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Dumbbell className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{exercise?.name}</CardTitle>
                    <div className="mt-1 flex gap-2">
                      <Badge variant="secondary" className="capitalize text-xs">
                        {exercise?.muscle_group?.replace("_", " ")}
                      </Badge>
                      <Badge variant="outline" className="capitalize text-xs">
                        {exercise?.equipment}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-[2rem_1fr_1fr_3rem] gap-2 text-xs font-medium text-muted-foreground">
                  <span>Set</span>
                  <span>Weight</span>
                  <span>Reps</span>
                  <span className="text-right">Done</span>
                </div>
                {sets.map((ws: any) => (
                  <div
                    key={ws.id}
                    className="grid grid-cols-[2rem_1fr_1fr_3rem] items-center gap-2 py-1.5 text-sm"
                  >
                    <span className="text-muted-foreground">{ws.set_number}</span>
                    <span>{ws.weight} kg</span>
                    <span>{ws.reps} reps</span>
                    <span className="text-right">
                      {ws.completed ? "✓" : "—"}
                    </span>
                  </div>
                ))}
                {we.notes && (
                  <p className="mt-2 border-t pt-2 text-xs text-muted-foreground">{we.notes}</p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {exercises.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Dumbbell className="mb-3 h-10 w-10 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">No exercises in this workout</p>
          </CardContent>
        </Card>
      )}

      <DeleteWorkoutButton workoutId={id} />
    </div>
  );
}
