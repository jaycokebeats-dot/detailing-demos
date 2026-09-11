import type { Metadata, Viewport } from "next";
import { Archivo, Syne } from "next/font/google";
import "./globals.css";

const archivo = Archivo({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-soehne",
});

const syne = Syne({
  subsets: ["latin"],
  weight: ["700", "800"],
  variable: "--font-soehne-breit",
});

const TITULO = "Black Line Detailing — Car Detailing en Vicente López";
const DESCRIPCION = "Detailing profesional a mano en Vicente López: lavado sin remolinos, corrección de pintura y recubrimiento cerámico con garantía por escrito.";

export const metadata: Metadata = {
  title: TITULO,
  description: DESCRIPCION,
  applicationName: "Black Line Detailing",
  openGraph: {
    title: TITULO,
    description: DESCRIPCION,
    locale: "es_AR",
    type: "website",
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: "#0b0b0b",
  colorScheme: "dark",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es-AR" className="scroll-smooth">
      <body className={`${archivo.className} ${syne.variable} bg-black text-slate-300 antialiased`}>
        {children}
      </body>
    </html>
  );
}
