"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  FaWhatsapp,
  FaMapMarkerAlt,
  FaClock,
  FaChevronLeft,
  FaChevronRight,
  FaChevronUp,
  FaChevronDown,
  FaInstagram,
  FaArrowLeft,
  FaStar,
} from "react-icons/fa";
import {
  HiOutlineCheckCircle,
  HiOutlineSparkles,
  HiOutlineArrowRight,
} from "react-icons/hi2";
import type { Business, ServiceItem } from "@/data/business-helpers";
import { waHref, mapsHref } from "@/data/business-helpers";
import PpfColorVisualizer from "@/components/PpfColorVisualizer";
import { DI_LORENZO_SERVICIOS } from "@/data/di-lorenzo-data";

// Comparador Antes/Después optimizado para carrusel táctil (con touchAction: none y stopPropagation para no trabar el carrusel)
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

      {/* Botones de alternancia rápida antes / después */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setPos(100);
        }}
        className="absolute top-3 left-3 text-[10px] px-3 py-1 rounded-full bg-black/85 hover:bg-black text-white uppercase tracking-wider font-semibold z-20 border border-white/20 shadow-md transition active:scale-95"
      >
        Antes
      </button>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setPos(0);
        }}
        className="absolute top-3 right-3 text-[10px] px-3 py-1 rounded-full bg-[#b8c2cc] hover:bg-white text-black uppercase tracking-wider font-extrabold z-20 shadow-md transition active:scale-95"
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
        className="absolute top-1/2 w-9 h-9 rounded-full flex items-center justify-center -translate-y-1/2 -translate-x-1/2 shadow-xl pointer-events-none z-20 transition-transform group-hover:scale-105"
        style={{
          left: `${pos}%`,
          background: "#b8c2cc",
          boxShadow: "0 4px 14px rgba(0,0,0,0.8)",
        }}
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 9l-4 3 4 3m8-6l4 3-4 3" />
        </svg>
      </div>
    </div>
  );
}

const SERVICE_SLUGS = [
  "opticas",
  "abrillantado",
  "preventa",
  "tapizados",
  "ceramico",
  "motos",
];

const SERVICE_SLUG_MAP: Record<string, number> = {
  // 0: Pulido Exterior de Ópticas
  opticas: 0,
  optica: 0,
  "pulido-opticas": 0,
  "pulido-de-opticas": 0,
  // 1: Abrillantado Premium
  abrillantado: 1,
  "abrillantado-premium": 1,
  pulido: 1,
  // 2: Servicio Pre-Venta (Particular - Agencias)
  preventa: 2,
  "pre-venta": 2,
  "servicio-preventa": 2,
  venta: 2,
  // 3: Limpieza de Tapizados
  tapizados: 3,
  tapizado: 3,
  interiores: 3,
  "limpieza-tapizados": 3,
  "limpieza-de-tapizados": 3,
  // 4: Tratamiento Cerámico / Acrílico
  ceramico: 4,
  acrilico: 4,
  "tratamiento-ceramico": 4,
  "tratamiento-acrilico": 4,
  "vidrio-liquido": 4,
  // 5: Tratamiento Motos
  motos: 5,
  moto: 5,
  "tratamiento-motos": 5,
};

