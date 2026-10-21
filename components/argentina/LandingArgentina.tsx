"use client";

import { useEffect, useRef, useState } from "react";
import { FaWhatsapp, FaMapMarkerAlt, FaStar, FaClock, FaInstagram } from "react-icons/fa";
import { HiOutlineCheckCircle, HiOutlineSparkles, HiShieldCheck } from "react-icons/hi2";
import type { Business, ServiceItem } from "@/data/business-helpers";
import { waHref, mapsHref } from "@/data/business-helpers";
import SectionDivider from "@/components/SectionDivider";
import CompareSlider from "@/components/CompareSlider";
import PpfColorVisualizer from "@/components/PpfColorVisualizer";

// Servicios estándar para Argentina con precios de referencia en Pesos Argentinos ($ ARS) y modismos locales
const SERVICIOS_ARGENTINA: ServiceItem[] = [
  {
    nombre: "Detallado y Nutrición de Motor",
    descripcion: "Limpieza técnica profunda del vano motor con vapor controlado y desengrasantes dieléctricos seguros. Nutrición y acondicionamiento de mangueras, plásticos y gomas con terminación satinada original, libre de siliconas grasosas.",
    ideal_si: "Recuperar el aspecto de 0km bajo el capot y proteger plásticos y mangueras contra resecamiento.",
    precio: "Desde $45.000",
    proteccion: "Acondicionado Dieléctrico de Plásticos",
    antes_img: "/before-after/motor-antes.jpg",
    despues_img: "/before-after/motor-despues.jpg",
  },
  {
    nombre: "Tratamiento Cerámico 9H",
    descripcion: "Recubrimiento nanotecnológico de alta dureza (vidrio líquido / cerámico). Otorga un brillo cristalino y profundo tipo espejo, extrema repelencia al agua y suciedad (hidrofobia), y protección UV contra la decoloración solar y marcas de agua.",
    ideal_si: "Conserva la pintura impecable, repele agua y barro, y facilita enormemente los lavados diarios.",
    precio: "Desde $160.000",
    proteccion: "Brillo Espejo & Máxima Hidrofobia",
    antes_img: "/servicios/ceramico-antes.png",
    despues_img: "/servicios/ceramico-despues.png",
  },
  {
    nombre: "PPF Brillante | Paint Protection Film",
    descripcion: "Lámina de poliuretano autorregenerable de alto impacto con terminación Gloss brillante. Blinda la pintura original contra piedrazos en autopista o ruta, rayones de estacionamiento y rayos UV, conservando la máxima profundidad de color.",
    ideal_si: "Film autorregenerable con calor · Cobertura para trompa / frente o carrocería completa.",
    precio: "Desde $450.000",
    proteccion: "Protección Física de Alto Impacto",
    antes_img: "/servicios/ppf-brilloso-antes.png",
    despues_img: "/servicios/ppf-brilloso-despues.png",
  },
  {
    nombre: "PPF Mate | Paint Protection Film",
    descripcion: "Lámina autorregenerable de terminación satinada mate. Transforma el color original de tu auto en un acabado mate exclusivo y sofisticado sin alterar ni repintar la pintura de fábrica.",
    ideal_si: "Transformación a terminado mate satinado elegante con protección física contra piedras y rayones.",
    precio: "Consultar Presupuesto",
    proteccion: "Acabado Mate Satinado Protector",
    antes_img: "/servicios/ppf-mate-antes.png",
    despues_img: "/servicios/ppf-mate-despues.png",
  },
  {
    nombre: "PPF Color | Paint Protection Film",
    descripcion: "Film autorregenerable de protección con pigmentos de color de alta definición. Cambiá el color de tu auto al tono que prefieras mientras protegés la pintura original contra piedrazos y raspaduras.",
    ideal_si: "Cambio de color con protección autorregenerable de alto impacto.",
    precio: "Consultar Presupuesto",
    proteccion: "Personalización & Protección Total",
    antes_img: "/servicios/ppf-color-antes.png",
    despues_img: "/servicios/ppf-color-despues.png",
  },
  {
    nombre: "Detailing Interior & Limpieza de Tapizados",
    descripcion: "Higienización y desinfección integral del habitáculo con inyección-extracción y vapor seco: limpieza profunda en tapizados de tela o nutrición artesanal para butacas de cuero, alfombras, techo, conductos de aire y plásticos.",
    ideal_si: "Recuperar la textura, aroma y sensación de auto limpio y cuidado al detalle.",
    precio: "Desde $65.000",
    proteccion: "Desinfección & Acondicionado",
    antes_img: "/servicios/limpieza-tapizado-antes.png",
    despues_img: "/servicios/limpieza-tapizado-despues.png",
  },
  {
    nombre: "Restauración de Tapizados & Cuero",
    descripcion: "Recuperación técnica especializada de butacas, paneles y volantes de cuero o tela. Reparación de roturas, grietas, desgaste por roce y quemaduras, devolviendo el tono y textura original.",
    ideal_si: "Solución para roturas, quemaduras de cigarrillo o desgaste en butacas y volantes.",
    precio: "Presupuesto Previo",
    proteccion: "Restauración de Tapizados",
    antes_img: "/servicios/reparacion-tapizado-antes.png",
    despues_img: "/servicios/reparacion-tapizado-despues.png",
  },
  {
    nombre: "Polarizado Nano Cerámico & Control Solar",
    descripcion: "Lámina de control solar con tecnología nano cerámica de alta performance para cristales. Reduce drásticamente la temperatura en el habitáculo y filtra el 99% de rayos UV sin oscurecer ni distorsionar la visión nocturna.",
    ideal_si: "Rechazo térmico superior, protección para los interiores y mayor privacidad y seguridad.",
    precio: "Desde $85.000",
    proteccion: "Control Térmico & Filtro UV",
    antes_img: "/servicios/polarizado-antes.png",
    despues_img: "/servicios/polarizado-despues.png",
  },
  {
    nombre: "Sacabollos Artesanal (PDR)",
    descripcion: "Técnica artesanal de varillero para eliminar bollos, toques de estacionamiento y daños por granizo sin necesidad de masillar ni repintar el vehículo.",
    ideal_si: "Reparar golpes manteniendo la pintura 100% original de fábrica y el valor de reventa.",
    precio: "Presupuesto y Turno Previo",
    proteccion: "100% Pintura Original de Fábrica",
    antes_img: "/servicios/sacabollos-antes.png",
    despues_img: "/servicios/sacabollos-despues.png",
  },
];

