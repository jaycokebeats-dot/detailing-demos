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

  // Landing destacada y dominio propio de Platinum Querétaro (Máxima prioridad SEO)
  const platinumRoute: MetadataRoute.Sitemap = [
    {
      url: "https://platinumdetallado.com",
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/d/platinum-detallado-automotriz-a-domicilio`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
  ];

  // Landing destacada y dominio propio de Mc Detail Neuquén
  const mcDetailRoute: MetadataRoute.Sitemap = [
    {
      url: "https://mcdetail.com.ar",
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/d/mc-detail-detailing`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
  ];

  // Catálogo de talleres detalladores
  const businesses = getAllBusinesses();
  const businessRoutes: MetadataRoute.Sitemap = businesses
    .filter((b) => b.slug && b.slug !== "platinum-detallado-automotriz-a-domicilio" && b.slug !== "mc-detail-detailing" && !b.slug.includes("demo"))
    .map((b) => ({
      url: `${baseUrl}/d/${b.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }));

  return [...staticRoutes, ...platinumRoute, ...mcDetailRoute, ...businessRoutes];
}
