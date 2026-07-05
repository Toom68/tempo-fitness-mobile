"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, UserPlus, Check } from "lucide-react";
import { Native } from "@/lib/native";

export function FriendSearch({ currentUserId }: { currentUserId: string }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [sent, setSent] = useState<Set<string>>(new Set());
  const supabase = createClient();

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    setSearching(true);
    const { data } = await supabase
      .from("profiles")
      .select("id, display_name, avatar_url")
      .ilike("display_name", `%${query.trim()}%`)
      .neq("id", currentUserId)
      .limit(10);
    setResults(data ?? []);
    setSearching(false);
  }

  async function handleAdd(friendId: string) {
    Native.haptics.impact("medium");
    await supabase.from("friendships").insert({
      user_id: currentUserId,
      friend_id: friendId,
      status: "pending",
    });
    setSent((prev) => new Set(prev).add(friendId));
    Native.haptics.notification();
  }

  return (
    <div className="space-y-3">
      <form onSubmit={handleSearch} className="flex gap-2">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name..."
          className="flex-1"
        />
        <Button type="submit" size="icon" disabled={searching}>
          <Search className="h-4 w-4" />
        </Button>
      </form>

      {results.length > 0 && (
        <div className="space-y-2">
          {results.map((r) => (
            <div key={r.id} className="flex items-center justify-between rounded-lg border p-3">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                  {(r.display_name ?? "?")[0]?.toUpperCase()}
                </div>
                <span className="text-sm font-medium">{r.display_name}</span>
              </div>
              {sent.has(r.id) ? (
                <span className="flex items-center gap-1 text-xs text-green-500">
                  <Check className="h-3.5 w-3.5" /> Sent
                </span>
              ) : (
                <Button size="sm" variant="outline" className="gap-1" onClick={() => handleAdd(r.id)}>
                  <UserPlus className="h-3.5 w-3.5" /> Add
                </Button>
              )}
            </div>
          ))}
        </div>
      )}

      {results.length === 0 && query && !searching && (
        <p className="py-2 text-center text-sm text-muted-foreground">No users found</p>
      )}
    </div>
  );
}
