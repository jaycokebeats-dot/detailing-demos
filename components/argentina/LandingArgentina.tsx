"use client";

import { useEffect, useRef, useState } from "react";
import { FaWhatsapp, FaMapMarkerAlt, FaStar, FaClock, FaInstagram } from "react-icons/fa";
import {
  HiOutlineCheckCircle,
  HiOutlineSparkles,
  HiShieldCheck,
  HiChevronLeft,
  HiChevronRight,
  HiXMark,
  HiMagnifyingGlassPlus,
  HiArrowsPointingOut,
} from "react-icons/hi2";
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

interface JdsVideoItem {
  titulo: string;
  servicio: string;
  descripcion: string;
  video: string;
  poster: string;
  instagramUrl?: string;
  whatsappMsg: string;
}

const TRABAJOS_VIDEOS_JDS: JdsVideoItem[] = [
  {
    titulo: "Aplicación y Sellado Cerámico 9H",
    servicio: "Tratamiento Cerámico",
    descripcion: "Aplicación artesanal capa por capa con curado técnico. Brillo profundo tipo espejo y repelencia hidrofóbica extrema.",
    video: "/videos/jds/jds-video-ceramico.mp4",
    poster: "/videos/jds/jds-video-ceramico-poster.jpg",
    instagramUrl: "https://www.instagram.com/jdscardetail_/",
    whatsappMsg: "¡Hola! Vi el reel de Tratamiento Cerámico en su web y quisiera pedir presupuesto para mi auto.",
  },
  {
    titulo: "Inspección de Brillo e Hidrofobia",
    servicio: "Brillo Showroom",
    descripcion: "Control bajo luz de inspección técnica: profundidad de laca, tensión superficial y efecto espejo sin imperfecciones.",
    video: "/videos/jds/jds-video-ceramico-2.mp4",
    poster: "/videos/jds/jds-video-ceramico-2-poster.jpg",
    instagramUrl: "https://www.instagram.com/jdscardetail_/",
    whatsappMsg: "¡Hola! Vi el video de Brillo Espejo en su web y quisiera consultar para mi vehículo.",
  },
  {
    titulo: "Sellado Acrílico & Protección UV",
    servicio: "Tratamiento Acrílico",
    descripcion: "Sellado sintético protector contra radiación UV, marcas de lavado y agentes climáticos con terminación brillante.",
    video: "/videos/jds/jds-video-acrilico.mp4",
    poster: "/videos/jds/jds-video-acrilico-poster.jpg",
    instagramUrl: "https://www.instagram.com/jdscardetail_/",
    whatsappMsg: "¡Hola! Vi el reel de Tratamiento Acrílico en su web y quisiera consultar presupuesto.",
  },
  {
    titulo: "Limpieza de Motor a Vapor Seco",
    servicio: "Motor a Vapor",
    descripcion: "Desengrase técnico profundo sin agua a presión. Seguro para cableados y sensores, con acondicionado satinado térmico.",
    video: "/videos/jds/jds-video-motor.mp4",
    poster: "/videos/jds/jds-video-motor-poster.jpg",
    instagramUrl: "https://www.instagram.com/jdscardetail_/",
    whatsappMsg: "¡Hola! Vi el video de Limpieza de Motor a Vapor en su web y quisiera pedir turno.",
  },
  {
    titulo: "Higienización y Detallado de Interiores",
    servicio: "Interior Integral",
    descripcion: "Inyección y extracción profunda en tapizados y butacas, desmanchado técnico y nutrición de cueros y torpedo.",
    video: "/videos/jds/jds-video-interior.mp4",
    poster: "/videos/jds/jds-video-interior-poster.jpg",
    instagramUrl: "https://www.instagram.com/jdscardetail_/",
    whatsappMsg: "¡Hola! Vi el video de Limpieza Integral de Interiores en su web y quisiera consultar para mi auto.",
  },
  {
    titulo: "Restauración de Ópticas con Sellado UV",
    servicio: "Ópticas",
    descripcion: "Micro-lijado progresivo y pulido óptico para eliminar amarillamiento y recuperar 100% de transparencia y haz de luz.",
    video: "/videos/jds/jds-video-opticas.mp4",
    poster: "/videos/jds/jds-video-opticas-poster.jpg",
    instagramUrl: "https://www.instagram.com/jdscardetail_/",
    whatsappMsg: "¡Hola! Vi el reel de Restauración de Ópticas en su web y quisiera pedir presupuesto.",
  },
  {
    titulo: "Lavado Premium con Foam Cannon",
    servicio: "Lavado Premium",
    descripcion: "Pre-lavado con espuma activa de alta densidad, método de dos baldes y cepillos de pelo suave sin rayas.",
    video: "/videos/jds/jds-video-lavado-1.mp4",
    poster: "/videos/jds/jds-video-lavado-1-poster.jpg",
    instagramUrl: "https://www.instagram.com/jdscardetail_/",
    whatsappMsg: "¡Hola! Vi el video de Lavado Premium en su web y quisiera pedir turno.",
  },
  {
    titulo: "Detallado de Llantas y Secado Técnico",
    servicio: "Lavado Detallado",
    descripcion: "Descontaminación ferrosa en llantas y calipers, limpieza de pasarruedas y secado con aire y microfibra.",
    video: "/videos/jds/jds-video-lavado-2.mp4",
    poster: "/videos/jds/jds-video-lavado-2-poster.jpg",
    instagramUrl: "https://www.instagram.com/jdscardetail_/",
    whatsappMsg: "¡Hola! Vi el video de Lavado y Detallado de Llantas en su web y quisiera consultar.",
  },
];

