import type { MetadataRoute } from "next";

// Everything else is behind sign-in, so the sign-in page is the only public page.
export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: "https://afishionado.app/login", changeFrequency: "monthly", priority: 1 }];
}
