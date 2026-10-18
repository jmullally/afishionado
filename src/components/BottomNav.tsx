"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const icons = {
  home: "M3 11l9-7 9 7v9a1 1 0 01-1 1h-5v-6h-6v6H4a1 1 0 01-1-1z",
  tins: "M11 4a7 7 0 015.6 11.2l4.1 4.1-1.4 1.4-4.1-4.1A7 7 0 1111 4zm0 2a5 5 0 100 10 5 5 0 000-10z",
  photos: "M4 6h3l2-2h6l2 2h3a1 1 0 011 1v12a1 1 0 01-1 1H4a1 1 0 01-1-1V7a1 1 0 011-1zm8 3a4 4 0 100 8 4 4 0 000-8z",
  me: "M12 3a4.5 4.5 0 110 9 4.5 4.5 0 010-9zm0 11c4.4 0 8 2.2 8 5v2H4v-2c0-2.8 3.6-5 8-5z",
};

const tabs = [
  { href: "/", label: "Diary", icon: icons.home },
  { href: "/tins", label: "Tins", icon: icons.tins },
  { href: "/photos", label: "Photos", icon: icons.photos },
  { href: "/me", label: "Me", icon: icons.me },
];

export function BottomNav() {
  const pathname = usePathname();
  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  const tab = (t: (typeof tabs)[number]) => (
    <Link
      key={t.href}
      href={t.href}
      className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] font-medium ${
        isActive(t.href) ? "text-sea" : "text-muted"
      }`}
    >
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor" aria-hidden="true">
        <path d={t.icon} />
      </svg>
      {t.label}
    </Link>
  );

  return (
    <nav className="pb-safe fixed inset-x-0 bottom-0 z-20 border-t border-line bg-paper/95 backdrop-blur">
      <div className="mx-auto flex max-w-md items-end px-2">
        {tabs.slice(0, 2).map(tab)}
        <Link
          href="/checkin/new"
          aria-label="Check in a tin"
          className="-mt-5 mx-2 flex h-14 w-14 items-center justify-center rounded-full bg-coral text-3xl text-white shadow-lg shadow-coral/30 active:scale-95"
        >
          +
        </Link>
        {tabs.slice(2).map(tab)}
      </div>
    </nav>
  );
}
