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
  const titulo = `${biz.nombre} — Detailing Profesional en ${biz.ciudad}`;
  let descripcion = `Detailing profesional a mano en ${biz.ciudad}: lavado sin remolinos, corrección de pintura y recubrimiento cerámico. Pedí tu turno por WhatsApp.`;
  if (isSpain) {
    descripcion = `Detailing profesional de coches en ${biz.ciudad}: lavado a mano, corrección de pintura y tratamiento cerámico. Pide tu cita por WhatsApp.`;
  } else if (isMexico) {
    descripcion = `Detailing profesional en ${biz.ciudad}: corrección de pintura, recubrimiento cerámico y estética interior. Cotiza por WhatsApp.`;
  }

  const ogImageUrl = (biz.fotos && biz.fotos.length > 0 && biz.fotos[0])
    ? (biz.fotos[0].startsWith("http") ? biz.fotos[0] : `https://detailing-demos-three.vercel.app${biz.fotos[0].startsWith("/") ? "" : "/"}${biz.fotos[0]}`)
    : "https://detailing-demos-three.vercel.app/og-detailing.jpg";

  return {
    metadataBase: new URL("https://detailing-demos-three.vercel.app"),
    title: {
      absolute: titulo,
    },
    description: descripcion,
    applicationName: biz.nombre,
    openGraph: {
      title: titulo,
      description: descripcion,
      url: `https://detailing-demos-three.vercel.app/d/${biz.slug}/`,
      siteName: biz.nombre,
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

  return (
    <>
      <DemoClientLanding initialBiz={biz} />
      <script dangerouslySetInnerHTML={{ __html: pixelScript(biz.slug) }} />
    </>
  );
}
