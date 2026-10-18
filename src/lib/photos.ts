import type { SupabaseClient } from "@supabase/supabase-js";
import { PHOTO_BUCKET } from "./supabase/config";
import type { Checkin } from "./types";

/** Adds a short-lived signed photo_url to each check-in that has a photo. */
export async function withPhotoUrls(supabase: SupabaseClient, checkins: Checkin[]): Promise<Checkin[]> {
  const paths = checkins.map((c) => c.photo_path).filter((p): p is string => Boolean(p));
  if (paths.length === 0) return checkins;

  const { data } = await supabase.storage.from(PHOTO_BUCKET).createSignedUrls(paths, 60 * 60);
  const urls = new Map((data ?? []).map((d) => [d.path, d.signedUrl]));
  return checkins.map((c) => ({ ...c, photo_url: c.photo_path ? urls.get(c.photo_path) ?? null : null }));
}
