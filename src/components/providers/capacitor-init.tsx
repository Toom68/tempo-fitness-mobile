"use client";

import { useEffect } from "react";
import { Native } from "@/lib/native";

/**
 * Runs native Capacitor setup once on mount:
 * - Hides the splash screen after the React tree is ready
 * - Locks status bar to dark style (white icons on dark bg)
 *
 * This component renders nothing and no-ops gracefully in browser/PWA mode.
 */
export function CapacitorInit() {
  useEffect(() => {
    Native.splash.hide();
    // Short timeout so the page content is visibly painted before splash fades
    const timer = setTimeout(() => Native.splash.hide(), 300);
    return () => clearTimeout(timer);
  }, []);

  return null;
}
