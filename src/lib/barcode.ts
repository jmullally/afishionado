/** Digits only, or null if it can't be a retail barcode (EAN-8 up to GTIN-14). */
export function normalizeBarcode(raw: string): string | null {
  const digits = raw.replace(/\D/g, "");
  return digits.length >= 8 && digits.length <= 14 ? digits : null;
}

/** The same product can be printed as UPC-A (12 digits) or EAN-13 with a leading 0. */
export function barcodeVariants(code: string): string[] {
  const variants = new Set([code]);
  if (code.length === 12) variants.add(`0${code}`);
  if (code.length === 13 && code.startsWith("0")) variants.add(code.slice(1));
  return [...variants];
}

export type OffProduct = { name: string | null; brand: string | null; sizeG: number | null };

/** Looks a barcode up in Open Food Facts (a free, open product database) to prefill a new tin. */
export async function lookupOpenFoodFacts(code: string): Promise<OffProduct | null> {
  try {
    const res = await fetch(
      `https://world.openfoodfacts.org/api/v2/product/${code}.json?fields=product_name,product_name_en,brands,quantity`,
      {
        headers: { "User-Agent": "afishionado/1.0 (https://afishionado.app; hello@afishionado.app)" },
        signal: AbortSignal.timeout(4000),
      },
    );
    if (!res.ok) return null;
    const json = (await res.json()) as {
      status?: number;
      product?: { product_name?: string; product_name_en?: string; brands?: string; quantity?: string };
    };
    if (json.status !== 1 || !json.product) return null;
    const p = json.product;
    const grams = p.quantity?.match(/(\d+(?:[.,]\d+)?)\s*g\b/i)?.[1];
    return {
      name: (p.product_name_en || p.product_name)?.trim() || null,
      brand: p.brands?.split(",")[0]?.trim() || null,
      sizeG: grams ? Math.round(Number(grams.replace(",", "."))) : null,
    };
  } catch {
    return null;
  }
}
