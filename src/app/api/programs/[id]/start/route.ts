import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

/**
 * POST /api/programs/[id]/start
 * Activates the program and generates the first week of workouts
 * based on the program's day structure.
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

  // Verify ownership
  const { data: program, error: progErr } = await supabase
    .from("programs")
    .select("id, name, duration_weeks, frequency")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (progErr || !program) {
    return NextResponse.json({ error: "Program not found" }, { status: 404 });
  }

  // Deactivate any other active programs
  await supabase
    .from("programs")
    .update({ is_active: false })
    .neq("id", id)
    .eq("user_id", user.id);

  // Activate this program
  await supabase
    .from("programs")
    .update({ is_active: true })
    .eq("id", id);

  // Fetch program days with exercises
  const { data: days } = await supabase
    .from("program_days")
    .select(`
      id,
      day_name,
      order,
      program_exercises(
        id,
        exercise_id,
        sets,
        reps_scheme
      )
    `)
    .eq("program_id", id)
    .order("order", { ascending: true });

  if (!days || days.length === 0) {
    return NextResponse.json({ error: "Program has no training days" }, { status: 400 });
  }

  // Generate workouts for the first week
  const today = new Date();
  const workoutsCreated: string[] = [];

  // Spread the program days across the week based on frequency
  const frequency = program.frequency || days.length;
  const daysPerWeek = Math.min(frequency, days.length);

  for (let week = 0; week < (program.duration_weeks || 1); week++) {
    for (let dayIdx = 0; dayIdx < daysPerWeek; dayIdx++) {
      const day = days[dayIdx];
      if (!day) continue;

      // Calculate date: spread days across the week
      const dayOffset = week * 7 + Math.floor((dayIdx * 7) / daysPerWeek);
      const workoutDate = new Date(today);
      workoutDate.setDate(workoutDate.getDate() + dayOffset);
      const dateStr = workoutDate.toISOString().split("T")[0];

      // Check if a workout already exists for this program on this date
      const { data: existing } = await supabase
        .from("workouts")
        .select("id")
        .eq("user_id", user.id)
        .eq("date", dateStr)
        .ilike("name", `${program.name}%`)
        .maybeSingle();

      if (existing) continue;

      // Create the workout
      const { data: newWorkout, error: wErr } = await supabase
        .from("workouts")
        .insert({
          user_id: user.id,
          name: `${program.name} — ${day.day_name} (W${week + 1})`,
          date: dateStr,
          completed: false,
          notes: `Auto-generated from program: ${program.name}`,
        })
        .select("id")
        .single();

      if (wErr || !newWorkout) continue;

      // Add exercises and sets
      const exercises = (day.program_exercises ?? []) as any[];
      for (let i = 0; i < exercises.length; i++) {
        const pe = exercises[i];
        const { data: newWe } = await supabase
          .from("workout_exercises")
          .insert({
            workout_id: newWorkout.id,
            exercise_id: pe.exercise_id,
            order: i + 1,
          })
          .select("id")
          .single();

        if (!newWe) continue;

        // Parse reps_scheme (e.g. "8-12" → use 10 as target, "5" → 5)
        const repsMatch = pe.reps_scheme?.match(/\d+/);
        const targetReps = repsMatch ? parseInt(repsMatch[0]) : 10;

        // Create sets
        const sets = Array.from({ length: pe.sets || 3 }, (_, sIdx) => ({
          workout_exercise_id: newWe.id,
          set_number: sIdx + 1,
          reps: targetReps,
          weight: 0,
          completed: false,
        }));

        if (sets.length > 0) {
          await supabase.from("workout_sets").insert(sets);
        }
      }

      workoutsCreated.push(newWorkout.id);
    }
  }

  return NextResponse.json({
    activated: true,
    workoutsCreated: workoutsCreated.length,
  });
}
