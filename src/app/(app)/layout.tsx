import { Suspense } from "react";
import { BottomNav } from "@/components/BottomNav";

function Loading() {
  return (
    <div className="space-y-4" aria-busy="true">
      <div className="h-9 w-40 animate-pulse rounded-lg bg-line" />
      <div className="h-28 animate-pulse rounded-2xl bg-line/70" />
      <div className="h-28 animate-pulse rounded-2xl bg-line/50" />
    </div>
  );
}

export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <main className="pt-safe mx-auto max-w-md px-4 pb-28 pt-6">
        <Suspense fallback={<Loading />}>{children}</Suspense>
      </main>
      <Suspense>
        <BottomNav />
      </Suspense>
    </>
  );
}
