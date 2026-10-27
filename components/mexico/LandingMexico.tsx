"use client";

import { useEffect, useRef, useState } from "react";
import { FaWhatsapp, FaMapMarkerAlt, FaStar, FaClock } from "react-icons/fa";
import { HiOutlineCheckCircle, HiOutlineSparkles, HiShieldCheck } from "react-icons/hi2";
import type { Business, ServiceItem } from "@/data/business-helpers";
import { waHref, mapsHref } from "@/data/business-helpers";
import SectionDivider from "@/components/SectionDivider";
import CompareSlider from "@/components/CompareSlider";
import PpfColorVisualizer from "@/components/PpfColorVisualizer";

// Servicios estándar para México con precios de referencia en Pesos Mexicanos ($ MXN) y modismos de México
export const SERVICIOS_MEXICO: ServiceItem[] = [
  {
    nombre: "Estética & Detallado de Motor",
    descripcion: "Limpieza técnica profunda de la bahía del motor con vapor controlado y desengrasantes dieléctricos seguros. Nutrición y abrillantado de mangueras y plásticos con terminado satinado original libre de siliconas grasosas.",
    ideal_si: "Recuperar el aspecto de agencia bajo el cofre y proteger plásticos y mangueras.",
    precio: "Desde $1,300 MXN",
    proteccion: "Acondicionado Dieléctrico de Plásticos",
    antes_img: "/before-after/motor-antes.jpg",
    despues_img: "/before-after/motor-despues.jpg",
  },
  {
    nombre: "Tratamiento Cerámico 9H",
    descripcion: "Recubrimiento nanotecnológico de alta dureza. Otorga un brillo cristalino espectacular, extrema repelencia al agua y suciedad (hidrofobia), y protección UV contra la radiación solar y lluvia ácida.",
    ideal_si: "Conserva la pintura impecable, repele agua y polvo, y facilita enormemente el lavado.",
    precio: "Desde $4,800 MXN",
    proteccion: "Brillo Espejo & Máxima Hidrofobia",
    antes_img: "/servicios/ceramico-antes.png",
    despues_img: "/servicios/ceramico-despues.png",
  },
  {
    nombre: "PPF Brillante | Paint Protection Film",
    descripcion: "Película de poliuretano autorregenerable de alto impacto con terminado Gloss brillante. Protege la pintura original contra impactos de grava en carretera, rayones y rayos UV, conservando la máxima profundidad de color.",
    ideal_si: "Película autorregenerable con calor · Cobertura para frente o carrocería completa.",
    precio: "Desde $9,500 MXN",
    proteccion: "Protección Física de Alto Impacto",
    antes_img: "/servicios/ppf-brilloso-antes.png",
    despues_img: "/servicios/ppf-brilloso-despues.png",
  },
  {
    nombre: "PPF Mate | Paint Protection Film",
    descripcion: "Película autorregenerable de terminado satinado mate. Transforma el color original de tu auto en un acabado mate exclusivo y protector sin tocar la pintura de fábrica.",
    ideal_si: "Transformación a terminado mate satinado elegante con protección física contra piedras y rayones.",
    precio: "Consultar Presupuesto",
    proteccion: "Acabado Mate Satinado Protector",
    antes_img: "/servicios/ppf-mate-antes.png",
    despues_img: "/servicios/ppf-mate-despues.png",
  },
  {
    nombre: "PPF Color | Paint Protection Film",
    descripcion: "Película autorregenerable de protección con pigmentos de color de alta calidad. Cambia el color de tu auto al tono que prefieras mientras proteges la pintura original contra piedras y arañazos.",
    ideal_si: "Cambio de color con protección autorregenerable de alto impacto.",
    precio: "Consultar Presupuesto",
    proteccion: "Personalización & Protección Total",
    antes_img: "/servicios/ppf-color-antes.png",
    despues_img: "/servicios/ppf-color-despues.png",
  },
  {
    nombre: "Detallado Interior & Vestiduras",
    descripcion: "Desinfección integral de cabina con vapor seco: extracción profunda en vestiduras de tela o tratamiento nutritivo para asientos de piel, alfombras, cielo, ductos de aire y plásticos.",
    ideal_si: "Recuperar la textura, aroma y sensación de auto limpio y cuidado a detalle.",
    precio: "Desde $1,900 MXN",
    proteccion: "Desinfección & Acondicionado",
    antes_img: "/servicios/limpieza-tapizado-antes.png",
    despues_img: "/servicios/limpieza-tapizado-despues.png",
  },
  {
    nombre: "Reparación de Vestiduras & Piel",
    descripcion: "Restauración especializada de asientos y volantes de piel o tela. Reparación de roturas, grietas, desgaste de uso y quemaduras devolviendo el color y textura original.",
    ideal_si: "Solución para roturas, quemaduras o desgaste en asientos y volantes.",
    precio: "Cotización Previa",
    proteccion: "Restauración de Vestiduras",
    antes_img: "/servicios/reparacion-tapizado-antes.png",
    despues_img: "/servicios/reparacion-tapizado-despues.png",
  },
  {
    nombre: "Película de Control Solar & Cerámica",
    descripcion: "Película de control solar con tecnología cerámica para cristales. Reduce drásticamente la temperatura en cabina y filtra los rayos UV sin afectar la claridad óptica.",
    ideal_si: "Rechazo de calor, protección solar para interiores y mayor privacidad.",
    precio: "Desde $2,400 MXN",
    proteccion: "Control Térmico & Filtro UV",
    antes_img: "/servicios/polarizado-antes.png",
    despues_img: "/servicios/polarizado-despues.png",
  },
  {
    nombre: "Reparación de Abolladuras (PDR)",
    descripcion: "Técnica artesanal de varillero para eliminar abolladuras, portazos de estacionamiento y daños por granizo sin necesidad de hojalatería tradicional ni repintar el auto.",
    ideal_si: "Reparar golpes manteniendo la pintura y el valor comercial original de agencia.",
    precio: "Presupuesto y Cita Previa",
    proteccion: "100% Pintura Original de Fábrica",
    antes_img: "/servicios/sacabollos-antes.png",
    despues_img: "/servicios/sacabollos-despues.png",
  },
];

