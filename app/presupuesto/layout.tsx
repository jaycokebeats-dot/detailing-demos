import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Presupuestador — AM Estética Vehicular",
  description: "Presupuestador rápido de servicios y presupuestos oficiales",
  manifest: "/manifest-cotizador.json",
  icons: {
    icon: [
      { url: "/favicon-am-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-cotizador.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon-cotizador.png", sizes: "180x180", type: "image/png" },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Presupuestador AM",
  },
};

export default function PresupuestoLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
