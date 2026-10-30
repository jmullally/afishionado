import { Suspense } from "react";
import { notFound } from "next/navigation";
import { CheckinForm } from "@/components/CheckinForm";
import { PageHeader } from "@/components/PageHeader";
import { TinRow } from "@/components/TinRow";
import { withPhotoUrls } from "@/lib/photos";
import { requireUser } from "@/lib/supabase/server";
import { CHECKIN_SELECT, type Checkin } from "@/lib/types";
import Loading from "../../../loading";

async function EditCheckinContent({ params }: Pick<PageProps<"/checkins/[id]/edit">, "params">) {
  const { id } = await params;
  const { supabase, user } = await requireUser();
  const { data } = await supabase
    .from("checkins")
    .select(CHECKIN_SELECT)
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle<Checkin>();
  if (!data) notFound();
  const [checkin] = await withPhotoUrls(supabase, [data]);

  return (
    <>
      <PageHeader title="Edit check-in" back={`/checkins/${checkin.id}`} />
      <div className="space-y-5">
        <TinRow product={checkin.product} />
        <CheckinForm productId={checkin.product_id} existing={checkin} />
      </div>
    </>
  );
}

export default function EditCheckinPage({ params }: PageProps<"/checkins/[id]/edit">) {
  return (
    <Suspense fallback={<Loading />}>
      <EditCheckinContent params={params} />
    </Suspense>
  );
}