const ITEMS_PROBLEMA_MEXICO = [
  "Microrrayones circulares (swirls) por rodillos de autolavado o franelas con arena",
  "Pintura opaca que ha perdido el brillo y profundidad de agencia",
  "Marcas de lluvia ácida, sarro, resina o heces de ave incrustadas",
  "Vestiduras con manchas difíciles o pérdida del tono original",
  "Plásticos interiores y molduras resecas o blanquecinas por el sol",
  "Asientos de piel reseca, agrietada o con brillo grasoso de suciedad",
];

export default function LandingMexico({ biz }: { biz: Business }) {
  const [scrolled, setScrolled] = useState(false);
  const [ppfMode, setPpfMode] = useState<"slider" | "visualizer">("slider");
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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
            // Autoplay blocked by browser until user gesture
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

  const brandParts = (biz.nombre || "").trim().toUpperCase().split(" ");
  const primeraPalabra = brandParts[0] || "";
  const nombreResto = brandParts.slice(1).join(" ");

  const isTheZone =
    biz.slug === "the-zone-car-autospa-detailing" ||
    biz.slug === "thezone" ||
    biz.slug === "the-zone" ||
    Boolean(biz.nombre && biz.nombre.toLowerCase().includes("the zone"));

  const badgeClass = isTheZone ? "section-badge-thezone" : "section-badge";

  const msgPresupuesto = `Hola! Quisiera pedir información o cotización para mi auto en ${biz.nombre}.`;
  const msgFotos = `Hola! Les mando unas fotos de mi auto para que me asesoren sobre qué tratamiento le conviene más en ${biz.nombre}.`;

  const stats = [
    biz.rating != null
      ? `★ ${biz.rating === 5 ? "5.0" : biz.rating.toFixed(1)} en Google${biz.reviews_count != null ? ` (${biz.reviews_count} opiniones)` : ""}`
      : "★ 5.0 en Google",
    "Garantía por escrito",
    "Atención personalizada",
  ];

  return (
    <div className={`min-h-screen bg-black text-white ${isTheZone ? "selection:bg-blue-600/40 selection:text-sky-100" : "selection:bg-amber-500/30 selection:text-amber-200"}`}>
      {/* 1. NAVBAR */}
      <div className="fixed top-0 left-0 right-0 z-50 flex justify-center px-3 pointer-events-none">
        <header
          className="w-full pointer-events-auto transition-[margin,border-radius,background-color,backdrop-filter,box-shadow] duration-300 ease-out"
          style={
            scrolled
              ? {
                  marginTop: "12px",
                  maxWidth: "56rem",
                  borderRadius: "9999px",
                  background: isTheZone ? "rgba(8,12,20,0.88)" : "rgba(10,10,10,0.85)",
                  backdropFilter: "blur(14px)",
                  boxShadow: isTheZone ? "0 8px 30px rgba(0,102,255,0.25)" : "0 8px 30px rgba(0,0,0,0.45)",
                  border: isTheZone ? "1px solid rgba(56,189,248,0.25)" : "1px solid rgba(255,255,255,0.08)",
                }
              : {
                  marginTop: "0px",
                  maxWidth: "100%",
                  borderRadius: "0px",
                  background: "transparent",
                }
          }
        >
          <div className={`max-w-6xl mx-auto flex items-center justify-between px-4 sm:px-8 transition-[height] duration-300 ${scrolled ? "h-14" : (isTheZone ? "h-16 sm:h-20" : "h-16")}`}>
            {isTheZone ? (
              <a href="#hero" className="flex items-center shrink-0 group transition-transform active:scale-95 py-1" aria-label="Ir al inicio">
                <img
                  src="/logo/the-zone-logo.png"
                  alt={biz.nombre}
                  className="h-11 sm:h-14 md:h-16 w-auto object-contain transition-transform group-hover:scale-105 drop-shadow-[0_4px_16px_rgba(0,102,255,0.45)]"
                />
              </a>
            ) : (
              <a href="#hero" className="text-base font-bold tracking-widest text-white">
                {nombreResto ? (
                  <>
                    {`${primeraPalabra} `}
                    <span className="text-gold">{nombreResto}</span>
                  </>
                ) : (
                  primeraPalabra
                )}
              </a>
            )}
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
              className={`inline-flex items-center gap-2 text-xs uppercase tracking-widest ${isTheZone ? "text-sky-300 hover:text-white" : "text-white hover:opacity-70"} transition-opacity`}
            >
              <FaWhatsapp aria-hidden className={`size-4 ${isTheZone ? "text-sky-400" : "text-emerald-400"}`} />
              Agendar Cita
            </a>
          </div>
        </header>
      </div>

      {/* 2. HERO */}
      <section id="hero" className={`relative min-h-[100dvh] lg:h-dvh ${isTheZone ? "pt-16 sm:pt-20 lg:pt-24 pb-8 lg:pb-0" : "pt-24 pb-12 lg:pb-0"} px-4 sm:px-6 overflow-x-clip flex items-center`}>
        {(!isTheZone && biz.fotos && biz.fotos.length > 0) ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={biz.fotos[0]}
            alt={biz.nombre}
            className="absolute inset-0 w-full h-full object-cover opacity-35 contrast-110 pointer-events-none"
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
            className="absolute inset-0 w-full h-full object-cover opacity-65 contrast-105 pointer-events-none"
            src={biz.video_hero ?? "/videos/hero-compilado-blanco.mp4"}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/70" />

        {/* Ambient Blue Halo for The Zone */}
        {isTheZone && (
          <div
            className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[480px] rounded-full pointer-events-none blur-[110px] opacity-40"
            style={{ background: "radial-gradient(circle, #0066ff 0%, #00d0ff 35%, transparent 70%)" }}
          />
        )}

        <div className="relative z-10 max-w-6xl mx-auto w-full h-full flex items-center justify-center">
          <div className={`max-w-3xl text-center ${isTheZone ? "space-y-3 sm:space-y-4 py-3 sm:py-6 lg:py-8" : "space-y-5 py-12 lg:py-8"} mx-auto`}>
            {/* Logo oficial centrado para The Zone (agrandado y dominante) */}
            {isTheZone && (
              <div className="flex justify-center mb-2 sm:mb-4 -mt-2 sm:-mt-4">
                <img
                  src="/logo/the-zone-logo.png"
                  alt={biz.nombre}
                  className="h-44 sm:h-56 md:h-64 lg:h-72 w-auto object-contain drop-shadow-[0_20px_50px_rgba(0,102,255,0.6)] transition-transform hover:scale-105"
                />
              </div>
            )}

            <div className={`inline-flex items-center gap-2 ${isTheZone ? "px-2.5 py-1 text-[11px] sm:text-xs" : "px-3 py-1.5 text-xs sm:text-sm"} rounded-full border ${isTheZone ? "border-sky-500/30 bg-sky-500/10 text-sky-200" : "border-white/10 bg-white/5 text-slate-300"} font-medium`}>
              <span className={`flex size-1.5 sm:size-2 rounded-full shrink-0 animate-pulse ${isTheZone ? "bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.9)]" : "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]"}`} />
              <span>{biz.ciudad} (México)</span>
              <span className="text-slate-500">·</span>
              <span>Citas disponibles esta semana</span>
            </div>

            <h1 className={`${isTheZone ? "text-[20px] sm:text-[26px] md:text-[30px]" : "text-[32px] sm:text-[42px]"} font-medium tracking-tight leading-tight text-balance`}>
              {isTheZone ? (
                <>
                  Estética y Detallado Automotriz en San Luis Potosí.
                  <br />
                  <span className="text-thezone">Protección y Brillo de Nivel Premium.</span>
                </>
              ) : (
                <>
                  Detailing Profesional a Mano,
                  <br />
                  <span className="text-gold">Acabado de Exposición.</span>
                </>
              )}
            </h1>

            <p className={`${isTheZone ? "text-xs sm:text-sm max-w-xl line-clamp-2 sm:line-clamp-none" : "text-base md:text-lg max-w-2xl"} text-slate-300 font-light leading-relaxed mx-auto text-pretty`}>
              Corrección de pintura, recubrimiento cerámico y estética interior en {biz.ciudad}. Tratamiento artesanal sin microrrayones ni atajos.
            </p>

            <div className={`flex flex-col sm:flex-row items-center justify-center gap-2.5 sm:gap-3 w-full sm:w-auto ${isTheZone ? "pt-1 sm:pt-2" : "pt-2"}`}>
              <a
                href={waHref(biz, msgPresupuesto)}
                target="_blank"
                rel="noopener noreferrer"
                className={`${isTheZone ? "btn-thezone" : "btn-gold"} group w-full sm:w-auto px-6 sm:px-7 py-2.5 sm:py-3.5 min-h-[42px] sm:min-h-[44px] rounded-full text-xs sm:text-sm font-semibold uppercase tracking-wide active:scale-95 transition-[transform,filter,box-shadow] duration-150 flex items-center justify-center gap-2.5`}
              >
                <FaWhatsapp aria-hidden className="size-4" />
                Cotizar por WhatsApp
              </a>
              <a
                href="#servicios"
                className={`${isTheZone ? "btn-outline-thezone" : "btn-outline-gold"} text-nowrap group w-full sm:w-auto px-6 sm:px-7 py-2.5 sm:py-3.5 min-h-[42px] sm:min-h-[44px] rounded-full text-xs sm:text-sm font-semibold uppercase active:scale-95 flex items-center justify-center gap-2.5`}
              >
                <HiOutlineSparkles aria-hidden className="size-4" />
                Ver Servicios
              </a>
            </div>

            <div className={`flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5 ${isTheZone ? "pt-1" : "pt-2"}`}>
              {stats.map((item) => (
                <span key={item} className={`inline-flex items-center gap-1.5 ${isTheZone ? "text-[11px] sm:text-xs" : "text-xs sm:text-sm"} text-slate-300`}>
                  <HiOutlineCheckCircle aria-hidden className={`size-3.5 sm:size-4 shrink-0 ${isTheZone ? "text-sky-400" : "text-gold"}`} />
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 3. PROBLEMA VS SOLUCIÓN */}
      <section className="relative px-5 sm:px-8 py-20" style={{ background: "#101010" }}>
        <SectionDivider edge="top" />
        <div className="max-w-3xl mx-auto text-center">
          <span className={`${badgeClass} mb-5`}>El problema real</span>
          <h2 className={`text-3xl md:text-4xl font-medium ${isTheZone ? "text-thezone" : "text-gold"} mb-3`}>Lavar el Auto no es lo Mismo que un Detailing</h2>
          <p className="text-slate-400 max-w-xl mx-auto mb-10">
            Un auto puede salir limpio de un autolavado convencional y seguir viéndose opaco o rayado. Señales habituales:
          </p>
          <div className="grid sm:grid-cols-2 gap-3 text-left max-w-xl mx-auto">
            {ITEMS_PROBLEMA_MEXICO.map((item) => (
              <div key={item} className="glass-panel rounded-2xl px-4 py-3 flex items-start gap-3 border border-white/10">
                <span className="shrink-0 w-1.5 h-1.5 rounded-full mt-2" style={{ backgroundColor: isTheZone ? "#38bdf8" : "#b8c2cc" }} />
                <p className="text-sm text-slate-300">{item}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Fotos reales del taller si las tiene */}
        {biz.fotos && biz.fotos.length > 0 && (
          <div className="max-w-6xl mx-auto mt-16">
            <div className="text-center mb-8">
              <span className={`${badgeClass} mb-4`}>Nuestro trabajo</span>
              <h3 className={`text-2xl md:text-3xl font-medium ${isTheZone ? "text-thezone" : "text-gold"}`} style={{ textTransform: "none", fontFamily: "inherit" }}>
                Así trabajamos en {biz.nombre}
              </h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {biz.fotos.slice(0, 8).map((src, i) => (
                <div key={`${src}-${i}`} className="product-card rounded-[20px] overflow-hidden aspect-square border border-white/10" style={{ background: "#141414" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt={`${biz.nombre} — trabajo ${i + 1}`} className="w-full h-full object-cover" loading="lazy" />
                </div>
              ))}
            </div>
          </div>
        )}
        <SectionDivider edge="bottom" shape="asymmetric" />
      </section>

      {/* 4. SERVICIOS CON SLIDERS INTERACTIVOS DE ANTES Y DESPUÉS ($ MXN) */}
      <section id="servicios" className="px-5 sm:px-8 py-24 bg-black">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14 max-w-2xl mx-auto">
            <span className={`${badgeClass} mb-5`}>Nuestros servicios</span>
            <h2 className={`text-3xl md:text-5xl font-medium ${isTheZone ? "text-thezone" : "text-gold"} mb-4`}>Servicios & Tarifas en {biz.ciudad}</h2>
            <p className="text-slate-400">
              Desliza sobre cada trabajo para comparar los resultados reales. Estética de motor, tratamiento cerámico, protección PPF, vestiduras y más.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-6 max-w-7xl mx-auto">
            {((biz.servicios && biz.servicios.length > 0) ? biz.servicios : SERVICIOS_MEXICO).map((s, idx) => {
              const reservaMsg = `Hola! Me gustaría pedir información o cotización para el servicio: ${s.nombre} en ${biz.nombre}.`;
              const imgSource = s.img ?? "/servicios/exterior.jpg";
              const isPpfColor = s.nombre.toLowerCase().includes("ppf color");

              return (
                <div
                  key={`${s.nombre}-${idx}`}
                  className={`product-card rounded-[24px] overflow-hidden flex flex-col relative border ${isTheZone ? "border-sky-500/20 hover:border-sky-500/50 hover:shadow-[0_10px_30px_rgba(0,102,255,0.2)]" : "border-white/10 hover:border-white/25"} transition w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] max-w-md justify-between`}
                  style={{ background: isTheZone ? "rgba(10,14,24,0.95)" : "#101010" }}
                >
                  <div className="aspect-[4/3] overflow-hidden relative" style={{ background: "#141414" }}>
                    {isPpfColor && ppfMode === "visualizer" ? (
                      <PpfColorVisualizer biz={biz} />
                    ) : (s.modo_foto === "before_after" ? (s.antes_img || s.despues_img) : (s.antes_img && s.despues_img)) ? (
                      <CompareSlider
                        before={s.antes_img || s.despues_img || imgSource}
                        after={s.despues_img || s.antes_img || imgSource}
                        alt={s.nombre}
                        real
                        fit={s.foto_fit}
                        isTheZone={isTheZone}
                      />
                    ) : (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <div className="relative w-full h-full bg-[#0d0d0d] overflow-hidden">
                        {s.foto_fit === "contain" && (
                          <div
                            className="absolute inset-0 bg-cover bg-center filter blur-md opacity-35 scale-110"
                            style={{ backgroundImage: `url(${imgSource})` }}
                          />
                        )}
                        <img
                          src={imgSource}
                          alt={s.nombre}
                          className={`relative w-full h-full ${s.foto_fit === "contain" ? "object-contain p-2" : "object-cover"}`}
                        />
                      </div>
                    )}

                    {/* Botón interactivo para alternar entre Antes/Después y Visualizador 3D en PPF Color */}
                    {isPpfColor && (
                      <button
                        type="button"
                        onClick={() => setPpfMode((m) => (m === "slider" ? "visualizer" : "slider"))}
                        className="absolute top-2 right-2 z-30 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-md bg-black/85 border border-sky-400/50 text-sky-300 hover:text-white shadow-lg transition-transform active:scale-95 cursor-pointer"
                      >
                        {ppfMode === "slider" ? "🎨 Probar Colores 3D" : "↔ Ver Antes/Después"}
                      </button>
                    )}

                    {s.proteccion && (!isPpfColor || ppfMode === "slider") && (
                      <div
                        className="absolute bottom-2 left-2 right-2 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/15 text-[11px] font-semibold text-white/95 flex items-center gap-1.5 shadow-lg z-20 pointer-events-none"
                        style={{ background: "rgba(10,10,10,0.85)" }}
                      >
                        <span className={`size-1.5 rounded-full ${isTheZone ? "bg-sky-400" : "bg-emerald-400"} shrink-0`} />
                        <span>{s.proteccion}</span>
                      </div>
                    )}
                  </div>

                  <div className="p-5 flex flex-col gap-2 flex-1 justify-between">
                    <div className="space-y-2">
                      <h3 className="font-bold text-lg text-white leading-tight" style={{ textTransform: "none", fontFamily: "inherit" }}>
                        {s.nombre}
                      </h3>
                      <p className={`text-base font-extrabold ${isTheZone ? "text-thezone" : "text-gold"}`}>{s.precio}</p>
                      <p className="text-xs text-slate-300 leading-relaxed">{s.descripcion}</p>

                      {s.ideal_si && (
                        <p className="text-[11px] text-slate-400 pt-1">
                          <span className="font-semibold text-slate-300">Detalles:</span> {s.ideal_si}
                        </p>
                      )}
                    </div>

                    <a
                      href={waHref(biz, reservaMsg)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`${isTheZone ? "btn-outline-thezone" : "btn-outline-gold"} mt-4 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider`}
                    >
                      <FaWhatsapp aria-hidden className="size-3.5 text-emerald-400" />
                      Cotizar por WhatsApp
                    </a>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Banner de fotos y asesoramiento */}
          <div className="glass-panel rounded-[28px] mt-12 p-8 md:p-10 flex flex-col md:flex-row items-center gap-6 justify-between border border-white/10" style={{ background: "#101010" }}>
            <div>
              <span className={`${badgeClass} mb-3`}>¿Dudas sobre qué necesita tu auto?</span>
              <h3 className="font-semibold text-xl md:text-2xl mb-2 text-white" style={{ textTransform: "none", fontFamily: "inherit" }}>
                Mándanos 3 Fotos por WhatsApp y te Asesoramos
              </h3>
              <p className="text-sm text-slate-400 max-w-xl">
                Toma fotos del cofre, costado e interiores con buena luz. En {biz.nombre} te orientamos sin costo ni compromiso para elegir el tratamiento ideal.
              </p>
            </div>
            <a
              href={waHref(biz, msgFotos)}
              target="_blank"
              rel="noopener noreferrer"
              className={`${isTheZone ? "btn-thezone" : "btn-gold"} shrink-0 inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-sm font-semibold uppercase tracking-wide whitespace-nowrap`}
            >
              <FaWhatsapp aria-hidden className="size-4" />
              Enviar Fotos por WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* 6. GARANTÍA & COMPROMISO */}
      <section id="garantia" className="relative px-5 sm:px-8 pt-24 pb-32 sm:pb-36" style={{ background: "#101010" }}>
        <SectionDivider edge="top" shape="asymmetric" mirror />
        <SectionDivider edge="bottom" />
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14 max-w-2xl mx-auto">
            <span className={`${badgeClass} mb-5`}>Compromiso de calidad</span>
            <h2 className="text-3xl md:text-4xl font-medium text-gold mb-4">Tratamientos con Garantía por Escrito</h2>
            <p className="text-slate-400 max-w-xl mx-auto text-sm">
              Cada vehículo se atiende de forma individual, dedicando el tiempo necesario para alcanzar el estándar más exigente.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 text-left">
            <div className="glass-panel rounded-[24px] p-7 space-y-3 border border-white/10" style={{ background: "#141414" }}>
              <div className="w-11 h-11 rounded-full flex items-center justify-center mb-5" style={{ background: isTheZone ? "rgba(0,102,255,0.15)" : "rgba(184,194,204,0.1)" }}>
                <HiShieldCheck className="size-5" style={{ color: isTheZone ? "#38bdf8" : "#b8c2cc" }} />
              </div>
              <h4 className="font-semibold text-white text-base" style={{ textTransform: "none", fontFamily: "inherit" }}>
                Marcas Premium Mundiales
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Utilizamos recubrimientos nanocerámicos y compuestos de pulido de marcas líderes globales (Koch Chemie, Gyeon, CarPro, Menzerna).
              </p>
            </div>

            <div className="glass-panel rounded-[24px] p-7 space-y-3 border border-white/10" style={{ background: "#141414" }}>
              <div className="w-11 h-11 rounded-full flex items-center justify-center mb-5" style={{ background: isTheZone ? "rgba(0,102,255,0.15)" : "rgba(184,194,204,0.1)" }}>
                <HiOutlineSparkles className="size-5" style={{ color: isTheZone ? "#38bdf8" : "#b8c2cc" }} />
              </div>
              <h4 className="font-semibold text-white text-base" style={{ textTransform: "none", fontFamily: "inherit" }}>
                Técnica Segura y Precisa
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Inspección minuciosa bajo luz LED de alta fidelidad. Cero rodillos, cero métodos abrasivos. Cuidado total del barniz y la pintura.
              </p>
            </div>

            <div className="glass-panel rounded-[24px] p-7 space-y-3 border border-white/10" style={{ background: "#141414" }}>
              <div className="w-11 h-11 rounded-full flex items-center justify-center mb-5" style={{ background: isTheZone ? "rgba(0,102,255,0.15)" : "rgba(184,194,204,0.1)" }}>
                <HiOutlineCheckCircle className="size-5" style={{ color: isTheZone ? "#38bdf8" : "#b8c2cc" }} />
              </div>
              <h4 className="font-semibold text-white text-base" style={{ textTransform: "none", fontFamily: "inherit" }}>
                Asesoría Post-Servicio
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Te damos recomendaciones claras para los lavados posteriores, asegurando que el cerámico mantenga sus propiedades hidrofóbicas por años.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. UBICACIÓN & CONTACTO */}
      <section id="ubicacion" className="px-5 sm:px-8 py-24 bg-black">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div>
            <span className={`${badgeClass} mb-5`}>Ubicación</span>
            <h2 className={`text-3xl md:text-4xl font-medium ${isTheZone ? "text-thezone" : "text-gold"} mb-3`}>Dónde Encontrarnos</h2>
            <p className="text-slate-400 text-sm">Visítanos en nuestro estudio o agenda tu cita previa</p>
          </div>

          <div className="glass-panel rounded-[28px] p-8 md:p-10 border border-white/10 text-left max-w-2xl mx-auto space-y-6" style={{ background: "#101010" }}>
            <div className="flex items-start gap-4">
              <FaMapMarkerAlt className={`size-5 ${isTheZone ? "text-sky-400" : "text-gold"} shrink-0 mt-1`} />
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Dirección</p>
                <p className="text-white text-base font-medium">{biz.direccion}</p>
                <p className="text-slate-400 text-sm">{biz.ciudad}, México</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <FaClock className={`size-5 ${isTheZone ? "text-sky-400" : "text-gold"} shrink-0 mt-1`} />
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Horario de Atención</p>
                <p className="text-white text-sm">
                  {biz.horario ?? "Lunes a Viernes: 09:00 a 19:00 | Sábados: Cita previa"}
                </p>
              </div>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row gap-3">
              <a
                href={mapsHref(biz)}
                target="_blank"
                rel="noopener noreferrer"
                className={`${isTheZone ? "btn-outline-thezone" : "btn-outline-gold"} flex-1 text-center py-3 rounded-full text-xs font-semibold uppercase tracking-wider`}
              >
                Ver en Google Maps ↗
              </a>
              <a
                href={waHref(biz, msgPresupuesto)}
                target="_blank"
                rel="noopener noreferrer"
                className={`${isTheZone ? "btn-thezone" : "btn-gold"} flex-1 inline-flex items-center justify-center gap-2 py-3 rounded-full text-xs font-semibold uppercase tracking-wider`}
              >
                <FaWhatsapp className="size-4" />
                Escríbenos por WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 8. SOBRE NOSOTROS */}
      <section id="nosotros" className="relative px-5 sm:px-8 py-20" style={{ background: "#101010" }}>
        <SectionDivider edge="top" />
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <span className={`${badgeClass} mb-3`}>Sobre nosotros</span>
          <h2 className={`text-3xl md:text-4xl font-medium ${isTheZone ? "text-thezone" : "text-gold"} mb-3`}>
            Pasión por la Estética Automotriz en {biz.ciudad}
          </h2>

          <div className="space-y-4 text-slate-300 max-w-2xl mx-auto leading-relaxed text-sm sm:text-base font-light">
            <p>
              En <strong className="text-white font-semibold">{biz.nombre}</strong> entendemos que tu auto no es solo un medio de transporte. Es una inversión y el reflejo de tu gusto por los acabados de primer nivel.
            </p>
            <p>
              Trabajamos con cita previa para garantizar la máxima dedicación y tiempo en cada panel de la carrocería y rincón de la cabina.
            </p>
            <div className="glass-panel rounded-2xl p-5 text-left max-w-2xl mx-auto border border-white/10 mt-6 space-y-2" style={{ background: "#141414" }}>
              <p className="text-xs uppercase tracking-widest font-bold text-slate-200">
                Agenda tu Cita o Asesoría Sin Compromiso
              </p>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-light">
                Puedes contactarnos por WhatsApp o visitarnos en nuestras instalaciones en {biz.ciudad}. Con gusto te orientamos sobre las mejores opciones para tu vehículo.
              </p>
            </div>
          </div>

          <div className="pt-6">
            <a
              href={mapsHref(biz)}
              target="_blank"
              rel="noopener noreferrer"
              className={`${isTheZone ? "btn-thezone" : "btn-gold"} inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-xs font-semibold uppercase tracking-wider active:scale-95 transition-transform`}
            >
              <FaStar className="size-3.5" />
              Ver Opiniones en Google Maps ↗
            </a>
          </div>
        </div>
      </section>

      {/* 9. FOOTER */}
      <footer className="relative px-5 sm:px-8 pt-12 pb-8" style={{ background: isTheZone ? "rgba(8,12,20,0.98)" : "#101010" }}>
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-[1px]"
          style={{
            background: isTheZone
              ? "linear-gradient(90deg, transparent 0%, rgba(56,189,248,0.25) 20%, rgba(0,102,255,0.7) 50%, rgba(56,189,248,0.25) 80%, transparent 100%)"
              : "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.12) 20%, rgba(212,175,55,0.35) 50%, rgba(255,255,255,0.12) 80%, transparent 100%)",
          }}
        />

        {isTheZone && (
          <div className="flex justify-center mb-8">
            <img
              src="/logo/the-zone-logo.png"
              alt={biz.nombre}
              className="h-20 sm:h-28 md:h-32 w-auto object-contain opacity-90 hover:opacity-100 transition-all drop-shadow-[0_8px_30px_rgba(0,102,255,0.5)] hover:scale-105"
            />
          </div>
        )}

        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-slate-400 font-light">
          <span>© {new Date().getFullYear()} {biz.nombre} · Detailing Automotriz en {biz.ciudad} (México)</span>
          <span>{biz.direccion} · {biz.telefono}</span>
        </div>
      </footer>

      {/* 10. BOTÓN FLOTANTE DE WHATSAPP */}
      <div className="fixed bottom-6 right-6 z-50 animate-fade-in">
        <a
          href={waHref(biz, "¡Hola! Vi su página web y quería hacerles una consulta.")}
          target="_blank"
          rel="noopener noreferrer"
          className={`flex items-center gap-2.5 rounded-full ${
            isTheZone
              ? "btn-thezone text-white ring-2 ring-sky-300/40 shadow-[0_0_30px_rgba(0,102,255,0.7)]"
              : "bg-emerald-500 hover:bg-emerald-400 text-black shadow-2xl"
          } px-4 py-3 font-bold text-xs uppercase tracking-wider hover:scale-105 active:scale-95 transition-all`}
          aria-label="Contactar por WhatsApp"
        >
          <FaWhatsapp className={`size-5 ${isTheZone ? "text-white" : "text-black"}`} />
          <span className="hidden sm:inline">¿Dudas? Escríbenos</span>
        </a>
      </div>
    </div>
  );
}
