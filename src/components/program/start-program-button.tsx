"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Play, Check, Loader2 } from "lucide-react";
import { Native } from "@/lib/native";

export function StartProgramButton({
  programId,
  active,
}: {
  programId: string;
  active: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const [started, setStarted] = useState(active);

  async function handleStart() {
    setLoading(true);
    Native.haptics.impact("medium");
    try {
      const res = await fetch(`/api/programs/${programId}/start`, { method: "POST" });
      if (!res.ok) throw new Error("Failed");
      Native.haptics.notification();
      setStarted(true);
    } catch {
      setLoading(false);
    }
  }

  if (started) {
    return (
      <Button variant="outline" size="sm" className="gap-2" disabled>
        <Check className="h-4 w-4" /> Active
      </Button>
    );
  }

  return (
    <Button size="sm" className="gap-2" onClick={handleStart} disabled={loading}>
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
      <span className="hidden sm:inline">{loading ? "Starting…" : "Start Program"}</span>
      <span className="sm:hidden">{loading ? "…" : "Start"}</span>
    </Button>
  );
}
