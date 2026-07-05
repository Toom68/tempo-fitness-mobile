import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Dumbbell } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <Dumbbell className="h-12 w-12 text-muted-foreground" />
      <div>
        <h2 className="text-2xl font-bold">Page Not Found</h2>
        <p className="mt-1 text-sm text-muted-foreground">This page doesn&apos;t exist or has been moved.</p>
      </div>
      <Link href="/dashboard">
        <Button>Back to Dashboard</Button>
      </Link>
    </div>
  );
}
