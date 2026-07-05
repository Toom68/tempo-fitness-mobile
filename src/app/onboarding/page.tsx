"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dumbbell, ArrowRight, Check } from "lucide-react";
import type { Goal, ExperienceLevel, UnitPreference, Equipment } from "@/types";

const goals: { value: Goal; label: string; desc: string }[] = [
  { value: "strength", label: "Strength", desc: "Build raw power" },
  { value: "hypertrophy", label: "Hypertrophy", desc: "Build muscle mass" },
  { value: "endurance", label: "Endurance", desc: "Build stamina" },
  { value: "general", label: "General Fitness", desc: "Stay healthy" },
];

const levels: { value: ExperienceLevel; label: string; desc: string }[] = [
  { value: "beginner", label: "Beginner", desc: "New to lifting" },
  { value: "intermediate", label: "Intermediate", desc: "1-3 years experience" },
  { value: "advanced", label: "Advanced", desc: "3+ years experience" },
];

const equipmentOptions: { value: Equipment; label: string }[] = [
  { value: "barbell", label: "Barbell" },
  { value: "dumbbell", label: "Dumbbell" },
  { value: "machine", label: "Machine" },
  { value: "cable", label: "Cable" },
  { value: "kettlebell", label: "Kettlebell" },
  { value: "bodyweight", label: "Bodyweight" },
  { value: "bands", label: "Bands" },
  { value: "plate", label: "Plates" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const supabase = createClient();
  const [step, setStep] = useState(0);
  const [displayName, setDisplayName] = useState("");
  const [selectedGoals, setSelectedGoals] = useState<Goal[]>([]);
  const [experience, setExperience] = useState<ExperienceLevel>("beginner");
  const [unit, setUnit] = useState<UnitPreference>("kg");
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment[]>([]);
  const [saving, setSaving] = useState(false);

  function toggleGoal(g: Goal) {
    setSelectedGoals((prev) => (prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]));
  }
  function toggleEquipment(e: Equipment) {
    setSelectedEquipment((prev) => (prev.includes(e) ? prev.filter((x) => x !== e) : [...prev, e]));
  }

  async function handleFinish() {
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

    router.push("/dashboard");
    router.refresh();
  }

  const steps = ["Profile", "Goals", "Experience", "Equipment", "Units"];

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            <Dumbbell className="h-6 w-6 text-primary" />
          </div>
          <div>
            <CardTitle className="text-2xl">Welcome to Tempo</CardTitle>
            <CardDescription>Let&apos;s set up your profile ({step + 1}/{steps.length})</CardDescription>
          </div>
          <div className="flex gap-1">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 flex-1 rounded-full ${i <= step ? "bg-primary" : "bg-muted"}`}
              />
            ))}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {step === 0 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Display Name (optional)</Label>
                <Input
                  id="name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="What should we call you?"
                />
              </div>
              <Button className="w-full gap-2" onClick={() => setStep(1)}>
                Continue <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <Label>What are your goals?</Label>
              <div className="grid gap-2">
                {goals.map((g) => (
                  <button
                    key={g.value}
                    onClick={() => toggleGoal(g.value)}
                    className={`flex items-center justify-between rounded-lg border p-3 text-left transition-colors ${
                      selectedGoals.includes(g.value) ? "border-primary bg-primary/5" : "hover:bg-accent/50"
                    }`}
                  >
                    <div>
                      <p className="font-medium">{g.label}</p>
                      <p className="text-sm text-muted-foreground">{g.desc}</p>
                    </div>
                    {selectedGoals.includes(g.value) && <Check className="h-4 w-4 text-primary" />}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(0)}>Back</Button>
                <Button className="flex-1 gap-2" onClick={() => setStep(2)}>
                  Continue <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <Label>Your experience level</Label>
              <div className="grid gap-2">
                {levels.map((l) => (
                  <button
                    key={l.value}
                    onClick={() => setExperience(l.value)}
                    className={`flex items-center justify-between rounded-lg border p-3 text-left transition-colors ${
                      experience === l.value ? "border-primary bg-primary/5" : "hover:bg-accent/50"
                    }`}
                  >
                    <div>
                      <p className="font-medium">{l.label}</p>
                      <p className="text-sm text-muted-foreground">{l.desc}</p>
                    </div>
                    {experience === l.value && <Check className="h-4 w-4 text-primary" />}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
                <Button className="flex-1 gap-2" onClick={() => setStep(3)}>
                  Continue <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <Label>What equipment do you have access to?</Label>
              <div className="flex flex-wrap gap-2">
                {equipmentOptions.map((eq) => (
                  <button
                    key={eq.value}
                    onClick={() => toggleEquipment(eq.value)}
                    className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                      selectedEquipment.includes(eq.value)
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                    }`}
                  >
                    {eq.label}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(2)}>Back</Button>
                <Button className="flex-1 gap-2" onClick={() => setStep(4)}>
                  Continue <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <Label>Preferred units</Label>
              <div className="flex gap-2">
                {(["kg", "lb"] as UnitPreference[]).map((u) => (
                  <button
                    key={u}
                    onClick={() => setUnit(u)}
                    className={`flex-1 rounded-lg border p-4 text-center transition-colors ${
                      unit === u ? "border-primary bg-primary/5" : "hover:bg-accent/50"
                    }`}
                  >
                    <p className="font-semibold">{u === "kg" ? "Kilograms" : "Pounds"}</p>
                    <p className="text-sm text-muted-foreground">{u}</p>
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(3)}>Back</Button>
                <Button className="flex-1 gap-2" onClick={handleFinish} disabled={saving}>
                  {saving ? "Saving..." : "Get Started"} <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
