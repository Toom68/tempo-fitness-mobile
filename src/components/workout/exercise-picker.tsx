"use client";

import { useState, useMemo } from "react";
import { Search, Dumbbell, Filter, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { Exercise, MuscleGroup, Equipment } from "@/types";

const MUSCLE_GROUPS: { value: MuscleGroup; label: string }[] = [
  { value: "chest", label: "Chest" },
  { value: "back", label: "Back" },
  { value: "shoulders", label: "Shoulders" },
  { value: "biceps", label: "Biceps" },
  { value: "triceps", label: "Triceps" },
  { value: "forearms", label: "Forearms" },
  { value: "abs", label: "Core" },
  { value: "quads", label: "Quads" },
  { value: "hamstrings", label: "Hamstrings" },
  { value: "glutes", label: "Glutes" },
  { value: "calves", label: "Calves" },
  { value: "traps", label: "Traps" },
  { value: "full_body", label: "Full Body" },
];

const EQUIPMENT_TYPES: { value: Equipment; label: string }[] = [
  { value: "barbell", label: "Barbell" },
  { value: "dumbbell", label: "Dumbbell" },
  { value: "machine", label: "Machine" },
  { value: "cable", label: "Cable" },
  { value: "kettlebell", label: "Kettlebell" },
  { value: "bodyweight", label: "Bodyweight" },
  { value: "bands", label: "Bands" },
  { value: "plate", label: "Plates" },
  { value: "other", label: "Other" },
];

const COMPOUND_MUSCLES: MuscleGroup[] = ["chest", "back", "shoulders", "quads", "hamstrings", "glutes"];
const ISOLATION_MUSCLES: MuscleGroup[] = ["biceps", "triceps", "forearms", "abs", "calves", "traps"];

export function ExercisePicker({
  exercises,
  onSelect,
}: {
  exercises: Exercise[] | undefined;
  onSelect: (exercise: Exercise) => void;
}) {
  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [activeMuscles, setActiveMuscles] = useState<MuscleGroup[]>([]);
  const [activeEquipment, setActiveEquipment] = useState<Equipment[]>([]);
  const [effectiveness, setEffectiveness] = useState<"all" | "compound" | "isolation">("all");

  const filtered = useMemo(() => {
    if (!exercises) return [];
    return exercises.filter((ex) => {
      if (search && !ex.name.toLowerCase().includes(search.toLowerCase())) return false;
      if (activeMuscles.length > 0 && !activeMuscles.includes(ex.muscle_group) && !ex.secondary_muscles?.some((m) => activeMuscles.includes(m))) return false;
      if (activeEquipment.length > 0 && !activeEquipment.includes(ex.equipment)) return false;
      if (effectiveness === "compound" && !COMPOUND_MUSCLES.includes(ex.muscle_group)) return false;
      if (effectiveness === "isolation" && !ISOLATION_MUSCLES.includes(ex.muscle_group)) return false;
      return true;
    });
  }, [exercises, search, activeMuscles, activeEquipment, effectiveness]);

  const activeFilterCount =
    activeMuscles.length + activeEquipment.length + (effectiveness !== "all" ? 1 : 0);

  function clearFilters() {
    setActiveMuscles([]);
    setActiveEquipment([]);
    setEffectiveness("all");
  }

  function toggleMuscle(mg: MuscleGroup) {
    setActiveMuscles((prev) => prev.includes(mg) ? prev.filter((x) => x !== mg) : [...prev, mg]);
  }

  function toggleEquipment(eq: Equipment) {
    setActiveEquipment((prev) => prev.includes(eq) ? prev.filter((x) => x !== eq) : [...prev, eq]);
  }

  return (
    <Card>
      <CardHeader className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              autoFocus
              placeholder="Search exercises..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            variant={showFilters ? "default" : "outline"}
            size="icon"
            onClick={() => setShowFilters(!showFilters)}
            className="relative"
          >
            <Filter className="h-4 w-4" />
            {activeFilterCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] text-destructive-foreground">
                {activeFilterCount}
              </span>
            )}
          </Button>
        </div>

        {showFilters && (
          <div className="space-y-3 rounded-lg border p-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Filters</span>
              {activeFilterCount > 0 && (
                <button onClick={clearFilters} className="flex items-center gap-1 text-xs text-destructive hover:underline">
                  <X className="h-3 w-3" /> Clear all
                </button>
              )}
            </div>

            <div className="space-y-1.5">
              <span className="text-xs font-medium">Muscle Group</span>
              <div className="flex gap-1.5 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {MUSCLE_GROUPS.map((mg) => (
                  <button
                    key={mg.value}
                    onClick={() => toggleMuscle(mg.value)}
                    className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors active:scale-95 ${
                      activeMuscles.includes(mg.value)
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-secondary-foreground"
                    }`}
                  >
                    {mg.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <span className="text-xs font-medium">Equipment</span>
              <div className="flex gap-1.5 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {EQUIPMENT_TYPES.map((eq) => (
                  <button
                    key={eq.value}
                    onClick={() => toggleEquipment(eq.value)}
                    className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors active:scale-95 ${
                      activeEquipment.includes(eq.value)
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-secondary-foreground"
                    }`}
                  >
                    {eq.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <span className="text-xs font-medium">Effectiveness</span>
              <div className="flex gap-1.5">
                {[
                  { value: "all" as const, label: "All" },
                  { value: "compound" as const, label: "Compound" },
                  { value: "isolation" as const, label: "Isolation" },
                ].map((eff) => (
                  <button
                    key={eff.value}
                    onClick={() => setEffectiveness(eff.value)}
                    className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors active:scale-95 ${
                      effectiveness === eff.value
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-secondary-foreground"
                    }`}
                  >
                    {eff.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardHeader>
      <CardContent className="max-h-64 overflow-y-auto">
        {filtered.length > 0 ? (
          <div className="space-y-1">
            {filtered.map((ex) => (
              <button
                key={ex.id}
                onClick={() => onSelect(ex)}
                className="flex w-full items-center gap-3 rounded-md p-2 text-left transition-colors active:bg-accent"
              >
                <Dumbbell className="h-4 w-4 shrink-0 text-muted-foreground" />
                <div className="min-w-0 flex-1">
                  <span className="text-sm">{ex.name}</span>
                  <div className="flex gap-1.5 text-[10px] text-muted-foreground">
                    <span className="capitalize">{ex.muscle_group.replace("_", " ")}</span>
                    <span>·</span>
                    <span className="capitalize">{ex.equipment}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <p className="py-4 text-center text-sm text-muted-foreground">No exercises found</p>
        )}
        {filtered.length > 0 && (
          <p className="pt-2 text-center text-xs text-muted-foreground">{filtered.length} exercise{filtered.length !== 1 ? "s" : ""}</p>
        )}
      </CardContent>
    </Card>
  );
}
