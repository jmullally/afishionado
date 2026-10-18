/** A sardine tin, seen from above. */
export function TinMark({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <rect x="4" y="12" width="56" height="40" rx="14" fill="#1c6e72" />
      <rect x="9" y="17" width="46" height="30" rx="10" fill="#e3a52a" />
      <path d="M17 32c6-7 17-8 25-3l6-4v14l-6-4c-8 5-19 4-25-3z" fill="#13263a" />
      <circle cx="22.5" cy="31" r="1.6" fill="#e3a52a" />
      <circle cx="49" cy="22" r="3" fill="none" stroke="#13263a" strokeWidth="2" />
    </svg>
  );
}

export function Wordmark() {
  return (
    <span className="inline-flex items-center gap-2">
      <TinMark className="h-8 w-8" />
      <span className="font-display text-2xl font-bold tracking-tight text-ink">
        a<span className="text-sea">fish</span>ionado
      </span>
    </span>
  );
}
