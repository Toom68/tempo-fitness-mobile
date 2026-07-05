/**
 * native.ts — Capacitor plugin bridge
 *
 * All calls gracefully no-op when running in a plain browser so the same
 * codebase works as a PWA on desktop/browser users.
 */

const isNative = (): boolean =>
  typeof window !== "undefined" && "Capacitor" in window;

// ─── Haptics ─────────────────────────────────────────────────────────────────

async function impact(style: "light" | "medium" | "heavy" = "medium") {
  if (!isNative()) return;
  try {
    const { Haptics, ImpactStyle } = await import("@capacitor/haptics");
    const map = {
      light: ImpactStyle.Light,
      medium: ImpactStyle.Medium,
      heavy: ImpactStyle.Heavy,
    } as const;
    await Haptics.impact({ style: map[style] });
  } catch {
    // Plugin unavailable — silent no-op
  }
}

async function notification() {
  if (!isNative()) return;
  try {
    const { Haptics } = await import("@capacitor/haptics");
    await Haptics.notification({ type: "SUCCESS" } as Parameters<typeof Haptics.notification>[0]);
  } catch {}
}

async function selectionStart() {
  if (!isNative()) return;
  try {
    const { Haptics } = await import("@capacitor/haptics");
    await Haptics.selectionStart();
  } catch {}
}

async function selectionEnd() {
  if (!isNative()) return;
  try {
    const { Haptics } = await import("@capacitor/haptics");
    await Haptics.selectionEnd();
  } catch {}
}

// ─── Status Bar ───────────────────────────────────────────────────────────────

async function hideStatusBar() {
  if (!isNative()) return;
  try {
    const { StatusBar } = await import("@capacitor/status-bar");
    await StatusBar.hide();
  } catch {}
}

async function showStatusBar() {
  if (!isNative()) return;
  try {
    const { StatusBar } = await import("@capacitor/status-bar");
    await StatusBar.show();
  } catch {}
}

// ─── Splash Screen ────────────────────────────────────────────────────────────

async function hideSplash() {
  if (!isNative()) return;
  try {
    const { SplashScreen } = await import("@capacitor/splash-screen");
    await SplashScreen.hide();
  } catch {}
}

// ─── Exports ─────────────────────────────────────────────────────────────────

export const Native = {
  haptics: { impact, notification, selectionStart, selectionEnd },
  statusBar: { hide: hideStatusBar, show: showStatusBar },
  splash: { hide: hideSplash },
  isNative,
};
