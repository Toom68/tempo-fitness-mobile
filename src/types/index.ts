export type MuscleGroup =
  | "chest"
  | "back"
  | "shoulders"
  | "biceps"
  | "triceps"
  | "forearms"
  | "abs"
  | "quads"
  | "hamstrings"
  | "glutes"
  | "calves"
  | "traps"
  | "full_body";

export type Equipment =
  | "barbell"
  | "dumbbell"
  | "machine"
  | "cable"
  | "kettlebell"
  | "bodyweight"
  | "bands"
  | "plate"
  | "other";

export type Goal = "strength" | "hypertrophy" | "endurance" | "general";

export type ExperienceLevel = "beginner" | "intermediate" | "advanced";

export type UnitPreference = "kg" | "lb";

export interface Profile {
  id: string;
  username: string;
  display_name: string | null;
  goals: Goal[];
  experience: ExperienceLevel;
  equipment: Equipment[];
  unit_pref: UnitPreference;
  created_at: string;
}

export interface Exercise {
  id: string;
  name: string;
  muscle_group: MuscleGroup;
  secondary_muscles: MuscleGroup[];
  equipment: Equipment;
  instructions: string;
  demo_url: string | null;
  created_by: string | null;
  created_at: string;
}

export interface WorkoutSet {
  id: string;
  workout_exercise_id: string;
  set_number: number;
  reps: number;
  weight: number;
  rpe: number | null;
  completed: boolean;
  created_at: string;
}

export interface WorkoutExercise {
  id: string;
  workout_id: string;
  exercise_id: string;
  order: number;
  notes: string | null;
  exercise?: Exercise;
  sets?: WorkoutSet[];
}

export interface Workout {
  id: string;
  user_id: string;
  name: string;
  date: string;
  duration: number | null;
  notes: string | null;
  completed: boolean;
  created_at: string;
  exercises?: WorkoutExercise[];
}

export interface Program {
  id: string;
  user_id: string;
  name: string;
  goal: Goal;
  frequency: number;
  duration_weeks: number;
  is_active: boolean;
  created_at: string;
}

export interface ProgramDay {
  id: string;
  program_id: string;
  day_name: string;
  order: number;
}

export interface ProgramExercise {
  id: string;
  program_day_id: string;
  exercise_id: string;
  sets: number;
  reps_scheme: string;
  rest_seconds: number;
  exercise?: Exercise;
}

export interface Challenge {
  id: string;
  name: string;
  type: "streak" | "volume" | "frequency" | "custom";
  start_date: string;
  end_date: string;
  goal: number;
  created_by: string;
}

export interface Friendship {
  id: string;
  user_id: string;
  friend_id: string;
  status: "pending" | "accepted" | "blocked";
  created_at: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  criteria: Record<string, unknown>;
}

export interface UserBadge {
  id: string;
  user_id: string;
  badge_id: string;
  earned_at: string;
}
