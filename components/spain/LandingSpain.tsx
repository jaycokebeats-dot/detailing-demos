"use client";

import { useEffect, useRef, useState } from "react";
import { FaWhatsapp, FaMapMarkerAlt, FaStar, FaClock } from "react-icons/fa";
import { HiOutlineCheckCircle, HiOutlineSparkles, HiShieldCheck } from "react-icons/hi2";
import type { Business, ServiceItem } from "@/data/business-helpers";
import { waHref, mapsHref } from "@/data/business-helpers";
import SectionDivider from "@/components/SectionDivider";
import CompareSlider from "@/components/CompareSlider";
import PpfColorVisualizer from "@/components/PpfColorVisualizer";

// Servicios estándar para España con precios de referencia en Euros (€) y modismos de España
const SERVICIOS_ESPANA: ServiceItem[] = [
  {
    nombre: "Detallado y Nutrición de Motor",
    descripcion: "Limpieza técnica profunda del vano motor con vapor controlado y productos dieléctricos seguros. Desengrasado exhaustivo y nutrición de plásticos, gomas y manguitos con acabado satinado de origen.",
    ideal_si: "Llevar el coche impecable bajo el capó y proteger plásticos y manguitos.",
    precio: "Desde 75 €",
    proteccion: "Acondicionado Dieléctrico de Plásticos",
    antes_img: "/before-after/motor-antes.jpg",
    despues_img: "/before-after/motor-despues.jpg",
  },
  {
    nombre: "Tratamiento Cerámico 9H",
    descripcion: "Recubrimiento nanotecnológico de alta dureza. Otorga un brillo cristalino espectacular, extrema repelencia al agua y suciedad, y protección UV contra la degradación solar y cal.",
    ideal_si: "Mantiene la pintura protegida, repele agua y suciedad, y facilita enormemente el lavado.",
    precio: "Desde 280 €",
    proteccion: "Brillo Espejo & Máxima Hidrofobia",
    antes_img: "/servicios/ceramico-antes.png",
    despues_img: "/servicios/ceramico-despues.png",
  },
  {
    nombre: "PPF Brillante | Paint Protection Film",
    descripcion: "Lámina de poliuretano autorregenerable de alta gama con acabado Gloss brillante. Protege la pintura original contra impactos de gravilla en carretera, arañazos y roces de aparcamiento.",
    ideal_si: "Película autorregenerable con calor · Cobertura para frontal o carrocería completa.",
    precio: "Desde 450 €",
    proteccion: "Protección Física de Alto Impacto",
    antes_img: "/servicios/ppf-brilloso-antes.png",
    despues_img: "/servicios/ppf-brilloso-despues.png",
  },
  {
    nombre: "PPF Mate | Paint Protection Film",
    descripcion: "Lámina autorregenerable de acabado satinado mate. Transforma el color original de tu coche en un acabado mate exclusivo y protector sin tocar la pintura de fábrica.",
    ideal_si: "Transformación a acabado mate satinado elegante con protección contra chinazos y roces.",
    precio: "Consultar Presupuesto",
    proteccion: "Acabado Mate Satinado Protector",
    antes_img: "/servicios/ppf-mate-antes.png",
    despues_img: "/servicios/ppf-mate-despues.png",
  },
  {
    nombre: "PPF Color | Paint Protection Film",
    descripcion: "Lámina autorregenerable con pigmentos de color de alta calidad. Cambia el color de tu coche al tono que prefieras mientras proteges la pintura original contra agresiones externas.",
    ideal_si: "Cambio de color integral con protección autorregenerable de impacto.",
    precio: "Consultar Presupuesto",
    proteccion: "Personalización & Protección Total",
    antes_img: "/servicios/ppf-color-antes.png",
    despues_img: "/servicios/ppf-color-despues.png",
  },
  {
    nombre: "Detailing Interior & Tapicería",
    descripcion: "Higienización integral del habitáculo con vapor seco: limpieza profunda por inyección-extracción en tapicería textil o tratamiento nutritivo para cuero, alfombrillas, conductos de aire y plásticos.",
    ideal_si: "Recuperar el tacto, olor y confort de un habitáculo limpio y desinfectado.",
    precio: "Desde 120 €",
    proteccion: "Desinfección & Acondicionado",
    antes_img: "/servicios/limpieza-tapizado-antes.png",
    despues_img: "/servicios/limpieza-tapizado-despues.png",
  },
  {
    nombre: "Reparación de Tapicería & Cuero",
    descripcion: "Recuperación y reparación especializada de tapizados interiores. Solución técnica para roturas, rozaduras en orejeras de asientos, desgastes en volantes de cuero y quemaduras.",
    ideal_si: "Solución para roturas, rozaduras o desgaste en asientos y volantes.",
    precio: "Presupuesto Previo",
    proteccion: "Restauración de Tapicería",
    antes_img: "/servicios/reparacion-tapizado-antes.png",
    despues_img: "/servicios/reparacion-tapizado-despues.png",
  },
  {
    nombre: "Tintado y Lámina Solar Cerámica",
    descripcion: "Lámina de control solar con tecnología cerámica para cristales y lunas. Reduce el calor en el habitáculo y filtra la radiación UV con homologación para circular.",
    ideal_si: "Rechazo de calor, protección para el interior y mayor privacidad.",
    precio: "Desde 140 €",
    proteccion: "Control Térmico & Homologado ITV",
    antes_img: "/servicios/polarizado-antes.png",
    despues_img: "/servicios/polarizado-despues.png",
  },
  {
    nombre: "Varillero Sacabollos (PDR)",
    descripcion: "Reparación técnica de bollos, impactos de granizo y toques de aparcamiento mediante varillas artesanales, devolviendo la chapa a su forma original sin masillar ni repintar el coche.",
    ideal_si: "Eliminar abolladuras conservando la pintura de origen y el valor de tasación del vehículo.",
    precio: "Presupuesto y Cita Previa",
    proteccion: "100% Pintura Original de Fábrica",
    antes_img: "/servicios/sacabollos-antes.png",
    despues_img: "/servicios/sacabollos-despues.png",
  },
];

