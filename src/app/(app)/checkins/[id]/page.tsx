import Link from "next/link";
import { notFound } from "next/navigation";
import { DeleteCheckinButton } from "@/components/DeleteCheckinButton";
import { PageHeader } from "@/components/PageHeader";
import { SharePhotoButton } from "@/components/SharePhotoButton";
import { Stars } from "@/components/Stars";
import { formatDate } from "@/lib/format";
import { withPhotoUrls } from "@/lib/photos";
import { requireUser } from "@/lib/supabase/server";
import { CHECKIN_SELECT, type Checkin } from "@/lib/types";

export default async function CheckinPage({ params }: PageProps<"/checkins/[id]">) {
  const { id } = await params;
  const { supabase } = await requireUser();
  const { data } = await supabase.from("checkins").select(CHECKIN_SELECT).eq("id", id).maybeSingle<Checkin>();
  if (!data) notFound();

  const [checkin] = await withPhotoUrls(supabase, [data]);
  const { product } = checkin;
  const shareTitle = `${product.brand.name} ${product.name}`;
  const shareText = `${shareTitle}: ${Number(checkin.rating).toFixed(1)}★${checkin.note ? `\n${checkin.note}` : ""}`;

  return (
    <>
      <PageHeader title="" back="/" />
      <article className="card overflow-hidden">
        {checkin.photo_url && (
          // eslint-disable-next-line @next/next/no-img-element -- signed Supabase URL
          <img src={checkin.photo_url} alt={shareTitle} className="w-full object-cover" />
        )}
        <div className="space-y-3 p-5">
          <Link href={`/tins/${product.id}`} className="block">
            <p className="text-xs font-semibold uppercase tracking-wide text-sea">{product.brand.name}</p>
            <h1 className="font-display text-2xl font-bold leading-tight">{product.name}</h1>
          </Link>
          <div className="flex items-center gap-3">
            <Stars rating={Number(checkin.rating)} size="text-2xl" />
            <span className="font-display text-xl font-bold">{Number(checkin.rating).toFixed(1)}</span>
          </div>
          {checkin.note && <p className="whitespace-pre-wrap text-ink/90">{checkin.note}</p>}
          <p className="text-sm text-muted">
            {formatDate(checkin.tried_on)}
            {checkin.location ? ` · 📍 ${checkin.location}` : ""}
          </p>
        </div>
      </article>

      <div className="mt-4 space-y-3">
        {checkin.photo_url && (
          <SharePhotoButton url={checkin.photo_url} filename={`afishionado-${checkin.id.slice(0, 8)}.jpg`} title={shareTitle} text={shareText} />
        )}
        <Link href={`/checkin/new?product=${product.id}`} className="btn-ghost w-full">
          Check in this tin again
        </Link>
        <DeleteCheckinButton id={checkin.id} />
      </div>
    </>
  );
}