function JdsReelCard({
  item,
  biz,
}: {
  item: JdsVideoItem;
  biz: Business;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play().catch(() => {});
      setIsPlaying(true);
    } else {
      v.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setIsMuted(v.muted);
  };

  const toggleFullscreen = (e: React.MouseEvent) => {
    e.stopPropagation();
    const v = videoRef.current as any;
    if (!v) return;
    if (document.fullscreenElement) {
      if (document.exitFullscreen) document.exitFullscreen().catch(() => {});
    } else {
      if (v.requestFullscreen) {
        v.requestFullscreen().catch(() => {});
      } else if (v.webkitRequestFullscreen) {
        v.webkitRequestFullscreen();
      } else if (v.webkitEnterFullscreen) {
        v.webkitEnterFullscreen();
      } else if (v.msRequestFullscreen) {
        v.msRequestFullscreen();
      }
    }
  };

  return (
    <div className="group relative rounded-[28px] overflow-hidden border border-white/10 hover:border-red-500/50 bg-[#101010] shadow-2xl transition-all duration-300 flex flex-col hover:shadow-[0_0_35px_rgba(239,68,68,0.25)]">
      {/* Video Container (Vertical Reel aspect ratio) */}
      <div
        className="relative aspect-[9/15] overflow-hidden bg-black cursor-pointer select-none"
        onClick={togglePlay}
      >
        <video
          ref={videoRef}
          src={item.video}
          poster={item.poster}
          playsInline
          loop
          muted={isMuted}
          preload="metadata"
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />

        {/* Top Badges */}
        <div className="absolute top-4 inset-x-4 flex items-center justify-between z-20 pointer-events-none">
          <span className="backdrop-blur-md px-3 py-1 rounded-full border text-[11px] font-bold uppercase tracking-wider bg-black/80 border-red-500/40 text-red-200 shadow-lg">
            {item.servicio}
          </span>
          <div className="flex items-center gap-2 pointer-events-auto">
            <button
              type="button"
              onClick={toggleMute}
              className="size-9 rounded-full bg-black/75 hover:bg-black backdrop-blur-md border border-white/20 hover:border-red-500/60 text-white flex items-center justify-center text-xs transition-all shadow-lg active:scale-90"
              aria-label={isMuted ? "Activar audio" : "Silenciar"}
              title={isMuted ? "Activar audio" : "Silenciar"}
            >
              {isMuted ? "🔇" : "🔊"}
            </button>
            <button
              type="button"
              onClick={toggleFullscreen}
              className="size-9 rounded-full bg-black/75 hover:bg-black backdrop-blur-md border border-white/20 hover:border-red-500/60 text-white flex items-center justify-center text-xs transition-all shadow-lg active:scale-90"
              aria-label="Ver en pantalla completa"
              title="Ver en pantalla completa"
            >
              <HiArrowsPointingOut className="size-4 text-white" />
            </button>
          </div>
        </div>

        {/* Play Icon Overlay if paused */}
        {!isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-10 transition-opacity">
            <div className="size-16 sm:size-20 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-[0_0_35px_rgba(239,68,68,0.7)] backdrop-blur-sm group-hover:scale-110 transition-transform">
              <svg className="size-8 sm:size-10 translate-x-0.5 fill-current" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
        )}

        {/* Dark Gradient Bottom */}
        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-black via-black/85 to-transparent pointer-events-none z-10" />

        {/* Bottom Content inside Video Overlay */}
        <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6 z-20 flex flex-col gap-3">
          <div>
            <h3 className="font-bold text-lg sm:text-xl text-white tracking-tight leading-snug" style={{ textTransform: "none", fontFamily: "inherit" }}>
              {item.titulo}
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 line-clamp-2 leading-relaxed font-light">
              {item.descripcion}
            </p>
          </div>

          <div className="pt-1" onClick={(e) => e.stopPropagation()}>
            <a
              href={waHref(biz, item.whatsappMsg)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-jds w-full py-2.5 sm:py-3 px-4 rounded-full text-xs sm:text-sm font-semibold uppercase tracking-wider flex items-center justify-center gap-2 text-center active:scale-95 shadow-lg shadow-red-950/40"
            >
              <FaWhatsapp className="size-4 shrink-0" />
              <span className="whitespace-nowrap">Pedir Presupuesto</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

interface JdsFotoItem {
  titulo: string;
  categoria: string;
  descripcion: string;
  img: string;
  whatsappMsg: string;
}

const TRABAJOS_FOTOS_JDS: JdsFotoItem[] = [
  {
    titulo: "Tratamiento Cerámico 9H",
    categoria: "Cerámico",
    descripcion: "Terminación con brillo espejo profundo y efecto hidrofóbico en carrocería y llantas.",
    img: "/trabajos/jds/jds-trabajo-ceramico.jpg",
    whatsappMsg: "¡Hola! Vi la foto de Tratamiento Cerámico en su web y quisiera pedir presupuesto.",
  },
  {
    titulo: "Detallado Integral de Interior",
    categoria: "Interior",
    descripcion: "Higienización profunda de tapizados, alfombras y torpedo con acabado satinado original de fábrica.",
    img: "/trabajos/jds/jds-trabajo-interior-1.jpg",
    whatsappMsg: "¡Hola! Vi la foto de Limpieza Integral de Interior en su web y quisiera consultar.",
  },
  {
    titulo: "Protección PPF Film Transparente",
    categoria: "PPF",
    descripcion: "Poliuretano autorregenerable de alto impacto para proteger la pintura de piedras y roces.",
    img: "/trabajos/jds/jds-trabajo-ppf.jpg",
    whatsappMsg: "¡Hola! Vi la foto de PPF en su web y quisiera pedir cotización para mi auto.",
  },
  {
    titulo: "Limpieza de Motor a Vapor Seco",
    categoria: "Motor a Vapor",
    descripcion: "Desengrase meticuloso seguro para la electrónica y acondicionamiento satinado de mangueras.",
    img: "/trabajos/jds/jds-trabajo-motor.jpg",
    whatsappMsg: "¡Hola! Vi la foto del Motor a Vapor en su web y quisiera pedir turno.",
  },
  {
    titulo: "Nutrición y Restauración de Cuero",
    categoria: "Interior",
    descripcion: "Limpieza técnica de butacas de cuero con hidratación profunda para evitar grietas y resequedad.",
    img: "/trabajos/jds/jds-trabajo-interior-2.jpg",
    whatsappMsg: "¡Hola! Vi la foto del tapizado de cuero en su web y quisiera consultar para mi vehículo.",
  },
  {
    titulo: "Detallado Meticuloso de Habitáculo",
    categoria: "Interior",
    descripcion: "Desinfección de conductos de aire, consola central y alfombras libres de polvo y manchas.",
    img: "/trabajos/jds/jds-trabajo-interior-3.jpg",
    whatsappMsg: "¡Hola! Vi la foto del habitáculo en su web y quisiera pedir presupuesto.",
  },
];

function JdsPhotoCarousel({ biz }: { biz: Business }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [selectedFoto, setSelectedFoto] = useState<JdsFotoItem | null>(null);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const amount = scrollRef.current.clientWidth * 0.8;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedFoto(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="mt-16 sm:mt-20 pt-12 sm:pt-16 border-t border-white/10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <span className="section-badge-jds mb-3 inline-block">Registro Fotográfico</span>
          <h3 className="text-2xl sm:text-3xl md:text-4xl font-medium text-white tracking-tight">
            Detalle Artesanal en Fotos
          </h3>
          <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-xl">
            Trabajos reales fotografiados en nuestro estudio en Villa Ballester. Tocá cualquier foto para ampliarla o deslizá para ver más.
          </p>
        </div>

        {/* Desktop Carousel Controls */}
        <div className="hidden sm:flex items-center gap-2">
          <button
            type="button"
            onClick={() => scroll("left")}
            className="size-11 rounded-full bg-neutral-900/90 hover:bg-neutral-800 border border-white/10 hover:border-red-500/50 text-white flex items-center justify-center transition-all active:scale-95 shadow-lg hover:shadow-[0_0_20px_rgba(239,68,68,0.25)]"
            aria-label="Foto anterior"
          >
            <HiChevronLeft className="size-5" />
          </button>
          <button
            type="button"
            onClick={() => scroll("right")}
            className="size-11 rounded-full bg-neutral-900/90 hover:bg-neutral-800 border border-white/10 hover:border-red-500/50 text-white flex items-center justify-center transition-all active:scale-95 shadow-lg hover:shadow-[0_0_20px_rgba(239,68,68,0.25)]"
            aria-label="Siguiente foto"
          >
            <HiChevronRight className="size-5" />
          </button>
        </div>
      </div>

      {/* Touch-swipeable Horizontal Scroll Container */}
      <div
        ref={scrollRef}
        className="flex gap-4 sm:gap-6 overflow-x-auto snap-x snap-mandatory pb-6 scrollbar-none -mx-5 px-5 sm:mx-0 sm:px-0"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {TRABAJOS_FOTOS_JDS.map((foto, idx) => (
          <div
            key={foto.titulo + idx}
            onClick={() => setSelectedFoto(foto)}
            className="group shrink-0 w-[84vw] xs:w-[320px] sm:w-[380px] md:w-[420px] snap-center cursor-pointer rounded-2xl sm:rounded-3xl overflow-hidden border border-white/10 hover:border-red-500/60 bg-[#121212] transition-all duration-300 hover:shadow-[0_0_35px_rgba(239,68,68,0.3)] flex flex-col select-none"
          >
            <div className="relative aspect-[16/11] overflow-hidden bg-black">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={foto.img}
                alt={foto.titulo}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-108"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />

              {/* Badge Categoria */}
              <div className="absolute top-3.5 left-3.5 z-10">
                <span className="backdrop-blur-md px-3 py-1 rounded-full border text-[11px] font-bold uppercase tracking-wider bg-black/80 border-red-500/40 text-red-200 shadow-md">
                  {foto.categoria}
                </span>
              </div>

              {/* Zoom Icon indicator */}
              <div className="absolute top-3.5 right-3.5 size-8 rounded-full bg-black/70 backdrop-blur-md border border-white/20 text-white/80 group-hover:text-white group-hover:border-red-500/50 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100">
                <HiMagnifyingGlassPlus className="size-4" />
              </div>
            </div>

            <div className="p-4 sm:p-5 flex flex-col justify-between flex-1 gap-3 bg-[#121212]">
              <div>
                <h4 className="font-semibold text-base sm:text-lg text-white group-hover:text-red-400 transition-colors">
                  {foto.titulo}
                </h4>
                <p className="text-xs sm:text-sm text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                  {foto.descripcion}
                </p>
              </div>

              <div className="pt-1 border-t border-white/5 flex items-center justify-between gap-2" onClick={(e) => e.stopPropagation()}>
                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                  🔍 Tocá para ampliar
                </span>
                <a
                  href={waHref(biz, foto.whatsappMsg)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-jds text-[11px] sm:text-xs py-2 px-3 rounded-full flex items-center gap-1.5 font-semibold uppercase tracking-wider active:scale-95"
                >
                  <FaWhatsapp className="size-3.5 shrink-0" />
                  <span>Consultar</span>
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox Modal */}
      {selectedFoto && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 sm:p-6 animate-fade-in"
          onClick={() => setSelectedFoto(null)}
        >
          <div
            className="relative max-w-4xl w-full bg-[#111] rounded-3xl overflow-hidden border border-red-500/40 shadow-2xl animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSelectedFoto(null)}
              className="absolute top-4 right-4 z-20 size-10 rounded-full bg-black/80 hover:bg-black border border-white/20 text-white flex items-center justify-center text-lg transition-transform hover:scale-110 active:scale-90"
              aria-label="Cerrar vista ampliada"
            >
              <HiXMark className="size-5" />
            </button>

            <div className="relative max-h-[70vh] bg-black flex items-center justify-center overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selectedFoto.img}
                alt={selectedFoto.titulo}
                className="max-h-[70vh] w-auto max-w-full object-contain mx-auto"
              />
            </div>

            <div className="p-5 sm:p-6 bg-gradient-to-t from-black to-[#141414] border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-red-400 text-xs font-bold uppercase tracking-wider">
                  {selectedFoto.categoria}
                </span>
                <h4 className="text-lg sm:text-xl font-bold text-white mt-0.5">
                  {selectedFoto.titulo}
                </h4>
                <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
                  {selectedFoto.descripcion}
                </p>
              </div>
              <a
                href={waHref(biz, selectedFoto.whatsappMsg)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-jds px-5 py-3 rounded-full text-xs sm:text-sm font-semibold uppercase tracking-wider flex items-center justify-center gap-2 shrink-0 active:scale-95 shadow-lg shadow-red-950/50"
              >
                <FaWhatsapp className="size-4 shrink-0" />
                <span>Pedir Presupuesto</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function LandingArgentina({ biz }: { biz: Business }) {
  const isCeleste = biz.color_theme === "celeste" || biz.slug === "am-centro-de-estetica-vehicular";
  const isRojo = biz.color_theme === "rojo" || biz.slug === "jds-detailing" || biz.slug === "jds-detailing-car-estudio";
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

  const [primeraPalabra, ...restoNombre] = (biz.nombre || "").trim().toUpperCase().split(" ");
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
    <div className={`min-h-screen bg-black text-white ${isRojo ? "selection:bg-red-600/30 selection:text-red-200" : isCeleste ? "selection:bg-sky-500/30 selection:text-sky-200" : "selection:bg-slate-500/30 selection:text-slate-200"}`}>
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
          <div className={`max-w-6xl mx-auto flex items-center justify-between px-4 sm:px-8 transition-[height] duration-300 ${scrolled ? "h-14" : "h-16"}`}>
            <a href="#hero" className="flex items-center shrink-0 group transition-transform active:scale-95 py-1" aria-label="Ir al inicio">
              {biz.logo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={biz.logo_url}
                  alt={biz.nombre}
                  className={`${scrolled ? "h-9 sm:h-10 md:h-11" : "h-11 sm:h-13 md:h-14"} w-auto max-w-[220px] sm:max-w-[300px] object-contain transition-all duration-200 group-hover:scale-105 ${isRojo ? "drop-shadow-[0_2px_16px_rgba(239,68,68,0.55)]" : isCeleste ? "drop-shadow-[0_2px_16px_rgba(56,189,248,0.55)]" : "drop-shadow-[0_2px_14px_rgba(195,205,220,0.35)]"}`}
                />
              ) : nombreResto ? (
                <span className="text-base font-bold tracking-widest text-white">
                  {`${primeraPalabra} `}
                  <span className={isRojo ? "text-jds" : isCeleste ? "text-celeste" : "text-gold"}>{nombreResto}</span>
                </span>
              ) : (
                <span className="text-base font-bold tracking-widest text-white">
                  {primeraPalabra}
                </span>
              )}
            </a>
            <div className="hidden md:flex items-center gap-7 text-xs uppercase tracking-widest text-slate-400">
              <a href="#servicios" className="hover:text-white transition-colors">Servicios</a>
              <a href="#trabajos" className="hover:text-white transition-colors">Trabajos</a>
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
              <FaWhatsapp aria-hidden className={`size-4 ${isRojo ? "text-red-500" : isCeleste ? "text-sky-400" : "text-emerald-400"}`} />
              Pedir Turno
            </a>
          </div>
        </header>
      </div>

      {/* 2. HERO */}
      <section id="hero" className="relative min-h-[100dvh] h-[100dvh] pt-14 sm:pt-20 pb-4 sm:pb-8 px-4 sm:px-6 overflow-hidden flex items-center justify-center">
        {!biz.video_hero && biz.fotos && biz.fotos.length > 0 ? (
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
            className={`absolute inset-0 w-full h-full object-cover ${isRojo ? "opacity-78 contrast-105 brightness-[1.06]" : "opacity-65 contrast-105"} pointer-events-none`}
            src={biz.video_hero ?? "/videos/hero-compilado-blanco.mp4"}
          />
        )}
        <div className={`absolute inset-0 ${isRojo ? "bg-gradient-to-t from-[#101010] via-black/40 to-black/55" : "bg-gradient-to-t from-black via-black/50 to-black/70"}`} />
        <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#101010] to-transparent pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto w-full h-full flex flex-col justify-center items-center text-center px-2">
          {/* Logo oficial centrado con halo de luz premium */}
          {biz.logo_url && (
            <div className="relative flex justify-center items-center -mt-2 sm:-mt-6 mb-2 sm:mb-4">
              <div
                className="absolute inset-0 rounded-full blur-2xl sm:blur-3xl opacity-75 sm:opacity-90 scale-125 sm:scale-150 pointer-events-none"
                style={{
                  background: isRojo
                    ? "radial-gradient(ellipse at center, rgba(239,68,68,0.7) 0%, rgba(185,28,28,0.35) 40%, rgba(153,27,27,0.15) 65%, transparent 80%)"
                    : isCeleste
                    ? "radial-gradient(ellipse at center, rgba(56,189,248,0.65) 0%, rgba(14,165,233,0.35) 40%, rgba(2,132,199,0.15) 65%, transparent 80%)"
                    : "radial-gradient(ellipse at center, rgba(195,205,220,0.50) 0%, rgba(150,165,185,0.25) 45%, rgba(100,115,135,0.10) 70%, transparent 85%)",
                }}
              />
              {(isCeleste || isRojo) && (
                <div
                  className="absolute inset-x-[-15%] h-[2px] top-1/2 -translate-y-1/2 blur-[1px] pointer-events-none opacity-80"
                  style={{
                    background: isRojo
                      ? "linear-gradient(90deg, transparent 0%, rgba(239,68,68,0.2) 20%, rgba(254,202,202,0.95) 50%, rgba(239,68,68,0.2) 80%, transparent 100%)"
                      : "linear-gradient(90deg, transparent 0%, rgba(56,189,248,0.2) 20%, rgba(186,230,253,0.95) 50%, rgba(56,189,248,0.2) 80%, transparent 100%)",
                  }}
                />
              )}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={biz.logo_url}
                alt={biz.nombre}
                className={`relative z-10 ${isRojo ? "h-24 xs:h-28 sm:h-36 md:h-44 lg:h-48 max-w-[90vw] sm:max-w-[540px]" : "h-20 xs:h-24 sm:h-32 md:h-36 lg:h-40 max-w-[88vw] sm:max-w-[480px]"} w-auto object-contain drop-shadow-[0_10px_40px_rgba(0,0,0,0.95)] ${isRojo ? "drop-shadow-[0_0_38px_rgba(239,68,68,0.65)]" : isCeleste ? "drop-shadow-[0_0_38px_rgba(56,189,248,0.6)]" : "drop-shadow-[0_0_30px_rgba(195,205,220,0.35)]"} transition-transform hover:scale-105`}
              />
            </div>
          )}

          <div className={`inline-flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-4 py-2 sm:py-1.5 rounded-2xl sm:rounded-full border text-[11px] sm:text-xs font-medium ${isRojo ? "border-red-500/30 bg-red-950/40 text-red-200" : isCeleste ? "border-sky-500/30 bg-sky-950/40 text-sky-200" : "border-white/10 bg-white/5 text-slate-300"} mt-2 sm:mt-4 mb-2 sm:mb-3 text-center`}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-1.5">
              <div className="flex items-center justify-center gap-1.5">
                <span className={`flex size-1.5 sm:size-2 rounded-full shrink-0 animate-pulse ${isRojo ? "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.9)]" : isCeleste ? "bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.9)]" : "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]"}`} />
                <span className="whitespace-nowrap font-medium">{biz.ciudad},</span>
              </div>
              <span className="whitespace-nowrap font-medium">{biz.provincia ?? "Buenos Aires"}</span>
            </div>
            <span className="hidden sm:inline text-red-500/50">·</span>
            <span className="text-[10px] sm:text-xs text-red-300/80 whitespace-nowrap">Turnos disponibles esta semana</span>
          </div>

          <h1 className="text-xl xs:text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight leading-snug sm:leading-tight text-balance text-white mt-1 sm:mt-2 mb-5 sm:mb-7">
            {biz.hero_titulo ? (
              <>
                {biz.hero_titulo}
                {biz.hero_titulo_gold && (
                  <>
                    <br />
                    <span className={isRojo ? "text-jds drop-shadow-[0_0_20px_rgba(239,68,68,0.4)]" : isCeleste ? "text-celeste drop-shadow-[0_0_20px_rgba(56,189,248,0.4)]" : "text-gold"}>{biz.hero_titulo_gold}</span>
                  </>
                )}
              </>
            ) : (
              <>
                Detailing Profesional, Polarizados & PPF
                <br />
                <span className={isRojo ? "text-jds drop-shadow-[0_0_20px_rgba(239,68,68,0.4)]" : isCeleste ? "text-celeste" : "text-gold"}>Resultado de Showroom.</span>
              </>
            )}
          </h1>

          {biz.hero_subtitulo && !isRojo && (
            <p className="text-[11px] xs:text-xs sm:text-sm text-slate-300 max-w-lg mx-auto font-light leading-snug text-pretty mb-5 sm:mb-7 line-clamp-2 sm:line-clamp-none">
              {biz.hero_subtitulo}
            </p>
          )}

          <div className="flex flex-row items-center justify-center gap-2.5 sm:gap-4 w-full max-w-xs sm:max-w-md mx-auto mb-4 sm:mb-6 px-1">
            <a
              href={waHref(biz, msgPresupuesto)}
              target="_blank"
              rel="noopener noreferrer"
              className={`${isRojo ? "btn-jds" : isCeleste ? "btn-celeste" : "btn-gold"} group flex-1 px-4 sm:px-6 py-2.5 sm:py-3.5 min-h-[44px] sm:min-h-[48px] rounded-full text-xs sm:text-sm font-semibold uppercase tracking-wider active:scale-95 transition-all flex items-center justify-center gap-1.5 sm:gap-2 whitespace-nowrap text-center`}
            >
              <FaWhatsapp aria-hidden className="size-3.5 sm:size-4 shrink-0" />
              <span className="whitespace-nowrap">Pedir Presupuesto</span>
            </a>
            <a
              href="#servicios"
              className={`${isRojo ? "btn-outline-jds" : isCeleste ? "btn-outline-celeste" : "btn-outline-gold"} group flex-1 px-4 sm:px-6 py-2.5 sm:py-3.5 min-h-[44px] sm:min-h-[48px] rounded-full text-xs sm:text-sm font-semibold uppercase tracking-wider active:scale-95 transition-all flex items-center justify-center gap-1.5 sm:gap-2 whitespace-nowrap text-center`}
            >
              <HiOutlineSparkles aria-hidden className="size-3.5 sm:size-4 shrink-0" />
              <span className="whitespace-nowrap">Ver Servicios</span>
            </a>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-4 sm:gap-x-6 gap-y-1.5 text-[11px] sm:text-xs text-slate-300">
            {stats.map((item) => (
              <span key={item} className="inline-flex items-center gap-1">
                <HiOutlineCheckCircle aria-hidden className={`size-3.5 sm:size-4 shrink-0 ${isRojo ? "text-red-400" : isCeleste ? "text-sky-400" : "text-gold"}`} />
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* 3. PROBLEMA VS SOLUCIÓN */}
      {!isRojo && (
        <>
          <section className="relative px-5 sm:px-8 py-20" style={{ background: "#101010" }}>
            <SectionDivider edge="top" />
            <div className="max-w-3xl mx-auto text-center">
              <span className={isCeleste ? "section-badge-celeste mb-5" : "section-badge mb-5"}>El problema real</span>
              <h2 className={`text-3xl md:text-4xl font-medium ${isCeleste ? "text-celeste" : "text-gold"} mb-3`}>{isCeleste ? "Lavar el Auto no es lo Mismo que Estética Vehicular" : "Lavar el Auto no es lo Mismo que un Detailing"}</h2>
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
                  <span className={isCeleste ? "section-badge-celeste mb-4" : "section-badge mb-4"}>Nuestro trabajo</span>
                  <h3 className={`text-2xl md:text-3xl font-medium ${isCeleste ? "text-celeste" : "text-gold"}`} style={{ textTransform: "none", fontFamily: "inherit" }}>
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

          {/* BANNER DE MEDIOS DE PAGO & CONFIANZA */}
          <div className="max-w-4xl mx-auto px-4 -mt-10 mb-10 relative z-20">
            <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl flex flex-col items-center justify-center text-center gap-4" style={{ background: "rgba(16,16,16,0.92)", backdropFilter: "blur(16px)" }}>
              <div className="space-y-1.5 flex flex-col items-center">
                <span className={isCeleste ? "section-badge-celeste mb-1" : "section-badge mb-1"}>
                  Compromiso de Calidad
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight" style={{ textTransform: "none", fontFamily: "inherit" }}>
                  Servicio Profesional y Garantizado
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 font-light max-w-2xl mx-auto leading-relaxed">
                  Consultanos por formas de pago y planes de mantenimiento preventivo.
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-3 pt-1 text-xs font-semibold">
                <div className="px-4 py-2.5 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-2 text-white">
                  <span>💳</span>
                  <span>Tarjeta 3 Cuotas Fijas</span>
                </div>
                <div className="px-4 py-2.5 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-2 text-white">
                  <span>💵</span>
                  <span>Efectivo</span>
                </div>
                <div className="px-4 py-2.5 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-2 text-white">
                  <span>📲</span>
                  <span>Transferencia Bancaria</span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* 4. SERVICIOS CON SLIDERS INTERACTIVOS DE ANTES Y DESPUÉS ($ ARS) */}
      <section id="servicios" className="relative px-5 sm:px-8 py-20" style={{ background: isRojo ? "#101010" : "#000000" }}>
        <SectionDivider edge="top" fill={isRojo ? "#101010" : "#000000"} />
        <div className="max-w-7xl mx-auto">
          {(() => {
            const serviciosList = (biz.servicios && biz.servicios.length > 0) ? biz.servicios : SERVICIOS_ARGENTINA;
            const hasPrices = serviciosList.some((s) => Boolean(s.precio && s.precio.trim() && !s.precio.toLowerCase().includes("consultar") && !s.precio.toLowerCase().includes("presupuesto") && !s.precio.toLowerCase().includes("cotizar")));
            return (
              <div className="text-center mb-14 max-w-2xl mx-auto">
                <span className={isRojo ? "section-badge-jds mb-5" : isCeleste ? "section-badge-celeste mb-5" : "section-badge mb-5"}>Nuestros servicios</span>
                <h2 className={`text-3xl md:text-5xl font-medium ${isRojo ? "text-jds" : isCeleste ? "text-celeste" : "text-gold"} mb-4`}>
                  {hasPrices ? "Servicios & Tarifas" : "Servicios & Tratamientos"} en {biz.ciudad}
                </h2>
                <p className="text-slate-400">
                  {hasPrices
                    ? "Deslizá sobre cada trabajo para comparar los resultados reales. Detallado de motor, tratamiento cerámico, protección PPF, tapizados y más."
                    : "Deslizá sobre cada trabajo para comparar los resultados reales. Consultanos por WhatsApp para recibir asesoramiento y presupuesto personalizado."}
                </p>
              </div>
            );
          })()}

          <div className="flex flex-wrap justify-center gap-6 max-w-7xl mx-auto">
            {((biz.servicios && biz.servicios.length > 0) ? biz.servicios : SERVICIOS_ARGENTINA).map((s, idx) => {
              const reservaMsg = `Hola! Me gustaría pedir información o presupuesto para el servicio: ${s.nombre} en ${biz.nombre}.`;
              const imgSource = s.img ?? "/servicios/exterior.jpg";
              const isPpfColor = s.nombre.toLowerCase().includes("ppf color");

              return (
                <div
                  key={`${s.nombre}-${idx}`}
                  className={`product-card rounded-[24px] overflow-hidden flex flex-col relative border ${isRojo ? "border-white/10 hover:border-red-500/40 hover:shadow-[0_0_20px_rgba(239,68,68,0.2)]" : isCeleste ? "border-white/10 hover:border-sky-500/40 hover:shadow-[0_0_20px_rgba(56,189,248,0.15)]" : "border-white/10 hover:border-white/25"} transition w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] max-w-md justify-between`}
                  style={{ background: "#101010" }}
                >
                  <div className="aspect-[4/3] overflow-hidden relative" style={{ background: "#141414" }}>
                    {isPpfColor ? (
                      <PpfColorVisualizer biz={biz} />
                    ) : (s.modo_foto === "before_after" ? (s.antes_img || s.despues_img) : (s.antes_img && s.despues_img)) ? (
                      <CompareSlider before={s.antes_img || s.despues_img || imgSource} after={s.despues_img || s.antes_img || imgSource} alt={s.nombre} real fit={s.foto_fit} />
                    ) : (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <div className="relative w-full h-full bg-[#0d0d0d] overflow-hidden">
                        {s.foto_fit === "contain" && (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={s.img || imgSource}
                            alt=""
                            aria-hidden
                            className="absolute inset-0 w-full h-full object-cover blur-2xl opacity-35 scale-110 pointer-events-none"
                          />
                        )}
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={s.img || imgSource}
                          alt={s.nombre}
                          className={`w-full h-full relative z-10 ${s.foto_fit === "contain" ? "object-contain" : "object-cover"}`}
                        />
                      </div>
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
                      {s.precio && s.precio.trim() ? (
                        <p className={`text-base font-extrabold ${isRojo ? "text-red-400" : isCeleste ? "text-sky-400" : "text-gold"}`}>{s.precio}</p>
                      ) : null}
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
                      className={`${isRojo ? "btn-outline-jds" : isCeleste ? "btn-outline-celeste" : "btn-outline-gold"} mt-4 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider`}
                    >
                      <FaWhatsapp aria-hidden className={`size-3.5 ${isRojo ? "text-red-400" : "text-emerald-400"}`} />
                      Pedir Presupuesto por WhatsApp
                    </a>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Banner de fotos y asesoramiento */}
          {!isRojo && (
            <div className="glass-panel rounded-[28px] mt-12 p-8 md:p-10 flex flex-col md:flex-row items-center gap-6 justify-between border border-white/10" style={{ background: "#101010" }}>
              <div>
                <span className={isCeleste ? "section-badge-celeste mb-3" : "section-badge mb-3"}>¿Dudas sobre qué necesita tu auto?</span>
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
                className={`${isCeleste ? "btn-celeste" : "btn-gold"} shrink-0 inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-sm font-semibold uppercase tracking-wide whitespace-nowrap`}
              >
                <FaWhatsapp aria-hidden className="size-4" />
                Enviar Fotos por WhatsApp
              </a>
            </div>
          )}
        </div>
        <SectionDivider edge="bottom" shape="asymmetric" fill={isRojo ? "#101010" : "#000000"} />
      </section>

      {/* BANNER DE MEDIOS DE PAGO & CONFIANZA (Para JDS va inmediatamente después de Servicios) */}
      {isRojo && (
        <div className="max-w-4xl mx-auto px-4 -mt-10 mb-10 relative z-20">
          <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl flex flex-col items-center justify-center text-center gap-4" style={{ background: "rgba(16,16,16,0.92)", backdropFilter: "blur(16px)" }}>
            <div className="space-y-1.5 flex flex-col items-center">
              <span className="section-badge-jds mb-1">
                Tu auto, en las mejores manos
              </span>
              <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight" style={{ textTransform: "none", fontFamily: "inherit" }}>
                Taller de Estética del Automotor en Villa Ballester
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 font-light max-w-2xl mx-auto leading-relaxed">
                Facilidades de pago: Tarjeta en 3 cuotas fijas (en algunos trabajos), Efectivo y Transferencia Bancaria.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-1 text-xs font-semibold">
              <div className="px-4 py-2.5 rounded-2xl bg-white/5 border border-red-500/25 text-red-200 shadow-[0_0_15px_rgba(239,68,68,0.12)] flex items-center gap-2">
                <span>💳</span>
                <span>Tarjeta 3 Cuotas Fijas</span>
              </div>
              <div className="px-4 py-2.5 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-2 text-white">
                <span>💵</span>
                <span>Efectivo</span>
              </div>
              <div className="px-4 py-2.5 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-2 text-white">
                <span>📲</span>
                <span>Transferencia Bancaria</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4.1 SECCIÓN: TE MOSTRAMOS NUESTROS TRABAJOS */}
      <section id="trabajos" className="px-5 sm:px-8 pt-10 pb-24 bg-black relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14 max-w-2xl mx-auto">
            <span className={isRojo ? "section-badge-jds mb-5" : isCeleste ? "section-badge-celeste mb-5" : "section-badge mb-5"}>
              Resultados Reales
            </span>
            <h2 className={`text-3xl md:text-5xl font-medium ${isRojo ? "text-jds" : isCeleste ? "text-celeste" : "text-gold"} mb-4`}>
              Te Mostramos Nuestros Trabajos
            </h2>
            <p className="text-slate-400 text-sm sm:text-base">
              {isRojo
                ? "Videos reales directamente desde nuestro estudio en Villa Ballester. Tocá cada reel para reproducir."
                : "Cada auto que ingresa a nuestro estudio recibe dedicación artesanal, luz de inspección técnica y un acabado de showroom real."}
            </p>
          </div>

          {isRojo ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-7xl mx-auto">
                {TRABAJOS_VIDEOS_JDS.map((item) => (
                  <JdsReelCard key={item.titulo} item={item} biz={biz} />
                ))}
              </div>
              <JdsPhotoCarousel biz={biz} />
            </>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
              {[
                {
                  titulo: "Audi A3 Sportback — Tratamiento Cerámico",
                  categoria: "Cerámico",
                  descripcion: "Corrección técnica de laca y sellado nanocerámico con brillo cristalino tipo espejo en nuestro estudio.",
                  img: "/logo/jds/jds-taller-audi.jpg",
                },
                {
                  titulo: "Restauración de Ópticas con Sellado UV",
                  categoria: "Ópticas",
                  descripcion: "Micro-lijado progresivo para eliminar opacidad y amarillamiento, recuperando 100% de transparencia y luminosidad.",
                  img: "/before-after/faros-despues.jpg",
                },
                {
                  titulo: "Limpieza de Motor a Vapor & Dieléctrico",
                  categoria: "Motor a Vapor",
                  descripcion: "Higienización exhaustiva a vapor seco con nutrición satinada de plásticos y gomas, libre de silicona grasosa.",
                  img: "/before-after/motor-despues.jpg",
                },
                {
                  titulo: "Limpieza de Interior Full & Desinfección",
                  categoria: "Interior Full",
                  descripcion: "Inyección-extracción profunda en butacas y alfombras con desinfección térmica de conductos de aire.",
                  img: "/servicios/limpieza-tapizado-despues.png",
                },
                {
                  titulo: "Corrección de Pintura & Acabado Espejo",
                  categoria: "Corrección de Laca",
                  descripcion: "Eliminación total de swirls y microrrayones circulares de lavadero bajo lámpara de inspección profesional.",
                  img: "/before-after/pintura-despues.jpg",
                },
                {
                  titulo: "Lavado Premium Artesanal & Cera Rápida",
                  categoria: "Lavado Premium",
                  descripcion: "Técnica de dos baldes con shampoo pH neutro, descontaminado de pintura y sellado de brillo profundo.",
                  img: "/before-after/platinum-full-detail-despues.jpg",
                },
              ].map((trabajo) => (
                <div
                  key={trabajo.titulo}
                  className={`product-card rounded-[24px] overflow-hidden flex flex-col justify-between border ${
                    isCeleste
                      ? "border-white/10 hover:border-sky-500/40 hover:shadow-[0_0_20px_rgba(56,189,248,0.15)]"
                      : "border-white/10 hover:border-white/25"
                  } transition duration-300 group`}
                  style={{ background: "#101010" }}
                >
                  <div className="aspect-[16/10] overflow-hidden relative bg-[#141414]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={trabajo.img}
                      alt={trabajo.titulo}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className={`absolute top-3 left-3 backdrop-blur-md px-2.5 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider ${
                      isCeleste ? "bg-black/80 border-sky-500/30 text-sky-200" : "bg-black/75 border-white/15 text-white"
                    }`}>
                      {trabajo.categoria}
                    </div>
                  </div>
                  <div className="p-5 flex flex-col justify-between flex-1 gap-3">
                    <div>
                      <h3 className={`font-bold text-base sm:text-lg text-white ${isCeleste ? "group-hover:text-sky-400" : "group-hover:text-slate-200"} transition-colors`} style={{ textTransform: "none", fontFamily: "inherit" }}>
                        {trabajo.titulo}
                      </h3>
                      <p className="text-xs text-slate-300 mt-1.5 leading-relaxed font-light">
                        {trabajo.descripcion}
                      </p>
                    </div>
                    <a
                      href={waHref(biz, `Hola! Vi el trabajo de ${trabajo.titulo} en su web y quisiera consultar para mi auto.`)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`${isCeleste ? "btn-outline-celeste" : "btn-outline-gold"} inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider`}
                    >
                      <FaWhatsapp className="size-3.5 text-emerald-400" />
                      Pedir Presupuesto Similar
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Instagram Callout Footer */}
          {biz.instagram && (
            <div className="mt-12 glass-panel rounded-3xl p-6 md:p-8 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-6" style={{ background: "rgba(18,18,18,0.85)" }}>
              <div className="flex items-center gap-4 text-center sm:text-left">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${isRojo ? "bg-red-600/20 text-red-400 border border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.2)]" : isCeleste ? "bg-sky-500/20 text-sky-400 border border-sky-500/30" : "bg-white/10 text-white"}`}>
                  <FaInstagram className="size-6" />
                </div>
                <div>
                  <h4 className="font-bold text-base sm:text-lg text-white" style={{ textTransform: "none", fontFamily: "inherit" }}>
                    ¿Querés ver más videos y procesos diarios?
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Subimos historias y reels de los autos que ingresan al taller todos los días a <strong className="text-slate-200">@{biz.instagram}</strong>
                  </p>
                </div>
              </div>
              <a
                href={`https://instagram.com/${biz.instagram}`}
                target="_blank"
                rel="noopener noreferrer"
                className={`${isRojo ? "btn-jds" : isCeleste ? "btn-celeste" : "btn-gold"} shrink-0 inline-flex items-center gap-2 px-6 py-3 rounded-full text-xs font-bold uppercase tracking-wider`}
              >
                <FaInstagram className="size-4" />
                Seguinos en Instagram ↗
              </a>
            </div>
          )}
        </div>
      </section>

      {/* 5. GARANTÍA & COMPROMISO */}
      <section id="garantia" className="relative px-5 sm:px-8 pt-24 pb-32 sm:pb-36" style={{ background: "#101010" }}>
        <SectionDivider edge="top" shape="asymmetric" mirror />
        <SectionDivider edge="bottom" />
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14 max-w-2xl mx-auto">
            <span className={isRojo ? "section-badge-jds mb-5" : isCeleste ? "section-badge-celeste mb-5" : "section-badge mb-5"}>Compromiso de calidad</span>
            <h2 className={`text-3xl md:text-4xl font-medium ${isRojo ? "text-jds" : isCeleste ? "text-celeste" : "text-gold"} mb-4`}>Tratamientos con Garantía Escrita</h2>
            <p className="text-slate-400 max-w-xl mx-auto text-sm">
              Cada vehículo se atiende de forma individual, dedicando el tiempo necesario para alcanzar el estándar más exigente.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 text-left">
            <div className="glass-panel rounded-[24px] p-7 space-y-3 border border-white/10" style={{ background: "#141414" }}>
              <div className="w-11 h-11 rounded-full flex items-center justify-center mb-5" style={{ background: isRojo ? "rgba(239,68,68,0.12)" : "rgba(184,194,204,0.1)" }}>
                <HiShieldCheck className="size-5" style={{ color: isRojo ? "#ef4444" : "#b8c2cc" }} />
              </div>
              <h4 className="font-semibold text-white text-base" style={{ textTransform: "none", fontFamily: "inherit" }}>
                Marcas Premium Mundiales
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Utilizamos recubrimientos nanocerámicos y compuestos de pulido de marcas líderes globales.
              </p>
            </div>

            <div className="glass-panel rounded-[24px] p-7 space-y-3 border border-white/10" style={{ background: "#141414" }}>
              <div className="w-11 h-11 rounded-full flex items-center justify-center mb-5" style={{ background: isRojo ? "rgba(239,68,68,0.12)" : "rgba(184,194,204,0.1)" }}>
                <HiOutlineSparkles className="size-5" style={{ color: isRojo ? "#ef4444" : "#b8c2cc" }} />
              </div>
              <h4 className="font-semibold text-white text-base" style={{ textTransform: "none", fontFamily: "inherit" }}>
                Técnica Segura y Precisa
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Inspección minuciosa bajo luz LED de alta fidelidad. Cero rodillos, cero métodos abrasivos. Cuidado total de la laca y la pintura original.
              </p>
            </div>

            <div className="glass-panel rounded-[24px] p-7 space-y-3 border border-white/10" style={{ background: "#141414" }}>
              <div className="w-11 h-11 rounded-full flex items-center justify-center mb-5" style={{ background: isRojo ? "rgba(239,68,68,0.12)" : "rgba(184,194,204,0.1)" }}>
                <HiOutlineCheckCircle className="size-5" style={{ color: isRojo ? "#ef4444" : "#b8c2cc" }} />
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
            <span className={isRojo ? "section-badge-jds mb-5" : isCeleste ? "section-badge-celeste mb-5" : "section-badge mb-5"}>Ubicación</span>
            <h2 className={`text-3xl md:text-4xl font-medium ${isRojo ? "text-jds" : isCeleste ? "text-celeste" : "text-gold"} mb-3`}>Dónde Encontrarnos</h2>
            <p className="text-slate-400 text-sm">Visitanos en nuestras instalaciones o coordiná tu turno previo</p>
          </div>

          <div className="glass-panel rounded-[28px] p-8 md:p-10 border border-white/10 text-left max-w-2xl mx-auto space-y-6" style={{ background: "#101010" }}>
            <div className="flex items-start gap-4">
              <FaMapMarkerAlt className={`size-5 ${isRojo ? "text-red-500" : isCeleste ? "text-sky-400" : "text-gold"} shrink-0 mt-1`} />
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Dirección</p>
                <p className="text-white text-base font-medium">{biz.direccion}</p>
                <p className="text-slate-400 text-sm">{biz.ciudad}{biz.provincia ? `, ${biz.provincia}` : ", Argentina"}</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <FaClock className={`size-5 ${isRojo ? "text-red-500" : isCeleste ? "text-sky-400" : "text-gold"} shrink-0 mt-1`} />
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Horario de Atención</p>
                <p className="text-white text-sm">
                  {biz.horario ?? "Lunes a Viernes: 09:00 a 19:00 | Sábados: Turno previo"}
                </p>
              </div>
            </div>

            {biz.instagram && (
              <div className="flex items-start gap-4">
                <FaInstagram className={`size-5 ${isRojo ? "text-red-500" : isCeleste ? "text-sky-400" : "text-gold"} shrink-0 mt-1`} />
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Instagram</p>
                  <a
                    href={`https://instagram.com/${biz.instagram}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`text-white text-sm ${isRojo ? "hover:text-red-400" : "hover:text-gold"} transition-colors font-medium underline underline-offset-4 decoration-slate-600`}
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
                className={`${isRojo ? "btn-outline-jds" : isCeleste ? "btn-outline-celeste" : "btn-outline-gold"} flex-1 text-center py-3 rounded-full text-xs font-semibold uppercase tracking-wider`}
              >
                Ver en Google Maps ↗
              </a>
              <a
                href={waHref(biz, msgPresupuesto)}
                target="_blank"
                rel="noopener noreferrer"
                className={`${isRojo ? "btn-jds" : isCeleste ? "btn-celeste" : "btn-gold"} flex-1 inline-flex items-center justify-center gap-2 py-3 rounded-full text-xs font-semibold uppercase tracking-wider`}
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
          <span className={isRojo ? "section-badge-jds mb-3" : isCeleste ? "section-badge-celeste mb-3" : "section-badge mb-3"}>Sobre nosotros</span>
          <h2 className={`text-3xl md:text-4xl font-medium ${isRojo ? "text-jds" : isCeleste ? "text-celeste" : "text-gold"} mb-3`}>
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
              className={`${isRojo ? "btn-jds" : isCeleste ? "btn-celeste" : "btn-gold"} inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-xs font-semibold uppercase tracking-wider active:scale-95 transition-transform`}
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
            background: isRojo
              ? "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.12) 20%, rgba(239,68,68,0.5) 50%, rgba(255,255,255,0.12) 80%, transparent 100%)"
              : isCeleste
              ? "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.12) 20%, rgba(56,189,248,0.5) 50%, rgba(255,255,255,0.12) 80%, transparent 100%)"
              : "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.12) 20%, rgba(210,225,245,0.35) 50%, rgba(255,255,255,0.12) 80%, transparent 100%)",
          }}
        />

        {biz.logo_url && (
          <div className="flex justify-center mb-8">
            <div className="relative group">
              <div
                className="absolute inset-0 rounded-full blur-2xl opacity-45 scale-125 pointer-events-none"
                style={{
                  background: isRojo
                    ? "radial-gradient(ellipse at center, rgba(239,68,68,0.40) 0%, rgba(185,28,28,0.20) 45%, transparent 75%)"
                    : "radial-gradient(ellipse at center, rgba(195,205,220,0.40) 0%, rgba(150,165,185,0.20) 45%, transparent 75%)",
                }}
              />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={biz.logo_url}
                alt={biz.nombre}
                className={`relative z-10 h-16 sm:h-22 md:h-28 w-auto max-w-[85vw] sm:max-w-[420px] object-contain opacity-95 hover:opacity-100 transition-all drop-shadow-[0_8px_30px_rgba(0,0,0,0.8)] ${isRojo ? "drop-shadow-[0_0_25px_rgba(239,68,68,0.35)]" : "drop-shadow-[0_0_25px_rgba(195,205,220,0.3)]"} hover:scale-105`}
              />
            </div>
          </div>
        )}

        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-slate-400 font-light">
          <span>© {new Date().getFullYear()} {biz.nombre} · {isRojo ? "Taller de Estética del Auto" : isCeleste ? "Estética Vehicular" : "Detailing Automotriz"} en {biz.ciudad}{biz.provincia ? `, ${biz.provincia}` : ""}</span>
          <span>{biz.direccion} · {biz.telefono}</span>
        </div>
      </footer>

      {/* 9. BOTÓN FLOTANTE DE WHATSAPP */}
      <div className="fixed bottom-6 right-6 z-50 animate-fade-in">
        <a
          href={waHref(biz, "¡Hola! Vi su página web y quería hacerles una consulta.")}
          target="_blank"
          rel="noopener noreferrer"
          className={`flex items-center gap-2.5 rounded-full ${
            isRojo
              ? "bg-neutral-950/90 hover:bg-neutral-900 text-white shadow-[0_10px_35px_rgba(0,0,0,0.8),0_0_20px_rgba(220,38,38,0.25)] border border-red-500/40 hover:border-red-500/70 backdrop-blur-md"
              : isCeleste
              ? "bg-sky-500 hover:bg-sky-400 text-slate-950 shadow-[0_0_25px_rgba(56,189,248,0.55)] border border-sky-300/40"
              : "bg-emerald-500 hover:bg-emerald-400 text-black shadow-2xl"
          } px-4 py-3 font-semibold text-xs uppercase tracking-wider hover:scale-105 active:scale-95 transition-all`}
          aria-label="Contactar por WhatsApp"
        >
          <FaWhatsapp className={`size-5 ${isRojo ? "text-red-500" : ""}`} />
          <span className="hidden sm:inline">¿Dudas? Escribinos</span>
        </a>
      </div>
    </div>
  );
}
