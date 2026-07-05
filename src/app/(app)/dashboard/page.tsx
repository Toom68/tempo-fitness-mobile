import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dumbbell, Flame, Calendar, Plus, Clock, Target } from "lucide-react";
import Link from "next/link";
import { formatDate, formatDuration } from "@/lib/utils";
import { RepeatWorkoutButton } from "@/components/workout/repeat-workout-button";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const [{ data: profile }, { data: recentWorkouts }, { data: allWorkouts }, { data: userBadges }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase
      .from("workouts")
      .select("*, workout_exercises(exercise_id, workout_sets(reps, weight))")
      .eq("user_id", user.id)
      .order("date", { ascending: false })
      .limit(5),
    supabase
      .from("workouts")
      .select("id, date, duration, completed, workout_exercises(workout_sets(reps, weight))")
      .eq("user_id", user.id)
      .eq("completed", true),
    supabase
      .from("user_badges")
      .select("badge:badges(name, description, icon), earned_at")
      .eq("user_id", user.id)
      .order("earned_at", { ascending: false })
      .limit(8),
  ]);

  const totalWorkouts = allWorkouts?.length ?? 0;
  const totalDuration = allWorkouts?.reduce((sum, w) => sum + (w.duration ?? 0), 0) ?? 0;

  let totalVolume = 0;
  for (const w of allWorkouts ?? []) {
    for (const we of w.workout_exercises ?? []) {
      for (const ws of we.workout_sets ?? []) {
        totalVolume += (ws.reps ?? 0) * (ws.weight ?? 0);
      }
    }
  }

  const now = new Date();
  let streak = 0;
  if (allWorkouts && allWorkouts.length > 0) {
    const dates = [...new Set(allWorkouts.map((w) => w.date))].sort().reverse();
    for (let i = 0; i < dates.length; i++) {
      const expected = new Date(now);
      expected.setDate(expected.getDate() - i);
      const expectedStr = expected.toISOString().split("T")[0];
      if (dates[i] === expectedStr) streak++;
      else break;
    }
  }

  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const weekWorkouts = (allWorkouts ?? []).filter((w) => new Date(w.date) >= weekAgo);
  const weekVolume = weekWorkouts.reduce((sum, w) => {
    let vol = 0;
    for (const we of w.workout_exercises ?? []) {
      for (const ws of we.workout_sets ?? []) {
        vol += (ws.reps ?? 0) * (ws.weight ?? 0);
      }
    }
    return sum + vol;
  }, 0);

  const lastWeekAgo = new Date();
  lastWeekAgo.setDate(lastWeekAgo.getDate() - 14);
  const prevWeekWorkouts = (allWorkouts ?? []).filter(
    (w) => new Date(w.date) >= lastWeekAgo && new Date(w.date) < weekAgo
  );
  const weekChange = weekWorkouts.length - prevWeekWorkouts.length;

  const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const dayCounts = [0, 0, 0, 0, 0, 0, 0];
  for (const w of allWorkouts ?? []) {
    const day = new Date(w.date).getDay();
    dayCounts[day === 0 ? 6 : day - 1]++;
  }
  const maxDayCount = Math.max(...dayCounts, 1);

  const unit = profile?.unit_pref ?? "kg";

  return (
    <div className="space-y-5 md:space-y-6">
      <div className="flex items-center justify-between">
        <div className="min-w-0">
          <h1 className="truncate text-xl font-bold md:text-2xl">Welcome back{profile?.display_name ? `, ${profile.display_name}` : ""}</h1>
          <p className="text-sm text-muted-foreground">Let&apos;s check your progress</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {recentWorkouts && recentWorkouts.length > 0 && (
            <RepeatWorkoutButton workoutId={recentWorkouts[0].id} />
          )}
          <Link href="/workouts/new">
            <Button className="gap-2" size="sm">
              <Plus className="h-4 w-4" /> <span className="hidden sm:inline">New Workout</span><span className="sm:hidden">New</span>
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Workouts</CardTitle>
            <Dumbbell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalWorkouts}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Current Streak</CardTitle>
            <Flame className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{streak} {streak === 1 ? "day" : "days"}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatDuration(totalDuration)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Volume</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalVolume.toLocaleString()} {unit}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-3 md:gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">This Week</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Workouts</span>
              <span className="font-semibold">{weekWorkouts.length}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Volume</span>
              <span className="font-semibold">{weekVolume.toLocaleString()} {unit}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">vs last week</span>
              <span className={`font-semibold ${weekChange >= 0 ? "text-green-500" : "text-destructive"}`}>
                {weekChange >= 0 ? "+" : ""}{weekChange}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Workout Frequency</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between gap-2 h-32">
              {dayLabels.map((day, i) => (
                <div key={day} className="flex flex-1 flex-col items-center gap-1">
                  <div
                    className="w-full rounded-t bg-primary/80 transition-all"
                    style={{ height: `${(dayCounts[i] / maxDayCount) * 100}%`, minHeight: dayCounts[i] > 0 ? "8px" : "2px" }}
                  />
                  <span className="text-xs text-muted-foreground">{day}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {userBadges && userBadges.length > 0 && (
        <div>
          <h2 className="mb-3 text-base font-semibold md:text-lg">Achievements</h2>
          <div className="flex flex-wrap gap-2">
            {userBadges.map((ub: any, i: number) => (
              <div
                key={i}
                className="flex items-center gap-2 rounded-lg border bg-card px-3 py-2"
                title={ub.badge?.description}
              >
                <span className="text-xl">{ub.badge?.icon}</span>
                <div className="min-w-0">
                  <p className="truncate text-xs font-medium">{ub.badge?.name}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-semibold md:text-lg">Recent Workouts</h2>
          <Link href="/workouts" className="text-sm text-muted-foreground active:text-foreground">
            View all
          </Link>
        </div>
        {recentWorkouts && recentWorkouts.length > 0 ? (
          <div className="space-y-2 md:space-y-3">
            {recentWorkouts.map((workout) => {
              const exList = workout.workout_exercises ?? [];
              let vol = 0;
              for (const we of exList) {
                for (const ws of we.workout_sets ?? []) {
                  vol += (ws.reps ?? 0) * (ws.weight ?? 0);
                }
              }
              return (
                <Link key={workout.id} href={`/workouts/${workout.id}`}>
                  <Card className="cursor-pointer transition-colors active:bg-accent/50 md:hover:bg-accent/50">
                    <CardContent className="flex items-center justify-between py-3 md:py-4">
                      <div className="flex min-w-0 items-center gap-3 md:gap-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                          <Calendar className="h-5 w-5 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-medium">{workout.name}</p>
                          <p className="text-xs text-muted-foreground md:text-sm">
                            {formatDate(workout.date)}
                            {workout.duration ? ` · ${formatDuration(workout.duration)}` : ""}
                          </p>
                        </div>
                      </div>
                      <div className="shrink-0 text-right text-xs text-muted-foreground md:text-sm">
                        <p>{exList.length} ex</p>
                        {vol > 0 && <p className="text-[11px]">{vol.toLocaleString()} {unit}</p>}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <Dumbbell className="mb-3 h-10 w-10 text-muted-foreground" />
              <p className="mb-1 font-medium">No workouts yet</p>
              <p className="mb-4 text-sm text-muted-foreground">Start your fitness journey today</p>
              <Link href="/workouts/new">
                <Button className="gap-2">
                  <Plus className="h-4 w-4" /> Create First Workout
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
