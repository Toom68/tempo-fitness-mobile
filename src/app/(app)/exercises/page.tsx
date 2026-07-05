"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Dumbbell } from "lucide-react";
import Link from "next/link";
import type { Exercise, MuscleGroup, Equipment } from "@/types";

const muscleGroups: (MuscleGroup | "all")[] = [
  "all", "chest", "back", "shoulders", "biceps", "triceps", "abs",
  "quads", "hamstrings", "glutes", "calves", "traps", "full_body",
];

const equipmentTypes: (Equipment | "all")[] = [
  "all", "barbell", "dumbbell", "machine", "cable", "kettlebell",
  "bodyweight", "bands", "plate", "other",
];

export default function ExercisesPage() {
  const [search, setSearch] = useState("");
  const [muscleFilter, setMuscleFilter] = useState<MuscleGroup | "all">("all");
  const [equipmentFilter, setEquipmentFilter] = useState<Equipment | "all">("all");

  const supabase = createClient();

  const { data: exercises, isLoading } = useQuery<Exercise[]>({
    queryKey: ["exercises"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("exercises")
        .select("*")
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  const filtered = useMemo(() => {
    if (!exercises) return [];
    return exercises.filter((ex) => {
      const matchesSearch = ex.name.toLowerCase().includes(search.toLowerCase());
      const matchesMuscle = muscleFilter === "all" || ex.muscle_group === muscleFilter;
      const matchesEquipment = equipmentFilter === "all" || ex.equipment === equipmentFilter;
      return matchesSearch && matchesMuscle && matchesEquipment;
    });
  }, [exercises, search, muscleFilter, equipmentFilter]);

  return (
    <div className="space-y-5 md:space-y-6">
      <div>
        <h1 className="text-xl font-bold md:text-2xl">Exercise Library</h1>
        <p className="text-sm text-muted-foreground">Browse {exercises?.length ?? 0} exercises</p>
      </div>

      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search exercises..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {muscleGroups.map((mg) => (
            <button
              key={mg}
              onClick={() => setMuscleFilter(mg)}
              className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium capitalize transition-colors active:scale-95 ${
                muscleFilter === mg
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground"
              }`}
            >
              {mg === "all" ? "All muscles" : mg.replace("_", " ")}
            </button>
          ))}
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {equipmentTypes.map((eq) => (
            <button
              key={eq}
              onClick={() => setEquipmentFilter(eq)}
              className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium capitalize transition-colors active:scale-95 ${
                equipmentFilter === eq
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground"
              }`}
            >
              {eq === "all" ? "All equipment" : eq}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="h-32" />
            </Card>
          ))}
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((exercise) => (
            <Link key={exercise.id} href={`/exercises/${exercise.id}`}>
              <Card className="cursor-pointer transition-colors active:bg-accent/50 md:hover:bg-accent/50">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base">{exercise.name}</CardTitle>
                    <Dumbbell className="h-4 w-4 shrink-0 text-muted-foreground" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className="capitalize">
                      {exercise.muscle_group.replace("_", " ")}
                    </Badge>
                    <Badge variant="outline" className="capitalize">
                      {exercise.equipment}
                    </Badge>
                  </div>
                  {exercise.instructions && (
                    <p className="mt-3 text-xs text-muted-foreground line-clamp-2">
                      {exercise.instructions}
                    </p>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Dumbbell className="mb-3 h-10 w-10 text-muted-foreground" />
            <p className="font-medium">No exercises found</p>
            <p className="text-sm text-muted-foreground">Try adjusting your filters</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
