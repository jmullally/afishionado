import Link from "next/link";
import type { Checkin } from "@/lib/types";
import { Stars } from "./Stars";
import { formatDate } from "@/lib/format";

/** A check-in in a list. `owner` is shown for friends' check-ins; `toasts` adds a cheers count. */
export function CheckinCard({ checkin, owner, toasts = 0 }: { checkin: Checkin; owner?: string; toasts?: number }) {
  const { product } = checkin;
  return (
    <Link href={`/checkins/${checkin.id}`} className="card block overflow-hidden transition hover:border-sea">
      {owner && (
        <p className="flex items-center gap-2 border-b border-line px-4 py-2.5 text-sm">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-sea/15 text-xs font-semibold text-sea">
            {owner.slice(0, 1).toUpperCase()}
          </span>
          <span className="font-semibold">{owner}</span>
        </p>
      )}
      {checkin.thumb_url && (
        // eslint-disable-next-line @next/next/no-img-element -- signed Supabase URLs
        <img src={checkin.thumb_url} alt="" className="aspect-[4/3] w-full object-cover" loading="lazy" />
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
        <div className="flex items-center justify-between gap-3 text-xs text-muted">
          <span>{checkin.location ? `📍 ${checkin.location}` : ""}</span>
          <span>
            {toasts > 0 && `🥂 ${toasts}`}
            {!owner && checkin.visibility === "private" && " 🔒"}
          </span>
        </div>
      </div>
    </Link>
  );
}
