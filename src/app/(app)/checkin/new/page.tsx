import { Suspense } from "react";
import { CheckinForm } from "@/components/CheckinForm";
import { PageHeader } from "@/components/PageHeader";
import { TinSearch } from "@/components/TinSearch";
import { TinRow } from "@/components/TinRow";
import { requireUser } from "@/lib/supabase/server";
import { PRODUCT_SELECT, type Product } from "@/lib/types";
import Loading from "../../loading";

async function CheckinStep({ searchParams }: Pick<PageProps<"/checkin/new">, "searchParams">) {
  const sp = await searchParams;
  const productId = typeof sp.product === "string" ? sp.product : "";

  if (!productId) {
    return (
      <>
        <PageHeader title="Which tin?" />
        <TinSearch
          q={typeof sp.q === "string" ? sp.q : ""}
          species={typeof sp.species === "string" ? sp.species : ""}
          basePath="/checkin/new"
          mode="checkin"
        />
      </>
    );
  }

  const { supabase } = await requireUser();
  const { data: product } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("id", productId)
    .maybeSingle<Product>();

  return (
    <>
      <PageHeader title="Check in" back={product ? `/tins/${product.id}` : "/checkin/new"} />
      {product ? (
        <div className="space-y-5">
          <TinRow product={product} href="/checkin/new" />
          <CheckinForm productId={product.id} />
        </div>
      ) : (
        <p className="text-muted">That tin couldn&apos;t be found.</p>
      )}
    </>
  );
}

export default function NewCheckinPage({ searchParams }: PageProps<"/checkin/new">) {
  return (
    <Suspense fallback={<Loading />}>
      <CheckinStep searchParams={searchParams} />
    </Suspense>
  );
}
