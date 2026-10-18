import Link from "next/link";
import type { Product } from "@/lib/types";
import { TinMark } from "./Logo";

export function TinRow({ product, href }: { product: Product; href?: string }) {
  return (
    <Link
      href={href ?? `/tins/${product.id}`}
      className="card flex items-center gap-3 p-3 transition active:scale-[0.99] hover:border-sea"
    >
      <TinMark className="h-10 w-10 shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-semibold uppercase tracking-wide text-sea">{product.brand.name}</p>
        <p className="truncate font-semibold">{product.name}</p>
        <p className="truncate text-sm capitalize text-muted">
          {product.species}
          {product.packing ? ` · ${product.packing}` : ""}
          {product.status === "pending" ? " · added by you" : ""}
        </p>
      </div>
      <span className="text-muted" aria-hidden="true">
        ›
      </span>
    </Link>
  );
}
