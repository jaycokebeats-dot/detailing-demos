import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
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
    sitemap: [
      "https://mcdetail.com.ar/sitemap.xml",
      "https://platinumdetallado.com/sitemap.xml",
      "https://detailing-demos-three.vercel.app/sitemap.xml",
    ],
  };
}
