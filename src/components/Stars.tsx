export function Stars({ rating, size = "text-base" }: { rating: number; size?: string }) {
  const pct = Math.max(0, Math.min(100, (rating / 5) * 100));
  return (
    <span className={`relative inline-block leading-none ${size}`} aria-label={`${rating} out of 5`}>
      <span className="text-line">★★★★★</span>
      <span className="absolute inset-0 overflow-hidden text-gold" style={{ width: `${pct}%` }} aria-hidden="true">
        ★★★★★
      </span>
    </span>
  );
}
