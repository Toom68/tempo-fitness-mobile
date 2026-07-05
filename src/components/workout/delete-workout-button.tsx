"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Trash2, AlertTriangle } from "lucide-react";

export function DeleteWorkoutButton({ workoutId }: { workoutId: string }) {
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleDelete() {
    setDeleting(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from("workout_sets").delete().in(
      "workout_exercise_id",
      (await supabase.from("workout_exercises").select("id").eq("workout_id", workoutId)).data?.map((w: { id: string }) => w.id) ?? []
    );
    await supabase.from("workout_exercises").delete().eq("workout_id", workoutId);
    await supabase.from("workouts").delete().eq("id", workoutId).eq("user_id", user.id);

    router.push("/workouts");
    router.refresh();
  }

  if (!confirming) {
    return (
      <Button variant="outline" className="gap-2 text-destructive" onClick={() => setConfirming(true)}>
        <Trash2 className="h-4 w-4" /> Delete Workout
      </Button>
    );
  }

  return (
    <Card className="border-destructive/50">
      <CardContent className="flex items-center justify-between py-4">
        <div className="flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-destructive" />
          <span className="text-sm font-medium">Are you sure? This cannot be undone.</span>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setConfirming(false)}>Cancel</Button>
          <Button variant="destructive" size="sm" onClick={handleDelete} disabled={deleting}>
            {deleting ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
