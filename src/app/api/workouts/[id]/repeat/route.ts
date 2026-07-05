import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

/**
 * POST /api/workouts/[id]/repeat
 * Duplicates a completed workout as a new template-ready workout (today's date,
 * same exercises and sets with same reps/weight targets, not yet completed).
 */
export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Fetch the source workout with all exercises and sets
  const { data: source, error: srcErr } = await supabase
    .from("workouts")
    .select(`
      name,
      notes,
      workout_exercises(
        order,
        notes,
        exercise_id,
        workout_sets(set_number, reps, weight, rpe)
      )
    `)
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (srcErr || !source) {
    return NextResponse.json({ error: "Workout not found" }, { status: 404 });
  }

  const today = new Date().toISOString().split("T")[0];

  // Create the new workout
  const { data: newWorkout, error: wErr } = await supabase
    .from("workouts")
    .insert({
      user_id: user.id,
      name: source.name,
      notes: source.notes,
      date: today,
      completed: false,
    })
    .select("id")
    .single();

  if (wErr || !newWorkout) {
    return NextResponse.json({ error: "Failed to create workout" }, { status: 500 });
  }

  const exercises = (source.workout_exercises ?? []) as Array<{
    order: number;
    notes: string | null;
    exercise_id: string;
    workout_sets: Array<{ set_number: number; reps: number; weight: number; rpe: number | null }>;
  }>;

  exercises.sort((a, b) => a.order - b.order);

  for (const we of exercises) {
    const { data: newWe, error: weErr } = await supabase
      .from("workout_exercises")
      .insert({
        workout_id: newWorkout.id,
        exercise_id: we.exercise_id,
        order: we.order,
        notes: we.notes,
      })
      .select("id")
      .single();

    if (weErr || !newWe) continue;

    const sets = (we.workout_sets ?? []).map((ws) => ({
      workout_exercise_id: newWe.id,
      set_number: ws.set_number,
      reps: ws.reps,
      weight: ws.weight,
      rpe: ws.rpe,
      completed: false,
    }));

    if (sets.length > 0) {
      await supabase.from("workout_sets").insert(sets);
    }
  }

  return NextResponse.json({ id: newWorkout.id });
}
