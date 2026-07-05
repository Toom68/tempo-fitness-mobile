import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Trophy, Flame, UserPlus, Clock } from "lucide-react";
import { FriendSearch } from "@/components/social/friend-search";
import { FriendRequestButton } from "@/components/social/friend-request-button";

export default async function SocialPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  // Fetch friends (accepted) and pending requests
  const { data: friendships } = await supabase
    .from("friendships")
    .select(`
      id,
      status,
      user_id,
      friend_id,
      created_at,
      friend:profiles!friendships_friend_id_fkey(display_name, avatar_url),
      requester:profiles!friendships_user_id_fkey(display_name, avatar_url)
    `)
    .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`)
    .order("created_at", { ascending: false });

  const friends = (friendships ?? []).filter((f: any) => f.status === "accepted");
  const pendingRequests = (friendships ?? []).filter(
    (f: any) => f.status === "pending" && f.friend_id === user.id
  );

  // Weekly leaderboard — top users by workout count
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const { data: weekWorkouts } = await supabase
    .from("workouts")
    .select("user_id, profiles!inner(display_name)")
    .eq("completed", true)
    .gte("date", weekAgo.toISOString().split("T")[0]);

  const leaderboard = new Map<string, { name: string; count: number }>();
  for (const w of weekWorkouts ?? []) {
    const uid = w.user_id;
    const name = (w.profiles as any)?.display_name ?? "Unknown";
    const existing = leaderboard.get(uid);
    if (existing) existing.count++;
    else leaderboard.set(uid, { name, count: 1 });
  }
  const topUsers = Array.from(leaderboard.entries())
    .map(([uid, data]) => ({ uid, ...data }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return (
    <div className="space-y-5 md:space-y-6">
      <div>
        <h1 className="text-xl font-bold md:text-2xl">Social</h1>
        <p className="text-sm text-muted-foreground">Friends, challenges & leaderboards</p>
      </div>

      {/* Pending friend requests */}
      {pendingRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock className="h-4 w-4" /> Pending Requests
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {pendingRequests.map((req: any) => (
              <div key={req.id} className="flex items-center justify-between rounded-lg border p-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                    {(req.requester?.display_name ?? "?")[0]?.toUpperCase()}
                  </div>
                  <span className="text-sm font-medium">{req.requester?.display_name}</span>
                </div>
                <FriendRequestButton requestId={req.id} />
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Friend search */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <UserPlus className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base">Find Friends</CardTitle>
              <CardDescription>Search by display name</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <FriendSearch currentUserId={user.id} />
        </CardContent>
      </Card>

      {/* Friends list */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base">Friends ({friends.length})</CardTitle>
              <CardDescription>Your training partners</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {friends.length > 0 ? (
            <div className="space-y-2">
              {friends.map((f: any) => {
                const friendData = f.user_id === user.id ? f.friend : f.requester;
                return (
                  <div key={f.id} className="flex items-center gap-3 rounded-lg border p-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                      {(friendData?.display_name ?? "?")[0]?.toUpperCase()}
                    </div>
                    <span className="text-sm font-medium">{friendData?.display_name}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="py-4 text-center text-sm text-muted-foreground">
              No friends yet — search above to add some!
            </p>
          )}
        </CardContent>
      </Card>

      {/* Leaderboard */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-orange-500" />
            Weekly Leaderboard
          </CardTitle>
          <CardDescription>Top performers this week</CardDescription>
        </CardHeader>
        <CardContent>
          {topUsers.length > 0 ? (
            <div className="space-y-2">
              {topUsers.map((u, i) => (
                <div
                  key={u.uid}
                  className={`flex items-center justify-between rounded-lg p-3 ${
                    u.uid === user.id ? "bg-primary/10 border border-primary/20" : "bg-muted/50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Badge variant={i < 3 ? "default" : "secondary"}>{i + 1}</Badge>
                    <span className="font-medium text-sm">
                      {u.name}{u.uid === user.id && " (You)"}
                    </span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {u.count} {u.count === 1 ? "workout" : "workouts"}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
              <div className="flex items-center gap-3">
                <Badge variant="default">1</Badge>
                <span className="font-medium">Be the first!</span>
              </div>
              <span className="text-sm text-muted-foreground">0 workouts</span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
