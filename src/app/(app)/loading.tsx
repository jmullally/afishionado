export default function Loading() {
  return (
    <div className="space-y-4" aria-busy="true">
      <div className="h-9 w-40 animate-pulse rounded-lg bg-line" />
      <div className="h-28 animate-pulse rounded-2xl bg-line/70" />
      <div className="h-28 animate-pulse rounded-2xl bg-line/50" />
    </div>
  );
}
