import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Landing from "@/components/Landing";
import DemoClientLanding from "@/components/DemoClientLanding";
import { getAllBusinesses, getBusiness } from "@/data/businesses";
import { getBusinessData } from "@/lib/supabase";

const HIDDEN_SLUGS = new Set<string>([
  "ec-detail-estetica-vehicular",
  "auto-detail-camino-real",
]);

// Forzar renderizado en el servidor dinámico para que siempre sirva los datos actualizados de Supabase
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  if (HIDDEN_SLUGS.has(slug)) return {};
  const staticBiz = getBusiness(slug);
  const cloudBiz = await getBusinessData(slug);
  const biz = cloudBiz || staticBiz;
  if (!biz) return {};
  const isSpain = biz.pais === "ES" || biz.template === "spain";
  const isMexico = biz.pais === "MX" || biz.template === "mexico";
  const isPlatinum = slug === "platinum-detallado-automotriz-a-domicilio" || biz.slug === "platinum-detallado-automotriz-a-domicilio";
  const isShalom = slug === "shalom-estetica-automotriz" || slug === "shalom" || biz.slug === "shalom-estetica-automotriz";
  const isMcDetail = slug === "mc-detail-detailing" || slug === "mc-detail" || biz.slug === "mc-detail-detailing";

  let titulo = `${biz.nombre.replace(/[^\p{L}\p{N}\s.,&|/'-]/gu, "").replace(/\s+/g, " ").trim()} — Detailing Profesional en ${biz.ciudad}`;
  let descripcion = `Detailing profesional a mano en ${biz.ciudad}: lavado sin remolinos, corrección de pintura y recubrimiento cerámico. Pedí tu turno por WhatsApp.`;

  if (isPlatinum) {
    titulo = "Platinum Detallado Automotriz a Domicilio | Detailing & Cerámico en Querétaro";
    descripcion = "Servicio exclusivo de detallado automotriz a domicilio en Querétaro: tratamientos cerámicos Gyeon®, pulido de pintura, interiores a vapor y paquetes express. Zibatá, Juriquilla, El Campanario. ¡Cotiza tu auto al instante!";
  } else if (isMcDetail) {
    titulo = "Mc Detail Detailing | Polarizados, PPF y Detailing en Neuquén";
    descripcion = "Estudio profesional de detailing en Neuquén: polarizados nano cerámicos, protección PPF, tratamientos cerámicos 9H y estética vehicular. Turnos por WhatsApp.";
  } else if (isShalom) {
    titulo = "Shalom Estética Automotriz | Detailing Profesional en Toluca";
    descripcion = "Estética y detallado automotriz profesional en Toluca, Edo. Méx.: corrección de pintura, protección cerámica y estética de interiores sin microrrayones ni atajos. ¡Cotiza por WhatsApp!";
  } else if (isSpain) {
    descripcion = `Detailing profesional de coches en ${biz.ciudad}: lavado a mano, corrección de pintura y tratamiento cerámico. Pide tu cita por WhatsApp.`;
  } else if (isMexico) {
    descripcion = `Detailing profesional en ${biz.ciudad}: corrección de pintura, recubrimiento cerámico y estética interior. Cotiza por WhatsApp.`;
  }

  const ogImageUrl = isPlatinum
    ? "https://platinumdetallado.com/og-platinum.jpg"
    : isMcDetail
      ? "https://mcdetail.com.ar/og-mcdetail.jpg"
      : isShalom
        ? "https://detailing-demos-three.vercel.app/logo/shalom-og.jpg"
        : (biz.fotos && biz.fotos.length > 0 && biz.fotos[0])
          ? (biz.fotos[0].startsWith("http") ? biz.fotos[0] : `https://detailing-demos-three.vercel.app${biz.fotos[0].startsWith("/") ? "" : "/"}${biz.fotos[0]}`)
          : "https://detailing-demos-three.vercel.app/og-detailing.jpg";

  const canonicalUrl = isPlatinum
    ? "https://platinumdetallado.com"
    : isMcDetail
      ? "https://mcdetail.com.ar"
      : `https://detailing-demos-three.vercel.app/d/${biz.slug}`;

  const cleanNombre = biz.nombre.replace(/[^\p{L}\p{N}\s.,&|/'-]/gu, "").replace(/\s+/g, " ").trim();
  const brandName = isMcDetail ? "Mc Detail Detailing" : (isPlatinum ? "Platinum Detallado Automotriz" : cleanNombre);

  return {
    metadataBase: new URL(
      isPlatinum
        ? "https://platinumdetallado.com"
        : isMcDetail
          ? "https://mcdetail.com.ar"
          : "https://detailing-demos-three.vercel.app"
    ),
    title: {
      absolute: titulo,
    },
    description: descripcion,
    applicationName: brandName,
    verification: isPlatinum
      ? {
          google: "8KSKdnhVp7_r_zufW5NJuW-O4bCwpQ4t7Gsen_A02VE",
        }
      : isMcDetail
        ? {
            google: "_PneSsBs5qthk7KOsRQyAHCjfsqCLE2nIt3Bm__STbE",
          }
        : undefined,
    alternates: {
      canonical: canonicalUrl,
    },
    keywords: isPlatinum
      ? [
          "detailing queretaro",
          "detallado automotriz a domicilio queretaro",
          "ceramico gyeon queretaro",
          "pulido y encerado de autos queretaro",
          "platinum detallado automotriz",
          "lavado a vapor de interiores queretaro",
          "detailing zibata",
          "detailing juriquilla",
          "detailing el campanario",
          "estetica automotriz a domicilio queretaro",
        ]
      : isMcDetail
        ? [
            "detailing neuquen",
            "polarizados neuquen",
            "ppf neuquen",
            "paint protection film neuquen",
            "tratamiento ceramico neuquen",
            "mc detail detailing",
            "lavado premium neuquen",
            "limpieza de tapizados neuquen",
            "estetica vehicular neuquen",
            "detailing alto valle",
          ]
      : ["detailing", "pulido de autos", "tratamiento ceramico", biz.ciudad],
    icons: isPlatinum
      ? {
          icon: [
            { url: "/favicon-platinum-48.png", sizes: "48x48", type: "image/png" },
            { url: "/favicon-platinum-192.png", sizes: "192x192", type: "image/png" },
            { url: "/favicon-platinum.svg", type: "image/svg+xml" },
          ],
          apple: [
            { url: "/apple-touch-icon-platinum.png", sizes: "180x180", type: "image/png" },
          ],
        }
      : isMcDetail
        ? {
            icon: [
              { url: "/favicon-mcdetail-48.png", sizes: "48x48", type: "image/png" },
              { url: "/favicon-mcdetail-192.png", sizes: "192x192", type: "image/png" },
              { url: "/favicon-mcdetail.svg", type: "image/svg+xml" },
            ],
            apple: [
              { url: "/apple-touch-icon-mcdetail.png", sizes: "180x180", type: "image/png" },
            ],
          }
      : isShalom
        ? {
            icon: [
              { url: "/logo/shalom-logo.png", sizes: "192x192", type: "image/png" },
            ],
            apple: [
              { url: "/logo/shalom-logo.png", sizes: "180x180", type: "image/png" },
            ],
          }
      : biz.logo_url
        ? {
            icon: [{ url: biz.logo_url, type: "image/png" }],
            apple: [{ url: biz.logo_url, type: "image/png" }],
          }
        : undefined,
    openGraph: {
      title: titulo,
      description: descripcion,
      url: canonicalUrl,
      siteName: brandName,
      locale: isSpain ? "es_ES" : isMexico ? "es_MX" : "es_AR",
      type: "website",
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: titulo,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: titulo,
      description: descripcion,
      images: [ogImageUrl],
    },
  };
}

// pixel de apertura: POST simple cross-origin, sin leer respuesta
function pixelScript(slug: string): string {
  const url = `https://demos-site-liart.vercel.app/api/track?s=${encodeURIComponent(slug)}`;
  return `try{fetch(${JSON.stringify(url)},{method:"POST",keepalive:true,mode:"no-cors"}).catch(function(){})}catch(e){}`;
}

export default async function BusinessPage({ params }: Props) {
  const { slug } = await params;
  if (HIDDEN_SLUGS.has(slug)) notFound();
  const staticBiz = getBusiness(slug);
  if (!staticBiz && slug !== "demo" && slug !== "taller-demo") notFound();

  // Obtener los datos personalizados de Supabase en el servidor (elimina el parpadeo en F5)
  const cloudBiz = await getBusinessData(slug);
  const biz = cloudBiz || staticBiz;
  if (!biz) notFound();

  const isPlatinum = slug === "platinum-detallado-automotriz-a-domicilio" || biz.slug === "platinum-detallado-automotriz-a-domicilio";
  const isMcDetail = slug === "mc-detail-detailing" || slug === "mc-detail" || biz.slug === "mc-detail-detailing";

  // Schema.org JSON-LD para posicionamiento SEO local y Google Rich Results
  const canonicalBizUrl = isPlatinum
    ? "https://platinumdetallado.com"
    : isMcDetail
      ? "https://mcdetail.com.ar"
      : `https://detailing-demos-three.vercel.app/d/${biz.slug}`;
  const defaultImage = isPlatinum
    ? "https://platinumdetallado.com/og-platinum.jpg"
    : isMcDetail
      ? "https://mcdetail.com.ar/og-mcdetail.jpg"
      : "https://detailing-demos-three.vercel.app/og-detailing.jpg";
  const primaryImage = (biz.fotos && biz.fotos.length > 0)
    ? (biz.fotos[0].startsWith("http") ? biz.fotos[0] : `${canonicalBizUrl}${biz.fotos[0].startsWith("/") ? "" : "/"}${biz.fotos[0]}`)
    : defaultImage;

  const cleanBizNombre = biz.nombre.replace(/[^\p{L}\p{N}\s.,&|/'-]/gu, "").replace(/\s+/g, " ").trim();
  const brandName = isMcDetail ? "Mc Detail Detailing" : (isPlatinum ? "Platinum Detallado Automotriz" : cleanBizNombre);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "AutoDetailing",
    "@id": `${canonicalBizUrl}/#localbusiness`,
    "name": brandName,
    "image": primaryImage,
    "url": canonicalBizUrl,
    "telephone": biz.telefono || (isPlatinum ? "+52-442-715-1535" : "+54 9 299 413-4806"),
    "priceRange": "$$",
    "description": isPlatinum
      ? "Servicio profesional de detallado automotriz a domicilio en Querétaro: tratamientos cerámicos Gyeon®, pulido de pintura, interiores a vapor y paquetes express."
      : isMcDetail
        ? "Estudio profesional de detailing en Neuquén: polarizados nano cerámicos, protección PPF, tratamientos cerámicos 9H y estética vehicular completa."
        : `Detailing profesional y estética automotriz en ${biz.ciudad}.`,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": biz.direccion || (isMcDetail ? "Gdor. Anaya 614, Barrio La Sirena" : "Servicio a Domicilio"),
      "addressLocality": biz.ciudad || (isMcDetail ? "Neuquén" : "Querétaro"),
      "addressRegion": isPlatinum ? "Querétaro" : (isMcDetail ? "Neuquén" : (biz.ciudad || "")),
      "addressCountry": biz.pais || (isMcDetail ? "AR" : (isPlatinum ? "MX" : "AR")),
    },
    ...(isPlatinum
      ? {
          "geo": {
            "@type": "GeoCoordinates",
            "latitude": 20.5888,
            "longitude": -100.3899,
          },
          "areaServed": [
            { "@type": "City", "name": "Querétaro" },
            { "@type": "AdministrativeArea", "name": "Zibatá" },
            { "@type": "AdministrativeArea", "name": "Zákia" },
            { "@type": "AdministrativeArea", "name": "Juriquilla" },
            { "@type": "AdministrativeArea", "name": "El Campanario" },
            { "@type": "AdministrativeArea", "name": "Milenio III" },
            { "@type": "AdministrativeArea", "name": "El Refugio" },
            { "@type": "AdministrativeArea", "name": "Centro Sur" },
          ],
        }
      : isMcDetail
        ? {
            "geo": {
              "@type": "GeoCoordinates",
              "latitude": -38.9616505,
              "longitude": -68.0842183,
            },
            "areaServed": [
              { "@type": "City", "name": "Neuquén" },
              { "@type": "AdministrativeArea", "name": "Neuquén Capital" },
              { "@type": "AdministrativeArea", "name": "Cipolletti" },
              { "@type": "AdministrativeArea", "name": "Plottier" },
              { "@type": "AdministrativeArea", "name": "Alto Valle" },
            ],
          }
      : {}),
    "openingHoursSpecification": [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        "opens": isMcDetail ? "08:30" : "08:00",
        "closes": isMcDetail ? "19:30" : "19:00",
      },
    ],
  };

  return (
    <>
      <DemoClientLanding initialBiz={biz} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script dangerouslySetInnerHTML={{ __html: pixelScript(biz.slug) }} />
    </>
  );
}
