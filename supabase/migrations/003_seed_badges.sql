-- Seed default badges
INSERT INTO public.badges (name, description, icon, criteria) VALUES
  ('First Workout', 'Complete your first workout', '🎯', '{"type": "workout_count", "threshold": 1}'::jsonb),
  ('Getting Started', 'Complete 5 workouts', '🌱', '{"type": "workout_count", "threshold": 5}'::jsonb),
  ('Consistent', 'Complete 10 workouts', '📅', '{"type": "workout_count", "threshold": 10}'::jsonb),
  ('Dedicated', 'Complete 25 workouts', '💪', '{"type": "workout_count", "threshold": 25}'::jsonb),
  ('Fitness Warrior', 'Complete 50 workouts', '⚔️', '{"type": "workout_count", "threshold": 50}'::jsonb),
  ('Century Club', 'Complete 100 workouts', '💯', '{"type": "workout_count", "threshold": 100}'::jsonb),
  ('3-Day Streak', 'Workout 3 days in a row', '🔥', '{"type": "streak", "threshold": 3}'::jsonb),
  ('7-Day Streak', 'Workout 7 days in a row', '⚡', '{"type": "streak", "threshold": 7}'::jsonb),
  ('14-Day Streak', 'Workout 14 days in a row', '🚀', '{"type": "streak", "threshold": 14}'::jsonb),
  ('30-Day Streak', 'Workout 30 days in a row', '🌟', '{"type": "streak", "threshold": 30}'::jsonb),
  ('Heavy Lifter', 'Lift 100kg in a single set', '🏋️', '{"type": "max_weight", "threshold": 100}'::jsonb),
  ('Volume King', 'Reach 10,000kg total volume', '👑', '{"type": "total_volume", "threshold": 10000}'::jsonb),
  ('Early Bird', 'Complete a workout before 7am', '🌅', '{"type": "early_bird", "threshold": 1}'::jsonb),
  ('Night Owl', 'Complete a workout after 10pm', '🦉', '{"type": "night_owl", "threshold": 1}'::jsonb)
ON CONFLICT DO NOTHING;
