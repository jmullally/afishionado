"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/supabase/server";
import type { Visibility } from "@/lib/types";

const refresh = () => revalidatePath("/", "layout");

/** Sends a friend request, or accepts theirs if they already asked. */
export async function addFriend(otherId: string) {
  const { supabase, user } = await requireUser();
  if (otherId === user.id) return;
  const { data: theirs } = await supabase
    .from("friendships")
    .select("status")
    .eq("requester", otherId)
    .eq("addressee", user.id)
    .maybeSingle();
  if (theirs) {
    await supabase
      .from("friendships")
      .update({ status: "accepted", accepted_at: new Date().toISOString() })
      .eq("requester", otherId)
      .eq("addressee", user.id);
  } else {
    await supabase.from("friendships").insert({ requester: user.id, addressee: otherId });
  }
  refresh();
}

export type FindFriendState = { error?: string; sent?: string };

export async function addFriendByEmail(_prev: FindFriendState, form: FormData): Promise<FindFriendState> {
  const { supabase, user } = await requireUser();
  const email = String(form.get("email") ?? "").trim();
  if (!email.includes("@")) return { error: "Enter their email address." };
  const { data } = await supabase.rpc("find_profile_by_email", { p_email: email }).maybeSingle<{ id: string; display_name: string | null }>();
  if (!data) return { error: "No one with that email is on afishionado yet. Send them your invite link instead." };
  if (data.id === user.id) return { error: "That's you!" };
  await addFriend(data.id);
  return { sent: data.display_name ?? email };
}

/** Declines, cancels or unfriends: removes the friendship either way round. */
export async function removeFriend(otherId: string) {
  const { supabase, user } = await requireUser();
  await supabase
    .from("friendships")
    .delete()
    .or(`and(requester.eq.${user.id},addressee.eq.${otherId}),and(requester.eq.${otherId},addressee.eq.${user.id})`);
  refresh();
}

export async function blockUser(otherId: string) {
  const { supabase, user } = await requireUser();
  if (otherId !== user.id) await supabase.from("blocks").insert({ blocked: otherId });
  refresh();
}

export async function unblockUser(otherId: string) {
  const { supabase } = await requireUser();
  await supabase.from("blocks").delete().eq("blocked", otherId);
  refresh();
}

export async function toggleToast(checkinId: string, toasted: boolean) {
  const { supabase, user } = await requireUser();
  if (toasted) await supabase.from("toasts").delete().eq("checkin_id", checkinId).eq("user_id", user.id);
  else await supabase.from("toasts").insert({ checkin_id: checkinId });
  refresh();
}

export async function reportCheckin(checkinId: string, reportedUser: string, reason: string) {
  const { supabase } = await requireUser();
  await supabase.from("reports").insert({ checkin_id: checkinId, reported_user: reportedUser, reason: reason.slice(0, 500) || null });
}

export async function setDefaultVisibility(visibility: Visibility) {
  const { supabase, user } = await requireUser();
  await supabase.from("profiles").update({ default_visibility: visibility }).eq("id", user.id);
  refresh();
}

/** Shares every private check-in with friends in one go (for diaries kept before friends existed). */
export async function shareAllCheckins() {
  const { supabase, user } = await requireUser();
  await supabase.from("checkins").update({ visibility: "friends" }).eq("user_id", user.id).eq("visibility", "private");
  refresh();
}

export async function updateDisplayName(form: FormData) {
  const { supabase, user } = await requireUser();
  const name = String(form.get("display_name") ?? "").trim().slice(0, 40);
  if (name) await supabase.from("profiles").update({ display_name: name }).eq("id", user.id);
  refresh();
}
