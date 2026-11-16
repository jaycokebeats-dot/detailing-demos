import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Panel de Taller & Caja — AM Estética Vehicular",
  description: "Panel de control operativo, gestión de vehículos en taller y arqueo de caja",
  manifest: "/manifest-taller.json",
  icons: {
    icon: [
      { url: "/favicon-am-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-taller.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon-taller.png", sizes: "180x180", type: "image/png" },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Taller AM",
  },
};

export default function TallerLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
