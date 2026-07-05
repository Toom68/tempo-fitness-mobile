"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Settings, User, Dumbbell, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import type { Goal, ExperienceLevel, UnitPreference, Equipment } from "@/types";

const goals: { value: Goal; label: string }[] = [
  { value: "strength", label: "Strength" },
  { value: "hypertrophy", label: "Hypertrophy" },
  { value: "endurance", label: "Endurance" },
  { value: "general", label: "General Fitness" },
];

const experienceLevels: { value: ExperienceLevel; label: string }[] = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];

const equipmentOptions: { value: Equipment; label: string }[] = [
  { value: "barbell", label: "Barbell" },
  { value: "dumbbell", label: "Dumbbell" },
  { value: "machine", label: "Machine" },
  { value: "cable", label: "Cable" },
  { value: "kettlebell", label: "Kettlebell" },
  { value: "bodyweight", label: "Bodyweight" },
  { value: "bands", label: "Bands" },
];

export default function SettingsPage() {
  const router = useRouter();
  const supabase = createClient();

  const [displayName, setDisplayName] = useState("");
  const [selectedGoals, setSelectedGoals] = useState<Goal[]>([]);
  const [experience, setExperience] = useState<ExperienceLevel>("beginner");
  const [unit, setUnit] = useState<UnitPreference>("kg");
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function toggleGoal(goal: Goal) {
    setSelectedGoals((prev) =>
      prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal]
    );
  }

  function toggleEquipment(eq: Equipment) {
    setSelectedEquipment((prev) =>
      prev.includes(eq) ? prev.filter((e) => e !== eq) : [...prev, eq]
    );
  }

  async function handleSave() {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from("profiles")
      .update({
        display_name: displayName || null,
        goals: selectedGoals,
        experience,
        unit_pref: unit,
        equipment: selectedEquipment,
      })
      .eq("id", user.id);

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your profile and preferences</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base">Profile</CardTitle>
              <CardDescription>Update your display name and preferences</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="display-name">Display Name</Label>
            <Input
              id="display-name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your name"
            />
          </div>

          <div className="space-y-2">
            <Label>Goals</Label>
            <div className="flex flex-wrap gap-2">
              {goals.map((g) => (
                <button
                  key={g.value}
                  onClick={() => toggleGoal(g.value)}
                  className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                    selectedGoals.includes(g.value)
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  }`}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Experience Level</Label>
            <div className="flex flex-wrap gap-2">
              {experienceLevels.map((lvl) => (
                <button
                  key={lvl.value}
                  onClick={() => setExperience(lvl.value)}
                  className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                    experience === lvl.value
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  }`}
                >
                  {lvl.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Units</Label>
            <div className="flex gap-2">
              {(["kg", "lb"] as UnitPreference[]).map((u) => (
                <button
                  key={u}
                  onClick={() => setUnit(u)}
                  className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
                    unit === u
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  }`}
                >
                  {u === "kg" ? "Kilograms (kg)" : "Pounds (lb)"}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Available Equipment</Label>
            <div className="flex flex-wrap gap-2">
              {equipmentOptions.map((eq) => (
                <button
                  key={eq.value}
                  onClick={() => toggleEquipment(eq.value)}
                  className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                    selectedEquipment.includes(eq.value)
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  }`}
                >
                  {eq.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </Button>
            {saved && <Badge variant="secondary" className="text-green-500">Saved!</Badge>}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="py-4">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm font-medium text-destructive hover:text-destructive/80"
          >
            <LogOut className="h-4 w-4" /> Log Out
          </button>
        </CardContent>
      </Card>
    </div>
  );
}
