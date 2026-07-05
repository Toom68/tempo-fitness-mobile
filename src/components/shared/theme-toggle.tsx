"use client";

import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "@/components/providers/theme-provider";
import { Native } from "@/lib/native";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const cycle = () => {
    Native.haptics.impact("light");
    const next = theme === "dark" ? "light" : theme === "light" ? "system" : "dark";
    setTheme(next);
  };

  return (
    <button
      onClick={cycle}
      className="flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors active:scale-90 hover:bg-accent"
      aria-label={`Theme: ${theme}`}
    >
      {theme === "dark" && <Moon className="h-4 w-4" />}
      {theme === "light" && <Sun className="h-4 w-4" />}
      {theme === "system" && <Monitor className="h-4 w-4" />}
    </button>
  );
}
