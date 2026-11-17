import type { Metadata } from "next";
import LandingArgentina from "@/components/argentina/LandingArgentina";
import { JDS_DETAILING_BUSINESS } from "@/data/jds-data";

export const metadata: Metadata = {
  metadataBase: new URL("https://detailing-demos-three.vercel.app"),
  title: "JDS Detailing Car Studio — Detailing Profesional en Villa Ballester",
  description:
    "Taller de estética del automotor en Villa Ballester: tratamientos cerámicos, pulido de pintura, PPF brillante, restauración de ópticas y limpieza de motor a vapor. Tu auto, en las mejores manos.",
  applicationName: "JDS Detailing Car Studio",
  alternates: {
    canonical: "https://detailing-demos-three.vercel.app/d/jds-detailing",
  },
  icons: {
    icon: [
      { url: "/favicon-jds-48.png", sizes: "48x48", type: "image/png" },
      { url: "/favicon-jds-192.png", sizes: "192x192", type: "image/png" },
      { url: "/favicon-jds.ico" },
      { url: "/favicon-jds.svg", type: "image/svg+xml" },
    ],
    shortcut: "/favicon-jds.ico",
    apple: [
      { url: "/apple-touch-icon-jds.png", sizes: "180x180", type: "image/png" },
    ],
  },
  openGraph: {
    title: "JDS Detailing Car Studio — Detailing Profesional en Villa Ballester",
    description:
      "Taller de estética del automotor en Villa Ballester: tratamientos cerámicos, pulido de pintura, PPF brillante, restauración de ópticas y motor a vapor. Pedí tu turno por WhatsApp al 11 5451-4393.",
    url: "https://detailing-demos-three.vercel.app/d/jds-detailing",
    siteName: "JDS Detailing Car Studio",
    locale: "es_AR",
    type: "website",
    images: [
      {
        url: "https://detailing-demos-three.vercel.app/og-jds.jpg",
        width: 1200,
        height: 630,
        alt: "JDS Detailing Car Studio — Villa Ballester",
        type: "image/jpeg",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "JDS Detailing Car Studio — Detailing Profesional en Villa Ballester",
    description:
      "Taller de estética del automotor en Villa Ballester: tratamientos cerámicos, pulido de pintura, PPF brillante, ópticas y motor a vapor.",
    images: ["https://detailing-demos-three.vercel.app/og-jds.jpg"],
  },
};

export default function JdsDetailingPage() {
  return <LandingArgentina biz={JDS_DETAILING_BUSINESS} />;
}
