import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dumbbell, Plus, TrendingUp } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BackHeader } from "@/components/shared/back-header";
import { formatDate } from "@/lib/utils";

export default async function ExerciseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: exercise } = await supabase
    .from("exercises")
    .select("*")
    .eq("id", id)
    .single();

  if (!exercise) notFound();

  // Fetch all completed sets for this exercise, ordered by date
  const { data: setsHistory } = await supabase
    .from("workout_sets")
    .select(`
      weight,
      reps,
      completed,
      workout_exercises!inner(
        exercise_id,
        workout_id,
        workouts!inner(date, completed)
      )
    `)
    .eq("workout_exercises.exercise_id", id)
    .eq("workout_exercises.workouts.completed", true)
    .order("workout_exercises.workouts.date", { ascending: true });

  // Calculate 1RM estimates (Epley formula) per workout session
  const sessionMap = new Map<string, { date: string; max1RM: number; maxWeight: number }>();
  for (const ws of (setsHistory ?? []) as any[]) {
    if (!ws.completed) continue;
    const workout = ws.workout_exercises?.workouts;
    if (!workout) continue;
    const w = ws.weight ?? 0;
    const r = ws.reps ?? 0;
    if (w <= 0 || r <= 0) continue;
    const est1RM = w * (1 + r / 30);
    const key = workout.date;
    const existing = sessionMap.get(key);
    if (!existing || est1RM > existing.max1RM) {
      sessionMap.set(key, {
        date: workout.date,
        max1RM: Math.round(est1RM * 10) / 10,
        maxWeight: Math.max(existing?.maxWeight ?? 0, w),
      });
    }
  }

  const sessions = Array.from(sessionMap.values()).sort((a, b) =>
    a.date.localeCompare(b.date)
  );

  const current1RM = sessions.length > 0 ? sessions[sessions.length - 1].max1RM : 0;
  const first1RM = sessions.length > 0 ? sessions[0].max1RM : 0;
  const progress1RM = sessions.length > 1 ? current1RM - first1RM : 0;

  // Build simple sparkline SVG path
  const maxVal = Math.max(...sessions.map((s) => s.max1RM), 1);
  const minVal = Math.min(...sessions.map((s) => s.max1RM), 0);
  const range = maxVal - minVal || 1;
  const chartWidth = 300;
  const chartHeight = 80;
  const points = sessions.map((s, i) => {
    const x = sessions.length > 1 ? (i / (sessions.length - 1)) * chartWidth : chartWidth / 2;
    const y = chartHeight - ((s.max1RM - minVal) / range) * (chartHeight - 10) - 5;
    return `${x},${y}`;
  });
  const sparklinePath = points.length > 1 ? `M ${points.join(" L ")}` : "";

  return (
    <div className="space-y-5 md:space-y-6">
      <BackHeader title={exercise.name} href="/exercises" />

      <div className="flex flex-wrap gap-2">
        <Badge variant="secondary" className="capitalize">
          {exercise.muscle_group.replace("_", " ")}
        </Badge>
        <Badge variant="outline" className="capitalize">
          {exercise.equipment}
        </Badge>
        {exercise.secondary_muscles?.map((m: string) => (
          <Badge key={m} variant="outline" className="capitalize">
            {m.replace("_", " ")}
          </Badge>
        ))}
      </div>

      {/* 1RM Trend */}
      {sessions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-4 w-4 text-primary" />
              Strength Progression
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <p className="text-xs text-muted-foreground">Est. 1RM</p>
                <p className="text-lg font-bold">{current1RM} kg</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Max Weight</p>
                <p className="text-lg font-bold">
                  {sessions[sessions.length - 1].maxWeight} kg
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Progress</p>
                <p className={`text-lg font-bold ${progress1RM >= 0 ? "text-green-500" : "text-destructive"}`}>
                  {progress1RM >= 0 ? "+" : ""}{progress1RM.toFixed(1)} kg
                </p>
              </div>
            </div>

            {sparklinePath && (
              <div className="w-full overflow-x-auto">
                <svg
                  viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                  className="w-full h-20"
                  preserveAspectRatio="none"
                >
                  <path
                    d={sparklinePath}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="text-primary"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                  />
                  {points.map((p, i) => {
                    const [x, y] = p.split(",").map(Number);
                    return (
                      <circle key={i} cx={x} cy={y} r="3" className="text-primary fill-primary" />
                    );
                  })}
                </svg>
              </div>
            )}

            <div className="space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground">Recent Sessions</p>
              {sessions.slice(-5).reverse().map((s, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{formatDate(s.date)}</span>
                  <span className="font-medium">{s.max1RM} kg est. 1RM</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {exercise.instructions && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">How to Perform</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed text-muted-foreground">{exercise.instructions}</p>
          </CardContent>
        </Card>
      )}

      <Link href="/workouts/new">
        <Button className="w-full gap-2">
          <Plus className="h-4 w-4" /> Add to Workout
        </Button>
      </Link>
    </div>
  );
}
