"use client";

import { useEffect, useRef } from "react";
import { FaWhatsapp } from "react-icons/fa";
import { HiOutlineCheckCircle, HiOutlineSparkles } from "react-icons/hi2";
import { type Business, MSG_PRESUPUESTO, heroFoto, waHref } from "@/data/business-helpers";

export default function Hero({ biz }: { biz: Business }) {
  const foto = heroFoto(biz);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.defaultMuted = true;
    video.muted = true;

    const attemptPlay = () => {
      video.play().catch(() => {
        // Autoplay prevented by browser policy / battery saver
      });
    };

    attemptPlay();

    const handleInteraction = () => {
      attemptPlay();
      window.removeEventListener("touchstart", handleInteraction);
      window.removeEventListener("scroll", handleInteraction);
    };

    window.addEventListener("touchstart", handleInteraction, { passive: true });
    window.addEventListener("scroll", handleInteraction, { passive: true });

    return () => {
      window.removeEventListener("touchstart", handleInteraction);
      window.removeEventListener("scroll", handleInteraction);
    };
  }, []);

  const stats = [
    biz.rating != null
      ? `★ ${biz.rating.toFixed(1)} en Google${biz.reviews_count != null ? ` (${biz.reviews_count} reseñas)` : ""}`
      : "+800 autos detailed",
    "8 años en el rubro",
    "Garantía por escrito",
  ];

  return (
    <section id="hero" className="relative lg:h-dvh pt-24 pb-12 lg:pb-0 px-4 sm:px-6 overflow-x-clip">
      {foto ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={foto}
          alt=""
          aria-hidden
          className="absolute inset-0 w-full h-full object-cover opacity-40 contrast-110"
        />
      ) : (
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          disablePictureInPicture
          controls={false}
          className="absolute inset-0 w-full h-full object-cover opacity-55 contrast-110 pointer-events-none"
          src="https://storage.googleapis.com/webild/default/templates/detailing/hero/hero.mp4"
        />
      )}
      <div className="absolute inset-0" style={{ background: "linear-gradient(100deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.6) 45%, rgba(0,0,0,0.35) 100%)" }} />
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(255,255,255,0.04) 0%, transparent 70%)" }}
      />

      <div className="relative z-10 max-w-6xl mx-auto w-full h-full flex items-center justify-center">
        <div className="max-w-2xl text-center space-y-5 mx-auto py-12 lg:py-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 text-xs sm:text-sm font-medium text-slate-300">
            <span className="flex size-2 rounded-full shrink-0 animate-pulse" style={{ background: "#b8c2cc", boxShadow: "0 0 6px rgba(184,194,204,0.8)" }} />
            <span>{biz.ciudad}</span>
            <span className="text-slate-500">·</span>
            <span>Turnos para esta semana</span>
          </div>

          <h1 className="text-[32px] font-medium tracking-tight leading-tight text-balance">
            Detailing a Mano,
            <br />
            <span className="text-gold">Resultado de Showroom.</span>
          </h1>

          <p className="text-base md:text-lg text-slate-400 max-w-2xl font-light leading-relaxed text-pretty">
            Corrección de pintura, protección cerámica y detailing interior, hecho a mano con productos profesionales. Un brillo que se nota de lejos.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full sm:w-auto">
            <a
              href={waHref(biz, MSG_PRESUPUESTO)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-gold group w-full sm:w-auto px-7 py-3.5 min-h-[44px] rounded-full text-sm font-semibold uppercase tracking-wide active:scale-95 transition-[transform,filter] duration-150 flex items-center justify-center gap-2.5"
            >
              <FaWhatsapp aria-hidden className="size-4" />
              Consultar por WhatsApp
            </a>
            <a
              href="#servicios"
              className="btn-outline-gold text-nowrap group w-full sm:w-auto px-7 py-3.5 min-h-[44px] rounded-full text-sm font-semibold uppercase active:scale-95 flex items-center justify-center gap-2.5"
            >
              <HiOutlineSparkles aria-hidden className="size-4" />
              Ver Servicios
            </a>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 pt-1">
            {stats.map((item) => (
              <span key={item} className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-slate-400">
                <HiOutlineCheckCircle aria-hidden className="size-4 shrink-0" style={{ color: "#b8c2cc" }} />
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
