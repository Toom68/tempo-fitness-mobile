import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Dumbbell, Plus } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function ExerciseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: exercise } = await supabase
    .from("exercises")
    .select("*")
    .eq("id", id)
    .single();

  if (!exercise) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/exercises">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">{exercise.name}</h1>
      </div>

      <div className="flex flex-wrap gap-2">
        <Badge variant="secondary" className="capitalize">
          {exercise.muscle_group.replace("_", " ")}
        </Badge>
        <Badge variant="outline" className="capitalize">
          {exercise.equipment}
        </Badge>
        {exercise.secondary_muscles?.map((m: string) => (
          <Badge key={m} variant="outline" className="capitalize">
            {m.replace("_", " ")}
          </Badge>
        ))}
      </div>

      {exercise.instructions && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">How to Perform</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed text-muted-foreground">{exercise.instructions}</p>
          </CardContent>
        </Card>
      )}

      <Link href="/workouts/new">
        <Button className="w-full gap-2">
          <Plus className="h-4 w-4" /> Add to Workout
        </Button>
      </Link>
    </div>
  );
}
