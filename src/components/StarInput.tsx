"use client";

/** Tap the left or right half of a star for half-star ratings. */
export function StarInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex" role="radiogroup" aria-label="Rating">
        {[1, 2, 3, 4, 5].map((star) => {
          const fill = value >= star ? 100 : value >= star - 0.5 ? 50 : 0;
          return (
            <span key={star} className="relative inline-block text-[2.75rem] leading-none select-none">
              <span className="text-line">★</span>
              <span className="absolute inset-0 overflow-hidden text-gold" style={{ width: `${fill}%` }}>
                ★
              </span>
              <button
                type="button"
                className="absolute inset-y-0 left-0 w-1/2"
                aria-label={`${star - 0.5} stars`}
                onClick={() => onChange(star - 0.5)}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 w-1/2"
                aria-label={`${star} stars`}
                onClick={() => onChange(star)}
              />
            </span>
          );
        })}
      </div>
      <span className="min-w-10 font-display text-2xl font-bold text-ink">{value ? value.toFixed(1) : "–"}</span>
    </div>
  );
}
