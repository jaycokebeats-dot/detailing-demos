"use client";

import { FaWhatsapp } from "react-icons/fa";
import { type Business, MSG_PRESUPUESTO, waHref } from "@/data/business-helpers";

export default function WhatsAppFloat({ biz }: { biz: Business }) {
  if (!biz.whatsapp) return null;
  return (
    <a
      href={waHref(biz, MSG_PRESUPUESTO)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Contáctanos por WhatsApp"
      className="fixed bottom-5 right-5 z-50 w-14 h-14 rounded-full flex items-center justify-center text-black active:scale-95 transition-transform shadow-xl"
      style={{ background: "#25D366" }}
    >
      <FaWhatsapp aria-hidden className="size-7" />
    </a>
  );
}
