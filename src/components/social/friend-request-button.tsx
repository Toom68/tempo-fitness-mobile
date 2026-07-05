"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import { Native } from "@/lib/native";

export function FriendRequestButton({ requestId }: { requestId: string }) {
  const [status, setStatus] = useState<"pending" | "accepted" | "rejected">("pending");
  const supabase = createClient();

  async function handleAccept() {
    Native.haptics.impact("medium");
    await supabase
      .from("friendships")
      .update({ status: "accepted" })
      .eq("id", requestId);
    setStatus("accepted");
    Native.haptics.notification();
  }

  async function handleReject() {
    Native.haptics.impact("light");
    await supabase
      .from("friendships")
      .update({ status: "blocked" })
      .eq("id", requestId);
    setStatus("rejected");
  }

  if (status === "accepted") {
    return <span className="flex items-center gap-1 text-xs text-green-500"><Check className="h-3.5 w-3.5" /> Friends</span>;
  }
  if (status === "rejected") {
    return <span className="text-xs text-muted-foreground">Declined</span>;
  }

  return (
    <div className="flex gap-2">
      <Button size="sm" className="gap-1" onClick={handleAccept}>
        <Check className="h-3.5 w-3.5" /> Accept
      </Button>
      <Button size="sm" variant="outline" onClick={handleReject}>
        <X className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}
