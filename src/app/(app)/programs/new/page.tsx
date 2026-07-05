"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Dumbbell, Loader2 } from "lucide-react";
import { Native } from "@/lib/native";
import type { Goal } from "@/types";
import { useRouter } from "next/navigation";

const goals: { value: Goal; label: string }[] = [
  { value: "strength", label: "Strength" },
  { value: "hypertrophy", label: "Hypertrophy" },
  { value: "endurance", label: "Endurance" },
  { value: "general", label: "General Fitness" },
];

interface DayRow {
  id: string;
  dayName: string;
  exercises: { exerciseId: string; sets: number; repsScheme: string }[];
}

export default function NewProgramPage() {
  const router = useRouter();
  const supabase = createClient();
  const [name, setName] = useState("");
  const [goal, setGoal] = useState<Goal>("strength");
  const [frequency, setFrequency] = useState(3);
  const [durationWeeks, setDurationWeeks] = useState(8);
  const [days, setDays] = useState<DayRow[]>([
    { id: crypto.randomUUID(), dayName: "Day A", exercises: [] },
  ]);
  const [exercises, setExercises] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchDayId, setSearchDayId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function addDay() {
    Native.haptics.impact("light");
    const dayCount = days.length;
    const letter = String.fromCharCode(65 + dayCount);
    setDays([...days, { id: crypto.randomUUID(), dayName: `Day ${letter}`, exercises: [] }]);
  }

  function removeDay(dayId: string) {
    Native.haptics.impact("light");
    setDays(days.filter((d) => d.id !== dayId));
  }

  function addExerciseToDay(dayId: string, exerciseId: string, exerciseName: string) {
    Native.haptics.impact("light");
    setDays(days.map((d) =>
      d.id === dayId
        ? { ...d, exercises: [...d.exercises, { exerciseId, sets: 3, repsScheme: "8-12" }] }
        : d
    ));
    setSearchDayId(null);
    setExercises([]);
  }

  function updateExercise(dayId: string, idx: number, field: "sets" | "repsScheme", value: string | number) {
    setDays(days.map((d) =>
      d.id === dayId
        ? {
            ...d,
            exercises: d.exercises.map((ex, i) =>
              i === idx ? { ...ex, [field]: value } : ex
            ),
          }
        : d
    ));
  }

  function removeExercise(dayId: string, idx: number) {
    setDays(days.map((d) =>
      d.id === dayId
        ? { ...d, exercises: d.exercises.filter((_, i) => i !== idx) }
        : d
    ));
  }

  async function searchExercises(query: string, dayId: string) {
    setSearchDayId(dayId);
    if (!query.trim()) {
      setExercises([]);
      return;
    }
    setSearching(true);
    const { data } = await supabase
      .from("exercises")
      .select("id, name, muscle_group, equipment")
      .ilike("name", `%${query.trim()}%`)
      .limit(10);
    setExercises(data ?? []);
    setSearching(false);
  }

  async function handleSave() {
    setSaving(true);
    Native.haptics.impact("medium");

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Create program
    const { data: program, error: progErr } = await supabase
      .from("programs")
      .insert({
        user_id: user.id,
        name,
        goal,
        frequency,
        duration_weeks: durationWeeks,
        is_active: false,
      })
      .select("id")
      .single();

    if (progErr || !program) {
      setSaving(false);
      return;
    }

    // Create days and exercises
    for (let i = 0; i < days.length; i++) {
      const day = days[i];
      const { data: dayRow, error: dayErr } = await supabase
        .from("program_days")
        .insert({
          program_id: program.id,
          day_name: day.dayName,
          order: i + 1,
        })
        .select("id")
        .single();

      if (dayErr || !dayRow) continue;

      for (const ex of day.exercises) {
        await supabase.from("program_exercises").insert({
          program_day_id: dayRow.id,
          exercise_id: ex.exerciseId,
          sets: ex.sets,
          reps_scheme: ex.repsScheme,
          rest_seconds: 90,
        });
      }
    }

    Native.haptics.notification();
    router.push(`/programs/${program.id}`);
    router.refresh();
  }

  return (
    <div className="space-y-5 md:space-y-6">
      <div>
        <h1 className="text-xl font-bold md:text-2xl">Create Program</h1>
        <p className="text-sm text-muted-foreground">Design a structured training plan</p>
      </div>

      {/* Basic info */}
      <Card>
        <CardContent className="space-y-4 py-4">
          <div>
            <Label htmlFor="name">Program Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Push Pull Legs" />
          </div>

          <div>
            <Label>Goal</Label>
            <div className="flex flex-wrap gap-2 pt-1">
              {goals.map((g) => (
                <button
                  key={g.value}
                  onClick={() => { Native.haptics.impact("light"); setGoal(g.value); }}
                  className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors active:scale-95 ${
                    goal === g.value ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground"
                  }`}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="freq">Frequency (days/week)</Label>
              <Input id="freq" type="number" min={1} max={7} value={frequency} onChange={(e) => setFrequency(parseInt(e.target.value) || 1)} />
            </div>
            <div>
              <Label htmlFor="weeks">Duration (weeks)</Label>
              <Input id="weeks" type="number" min={1} max={52} value={durationWeeks} onChange={(e) => setDurationWeeks(parseInt(e.target.value) || 1)} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Training days */}
      <div className="space-y-3">
        {days.map((day, dayIdx) => (
          <Card key={day.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary">
                    {dayIdx + 1}
                  </div>
                  <Input
                    value={day.dayName}
                    onChange={(e) => setDays(days.map((d) => d.id === day.id ? { ...d, dayName: e.target.value } : d))}
                    className="h-8 w-40 font-medium"
                  />
                </div>
                {days.length > 1 && (
                  <button onClick={() => removeDay(day.id)} className="text-muted-foreground active:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {day.exercises.map((ex, idx) => (
                <div key={idx} className="flex items-center gap-2 rounded-lg border p-2">
                  <Dumbbell className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div className="flex flex-1 items-center gap-2">
                    <Input
                      type="number"
                      min={1}
                      value={ex.sets}
                      onChange={(e) => updateExercise(day.id, idx, "sets", parseInt(e.target.value) || 1)}
                      className="h-8 w-16"
                    />
                    <span className="text-xs text-muted-foreground">sets</span>
                    <Input
                      value={ex.repsScheme}
                      onChange={(e) => updateExercise(day.id, idx, "repsScheme", e.target.value)}
                      className="h-8 w-20"
                      placeholder="8-12"
                    />
                    <span className="text-xs text-muted-foreground">reps</span>
                  </div>
                  <button onClick={() => removeExercise(day.id, idx)} className="text-muted-foreground active:text-destructive shrink-0">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}

              {/* Exercise search */}
              {searchDayId === day.id ? (
                <div className="space-y-2">
                  <Input
                    placeholder="Search exercises..."
                    onChange={(e) => searchExercises(e.target.value, day.id)}
                    autoFocus
                  />
                  {searching && <p className="text-xs text-muted-foreground">Searching...</p>}
                  {exercises.length > 0 && (
                    <div className="space-y-1">
                      {exercises.map((ex) => (
                        <button
                          key={ex.id}
                          onClick={() => addExerciseToDay(day.id, ex.id, ex.name)}
                          className="flex w-full items-center gap-2 rounded-lg border p-2 text-left text-sm active:bg-accent/50"
                        >
                          <Dumbbell className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="flex-1 truncate">{ex.name}</span>
                          <Badge variant="secondary" className="text-xs capitalize">{ex.muscle_group.replace("_", " ")}</Badge>
                        </button>
                      ))}
                    </div>
                  )}
                  <Button variant="ghost" size="sm" onClick={() => setSearchDayId(null)}>Cancel</Button>
                </div>
              ) : (
                <Button variant="outline" size="sm" className="w-full gap-2" onClick={() => setSearchDayId(day.id)}>
                  <Plus className="h-4 w-4" /> Add Exercise
                </Button>
              )}
            </CardContent>
          </Card>
        ))}

        <Button variant="outline" className="w-full gap-2" onClick={addDay}>
          <Plus className="h-4 w-4" /> Add Training Day
        </Button>
      </div>

      <Button className="w-full gap-2" onClick={handleSave} disabled={saving || !name.trim()}>
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
        {saving ? "Creating..." : "Create Program"}
      </Button>
    </div>
  );
}
