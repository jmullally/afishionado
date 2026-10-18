import Link from "next/link";

export function PageHeader({ title, back, action }: { title: string; back?: string; action?: React.ReactNode }) {
  return (
    <header className="mb-4 flex items-center gap-2">
      {back && (
        <Link href={back} className="-ml-2 px-2 py-1 text-2xl text-muted" aria-label="Back">
          ‹
        </Link>
      )}
      <h1 className="flex-1 font-display text-3xl font-bold tracking-tight">{title}</h1>
      {action}
    </header>
  );
}
