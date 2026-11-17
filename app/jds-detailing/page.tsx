import type { Metadata } from "next";
import LandingArgentina from "@/components/argentina/LandingArgentina";
import { JDS_DETAILING_BUSINESS } from "@/data/jds-data";

export const metadata: Metadata = {
  metadataBase: new URL("https://detailing-demos-three.vercel.app"),
  title: "JDS Detail Car Estudio — Detailing Profesional en Villa Ballester",
  description:
    "Taller de estética del auto en Villa Ballester: tratamientos cerámicos 9H, pulido y corrección de pintura, PPF brillante, restauración de ópticas y limpieza de motor a vapor. Tu auto, en las mejores manos.",
  applicationName: "JDS Detail Car Estudio",
  openGraph: {
    title: "JDS Detail Car Estudio — Detailing Profesional en Villa Ballester",
    description:
      "Taller de estética del auto en Villa Ballester: tratamientos cerámicos 9H, corrección de laca, PPF brillante, ópticas y motor a vapor. Pedí tu turno por WhatsApp al 11 5451-4393.",
    url: "https://detailing-demos-three.vercel.app/d/jds-detailing/",
    siteName: "JDS Detail Car Estudio",
    locale: "es_AR",
    type: "website",
    images: [
      {
        url: "/logo/jds/jds-logo-square.jpg",
        width: 1200,
        height: 630,
        alt: "JDS Detail Car Estudio — Villa Ballester",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "JDS Detail Car Estudio — Detailing Profesional en Villa Ballester",
    description:
      "Taller de estética del auto en Villa Ballester: tratamientos cerámicos 9H, corrección de pintura, PPF brillante, ópticas y motor a vapor.",
    images: ["/logo/jds/jds-logo-square.jpg"],
  },
};

export default function JdsDetailingPage() {
  return <LandingArgentina biz={JDS_DETAILING_BUSINESS} />;
}
