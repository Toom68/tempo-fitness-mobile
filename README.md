# Tempo Fitness

A 100% free, AI-powered, social workout tracker. No paywalls, no ads, no premium tiers.

## Features

- **Workout Tracking** — Create, edit, and delete workouts with exercises, sets, reps, and weight
- **Live Session Mode** — Real-time workout timer with rest timer presets (60s, 90s, 2m, 3m, 5m)
- **Exercise Library** — Browse 40+ exercises with search, muscle group and equipment filters
- **Dashboard** — Track total workouts, streaks, volume, time, weekly stats, and workout frequency chart
- **Onboarding** — 5-step profile setup: display name, goals, experience, equipment, units
- **Auth** — Email/password authentication via Supabase with protected routes
- **PWA** — Installable on mobile with standalone display mode
- **Dark Mode** — Full dark theme out of the box
- **Responsive** — Works on desktop, tablet, and mobile

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **UI**: React 19, TailwindCSS 4, shadcn/ui components
- **Backend**: Supabase (Postgres, Auth, RLS)
- **State**: React Query, Zustand
- **Language**: TypeScript
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- A Supabase account (free tier works)

### Setup

1. **Clone the repo**
   ```bash
   git clone https://github.com/tempo-fitness/tempo-fitness.git
   cd tempo-fitness
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   Fill in your Supabase URL and anon key from [Supabase Dashboard](https://supabase.com/dashboard) → Settings → API.

4. **Run database migrations**
   Go to Supabase SQL Editor and run:
   - `supabase/migrations/001_initial_schema.sql` — Creates tables, RLS policies, and triggers
   - `supabase/migrations/002_seed_exercises.sql` — Seeds the exercise library

5. **Start the dev server**
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
src/
├── app/
│   ├── (app)/              # Authenticated routes
│   │   ├── dashboard/      # Stats, streaks, recent workouts
│   │   ├── exercises/      # Exercise library + detail pages
│   │   ├── workouts/       # Workout CRUD + live session
│   │   ├── social/         # Social features placeholder
│   │   └── settings/       # Profile settings
│   ├── login/              # Login page
│   ├── signup/             # Signup page
│   ├── onboarding/         # Post-signup profile setup
│   ├── layout.tsx          # Root layout with providers
│   ├── page.tsx            # Landing page
│   ├── error.tsx           # Error boundary
│   └── not-found.tsx       # 404 page
├── components/
│   ├── ui/                 # shadcn/ui components
│   ├── providers/          # Supabase + Query providers
│   ├── shared/             # App navigation
│   └── workout/            # Workout-specific components
├── lib/
│   ├── supabase/           # Client + server Supabase helpers
│   └── utils.ts            # Utility functions
├── types/
│   └── index.ts            # TypeScript type definitions
└── proxy.ts                # Auth middleware (Next.js 16 proxy)
supabase/
└── migrations/
    ├── 001_initial_schema.sql  # DB schema + RLS
    └── 002_seed_exercises.sql  # Exercise seed data
```

## Database Schema

- **profiles** — User profile (username, goals, experience, equipment, units)
- **exercises** — Exercise library (name, muscle group, equipment, instructions)
- **workouts** — Workout sessions (name, date, duration, notes, completed)
- **workout_exercises** — Exercises within a workout (order, notes)
- **workout_sets** — Sets within a workout exercise (reps, weight, RPE, completed)
- **programs** — Training programs (goal, frequency, duration)
- **challenges** — Fitness challenges (type, start/end, goal)
- **friendships** — Social connections (status: pending/accepted/blocked)
- **badges** — Achievement badges

All tables use Row-Level Security (RLS) to ensure users can only access their own data.

## Roadmap

- [ ] AI-powered workout plan generation
- [ ] Social features: friends, challenges, leaderboards
- [ ] Progress charts and PR tracking
- [ ] Custom exercise creation
- [ ] Workout templates
- [ ] React Native mobile app
- [ ] Offline mode with sync

## License

MIT — Free to use, modify, and distribute.
