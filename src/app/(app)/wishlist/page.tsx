import { Suspense } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { TinRow } from "@/components/TinRow";
import { requireUser } from "@/lib/supabase/server";
import type { Product } from "@/lib/types";
import Loading from "../loading";

async function WishlistPageContent() {
  const { supabase, user } = await requireUser();
  const { data } = await supabase
    .from("wishlist")
    .select("created_at, product:products(*, brand:brands(*))")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });
  const products = (data ?? []).map((w) => w.product as unknown as Product).filter(Boolean);

  return (
    <>
      <PageHeader title="Want to try" back="/me" />
      {products.length === 0 ? (
        <div className="card space-y-3 p-6 text-center text-muted">
          <p>Tap ☆ Want to try on any tin to save it here for your next shop.</p>
          <Link href="/tins" className="btn-ghost w-full">
            Browse tins
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {products.map((p) => (
            <TinRow key={p.id} product={p} />
          ))}
        </div>
      )}
    </>
  );
}

// Streams behind a skeleton so tapping between tabs responds instantly.
export default function WishlistPage() {
  return (
    <Suspense fallback={<Loading />}>
      <WishlistPageContent />
    </Suspense>
  );
}
