import type { MetadataRoute } from "next";
import { getAllBusinesses } from "@/data/businesses";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://detailing-demos-three.vercel.app";
  const now = new Date();

  // Páginas estáticas principales
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/antes-despues`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];

  // Landing destacada de Platinum Querétaro (Máxima prioridad SEO)
  const platinumRoute: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/d/platinum-detallado-automotriz-a-domicilio`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
    },
  ];

  // Catálogo de talleres detalladores
  const businesses = getAllBusinesses();
  const businessRoutes: MetadataRoute.Sitemap = businesses
    .filter((b) => b.slug && b.slug !== "platinum-detallado-automotriz-a-domicilio" && !b.slug.includes("demo"))
    .map((b) => ({
      url: `${baseUrl}/d/${b.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }));

  return [...staticRoutes, ...platinumRoute, ...businessRoutes];
}
