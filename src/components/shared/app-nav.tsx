"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Dumbbell, LayoutDashboard, Dumbbell as Workout, BookOpen, Users, Settings, LogOut, Target } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { Native } from "@/lib/native";
import { ThemeToggle } from "@/components/shared/theme-toggle";

const navItems = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/workouts", label: "Workouts", icon: Workout },
  { href: "/programs", label: "Programs", icon: Target },
  { href: "/exercises", label: "Exercises", icon: BookOpen },
  { href: "/social", label: "Social", icon: Users },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function AppNav() {
  const pathname = usePathname();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.assign("/login");
  }

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="fixed left-0 top-0 z-40 hidden h-screen w-64 border-r bg-sidebar md:block">
        <div className="flex h-16 items-center gap-2 border-b px-6">
          <Dumbbell className="h-6 w-6 text-primary" />
          <span className="text-lg font-bold">Tempo Fitness</span>
          <div className="ml-auto">
            <ThemeToggle />
          </div>
        </div>
        <nav className="flex flex-col gap-1 p-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                pathname === item.href || pathname.startsWith(item.href + "/")
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 border-t p-4">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent/50"
          >
            <LogOut className="h-4 w-4" />
            Log Out
          </button>
        </div>
      </aside>

      {/* Mobile bottom tab bar — primary navigation, native app pattern */}
      <nav className="safe-bottom fixed bottom-0 left-0 right-0 z-40 flex items-stretch justify-around border-t bg-sidebar md:hidden">
        {navItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => Native.haptics.impact("light")}
              className={cn(
                "flex flex-1 flex-col items-center gap-0.5 pt-2 pb-1.5 text-[10px] font-medium transition-colors active:scale-95",
                active ? "text-primary" : "text-muted-foreground"
              )}
            >
              <item.icon className="h-5 w-5" strokeWidth={active ? 2.5 : 2} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
