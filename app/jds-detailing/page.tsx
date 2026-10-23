import type { Metadata } from "next";
import LandingArgentina from "@/components/argentina/LandingArgentina";
import { JDS_DETAILING_BUSINESS } from "@/data/jds-data";

export const metadata: Metadata = {
  metadataBase: new URL("https://detailing-demos-three.vercel.app"),
  title: "JDS Detailing — Detailing Profesional en Villa Ballester",
  description:
    "Detailing profesional a mano en Villa Ballester: corrección de pintura, tratamiento cerámico 9H, PPF y estética interior. Pedí tu turno por WhatsApp al 11 5451-4393.",
  applicationName: "JDS Detailing",
  openGraph: {
    title: "JDS Detailing — Detailing Profesional en Villa Ballester",
    description:
      "Detailing profesional a mano en Villa Ballester: corrección de pintura, tratamiento cerámico 9H, PPF y estética interior. Pedí tu turno por WhatsApp.",
    url: "https://detailing-demos-three.vercel.app/d/jds-detailing/",
    siteName: "JDS Detailing",
    locale: "es_AR",
    type: "website",
    images: [
      {
        url: "https://detailing-demos-three.vercel.app/og-detailing.jpg",
        width: 1200,
        height: 630,
        alt: "JDS Detailing — Villa Ballester",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "JDS Detailing — Detailing Profesional en Villa Ballester",
    description:
      "Detailing profesional a mano en Villa Ballester: corrección de pintura, tratamiento cerámico 9H, PPF y estética interior.",
    images: ["https://detailing-demos-three.vercel.app/og-detailing.jpg"],
  },
};

export default function JdsDetailingPage() {
  return <LandingArgentina biz={JDS_DETAILING_BUSINESS} />;
}
