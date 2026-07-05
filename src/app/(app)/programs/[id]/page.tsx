import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dumbbell, Calendar, Target, Play } from "lucide-react";
import { notFound } from "next/navigation";
import { BackHeader } from "@/components/shared/back-header";
import { StartProgramButton } from "@/components/program/start-program-button";

export default async function ProgramDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: program } = await supabase
    .from("programs")
    .select(`
      *,
      program_days(
        id,
        day_name,
        order,
        program_exercises(
          id,
          sets,
          reps_scheme,
          rest_seconds,
          exercise:exercises(id, name, muscle_group, equipment)
        )
      )
    `)
    .eq("id", id)
    .eq("user_id", user!.id)
    .single();

  if (!program) notFound();

  const days = (program.program_days ?? []).sort(
    (a: any, b: any) => a.order - b.order
  );

  return (
    <div className="space-y-5 md:space-y-6">
      <BackHeader
        title={program.name}
        href="/programs"
        rightSlot={
          <StartProgramButton programId={program.id} active={program.is_active} />
        }
      />

      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground md:gap-3 md:text-sm">
        <span className="flex items-center gap-1">
          <Calendar className="h-3.5 w-3.5" /> {program.duration_weeks} weeks
        </span>
        <span className="flex items-center gap-1">
          <Target className="h-3.5 w-3.5" /> {program.frequency}x per week
        </span>
        <Badge variant="outline" className="capitalize">{program.goal}</Badge>
        {program.is_active && (
          <Badge variant="secondary" className="text-green-500">Active</Badge>
        )}
      </div>

      <div className="space-y-3 md:space-y-4">
        {days.map((day: any, idx: number) => {
          const exercises = day.program_exercises ?? [];
          return (
            <Card key={day.id}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 font-bold text-primary">
                    {idx + 1}
                  </div>
                  <div>
                    <CardTitle className="text-base">{day.day_name}</CardTitle>
                    <p className="text-xs text-muted-foreground">{exercises.length} exercises</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {exercises.length > 0 ? (
                  <div className="space-y-2">
                    {exercises.map((pe: any) => (
                      <div
                        key={pe.id}
                        className="flex items-center justify-between rounded-lg border p-2.5"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <Dumbbell className="h-4 w-4 text-muted-foreground shrink-0" />
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium">{pe.exercise?.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {pe.sets} sets · {pe.reps_scheme} reps
                              {pe.rest_seconds > 0 && ` · ${pe.rest_seconds}s rest`}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-1.5 shrink-0">
                          <Badge variant="secondary" className="capitalize text-xs">
                            {pe.exercise?.muscle_group?.replace("_", " ")}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground py-2">No exercises assigned</p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {days.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Dumbbell className="mb-3 h-10 w-10 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">No training days in this program</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
