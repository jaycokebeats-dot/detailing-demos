import type { MetadataRoute } from "next";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const headersList = await headers();
  const host = headersList.get("host") || "";
  const cleanHost = host.split(":")[0].toLowerCase();

  let sitemapUrl = "https://detailing-demos-three.vercel.app/sitemap.xml";
  if (cleanHost === "mcdetail.com.ar" || cleanHost === "www.mcdetail.com.ar") {
    sitemapUrl = "https://mcdetail.com.ar/sitemap.xml";
  } else if (cleanHost === "platinumdetallado.com" || cleanHost === "www.platinumdetallado.com") {
    sitemapUrl = "https://platinumdetallado.com/sitemap.xml";
  }

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/d/*", "/antes-despues", "/favicon*"],
        disallow: ["/admin", "/admin/*", "/api/*", "/checkin", "/presupuesto"],
      },
      {
        userAgent: "Googlebot",
        allow: ["/", "/d/*", "/antes-despues", "/favicon*"],
        disallow: ["/admin", "/admin/*", "/api/*"],
      },
      {
        userAgent: "Googlebot-Image",
        allow: ["/", "/favicon*", "/favicon.ico", "/*.png", "/*.svg"],
      },
    ],
    sitemap: sitemapUrl,
  };
}