const ITEMS_PROBLEMA_ESPANA = [
  "Microarañazos circulares (swirls) causados por rodillos de autolavado",
  "Pintura apagada que ha perdido el brillo y profundidad de fábrica",
  "Marcas de cal, resina o excrementos de pájaro incrustados",
  "Tapicería con manchas difíciles o pérdida de tono original",
  "Plásticos interiores y gomas resecas o blanquecinas",
  "Cuero reseco, agrietado o con brillos artificiales de suciedad",
];

export default function LandingSpain({ biz }: { biz: Business }) {
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

  const msgPresupuesto = `Hola! Quisiera pedir información o presupuesto para mi coche en ${biz.nombre}.`;
  const msgFotos = `Hola! Os envío unas fotos de mi coche para que me asesoréis sobre qué tratamiento le vendría mejor en ${biz.nombre}.`;

  const stats = [
    biz.rating != null
      ? `★ ${biz.rating === 5 ? "5.0" : biz.rating.toFixed(1)} en Google${biz.reviews_count != null ? ` (${biz.reviews_count} reseñas)` : ""}`
      : "★ 5.0 en Google",
    "Garantía por escrito",
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
              Pedir Cita
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
            src={biz.video_hero ?? "/videos/hero-compilado-blanco.mp4"}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/80" />

        <div className="relative z-10 max-w-6xl mx-auto w-full h-full flex items-center justify-center">
          <div className="max-w-2xl text-center space-y-5 mx-auto py-12 lg:py-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 text-xs sm:text-sm font-medium text-slate-300">
              <span className="flex size-2 rounded-full shrink-0 animate-pulse bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
              <span>{biz.ciudad}</span>
              <span className="text-slate-500">·</span>
              <span>Citas disponibles esta semana</span>
            </div>

            <h1 className="text-[32px] sm:text-[42px] font-medium tracking-tight leading-tight text-balance">
              Detailing Profesional a Mano,
              <br />
              <span className="text-gold">Acabado de Exposición.</span>
            </h1>

            <p className="text-base md:text-lg text-slate-300 max-w-2xl font-light leading-relaxed text-pretty">
              Corrección de pintura, tratamiento cerámico y limpieza de tapicería en {biz.ciudad}. Tratamiento artesanal sin microarañazos ni atajos.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full sm:w-auto pt-2">
              <a
                href={waHref(biz, msgPresupuesto)}
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
          <h2 className="text-3xl md:text-4xl font-medium text-gold mb-3">Lavar el Coche no es lo Mismo que un Detailing</h2>
          <p className="text-slate-400 max-w-xl mx-auto mb-10">
            Un coche puede salir limpio de un túnel de lavado y seguir viéndose apagado o arañado. Señales habituales:
          </p>
          <div className="grid sm:grid-cols-2 gap-3 text-left max-w-xl mx-auto">
            {ITEMS_PROBLEMA_ESPANA.map((item) => (
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

      {/* 4. SERVICIOS CON SLIDERS INTERACTIVOS DE ANTES Y DESPUÉS (€) */}
      <section id="servicios" className="px-5 sm:px-8 py-24 bg-black">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14 max-w-2xl mx-auto">
            <span className="section-badge mb-5">Nuestros servicios</span>
            <h2 className="text-3xl md:text-5xl font-medium text-gold mb-4">Servicios & Tarifas en {biz.ciudad}</h2>
            <p className="text-slate-400">
              Desliza sobre cada trabajo para comparar los resultados reales. Detallado de motor, tratamiento cerámico, protección PPF, tapicería y más.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {SERVICIOS_ESPANA.map((s) => {
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
                      Pedir Presupuesto
                    </a>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Banner de fotos y asesoramiento */}
          <div className="glass-panel rounded-[28px] mt-12 p-8 md:p-10 flex flex-col md:flex-row items-center gap-6 justify-between border border-white/10" style={{ background: "#101010" }}>
            <div>
              <span className="section-badge mb-3">¿Dudas sobre qué necesita tu coche?</span>
              <h3 className="font-semibold text-xl md:text-2xl mb-2 text-white" style={{ textTransform: "none", fontFamily: "inherit" }}>
                Envíanos 3 Fotos por WhatsApp y te Asesoramos
              </h3>
              <p className="text-sm text-slate-400 max-w-xl">
                Haz fotos del capó, lateral e interior con buena luz. En {biz.nombre} te orientamos sin compromiso para elegir el tratamiento adecuado.
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

      {/* 6. GARANTÍA & COMPROMISO */}
      <section id="garantia" className="relative px-5 sm:px-8 pt-24 pb-32 sm:pb-36" style={{ background: "#101010" }}>
        <SectionDivider edge="top" shape="asymmetric" mirror />
        <SectionDivider edge="bottom" />
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14 max-w-2xl mx-auto">
            <span className="section-badge mb-5">Compromiso de calidad</span>
            <h2 className="text-3xl md:text-4xl font-medium text-gold mb-4">Tratamientos con Garantía por Escrito</h2>
            <p className="text-slate-400 max-w-xl mx-auto text-sm">
              Cada vehículo se trata de forma individual, dedicando las horas necesarias para alcanzar el estándar más exigente.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 text-left">
            <div className="glass-panel rounded-[24px] p-7 space-y-3 border border-white/10" style={{ background: "#141414" }}>
              <div className="w-11 h-11 rounded-full flex items-center justify-center mb-5" style={{ background: "rgba(184,194,204,0.1)" }}>
                <HiShieldCheck className="size-5" style={{ color: "#b8c2cc" }} />
              </div>
              <h4 className="font-semibold text-white text-base" style={{ textTransform: "none", fontFamily: "inherit" }}>
                Marcas Premium
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Utilizamos recubrimientos nanocerámicos y compuestos de pulido de primeras marcas mundiales reconocidas internacionalmente.
              </p>
            </div>

            <div className="glass-panel rounded-[24px] p-7 space-y-3 border border-white/10" style={{ background: "#141414" }}>
              <div className="w-11 h-11 rounded-full flex items-center justify-center mb-5" style={{ background: "rgba(184,194,204,0.1)" }}>
                <HiOutlineSparkles className="size-5" style={{ color: "#b8c2cc" }} />
              </div>
              <h4 className="font-semibold text-white text-base" style={{ textTransform: "none", fontFamily: "inherit" }}>
                Técnica Segura
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Inspección minuciosa bajo luz LED de alta fidelidad de color. Cero rodillos, cero métodos abrasivos. Protección total de la laca.
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
                Te entregamos una guía clara con las pautas de lavado para que el tratamiento cerámico mantenga sus propiedades hidrofóbicas durante años.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. UBICACIÓN & CONTACTO */}
      <section id="ubicacion" className="px-5 sm:px-8 py-24 bg-black">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div>
            <span className="section-badge mb-5">Ubicación</span>
            <h2 className="text-3xl md:text-4xl font-medium text-gold mb-3">Dónde Encontrarnos</h2>
            <p className="text-slate-400 text-sm">Visítanos en nuestras instalaciones o solicita cita previa</p>
          </div>

          <div className="glass-panel rounded-[28px] p-8 md:p-10 border border-white/10 text-left max-w-2xl mx-auto space-y-6" style={{ background: "#101010" }}>
            <div className="flex items-start gap-4">
              <FaMapMarkerAlt className="size-5 text-gold shrink-0 mt-1" />
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Dirección</p>
                <p className="text-white text-base font-medium">{biz.direccion}</p>
                <p className="text-slate-400 text-sm">{biz.ciudad} (España)</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <FaClock className="size-5 text-gold shrink-0 mt-1" />
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Horario de Atención</p>
                <p className="text-white text-sm">
                  {biz.horario ?? "Lunes a Viernes: 09:00 a 19:30 | Sábados: Cita previa"}
                </p>
              </div>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row gap-3">
              <a
                href={mapsHref(biz)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-outline-gold flex-1 text-center py-3 rounded-full text-xs font-semibold uppercase tracking-wider"
              >
                Cómo Llegar en Google Maps ↗
              </a>
              <a
                href={waHref(biz, msgPresupuesto)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-gold flex-1 inline-flex items-center justify-center gap-2 py-3 rounded-full text-xs font-semibold uppercase tracking-wider"
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
          <span className="section-badge mb-3">Sobre nosotros</span>
          <h2 className="text-3xl md:text-4xl font-medium text-gold mb-3">
            Pasión por la Estética del Automóvil en {biz.ciudad}
          </h2>

          <div className="space-y-4 text-slate-300 max-w-2xl mx-auto leading-relaxed text-sm sm:text-base font-light">
            <p>
              En <strong className="text-white font-semibold">{biz.nombre}</strong> entendemos que tu coche no es solo un medio de transporte. Es una inversión y un reflejo de tu gusto por las cosas bien hechas.
            </p>
            <p>
              Trabajamos con cita previa para garantizar la máxima dedicación en cada panel de la carrocería y rincón del habitáculo.
            </p>
            <div className="glass-panel rounded-2xl p-5 text-left max-w-2xl mx-auto border border-white/10 mt-6 space-y-2" style={{ background: "#141414" }}>
              <p className="text-xs uppercase tracking-widest font-bold text-slate-200">
                Pide tu Cita o Asesoramiento Sin Compromiso
              </p>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-light">
                Puedes contactarnos por WhatsApp o visitarnos en nuestras instalaciones en {biz.ciudad}. Te orientamos sobre las mejores opciones para tu vehículo.
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
              Ver Reseñas en Google Maps ↗
            </a>
          </div>
        </div>
      </section>

      {/* 9. FOOTER */}
      <footer className="relative px-5 sm:px-8 pt-12 pb-8" style={{ background: "#101010" }}>
        {/* Línea divisoria de acento metálico sutil */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-[1px]"
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.12) 20%, rgba(212,175,55,0.35) 50%, rgba(255,255,255,0.12) 80%, transparent 100%)",
          }}
        />

        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-slate-400 font-light">
          <span>© {new Date().getFullYear()} {biz.nombre} · Detailing de Coches en {biz.ciudad}</span>
          <span>{biz.direccion} · {biz.telefono}</span>
        </div>
      </footer>

      {/* 10. BOTÓN FLOTANTE DE WHATSAPP */}
      <div className="fixed bottom-6 right-6 z-50 animate-fade-in">
        <a
          href={waHref(biz, "¡Hola! He visto vuestra web y quería haceros una consulta.")}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black px-4 py-3 font-bold text-xs uppercase tracking-wider shadow-2xl hover:scale-105 active:scale-95 transition-all"
          aria-label="Contactar por WhatsApp"
        >
          <FaWhatsapp className="size-5" />
          <span className="hidden sm:inline">¿Dudas? Escríbenos</span>
        </a>
      </div>
    </div>
  );
}
