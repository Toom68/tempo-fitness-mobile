"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Settings, User, Dumbbell, LogOut, RefreshCw, Trash2, Moon, Sun, Monitor } from "lucide-react";
import type { Goal, ExperienceLevel, UnitPreference, Equipment } from "@/types";
import { useTheme } from "@/components/providers/theme-provider";

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

function ThemeRow() {
  const { theme, setTheme } = useTheme();
  const options: { value: "light" | "dark" | "system"; label: string; icon: typeof Moon }[] = [
    { value: "light", label: "Light", icon: Sun },
    { value: "dark", label: "Dark", icon: Moon },
    { value: "system", label: "System", icon: Monitor },
  ];
  return (
    <div className="flex gap-2">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => setTheme(opt.value)}
          className={`flex flex-1 items-center justify-center gap-2 rounded-lg border p-2.5 text-sm font-medium transition-colors active:scale-95 ${
            theme === opt.value
              ? "border-primary bg-primary/10 text-primary"
              : "border-border text-muted-foreground"
          }`}
        >
          <opt.icon className="h-4 w-4" />
          {opt.label}
        </button>
      ))}
    </div>
  );
}

export default function SettingsPage() {
  const supabase = createClient();

  const [displayName, setDisplayName] = useState("");
  const [selectedGoals, setSelectedGoals] = useState<Goal[]>([]);
  const [experience, setExperience] = useState<ExperienceLevel>("beginner");
  const [unit, setUnit] = useState<UnitPreference>("kg");
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [checking, setChecking] = useState(false);
  const [updateStatus, setUpdateStatus] = useState("");

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
    window.location.assign("/login");
  }

  async function handleCheckUpdate() {
    setChecking(true);
    setUpdateStatus("");
    try {
      const reg = await navigator.serviceWorker?.getRegistration();
      if (!reg) {
        setUpdateStatus("Updates are managed automatically in the background.");
        return;
      }
      await reg.update();
      if (reg.waiting) {
        setUpdateStatus("A new version is available. Reloading...");
        reg.waiting.postMessage({ type: "SKIP_WAITING" });
        setTimeout(() => window.location.reload(), 500);
      } else {
        setUpdateStatus("You're up to date!");
        setTimeout(() => setUpdateStatus(""), 3000);
      }
    } catch {
      setUpdateStatus("Could not check for updates right now.");
    } finally {
      setChecking(false);
    }
  }

  async function handleClearCache() {
    setUpdateStatus("Clearing cached data...");
    try {
      // Unregister all service workers
      if ("serviceWorker" in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations();
        await Promise.all(regs.map((r) => r.unregister()));
      }
      // Delete all Cache Storage entries
      if ("caches" in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map((k) => caches.delete(k)));
      }
      setUpdateStatus("Cache cleared. Reloading...");
      setTimeout(() => window.location.reload(), 500);
    } catch {
      setUpdateStatus("Could not clear cache. Try clearing site data in your browser settings.");
    }
  }

  return (
    <div className="space-y-5 md:space-y-6">
      <div>
        <h1 className="text-xl font-bold md:text-2xl">Settings</h1>
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
                  className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors active:scale-95 ${
                    selectedGoals.includes(g.value)
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground"
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
                  className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors active:scale-95 ${
                    experience === lvl.value
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground"
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
                  className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors active:scale-95 ${
                    unit === u
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground"
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
                  className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors active:scale-95 ${
                    selectedEquipment.includes(eq.value)
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground"
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
        <CardHeader>
          <CardTitle className="text-base">Appearance</CardTitle>
        </CardHeader>
        <CardContent>
          <ThemeRow />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="py-4">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm font-medium text-destructive active:text-destructive/80"
          >
            <LogOut className="h-4 w-4" /> Log Out
          </button>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4 py-4">
          <button
            onClick={handleCheckUpdate}
            disabled={checking}
            className="flex items-center gap-2 text-sm font-medium active:scale-95"
          >
            <RefreshCw className={`h-4 w-4 ${checking ? "animate-spin" : ""}`} /> Check for Updates
          </button>
          <button
            onClick={handleClearCache}
            className="flex items-center gap-2 text-sm font-medium text-muted-foreground active:scale-95"
          >
            <Trash2 className="h-4 w-4" /> Clear Cache &amp; Reload
          </button>
          {updateStatus && (
            <p className="text-xs text-muted-foreground">{updateStatus}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
