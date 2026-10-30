import { ALL_BADGES, type Badge } from "@/lib/badges";

/** Earned badges in full colour; with `showLocked`, the rest greyed out as goals. */
export function BadgeGrid({ earned, showLocked = false }: { earned: Badge[]; showLocked?: boolean }) {
  const have = new Set(earned.map((b) => b.id));
  const badges = showLocked ? ALL_BADGES : earned;
  if (!badges.length) return <p className="text-sm text-muted">No badges yet.</p>;
  return (
    <ul className="grid grid-cols-3 gap-2">
      {badges.map((b) => {
        const got = have.has(b.id);
        return (
          <li
            key={b.id}
            className={`rounded-xl border p-2.5 text-center ${got ? "border-gold/50 bg-gold/10" : "border-line bg-cream opacity-50 grayscale"}`}
            title={b.description}
          >
            <span className="block text-2xl" aria-hidden="true">
              {b.icon}
            </span>
            <span className="mt-1 block text-xs font-semibold leading-tight">{b.name}</span>
            <span className="mt-0.5 block text-[11px] leading-tight text-muted">{b.description}</span>
          </li>
        );
      })}
    </ul>
  );
}
