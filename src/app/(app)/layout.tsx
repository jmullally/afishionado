import { Suspense } from "react";
import { BottomNav } from "@/components/BottomNav";

export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <main className="pt-safe mx-auto max-w-md px-4 pb-28 pt-6">{children}</main>
      <Suspense>
        <BottomNav />
      </Suspense>
    </>
  );
}
