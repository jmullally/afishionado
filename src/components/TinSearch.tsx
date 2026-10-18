import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PRODUCT_SELECT, SPECIES, type Product } from "@/lib/types";
import { TinRow } from "./TinRow";

/** Search form + results. `basePath` is the page the form submits to; in "checkin" mode results open the check-in form. */
export async function TinSearch({
  q,
  species,
  basePath,
  mode,
}: {
  q: string;
  species: string;
  basePath: string;
  mode: "browse" | "checkin";
}) {
  const supabase = await createClient();
  // Strip characters that have meaning in PostgREST filter strings.
  const term = q.replace(/[%,()*"\\]/g, " ").trim();

  let query = supabase.from("products").select(PRODUCT_SELECT).order("name").limit(80);
  if (species) query = query.eq("species", species);
  if (term) {
    const { data: brands } = await supabase.from("brands").select("id").ilike("name", `%${term}%`);
    const ids = (brands ?? []).map((b) => b.id);
    const filters = [`name.ilike.%${term}%`, `species.ilike.%${term}%`];
    if (ids.length) filters.push(`brand_id.in.(${ids.join(",")})`);
    query = query.or(filters.join(","));
  }
  const { data } = await query;
  const products = ((data ?? []) as Product[]).sort(
    (a, b) => a.brand.name.localeCompare(b.brand.name) || a.name.localeCompare(b.name),
  );

  const chipHref = (s: string) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (s) params.set("species", s);
    const qs = params.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  };
  const linkFor = (p: Product) => (mode === "checkin" ? `/checkin/new?product=${p.id}` : `/tins/${p.id}`);

  return (
    <div className="space-y-4">
      <form action={basePath} className="flex gap-2">
        {species && <input type="hidden" name="species" value={species} />}
        <input
          name="q"
          defaultValue={q}
          type="search"
          placeholder="Search brand, tin or fish…"
          className="field"
          autoComplete="off"
        />
        <button className="btn" type="submit">
          Go
        </button>
      </form>

      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
        <Link href={chipHref("")} className="chip" data-active={!species}>
          All
        </Link>
        {SPECIES.map((s) => (
          <Link key={s} href={chipHref(s)} className="chip" data-active={species === s}>
            {s}
          </Link>
        ))}
      </div>

      <div className="space-y-2">
        {products.map((p) => (
          <TinRow key={p.id} product={p} href={linkFor(p)} />
        ))}
      </div>

      <div className="card p-4 text-center">
        <p className="text-muted">{products.length === 0 ? "No tins match." : "Can't find your tin?"}</p>
        <Link href={`/tins/new${q ? `?name=${encodeURIComponent(q)}` : ""}`} className="btn-ghost mt-3 w-full">
          Add a new tin
        </Link>
      </div>
    </div>
  );
}
