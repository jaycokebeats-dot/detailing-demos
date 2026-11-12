import type { MetadataRoute } from "next";
import { headers } from "next/headers";
import { getAllBusinesses } from "@/data/businesses";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const headersList = await headers();
  const host = headersList.get("host") || "";
  const cleanHost = host.split(":")[0].toLowerCase();
  const now = new Date();

  // Si acceden desde el dominio de Mc Detail Neuquén (Google Search Console mcdetail.com.ar)
  if (cleanHost === "mcdetail.com.ar" || cleanHost === "www.mcdetail.com.ar") {
    return [
      {
        url: "https://mcdetail.com.ar",
        lastModified: now,
        changeFrequency: "daily",
        priority: 1.0,
      },
    ];
  }

  // Si acceden desde el dominio de Platinum Querétaro (Google Search Console platinumdetallado.com)
  if (cleanHost === "platinumdetallado.com" || cleanHost === "www.platinumdetallado.com") {
    return [
      {
        url: "https://platinumdetallado.com",
        lastModified: now,
        changeFrequency: "daily",
        priority: 1.0,
      },
    ];
  }

  // Catálogo completo para el dominio demostrador global
  const baseUrl = "https://detailing-demos-three.vercel.app";

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

  const businesses = getAllBusinesses();
  const businessRoutes: MetadataRoute.Sitemap = businesses
    .filter((b) => b.slug && !b.slug.includes("demo"))
    .map((b) => ({
      url: `${baseUrl}/d/${b.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }));

  return [...staticRoutes, ...businessRoutes];
}
