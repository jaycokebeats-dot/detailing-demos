"use client";

import { useEffect, useRef } from "react";
import { FaWhatsapp } from "react-icons/fa";
import { HiOutlineCheckCircle, HiOutlineSparkles } from "react-icons/hi2";
import { type Business, MSG_PRESUPUESTO, waHref } from "@/data/business-helpers";

export default function Hero({ biz }: { biz: Business }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Enforce webkit & mobile Safari video DOM requirements
    video.defaultMuted = true;
    video.muted = true;
    video.setAttribute("muted", "");
    video.setAttribute("playsinline", "true");
    video.setAttribute("webkit-playsinline", "true");
    video.setAttribute("x5-playsinline", "true");

    const safePlay = () => {
      if (video.paused) {
        const promise = video.play();
        if (promise !== undefined) {
          promise.catch(() => {
            // Autoplay blocked by browser power-saving mode until user gesture
          });
        }
      }
    };

    safePlay();

    // Event listeners to retry playback upon media load or tab focus
    video.addEventListener("loadeddata", safePlay);
    video.addEventListener("canplay", safePlay);

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        safePlay();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    const handleUserInteraction = () => {
      safePlay();
      window.removeEventListener("touchstart", handleUserInteraction);
      window.removeEventListener("touchend", handleUserInteraction);
      window.removeEventListener("click", handleUserInteraction);
      window.removeEventListener("scroll", handleUserInteraction);
    };

    window.addEventListener("touchstart", handleUserInteraction, { passive: true });
    window.addEventListener("touchend", handleUserInteraction, { passive: true });
    window.addEventListener("click", handleUserInteraction, { passive: true });
    window.addEventListener("scroll", handleUserInteraction, { passive: true });

    return () => {
      video.removeEventListener("loadeddata", safePlay);
      video.removeEventListener("canplay", safePlay);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("touchstart", handleUserInteraction);
      window.removeEventListener("touchend", handleUserInteraction);
      window.removeEventListener("click", handleUserInteraction);
      window.removeEventListener("scroll", handleUserInteraction);
    };
  }, []);

  const stats = [
    "5 ★ en Google",
    "8 años en el rubro",
    "Garantía Oficial XPEL 10 Años",
  ];

  return (
    <section id="hero" className="relative lg:h-dvh pt-20 pb-12 lg:pb-0 px-4 sm:px-6 overflow-x-clip">
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        poster="/servicios/ppf.jpg"
        disablePictureInPicture
        controls={false}
        className="absolute inset-0 w-full h-full object-cover opacity-55 contrast-110 pointer-events-none"
        src="https://storage.googleapis.com/webild/default/templates/detailing/hero/hero.mp4"
      />
      <div className="absolute inset-0" style={{ background: "linear-gradient(100deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.6) 45%, rgba(0,0,0,0.35) 100%)" }} />
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(255,255,255,0.04) 0%, transparent 70%)" }}
      />

      <div className="relative z-10 max-w-6xl mx-auto w-full h-full flex items-center justify-center">
        <div className="max-w-2xl text-center space-y-5 mx-auto py-8 lg:py-6">
          {/* Logo oficial en blanco si es Borges */}
          {biz.slug === "borges-ppf-y-detailing" && (
            <div className="flex justify-center mb-6 -mt-6 lg:-mt-10">
              <img
                src="/logo/logopngblanco.png"
                alt="BORGES PPF & DETAILING"
                className="h-32 sm:h-36 md:h-44 w-auto object-contain drop-shadow-[0_15px_35px_rgba(0,0,0,0.95)] transition-transform hover:scale-105"
              />
            </div>
          )}

          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 text-xs sm:text-sm font-medium text-slate-300">
            <span className="flex size-2 rounded-full shrink-0 animate-pulse" style={{ background: "#b8c2cc", boxShadow: "0 0 6px rgba(184,194,204,0.8)" }} />
            <span>{biz.ciudad}</span>
            <span className="text-slate-500">·</span>
            <span>Tecnología XPEL Americana</span>
          </div>

          <h1 className="text-[32px] sm:text-[38px] font-medium tracking-tight leading-tight text-balance">
            Somos Líderes en la Colocación de
            <br />
            <span className="text-gold">PPF en Canning.</span>
          </h1>

          <p className="text-base md:text-lg text-slate-400 max-w-2xl font-light leading-relaxed text-pretty">
            Protección de pintura con tecnología americana XPEL, recubrimiento cerámico y detailing interior. Hecho a mano en Canning.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full sm:w-auto">
            <a
              href={waHref(biz, MSG_PRESUPUESTO)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-red-premium group w-full sm:w-auto px-7 py-3.5 min-h-[44px] rounded-full text-sm font-semibold uppercase tracking-wide active:scale-95 transition-[transform,filter] duration-150 flex items-center justify-center gap-2.5"
            >
              <FaWhatsapp aria-hidden className="size-4" />
              Consultar por WhatsApp
            </a>
            <a
              href="#servicios"
              className="btn-outline-gold text-nowrap group w-full sm:w-auto px-7 py-3.5 min-h-[44px] rounded-full text-sm font-semibold uppercase active:scale-95 flex items-center justify-center gap-2.5"
            >
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
