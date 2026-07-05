import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus, Calendar, Dumbbell, Clock } from "lucide-react";
import { formatDate, formatDuration } from "@/lib/utils";

export default async function WorkoutsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: workouts } = await supabase
    .from("workouts")
    .select(`
      *,
      workout_exercises(
        id,
        workout_sets(id, reps, weight)
      )
    `)
    .eq("user_id", user!.id)
    .order("date", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Workouts</h1>
          <p className="text-sm text-muted-foreground">Your training history</p>
        </div>
        <Link href="/workouts/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" /> New Workout
          </Button>
        </Link>
      </div>

      {workouts && workouts.length > 0 ? (
        <div className="space-y-3">
          {workouts.map((workout) => {
            const exList = workout.workout_exercises ?? [];
            const exerciseCount = exList.length;
            let totalSets = 0;
            let totalVolume = 0;
            for (const we of exList) {
              for (const ws of we.workout_sets ?? []) {
                totalSets++;
                totalVolume += ws.reps * ws.weight;
              }
            }

            return (
              <Link key={workout.id} href={`/workouts/${workout.id}`}>
                <Card className="cursor-pointer transition-colors hover:bg-accent/50">
                  <CardContent className="flex items-center justify-between py-4">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                        <Dumbbell className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{workout.name}</p>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" /> {formatDate(workout.date)}
                          </span>
                          {workout.duration ? (
                            <span className="flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5" /> {formatDuration(workout.duration)}
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </div>
                    <div className="text-right text-sm text-muted-foreground">
                      <p>{exerciseCount} exercises · {totalSets} sets</p>
                      {totalVolume > 0 && <p className="text-xs">{totalVolume.toLocaleString()} volume</p>}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Dumbbell className="mb-3 h-12 w-12 text-muted-foreground" />
            <p className="mb-1 font-medium">No workouts yet</p>
            <p className="mb-4 text-sm text-muted-foreground">Create your first workout to start tracking</p>
            <Link href="/workouts/new">
              <Button className="gap-2">
                <Plus className="h-4 w-4" /> Create Workout
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
