import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ficha de Recepción — AM Estética Vehicular",
  description: "Ficha digital de recepción, inspección 360 y check-in de vehículos",
  manifest: "/manifest-recepcion.json",
  icons: {
    icon: [
      { url: "/favicon-am-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-recepcion.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon-recepcion.png", sizes: "180x180", type: "image/png" },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Recepción AM",
  },
};

export default function CheckinLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
