"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Check, Timer, Pause, Play, SkipForward, X, Dumbbell, Trophy } from "lucide-react";
import { formatDuration } from "@/lib/utils";
import { Native } from "@/lib/native";

interface WorkoutSet {
  id: string;
  set_number: number;
  reps: number;
  weight: number;
  completed: boolean;
}

interface WorkoutExercise {
  id: string;
  order: number;
  exercise: { id: string; name: string; muscle_group: string; equipment: string };
  workout_sets: WorkoutSet[];
}

const REST_PRESETS = [60, 90, 120, 180, 300];

export default function SessionPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const supabase = createClient();

  const [workoutName, setWorkoutName] = useState("");
  const [exercises, setExercises] = useState<WorkoutExercise[]>([]);
  const [currentExIndex, setCurrentExIndex] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(true);
  const [restSeconds, setRestSeconds] = useState(0);
  const [restRunning, setRestRunning] = useState(false);
  const [restInitial, setRestInitial] = useState(90);
  const [completedSets, setCompletedSets] = useState<Set<string>>(new Set());
  const [finishing, setFinishing] = useState(false);
  const [prs, setPrs] = useState<string[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const restIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    async function load() {
      const { data: workout } = await supabase
        .from("workouts")
        .select("*, workout_exercises(id, order, exercise:exercises(id, name, muscle_group, equipment), workout_sets(id, set_number, reps, weight, completed))")
        .eq("id", params.id)
        .single();

      if (workout) {
        setWorkoutName(workout.name);
        const sorted = (workout.workout_exercises ?? []).sort(
          (a: { order: number }, b: { order: number }) => a.order - b.order
        );
        setExercises(
          sorted.map((we: any) => ({
            id: we.id,
            order: we.order,
            exercise: we.exercise,
            workout_sets: (we.workout_sets ?? []).sort(
              (a: { set_number: number }, b: { set_number: number }) => a.set_number - b.set_number
            ),
          }))
        );
        setLoaded(true);
      }
    }
    load();
  }, [params.id, supabase]);

  useEffect(() => {
    if (!running) return;
    intervalRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running]);

  useEffect(() => {
    if (!restRunning) return;
    restIntervalRef.current = setInterval(() => {
      setRestSeconds((s) => {
        if (s <= 1) {
          setRestRunning(false);
          if (restIntervalRef.current) clearInterval(restIntervalRef.current);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => { if (restIntervalRef.current) clearInterval(restIntervalRef.current); };
  }, [restRunning]);

  const startRest = useCallback((seconds: number) => {
    setRestInitial(seconds);
    setRestSeconds(seconds);
    setRestRunning(true);
  }, []);

  const toggleSet = useCallback((setId: string) => {
    setCompletedSets((prev) => {
      const next = new Set(prev);
      const isCompleting = !next.has(setId);
      if (isCompleting) {
        next.add(setId);
        Native.haptics.impact("medium");
      } else {
        next.delete(setId);
        Native.haptics.impact("light");
      }
      // Optimistic persist — fire and forget, don't block UI
      supabase
        .from("workout_sets")
        .update({ completed: isCompleting })
        .eq("id", setId)
        .then(({ error }) => {
          if (error) console.warn("Failed to persist set toggle:", error.message);
        });
      return next;
    });
  }, []);

  const updateSetValue = useCallback((setId: string, field: "reps" | "weight", value: number) => {
    setExercises((prev) =>
      prev.map((ex) => ({
        ...ex,
        workout_sets: ex.workout_sets.map((s) =>
          s.id === setId ? { ...s, [field]: value } : s
        ),
      }))
    );
    // Debounced persist — save after user stops editing
    const key = `set_${setId}_${field}`;
    if ((window as any).__setDebounce?.[key]) clearTimeout((window as any).__setDebounce[key]);
    (window as any).__setDebounce = (window as any).__setDebounce || {};
    (window as any).__setDebounce[key] = setTimeout(() => {
      supabase
        .from("workout_sets")
        .update({ [field]: value })
        .eq("id", setId)
        .then(({ error }) => {
          if (error) console.warn("Failed to persist set value:", error.message);
        });
    }, 800);
  }, []);

  const totalSets = exercises.reduce((sum, ex) => sum + ex.workout_sets.length, 0);
  const doneSets = completedSets.size;
  const progress = totalSets > 0 ? Math.round((doneSets / totalSets) * 100) : 0;

  async function handleFinish() {
    setFinishing(true);
    Native.haptics.notification();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const newPrs: string[] = [];

    for (const ex of exercises) {
      // Find the max weight logged in this session for this exercise
      const sessionMax = ex.workout_sets
        .filter((ws) => completedSets.has(ws.id) && ws.weight > 0)
        .reduce((max, ws) => Math.max(max, ws.weight), 0);

      if (sessionMax > 0) {
        // Check historical max weight for this exercise (excluding this workout)
        const { data: prevSets } = await supabase
          .from("workout_sets")
          .select("weight, workout_exercises!inner(workout_id, exercise_id, workouts!inner(completed))")
          .eq("workout_exercises.exercise_id", ex.exercise.id)
          .neq("workout_exercises.workout_id", params.id)
          .eq("workout_exercises.workouts.completed", true)
          .order("weight", { ascending: false })
          .limit(1);

        const prevMax = prevSets?.[0]?.weight ?? 0;
        if (sessionMax > prevMax && ex.exercise?.name) {
          newPrs.push(ex.exercise.name);
        }
      }

      for (const ws of ex.workout_sets) {
        const completed = completedSets.has(ws.id);
        await supabase
          .from("workout_sets")
          .update({ completed, reps: ws.reps, weight: ws.weight })
          .eq("id", ws.id);
      }
    }

    await supabase
      .from("workouts")
      .update({ completed: true, duration: elapsed })
      .eq("id", params.id);

    // Check for new badges (fire and forget)
    fetch("/api/badges/check", { method: "POST" }).catch(() => {});

    if (newPrs.length > 0) {
      Native.haptics.impact("heavy");
      setPrs(newPrs);
      setTimeout(() => {
        router.push(`/workouts/${params.id}`);
        router.refresh();
      }, 2200);
    } else {
      router.push(`/workouts/${params.id}`);
      router.refresh();
    }
  }

  if (!loaded) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  const currentEx = exercises[currentExIndex];

  return (
    <div className="space-y-4 pb-24">
      {/* PR celebration overlay */}
      {prs.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4 text-center px-6">
            <div className="text-6xl">🏆</div>
            <h2 className="text-2xl font-bold text-primary">New Personal Record!</h2>
            <p className="text-muted-foreground">
              {prs.length === 1
                ? `You hit a new PR on ${prs[0]}!`
                : `New PRs on: ${prs.join(", ")}!`}
            </p>
          </div>
        </div>
      )}
      {/* Header with timer */}
      <div className="sticky top-0 z-20 -mx-4 border-b bg-background/95 px-4 py-3 pt-[max(env(safe-area-inset-top),0.75rem)] backdrop-blur md:static md:top-0 md:mx-0 md:rounded-lg md:border">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => router.push(`/workouts/${params.id}`)}>
              <X className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-lg font-bold">{workoutName}</h1>
              <p className="text-xs text-muted-foreground">{doneSets}/{totalSets} sets · {progress}%</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 rounded-lg bg-muted px-3 py-1.5">
              <Timer className="h-4 w-4 text-primary" />
              <span className="font-mono text-sm font-semibold">{formatDuration(elapsed)}</span>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setRunning(!running)}>
              {running ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
          </div>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
          <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Rest timer overlay */}
      {restRunning && (
        <Card className="fixed inset-x-4 bottom-4 z-30 border-primary/50 bg-card/95 backdrop-blur md:inset-x-auto md:right-8 md:w-80">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Timer className="h-5 w-5 text-primary" />
                <span className="font-mono text-2xl font-bold">{formatDuration(restSeconds)}</span>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="ghost" onClick={() => { setRestRunning(false); setRestSeconds(0); }}>
                  <X className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="outline" onClick={() => setRestRunning(!restRunning)}>
                  {restRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </Button>
                <Button size="sm" variant="outline" onClick={() => startRest(restInitial)}>
                  <SkipForward className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Exercise tabs */}
      {exercises.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {exercises.map((ex, i) => (
            <button
              key={ex.id}
              onClick={() => setCurrentExIndex(i)}
              className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors active:scale-95 ${
                i === currentExIndex
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground"
              }`}
            >
              {ex.exercise.name}
            </button>
          ))}
        </div>
      )}

      {/* Current exercise card */}
      {currentEx && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Dumbbell className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-base">{currentEx.exercise.name}</CardTitle>
                <div className="mt-1 flex gap-2">
                  <Badge variant="secondary" className="capitalize text-xs">
                    {currentEx.exercise.muscle_group?.replace("_", " ")}
                  </Badge>
                  <Badge variant="outline" className="capitalize text-xs">
                    {currentEx.exercise.equipment}
                  </Badge>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-[1.5rem_1fr_1fr_2.5rem] gap-2 text-xs font-medium text-muted-foreground">
              <span>Set</span><span>Weight</span><span>Reps</span><span className="text-center">Done</span>
            </div>
            {currentEx.workout_sets.map((ws) => {
              const done = completedSets.has(ws.id);
              return (
                <div key={ws.id} className={`grid grid-cols-[1.5rem_1fr_1fr_2.5rem] items-center gap-2 rounded-lg p-1.5 ${done ? "bg-green-500/10" : ""}`}>
                  <span className="text-sm font-medium text-muted-foreground">{ws.set_number}</span>
                  <Input
                    type="number"
                    inputMode="decimal"
                    value={ws.weight}
                    onChange={(e) => updateSetValue(ws.id, "weight", parseFloat(e.target.value) || 0)}
                    className="h-10"
                  />
                  <Input
                    type="number"
                    inputMode="numeric"
                    value={ws.reps}
                    onChange={(e) => updateSetValue(ws.id, "reps", parseInt(e.target.value) || 0)}
                    className="h-10"
                  />
                  <button
                    onClick={() => {
                      toggleSet(ws.id);
                      if (!completedSets.has(ws.id)) startRest(restInitial);
                    }}
                    className={`flex h-10 w-10 items-center justify-center rounded-md mx-auto transition-colors active:scale-90 ${
                      done ? "bg-green-500/20 text-green-500" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <Check className="h-4 w-4" />
                  </button>
                </div>
              );
            })}

            {/* Rest timer presets */}
            <div className="flex flex-wrap gap-2 pt-2">
              <span className="text-xs text-muted-foreground self-center">Rest:</span>
              {REST_PRESETS.map((s) => (
                <button
                  key={s}
                  onClick={() => startRest(s)}
                  className="rounded-full bg-secondary px-3 py-1.5 text-xs font-medium text-secondary-foreground active:scale-95"
                >
                  {s < 60 ? `${s}s` : `${s / 60}m`}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation between exercises */}
      {exercises.length > 1 && (
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => setCurrentExIndex(Math.max(0, currentExIndex - 1))}
            disabled={currentExIndex === 0}
          >
            <ArrowLeft className="h-4 w-4" /> Prev
          </Button>
          <Button
            variant="outline"
            onClick={() => setCurrentExIndex(Math.min(exercises.length - 1, currentExIndex + 1))}
            disabled={currentExIndex === exercises.length - 1}
          >
            Next <SkipForward className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Finish button */}
      <div className="fixed inset-x-0 bottom-0 z-20 border-t bg-background/95 p-3 pb-[max(env(safe-area-inset-bottom),0.75rem)] backdrop-blur md:static md:border-0 md:bg-transparent md:p-0">
        <Button className="w-full gap-2" size="lg" onClick={handleFinish} disabled={finishing}>
          <Trophy className="h-4 w-4" />
          {finishing ? "Finishing..." : "Finish Workout"}
        </Button>
      </div>
    </div>
  );
}