export default function LandingDiLorenzo({ biz }: { biz: Business }) {
  // Vista actual: "hub" (Di Lo Center principal) o "detailing" (Di Lorenzo Detailing)
  const [currentView, setCurrentView] = useState<"hub" | "detailing">("hub");
  const [scrolled, setScrolled] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);
  const [activeReviewSlide, setActiveReviewSlide] = useState(0);

  const hubVideoRef = useRef<HTMLVideoElement>(null);
  const detailingHeroVideoRef = useRef<HTMLVideoElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  const reviewsRef = useRef<HTMLDivElement>(null);
  const serviceVideoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  const serviciosList =
    biz.servicios && biz.servicios.length > 0 ? biz.servicios : DI_LORENZO_SERVICIOS;

  const instagramHandle = biz.instagram ? biz.instagram.replace("@", "") : "dilorenzodetailing";
  const igUrl = `https://instagram.com/${instagramHandle}`;

  // Función para posicionar la pantalla de modo que la card entera sea visible sin que la tape la barra superior
  const scrollToServicesContainer = useCallback(() => {
    const carouselEl = document.getElementById("servicios-carrusel");
    if (carouselEl) {
      // Offset de 60px para dejar espacio limpio abajo de la barra flotante
      const yOffset = -60;
      const y = carouselEl.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  }, []);

  const scrollToCardIndex = useCallback((index: number, behavior: ScrollBehavior = "smooth") => {
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
      behavior,
    });
    setActiveSlide(clampedIndex);
  }, []);

  // Sincronización de hash y query params para Google Ads, navegación instantánea y botón volver
  useEffect(() => {
    const handleHashAndQuery = () => {
      const hash = window.location.hash.toLowerCase().replace("#", "").trim();
      const urlParams = new URLSearchParams(window.location.search);
      const queryParam = (
        urlParams.get("s") ||
        urlParams.get("servicio") ||
        urlParams.get("service") ||
        ""
      ).toLowerCase().trim();

      const targetKey = queryParam || hash;

      if (targetKey && targetKey in SERVICE_SLUG_MAP) {
        const targetIdx = SERVICE_SLUG_MAP[targetKey];
        setCurrentView("detailing");
        setActiveSlide(targetIdx);
        setTimeout(() => {
          scrollToServicesContainer();
          scrollToCardIndex(targetIdx, "smooth");
        }, 120);
        return;
      }

      if (
        hash === "detailing" ||
        hash === "servicios" ||
        hash.startsWith("optica") ||
        hash.startsWith("moto") ||
        hash.startsWith("abrillanta") ||
        hash.startsWith("ceramico") ||
        hash.startsWith("acrilico") ||
        hash.startsWith("tapizado") ||
        hash.startsWith("preventa")
      ) {
        setCurrentView("detailing");
        setTimeout(() => {
          scrollToServicesContainer();
        }, 120);
      } else if (hash === "hub" || hash === "inicio") {
        setCurrentView("hub");
      }
    };

    handleHashAndQuery();
    window.addEventListener("popstate", handleHashAndQuery);
    window.addEventListener("hashchange", handleHashAndQuery);
    return () => {
      window.removeEventListener("popstate", handleHashAndQuery);
      window.removeEventListener("hashchange", handleHashAndQuery);
    };
  }, [scrollToServicesContainer, scrollToCardIndex]);

  // Transición a la sub-web de Detailing y vista directa de la card entera
  const goToDetailing = () => {
    setCurrentView("detailing");
    window.history.pushState(null, "", "#detailing");
    setTimeout(() => {
      scrollToServicesContainer();
    }, 100);
  };

  // Volver al Hub de Di Lo Center
  const goToHub = () => {
    setCurrentView("hub");
    window.history.pushState(null, "", window.location.pathname);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Scroll detection para la navbar
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Videos autoplay helper
  useEffect(() => {
    const v1 = hubVideoRef.current;
    if (v1) {
      v1.defaultMuted = true;
      v1.muted = true;
      v1.setAttribute("muted", "");
      v1.setAttribute("playsinline", "true");
      v1.play().catch(() => {});
    }
    const v2 = detailingHeroVideoRef.current;
    if (v2) {
      v2.defaultMuted = true;
      v2.muted = true;
      v2.setAttribute("muted", "");
      v2.setAttribute("playsinline", "true");
      v2.play().catch(() => {});
    }
  }, [currentView]);

  // Intelligent Lazy Autoplay para videos de servicios: reproduce solo la card activa y pausa todas las demás
  useEffect(() => {
    if (currentView !== "detailing") {
      serviceVideoRefs.current.forEach((vid) => {
        if (vid && !vid.paused) {
          vid.pause();
        }
      });
      return;
    }

    serviceVideoRefs.current.forEach((vid, idx) => {
      if (!vid) return;
      if (idx === activeSlide) {
        vid.defaultMuted = true;
        vid.muted = true;
        vid.play().catch(() => {});
      } else {
        if (!vid.paused) {
          vid.pause();
        }
      }
    });
  }, [activeSlide, currentView]);

  // Centrado y navegación exacta del carrusel horizontal
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

  const scrollCarousel = (direction: "left" | "right") => {
    const nextIndex = direction === "right" ? activeSlide + 1 : activeSlide - 1;
    scrollToCardIndex(nextIndex);
  };

  const reviewsList = [
    {
      name: "Nicolas Alvarez",
      initial: "N",
      avatarBg: "bg-sky-600",
      meta: "14 opiniones",
      isLocalGuide: false,
      stars: 5,
      date: "Hace 2 años",
      comment:
        "Un groso Nacho. Le dejé el auto que estaba muy maltratado por rayones de lavadero. Me lo dejó nuevo mejor que 0km. Gracias!",
    },
    {
      name: "Matias Rosenstein",
      initial: "M",
      avatarBg: "bg-emerald-600",
      meta: "Local Guide · 31 opiniones",
      isLocalGuide: true,
      stars: 5,
      date: "Hace 3 años",
      comment: "Me dejó las ópticas como nuevas a muy buen precio",
    },
    {
      name: "Mariano Loccisano",
      initial: "M",
      avatarBg: "bg-purple-600",
      meta: "3 opiniones",
      isLocalGuide: false,
      stars: 5,
      date: "Hace 4 años",
      comment:
        "Excelente laburo! Le hice tratamiento cerámico a mi auto. Están pendiente de cada detalle, laburando con productos de marcas de primera calidad que hacen notar la calidad.",
    },
    {
      name: "Roberto Ismael Quiroga",
      initial: "R",
      avatarBg: "bg-blue-600",
      meta: "Local Guide · 232 opiniones",
      isLocalGuide: true,
      stars: 5,
      date: "Hace 5 años",
      comment: "Excelente trabajo sabe lo que hace",
    },
    {
      name: "Lucas Salazar",
      initial: "L",
      avatarBg: "bg-amber-600",
      meta: "11 opiniones",
      isLocalGuide: false,
      stars: 5,
      date: "Hace 2 años",
      comment: "Muy prolijo y amable. Podes ver todo el proceso. 100% recomendable",
    },
    {
      name: "Juan Derian (PARACUSTICO)",
      initial: "J",
      avatarBg: "bg-indigo-600",
      meta: "2 opiniones",
      isLocalGuide: false,
      stars: 5,
      date: "Hace 2 años",
      comment:
        "Es excelente el trato y el trabajo que realizan! Más que recomendable 1000 puntos!",
    },
    {
      name: "Wellington Peralta",
      initial: "W",
      avatarBg: "bg-teal-600",
      meta: "3 opiniones",
      isLocalGuide: false,
      stars: 5,
      date: "Hace 2 años",
      comment:
        "Súper trabajo confiable y quedo mejor de lo que pensaba. Gracias",
    },
    {
      name: "Eduardo Ernesto Fauroux",
      initial: "E",
      avatarBg: "bg-rose-600",
      meta: "Local Guide · 80 opiniones",
      isLocalGuide: true,
      stars: 5,
      date: "Hace 6 años",
      comment: "Buena atención, recomendable",
    },
  ];

  const handleReviewsScroll = () => {
    if (!reviewsRef.current) return;
    const container = reviewsRef.current;
    const cards = container.querySelectorAll<HTMLElement>(".review-card");
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

    setActiveReviewSlide(closestIndex);
  };

  const scrollReviewTo = (index: number) => {
    if (!reviewsRef.current) return;
    const container = reviewsRef.current;
    const cards = container.querySelectorAll<HTMLElement>(".review-card");
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
    setActiveReviewSlide(clampedIndex);
  };

  const scrollReviewBy = (direction: "left" | "right") => {
    const nextIndex = direction === "right" ? activeReviewSlide + 1 : activeReviewSlide - 1;
    scrollReviewTo(nextIndex);
  };

  const msgPresupuesto = `Hola! Quisiera pedir información o presupuesto en ${biz.nombre}.`;

  const stats = [
    biz.rating != null
      ? `★ ${biz.rating === 5 ? "5.0" : biz.rating.toFixed(1)} en Google (+40 opiniones)`
      : "★ 4.9 en Google (+40 opiniones)",
    "Garantía escrita",
    "Atención personalizada",
  ];

  return (
    <div className="min-h-screen bg-black text-white selection:bg-slate-500/30 selection:text-slate-200">
      {/* ============================================================== */}
      {/* VISTA 1: DI LO CENTER (Hub Principal)                          */}
      {/* ============================================================== */}
      {currentView === "hub" && (
        <>
          {/* 1. NAVBAR DI LO CENTER */}
          <div className="fixed top-0 left-0 right-0 z-50 flex justify-center px-3 pointer-events-none">
            <header
              className="w-full pointer-events-auto transition-[margin,border-radius,background-color,backdrop-filter,box-shadow] duration-300 ease-out"
              style={
                scrolled
                  ? {
                      marginTop: "12px",
                      maxWidth: "56rem",
                      borderRadius: "9999px",
                      background: "rgba(10,10,10,0.9)",
                      backdropFilter: "blur(14px)",
                      boxShadow: "0 8px 30px rgba(0,0,0,0.6)",
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
                <a href="#" onClick={(e) => { e.preventDefault(); goToHub(); }} className="flex items-center shrink-0 group py-1" aria-label="Inicio Di Lo Center">
                  <span className="text-sm sm:text-base font-bold tracking-widest text-slate-200">
                    DI LO <span className="text-slate-300">CENTER</span>
                  </span>
                </a>
                <div className="hidden md:flex items-center gap-7 text-xs uppercase tracking-widest text-slate-400">
                  <a href="#divisiones" className="hover:text-white transition-colors">Divisiones</a>
                  <a href="#opiniones" className="hover:text-white transition-colors">Opiniones</a>
                  <a href="#ubicacion" className="hover:text-white transition-colors">Ubicación</a>
                </div>
                <div className="flex items-center gap-3">
                  <a
                    href={igUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Instagram Di Lorenzo"
                    className="flex items-center justify-center size-8 rounded-full bg-white/5 hover:bg-white/10 text-pink-400 transition"
                  >
                    <FaInstagram className="size-4" />
                  </a>
                  <a
                    href={waHref(biz, msgPresupuesto)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider text-white hover:opacity-75 transition"
                  >
                    <FaWhatsapp className="size-4 text-emerald-400" />
                    <span>Contacto</span>
                  </a>
                </div>
              </div>
            </header>
          </div>

          {/* 2. HERO DI LO CENTER — CON H1 PLATEADO CORPÓREO 3D CON AIRE Y SEPARACIÓN */}
          <section id="divisiones" className="relative min-h-[95dvh] pt-24 sm:pt-28 pb-12 sm:pb-16 px-4 sm:px-6 overflow-hidden flex items-center justify-center bg-[#070707]">
            {/* Fondo oscuro de lujo con halo plateado sutil */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_90%_65%_at_50%_-10%,rgba(226,232,240,0.1),transparent_75%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.03),transparent_40%)]" />

            <div className="relative z-10 max-w-5xl mx-auto w-full flex flex-col justify-center items-center text-center px-2 py-4">
              {/* Badge Haedo */}
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full border border-slate-300/20 bg-slate-800/30 text-[11px] sm:text-xs font-semibold text-slate-300 mb-4 shadow-sm backdrop-blur-md">
                <span className="flex size-1.5 sm:size-2 rounded-full shrink-0 animate-pulse bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                <span>Haedo, Buenos Aires</span>
                <span className="text-slate-500">·</span>
                <span>Centro Integral Automotor</span>
              </div>

              {/* H1 CARTELERÍA 3D PLATEADA / CROMO PULIDO */}
              <div className="mt-4 sm:mt-6 mb-7 sm:mb-9 relative">
                <h1 className="text-4xl xs:text-5xl sm:text-7xl md:text-8xl font-black tracking-[0.08em] sm:tracking-[0.14em] uppercase text-center relative select-none">
                  <span
                    className="relative inline-block text-transparent bg-clip-text"
                    style={{
                      backgroundImage:
                        "linear-gradient(180deg, #ffffff 0%, #f1f5f9 20%, #e2e8f0 40%, #cbd5e1 65%, #94a3b8 85%, #64748b 100%)",
                      filter:
                        "drop-shadow(0 3px 0 #475569) drop-shadow(0 6px 0 #334155) drop-shadow(0 10px 1px #1e293b) drop-shadow(0 15px 24px rgba(0, 0, 0, 0.95)) drop-shadow(0 0 35px rgba(226, 232, 240, 0.4))",
                      WebkitTextStroke: "1px rgba(255, 255, 255, 0.6)",
                    }}
                  >
                    DI LO CENTER
                  </span>
                </h1>
              </div>

              {/* Subtítulo con más aire y separación */}
              <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto font-light leading-relaxed mb-10 sm:mb-12">
                Estética vehicular artesanal, compra-venta de unidades seleccionadas y mecánica integral. Seleccioná el área para tu vehículo:
              </p>

              {/* 3 PUBLICACIONES RECTANGULARES */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 w-full max-w-5xl mx-auto mb-8">
                {/* 1. Di Lorenzo Detailing (AL CLIQUEAR VA DIRECTO A SERVICIOS) */}
                <button
                  type="button"
                  onClick={goToDetailing}
                  className="group relative h-[380px] xs:h-[410px] sm:h-[440px] rounded-[28px] overflow-hidden border border-amber-400/50 hover:border-amber-400 transition-all duration-500 shadow-2xl shadow-amber-500/10 flex flex-col justify-end p-6 sm:p-7 text-center cursor-pointer active:scale-[0.98]"
                >
                  {/* Video en loop dentro de la publicación con brillo aumentado */}
                  <video
                    ref={hubVideoRef}
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 pointer-events-none filter brightness-110 contrast-105"
                    src={biz.video_hero ?? "/videos/hero-compilado-blanco.mp4"}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 via-55% to-transparent pointer-events-none" />

                  {/* Footer de la card 100% centrado (sin badge 'Activo' ni rayitos) */}
                  <div className="relative z-10 space-y-2 text-center w-full flex flex-col items-center">
                    <h2 className="font-extrabold text-2xl text-white group-hover:text-amber-300 transition-colors leading-tight drop-shadow-md text-center">
                      Di Lorenzo Detailing
                    </h2>
                    <p className="text-xs text-slate-200 leading-relaxed font-light text-center max-w-xs mx-auto">
                      Tratamientos cerámicos, abrillantado, pulido de ópticas, tapizados y PPF.
                    </p>
                    <div className="pt-2 flex justify-center w-full">
                      <span className="btn-gold inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg group-hover:shadow-amber-400/25 transition-all text-center">
                        <span>Entrar a Detailing</span>
                        <HiOutlineArrowRight className="size-3.5" />
                      </span>
                    </div>
                  </div>
                </button>

                {/* 2. Venta Automotor (PRÓXIMAMENTE) */}
                <div
                  className="relative h-[380px] xs:h-[410px] sm:h-[440px] rounded-[28px] overflow-hidden border border-white/10 flex flex-col justify-between p-6 text-left opacity-75 select-none"
                >
                  <img
                    src="/ec-detail/foto-1.jpg"
                    alt="Venta Automotor en Haedo"
                    className="absolute inset-0 w-full h-full object-cover filter brightness-[0.45] contrast-105 pointer-events-none"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/70 pointer-events-none" />

                  <div className="relative z-10 flex items-center justify-between">
                    <span className="text-[11px] uppercase font-bold tracking-widest text-slate-300 px-3 py-1 rounded-full bg-black/75 backdrop-blur-md border border-white/15">
                      Próximamente
                    </span>
                  </div>

                  <div className="relative z-10 space-y-2">
                    <h2 className="font-bold text-2xl text-slate-200 leading-tight">
                      Venta Automotor
                    </h2>
                    <p className="text-xs text-slate-400 leading-relaxed font-light">
                      Vehículos seminuevos seleccionados, peritados mecánicamente y consignaciones.
                    </p>
                    <div className="pt-2">
                      <span className="inline-flex items-center px-4 py-2 rounded-full text-xs font-semibold text-slate-400 bg-white/5 border border-white/10">
                        En preparación
                      </span>
                    </div>
                  </div>
                </div>

                {/* 3. Mecánica Ligera (PRÓXIMAMENTE) */}
                <div
                  className="relative h-[380px] xs:h-[410px] sm:h-[440px] rounded-[28px] overflow-hidden border border-white/10 flex flex-col justify-between p-6 text-left opacity-75 select-none"
                >
                  <img
                    src="/before-after/motor-despues.jpg"
                    alt="Mecánica Ligera en Haedo"
                    className="absolute inset-0 w-full h-full object-cover filter brightness-[0.45] contrast-105 pointer-events-none"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/70 pointer-events-none" />

                  <div className="relative z-10 flex items-center justify-between">
                    <span className="text-[11px] uppercase font-bold tracking-widest text-slate-300 px-3 py-1 rounded-full bg-black/75 backdrop-blur-md border border-white/15">
                      Próximamente
                    </span>
                  </div>

                  <div className="relative z-10 space-y-2">
                    <h2 className="font-bold text-2xl text-slate-200 leading-tight">
                      Mecánica Ligera
                    </h2>
                    <p className="text-xs text-slate-400 leading-relaxed font-light">
                      Service preventivo, fluidos, frenos, distribución y mantenimiento integral.
                    </p>
                    <div className="pt-2">
                      <span className="inline-flex items-center px-4 py-2 rounded-full text-xs font-semibold text-slate-400 bg-white/5 border border-white/10">
                        En preparación
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Social Proof Stats */}
              <div className="flex flex-wrap items-center justify-center gap-x-4 sm:gap-x-6 gap-y-1.5 pt-2 text-[11px] sm:text-xs text-slate-400">
                {stats.map((item) => (
                  <span key={item} className="inline-flex items-center gap-1.5">
                    <HiOutlineCheckCircle aria-hidden className="size-4 shrink-0 text-slate-300" />
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </section>

          {/* 3. RESEÑAS DE GOOGLE MAPS EN DI LO CENTER (FORMATO EXACTO GOOGLE MAPS DARK THEME) */}
          <section id="opiniones" className="px-4 sm:px-8 py-16 sm:py-20 border-t border-b border-white/5 bg-[#0d0d0d]">
            <div className="max-w-6xl mx-auto">
              {/* Header estilo Google Maps oficial */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-10 pb-8 border-b border-white/10">
                <div className="flex items-center gap-4 text-left">
                  {/* Logo Google Maps */}
                  <div className="size-14 sm:size-16 rounded-2xl bg-[#202124] border border-[#3c4043] flex items-center justify-center shadow-lg shrink-0">
                    <svg className="size-8" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs uppercase font-bold tracking-widest text-[#9aa0a6]">Google Maps</span>
                      <span className="size-1 rounded-full bg-[#9aa0a6]" />
                      <span className="text-xs text-emerald-400 font-semibold">Calificación Verificada</span>
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-3xl sm:text-4xl font-extrabold text-white">4.9</span>
                      <div>
                        <div className="flex items-center gap-1 text-[#fbbc04]">
                          {[...Array(5)].map((_, i) => (
                            <FaStar key={i} className="size-4 fill-[#fbbc04]" />
                          ))}
                        </div>
                        <p className="text-xs text-[#9aa0a6] mt-0.5">+40 opiniones en Google Maps</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <a
                    href={biz.maps_url || mapsHref(biz)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#202124] hover:bg-[#303134] text-xs font-semibold text-[#8ab4f8] border border-[#3c4043] transition shadow-md"
                  >
                    <svg className="size-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                    </svg>
                    <span>Ver en Google Maps</span>
                  </a>
                </div>
              </div>

              {/* Contenedor del Carrusel de Opiniones con Flechas laterales */}
              <div className="relative">
                {/* Flechas laterales para navegación de reseñas */}
                <button
                  type="button"
                  onClick={() => scrollReviewBy("left")}
                  aria-label="Opinión anterior"
                  className="hidden md:flex absolute -left-4 top-1/2 -translate-y-1/2 z-20 size-10 rounded-full bg-[#202124] hover:bg-[#303134] text-white border border-[#3c4043] items-center justify-center transition shadow-xl"
                >
                  <FaChevronLeft className="text-xs text-[#9aa0a6]" />
                </button>

                <button
                  type="button"
                  onClick={() => scrollReviewBy("right")}
                  aria-label="Siguiente opinión"
                  className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 z-20 size-10 rounded-full bg-[#202124] hover:bg-[#303134] text-white border border-[#3c4043] items-center justify-center transition shadow-xl"
                >
                  <FaChevronRight className="text-xs text-[#9aa0a6]" />
                </button>

                {/* Lista deslizable con formato idéntico a Google Maps */}
                <div
                  ref={reviewsRef}
                  onScroll={handleReviewsScroll}
                  className="flex gap-4 overflow-x-auto pb-4 pt-1 snap-x snap-mandatory scrollbar-none text-left"
                  style={{
                    scrollSnapType: "x mandatory",
                    WebkitOverflowScrolling: "touch",
                  }}
                >
                  {reviewsList.map((rev, idx) => (
                    <div
                      key={idx}
                      className="review-card rounded-[20px] p-5 sm:p-6 border border-[#3c4043]/80 shrink-0 w-[88vw] xs:w-[340px] sm:w-[360px] snap-center shadow-xl flex flex-col justify-between transition-all"
                      style={{ background: "#202124" }}
                    >
                      <div className="space-y-3">
                        {/* Header de la reseña: Avatar con inicial + Nombre + 3 puntitos */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className={`size-10 rounded-full ${rev.avatarBg} text-white font-bold flex items-center justify-center text-sm shadow-md shrink-0 select-none`}>
                              {rev.initial}
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <h3 className="font-medium text-sm text-[#e8eaed] leading-snug">
                                  {rev.name}
                                </h3>
                              </div>
                              <div className="flex items-center gap-1 mt-0.5">
                                {rev.isLocalGuide && (
                                  <span className="inline-flex items-center justify-center size-3.5 rounded-full bg-[#fbbc04] text-black text-[9px] font-black shrink-0 leading-none">
                                    ★
                                  </span>
                                )}
                                <span className="text-[11px] text-[#9aa0a6]">
                                  {rev.meta}
                                </span>
                              </div>
                            </div>
                          </div>
                          {/* 3 puntitos estilo Google */}
                          <span className="text-[#9aa0a6] text-lg select-none px-1">⋮</span>
                        </div>

                        {/* Estrellas y Fecha */}
                        <div className="flex items-center gap-2 pt-1">
                          <div className="flex items-center gap-0.5 text-[#fbbc04]">
                            {[...Array(rev.stars)].map((_, i) => (
                              <FaStar key={i} className="size-3.5 fill-[#fbbc04]" />
                            ))}
                          </div>
                          <span className="text-xs text-[#9aa0a6]">{rev.date}</span>
                        </div>

                        {/* Comentario de la reseña */}
                        <p className="text-xs sm:text-sm text-[#e8eaed] leading-relaxed font-normal pt-1">
                          {rev.comment}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Puntitos indicadores */}
                <div className="flex items-center justify-center gap-1.5 pt-4">
                  {reviewsList.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => scrollReviewTo(i)}
                      aria-label={`Ver opinión ${i + 1}`}
                      className={`transition-all duration-300 rounded-full ${
                        activeReviewSlide === i
                          ? "w-6 h-1.5 bg-[#8ab4f8]"
                          : "w-1.5 h-1.5 bg-white/20 hover:bg-white/40"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* 4. UBICACIÓN Y MAPA (CON BOTONES Y TEXTOS 100% CENTRADOS) */}
          <section id="ubicacion" className="px-5 sm:px-8 py-20 bg-black">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-10">
                <span className="section-badge mb-3">Ubicación</span>
                <h2 className="text-2xl sm:text-4xl font-medium text-slate-200 mb-2">Dónde Encontrarnos</h2>
                <p className="text-slate-400 text-xs sm:text-sm">Atención con turno previo en nuestro estudio de Haedo.</p>
              </div>

              <div className="grid md:grid-cols-2 gap-6 items-center">
                <div className="glass-panel rounded-[22px] p-6 space-y-4 border border-white/10 flex flex-col justify-between" style={{ background: "#101010" }}>
                  <div className="space-y-4">
                    <div className="flex items-start gap-4">
                      <FaMapMarkerAlt className="size-5 text-slate-300 shrink-0 mt-1" />
                      <div>
                        <h3 className="font-semibold text-white text-sm">Dirección</h3>
                        <p className="text-sm text-slate-300">{biz.direccion}</p>
                        <p className="text-xs text-slate-400">{biz.ciudad}, {biz.provincia}</p>
                      </div>
                    </div>

                    {biz.horario && (
                      <div className="flex items-start gap-4 pt-2 border-t border-white/5">
                        <FaClock className="size-5 text-slate-300 shrink-0 mt-1" />
                        <div>
                          <h3 className="font-semibold text-white text-sm">Horario</h3>
                          <p className="text-xs text-slate-300">{biz.horario}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Botones de acción 100% centrados */}
                  <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3 w-full border-t border-white/5">
                    <a
                      href={mapsHref(biz)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-outline-gold inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider text-center w-full sm:w-auto"
                    >
                      <FaMapMarkerAlt className="size-3.5" />
                      <span>Abrir en Google Maps</span>
                    </a>
                    <a
                      href={igUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full border border-pink-500/30 bg-pink-950/20 text-pink-300 hover:text-white text-xs font-semibold transition text-center w-full sm:w-auto"
                    >
                      <FaInstagram className="size-3.5" />
                      <span>Instagram</span>
                    </a>
                  </div>
                </div>

                {/* Mapa Embebido */}
                <div className="aspect-[4/3] rounded-[22px] overflow-hidden border border-white/10 relative" style={{ background: "#141414" }}>
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

          {/* 5. FOOTER DI LO CENTER */}
          <footer className="px-5 sm:px-8 py-10 border-t border-white/10 text-center text-xs text-slate-500 bg-[#080808]">
            <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
              <p>© {new Date().getFullYear()} Di Lo Center. Todos los derechos reservados.</p>
              <div className="flex items-center justify-center gap-5 text-slate-400">
                <a href={igUrl} target="_blank" rel="noopener noreferrer" className="hover:text-pink-400 flex items-center gap-1.5 transition">
                  <FaInstagram className="size-3.5 text-pink-400" />
                  <span>Instagram</span>
                </a>
                <span>•</span>
                <a href={mapsHref(biz)} target="_blank" rel="noopener noreferrer" className="hover:text-white transition">
                  Cómo llegar
                </a>
                <span>•</span>
                <a href={waHref(biz, msgPresupuesto)} target="_blank" rel="noopener noreferrer" className="hover:text-emerald-400 transition">
                  WhatsApp
                </a>
              </div>
            </div>
          </footer>
        </>
      )}

      {/* ============================================================== */}
      {/* VISTA 2: DI LORENZO DETAILING (Sub-web / Pestaña de Detailing)  */}
      {/* ============================================================== */}
      {currentView === "detailing" && (
        <>
          {/* 1. NAVBAR DEDICADA DE DETAILING (Con botón Volver a Di Lo Center) */}
          <div className="fixed top-0 left-0 right-0 z-50 flex justify-center px-3 pointer-events-none">
            <header className="w-full max-w-5xl pointer-events-auto mt-3 rounded-full bg-[#0a0a0a]/92 backdrop-blur-md border border-white/10 px-4 sm:px-6 h-14 flex items-center justify-between shadow-2xl">
              <button
                type="button"
                onClick={goToHub}
                className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400 hover:text-amber-300 transition active:scale-95 py-1 px-3 rounded-full bg-amber-400/10 border border-amber-400/20"
              >
                <FaArrowLeft className="size-3" />
                <span>Volver a Di Lo Center</span>
              </button>

              <span className="font-bold text-xs sm:text-sm text-white hidden xs:inline tracking-wider">
                DI LORENZO <span className="text-gold">DETAILING</span>
              </span>

              <div className="flex items-center gap-3">
                <a
                  href={igUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram Di Lorenzo"
                  className="flex items-center justify-center size-8 rounded-full bg-white/5 hover:bg-white/10 text-pink-400 transition"
                >
                  <FaInstagram className="size-4" />
                </a>
                <a
                  href={waHref(biz, "Hola! Quiero pedir presupuesto para un tratamiento de detailing en Di Lorenzo Detailing.")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider text-white hover:opacity-75 transition"
                >
                  <FaWhatsapp className="size-4 text-emerald-400" />
                  <span className="hidden sm:inline">Pedir Turno</span>
                </a>
              </div>
            </header>
          </div>

          {/* 2. HERO PRINCIPAL DE DETAILING CON VIDEO DE FONDO CINEMATOGRÁFICO */}
          <section className="relative min-h-[380px] sm:min-h-[440px] pt-24 sm:pt-28 pb-12 sm:pb-16 px-4 sm:px-6 overflow-hidden flex items-center justify-center bg-[#070707] border-b border-white/5">
            {/* Video de fondo en loop para la sub-web de Detailing con brillo aumentado */}
            <video
              ref={detailingHeroVideoRef}
              autoPlay
              muted
              loop
              playsInline
              className="absolute inset-0 w-full h-full object-cover opacity-75 filter brightness-110 contrast-105 pointer-events-none"
              src={biz.video_hero ?? "/videos/hero-compilado-blanco.mp4"}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/45 to-black/65 pointer-events-none" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.85)_100%)] pointer-events-none" />

            <div className="relative z-10 max-w-4xl mx-auto w-full text-center px-2 py-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-amber-400/30 bg-amber-950/30 text-[11px] sm:text-xs font-semibold text-amber-200 mb-3 backdrop-blur-md">
                <span className="flex size-1.5 rounded-full shrink-0 animate-pulse bg-emerald-400" />
                <span>Estudio Profesional de Estética Vehicular</span>
              </div>

              <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white mb-2 leading-tight">
                DI LORENZO <span className="text-gold">DETAILING</span>
              </h1>

              <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto font-light leading-relaxed mb-6">
                Tratamientos cerámicos, abrillantado artesanal, restauración de ópticas, limpieza profunda de tapizados y film de protección PPF en Haedo.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={scrollToServicesContainer}
                  className="btn-gold inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider shadow-lg active:scale-95 transition"
                >
                  <HiOutlineSparkles className="size-4" />
                  <span>Ver Servicios y Tarifas</span>
                </button>
                <a
                  href={waHref(biz, "Hola! Quiero consultar disponibilidad para un tratamiento en Di Lorenzo Detailing.")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-outline-gold inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider active:scale-95 transition"
                >
                  <FaWhatsapp className="size-4 text-emerald-400" />
                  <span>Presupuesto WhatsApp</span>
                </a>
              </div>
            </div>
          </section>

          {/* 3. NUESTROS SERVICIOS — CARDS AMPLIAS, ALTAS Y CINEMATOGRÁFICAS EN CARRUSEL HORIZONTAL */}
          <section id="servicios" className="px-3 sm:px-8 pt-12 pb-6 sm:pb-8 bg-black relative">
            <div className="max-w-7xl mx-auto">
              {/* Header de la sección limpio y sin textos redundantes */}
              <div className="text-center mb-5 max-w-2xl mx-auto">
                <h2 className="text-2xl sm:text-3xl font-medium text-gold">
                  Servicios & Tarifas en Haedo
                </h2>
              </div>

              {/* Indicador de posición y contador superior */}
              <div className="flex items-center justify-between max-w-4xl mx-auto mb-3 px-3">
                <span className="text-xs uppercase font-bold tracking-wider text-amber-300 flex items-center gap-2">
                  <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Servicio {activeSlide + 1} de {serviciosList.length}</span>
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => scrollCarousel("left")}
                    disabled={activeSlide === 0}
                    aria-label="Servicio anterior"
                    className="size-8 rounded-full bg-[#141414] hover:bg-[#252525] disabled:opacity-30 disabled:cursor-not-allowed border border-white/15 flex items-center justify-center text-amber-300 transition active:scale-95"
                  >
                    <FaChevronLeft className="size-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => scrollCarousel("right")}
                    disabled={activeSlide === serviciosList.length - 1}
                    aria-label="Siguiente servicio"
                    className="size-8 rounded-full bg-[#141414] hover:bg-[#252525] disabled:opacity-30 disabled:cursor-not-allowed border border-white/15 flex items-center justify-center text-amber-300 transition active:scale-95"
                  >
                    <FaChevronRight className="size-3" />
                  </button>
                </div>
              </div>

              {/* Contenedor del Carrusel Horizontal (con cards altas y amplias preparadas para video) */}
              <div id="servicios-carrusel" className="relative pt-1">
                {/* Flecha Izquierda lateral flotante (a media altura del video, sin chocar con nada) */}
                <button
                  type="button"
                  onClick={() => scrollCarousel("left")}
                  aria-label="Servicio anterior"
                  className="absolute left-1 xs:left-2 sm:-left-3 lg:-left-5 top-[35%] -translate-y-1/2 z-30 size-11 sm:size-12 rounded-full bg-black/85 hover:bg-black text-white border border-white/20 hover:border-amber-400/50 flex items-center justify-center transition-all active:scale-90 shadow-[0_4px_25px_rgba(0,0,0,0.9)] backdrop-blur-md"
                >
                  <FaChevronLeft className="text-sm sm:text-base text-amber-300" />
                </button>

                {/* Flecha Derecha lateral flotante (alejada del botón flotante inferior de WhatsApp) */}
                <button
                  type="button"
                  onClick={() => scrollCarousel("right")}
                  aria-label="Siguiente servicio"
                  className="absolute right-1 xs:right-2 sm:-right-3 lg:-right-5 top-[35%] -translate-y-1/2 z-30 size-11 sm:size-12 rounded-full bg-black/85 hover:bg-black text-white border border-white/20 hover:border-amber-400/50 flex items-center justify-center transition-all active:scale-90 shadow-[0_4px_25px_rgba(0,0,0,0.9)] backdrop-blur-md"
                >
                  <FaChevronRight className="text-sm sm:text-base text-amber-300" />
                </button>

                {/* Contenedor deslizante horizontal con snap exacto */}
                <div
                  ref={carouselRef}
                  onScroll={handleCarouselScroll}
                  className="flex gap-4 sm:gap-6 overflow-x-auto pb-4 pt-1 scroll-smooth snap-x snap-mandatory scrollbar-none px-2 sm:px-4"
                  style={{
                    scrollSnapType: "x mandatory",
                    WebkitOverflowScrolling: "touch",
                  }}
                >
                  {serviciosList.map((s, idx) => {
                    const reservaMsg = `Hola! Me gustaría pedir información o presupuesto para el servicio: ${s.nombre} en Di Lorenzo Detailing.`;
                    const imgSource = s.img ?? "/servicios/exterior.jpg";
                    const hasVideo = Boolean(s.video);
                    const cardSlug = SERVICE_SLUGS[idx] || `servicio-${idx}`;

                    return (
                      <div
                        key={`${s.nombre}-${idx}`}
                        id={cardSlug}
                        className="service-card product-card rounded-[32px] overflow-hidden flex flex-col justify-end relative border border-white/15 hover:border-amber-400/50 transition-all duration-300 w-[92vw] xs:w-[410px] sm:w-[460px] md:w-[490px] lg:w-[520px] min-h-[580px] xs:min-h-[620px] sm:min-h-[650px] shrink-0 snap-center shadow-2xl"
                        style={{ background: "#0c0c0c" }}
                      >
                        {/* Video Reel o Foto de Fondo con brillo aumentado y sin oscuridad */}
                        {hasVideo ? (
                          <video
                            ref={(el) => {
                              serviceVideoRefs.current[idx] = el;
                            }}
                            src={s.video}
                            playsInline
                            muted
                            loop
                            preload="metadata"
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 pointer-events-none filter brightness-110 contrast-105"
                          />
                        ) : (
                          <img
                            src={s.img || imgSource}
                            alt={s.nombre}
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 pointer-events-none filter brightness-105 contrast-105"
                            loading="lazy"
                          />
                        )}

                        {/* Sombra inferior suave únicamente detrás del título y botón para que no tape el video */}
                        <div className="absolute bottom-0 left-0 right-0 h-44 bg-gradient-to-t from-black via-black/60 to-transparent pointer-events-none z-10" />

                        {/* Bloque inferior compacto: Título, Precio y Botón WhatsApp sin tapar el video */}
                        <div className="relative z-20 p-5 sm:p-6 flex flex-col gap-2.5 text-center w-full">
                          <div className="space-y-1">
                            <h3
                              className="font-bold text-lg sm:text-xl text-white leading-tight drop-shadow-md"
                              style={{ textTransform: "none", fontFamily: "inherit" }}
                            >
                              {s.nombre}
                            </h3>
                            {s.precio && s.precio.trim() ? (
                              <p className="text-base sm:text-lg font-black text-gold drop-shadow">{s.precio}</p>
                            ) : null}
                          </div>

                          <div className="pt-1.5 w-full flex justify-center">
                            <a
                              href={waHref(biz, reservaMsg)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn-gold inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full text-xs font-bold uppercase tracking-wider shadow-2xl active:scale-95 transition text-center w-full max-w-[340px]"
                            >
                              <FaWhatsapp aria-hidden className="size-4 text-emerald-950 shrink-0" />
                              <span className="text-black font-extrabold text-center">Pedir Presupuesto por WhatsApp</span>
                            </a>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Indicador de puntitos 100% centrado abajo */}
                <div className="flex items-center justify-center pt-5">
                  <div className="flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-full bg-black/70 border border-white/10 backdrop-blur-md shadow-lg">
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
                </div>
              </div>

              {/* BANNER INSTAGRAM: VER TRABAJOS REALES (SIN ESPACIO NEGRO RESIDUAL ABAJO) */}
              <div className="rounded-[28px] p-6 sm:p-10 border border-pink-500/25 bg-gradient-to-br from-zinc-950 via-[#140e1a] to-black relative overflow-hidden mt-10 sm:mt-12 mb-0 shadow-2xl">
                <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-pink-500/10 via-purple-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
                  <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-400 text-xs font-bold uppercase tracking-wider mb-3">
                      <FaInstagram />
                      <span>@{instagramHandle}</span>
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                      Mirá Nuestros Trabajos Reales en Instagram
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
                      Seguinos para ver el proceso en vivo de cada tratamiento, reels del paso a paso de pulido y fotos en alta resolución de los autos recién entregados.
                    </p>
                  </div>
                  <a
                    href={igUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-full text-xs sm:text-sm font-bold uppercase tracking-wider text-white bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 hover:opacity-90 shadow-xl shadow-pink-600/20 active:scale-95 transition-all text-center"
                  >
                    <FaInstagram className="text-base" />
                    <span>Ver Trabajos Reales</span>
                  </a>
                </div>
              </div>
            </div>
          </section>

          {/* 4. UBICACIÓN DETAILING (CON TRANSICIÓN COMPACTA Y SIN HUECOS NEGROS) */}
          <section id="ubicacion" className="px-5 sm:px-8 pt-10 sm:pt-14 pb-16 sm:pb-20 bg-black border-t border-white/5">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-10">
                <span className="section-badge mb-3">Ubicación</span>
                <h2 className="text-2xl sm:text-4xl font-medium text-gold mb-2">Dónde Encontrarnos</h2>
                <p className="text-slate-400 text-xs sm:text-sm">Atención con turno previo en nuestro estudio de Haedo.</p>
              </div>

              <div className="grid md:grid-cols-2 gap-6 items-center">
                <div className="glass-panel rounded-[22px] p-6 space-y-4 border border-white/10 flex flex-col justify-between" style={{ background: "#101010" }}>
                  <div className="space-y-4">
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
                  </div>

                  {/* Botones de acción 100% centrados */}
                  <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3 w-full border-t border-white/5">
                    <a
                      href={mapsHref(biz)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-outline-gold inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider text-center w-full sm:w-auto"
                    >
                      <FaMapMarkerAlt className="size-3.5" />
                      <span>Abrir en Google Maps</span>
                    </a>
                    <a
                      href={igUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full border border-pink-500/30 bg-pink-950/20 text-pink-300 hover:text-white text-xs font-semibold transition text-center w-full sm:w-auto"
                    >
                      <FaInstagram className="size-3.5" />
                      <span>Instagram</span>
                    </a>
                  </div>
                </div>

                <div className="aspect-[4/3] rounded-[22px] overflow-hidden border border-white/10 relative" style={{ background: "#141414" }}>
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

          {/* 5. FOOTER DETAILING */}
          <footer className="px-5 sm:px-8 py-10 border-t border-white/10 text-center text-xs text-slate-500 bg-[#080808]">
            <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
              <p>© {new Date().getFullYear()} Di Lorenzo Detailing. Todos los derechos reservados.</p>
              <div className="flex items-center justify-center gap-5 text-slate-400">
                <button type="button" onClick={goToHub} className="hover:text-amber-400 font-semibold transition">
                  ← Di Lo Center
                </button>
                <span>•</span>
                <a href={igUrl} target="_blank" rel="noopener noreferrer" className="hover:text-pink-400 flex items-center gap-1.5 transition">
                  <FaInstagram className="size-3.5 text-pink-400" />
                  <span>Instagram</span>
                </a>
                <span>•</span>
                <a href={mapsHref(biz)} target="_blank" rel="noopener noreferrer" className="hover:text-white transition">
                  Cómo llegar
                </a>
              </div>
            </div>
          </footer>
        </>
      )}

      {/* WhatsApp Flotante permanente */}
      <a
        href={waHref(
          biz,
          currentView === "detailing"
            ? "Hola! Quisiera consultar por un turno de estética vehicular en Di Lorenzo Detailing."
            : "Hola! Me comunico desde la web de Di Lo Center para hacer una consulta."
        )}
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
