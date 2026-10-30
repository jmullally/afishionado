import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import { TinSearch } from "@/components/TinSearch";
import { barcodeVariants, lookupOpenFoodFacts, normalizeBarcode } from "@/lib/barcode";
import { requireUser } from "@/lib/supabase/server";
import Loading from "../../loading";

/** Where a scanned barcode lands: straight to the tin if we know it, otherwise add or link it. */
async function ScanResult({ params, searchParams }: PageProps<"/scan/[code]">) {
  const [{ code: raw }, sp] = await Promise.all([params, searchParams]);
  const forCheckin = sp.for === "checkin";
  const code = normalizeBarcode(decodeURIComponent(raw));
  if (!code) {
    return (
      <div className="card space-y-3 p-6 text-center">
        <p>That doesn&apos;t look like a product barcode.</p>
        <Link href={forCheckin ? "/checkin/new" : "/tins"} className="btn-ghost w-full">
          Back to search
        </Link>
      </div>
    );
  }

  const { supabase } = await requireUser();
  const { data: known } = await supabase.from("products").select("id").in("barcode", barcodeVariants(code)).limit(1).maybeSingle();
  if (known) redirect(forCheckin ? `/checkin/new?product=${known.id}` : `/tins/${known.id}`);

  const off = await lookupOpenFoodFacts(code);
  const addParams = new URLSearchParams({ barcode: code });
  if (off?.name) addParams.set("name", off.name);
  if (off?.brand) addParams.set("brand", off.brand);
  if (off?.sizeG) addParams.set("size_g", String(off.sizeG));

  const q = typeof sp.q === "string" ? sp.q : (off?.brand ?? "");

  return (
    <div className="space-y-5">
      <div className="card space-y-3 p-5">
        <p className="text-sm text-muted">
          Barcode <span className="font-mono text-ink">{code}</span> isn&apos;t in the catalog yet.
        </p>
        {off?.name && (
          <p>
            It looks like{" "}
            <strong>
              {off.brand ? `${off.brand} ` : ""}
              {off.name}
            </strong>
            .
          </p>
        )}
        <Link href={`/tins/new?${addParams}`} className="btn w-full">
          Add it as a new tin
        </Link>
      </div>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">Or is it one of these?</h2>
        <p className="-mt-1 text-sm text-muted">Pick the tin and we&apos;ll remember its barcode for next time.</p>
        <TinSearch q={q} species="" basePath={`/scan/${code}`} mode={forCheckin ? "checkin" : "browse"} barcode={code} />
      </section>
    </div>
  );
}

export default function ScanPage(props: PageProps<"/scan/[code]">) {
  return (
    <>
      <PageHeader title="Scanned tin" back="/tins" />
      <Suspense fallback={<Loading />}>
        <ScanResult {...props} />
      </Suspense>
    </>
  );
}
