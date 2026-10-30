import type { SupabaseClient } from "@supabase/supabase-js";
import { PHOTO_BUCKET } from "./supabase/config";
import type { Checkin } from "./types";

/** Adds short-lived signed photo_url and thumb_url to each check-in that has a photo. */
export async function withPhotoUrls(supabase: SupabaseClient, checkins: Checkin[]): Promise<Checkin[]> {
  const paths = checkins.flatMap((c) => [c.photo_path, c.thumb_path]).filter((p): p is string => Boolean(p));
  if (paths.length === 0) return checkins;

  const { data } = await supabase.storage.from(PHOTO_BUCKET).createSignedUrls(paths, 60 * 60);
  const urls = new Map((data ?? []).map((d) => [d.path, d.signedUrl]));
  return checkins.map((c) => {
    const photo_url = c.photo_path ? urls.get(c.photo_path) ?? null : null;
    const thumb_url = (c.thumb_path ? urls.get(c.thumb_path) : null) ?? photo_url;
    return { ...c, photo_url, thumb_url };
  });
}

/** Storage paths to delete along with a check-in's photo. */
export function photoPaths(c: Pick<Checkin, "photo_path" | "thumb_path">): string[] {
  return [c.photo_path, c.thumb_path].filter((p): p is string => Boolean(p));
}
