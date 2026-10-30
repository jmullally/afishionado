import { Suspense } from "react";
import { notFound } from "next/navigation";
import { linkBarcode } from "@/app/actions";
import { PageHeader } from "@/components/PageHeader";
import { TinRow } from "@/components/TinRow";
import { normalizeBarcode } from "@/lib/barcode";
import { requireUser } from "@/lib/supabase/server";
import { PRODUCT_SELECT, type Product } from "@/lib/types";
import Loading from "../../../loading";

/** Confirms before attaching a scanned barcode to a catalog tin. */
async function LinkContent({ params, searchParams }: PageProps<"/scan/[code]/link">) {
  const [{ code: raw }, sp] = await Promise.all([params, searchParams]);
  const code = normalizeBarcode(decodeURIComponent(raw));
  const productId = typeof sp.product === "string" ? sp.product : "";
  if (!code || !productId) notFound();

  const { supabase } = await requireUser();
  const { data: product } = await supabase.from("products").select(PRODUCT_SELECT).eq("id", productId).maybeSingle<Product>();
  if (!product) notFound();

  return (
    <div className="space-y-4">
      <TinRow product={product} />
      <p className="text-muted">
        Is this the tin with barcode <span className="font-mono text-ink">{code}</span>? Linking it means anyone who
        scans this tin goes straight to it.
      </p>
      <form action={linkBarcode} className="space-y-3">
        <input type="hidden" name="barcode" value={code} />
        <input type="hidden" name="product" value={product.id} />
        <input type="hidden" name="for" value={sp.for === "checkin" ? "checkin" : ""} />
        <button className="btn w-full">Yes, link this barcode</button>
      </form>
    </div>
  );
}

export default function LinkBarcodePage(props: PageProps<"/scan/[code]/link">) {
  return (
    <>
      <PageHeader title="Link barcode" back="/tins" />
      <Suspense fallback={<Loading />}>
        <LinkContent {...props} />
      </Suspense>
    </>
  );
}
