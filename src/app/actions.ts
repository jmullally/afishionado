"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/supabase/server";
import { normalizeBarcode } from "@/lib/barcode";
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
  const { supabase, user } = await requireUser();
  const { data } = await supabase
    .from("checkins")
    .select("photo_path, thumb_path, product_id")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();
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
  const barcode = normalizeBarcode(String(form.get("barcode") ?? ""));

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
    .insert({ brand_id: brand.id, name, species, packing, size_g, barcode, created_by: user.id })
    .select("id")
    .single();
  if (error) {
    if (error.code === "23505") return { error: "Another tin in the catalog already has this barcode." };
    return { error: error.message };
  }

  revalidatePath("/tins");
  redirect(`/checkin/new?product=${product.id}`);
}

/** Attaches a scanned barcode to a catalog tin, then continues to it (or its check-in form). */
export async function linkBarcode(form: FormData) {
  const { supabase } = await requireUser();
  const barcode = normalizeBarcode(String(form.get("barcode") ?? ""));
  const productId = String(form.get("product") ?? "");
  if (barcode && productId) {
    await supabase.rpc("set_product_barcode", { p_product_id: productId, p_barcode: barcode });
  }
  revalidatePath("/tins");
  redirect(form.get("for") === "checkin" ? `/checkin/new?product=${productId}` : `/tins/${productId}`);
}

export async function signOut() {
  const { supabase } = await requireUser();
  await supabase.auth.signOut();
  redirect("/login");
}
