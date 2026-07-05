-- Exercise Library Seed Data
-- Run after 001_initial_schema.sql

insert into public.exercises (name, muscle_group, secondary_muscles, equipment, instructions) values
-- CHEST
('Barbell Bench Press', 'chest', array['triceps','shoulders'], 'barbell', 'Lie on a flat bench, grip the bar slightly wider than shoulder-width, lower to mid-chest, press up.'),
('Incline Dumbbell Press', 'chest', array['shoulders'], 'dumbbell', 'Set bench to 30-45 degrees, press dumbbells up and slightly together, lower with control.'),
('Dumbbell Fly', 'chest', array[]::text[], 'dumbbell', 'Lie flat, arms extended with slight bend, lower in wide arc, squeeze chest to return.'),
('Push-Up', 'chest', array['triceps','abs'], 'bodyweight', 'Hands shoulder-width, body straight, lower chest to floor, push up.'),
('Cable Crossover', 'chest', array[]::text[], 'cable', 'Stand between cables, lean slightly forward, bring hands together in front of chest.'),
('Decline Bench Press', 'chest', array['triceps'], 'barbell', 'Lie on decline bench, lower bar to lower chest, press up.'),
('Dumbbell Pullover', 'chest', array['back'], 'dumbbell', 'Lie across bench, lower dumbbell behind head in arc, pull back to chest.'),
('Machine Chest Press', 'chest', array['triceps','shoulders'], 'machine', 'Sit at machine, grip handles, press forward with control.'),
('Weighted Dips', 'chest', array['triceps','shoulders'], 'bodyweight', 'Support body on parallel bars, lean forward, lower and push up.'),

-- BACK
('Deadlift', 'back', array['glutes','hamstrings','traps'], 'barbell', 'Stand with feet hip-width, grip bar, keep back straight, lift by extending hips and knees.'),
('Pull-Up', 'back', array['biceps'], 'bodyweight', 'Hang from bar, pull chin above bar, lower with control.'),
('Bent-Over Barbell Row', 'back', array['biceps'], 'barbell', 'Hinge at hips, pull bar to lower ribs, lower with control.'),
('Lat Pulldown', 'back', array['biceps'], 'cable', 'Sit at machine, pull bar to upper chest, control on the way up.'),
('Seated Cable Row', 'back', array['biceps'], 'cable', 'Sit at machine, pull handle to torso, squeeze shoulder blades.'),
('Dumbbell Row', 'back', array['biceps'], 'dumbbell', 'One knee on bench, pull dumbbell to hip, lower with control.'),
('T-Bar Row', 'back', array['biceps'], 'plate', 'Stand over T-bar, grip handle, pull to chest, lower with control.'),
('Face Pull', 'shoulders', array['traps'], 'cable', 'Pull cable rope to face, elbows high, squeeze rear delts.'),
('Chin-Up', 'back', array['biceps'], 'bodyweight', 'Underhand grip, pull chin above bar, lower with control.'),

-- SHOULDERS
('Overhead Press', 'shoulders', array['triceps'], 'barbell', 'Stand, press bar from shoulders overhead, lower to collarbone.'),
('Dumbbell Shoulder Press', 'shoulders', array['triceps'], 'dumbbell', 'Sit or stand, press dumbbells overhead, lower to shoulder level.'),
('Lateral Raise', 'shoulders', array[]::text[], 'dumbbell', 'Stand, raise dumbbells to sides to shoulder height, lower slowly.'),
('Front Raise', 'shoulders', array[]::text[], 'dumbbell', 'Raise dumbbells forward to shoulder height, lower with control.'),
('Reverse Pec Deck', 'shoulders', array[]::text[], 'machine', 'Sit facing machine, bring pads back squeezing rear delts.'),
('Arnold Press', 'shoulders', array['triceps'], 'dumbbell', 'Start with palms facing you, rotate outward as you press up.'),
('Barbell Shrugs', 'traps', array[]::text[], 'barbell', 'Hold bar at arms length, shrug shoulders up, hold, lower.'),
('Cable Lateral Raise', 'shoulders', array[]::text[], 'cable', 'Stand beside low cable, raise handle to side to shoulder height.'),

-- BICEPS
('Barbell Curl', 'biceps', array[]::text[], 'barbell', 'Stand, curl bar with elbows pinned, squeeze at top, lower slowly.'),
('Dumbbell Curl', 'biceps', array[]::text[], 'dumbbell', 'Alternate curling dumbbells, supinate wrist as you curl.'),
('Hammer Curl', 'biceps', array['forearms'], 'dumbbell', 'Curl dumbbells with neutral grip, keep wrists straight.'),
('Preacher Curl', 'biceps', array[]::text[], 'barbell', 'Rest arms on preacher bench, curl bar up, lower fully.'),
('Cable Curl', 'biceps', array[]::text[], 'cable', 'Attach bar to low cable, curl with elbows pinned to sides.'),
('Concentration Curl', 'biceps', array[]::text[], 'dumbbell', 'Sit, elbow on inner thigh, curl dumbbell with full range.'),
('Incline Dumbbell Curl', 'biceps', array[]::text[], 'dumbbell', 'Lie on incline bench, arms hanging, curl with full stretch.'),

