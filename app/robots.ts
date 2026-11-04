import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = "https://platinumdetallado.com";

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
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
