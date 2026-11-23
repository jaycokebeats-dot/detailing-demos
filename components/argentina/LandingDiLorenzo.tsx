"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { FaWhatsapp, FaMapMarkerAlt, FaStar, FaClock, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { HiOutlineCheckCircle, HiOutlineSparkles, HiShieldCheck } from "react-icons/hi2";
import type { Business, ServiceItem } from "@/data/business-helpers";
import { waHref, mapsHref } from "@/data/business-helpers";
import PpfColorVisualizer from "@/components/PpfColorVisualizer";
import { DI_LORENZO_SERVICIOS } from "@/data/di-lorenzo-data";

const ITEMS_PROBLEMA_ARGENTINA = [
  "Microrrayones circulares (swirls) causados por rodillos de lavadero automático o trapos con tierra",
  "Pintura opaca que perdió el brillo profundo y el reflejo de 0km",
  "Marcas de lluvia ácida, sarro de agua dura, resina de árboles o heces de pájaros incrustadas",
  "Tapizados con manchas difíciles, derrames o pérdida del tono original",
  "Plásticos interiores, torpedo y molduras resecas o blanquecinas por el sol",
  "Butacas de cuero resecas, agrietadas o con brillo grasoso por acumulación de suciedad",
];

// Comparador Antes/Después optimizado para carrusel táctil (con touchAction: none y stopPropagation para no trabar el scroll)
function CarouselCompareSlider({
  before,
  after,
  alt,
}: {
  before: string;
  after: string;
  alt: string;
}) {
  const [pos, setPos] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);

  const updateFromClientX = useCallback((clientX: number) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    if (rect.width <= 0) return;
    const pct = ((clientX - rect.left) / rect.width) * 100;
    setPos(Math.min(100, Math.max(0, pct)));
  }, []);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.stopPropagation();
    draggingRef.current = true;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {}
    updateFromClientX(e.clientX);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    e.stopPropagation();
    updateFromClientX(e.clientX);
  };

  const stopDragging = (e?: React.PointerEvent<HTMLDivElement>) => {
    if (draggingRef.current && e) {
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {}
    }
    draggingRef.current = false;
  };

  const onTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (e.touches.length > 0) {
      draggingRef.current = true;
      updateFromClientX(e.touches[0].clientX);
    }
  };

  const onTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (draggingRef.current && e.touches.length > 0) {
      e.stopPropagation();
      updateFromClientX(e.touches[0].clientX);
    }
  };

  const onTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    e.stopPropagation();
    draggingRef.current = false;
  };

  const clipStyle: React.CSSProperties = {
    clipPath: `inset(0 ${100 - pos}% 0 0)`,
    WebkitClipPath: `inset(0 ${100 - pos}% 0 0)`,
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden select-none cursor-ew-resize bg-[#0d0d0d] group"
      style={{ touchAction: "none" }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={stopDragging}
      onPointerCancel={stopDragging}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onTouchCancel={onTouchEnd}
    >
      {/* Img Después (fondo) */}
      <img
        src={after}
        alt={`Después — ${alt}`}
        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        draggable={false}
        loading="lazy"
      />

      {/* Img Antes (recortada) */}
      <img
        src={before}
        alt={`Antes — ${alt}`}
        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        style={clipStyle}
        draggable={false}
        loading="lazy"
      />

      {/* Botones de acceso rápido para alternar antes / después sin necesidad de arrastre milimétrico */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setPos(100);
        }}
        className="absolute top-2.5 left-2.5 text-[10px] px-2.5 py-1 rounded-full bg-black/85 hover:bg-black text-white uppercase tracking-wider font-semibold z-20 border border-white/15 shadow-sm transition active:scale-95"
      >
        Antes
      </button>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setPos(0);
        }}
        className="absolute top-2.5 right-2.5 text-[10px] px-2.5 py-1 rounded-full bg-[#b8c2cc] hover:bg-white text-black uppercase tracking-wider font-extrabold z-20 shadow-md transition active:scale-95"
      >
        Después
      </button>

      {/* Línea divisoria */}
      <div
        className="absolute top-0 bottom-0 w-0.5 pointer-events-none z-10"
        style={{
          left: `${pos}%`,
          background: "rgba(255, 255, 255, 0.95)",
          boxShadow: "0 0 10px rgba(0,0,0,0.8)",
        }}
      />

      {/* Manija central de arrastre */}
      <div
        className="absolute top-1/2 w-8 h-8 rounded-full flex items-center justify-center -translate-y-1/2 -translate-x-1/2 shadow-lg pointer-events-none z-20 transition-transform group-hover:scale-105"
        style={{
          left: `${pos}%`,
          background: "#b8c2cc",
          boxShadow: "0 4px 12px rgba(0,0,0,0.7)",
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 9l-4 3 4 3m8-6l4 3-4 3" />
        </svg>
      </div>
    </div>
  );
}

