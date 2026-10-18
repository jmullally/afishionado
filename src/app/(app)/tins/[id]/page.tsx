import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckinCard } from "@/components/CheckinCard";
import { TinMark } from "@/components/Logo";
import { PageHeader } from "@/components/PageHeader";
import { Stars } from "@/components/Stars";
import { WishlistButton } from "@/components/WishlistButton";
import { withPhotoUrls } from "@/lib/photos";
import { requireUser } from "@/lib/supabase/server";
import { CHECKIN_SELECT, PRODUCT_SELECT, type Checkin, type Product } from "@/lib/types";

export default async function TinPage({ params }: PageProps<"/tins/[id]">) {
  const { id } = await params;
  const { supabase, user } = await requireUser();

  const [{ data: product }, { data: stats }, { data: mine }, { data: saved }] = await Promise.all([
    supabase.from("products").select(PRODUCT_SELECT).eq("id", id).maybeSingle<Product>(),
    supabase.rpc("product_stats", { p_product_id: id }).maybeSingle<{ avg_rating: number | null; checkin_count: number }>(),
    supabase.from("checkins").select(CHECKIN_SELECT).eq("product_id", id).order("tried_on", { ascending: false }),
    supabase.from("wishlist").select("product_id").eq("user_id", user.id).eq("product_id", id).maybeSingle(),
  ]);
  if (!product) notFound();

  const checkins = await withPhotoUrls(supabase, (mine ?? []) as Checkin[]);
  const myBest = checkins.length ? Math.max(...checkins.map((c) => Number(c.rating))) : null;

  return (
    <>
      <PageHeader title="" back="/tins" />
      <section className="card mb-4 space-y-4 p-5">
        <div className="flex items-start gap-4">
          <TinMark className="h-16 w-16 shrink-0" />
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-sea">
              {product.brand.name}
              {product.brand.country ? ` · ${product.brand.country}` : ""}
            </p>
            <h1 className="font-display text-2xl font-bold leading-tight">{product.name}</h1>
            <p className="text-sm capitalize text-muted">
              {product.species}
              {product.packing ? ` · ${product.packing}` : ""}
              {product.size_g ? ` · ${product.size_g} g` : ""}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-center">
          <div className="rounded-xl bg-cream p-3">
            <p className="text-xs text-muted">Everyone</p>
            {stats?.checkin_count ? (
              <>
                <p className="font-display text-xl font-bold">{Number(stats.avg_rating).toFixed(1)}</p>
                <p className="text-xs text-muted">{stats.checkin_count} check-ins</p>
              </>
            ) : (
              <p className="py-2 text-sm text-muted">No ratings yet</p>
            )}
          </div>
          <div className="rounded-xl bg-cream p-3">
            <p className="text-xs text-muted">You</p>
            {myBest !== null ? (
              <>
                <Stars rating={myBest} />
                <p className="text-xs text-muted">{checkins.length}× tried</p>
              </>
            ) : (
              <p className="py-2 text-sm text-muted">Not tried yet</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Link href={`/checkin/new?product=${product.id}`} className="btn">
            Check in
          </Link>
          <WishlistButton productId={product.id} saved={Boolean(saved)} />
        </div>
      </section>

      {checkins.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">Your check-ins</h2>
          {checkins.map((c) => (
            <CheckinCard key={c.id} checkin={c} />
          ))}
        </section>
      )}
    </>
  );
}
