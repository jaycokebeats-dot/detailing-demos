import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Landing from "@/components/Landing";
import { getAllBusinesses, getBusiness } from "@/data/businesses";

export const dynamicParams = true;

export function generateStaticParams() {
  return getAllBusinesses().map((b) => ({ slug: b.slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
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
  const biz = getBusiness(slug);
  if (!biz) notFound();
  return (
    <>
      <Landing biz={biz} />
      <script dangerouslySetInnerHTML={{ __html: pixelScript(biz.slug) }} />
    </>
  );
}
