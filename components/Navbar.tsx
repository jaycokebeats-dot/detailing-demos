"use client";

import { useEffect, useState } from "react";
import { FaWhatsapp } from "react-icons/fa";
import { type Business, MSG_PRESUPUESTO, waHref } from "@/data/business-helpers";

export default function Navbar({ biz }: { biz: Business }) {
  // primera palabra blanca, resto en gold (BLACK LINE)
  const [primera, ...resto] = (biz.nombreCorto ?? biz.nombre).toUpperCase().split(" ");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex justify-center px-3 pointer-events-none">
      <header
        className="w-full pointer-events-auto transition-[margin,border-radius,background-color,backdrop-filter,box-shadow] duration-300 ease-out"
        style={
          scrolled
            ? {
                marginTop: "12px",
                maxWidth: "56rem",
                borderRadius: "9999px",
                background: "rgba(10,10,10,0.72)",
                backdropFilter: "blur(14px)",
                boxShadow: "0 8px 30px rgba(0,0,0,0.35)",
                border: "1px solid rgba(255,255,255,0.08)",
              }
            : {
                marginTop: "0px",
                maxWidth: "100%",
                borderRadius: "0px",
                background: "transparent",
              }
        }
      >
        <div className={`max-w-6xl mx-auto flex items-center justify-between px-5 sm:px-8 transition-[height] duration-300 ${scrolled ? "h-14" : "h-16"}`}>
          <a href="#hero" className="text-base font-bold tracking-widest text-white" style={{ fontFamily: "var(--font-soehne-breit)" }}>
            {resto.length > 0 ? (
              <>
                {`${primera} `}
                <span className="text-gold">{resto.join(" ")}</span>
              </>
            ) : (
              primera
            )}
          </a>
          <div className="hidden md:flex items-center gap-8 text-xs uppercase tracking-widest text-slate-400">
            <a href="#resultados" className="hover:text-white transition-colors">Resultados</a>
            <a href="#servicios" className="hover:text-white transition-colors">Servicios</a>
            <a href="#nosotros" className="hover:text-white transition-colors">Por qué nosotros</a>
            <a href="#ubicacion" className="hover:text-white transition-colors">Ubicación</a>
          </div>
          <a
            href={waHref(biz, MSG_PRESUPUESTO)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-white hover:opacity-70 transition-opacity"
          >
            <FaWhatsapp aria-hidden className="size-4" />
            Escribinos
          </a>
        </div>
      </header>
    </div>
  );
}
