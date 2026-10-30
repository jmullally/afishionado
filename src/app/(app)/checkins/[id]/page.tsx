import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DeleteCheckinButton } from "@/components/DeleteCheckinButton";
import { PageHeader } from "@/components/PageHeader";
import { ReportButton } from "@/components/ReportButton";
import { ShareCardButton } from "@/components/ShareCardButton";
import { SharePhotoButton } from "@/components/SharePhotoButton";
import { Stars } from "@/components/Stars";
import { ToastButton } from "@/components/ToastButton";
import { badgesUnlockedBy } from "@/lib/badges";
import { formatDate } from "@/lib/format";
import { withPhotoUrls } from "@/lib/photos";
import { getNames, getToasts } from "@/lib/social";
import { requireUser } from "@/lib/supabase/server";
import { CHECKIN_SELECT, type Checkin } from "@/lib/types";
import Loading from "../../loading";

async function CheckinPageContent({ params }: Pick<PageProps<"/checkins/[id]">, "params">) {
  const { id } = await params;
  const { supabase, user } = await requireUser();
  // Your own check-ins, or a friend's they've shared (RLS decides).
  const { data } = await supabase.from("checkins").select(CHECKIN_SELECT).eq("id", id).maybeSingle<Checkin>();
  if (!data) notFound();

  const mine = data.user_id === user.id;
  const [[checkin], toasts, names, myCheckins] = await Promise.all([
    withPhotoUrls(supabase, [data]),
    getToasts(supabase, user.id, [data.id]),
    mine ? Promise.resolve(new Map<string, string>()) : getNames(supabase, [data.user_id]),
    mine
      ? supabase.from("checkins").select(CHECKIN_SELECT).eq("user_id", user.id).then((r) => (r.data ?? []) as Checkin[])
      : Promise.resolve([] as Checkin[]),
  ]);
  const toast = toasts.get(checkin.id) ?? { count: 0, mine: false, names: [] };
  const unlocked = mine ? badgesUnlockedBy(checkin, myCheckins) : [];
  const { product } = checkin;
  const shareTitle = `${product.brand.name} ${product.name}`;
  const shareText = `${shareTitle}: ${Number(checkin.rating).toFixed(1)}★${checkin.note ? `\n${checkin.note}` : ""}`;
  const ownerName = names.get(checkin.user_id) ?? "A friend";

  return (
    <>
      <PageHeader
        title=""
        back={mine ? "/" : "/?view=friends"}
        action={
          mine && (
            <Link href={`/checkins/${checkin.id}/edit`} className="text-sm font-semibold text-sea">
              Edit
            </Link>
          )
        }
      />
      {unlocked.length > 0 && (
        <div className="card mb-4 border-gold/50 bg-gold/10 p-4">
          <p className="font-semibold">Badge{unlocked.length > 1 ? "s" : ""} unlocked with this tin!</p>
          <ul className="mt-2 space-y-1">
            {unlocked.map((b) => (
              <li key={b.id} className="text-sm">
                <span aria-hidden="true">{b.icon}</span> <strong>{b.name}</strong> · {b.description}
              </li>
            ))}
          </ul>
        </div>
      )}
      <article className="card overflow-hidden">
        {!mine && (
          <Link href={`/u/${checkin.user_id}`} className="flex items-center gap-2 border-b border-line px-5 py-3 text-sm">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-sea/15 text-xs font-semibold text-sea">
              {ownerName.slice(0, 1).toUpperCase()}
            </span>
            <span className="font-semibold">{ownerName}</span>
          </Link>
        )}
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
          {mine && (
            <p className="text-sm text-muted">
              {checkin.visibility === "friends" ? "👥 Shared with friends" : "🔒 Only you can see this"}
              {toast.count > 0 &&
                ` · 🥂 Toasted by ${[...(toast.mine ? ["you"] : []), ...toast.names].join(", ")}`}
            </p>
          )}
        </div>
      </article>

      <div className="mt-4 space-y-3">
        {mine ? (
          <>
            <ShareCardButton
              card={{
                photoUrl: checkin.photo_url ?? null,
                brand: product.brand.name,
                name: product.name,
                rating: Number(checkin.rating),
                note: checkin.note,
                meta: [formatDate(checkin.tried_on), checkin.location].filter(Boolean).join(" · "),
              }}
              filename={`afishionado-card-${checkin.id.slice(0, 8)}.jpg`}
              title={shareTitle}
              text={shareText}
            />
            {checkin.photo_url && (
              <SharePhotoButton
                url={checkin.photo_url}
                filename={`afishionado-${checkin.id.slice(0, 8)}.jpg`}
                title={shareTitle}
                text={shareText}
              />
            )}
            <Link href={`/checkin/new?product=${product.id}`} className="btn-ghost w-full">
              Check in this tin again
            </Link>
            <DeleteCheckinButton id={checkin.id} />
          </>
        ) : (
          <>
            <ToastButton checkinId={checkin.id} toasted={toast.mine} count={toast.count} />
            <Link href={`/checkin/new?product=${product.id}`} className="btn-ghost w-full">
              Check in this tin
            </Link>
            <ReportButton checkinId={checkin.id} userId={checkin.user_id} />
          </>
        )}
      </div>
    </>
  );
}

// Streams behind a skeleton so tapping between tabs responds instantly.
export default function CheckinPage({ params }: PageProps<"/checkins/[id]">) {
  return (
    <Suspense fallback={<Loading />}>
      <CheckinPageContent params={params} />
    </Suspense>
  );
}
