"use client";

import { useState, useRef } from "react";
import { FaPlay, FaPause, FaVolumeHigh, FaVolumeXmark } from "react-icons/fa6";
import { LuSparkles, LuArrowRight } from "react-icons/lu";

interface VideoItem {
  id: string;
  src: string;
  poster: string;
  titulo: string;
  subtitulo: string;
}

const VIDEOS: VideoItem[] = [
  {
    id: "v1",
    src: "/videos/platinum/1.mp4",
    poster: "/videos/platinum/1-thumb.jpg",
    titulo: "Corrección & Acabado Espejo",
    subtitulo: "Eliminación de microrrayones y sellado con alto brillo",
  },
  {
    id: "v2",
    src: "/videos/platinum/2.mp4",
    poster: "/videos/platinum/2-thumb.jpg",
    titulo: "Lavado Técnico con Espuma",
    subtitulo: "Método anti-rayones a presión y descontaminado",
  },
  {
    id: "v3",
    src: "/videos/platinum/3.mp4",
    poster: "/videos/platinum/3-thumb.jpg",
    titulo: "Detallado Interior a Vapor",
    subtitulo: "Extracción profunda en vestiduras y desinfección",
  },
  {
    id: "v4",
    src: "/videos/platinum/4.mp4",
    poster: "/videos/platinum/4-thumb.jpg",
    titulo: "Entrega Final en Domicilio",
    subtitulo: "Transformación integral sin salir de tu cochera",
  },
];

export default function VideosPlatinum() {
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const videoRefs = useRef<Record<string, HTMLVideoElement | null>>({});

  const togglePlay = (id: string) => {
    const video = videoRefs.current[id];
    if (!video) return;

    if (playingId === id) {
      video.pause();
      setPlayingId(null);
    } else {
      // Pausar cualquier otro video activo
      if (playingId && videoRefs.current[playingId]) {
        videoRefs.current[playingId]?.pause();
      }
      video.muted = isMuted;
      video.play().catch(() => {});
      setPlayingId(id);
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    if (playingId && videoRefs.current[playingId]) {
      videoRefs.current[playingId]!.muted = nextMuted;
    }
  };

  const scrollToCotizador = () => {
    const el = document.getElementById("cotizador");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="relative px-4 sm:px-8 py-20 bg-[#0d0d10] border-b border-white/10 overflow-hidden">
      {/* Sombra de fondo sutil */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-amber-500/5 blur-[130px] pointer-events-none rounded-full" />

      <div className="max-w-6xl mx-auto space-y-10 relative z-10">
        
        {/* Encabezado */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-neutral-300">
            <LuSparkles className="text-amber-400 text-xs" />
            Resultados Reales en Querétaro
          </div>
          <h2 className="text-2xl sm:text-4xl font-semibold tracking-tight text-white">
            Así Trabajamos en tu <span className="text-amber-400">Cochera</span>
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400">
            Procesos técnicos documentados en video. Sin filtros: observa el nivel de detalle y cuidado profesional que recibe cada vehículo a domicilio.
          </p>
        </div>

        {/* Grid de Videos Verticales (Estilo Reels / Shorts) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {VIDEOS.map((item) => {
            const isPlaying = playingId === item.id;

            return (
              <div
                key={item.id}
                onClick={() => togglePlay(item.id)}
                className="group relative rounded-2xl overflow-hidden aspect-[9/16] bg-black border border-white/10 hover:border-amber-400/50 transition-all duration-300 cursor-pointer shadow-xl flex flex-col justify-end"
              >
                {/* Elemento de Video */}
                <video
                  ref={(el) => {
                    videoRefs.current[item.id] = el;
                  }}
                  src={item.src}
                  poster={item.poster}
                  loop
                  playsInline
                  preload="metadata"
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />

                {/* Gradiente oscuro inferior para legibilidad */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-black/30 pointer-events-none" />

                {/* Botón Central de Play si está pausado */}
                {!isPlaying && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white flex items-center justify-center group-hover:scale-110 group-hover:bg-amber-400 group-hover:text-black group-hover:border-amber-300 transition-all shadow-lg">
                      <FaPlay className="text-sm ml-0.5" />
                    </div>
                  </div>
                )}

                {/* Controles superiores cuando está reproduciendo */}
                {isPlaying && (
                  <div className="absolute top-3 right-3 flex items-center gap-2 z-20">
                    <button
                      type="button"
                      onClick={toggleMute}
                      className="p-2 rounded-full bg-black/60 backdrop-blur-md text-white border border-white/20 hover:bg-white/20 transition"
                      aria-label={isMuted ? "Activar sonido" : "Silenciar"}
                    >
                      {isMuted ? (
                        <FaVolumeXmark className="text-xs" />
                      ) : (
                        <FaVolumeHigh className="text-xs text-amber-400" />
                      )}
                    </button>
                    <div className="p-2 rounded-full bg-black/60 backdrop-blur-md text-white border border-white/20">
                      <FaPause className="text-xs" />
                    </div>
                  </div>
                )}

                {/* Información y Texto inferior */}
                <div className="relative z-10 p-4 space-y-1">
                  <div className="inline-block px-2 py-0.5 rounded bg-black/50 backdrop-blur-sm border border-white/10 text-[10px] font-semibold text-amber-300 uppercase tracking-wider">
                    Querétaro
                  </div>
                  <h4 className="text-xs sm:text-sm font-bold text-white leading-tight">
                    {item.titulo}
                  </h4>
                  <p className="text-[11px] text-neutral-300 line-clamp-2 leading-snug">
                    {item.subtitulo}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA para conectar con el cotizador */}
        <div className="text-center pt-2">
          <button
            type="button"
            onClick={scrollToCotizador}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/5 hover:bg-white/10 border border-white/15 hover:border-amber-400/40 text-xs sm:text-sm font-semibold text-neutral-200 transition-all"
          >
            <span>¿Quieres este resultado en tu auto? Cotiza en línea</span>
            <LuArrowRight className="text-amber-400" />
          </button>
        </div>

      </div>
    </section>
  );
}
