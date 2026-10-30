import Link from "next/link";
import type { Checkin } from "@/lib/types";
import { Stars } from "./Stars";
import { formatDate } from "@/lib/format";

export function CheckinCard({ checkin }: { checkin: Checkin }) {
  const { product } = checkin;
  return (
    <Link href={`/checkins/${checkin.id}`} className="card block overflow-hidden transition hover:border-sea">
      {checkin.photo_url && (
        // eslint-disable-next-line @next/next/no-img-element -- signed Supabase URLs
        <img src={checkin.thumb_url ?? undefined} alt="" className="aspect-[4/3] w-full object-cover" loading="lazy" />
      )}
      <div className="space-y-1.5 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold uppercase tracking-wide text-sea">{product.brand.name}</p>
            <p className="font-semibold leading-snug">{product.name}</p>
          </div>
          <span className="shrink-0 text-xs text-muted">{formatDate(checkin.tried_on)}</span>
        </div>
        <Stars rating={Number(checkin.rating)} />
        {checkin.note && <p className="line-clamp-3 text-sm text-ink/80">{checkin.note}</p>}
        {checkin.location && <p className="text-xs text-muted">📍 {checkin.location}</p>}
      </div>
    </Link>
  );
}
