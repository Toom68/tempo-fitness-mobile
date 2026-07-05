"use client";

import { useEffect, useState, useCallback } from "react";
import { RefreshCw, X } from "lucide-react";

const UPDATE_CHECK_INTERVAL = 60 * 60 * 1000; // 1 hour

export function ServiceWorkerRegister() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  const handleReload = useCallback(() => {
    if (registration?.waiting) {
      // Tell the waiting SW to skip waiting and activate
      registration.waiting.postMessage({ type: "SKIP_WAITING" });
    }
    // Reload to pick up the new cached assets
    window.location.reload();
  }, [registration]);

  useEffect(() => {
    if (!("serviceWorker" in navigator) || process.env.NODE_ENV !== "production") return;

    let reg: ServiceWorkerRegistration | undefined;

    navigator.serviceWorker
      .register("/sw.js")
      .then((r) => {
        reg = r;
        setRegistration(r);

        // Check if a new SW is already waiting (e.g. user came back after an update)
        if (r.waiting) {
          setUpdateAvailable(true);
        }

        // Listen for a new installing SW
        r.addEventListener("updatefound", () => {
          const installing = r.installing;
          if (!installing) return;

          installing.addEventListener("statechange", () => {
            if (installing.state === "installed" && navigator.serviceWorker.controller) {
              // New version installed and there's an existing controller → update ready
              setUpdateAvailable(true);
            }
          });
        });
      })
      .catch((err) => console.error("SW registration failed:", err));

    // Reload when the new SW takes control (skipWaiting + clientsClaim)
    const onControllerChange = () => {
      // Only reload if we had a controller before (not first install)
      if (navigator.serviceWorker.controller) {
        window.location.reload();
      }
    };
    navigator.serviceWorker.addEventListener("controllerchange", onControllerChange);

    // Periodic update checks
    const interval = setInterval(async () => {
      if (reg) {
        await reg.update();
      }
    }, UPDATE_CHECK_INTERVAL);

    // Also check when the tab becomes visible again
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible" && reg) {
        reg.update();
      }
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      clearInterval(interval);
      navigator.serviceWorker.removeEventListener("controllerchange", onControllerChange);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, []);

  if (!updateAvailable) return null;

  return (
    <div className="safe-top fixed inset-x-0 top-0 z-[60] flex items-center gap-3 border-b bg-primary px-4 py-2.5 text-primary-foreground shadow-lg md:px-6">
      <RefreshCw className="h-4 w-4 shrink-0" />
      <p className="flex-1 text-sm font-medium">A new version is available</p>
      <button
        onClick={handleReload}
        className="shrink-0 rounded-full bg-primary-foreground px-4 py-1 text-xs font-bold text-primary transition-transform active:scale-95"
      >
        Update
      </button>
      <button
        onClick={() => setUpdateAvailable(false)}
        className="shrink-0 rounded-full p-1 transition-colors active:scale-90"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