-- TRICEPS
('Tricep Pushdown', 'triceps', array[]::text[], 'cable', 'Stand at cable machine, push bar down keeping elbows pinned.'),
('Skull Crushers', 'triceps', array[]::text[], 'barbell', 'Lie flat, lower bar to forehead, extend back up.'),
('Close-Grip Bench Press', 'triceps', array['chest','shoulders'], 'barbell', 'Grip bar shoulder-width, lower to lower chest, press up.'),
('Overhead Tricep Extension', 'triceps', array[]::text[], 'dumbbell', 'Hold dumbbell overhead, lower behind head, extend up.'),
('Tricep Dips', 'triceps', array['chest','shoulders'], 'bodyweight', 'On parallel bars, keep body upright, lower and push up.'),
('Cable Overhead Extension', 'triceps', array[]::text[], 'cable', 'Attach rope to low cable, extend overhead keeping elbows up.'),
('Kickback', 'triceps', array[]::text[], 'dumbbell', 'Hinge forward, extend dumbbell backward, keep elbow pinned.'),

-- LEGS - QUADS
('Back Squat', 'quads', array['glutes','hamstrings'], 'barbell', 'Bar on upper back, feet shoulder-width, squat to depth, drive up.'),
('Front Squat', 'quads', array['glutes'], 'barbell', 'Bar on front delts, keep torso upright, squat to depth.'),
('Leg Press', 'quads', array['glutes','hamstrings'], 'machine', 'Feet on platform shoulder-width, lower with control, press up.'),
('Lunge', 'quads', array['glutes','hamstrings'], 'bodyweight', 'Step forward, lower back knee, push back to start.'),
('Leg Extension', 'quads', array[]::text[], 'machine', 'Sit at machine, extend knees fully, lower with control.'),
('Bulgarian Split Squat', 'quads', array['glutes'], 'dumbbell', 'Rear foot on bench, lower front thigh to parallel, drive up.'),
('Goblet Squat', 'quads', array['glutes'], 'kettlebell', 'Hold weight at chest, squat between knees, drive up.'),
('Step-Up', 'quads', array['glutes'], 'dumbbell', 'Hold dumbbells, step onto bench, drive through front leg.'),

-- LEGS - HAMSTRINGS
('Romanian Deadlift', 'hamstrings', array['glutes','back'], 'barbell', 'Hinge at hips with slight knee bend, lower bar along legs, squeeze glutes to return.'),
('Leg Curl', 'hamstrings', array[]::text[], 'machine', 'Lie or sit at machine, curl heels toward glutes, lower with control.'),
('Good Morning', 'hamstrings', array['glutes','back'], 'barbell', 'Bar on back, hinge forward at hips keeping legs straight, return.'),
('Glute Ham Raise', 'hamstrings', array['glutes'], 'bodyweight', 'Anchor feet, lower body using hamstrings, pull back up.'),

-- GLUTES
('Hip Thrust', 'glutes', array['hamstrings'], 'barbell', 'Upper back on bench, bar on hips, thrust up squeezing glutes.'),
('Cable Pull-Through', 'glutes', array['hamstrings'], 'cable', 'Face away from cable, hinge and pull rope through legs.'),
('Glute Bridge', 'glutes', array['hamstrings'], 'bodyweight', 'Lie on back, drive hips up squeezing glutes, lower slowly.'),
('Cable Kickback', 'glutes', array[]::text[], 'cable', 'Attach ankle strap, kick leg back squeezing glute.'),

-- CALVES
('Standing Calf Raise', 'calves', array[]::text[], 'machine', 'Stand on calf block, lower heels, raise up on toes.'),
('Seated Calf Raise', 'calves', array[]::text[], 'machine', 'Sit at machine, raise heels squeezing calves, lower for stretch.'),
('Donkey Calf Raise', 'calves', array[]::text[], 'bodyweight', 'Bend at waist, raise heels with weight on hips.'),

-- ABS / CORE
('Plank', 'abs', array[]::text[], 'bodyweight', 'Hold push-up position on forearms, keep body straight.'),
('Hanging Leg Raise', 'abs', array[]::text[], 'bodyweight', 'Hang from bar, raise legs to parallel or higher, lower with control.'),
('Cable Crunch', 'abs', array[]::text[], 'cable', 'Kneel at cable, crunch down pulling rope, return slowly.'),
('Russian Twist', 'abs', array[]::text[], 'bodyweight', 'Sit, lean back, rotate torso side to side.'),
('Ab Wheel Rollout', 'abs', array['shoulders'], 'bodyweight', 'Kneel, roll wheel forward extending body, pull back.'),
('Mountain Climber', 'abs', array['shoulders'], 'bodyweight', 'Plank position, alternate driving knees to chest.'),
('Decline Sit-Up', 'abs', array[]::text[], 'bodyweight', 'Lie on decline bench, sit up fully, lower with control.'),

-- FOREARMS
('Wrist Curl', 'forearms', array[]::text[], 'dumbbell', 'Rest forearms on bench, curl wrists up, lower slowly.'),
('Farmer Walk', 'forearms', array['traps'], 'dumbbell', 'Hold heavy dumbbells, walk for distance, grip tight.'),

-- FULL BODY
('Burpee', 'full_body', array['chest','quads','abs'], 'bodyweight', 'From standing, drop to push-up, pop hips, jump up.'),
('Kettlebell Swing', 'full_body', array['glutes','hamstrings','shoulders'], 'kettlebell', 'Hinge at hips, swing kettlebell up to shoulder height, snap glutes.'),
('Thruster', 'full_body', array['quads','shoulders'], 'barbell', 'Front squat into overhead press in one fluid motion.'),
('Turkish Get-Up', 'full_body', array['shoulders','abs'], 'kettlebell', 'From lying to standing while holding weight overhead.')
on conflict do nothing;
