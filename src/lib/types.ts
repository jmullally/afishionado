export type Brand = {
  id: string;
  name: string;
  country: string | null;
};

export type Product = {
  id: string;
  brand_id: string;
  name: string;
  species: string;
  packing: string | null;
  size_g: number | null;
  barcode: string | null;
  image_url: string | null;
  status: "approved" | "pending" | "rejected";
  brand: Brand;
};

export type Visibility = "private" | "friends";

export type Profile = {
  id: string;
  display_name: string | null;
  default_visibility: Visibility;
};

export type Checkin = {
  id: string;
  user_id: string;
  product_id: string;
  visibility: Visibility;
  rating: number;
  note: string | null;
  location: string | null;
  photo_path: string | null;
  thumb_path: string | null;
  tried_on: string;
  created_at: string;
  product: Product;
  /** Signed URL for photo_path, filled in server-side. */
  photo_url?: string | null;
  /** Signed URL for thumb_path, falling back to photo_url for older photos without one. */
  thumb_url?: string | null;
};

export const SPECIES = [
  "sardines",
  "mackerel",
  "anchovies",
  "tuna",
  "salmon",
  "trout",
  "herring",
  "mussels",
  "cockles",
  "clams",
  "oysters",
  "octopus",
  "squid",
  "other",
] as const;

export const PACKINGS = [
  "olive oil",
  "sunflower oil",
  "tomato sauce",
  "escabeche",
  "spicy",
  "lemon",
  "smoked",
  "brine",
  "water",
  "ink",
  "other",
] as const;

export const PRODUCT_SELECT = "*, brand:brands(*)";
export const CHECKIN_SELECT = "*, product:products(*, brand:brands(*))";
