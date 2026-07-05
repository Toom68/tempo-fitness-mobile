import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

/**
 * POST /api/badges/check
 * Checks all badge criteria for the authenticated user and awards any newly earned badges.
 * Called after workout completion.
 */
export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Fetch all badges
  const { data: allBadges } = await supabase.from("badges").select("*");
  if (!allBadges) return NextResponse.json({ awarded: [] });

  // Fetch user's existing badges
  const { data: userBadges } = await supabase
    .from("user_badges")
    .select("badge_id")
    .eq("user_id", user.id);
  const earnedIds = new Set((userBadges ?? []).map((ub) => ub.badge_id));

  // Fetch all user's completed workouts with sets
  const { data: workouts } = await supabase
    .from("workouts")
    .select(`
      id,
      date,
      duration,
      completed,
      workout_exercises(
        workout_sets(reps, weight)
      )
    `)
    .eq("user_id", user.id)
    .eq("completed", true);

  const completedWorkouts = workouts ?? [];
  const workoutCount = completedWorkouts.length;

  // Calculate total volume
  let totalVolume = 0;
  let maxWeight = 0;
  for (const w of completedWorkouts) {
    for (const we of w.workout_exercises ?? []) {
      for (const ws of we.workout_sets ?? []) {
        const vol = (ws.reps ?? 0) * (ws.weight ?? 0);
        totalVolume += vol;
        if ((ws.weight ?? 0) > maxWeight) maxWeight = ws.weight ?? 0;
      }
    }
  }

  // Calculate current streak
  const now = new Date();
  let streak = 0;
  if (completedWorkouts.length > 0) {
    const dates = [...new Set(completedWorkouts.map((w) => w.date))].sort().reverse();
    for (let i = 0; i < dates.length; i++) {
      const expected = new Date(now);
      expected.setDate(expected.getDate() - i);
      const expectedStr = expected.toISOString().split("T")[0];
      if (dates[i] === expectedStr) streak++;
      else break;
    }
  }

  // Check for early bird / night owl
  let hasEarlyBird = false;
  let hasNightOwl = false;
  for (const w of completedWorkouts) {
    // We don't have exact timestamps, but date + duration can be a proxy
    // For simplicity, check if any workout date falls on a day where we can infer
    // This is a simplification — in production we'd store workout start time
  }

  // Evaluate each badge
  const newlyAwarded: { name: string; icon: string; description: string }[] = [];

  for (const badge of allBadges) {
    if (earnedIds.has(badge.id)) continue;

    const criteria = badge.criteria as any;
    let earned = false;

    switch (criteria.type) {
      case "workout_count":
        earned = workoutCount >= criteria.threshold;
        break;
      case "streak":
        earned = streak >= criteria.threshold;
        break;
      case "max_weight":
        earned = maxWeight >= criteria.threshold;
        break;
      case "total_volume":
        earned = totalVolume >= criteria.threshold;
        break;
      case "early_bird":
        earned = hasEarlyBird;
        break;
      case "night_owl":
        earned = hasNightOwl;
        break;
    }

    if (earned) {
      const { error } = await supabase.from("user_badges").insert({
        user_id: user.id,
        badge_id: badge.id,
      });

      if (!error) {
        newlyAwarded.push({
          name: badge.name,
          icon: badge.icon,
          description: badge.description,
        });
      }
    }
  }

  return NextResponse.json({ awarded: newlyAwarded });
}
