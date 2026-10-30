"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/supabase/server";
import { photoPaths } from "@/lib/photos";
import { PHOTO_BUCKET } from "@/lib/supabase/config";

export async function toggleWishlist(productId: string, saved: boolean) {
  const { supabase, user } = await requireUser();
  if (saved) {
    await supabase.from("wishlist").delete().eq("user_id", user.id).eq("product_id", productId);
  } else {
    await supabase.from("wishlist").insert({ user_id: user.id, product_id: productId });
  }
  revalidatePath(`/tins/${productId}`);
  revalidatePath("/wishlist");
}

export async function deleteCheckin(id: string) {
  const { supabase } = await requireUser();
  const { data } = await supabase.from("checkins").select("photo_path, thumb_path, product_id").eq("id", id).single();
  if (!data) return;

  await supabase.from("checkins").delete().eq("id", id);
  const paths = photoPaths(data);
  if (paths.length) await supabase.storage.from(PHOTO_BUCKET).remove(paths);

  revalidatePath("/", "layout");
  redirect(`/tins/${data.product_id}`);
}

export type AddTinState = { error?: string };

export async function addTin(_prev: AddTinState, form: FormData): Promise<AddTinState> {
  const { supabase, user } = await requireUser();
  const brandName = String(form.get("brand") ?? "").trim();
  const name = String(form.get("name") ?? "").trim();
  const species = String(form.get("species") ?? "").trim();
  const packing = String(form.get("packing") ?? "").trim() || null;
  const sizeRaw = Number(form.get("size_g"));
  const size_g = Number.isFinite(sizeRaw) && sizeRaw > 0 ? Math.round(sizeRaw) : null;

  if (!brandName || !name || !species) return { error: "Brand, name and species are required." };

  let { data: brand } = await supabase.from("brands").select("id").ilike("name", brandName.replace(/[\\%_]/g, "\\$&")).maybeSingle();
  if (!brand) {
    const inserted = await supabase
      .from("brands")
      .insert({ name: brandName, created_by: user.id })
      .select("id")
      .single();
    if (inserted.error) return { error: inserted.error.message };
    brand = inserted.data;
  }

  const { data: product, error } = await supabase
    .from("products")
    .insert({ brand_id: brand.id, name, species, packing, size_g, created_by: user.id })
    .select("id")
    .single();
  if (error) return { error: error.message };

  revalidatePath("/tins");
  redirect(`/checkin/new?product=${product.id}`);
}

export async function signOut() {
  const { supabase } = await requireUser();
  await supabase.auth.signOut();
  redirect("/login");
}
