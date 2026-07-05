"use client";

import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <AlertTriangle className="h-12 w-12 text-destructive" />
      <div>
        <h2 className="text-xl font-bold">Something went wrong</h2>
        <p className="mt-1 text-sm text-muted-foreground">{error.message || "An unexpected error occurred"}</p>
      </div>
      <Button onClick={reset}>Try Again</Button>
    </div>
  );
}
