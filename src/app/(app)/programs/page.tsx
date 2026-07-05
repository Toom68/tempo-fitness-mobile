import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Calendar, Dumbbell, Plus, Target } from "lucide-react";
import { BackHeader } from "@/components/shared/back-header";

export default async function ProgramsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: programs } = await supabase
    .from("programs")
    .select(`
      *,
      program_days(id, day_name, order, program_exercises(id))
    `)
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-5 md:space-y-6">
      <BackHeader
        title="Programs"
        href="/dashboard"
        rightSlot={
          <Link href="/programs/new">
            <Button size="sm" className="gap-2">
              <Plus className="h-4 w-4" /> <span className="hidden sm:inline">New Program</span><span className="sm:hidden">New</span>
            </Button>
          </Link>
        }
      />

      <p className="text-sm text-muted-foreground">
        Structured multi-week training plans. Start a program to auto-generate workouts.
      </p>

      {programs && programs.length > 0 ? (
        <div className="space-y-3">
          {programs.map((program: any) => {
            const days = program.program_days ?? [];
            const totalExercises = days.reduce(
              (sum: number, d: any) => sum + (d.program_exercises?.length ?? 0),
              0
            );
            return (
              <Link key={program.id} href={`/programs/${program.id}`}>
                <Card className="cursor-pointer transition-colors active:bg-accent/50 md:hover:bg-accent/50">
                  <CardContent className="flex items-center justify-between py-4">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                        <Target className="h-6 w-6 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-medium">{program.name}</p>
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" /> {program.duration_weeks}w
                          </span>
                          <span className="flex items-center gap-1">
                            <Dumbbell className="h-3 w-3" /> {program.frequency}x/wk
                          </span>
                          <span>{days.length} days · {totalExercises} exercises</span>
                        </div>
                      </div>
                    </div>
                    <div className="shrink-0">
                      {program.is_active ? (
                        <Badge variant="secondary" className="text-green-500">Active</Badge>
                      ) : (
                        <Badge variant="outline">Inactive</Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Target className="mb-3 h-12 w-12 text-muted-foreground" />
            <p className="mb-1 font-medium">No programs yet</p>
            <p className="mb-4 text-sm text-muted-foreground">
              Create a structured training plan to auto-generate workouts
            </p>
            <Link href="/programs/new">
              <Button className="gap-2">
                <Plus className="h-4 w-4" /> Create Program
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
