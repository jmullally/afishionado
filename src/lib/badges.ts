import type { Checkin } from "./types";

export type Badge = { id: string; icon: string; name: string; description: string };

type Rule = Badge & { earned: (c: Checkin[]) => boolean };

const count = (c: Checkin[], pred: (x: Checkin) => boolean) => c.filter(pred).length;
const distinct = (c: Checkin[], key: (x: Checkin) => string | null | undefined) =>
  new Set(c.map(key).filter(Boolean)).size;
const species = (s: string) => (x: Checkin) => x.product.species === s;

/** Badges are worked out from a diary's check-ins each time, so nothing extra is stored. */
const RULES: Rule[] = [
  { id: "first-tin", icon: "🥫", name: "First Tin", description: "Logged your first check-in", earned: (c) => c.length >= 1 },
  { id: "regular", icon: "🐟", name: "Regular", description: "10 check-ins", earned: (c) => c.length >= 10 },
  { id: "devotee", icon: "🎣", name: "Devotee", description: "25 check-ins", earned: (c) => c.length >= 25 },
  { id: "afishionado", icon: "🏆", name: "True Afishionado", description: "50 check-ins", earned: (c) => c.length >= 50 },
  { id: "centurion", icon: "💯", name: "Centurion", description: "100 check-ins", earned: (c) => c.length >= 100 },
  { id: "explorer", icon: "🧭", name: "Explorer", description: "10 different tins", earned: (c) => distinct(c, (x) => x.product_id) >= 10 },
  { id: "collector", icon: "🗄️", name: "Collector", description: "25 different tins", earned: (c) => distinct(c, (x) => x.product_id) >= 25 },
  { id: "school", icon: "🐠", name: "School of Fish", description: "5 different kinds of fish", earned: (c) => distinct(c, (x) => x.product.species) >= 5 },
  { id: "sardine", icon: "🐟", name: "Sardine Squad", description: "5 sardine check-ins", earned: (c) => count(c, species("sardines")) >= 5 },
  { id: "mackerel", icon: "🌊", name: "Holy Mackerel", description: "5 mackerel check-ins", earned: (c) => count(c, species("mackerel")) >= 5 },
  { id: "anchovy", icon: "🧂", name: "Anchovy Aficionado", description: "5 anchovy check-ins", earned: (c) => count(c, species("anchovies")) >= 5 },
  {
    id: "shellfish",
    icon: "🦪",
    name: "Shell Game",
    description: "Tried mussels, clams, cockles or oysters",
    earned: (c) => c.some((x) => ["mussels", "clams", "cockles", "oysters"].includes(x.product.species)),
  },
  {
    id: "tentacles",
    icon: "🐙",
    name: "Eight Arms",
    description: "Tried octopus or squid",
    earned: (c) => c.some((x) => ["octopus", "squid"].includes(x.product.species)),
  },
  { id: "ink", icon: "🖋️", name: "Ink Blot", description: "Tried something in squid ink", earned: (c) => c.some((x) => x.product.packing === "ink") },
  { id: "spicy", icon: "🌶️", name: "Feeling Hot", description: "3 spicy tins", earned: (c) => count(c, (x) => x.product.packing === "spicy") >= 3 },
  { id: "smoked", icon: "🔥", name: "Smoke Signals", description: "3 smoked tins", earned: (c) => count(c, (x) => x.product.packing === "smoked") >= 3 },
  {
    id: "passport",
    icon: "🌍",
    name: "Passport",
    description: "Tins from 3 countries",
    earned: (c) => distinct(c, (x) => x.product.brand.country) >= 3,
  },
  {
    id: "globetrotter",
    icon: "✈️",
    name: "Globetrotter",
    description: "Tins from 5 countries",
    earned: (c) => distinct(c, (x) => x.product.brand.country) >= 5,
  },
  { id: "brands", icon: "🏷️", name: "Brand Hopper", description: "10 different brands", earned: (c) => distinct(c, (x) => x.product.brand.id) >= 10 },
  { id: "photographer", icon: "📸", name: "Food Photographer", description: "10 check-ins with photos", earned: (c) => count(c, (x) => Boolean(x.photo_path)) >= 10 },
  { id: "perfect", icon: "⭐", name: "Perfect Tin", description: "Gave a tin 5 stars", earned: (c) => c.some((x) => Number(x.rating) === 5) },
  { id: "critic", icon: "🧐", name: "Tough Critic", description: "Gave a tin 1 star or less", earned: (c) => c.some((x) => Number(x.rating) <= 1) },
  {
    id: "loyal",
    icon: "🔁",
    name: "Old Faithful",
    description: "Checked in the same tin 3 times",
    earned: (c) => {
      const byTin = new Map<string, number>();
      for (const x of c) byTin.set(x.product_id, (byTin.get(x.product_id) ?? 0) + 1);
      return [...byTin.values()].some((n) => n >= 3);
    },
  },
];

const toBadge = ({ id, icon, name, description }: Rule): Badge => ({ id, icon, name, description });

export const ALL_BADGES: Badge[] = RULES.map(toBadge);

export function earnedBadges(checkins: Checkin[]): Badge[] {
  return RULES.filter((r) => r.earned(checkins)).map(toBadge);
}

/** Badges that `checkin` unlocked: earned with it included, but not from the check-ins before it. */
export function badgesUnlockedBy(checkin: Checkin, all: Checkin[]): Badge[] {
  const before = all.filter((c) => c.id !== checkin.id && c.created_at < checkin.created_at);
  const had = new Set(earnedBadges(before).map((b) => b.id));
  return earnedBadges([...before, checkin]).filter((b) => !had.has(b.id));
}
