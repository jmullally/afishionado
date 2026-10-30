import type { SupabaseClient } from "@supabase/supabase-js";

export type Friendship = { requester: string; addressee: string; status: "pending" | "accepted" };

/** How `me` relates to `other`, from me's point of view. */
export type Relationship = "self" | "friends" | "sent" | "received" | "blocked" | "none";

export async function getFriendships(supabase: SupabaseClient, me: string) {
  const { data } = await supabase.from("friendships").select("requester, addressee, status");
  const rows = (data ?? []) as Friendship[];
  const other = (f: Friendship) => (f.requester === me ? f.addressee : f.requester);
  return {
    friends: rows.filter((f) => f.status === "accepted").map(other),
    incoming: rows.filter((f) => f.status === "pending" && f.addressee === me).map(other),
    outgoing: rows.filter((f) => f.status === "pending" && f.requester === me).map(other),
  };
}

export async function getRelationship(supabase: SupabaseClient, me: string, other: string): Promise<Relationship> {
  if (me === other) return "self";
  const [{ data: block }, { data: f }] = await Promise.all([
    supabase.from("blocks").select("blocked").eq("blocker", me).eq("blocked", other).maybeSingle(),
    supabase
      .from("friendships")
      .select("requester, addressee, status")
      .or(`and(requester.eq.${me},addressee.eq.${other}),and(requester.eq.${other},addressee.eq.${me})`)
      .maybeSingle<Friendship>(),
  ]);
  if (block) return "blocked";
  if (!f) return "none";
  if (f.status === "accepted") return "friends";
  return f.requester === me ? "sent" : "received";
}

/** Display names for a set of user ids. */
export async function getNames(supabase: SupabaseClient, ids: string[]) {
  const unique = [...new Set(ids)];
  if (!unique.length) return new Map<string, string>();
  const { data } = await supabase.from("profiles").select("id, display_name").in("id", unique);
  return new Map((data ?? []).map((p) => [p.id as string, (p.display_name as string | null) ?? "Someone"]));
}

export type ToastInfo = { count: number; mine: boolean; names: string[] };

/** Toast counts, whether `me` toasted, and who toasted, for each check-in id. */
export async function getToasts(supabase: SupabaseClient, me: string, checkinIds: string[]) {
  const result = new Map<string, ToastInfo>();
  if (!checkinIds.length) return result;
  const { data } = await supabase.from("toasts").select("checkin_id, user_id").in("checkin_id", checkinIds);
  const rows = data ?? [];
  const names = await getNames(supabase, rows.map((t) => t.user_id as string));
  for (const t of rows) {
    const info = result.get(t.checkin_id) ?? { count: 0, mine: false, names: [] };
    info.count += 1;
    if (t.user_id === me) info.mine = true;
    else info.names.push(names.get(t.user_id) ?? "Someone");
    result.set(t.checkin_id, info);
  }
  return result;
}
