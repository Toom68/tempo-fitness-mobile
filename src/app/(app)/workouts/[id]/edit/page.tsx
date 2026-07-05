"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, Search, Dumbbell, ArrowLeft, Save, Check } from "lucide-react";
import type { Exercise } from "@/types";

interface SetRow {
  id?: string;
  reps: string;
  weight: string;
  completed: boolean;
}

interface ExerciseEntry {
  id?: string;
  exercise_id: string;
  exercise_name: string;
  sets: SetRow[];
}

export default function EditWorkoutPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const supabase = createClient();

  const [workoutName, setWorkoutName] = useState("");
  const [workoutNotes, setWorkoutNotes] = useState("");
  const [search, setSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [exercises, setExercises] = useState<ExerciseEntry[]>([]);
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    async function loadWorkout() {
      const { data: workout } = await supabase
        .from("workouts")
        .select("*, workout_exercises(id, order, notes, exercise:exercises(id, name), workout_sets(id, set_number, reps, weight, completed))")
        .eq("id", params.id)
        .single();

      if (workout) {
        setWorkoutName(workout.name);
        setWorkoutNotes(workout.notes ?? "");
        const sorted = (workout.workout_exercises ?? []).sort(
          (a: { order: number }, b: { order: number }) => a.order - b.order
        );
        setExercises(
          sorted.map((we: any) => ({
            id: we.id,
            exercise_id: we.exercise?.id ?? "",
            exercise_name: we.exercise?.name ?? "",
            sets: (we.workout_sets ?? [])
              .sort((a: { set_number: number }, b: { set_number: number }) => a.set_number - b.set_number)
              .map((ws: any) => ({
                id: ws.id,
                reps: String(ws.reps),
                weight: String(ws.weight),
                completed: ws.completed,
              })),
          }))
        );
        setLoaded(true);
      }
    }
    loadWorkout();
  }, [params.id, supabase]);

  const { data: allExercises } = useQuery<Exercise[]>({
    queryKey: ["exercises"],
    queryFn: async () => {
      const { data, error } = await supabase.from("exercises").select("*").order("name");
      if (error) throw error;
      return data;
    },
  });

  const filteredExercises = allExercises?.filter((ex) =>
    ex.name.toLowerCase().includes(search.toLowerCase())
  ) ?? [];

  const addExercise = useCallback((exercise: Exercise) => {
    setExercises((prev) => [
      ...prev,
      { exercise_id: exercise.id, exercise_name: exercise.name, sets: [{ reps: "10", weight: "", completed: false }] },
    ]);
    setShowSearch(false);
    setSearch("");
  }, []);

  const removeExercise = (index: number) => {
    setExercises((prev) => prev.filter((_, i) => i !== index));
  };

  const addSet = (exIndex: number) => {
    setExercises((prev) =>
      prev.map((ex, i) =>
        i === exIndex ? { ...ex, sets: [...ex.sets, { reps: "10", weight: "", completed: false }] } : ex
      )
    );
  };

  const removeSet = (exIndex: number, setIndex: number) => {
    setExercises((prev) =>
      prev.map((ex, i) =>
        i === exIndex ? { ...ex, sets: ex.sets.filter((_, si) => si !== setIndex) } : ex
      )
    );
  };

  const updateSet = (exIndex: number, setIndex: number, field: keyof SetRow, value: string) => {
    setExercises((prev) =>
      prev.map((ex, i) =>
        i === exIndex
          ? { ...ex, sets: ex.sets.map((s, si) => (si === setIndex ? { ...s, [field]: value } : s)) }
          : ex
      )
    );
  };

  const toggleSetComplete = (exIndex: number, setIndex: number) => {
    setExercises((prev) =>
      prev.map((ex, i) =>
        i === exIndex
          ? { ...ex, sets: ex.sets.map((s, si) => (si === setIndex ? { ...s, completed: !s.completed } : s)) }
          : ex
      )
    );
  };

  async function handleSave() {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from("workouts").update({ name: workoutName, notes: workoutNotes || null }).eq("id", params.id);

    for (let i = 0; i < exercises.length; i++) {
      const ex = exercises[i];
      if (ex.id) {
        await supabase.from("workout_sets").delete().eq("workout_exercise_id", ex.id);
        await supabase.from("workout_exercises").update({ order: i }).eq("id", ex.id);
      } else {
        const { data: we } = await supabase
          .from("workout_exercises")
          .insert({ workout_id: params.id, exercise_id: ex.exercise_id, order: i })
          .select()
          .single();
        ex.id = we?.id;
      }

      const setsData = ex.sets
        .filter((s) => s.reps || s.weight)
        .map((s, si) => ({
          workout_exercise_id: ex.id!,
          set_number: si + 1,
          reps: parseInt(s.reps) || 0,
          weight: parseFloat(s.weight) || 0,
          completed: s.completed,
        }));

      if (setsData.length > 0) {
        await supabase.from("workout_sets").insert(setsData);
      }
    }

    router.push(`/workouts/${params.id}`);
    router.refresh();
  }

  if (!loaded) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">Edit Workout</h1>
      </div>

      <div className="space-y-2">
        <Label htmlFor="workout-name">Workout Name</Label>
        <Input id="workout-name" value={workoutName} onChange={(e) => setWorkoutName(e.target.value)} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="workout-notes">Notes</Label>
        <Input id="workout-notes" value={workoutNotes} onChange={(e) => setWorkoutNotes(e.target.value)} placeholder="Optional notes..." />
      </div>

      {exercises.map((ex, exIndex) => (
        <Card key={exIndex}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">{ex.exercise_name}</CardTitle>
            <Button variant="ghost" size="icon" onClick={() => removeExercise(exIndex)} className="h-8 w-8 text-destructive">
              <Trash2 className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="grid grid-cols-[2rem_1fr_1fr_2rem] gap-2 text-xs font-medium text-muted-foreground">
              <span>Set</span><span>Weight</span><span>Reps</span><span></span>
            </div>
            {ex.sets.map((set, setIndex) => (
              <div key={setIndex} className="grid grid-cols-[2rem_1fr_1fr_2rem] items-center gap-2">
                <span className="text-sm text-muted-foreground">{setIndex + 1}</span>
                <Input type="number" placeholder="0" value={set.weight} onChange={(e) => updateSet(exIndex, setIndex, "weight", e.target.value)} className="h-8" />
                <Input type="number" placeholder="10" value={set.reps} onChange={(e) => updateSet(exIndex, setIndex, "reps", e.target.value)} className="h-8" />
                <button onClick={() => toggleSetComplete(exIndex, setIndex)} className={`flex h-8 w-8 items-center justify-center rounded-md ${set.completed ? "bg-green-500/20 text-green-500" : "bg-muted text-muted-foreground"}`}>
                  <Check className="h-4 w-4" />
                </button>
                {ex.sets.length > 1 && (
                  <button onClick={() => removeSet(exIndex, setIndex)} className="col-start-5 text-destructive hover:text-destructive/80">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            ))}
            <Button variant="outline" size="sm" className="mt-2 gap-1" onClick={() => addSet(exIndex)}>
              <Plus className="h-3 w-3" /> Add Set
            </Button>
          </CardContent>
        </Card>
      ))}

      {showSearch ? (
        <Card>
          <CardHeader>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input autoFocus placeholder="Search exercises..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
            </div>
          </CardHeader>
          <CardContent className="max-h-64 overflow-y-auto">
            {filteredExercises.length > 0 ? (
              <div className="space-y-1">
                {filteredExercises.map((ex) => (
                  <button key={ex.id} onClick={() => addExercise(ex)} className="flex w-full items-center gap-3 rounded-md p-2 text-left hover:bg-accent">
                    <Dumbbell className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{ex.name}</span>
                  </button>
                ))}
              </div>
            ) : (
              <p className="py-4 text-center text-sm text-muted-foreground">No exercises found</p>
            )}
          </CardContent>
        </Card>
      ) : (
        <Button variant="outline" className="w-full gap-2" onClick={() => setShowSearch(true)}>
          <Plus className="h-4 w-4" /> Add Exercise
        </Button>
      )}

      <Button className="w-full gap-2" onClick={handleSave} disabled={saving}>
        <Save className="h-4 w-4" />
        {saving ? "Saving..." : "Save Changes"}
      </Button>
    </div>
  );
}
