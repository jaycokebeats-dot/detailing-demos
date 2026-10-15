"use client";

import { useEffect, useRef, useState } from "react";
import { FaWhatsapp, FaMapMarkerAlt, FaStar, FaClock } from "react-icons/fa";
import { HiOutlineCheckCircle, HiOutlineSparkles, HiShieldCheck } from "react-icons/hi2";
import type { Business, ServiceItem } from "@/data/business-helpers";
import { waHref, mapsHref } from "@/data/business-helpers";
import SectionDivider from "@/components/SectionDivider";

// Servicios estándar para España con precios de referencia en Euros (€) y modismos de España
const SERVICIOS_ESPANA: ServiceItem[] = [
  {
    nombre: "Tratamiento Cerámico 9H",
    descripcion: "Recubrimiento nanotecnológico de máxima dureza. Otorga un brillo cristalino espectacular, extrema repelencia al agua y suciedad, y protección UV contra la degradación solar.",
    ideal_si: "Buscas la máxima protección duradera que mantenga la pintura protegida y facilite el lavado.",
    precio: "Desde 280 €",
    destacado: true,
    proteccion: "Protección 2 a 5 Años",
    img: "/servicios/ceramico-real.jpg",
  },
  {
    nombre: "Corrección de Pintura & Pulido",
    descripcion: "Pulido técnico en varias fases para eliminar microarañazos circulares (swirls), marcas de lavados previos y hologramas, recuperando la nitidez y profundidad del color original.",
    ideal_si: "La carrocería tiene marcas circulares visibles al sol o el barniz ha perdido su brillo original.",
    precio: "Desde 180 €",
    destacado: true,
    proteccion: "Eliminación de Swirls",
    img: "/servicios/acrilico.jpg",
  },
  {
    nombre: "Detailing Interior & Tapicería",
    descripcion: "Higienización integral del habitáculo con vapor seco: limpieza a fondo de tapicería textil o tratamiento nutritivo para cuero, alfombrillas, conductos de aire y plásticos.",
    ideal_si: "Quieres recuperar la sensación, olor y tacto de coche nuevo, libre de bacterias y ácaros.",
    precio: "Desde 120 €",
    destacado: false,
    proteccion: "Desinfección & Acondicionado",
    img: "/servicios/interior.jpg",
  },
  {
    nombre: "PPF (Paint Protection Film)",
    descripcion: "Lámina de poliuretano transparente autorregenerable de alta resistencia. Blindaje físico real contra chinazos, impactos de piedras en carretera, arañazos y roces de aparcamiento.",
    ideal_si: "Haces carretera o quieres blindar el frontal o carrocería completa frente a impactos de gravilla.",
    precio: "Desde 450 €",
    destacado: true,
    proteccion: "Garantía Oficial 10 Años",
    img: "/servicios/ppf.jpg",
  },
  {
    nombre: "Restauración de Faros",
    descripcion: "Lijado micrométrico por pasos, pulido de policarbonato y aplicación de sellador de protección UV para devolver la transparencia total, máxima potencia lumínica y pasar la ITV sin problemas.",
    ideal_si: "Los faros están amarillentos, opacos o desgastados por el sol.",
    precio: "Desde 60 €",
    destacado: false,
    proteccion: "Homologado ITV",
    img: "/servicios/polarizado.jpg",
  },
  {
    nombre: "Lavado Detallado a Mano",
    descripcion: "Lavado seguro con método de 2 cubos, champú con pH neutro, guante de microfibra ultrasuave, descontaminado de llantas y secado meticuloso por aire caliente.",
    ideal_si: "Quieres mantener el coche impecable sin crear las típicas microrrayas de los lavaderos convencionales.",
    precio: "Desde 45 €",
    destacado: false,
    proteccion: "Lavado Seguro Anti-Swirls",
    img: "/servicios/exterior.jpg",
  },
  {
    nombre: "Tratamiento Repelente de Lunas",
    descripcion: "Sellado cerámico para parabrisas y cristales. A más de 70 km/h el agua desliza sola sin accionar el limpiaparabrisas, mejorando drásticamente la visibilidad y seguridad bajo la lluvia.",
    ideal_si: "Conduces habitualmente por carretera o autovía y priorizas la seguridad con lluvia.",
    precio: "Desde 50 €",
    destacado: false,
    proteccion: "Efecto Hidrofóbico 12 Meses",
    img: "/servicios/polarizado-despues.png",
  },
  {
    nombre: "Detallado y Nutrición de Motor",
    descripcion: "Limpieza técnica del vano motor con productos dieléctricos y vapor controlado, seguido de un acondicionado y nutrición de plásticos y manguitos para prevenir su envejecimiento.",
    ideal_si: "Te gusta llevar el coche perfecto también bajo el capó o vas a ponerlo a la venta.",
    precio: "Desde 75 €",
    destacado: false,
    proteccion: "Nutrición Dieléctrica",
    img: "/servicios/tapizado-reparacion.jpg",
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

  const msgPresupuesto = "¡Hola! Quisiera pedir información o presupuesto para mi coche.";
  const msgFotos = "¡Hola! Os envío unas fotos de mi coche para que me asesoréis sobre qué tratamiento le vendría mejor.";

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
            <div className="hidden md:flex items-center gap-8 text-xs uppercase tracking-widest text-slate-400">
              <a href="#servicios" className="hover:text-white transition-colors">Servicios</a>
              <a href="#nosotros" className="hover:text-white transition-colors">Por qué nosotros</a>
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
            src="https://storage.googleapis.com/webild/default/templates/detailing/hero/hero.mp4"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/80" />
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(212,175,55,0.06) 0%, transparent 70%)" }}
        />

        <div className="relative z-10 max-w-6xl mx-auto w-full h-full flex items-center justify-center">
          <div className="max-w-2xl text-center space-y-5 mx-auto py-12 lg:py-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 text-xs sm:text-sm font-medium text-slate-300">
              <span className="flex size-2 rounded-full shrink-0 animate-pulse bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
              <span>{biz.ciudad} (Madrid)</span>
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
              <div key={item} className="glass-panel rounded-2xl px-4 py-3 flex items-start gap-3 border border-slate-800">
                <span className="shrink-0 w-1.5 h-1.5 rounded-full mt-2 bg-amber-400" />
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
              <h3 className="text-2xl md:text-3xl font-medium text-gold">
                Así trabajamos en {biz.nombre}
              </h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {biz.fotos.slice(0, 8).map((src, i) => (
                <div key={`${src}-${i}`} className="product-card rounded-[20px] overflow-hidden aspect-square bg-slate-900 border border-slate-800">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt={`${biz.nombre} — trabajo ${i + 1}`} className="w-full h-full object-cover" loading="lazy" />
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* 4. SERVICIOS CON PRECIOS DE REFERENCIA EN EUROS (€) */}
      <section id="servicios" className="px-5 sm:px-8 py-24 bg-black">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14 max-w-2xl mx-auto">
            <span className="section-badge mb-5">Nuestros servicios</span>
            <h2 className="text-3xl md:text-5xl font-medium text-gold mb-4">Servicios & Tarifas en Madrid</h2>
            <p className="text-slate-400">
              Tratamiento cerámico, corrección de pintura, protección PPF y limpieza integral de tapicería. Tarifas de referencia sin sorpresas.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {SERVICIOS_ESPANA.map((s) => {
              const reservaMsg = `¡Hola! Me gustaría pedir información o presupuesto para el servicio: ${s.nombre} en ${biz.nombre}.`;
              const imgSource = s.img ?? "/servicios/exterior.jpg";

              return (
                <div
                  key={s.nombre}
                  className="product-card rounded-[24px] overflow-hidden flex flex-col relative bg-slate-950/80 border border-slate-800/80 hover:border-gold/50 transition w-full h-full justify-between"
                >
                  {s.destacado && (
                    <span
                      className="absolute top-3 right-3 z-10 text-[10px] px-2.5 py-1 rounded-full text-black font-bold uppercase tracking-wider shadow-md"
                      style={{ background: "#d4af37" }}
                    >
                      Recomendado
                    </span>
                  )}

                  <div className="aspect-[4/3] overflow-hidden relative bg-slate-900">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={imgSource} alt={s.nombre} className="w-full h-full object-cover" />
                    {s.proteccion && (
                      <div className="absolute bottom-2 left-2 right-2 bg-slate-950/90 backdrop-blur-md px-2.5 py-1 rounded-lg border border-amber-500/30 text-[11px] font-semibold text-amber-300 flex items-center gap-1.5 shadow-lg z-20 pointer-events-none">
                        <span>{s.proteccion}</span>
                      </div>
                    )}
                  </div>

                  <div className="p-5 flex flex-col gap-2 flex-1 justify-between">
                    <div className="space-y-2">
                      <h3 className="font-bold text-lg text-white leading-tight">
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
          <div className="glass-panel rounded-[28px] mt-12 p-8 md:p-10 flex flex-col md:flex-row items-center gap-6 justify-between border border-slate-800">
            <div>
              <span className="section-badge mb-3">¿Dudas sobre qué necesita tu coche?</span>
              <h3 className="font-semibold text-xl md:text-2xl mb-2 text-white">
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

      {/* 5. GARANTÍA & COMPROMISO */}
      <section className="relative px-5 sm:px-8 py-20 bg-slate-950/60 border-t border-slate-900">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <span className="section-badge mb-3">Compromiso de calidad</span>
            <h2 className="text-3xl md:text-4xl font-medium text-gold mb-3">Tratamientos con Garantía por Escrito</h2>
            <p className="text-slate-400 max-w-xl mx-auto text-sm">
              Cada vehículo se trata de forma individual, dedicando las horas necesarias para alcanzar el estándar más exigente.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-black/60 border border-slate-800 space-y-3">
              <HiShieldCheck className="size-8 text-gold" />
              <h4 className="font-bold text-white text-base">Marcas Premium</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Utilizamos recubrimientos nanocerámicos y compuestos de pulido de primeras marcas mundiales reconocidas internacionalmente.
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-black/60 border border-slate-800 space-y-3">
              <HiOutlineSparkles className="size-8 text-gold" />
              <h4 className="font-bold text-white text-base">Técnica Segura</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Inspección minuciosa bajo luz LED de alta fidelidad de color. Cero rodillos, cero métodos abrasivos. Protección total de la laca.
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-black/60 border border-slate-800 space-y-3">
              <HiOutlineCheckCircle className="size-8 text-gold" />
              <h4 className="font-bold text-white text-base">Asesoramiento Post-Servicio</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Te entregamos una guía clara con las pautas de lavado para que el tratamiento cerámico mantenga sus propiedades hidrofóbicas durante años.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. SOBRE NOSOTROS */}
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
            <div className="glass-panel rounded-2xl p-5 text-left max-w-2xl mx-auto border border-white/10 mt-6 space-y-2">
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

      {/* 7. UBICACIÓN & CONTACTO */}
      <section id="ubicacion" className="px-5 sm:px-8 py-20 bg-black border-t border-slate-900">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div>
            <span className="section-badge mb-3">Ubicación</span>
            <h2 className="text-3xl md:text-4xl font-medium text-gold mb-2">Dónde Encontrarnos</h2>
            <p className="text-slate-400 text-sm">Visítanos en nuestras instalaciones o solicita cita previa</p>
          </div>

          <div className="glass-panel rounded-3xl p-8 border border-slate-800 text-left max-w-2xl mx-auto space-y-6">
            <div className="flex items-start gap-4">
              <FaMapMarkerAlt className="size-5 text-gold shrink-0 mt-1" />
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Dirección</p>
                <p className="text-white text-base font-medium">{biz.direccion}</p>
                <p className="text-slate-400 text-sm">{biz.ciudad}, Madrid (España)</p>
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

      {/* 8. FOOTER */}
      <footer className="px-5 sm:px-8 py-10 bg-slate-950 border-t border-slate-900 text-center text-xs text-slate-500">
        <div className="max-w-6xl mx-auto space-y-2">
          <p className="font-semibold text-slate-400">{biz.nombre} · Detailing de Coches en {biz.ciudad}</p>
          <p>© {new Date().getFullYear()} Todos los derechos reservados · Hecho con tecnología Next.js</p>
        </div>
      </footer>

      {/* 9. BOTÓN FLOTANTE DE WHATSAPP */}
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