const ITEMS_PROBLEMA_ARGENTINA = [
  "Microrrayones circulares (swirls) causados por rodillos de lavadero automático o trapos con tierra",
  "Pintura opaca que perdió el brillo profundo y el reflejo de 0km",
  "Marcas de lluvia ácida, sarro de agua dura, resina de árboles o heces de pájaros incrustadas",
  "Tapizados con manchas difíciles, derrames o pérdida del tono original",
  "Plásticos interiores, torpedo y molduras resecas o blanquecinas por el sol",
  "Butacas de cuero resecas, agrietadas o con brillo grasoso por acumulación de suciedad",
];

export default function LandingArgentina({ biz }: { biz: Business }) {
  const [scrolled, setScrolled] = useState(false);
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
    video.defaultMuted = true;
    video.muted = true;
    video.setAttribute("muted", "");
    video.setAttribute("playsinline", "true");
    video.play().catch(() => {});
  }, []);

  const [primeraPalabra, ...restoNombre] = (biz.nombreCorto ?? biz.nombre).toUpperCase().split(" ");
  const nombreResto = restoNombre.join(" ");

  const msgPresupuesto = `Hola! Quisiera pedir información o presupuesto para mi auto en ${biz.nombre}.`;
  const msgFotos = `Hola! Les mando unas fotos de mi auto para que me asesoren sobre qué tratamiento le conviene más en ${biz.nombre}.`;

  const stats = [
    biz.rating != null
      ? `★ ${biz.rating === 5 ? "5.0" : biz.rating.toFixed(1)} en Google${biz.reviews_count != null ? ` (${biz.reviews_count} opiniones)` : ""}`
      : "★ 5.0 en Google",
    "Garantía escrita",
    "Atención personalizada",
  ];

  return (
    <div className="min-h-screen bg-black text-white selection:bg-amber-500/30 selection:text-amber-200">
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
          <div className={`max-w-6xl mx-auto flex items-center justify-between px-5 sm:px-8 transition-[height] duration-300 ${scrolled ? "h-14" : "h-16"}`}>
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

      {/* 2. HERO */}
      <section id="hero" className="relative lg:h-dvh pt-24 pb-12 lg:pb-0 px-4 sm:px-6 overflow-x-clip flex items-center">
        {biz.fotos && biz.fotos.length > 0 ? (
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
            className="absolute inset-0 w-full h-full object-cover opacity-50 contrast-110 pointer-events-none"
            src="https://storage.googleapis.com/webild/default/templates/detailing/hero/hero.mp4"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/80" />

        <div className="relative z-10 max-w-6xl mx-auto w-full h-full flex items-center justify-center">
          <div className="max-w-2xl text-center space-y-5 mx-auto py-12 lg:py-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 text-xs sm:text-sm font-medium text-slate-300">
              <span className="flex size-2 rounded-full shrink-0 animate-pulse bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
              <span>{biz.ciudad} (Argentina)</span>
              <span className="text-slate-500">·</span>
              <span>Turnos disponibles esta semana</span>
            </div>

            <h1 className="text-[32px] sm:text-[42px] font-medium tracking-tight leading-tight text-balance">
              Detailing Profesional a Mano,
              <br />
              <span className="text-gold">Acabado de Exposición.</span>
            </h1>

            <p className="text-base md:text-lg text-slate-300 max-w-2xl font-light leading-relaxed text-pretty">
              Corrección de pintura, recubrimiento cerámico y estética interior en {biz.ciudad}. Cuidado artesanal sin microrrayones ni atajos.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full sm:w-auto pt-2">
              <a
                href={waHref(biz, msgPresupuesto)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-gold group w-full sm:w-auto px-7 py-3.5 min-h-[44px] rounded-full text-sm font-semibold uppercase tracking-wide active:scale-95 transition-[transform,filter] duration-150 flex items-center justify-center gap-2.5"
              >
                <FaWhatsapp aria-hidden className="size-4" />
                Pedir Presupuesto por WhatsApp
              </a>
              <a
                href="#servicios"
                className="btn-outline-gold text-nowrap group w-full sm:w-auto px-7 py-3.5 min-h-[44px] rounded-full text-sm font-semibold uppercase active:scale-95 flex items-center justify-center gap-2.5"
              >
                <HiOutlineSparkles aria-hidden className="size-4" />
                Ver Servicios
              </a>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 pt-2">
              {stats.map((item) => (
                <span key={item} className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-slate-300">
                  <HiOutlineCheckCircle aria-hidden className="size-4 shrink-0 text-gold" />
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
          <span className="section-badge mb-5">El problema real</span>
          <h2 className="text-3xl md:text-4xl font-medium text-gold mb-3">Lavar el Auto no es lo Mismo que un Detailing</h2>
          <p className="text-slate-400 max-w-xl mx-auto mb-10">
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

        {/* Fotos reales del taller si las tiene */}
        {biz.fotos && biz.fotos.length > 0 && (
          <div className="max-w-6xl mx-auto mt-16">
            <div className="text-center mb-8">
              <span className="section-badge mb-4">Nuestro trabajo</span>
              <h3 className="text-2xl md:text-3xl font-medium text-gold" style={{ textTransform: "none", fontFamily: "inherit" }}>
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

      {/* 4. SERVICIOS CON SLIDERS INTERACTIVOS DE ANTES Y DESPUÉS ($ ARS) */}
      <section id="servicios" className="px-5 sm:px-8 py-24 bg-black">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14 max-w-2xl mx-auto">
            <span className="section-badge mb-5">Nuestros servicios</span>
            <h2 className="text-3xl md:text-5xl font-medium text-gold mb-4">Servicios & Tarifas en {biz.ciudad}</h2>
            <p className="text-slate-400">
              Deslizá sobre cada trabajo para comparar los resultados reales. Detallado de motor, tratamiento cerámico, protección PPF, tapizados y más.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {SERVICIOS_ARGENTINA.map((s) => {
              const reservaMsg = `Hola! Me gustaría pedir información o presupuesto para el servicio: ${s.nombre} en ${biz.nombre}.`;
              const imgSource = s.img ?? "/servicios/exterior.jpg";
              const isPpfColor = s.nombre.toLowerCase().includes("ppf color");

              return (
                <div
                  key={s.nombre}
                  className="product-card rounded-[24px] overflow-hidden flex flex-col relative border border-white/10 hover:border-white/25 transition w-full h-full justify-between"
                  style={{ background: "#101010" }}
                >
                  <div className="aspect-[4/3] overflow-hidden relative" style={{ background: "#141414" }}>
                    {isPpfColor ? (
                      <PpfColorVisualizer biz={biz} />
                    ) : s.antes_img && s.despues_img ? (
                      <CompareSlider before={s.antes_img} after={s.despues_img} alt={s.nombre} real />
                    ) : (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={imgSource} alt={s.nombre} className="w-full h-full object-cover" />
                    )}
                    {s.proteccion && !isPpfColor && (
                      <div
                        className="absolute bottom-2 left-2 right-2 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/15 text-[11px] font-semibold text-white/95 flex items-center gap-1.5 shadow-lg z-20 pointer-events-none"
                        style={{ background: "rgba(10,10,10,0.85)" }}
                      >
                        <span className="size-1.5 rounded-full bg-emerald-400 shrink-0" />
                        <span>{s.proteccion}</span>
                      </div>
                    )}
                  </div>

                  <div className="p-5 flex flex-col gap-2 flex-1 justify-between">
                    <div className="space-y-2">
                      <h3 className="font-bold text-lg text-white leading-tight" style={{ textTransform: "none", fontFamily: "inherit" }}>
                        {s.nombre}
                      </h3>
                      <p className="text-base font-extrabold text-gold">{s.precio}</p>
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
                      className="btn-outline-gold mt-4 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider"
                    >
                      <FaWhatsapp aria-hidden className="size-3.5 text-emerald-400" />
                      Pedir Presupuesto por WhatsApp
                    </a>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Banner de fotos y asesoramiento */}
          <div className="glass-panel rounded-[28px] mt-12 p-8 md:p-10 flex flex-col md:flex-row items-center gap-6 justify-between border border-white/10" style={{ background: "#101010" }}>
            <div>
              <span className="section-badge mb-3">¿Dudas sobre qué necesita tu auto?</span>
              <h3 className="font-semibold text-xl md:text-2xl mb-2 text-white" style={{ textTransform: "none", fontFamily: "inherit" }}>
                Mandanos 3 Fotos por WhatsApp y te Asesoramos
              </h3>
              <p className="text-sm text-slate-400 max-w-xl">
                Sacale fotos al capot, los laterales y el interior con buena luz. En {biz.nombre} te orientamos sin costo ni compromiso para elegir el tratamiento ideal.
              </p>
            </div>
            <a
              href={waHref(biz, msgFotos)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-gold shrink-0 inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-sm font-semibold uppercase tracking-wide whitespace-nowrap"
            >
              <FaWhatsapp aria-hidden className="size-4" />
              Enviar Fotos por WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* 5. GARANTÍA & COMPROMISO */}
      <section id="garantia" className="relative px-5 sm:px-8 pt-24 pb-32 sm:pb-36" style={{ background: "#101010" }}>
        <SectionDivider edge="top" shape="asymmetric" mirror />
        <SectionDivider edge="bottom" />
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14 max-w-2xl mx-auto">
            <span className="section-badge mb-5">Compromiso de calidad</span>
            <h2 className="text-3xl md:text-4xl font-medium text-gold mb-4">Tratamientos con Garantía Escrita</h2>
            <p className="text-slate-400 max-w-xl mx-auto text-sm">
              Cada vehículo se atiende de forma individual, dedicando el tiempo necesario para alcanzar el estándar más exigente.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 text-left">
            <div className="glass-panel rounded-[24px] p-7 space-y-3 border border-white/10" style={{ background: "#141414" }}>
              <div className="w-11 h-11 rounded-full flex items-center justify-center mb-5" style={{ background: "rgba(184,194,204,0.1)" }}>
                <HiShieldCheck className="size-5" style={{ color: "#b8c2cc" }} />
              </div>
              <h4 className="font-semibold text-white text-base" style={{ textTransform: "none", fontFamily: "inherit" }}>
                Marcas Premium Mundiales
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Utilizamos recubrimientos nanocerámicos y compuestos de pulido de marcas líderes globales (Koch Chemie, Gyeon, CarPro, Menzerna, Vonixx).
              </p>
            </div>

            <div className="glass-panel rounded-[24px] p-7 space-y-3 border border-white/10" style={{ background: "#141414" }}>
              <div className="w-11 h-11 rounded-full flex items-center justify-center mb-5" style={{ background: "rgba(184,194,204,0.1)" }}>
                <HiOutlineSparkles className="size-5" style={{ color: "#b8c2cc" }} />
              </div>
              <h4 className="font-semibold text-white text-base" style={{ textTransform: "none", fontFamily: "inherit" }}>
                Técnica Segura y Precisa
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Inspección minuciosa bajo luz LED de alta fidelidad. Cero rodillos, cero métodos abrasivos. Cuidado total de la laca y la pintura original.
              </p>
            </div>

            <div className="glass-panel rounded-[24px] p-7 space-y-3 border border-white/10" style={{ background: "#141414" }}>
              <div className="w-11 h-11 rounded-full flex items-center justify-center mb-5" style={{ background: "rgba(184,194,204,0.1)" }}>
                <HiOutlineCheckCircle className="size-5" style={{ color: "#b8c2cc" }} />
              </div>
              <h4 className="font-semibold text-white text-base" style={{ textTransform: "none", fontFamily: "inherit" }}>
                Asesoramiento Post-Servicio
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Te damos recomendaciones claras para los lavados posteriores, asegurando que el tratamiento mantenga sus propiedades hidrofóbicas y brillo por años.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. UBICACIÓN & CONTACTO */}
      <section id="ubicacion" className="px-5 sm:px-8 py-24 bg-black">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div>
            <span className="section-badge mb-5">Ubicación</span>
            <h2 className="text-3xl md:text-4xl font-medium text-gold mb-3">Dónde Encontrarnos</h2>
            <p className="text-slate-400 text-sm">Visitanos en nuestras instalaciones o coordiná tu turno previo</p>
          </div>

          <div className="glass-panel rounded-[28px] p-8 md:p-10 border border-white/10 text-left max-w-2xl mx-auto space-y-6" style={{ background: "#101010" }}>
            <div className="flex items-start gap-4">
              <FaMapMarkerAlt className="size-5 text-gold shrink-0 mt-1" />
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Dirección</p>
                <p className="text-white text-base font-medium">{biz.direccion}</p>
                <p className="text-slate-400 text-sm">{biz.ciudad}, Argentina</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <FaClock className="size-5 text-gold shrink-0 mt-1" />
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Horario de Atención</p>
                <p className="text-white text-sm">
                  {biz.horario ?? "Lunes a Viernes: 09:00 a 19:00 | Sábados: Turno previo"}
                </p>
              </div>
            </div>

            {biz.instagram && (
              <div className="flex items-start gap-4">
                <FaInstagram className="size-5 text-gold shrink-0 mt-1" />
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Instagram</p>
                  <a
                    href={`https://instagram.com/${biz.instagram}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white text-sm hover:text-gold transition-colors font-medium underline underline-offset-4 decoration-slate-600"
                  >
                    @{biz.instagram} ↗
                  </a>
                </div>
              </div>
            )}

            <div className="pt-4 flex flex-col sm:flex-row gap-3">
              <a
                href={mapsHref(biz)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-outline-gold flex-1 text-center py-3 rounded-full text-xs font-semibold uppercase tracking-wider"
              >
                Ver en Google Maps ↗
              </a>
              <a
                href={waHref(biz, msgPresupuesto)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-gold flex-1 inline-flex items-center justify-center gap-2 py-3 rounded-full text-xs font-semibold uppercase tracking-wider"
              >
                <FaWhatsapp className="size-4" />
                Escribinos por WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 7. SOBRE NOSOTROS */}
      <section id="nosotros" className="relative px-5 sm:px-8 py-20" style={{ background: "#101010" }}>
        <SectionDivider edge="top" />
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <span className="section-badge mb-3">Sobre nosotros</span>
          <h2 className="text-3xl md:text-4xl font-medium text-gold mb-3">
            Pasión por la Estética Automotriz en {biz.ciudad}
          </h2>

          <div className="space-y-4 text-slate-300 max-w-2xl mx-auto leading-relaxed text-sm sm:text-base font-light">
            <p>
              En <strong className="text-white font-semibold">{biz.nombre}</strong> entendemos que tu auto no es solo un medio de transporte. Es una pasión y el reflejo de tu gusto por los acabados de primer nivel.
            </p>
            <p>
              Trabajamos con turno previo para garantizar la máxima dedicación y tiempo en cada panel de la carrocería y rincón del interior.
            </p>
            <div className="glass-panel rounded-2xl p-5 text-left max-w-2xl mx-auto border border-white/10 mt-6 space-y-2" style={{ background: "#141414" }}>
              <p className="text-xs uppercase tracking-widest font-bold text-slate-200">
                Coordiná tu Turno o Asesoramiento Sin Compromiso
              </p>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-light">
                Podés contactarnos por WhatsApp o visitarnos en nuestras instalaciones en {biz.ciudad}. Con gusto te orientamos sobre las mejores opciones para tu vehículo.
              </p>
            </div>
          </div>

          <div className="pt-6">
            <a
              href={mapsHref(biz)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-gold inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-xs font-semibold uppercase tracking-wider active:scale-95 transition-transform"
            >
              <FaStar className="size-3.5" />
              Ver Opiniones en Google Maps ↗
            </a>
          </div>
        </div>
      </section>

      {/* 8. FOOTER */}
      <footer className="relative px-5 sm:px-8 pt-12 pb-8" style={{ background: "#101010" }}>
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-[1px]"
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.12) 20%, rgba(212,175,55,0.35) 50%, rgba(255,255,255,0.12) 80%, transparent 100%)",
          }}
        />

        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-slate-400 font-light">
          <span>© {new Date().getFullYear()} {biz.nombre} · Detailing Automotriz en {biz.ciudad} (Argentina)</span>
          <span>{biz.direccion} · {biz.telefono}</span>
        </div>
      </footer>

      {/* 9. BOTÓN FLOTANTE DE WHATSAPP */}
      <div className="fixed bottom-6 right-6 z-50 animate-fade-in">
        <a
          href={waHref(biz, "¡Hola! Vi su página web y quería hacerles una consulta.")}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black px-4 py-3 font-bold text-xs uppercase tracking-wider shadow-2xl hover:scale-105 active:scale-95 transition-all"
          aria-label="Contactar por WhatsApp"
        >
          <FaWhatsapp className="size-5" />
          <span className="hidden sm:inline">¿Dudas? Escribinos</span>
        </a>
      </div>
    </div>
  );
}
