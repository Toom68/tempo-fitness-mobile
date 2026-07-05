"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, Search, Dumbbell, ArrowLeft, Save, Check } from "lucide-react";
import type { Exercise } from "@/types";

interface SetRow {
  reps: string;
  weight: string;
  completed: boolean;
}

interface ExerciseEntry {
  exercise_id: string;
  exercise_name: string;
  sets: SetRow[];
}

export default function NewWorkoutPage() {
  const router = useRouter();
  const supabase = createClient();

  const [workoutName, setWorkoutName] = useState("New Workout");
  const [search, setSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [exercises, setExercises] = useState<ExerciseEntry[]>([]);
  const [saving, setSaving] = useState(false);

  const { data: allExercises } = useQuery<Exercise[]>({
    queryKey: ["exercises"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("exercises")
        .select("*")
        .order("name");
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
      {
        exercise_id: exercise.id,
        exercise_name: exercise.name,
        sets: [{ reps: "10", weight: "", completed: false }],
      },
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
        i === exIndex
          ? { ...ex, sets: [...ex.sets, { reps: "10", weight: "", completed: false }] }
          : ex
      )
    );
  };

  const removeSet = (exIndex: number, setIndex: number) => {
    setExercises((prev) =>
      prev.map((ex, i) =>
        i === exIndex
          ? { ...ex, sets: ex.sets.filter((_, si) => si !== setIndex) }
          : ex
      )
    );
  };

  const updateSet = (exIndex: number, setIndex: number, field: keyof SetRow, value: string) => {
    setExercises((prev) =>
      prev.map((ex, i) =>
        i === exIndex
          ? {
              ...ex,
              sets: ex.sets.map((s, si) =>
                si === setIndex ? { ...s, [field]: value } : s
              ),
            }
          : ex
      )
    );
  };

  const toggleSetComplete = (exIndex: number, setIndex: number) => {
    setExercises((prev) =>
      prev.map((ex, i) =>
        i === exIndex
          ? {
              ...ex,
              sets: ex.sets.map((s, si) =>
                si === setIndex ? { ...s, completed: !s.completed } : s
              ),
            }
          : ex
      )
    );
  };

  async function handleSave() {
    setSaving(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: workout, error: workoutError } = await supabase
      .from("workouts")
      .insert({
        user_id: user.id,
        name: workoutName,
        date: new Date().toISOString().split("T")[0],
        completed: true,
      })
      .select()
      .single();

    if (workoutError) {
      console.error(workoutError);
      setSaving(false);
      return;
    }

    for (let i = 0; i < exercises.length; i++) {
      const ex = exercises[i];
      const { data: we, error: weError } = await supabase
        .from("workout_exercises")
        .insert({
          workout_id: workout.id,
          exercise_id: ex.exercise_id,
          order: i,
        })
        .select()
        .single();

      if (weError || !we) continue;

      const setsData = ex.sets
        .filter((s) => s.reps || s.weight)
        .map((s, si) => ({
          workout_exercise_id: we.id,
          set_number: si + 1,
          reps: parseInt(s.reps) || 0,
          weight: parseFloat(s.weight) || 0,
          completed: s.completed,
        }));

      if (setsData.length > 0) {
        await supabase.from("workout_sets").insert(setsData);
      }
    }

    router.push("/workouts");
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">New Workout</h1>
      </div>

      <div className="space-y-2">
        <Label htmlFor="workout-name">Workout Name</Label>
        <Input
          id="workout-name"
          value={workoutName}
          onChange={(e) => setWorkoutName(e.target.value)}
          placeholder="e.g. Push Day, Leg Day..."
        />
      </div>

      {exercises.length > 0 && (
        <div className="space-y-4">
          {exercises.map((ex, exIndex) => (
            <Card key={exIndex}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-base">{ex.exercise_name}</CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeExercise(exIndex)}
                  className="h-8 w-8 text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-[2rem_1fr_1fr_2rem] gap-2 text-xs font-medium text-muted-foreground">
                  <span>Set</span>
                  <span>Weight</span>
                  <span>Reps</span>
                  <span></span>
                </div>
                {ex.sets.map((set, setIndex) => (
                  <div key={setIndex} className="grid grid-cols-[2rem_1fr_1fr_2rem] items-center gap-2">
                    <span className="text-sm text-muted-foreground">{setIndex + 1}</span>
                    <Input
                      type="number"
                      placeholder="0"
                      value={set.weight}
                      onChange={(e) => updateSet(exIndex, setIndex, "weight", e.target.value)}
                      className="h-8"
                    />
                    <Input
                      type="number"
                      placeholder="10"
                      value={set.reps}
                      onChange={(e) => updateSet(exIndex, setIndex, "reps", e.target.value)}
                      className="h-8"
                    />
                    <button
                      onClick={() => toggleSetComplete(exIndex, setIndex)}
                      className={`flex h-8 w-8 items-center justify-center rounded-md ${
                        set.completed
                          ? "bg-green-500/20 text-green-500"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      <Check className="h-4 w-4" />
                    </button>
                    {ex.sets.length > 1 && (
                      <button
                        onClick={() => removeSet(exIndex, setIndex)}
                        className="col-start-5 text-destructive hover:text-destructive/80"
                      >
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
        </div>
      )}

      {showSearch ? (
        <Card>
          <CardHeader>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                autoFocus
                placeholder="Search exercises..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardHeader>
          <CardContent className="max-h-64 overflow-y-auto">
            {filteredExercises.length > 0 ? (
              <div className="space-y-1">
                {filteredExercises.map((ex) => (
                  <button
                    key={ex.id}
                    onClick={() => addExercise(ex)}
                    className="flex w-full items-center gap-3 rounded-md p-2 text-left hover:bg-accent"
                  >
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

      {exercises.length > 0 && (
        <Button className="w-full gap-2" onClick={handleSave} disabled={saving}>
          <Save className="h-4 w-4" />
          {saving ? "Saving..." : "Save Workout"}
        </Button>
      )}
    </div>
  );
}
