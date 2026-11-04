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

const SITE_URL = "https://detailing-demos-three.vercel.app";
const TITULO = "Estudio de Detailing Profesional — Tratamientos Cerámicos, PPF y Corrección de Pintura";
const DESCRIPCION = "Detailing profesional de alta gama: tratamientos cerámicos premium, protección PPF, pulido y estética vehicular.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: TITULO,
    template: "%s | Detailing Profesional",
  },
  description: DESCRIPCION,
  authors: [{ name: "Detailing Studio", url: SITE_URL }],
  creator: "Detailing Studio",
  publisher: "Detailing Studio",
  applicationName: "Detailing Studio",
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
  verification: {
    google: "8KSKdnhVp7_r_zufW5NJuW-O4bCwpQ4t7Gsen_A02VE",
  },
  icons: {
    icon: [
      { url: "/favicon-platinum-48.png", sizes: "48x48", type: "image/png" },
      { url: "/favicon-platinum-192.png", sizes: "192x192", type: "image/png" },
      { url: "/favicon-platinum.svg", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/apple-touch-icon-platinum.png", sizes: "180x180", type: "image/png" },
    ],
  },
  openGraph: {
    title: TITULO,
    description: DESCRIPCION,
    url: SITE_URL,
    siteName: "Platinum Detallado Automotriz",
    locale: "es_MX",
    type: "website",
    images: [
      {
        url: "https://platinumdetallado.com/og-platinum.jpg",
        width: 1200,
        height: 630,
        alt: "Platinum Detallado Automotriz a Domicilio — Querétaro",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: TITULO,
    description: DESCRIPCION,
    images: ["https://platinumdetallado.com/og-platinum.jpg"],
  },
};

export const viewport: Viewport = {
  themeColor: "#0b0b0b",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className="scroll-smooth">
      <body className={`${archivo.className} ${archivo.variable} ${syne.variable} bg-[#010101] text-slate-300 antialiased`}>
        {children}
      </body>
    </html>
  );
}

