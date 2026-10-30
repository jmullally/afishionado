import type { MetadataRoute } from "next";

// Everything else is behind sign-in. "/" shows the landing page to signed-out visitors.
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: "https://afishionado.app/", changeFrequency: "monthly", priority: 1 },
    { url: "https://afishionado.app/login", changeFrequency: "yearly", priority: 0.5 },
  ];
}
