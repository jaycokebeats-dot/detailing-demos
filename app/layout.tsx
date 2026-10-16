import type { Metadata, Viewport } from "next";
import { Archivo, Syne } from "next/font/google";
import "./globals.css";

const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-soehne",
  display: "swap",
});

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-soehne-breit",
  display: "swap",
});

const SITE_URL = "https://borges-ppf-detailing.vercel.app";
const TITULO = "BORGES PPF & DETAILING — PPF XPEL, Tratamientos Cerámicos y Detailing en Canning";
const DESCRIPCION = "Líderes en colocación de PPF XPEL americano con 10 años de garantía oficial, tratamientos cerámicos premium importados y detailing de alta gama en Canning, Buenos Aires.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: TITULO,
    template: "%s | BORGES PPF & DETAILING",
  },
  description: DESCRIPCION,
  keywords: [
    "PPF Canning",
    "XPEL Argentina",
    "PPF XPEL Canning",
    "Detailing Canning",
    "Tratamiento Cerámico Canning",
    "Protección de Pintura Autos",
    "Ploteo PPF",
    "Polishing Canning",
    "Borges PPF",
    "Estética Vehicular Canning",
    "Monte de Oca Canning",
  ],
  authors: [{ name: "BORGES PPF & DETAILING", url: SITE_URL }],
  creator: "BORGES PPF & DETAILING",
  publisher: "BORGES PPF & DETAILING",
  applicationName: "BORGES PPF & DETAILING",
  alternates: {
    canonical: SITE_URL,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.ico",
    apple: "/favicon.png",
  },
  openGraph: {
    title: TITULO,
    description: DESCRIPCION,
    url: SITE_URL,
    siteName: "BORGES PPF & DETAILING",
    locale: "es_AR",
    type: "website",
    images: [
      {
        url: "/logo/logo-full-white.jpg",
        width: 1200,
        height: 630,
        alt: "BORGES PPF & DETAILING — Canning",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: TITULO,
    description: DESCRIPCION,
    images: ["/logo/logo-full-white.jpg"],
  },
};

export const viewport: Viewport = {
  themeColor: "#0b0b0b",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "AutoRepair",
  "name": "BORGES PPF & DETAILING",
  "image": `${SITE_URL}/logo/logo-full-white.jpg`,
  "@id": `${SITE_URL}/#organization`,
  "url": SITE_URL,
  "telephone": "+5491136453982",
  "priceRange": "$$$",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Monte de Oca 42",
    "addressLocality": "Canning",
    "addressRegion": "Buenos Aires",
    "postalCode": "B1804",
    "addressCountry": "AR"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": -34.877,
    "longitude": -58.504
  },
  "openingHoursSpecification": [
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      "opens": "09:00",
      "closes": "19:00"
    }
  ],
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "5.0",
    "reviewCount": "85",
    "bestRating": "5",
    "worstRating": "1"
  },
  "sameAs": [
    "https://www.instagram.com/borges.ppf.detailing"
  ],
  "hasOfferCatalog": {
    "@type": "OfferCatalog",
    "name": "Servicios de Detailing y PPF",
    "itemListElement": [
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Paint Protection Film (PPF XPEL)",
          "description": "Protección de pintura automotriz autorregenerativa con tecnología americana XPEL y 10 años de garantía oficial."
        }
      },
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Tratamiento Cerámico Premium",
          "description": "Protección cerámica de alta durabilidad y brillo extremo importada del exterior."
        }
      },
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Detailing Interior y Corrección de Pintura",
          "description": "Limpieza profunda de interiores, mantenimiento de cuero y corrección multi-paso de laca."
        }
      }
    ]
  }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es-AR" className="scroll-smooth">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${archivo.className} ${syne.variable} bg-[#010101] text-slate-300 antialiased`}>
        {children}
      </body>
    </html>
  );
}

