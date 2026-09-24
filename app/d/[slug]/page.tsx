import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Landing from "@/components/Landing";
import DemoClientLanding from "@/components/DemoClientLanding";
import { getAllBusinesses, getBusiness } from "@/data/businesses";

const HIDDEN_SLUGS = new Set([
  "ec-detail-estetica-vehicular",
]);

export const dynamicParams = true;

// Render paths dynamically on-demand to ensure instant 1-second Vercel builds without timeouts.
export function generateStaticParams() {
  return [];
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  if (HIDDEN_SLUGS.has(slug)) return {};
  const biz = getBusiness(slug);
  if (!biz) return {};
  const titulo = `${biz.nombre} — Detailing en ${biz.ciudad}`;
  const descripcion = `Detailing profesional a mano en ${biz.ciudad}: lavado sin remolinos, corrección de pintura y recubrimiento cerámico. Pedí tu turno por WhatsApp.`;
  return {
    title: titulo,
    description: descripcion,
    applicationName: biz.nombre,
    openGraph: {
      title: titulo,
      description: descripcion,
      locale: "es_AR",
      type: "website",
      ...(biz.fotos[0] ? { images: [{ url: biz.fotos[0] }] } : {}),
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
  const biz = getBusiness(slug);
  if (!biz) notFound();
  return (
    <>
      <DemoClientLanding initialBiz={biz} />
      <script dangerouslySetInnerHTML={{ __html: pixelScript(biz.slug) }} />
    </>
  );
}

