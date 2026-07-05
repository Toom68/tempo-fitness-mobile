"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { Native } from "@/lib/native";

export function RepeatWorkoutButton({ workoutId }: { workoutId: string }) {
  const [loading, setLoading] = useState(false);

  async function handleRepeat() {
    setLoading(true);
    Native.haptics.impact("medium");
    try {
      const res = await fetch(`/api/workouts/${workoutId}/repeat`, { method: "POST" });
      if (!res.ok) throw new Error("Failed");
      const { id } = await res.json();
      Native.haptics.notification();
      window.location.href = `/workouts/${id}`;
    } catch {
      setLoading(false);
    }
  }

  return (
    <Button variant="outline" size="sm" className="gap-2" onClick={handleRepeat} disabled={loading}>
      <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
      <span className="hidden sm:inline">{loading ? "Copying…" : "Repeat"}</span>
    </Button>
  );
}
