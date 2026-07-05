import Link from "next/link";
import { Dumbbell, Brain, Users, Zap, ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const features = [
  {
    icon: Zap,
    title: "100% Free, No Ads",
    description: "No paywalls. No premium tiers. No ads. Ever. Open-source and privacy-first.",
  },
  {
    icon: Brain,
    title: "AI-Powered Coaching",
    description: "Smart workout plans that adapt to your progress. Form tips, deload detection, exercise substitutions.",
  },
  {
    icon: Users,
    title: "Social & Gamified",
    description: "Challenges, leaderboards, streaks, and friend workouts. Stay motivated together.",
  },
  {
    icon: Dumbbell,
    title: "Minimal & Fast",
    description: "Log a workout in under 30 seconds. No bloat, no tutorials needed. Get in and get out.",
  },
];

export default function LandingPage() {
  return (
    <div className="flex flex-col">
      <section className="relative overflow-hidden border-b">
        <div className="container mx-auto flex max-w-4xl flex-col items-center gap-6 px-4 py-24 text-center">
          <Badge variant="secondary" className="mb-2">
            Open Source · No Paywalls · No Ads
          </Badge>
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
            Track workouts.<br />Actually free.
          </h1>
          <p className="max-w-2xl text-lg text-muted-foreground">
            Tempo is the workout tracker that doesn&apos;t nickel-and-dime you. AI coaching, social challenges,
            and a clean interface — all 100% free, forever.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/signup">
              <Button size="lg" className="gap-2">
                Get Started Free <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline">
                Log In
              </Button>
            </Link>
          </div>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 pt-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5"><Check className="h-4 w-4 text-green-500" /> No credit card</span>
            <span className="flex items-center gap-1.5"><Check className="h-4 w-4 text-green-500" /> No ads</span>
            <span className="flex items-center gap-1.5"><Check className="h-4 w-4 text-green-500" /> Your data is yours</span>
          </div>
        </div>
      </section>

      <section className="container mx-auto max-w-5xl px-4 py-20">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold tracking-tight">Why Tempo?</h2>
          <p className="mt-2 text-muted-foreground">Everything you need, nothing you don&apos;t.</p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2">
          {features.map((feature) => (
            <Card key={feature.title}>
              <CardHeader>
                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <feature.icon className="h-5 w-5 text-primary" />
                </div>
                <CardTitle>{feature.title}</CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      <section className="border-t bg-muted/50">
        <div className="container mx-auto flex max-w-2xl flex-col items-center gap-6 px-4 py-20 text-center">
          <h2 className="text-3xl font-bold tracking-tight">Ready to start training?</h2>
          <p className="text-muted-foreground">
            Join the community. It&apos;s free, it&apos;s fast, and it&apos;s yours.
          </p>
          <Link href="/signup">
            <Button size="lg" className="gap-2">
              Create Free Account <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      <footer className="border-t py-8">
        <div className="container mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 px-4 text-sm text-muted-foreground sm:flex-row">
          <div className="flex items-center gap-2">
            <Dumbbell className="h-5 w-5" />
            <span className="font-semibold">Tempo Fitness</span>
          </div>
          <p>Open source · MIT License · Built with care</p>
        </div>
      </footer>
    </div>
  );
}
