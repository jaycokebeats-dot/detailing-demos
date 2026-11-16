import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Recepción y Ficha de Ingreso — AM Estética Vehicular",
  description: "Ficha digital de recepción, inspección 360 y check-in de vehículos",
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
    title: "Check-in AM",
  },
};

export default function CheckinLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
