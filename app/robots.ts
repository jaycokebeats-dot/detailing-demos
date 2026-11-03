import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = "https://detailing-demos-three.vercel.app";

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/d/*", "/antes-despues"],
        disallow: ["/admin", "/admin/*", "/api/*", "/checkin", "/presupuesto"],
      },
      {
        userAgent: "Googlebot",
        allow: ["/", "/d/*", "/antes-despues", "/favicon*"],
        disallow: ["/admin", "/admin/*", "/api/*"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