export default function LandingDiLorenzo({ biz }: { biz: Business }) {
  const [scrolled, setScrolled] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);

  const serviciosList = (biz.servicios && biz.servicios.length > 0) ? biz.servicios : DI_LORENZO_SERVICIOS;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.defaultMuted = true;
    video.muted = true;
    video.setAttribute("muted", "");
    video.setAttribute("playsinline", "true");
    video.play().catch(() => {});
  }, []);

  // Detección exacta de la tarjeta centrada al hacer scroll
  const handleCarouselScroll = () => {
    if (!carouselRef.current) return;
    const container = carouselRef.current;
    const cards = container.querySelectorAll<HTMLElement>(".service-card");
    if (!cards.length) return;

    const containerCenter = container.scrollLeft + container.clientWidth / 2;
    let closestIndex = 0;
    let minDiff = Infinity;

    cards.forEach((card, i) => {
      const cardCenter = card.offsetLeft + card.offsetWidth / 2;
      const diff = Math.abs(containerCenter - cardCenter);
      if (diff < minDiff) {
        minDiff = diff;
        closestIndex = i;
      }
    });

    setActiveSlide(closestIndex);
  };

  // Navegación exacta de tarjeta a tarjeta (centrando cada una sin quedar a mitad de camino)
  const scrollToCardIndex = (index: number) => {
    if (!carouselRef.current) return;
    const container = carouselRef.current;
    const cards = container.querySelectorAll<HTMLElement>(".service-card");
    if (!cards.length) return;

    const clampedIndex = Math.max(0, Math.min(index, cards.length - 1));
    const targetCard = cards[clampedIndex];
    if (!targetCard) return;

    const containerWidth = container.clientWidth;
    const cardLeft = targetCard.offsetLeft;
    const cardWidth = targetCard.offsetWidth;
    const scrollTarget = cardLeft - (containerWidth - cardWidth) / 2;

    container.scrollTo({
      left: scrollTarget,
      behavior: "smooth",
    });
    setActiveSlide(clampedIndex);
  };

  const scrollCarousel = (direction: "left" | "right") => {
    const nextIndex = direction === "right" ? activeSlide + 1 : activeSlide - 1;
    scrollToCardIndex(nextIndex);
  };

  const msgPresupuesto = `Hola! Quisiera pedir información o presupuesto para mi auto en ${biz.nombre}.`;
  const msgFotos = `Hola! Les mando unas fotos de mi auto para que me asesoren sobre qué tratamiento le conviene más en ${biz.nombre}.`;

  const stats = [
    biz.rating != null
      ? `★ ${biz.rating === 5 ? "5.0" : biz.rating.toFixed(1)} en Google${biz.reviews_count != null ? ` (${biz.reviews_count} opiniones)` : ""}`
      : "★ 4.9 en Google (18 opiniones)",
    "Garantía escrita",
    "Atención personalizada",
  ];

  return (
    <div className="min-h-screen bg-black text-white selection:bg-slate-500/30 selection:text-slate-200">
      {/* 1. NAVBAR (Exacto plantilla argentina) */}
      <div className="fixed top-0 left-0 right-0 z-50 flex justify-center px-3 pointer-events-none">
        <header
          className="w-full pointer-events-auto transition-[margin,border-radius,background-color,backdrop-filter,box-shadow] duration-300 ease-out"
          style={
            scrolled
              ? {
                  marginTop: "12px",
                  maxWidth: "56rem",
                  borderRadius: "9999px",
                  background: "rgba(10,10,10,0.85)",
                  backdropFilter: "blur(14px)",
                  boxShadow: "0 8px 30px rgba(0,0,0,0.45)",
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
          <div className={`max-w-6xl mx-auto flex items-center justify-between px-4 sm:px-8 transition-[height] duration-300 ${scrolled ? "h-14" : "h-16"}`}>
            <a href="#hero" className="flex items-center shrink-0 group transition-transform active:scale-95 py-1" aria-label="Ir al inicio">
              <span className="text-base font-bold tracking-widest text-white">
                DI LO <span className="text-gold">CENTER</span>
              </span>
            </a>
            <div className="hidden md:flex items-center gap-7 text-xs uppercase tracking-widest text-slate-400">
              <a href="#servicios" className="hover:text-white transition-colors">Servicios</a>
              <a href="#garantia" className="hover:text-white transition-colors">Compromiso</a>
              <a href="#nosotros" className="hover:text-white transition-colors">Nosotros</a>
              <a href="#ubicacion" className="hover:text-white transition-colors">Ubicación</a>
            </div>
            <a
              href={waHref(biz, msgPresupuesto)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-white hover:opacity-70 transition-opacity"
            >
              <FaWhatsapp aria-hidden className="size-4 text-emerald-400" />
              Pedir Turno
            </a>
          </div>
        </header>
      </div>

      {/* 2. HERO (Plantilla argentina con las 3 categorías) */}
      <section id="hero" className="relative min-h-[100dvh] pt-20 sm:pt-24 pb-8 sm:pb-12 px-4 sm:px-6 overflow-hidden flex items-center justify-center">
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-60 contrast-105 pointer-events-none"
          src={biz.video_hero ?? "/videos/hero-compilado-blanco.mp4"}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/55 to-black/75" />

        <div className="relative z-10 max-w-4xl mx-auto w-full flex flex-col justify-center items-center text-center px-2 py-6">
          {/* Badge Haedo */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-[11px] sm:text-xs font-medium text-slate-300 mb-2">
            <span className="flex size-1.5 sm:size-2 rounded-full shrink-0 animate-pulse bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
            <span>Haedo, Buenos Aires</span>
            <span className="text-slate-500">·</span>
            <span>Turnos disponibles esta semana</span>
          </div>

          {/* Nombre central */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-semibold tracking-tight leading-tight text-white mb-2">
            DI LO <span className="text-gold">CENTER</span>
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto font-light leading-relaxed mb-6">
            Centro Integral Automotor en Haedo. Elegí el área para tu vehículo:
          </p>

          {/* 3 CATEGORÍAS (Di Lorenzo Detailing activa, Venta y Mecánica en espera) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-2xl mx-auto mb-6">
            {/* 1. Di Lorenzo Detailing (ACTIVO -> baja a Nuestros Servicios) */}
            <a
              href="#servicios"
              className="group p-4 rounded-2xl border border-amber-400/40 bg-zinc-950/80 hover:bg-zinc-900 hover:border-amber-400 transition-all text-left flex flex-col justify-between shadow-lg shadow-amber-500/10 active:scale-98"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-amber-300 px-2 py-0.5 rounded-full bg-amber-400/15 border border-amber-400/30">
                    Activo
                  </span>
                  <HiOutlineSparkles className="size-4 text-amber-400 group-hover:rotate-12 transition-transform" />
                </div>
                <h2 className="font-bold text-base text-white group-hover:text-amber-300 transition-colors">
                  Di Lorenzo Detailing
                </h2>
                <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                  Tratamientos cerámicos, pulido, ópticas, tapizados y PPF.
                </p>
              </div>
              <span className="text-[11px] text-amber-400 font-semibold inline-flex items-center gap-1 mt-3">
                Ver Servicios →
              </span>
            </a>

            {/* 2. Venta Automotor (Deshabilitado / Próximamente) */}
            <div
              className="p-4 rounded-2xl border border-white/10 bg-zinc-950/40 text-left flex flex-col justify-between opacity-60 cursor-not-allowed select-none"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 px-2 py-0.5 rounded-full bg-white/5 border border-white/10">
                    Próximamente
                  </span>
                </div>
                <h2 className="font-bold text-base text-slate-300">
                  Venta Automotor
                </h2>
                <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                  Autos seminuevos seleccionados y consignaciones.
                </p>
              </div>
              <span className="text-[11px] text-slate-500 font-medium mt-3">
                En preparación
              </span>
            </div>

            {/* 3. Mecánica Ligera (Deshabilitado / Próximamente) */}
            <div
              className="p-4 rounded-2xl border border-white/10 bg-zinc-950/40 text-left flex flex-col justify-between opacity-60 cursor-not-allowed select-none"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 px-2 py-0.5 rounded-full bg-white/5 border border-white/10">
                    Próximamente
                  </span>
                </div>
                <h2 className="font-bold text-base text-slate-300">
                  Mecánica Ligera
                </h2>
                <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                  Service preventivo, frenos, distribución y fluidos.
                </p>
              </div>
              <span className="text-[11px] text-slate-500 font-medium mt-3">
                En preparación
              </span>
            </div>
          </div>

          {/* Botones de acción complementarios */}
          <div className="flex flex-row items-center justify-center gap-2 sm:gap-3 w-full max-w-sm sm:max-w-md mx-auto pt-1 px-1 mb-4">
            <a
              href={waHref(biz, msgPresupuesto)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-gold group flex-1 px-3 sm:px-6 py-2.5 sm:py-3 min-h-[42px] sm:min-h-[44px] rounded-full text-xs sm:text-sm font-semibold uppercase tracking-wide active:scale-95 transition-all flex items-center justify-center gap-1.5 sm:gap-2 whitespace-nowrap text-center"
            >
              <FaWhatsapp aria-hidden className="size-3.5 sm:size-4 shrink-0" />
              <span className="whitespace-nowrap">Pedir Presupuesto</span>
            </a>
            <a
              href="#servicios"
              className="btn-outline-gold group flex-1 px-3 sm:px-6 py-2.5 sm:py-3 min-h-[42px] sm:min-h-[44px] rounded-full text-xs sm:text-sm font-semibold uppercase active:scale-95 transition-all flex items-center justify-center gap-1.5 sm:gap-2 whitespace-nowrap text-center"
            >
              <HiOutlineSparkles aria-hidden className="size-3.5 sm:size-4 shrink-0" />
              <span className="whitespace-nowrap">Ver Servicios</span>
            </a>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-3 sm:gap-x-5 gap-y-1 pt-1 text-[11px] sm:text-xs text-slate-300">
            {stats.map((item) => (
              <span key={item} className="inline-flex items-center gap-1">
                <HiOutlineCheckCircle aria-hidden className="size-3.5 sm:size-4 shrink-0 text-gold" />
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* 3. PROBLEMA VS SOLUCIÓN (Sin divisor asimétrico) */}
      <section className="relative px-5 sm:px-8 py-20 border-t border-b border-white/5" style={{ background: "#101010" }}>
        <div className="max-w-3xl mx-auto text-center">
          <span className="section-badge mb-5">El problema real</span>
          <h2 className="text-3xl md:text-4xl font-medium text-gold mb-3">
            Lavar el Auto no es lo Mismo que un Detailing
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto mb-10 text-sm">
            Un auto puede salir limpio de un lavadero convencional y seguir viéndose opaco o rayado. Señales habituales:
          </p>
          <div className="grid sm:grid-cols-2 gap-3 text-left max-w-xl mx-auto">
            {ITEMS_PROBLEMA_ARGENTINA.map((item) => (
              <div key={item} className="glass-panel rounded-2xl px-4 py-3 flex items-start gap-3 border border-white/10">
                <span className="shrink-0 w-1.5 h-1.5 rounded-full mt-2" style={{ backgroundColor: "#b8c2cc" }} />
                <p className="text-sm text-slate-300">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. NUESTROS SERVICIOS — CARRUSEL MANUAL PREMIUM OPTIMIZADO */}
      <section id="servicios" className="px-4 sm:px-8 py-20 bg-black relative">
        <div className="max-w-7xl mx-auto">
          {/* Header con título y controles de navegación del carrusel */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-6">
            <div>
              <span className="section-badge mb-3">Nuestros servicios</span>
              <h2 className="text-2xl sm:text-4xl font-medium text-gold mb-2">
                Servicios & Tarifas en Haedo
              </h2>
              <p className="text-slate-400 text-xs sm:text-sm max-w-xl">
                Deslizá manualmente para conocer cada trabajo en detalle, comparar los resultados antes y después, y pedir presupuesto directo.
              </p>
            </div>

            {/* Flechas de navegación suave */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => scrollCarousel("left")}
                aria-label="Servicio anterior"
                className="w-10 h-10 rounded-full bg-[#141414] hover:bg-[#202020] text-white border border-white/10 hover:border-white/30 flex items-center justify-center transition-all active:scale-95 shadow-lg"
              >
                <FaChevronLeft className="text-xs" />
              </button>
              <button
                onClick={() => scrollCarousel("right")}
                aria-label="Siguiente servicio"
                className="w-10 h-10 rounded-full bg-[#141414] hover:bg-[#202020] text-white border border-white/10 hover:border-white/30 flex items-center justify-center transition-all active:scale-95 shadow-lg"
              >
                <FaChevronRight className="text-xs" />
              </button>
            </div>
          </div>

          {/* Carrusel horizontal deslizante manual con snap suave y medidas armónicas */}
          <div
            ref={carouselRef}
            onScroll={handleCarouselScroll}
            className="flex gap-5 overflow-x-auto pb-6 pt-2 scroll-smooth snap-x snap-mandatory scrollbar-none"
            style={{
              scrollSnapType: "x mandatory",
              WebkitOverflowScrolling: "touch",
            }}
          >
            {serviciosList.map((s, idx) => {
              const reservaMsg = `Hola! Me gustaría pedir información o presupuesto para el servicio: ${s.nombre} en ${biz.nombre}.`;
              const imgSource = s.img ?? "/servicios/exterior.jpg";
              const isPpfColor = s.nombre.toLowerCase().includes("ppf color") || s.nombre.toLowerCase().includes("ppf | paint protection film");
              const hasCompare = (s.modo_foto === "before_after" ? Boolean(s.antes_img || s.despues_img) : Boolean(s.antes_img && s.despues_img));

              return (
                <div
                  key={`${s.nombre}-${idx}`}
                  className="service-card product-card rounded-[22px] overflow-hidden flex flex-col justify-between relative border border-white/10 hover:border-white/25 transition-all duration-300 w-[84vw] xs:w-[320px] sm:w-[330px] md:w-[340px] lg:w-[350px] shrink-0 snap-center shadow-xl"
                  style={{ background: "#101010" }}
                >
                  {/* Media / Slider (Proporción 16/10 compacta y elegante) */}
                  <div className="aspect-[16/10] overflow-hidden relative bg-[#141414]">
                    {isPpfColor ? (
                      <PpfColorVisualizer biz={biz} />
                    ) : hasCompare ? (
                      <CarouselCompareSlider
                        before={s.antes_img || s.despues_img || imgSource}
                        after={s.despues_img || s.antes_img || imgSource}
                        alt={s.nombre}
                      />
                    ) : (
                      <div className="relative w-full h-full bg-[#0d0d0d] overflow-hidden">
                        <img
                          src={s.img || imgSource}
                          alt={s.nombre}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    {s.proteccion && !isPpfColor && (
                      <div
                        className="absolute bottom-2 left-2 right-2 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/15 text-[10px] font-semibold text-white/95 flex items-center gap-1.5 shadow-lg z-20 pointer-events-none"
                        style={{ background: "rgba(10,10,10,0.85)" }}
                      >
                        <span className="size-1.5 rounded-full bg-emerald-400 shrink-0" />
                        <span className="truncate">{s.proteccion}</span>
                      </div>
                    )}
                  </div>

                  {/* Info Card */}
                  <div className="p-4 sm:p-5 flex flex-col gap-2 flex-1 justify-between">
                    <div className="space-y-1.5">
                      <h3
                        className="font-bold text-base sm:text-lg text-white leading-snug line-clamp-2"
                        style={{ textTransform: "none", fontFamily: "inherit" }}
                      >
                        {s.nombre}
                      </h3>
                      {s.precio && s.precio.trim() ? (
                        <p className="text-sm sm:text-base font-extrabold text-gold">{s.precio}</p>
                      ) : null}
                      <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">{s.descripcion}</p>

                      {s.ideal_si && (
                        <p className="text-[11px] text-slate-400 pt-1 line-clamp-2">
                          <span className="font-semibold text-slate-300">Detalles:</span> {s.ideal_si}
                        </p>
                      )}
                    </div>

                    <a
                      href={waHref(biz, reservaMsg)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-outline-gold mt-3 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-full text-xs font-semibold uppercase tracking-wider active:scale-95 transition-transform"
                    >
                      <FaWhatsapp aria-hidden className="size-3.5 text-emerald-400" />
                      Pedir Presupuesto
                    </a>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Dots Indicator */}
          <div className="flex items-center justify-center gap-1.5 pt-5">
            {serviciosList.map((_, i) => (
              <button
                key={i}
                onClick={() => scrollToCardIndex(i)}
                aria-label={`Ir al servicio ${i + 1}`}
                className={`transition-all duration-300 rounded-full ${
                  activeSlide === i
                    ? "w-6 h-1.5 bg-amber-400"
                    : "w-1.5 h-1.5 bg-white/20 hover:bg-white/40"
                }`}
              />
            ))}
          </div>

          {/* Banner de fotos y asesoramiento */}
          <div className="glass-panel rounded-[24px] mt-10 p-6 md:p-8 flex flex-col md:flex-row items-center gap-6 justify-between border border-white/10" style={{ background: "#101010" }}>
            <div>
              <span className="section-badge mb-2">¿Dudas sobre qué necesita tu auto?</span>
              <h3 className="font-semibold text-lg md:text-xl mb-1 text-white" style={{ textTransform: "none", fontFamily: "inherit" }}>
                Mandanos 3 Fotos por WhatsApp y te Asesoramos
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
                Sacale fotos al capot, los laterales y el interior con buena luz. En {biz.nombre} te orientamos sin costo ni compromiso para elegir el tratamiento ideal.
              </p>
            </div>
            <a
              href={waHref(biz, msgFotos)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-gold shrink-0 inline-flex items-center gap-2 px-6 py-3 rounded-full text-xs sm:text-sm font-semibold uppercase tracking-wide whitespace-nowrap active:scale-95 transition-transform"
            >
              <FaWhatsapp aria-hidden className="size-4" />
              Enviar Fotos por WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* 5. GARANTÍA & COMPROMISO */}
      <section id="garantia" className="relative px-5 sm:px-8 py-20 border-t border-b border-white/5" style={{ background: "#101010" }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12 max-w-2xl mx-auto">
            <span className="section-badge mb-4">Compromiso de calidad</span>
            <h2 className="text-2xl sm:text-4xl font-medium text-gold mb-3">Tratamientos con Garantía Escrita</h2>
            <p className="text-slate-400 max-w-xl mx-auto text-xs sm:text-sm">
              Cada vehículo se atiende de forma individual, dedicando el tiempo necesario para alcanzar el estándar más exigente.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-5 text-left">
            <div className="glass-panel rounded-[20px] p-6 space-y-2.5 border border-white/10" style={{ background: "#141414" }}>
              <div className="w-10 h-10 rounded-full flex items-center justify-center mb-4" style={{ background: "rgba(184,194,204,0.1)" }}>
                <HiShieldCheck className="size-5" style={{ color: "#b8c2cc" }} />
              </div>
              <h3 className="font-semibold text-white text-sm sm:text-base" style={{ textTransform: "none", fontFamily: "inherit" }}>
                Marcas Premium Mundiales
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Utilizamos recubrimientos nanocerámicos y compuestos de pulido de marcas líderes globales.
              </p>
            </div>

            <div className="glass-panel rounded-[20px] p-6 space-y-2.5 border border-white/10" style={{ background: "#141414" }}>
              <div className="w-10 h-10 rounded-full flex items-center justify-center mb-4" style={{ background: "rgba(184,194,204,0.1)" }}>
                <HiOutlineSparkles className="size-5" style={{ color: "#b8c2cc" }} />
              </div>
              <h3 className="font-semibold text-white text-sm sm:text-base" style={{ textTransform: "none", fontFamily: "inherit" }}>
                Técnica Segura y Precisa
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Inspección minuciosa bajo luz LED de alta fidelidad. Cero rodillos, cero métodos abrasivos. Cuidado total de la laca y la pintura original.
              </p>
            </div>

            <div className="glass-panel rounded-[20px] p-6 space-y-2.5 border border-white/10" style={{ background: "#141414" }}>
              <div className="w-10 h-10 rounded-full flex items-center justify-center mb-4" style={{ background: "rgba(184,194,204,0.1)" }}>
                <HiOutlineCheckCircle className="size-5" style={{ color: "#b8c2cc" }} />
              </div>
              <h3 className="font-semibold text-white text-sm sm:text-base" style={{ textTransform: "none", fontFamily: "inherit" }}>
                Garantía y Seguimiento
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Asesoramiento post-entrega para que mantengas el brillo y la protección en cada lavado posterior.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. UBICACIÓN, HORARIOS Y MAPA */}
      <section id="ubicacion" className="px-5 sm:px-8 py-20 bg-black">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <span className="section-badge mb-3">Ubicación</span>
            <h2 className="text-2xl sm:text-4xl font-medium text-gold mb-2">Dónde Encontrarnos</h2>
            <p className="text-slate-400 text-xs sm:text-sm">Atención con turno previo en nuestro estudio de Haedo.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 items-center">
            <div className="glass-panel rounded-[20px] p-6 space-y-4 border border-white/10" style={{ background: "#101010" }}>
              <div className="flex items-start gap-4">
                <FaMapMarkerAlt className="size-5 text-gold shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-white text-sm">Dirección</h3>
                  <p className="text-sm text-slate-300">{biz.direccion}</p>
                  <p className="text-xs text-slate-400">{biz.ciudad}, {biz.provincia}</p>
                </div>
              </div>

              {biz.horario && (
                <div className="flex items-start gap-4 pt-2 border-t border-white/5">
                  <FaClock className="size-5 text-gold shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-white text-sm">Horario</h3>
                    <p className="text-xs text-slate-300">{biz.horario}</p>
                  </div>
                </div>
              )}

              <div className="pt-3">
                <a
                  href={mapsHref(biz)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-outline-gold inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider"
                >
                  <FaMapMarkerAlt className="size-3.5" />
                  Abrir en Google Maps
                </a>
              </div>
            </div>

            {/* Mapa Embebido */}
            <div className="aspect-[4/3] rounded-[20px] overflow-hidden border border-white/10 relative" style={{ background: "#141414" }}>
              <iframe
                title={`Ubicación de ${biz.nombre}`}
                src="https://maps.google.com/maps?q=Orense%20711,%20Haedo,%20Buenos%20Aires&t=&z=15&ie=UTF8&iwloc=&output=embed"
                className="w-full h-full border-0 filter grayscale invert contrast-125 opacity-80 hover:opacity-100 transition-opacity"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 7. FOOTER */}
      <footer className="px-5 sm:px-8 py-10 border-t border-white/10 text-center text-xs text-slate-500" style={{ background: "#080808" }}>
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} {biz.nombre}. Todos los derechos reservados.</p>
          <div className="flex items-center gap-6">
            <a href="#hero" className="hover:text-white transition-colors">Inicio</a>
            <a href="#servicios" className="hover:text-white transition-colors">Servicios</a>
            <a href="#garantia" className="hover:text-white transition-colors">Compromiso</a>
            <a href={mapsHref(biz)} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
              Cómo llegar
            </a>
          </div>
        </div>
      </footer>

      {/* WhatsApp Flotante */}
      <a
        href={waHref(biz, msgPresupuesto)}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Contactar por WhatsApp"
        className="fixed bottom-6 right-6 z-40 flex items-center justify-center size-14 rounded-full bg-emerald-500 text-white shadow-2xl hover:bg-emerald-400 hover:scale-105 active:scale-95 transition"
      >
        <FaWhatsapp className="size-7" />
      </a>
    </div>
  );
}
