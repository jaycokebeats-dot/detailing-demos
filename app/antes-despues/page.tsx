"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import type { Business } from "@/data/business-helpers";
import { DEFAULT_DEMO_BUSINESS } from "@/data/demo-business";
import { getBusinessData } from "@/lib/supabase";
import {
  PRESETS,
  PRESET_PINTURA_ANTES,
  PRESET_PINTURA_DESPUES,
  type PresetItem,
} from "./presets";

type AspectRatio = "9:16" | "4:5" | "1:1";
type SplitStyle = "vertical" | "diagonal";

export default function AntesDespuesPage() {
  const [biz, setBiz] = useState<Business>(DEFAULT_DEMO_BUSINESS);
  const [currentSlug, setCurrentSlug] = useState<string>("demo");
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Datos personalizables del taller y servicio
  const [tallerNombre, setTallerNombre] = useState<string>("");
  const [servicioNombre, setServicioNombre] = useState<string>("Corrección de Pintura & Cerámico 9H");
  const [vehiculoModelo, setVehiculoModelo] = useState<string>("BMW M4 Competition");
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("9:16");
  const [splitStyle, setSplitStyle] = useState<SplitStyle>("vertical");

  // Fotos cargadas (Data URLs)
  const [fotoAntes, setFotoAntes] = useState<string>(PRESET_PINTURA_ANTES);
  const [fotoDespues, setFotoDespues] = useState<string>(PRESET_PINTURA_DESPUES);
  const [presetActivo, setPresetActivo] = useState<string>("pintura");

  // Posición del slider interactivo (0 a 100%)
  const [sliderPos, setSliderPos] = useState<number>(50);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Estados de exportación
  const [generatingVideo, setGeneratingVideo] = useState<boolean>(false);
  const [videoProgress, setVideoProgress] = useState<number>(0);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoMimeType, setVideoMimeType] = useState<string>("video/mp4");
  const [generatingImage, setGeneratingImage] = useState<boolean>(false);
  const [canShare, setCanShare] = useState<boolean>(false);

  // Pestaña de exportación seleccionada
  const [exportTab, setExportTab] = useState<"video" | "split" | "carrusel">("video");

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Carga inicial del taller desde URL
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const slug = (params.get("taller") || params.get("slug") || "demo").toLowerCase().trim();
      setCurrentSlug(slug);

      if (typeof navigator !== "undefined" && typeof (navigator as any).canShare === "function") {
        setCanShare(true);
      }

      async function load() {
        setLoading(true);
        try {
          const supabaseData = await getBusinessData(slug);
          if (supabaseData && supabaseData.nombre) {
            setBiz(supabaseData);
            setTallerNombre(supabaseData.nombre);
            setLoading(false);
            return;
          }

          if (slug !== "demo" && slug !== "taller-demo") {
            const res = await fetch(`/api/workshops?slug=${encodeURIComponent(slug)}`);
            if (res.ok) {
              const data = await res.json();
              setBiz(data);
              setTallerNombre(data.nombre || "The Zone Car Detailing");
              setLoading(false);
              return;
            }
          }

          setBiz(DEFAULT_DEMO_BUSINESS);
          setTallerNombre(DEFAULT_DEMO_BUSINESS.nombre || "The Zone Car Detailing");
        } catch (e) {
          console.error("Error al cargar taller:", e);
          setBiz(DEFAULT_DEMO_BUSINESS);
          setTallerNombre(DEFAULT_DEMO_BUSINESS.nombre || "The Zone Car Detailing");
        } finally {
          setLoading(false);
        }
      }

      load();
    }
  }, []);

  // Manejo de carga de fotos personalizadas
  const handleFileUpload = (type: "antes" | "despues", e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        if (type === "antes") {
          setFotoAntes(event.target.result as string);
        } else {
          setFotoDespues(event.target.result as string);
        }
        setPresetActivo("custom");
        setVideoUrl(null);
        showToast(`📸 Foto del ${type.toUpperCase()} actualizada`);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAplicarPreset = (preset: PresetItem) => {
    setFotoAntes(preset.fotoAntes);
    setFotoDespues(preset.fotoDespues);
    setServicioNombre(preset.servicioSugerido);
    setPresetActivo(preset.id);
    setVideoUrl(null);
    showToast(`✨ Ejemplo "${preset.nombre}" cargado`);
  };

  const handleInvertirFotos = () => {
    const temp = fotoAntes;
    setFotoAntes(fotoDespues);
    setFotoDespues(temp);
    setVideoUrl(null);
    showToast("🔄 Fotos invertidas");
  };

  // Manejo táctil / mouse del slider interactivo
  const updateSliderPosition = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percent = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPos(percent);
  }, []);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDragging(true);
    updateSliderPosition(e.clientX);
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    updateSliderPosition(e.clientX);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDragging(false);
    (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
  };

  // Helpers para cargar Image en memoria
  const loadImage = (src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => resolve(img);
      img.onerror = (err) => reject(err);
      img.src = src;
    });
  };

  // Dimensiones según el aspect ratio elegido
  const getExportDimensions = () => {
    if (aspectRatio === "9:16") return { width: 1080, height: 1920 };
    if (aspectRatio === "4:5") return { width: 1080, height: 1350 };
    return { width: 1080, height: 1080 };
  };

  // Dibuja un fotograma completo en el canvas (usado tanto para video como para imagen)
  const drawFrame = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    imgAntes: HTMLImageElement,
    imgDespues: HTMLImageElement,
    splitPercent: number,
    style: SplitStyle = "vertical"
  ) => {
    // 1. Fondo base negro
    ctx.fillStyle = "#0a0a0c";
    ctx.fillRect(0, 0, width, height);

    const splitX = (splitPercent / 100) * width;

    // Helper para escalar imagen cubriendo el área (object-fit: cover)
    const drawCover = (img: HTMLImageElement) => {
      const imgRatio = img.width / img.height;
      const targetRatio = width / height;
      let drawW = width;
      let drawH = height;
      let offX = 0;
      let offY = 0;

      if (imgRatio > targetRatio) {
        drawW = height * imgRatio;
        offX = -(drawW - width) / 2;
      } else {
        drawH = width / imgRatio;
        offY = -(drawH - height) / 2;
      }
      ctx.drawImage(img, offX, offY, drawW, drawH);
    };

    // 2. Dibujar foto "DESPUÉS" completa de fondo
    ctx.save();
    drawCover(imgDespues);
    ctx.restore();

    // 3. Dibujar foto "ANTES" recortada en la zona izquierda
    ctx.save();
    ctx.beginPath();
    if (style === "diagonal") {
      // Corte diagonal estilizado
      const offset = height * 0.2;
      ctx.moveTo(0, 0);
      ctx.lineTo(splitX + offset, 0);
      ctx.lineTo(splitX - offset, height);
      ctx.lineTo(0, height);
      ctx.closePath();
    } else {
      // Corte vertical recto estándar
      ctx.rect(0, 0, splitX, height);
    }
    ctx.clip();
    drawCover(imgAntes);
    ctx.restore();

    // 4. Dibujar la línea divisoria con resplandor dorado / blanco
    ctx.save();
    ctx.beginPath();
    if (style === "diagonal") {
      const offset = height * 0.2;
      ctx.moveTo(splitX + offset, 0);
      ctx.lineTo(splitX - offset, height);
    } else {
      ctx.moveTo(splitX, 0);
      ctx.lineTo(splitX, height);
    }

    // Glow exterior
    ctx.strokeStyle = "rgba(251, 191, 36, 0.4)";
    ctx.lineWidth = 8;
    ctx.stroke();

    // Línea interior nítida
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.restore();

    // 5. Etiquetas "ANTES" y "DESPUÉS"
    const pillY = height * 0.08;

    // Etiqueta ANTES (izquierda)
    if (splitPercent > 12) {
      ctx.save();
      ctx.fillStyle = "rgba(15, 23, 42, 0.85)";
      ctx.beginPath();
      if (typeof ctx.roundRect === "function") {
        ctx.roundRect(50, pillY, 140, 52, 26);
        ctx.fill();
        ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
        ctx.lineWidth = 2;
        ctx.stroke();
      } else {
        ctx.fillRect(50, pillY, 140, 52);
      }
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 22px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("ANTES", 120, pillY + 34);
      ctx.restore();
    }

    // Etiqueta DESPUÉS (derecha)
    if (splitPercent < 88) {
      ctx.save();
      ctx.fillStyle = "rgba(245, 158, 11, 0.95)";
      ctx.beginPath();
      if (typeof ctx.roundRect === "function") {
        ctx.roundRect(width - 210, pillY, 160, 52, 26);
        ctx.fill();
        ctx.strokeStyle = "#fef3c7";
        ctx.lineWidth = 2;
        ctx.stroke();
      } else {
        ctx.fillRect(width - 210, pillY, 160, 52);
      }
      ctx.fillStyle = "#0a0a0c";
      ctx.font = "black 22px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("DESPUÉS", width - 130, pillY + 34);
      ctx.restore();
    }

    // 6. Barra inferior de Marca de Agua del Taller (Lower Third Luxury)
    const barH = height * 0.13;
    const barY = height - barH;

    // Gradiente oscuro de fondo para máxima legibilidad
    const barGrad = ctx.createLinearGradient(0, barY - 40, 0, height);
    barGrad.addColorStop(0, "rgba(0, 0, 0, 0)");
    barGrad.addColorStop(0.3, "rgba(10, 10, 12, 0.85)");
    barGrad.addColorStop(1, "rgba(10, 10, 12, 0.98)");
    ctx.fillStyle = barGrad;
    ctx.fillRect(0, barY - 40, width, barH + 40);

    // Borde superior dorado sutil
    ctx.strokeStyle = "rgba(251, 191, 36, 0.35)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(50, barY);
    ctx.lineTo(width - 50, barY);
    ctx.stroke();

    // Textos del Taller
    ctx.textAlign = "left";

    // Nombre del Taller
    ctx.fillStyle = "#ffffff";
    ctx.font = "900 36px sans-serif";
    const nombreDisplay = (tallerNombre.trim() || biz.nombre || "TALLER DE DETAILING").toUpperCase();
    ctx.fillText(nombreDisplay, 60, barY + 52);

    // Badge verificado ✓
    ctx.fillStyle = "#fbbf24";
    ctx.font = "bold 22px sans-serif";
    ctx.fillText("✓", 60 + ctx.measureText(nombreDisplay).width + 12, barY + 48);

    // Servicio / Tratamiento
    ctx.fillStyle = "#fbbf24";
    ctx.font = "bold 22px sans-serif";
    const servicioDisplay = (servicioNombre.trim() || "Tratamiento Cerámico & Detailing").toUpperCase();
    ctx.fillText(servicioDisplay, 60, barY + 92);

    // Ciudad / Redes en la esquina derecha
    ctx.textAlign = "right";
    ctx.fillStyle = "#94a3b8";
    ctx.font = "600 20px sans-serif";
    ctx.fillText(biz.ciudad || "Estética Vehicular", width - 60, barY + 52);

    ctx.fillStyle = "#cbd5e1";
    ctx.font = "bold 18px monospace";
    ctx.fillText("detailing-demos.vercel.app", width - 60, barY + 92);
  };

  // EXPORTACIÓN A VIDEO ANIMADO (REELS / STORIES / TIKTOK)
  const handleExportVideo = async (mode: "download" | "share" = "download") => {
    if (generatingVideo) return;
    setGeneratingVideo(true);
    setVideoProgress(5);

    try {
      const [imgAntes, imgDespues] = await Promise.all([
        loadImage(fotoAntes),
        loadImage(fotoDespues),
      ]);

      // Dimensiones optimizadas para renderizado suave en navegador (720x1280 o 720x720)
      const isVertical = aspectRatio === "9:16";
      const is45 = aspectRatio === "4:5";
      const videoW = 720;
      const videoH = isVertical ? 1280 : is45 ? 900 : 720;

      const canvas = document.createElement("canvas");
      canvas.width = videoW;
      canvas.height = videoH;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) throw new Error("No canvas 2D");

      // Buscar el MIME type soportado por el navegador
      const mimeTypes = [
        "video/mp4;codecs=avc1",
        "video/mp4",
        "video/webm;codecs=vp9",
        "video/webm;codecs=vp8",
        "video/webm",
      ];
      let selectedMime = mimeTypes.find((t) => typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(t));
      if (!selectedMime) selectedMime = "video/webm";
      setVideoMimeType(selectedMime);

      const stream = canvas.captureStream(30);
      const recorder = new MediaRecorder(stream, {
        mimeType: selectedMime,
        videoBitsPerSecond: 4000000,
      });

      const chunks: Blob[] = [];
      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunks.push(e.data);
      };

      const recordPromise = new Promise<Blob>((resolve, reject) => {
        recorder.onstop = () => {
          const blob = new Blob(chunks, { type: selectedMime });
          resolve(blob);
        };
        recorder.onerror = (err) => reject(err);
      });

      recorder.start();

      // Animación de barrido: 135 cuadros (4.5 segundos a 30 FPS)
      // 0 - 55 frames: barrido de 0% a 100% (revela el resultado brillante)
      // 55 - 90 frames: pausa en 100% para apreciar el brillo cerámico
      // 90 - 125 frames: regresa suavemente al 50%
      // 125 - 135 frames: pausa final en 50%
      const totalFrames = 135;

      for (let f = 0; f < totalFrames; f++) {
        let percent = 50;

        if (f <= 55) {
          // Curva ease-in-out de 0% a 100%
          const t = f / 55;
          const ease = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
          percent = ease * 100;
        } else if (f <= 90) {
          percent = 100;
        } else if (f <= 125) {
          const t = (f - 90) / 35;
          const ease = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
          percent = 100 - ease * 50; // Vuelve a 50%
        } else {
          percent = 50;
        }

        drawFrame(ctx, videoW, videoH, imgAntes, imgDespues, percent, splitStyle);

        // Actualizar progreso visible
        if (f % 15 === 0) {
          setVideoProgress(Math.round((f / totalFrames) * 90));
        }

        // Delay para sincronizar con la tasa de cuadros del stream
        await new Promise((r) => setTimeout(r, 28));
      }

      setVideoProgress(95);
      recorder.stop();

      const videoBlob = await recordPromise;
      setVideoProgress(100);

      const isMp4 = selectedMime.includes("mp4");
      const ext = isMp4 ? "mp4" : "webm";
      const cleanName = (tallerNombre || "Detailing").replace(/[^a-zA-Z0-9]/g, "_");
      const fileName = `Reel_AntesDespues_${cleanName}.${ext}`;

      const blobUrl = URL.createObjectURL(videoBlob);
      setVideoUrl(blobUrl);

      // Si el usuario eligió compartir directamente en celular
      if (mode === "share" && typeof navigator !== "undefined" && typeof (navigator as any).canShare === "function") {
        try {
          const file = new File([videoBlob], fileName, { type: selectedMime });
          if ((navigator as any).canShare({ files: [file] })) {
            await navigator.share({
              files: [file],
              title: `Antes y Después - ${tallerNombre}`,
              text: `Transformación ${servicioNombre} en ${tallerNombre} 🚗✨`,
            });
            showToast("✨ ¡Video compartido exitosamente!");
            setGeneratingVideo(false);
            return;
          }
        } catch (shareErr: any) {
          if (shareErr?.name === "AbortError") {
            setGeneratingVideo(false);
            return;
          }
        }
      }

      // Descarga directa tradicional
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      showToast(`🎬 ¡Video descargado listo para Reels y Stories! (${ext.toUpperCase()})`);
      setGeneratingVideo(false);
    } catch (err) {
      console.error("Error al generar video:", err);
      showToast("⚠️ Tu navegador no soporta grabación directa de video. Descargá la Imagen Split HD.");
      setGeneratingVideo(false);
    }
  };

  // EXPORTACIÓN A IMAGEN SPLIT HD (PNG 1080p)
  const handleExportImage = async (mode: "download" | "share" = "download") => {
    if (generatingImage) return;
    setGeneratingImage(true);

    try {
      const [imgAntes, imgDespues] = await Promise.all([
        loadImage(fotoAntes),
        loadImage(fotoDespues),
      ]);

      const { width, height } = getExportDimensions();
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("No context 2d");

      // Dibuja con la posición actual del slider o 50%
      drawFrame(ctx, width, height, imgAntes, imgDespues, sliderPos, splitStyle);

      const cleanName = (tallerNombre || "Detailing").replace(/[^a-zA-Z0-9]/g, "_");
      const fileName = `Split_${cleanName}_AntesDespues.png`;

      canvas.toBlob(async (blob) => {
        if (!blob) {
          setGeneratingImage(false);
          return;
        }

        if (mode === "share" && typeof navigator !== "undefined" && typeof (navigator as any).canShare === "function") {
          try {
            const file = new File([blob], fileName, { type: "image/png" });
            if ((navigator as any).canShare({ files: [file] })) {
              await navigator.share({
                files: [file],
                title: `Comparativa Antes/Después - ${tallerNombre}`,
                text: `${servicioNombre} en ${tallerNombre}`,
              });
              showToast("✨ ¡Imagen compartida!");
              setGeneratingImage(false);
              return;
            }
          } catch (shareErr: any) {
            if (shareErr?.name === "AbortError") {
              setGeneratingImage(false);
              return;
            }
          }
        }

        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 2000);

        showToast("🖼️ ¡Imagen HD descargada lista para publicar!");
        setGeneratingImage(false);
      }, "image/png");
    } catch (err) {
      console.error("Error al exportar imagen:", err);
      showToast("⚠️ Error al generar imagen");
      setGeneratingImage(false);
    }
  };

  // EXPORTACIÓN DE PACK DE 2 FOTOS PARA CARRUSEL ("Deslizá 👉")
  const handleExportCarrusel = async (slide: 1 | 2) => {
    try {
      const { width, height } = getExportDimensions();
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const imgTarget = await loadImage(slide === 1 ? fotoAntes : fotoDespues);

      // Dibujar foto completa
      ctx.fillStyle = "#0a0a0c";
      ctx.fillRect(0, 0, width, height);

      const imgRatio = imgTarget.width / imgTarget.height;
      const targetRatio = width / height;
      let drawW = width;
      let drawH = height;
      let offX = 0;
      let offY = 0;

      if (imgRatio > targetRatio) {
        drawW = height * imgRatio;
        offX = -(drawW - width) / 2;
      } else {
        drawH = width / imgRatio;
        offY = -(drawH - height) / 2;
      }
      ctx.drawImage(imgTarget, offX, offY, drawW, drawH);

      // Marca de agua y Badge del carrusel
      const barH = height * 0.12;
      const barY = height - barH;

      ctx.fillStyle = "rgba(10, 10, 12, 0.9)";
      ctx.fillRect(0, barY, width, barH);
      ctx.strokeStyle = "#fbbf24";
      ctx.lineWidth = 3;
      ctx.strokeRect(0, barY, width, 1);

      ctx.textAlign = "left";
      ctx.fillStyle = "#ffffff";
      ctx.font = "900 32px sans-serif";
      ctx.fillText((tallerNombre || "TALLER").toUpperCase(), 50, barY + 48);

      ctx.fillStyle = "#fbbf24";
      ctx.font = "bold 20px sans-serif";
      ctx.fillText(servicioNombre.toUpperCase(), 50, barY + 85);

      // Indicador de diapositiva
      ctx.textAlign = "right";
      ctx.fillStyle = slide === 1 ? "#f59e0b" : "#34d399";
      ctx.font = "bold 26px sans-serif";
      const badgeText = slide === 1 ? "1/2 ANTES • Deslizá 👉" : "2/2 RESULTADO FINAL ✨";
      ctx.fillText(badgeText, width - 50, barY + 65);

      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `Carrusel_${slide}_${slide === 1 ? "ANTES" : "DESPUES"}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        showToast(`📥 Foto ${slide}/2 descargada`);
      });
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="admin-scope min-h-screen bg-[#0a0a0c] text-neutral-100 font-sans selection:bg-amber-400/30 selection:text-amber-400 pb-28">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-neutral-900 border border-amber-400/40 text-neutral-100 px-5 py-3 rounded-2xl shadow-2xl shadow-black flex items-center gap-3 text-xs sm:text-sm font-medium animate-fade-in backdrop-blur-md">
          <span className="text-amber-400 text-base">✨</span>
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8">
        {/* HEADER */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-neutral-800">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="text-xs font-mono uppercase tracking-wider text-amber-400 px-2.5 py-0.5 rounded-full bg-amber-400/10 border border-amber-400/30 font-bold">
                Creador de Contenido & Reels
              </span>
              <span className="text-xs text-neutral-400">
                Para Instagram, TikTok & WhatsApp
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Generador Express de "Antes y Después"
            </h1>
            <p className="text-xs sm:text-sm text-neutral-400 mt-0.5">
              Crea videos con barrido automático, fotos comparativas en HD y carruseles con la marca de{" "}
              <strong className="text-neutral-200">{tallerNombre || "tu Taller"}</strong>.
            </p>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <button
              type="button"
              onClick={handleInvertirFotos}
              className="bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 hover:text-white text-xs font-semibold px-3 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
              title="Invertir foto del Antes por la del Después"
            >
              <span>🔄</span>
              <span>Invertir Fotos</span>
            </button>

            <a
              href={`/d/${currentSlug}/`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-300 hover:text-white text-xs font-semibold px-3 py-2 rounded-xl transition-all flex items-center gap-1.5"
            >
              <span>🔗</span>
              <span className="hidden sm:inline">Ver Web</span>
            </a>
          </div>
        </header>

        {loading ? (
          <div className="py-20 text-center text-neutral-400 text-sm flex flex-col items-center gap-2">
            <span className="w-6 h-6 border-2 border-neutral-400 border-t-transparent rounded-full animate-spin" />
            <span>Cargando datos del taller...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mt-6">
            {/* COLUMNA IZQUIERDA: CONTROLES & FOTOS (5 cols) */}
            <div className="lg:col-span-5 space-y-5">
              {/* PASO 1: CARGA DE FOTOS */}
              <div className="bg-[#121214] border border-neutral-800 rounded-3xl p-5 space-y-4 shadow-xl">
                <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                  <span className="text-xs font-bold text-neutral-200 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-amber-400/20 text-amber-400 text-[11px] font-bold flex items-center justify-center">
                      1
                    </span>
                    <span>Tus Fotos (Cargar o Probar)</span>
                  </span>
                  <span className="text-[11px] text-neutral-400">
                    {presetActivo === "custom" ? "Fotos propias ✓" : "Ejemplo activo"}
                  </span>
                </div>

                {/* Subida de Fotos Lado a Lado */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Foto ANTES */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">
                      🔴 Foto del ANTES
                    </label>
                    <div className="relative aspect-square rounded-2xl overflow-hidden bg-neutral-900 border border-neutral-800 group">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={fotoAntes} alt="Antes" className="w-full h-full object-cover" />
                      <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer p-2 text-center">
                        <span className="text-lg">📷</span>
                        <span className="text-[11px] font-bold text-white mt-1">Cambiar Foto</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileUpload("antes", e)}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>

                  {/* Foto DESPUÉS */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block">
                      ✨ Foto del DESPUÉS
                    </label>
                    <div className="relative aspect-square rounded-2xl overflow-hidden bg-neutral-900 border border-amber-500/30 group">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={fotoDespues} alt="Después" className="w-full h-full object-cover" />
                      <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer p-2 text-center">
                        <span className="text-lg">📷</span>
                        <span className="text-[11px] font-bold text-amber-300 mt-1">Cambiar Foto</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileUpload("despues", e)}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                </div>

                {/* Ejemplos de Detailing Pre-cargados para probar rápido */}
                <div className="pt-2 border-t border-neutral-800/80">
                  <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block mb-2">
                    O probá con estos ejemplos del taller:
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    {PRESETS.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => handleAplicarPreset(p)}
                        className={`p-2 rounded-xl border text-left transition-all cursor-pointer ${
                          presetActivo === p.id
                            ? "bg-amber-500/15 border-amber-400/60 shadow-sm"
                            : "bg-neutral-900/60 border-neutral-800 hover:border-neutral-700"
                        }`}
                      >
                        <span className="text-base block">{p.icon}</span>
                        <span className="text-[11px] font-bold text-neutral-200 block truncate mt-0.5">
                          {p.nombre}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* PASO 2: PERSONALIZACIÓN DE MARCA */}
              <div className="bg-[#121214] border border-neutral-800 rounded-3xl p-5 space-y-4 shadow-xl">
                <div className="flex items-center gap-2 border-b border-neutral-800 pb-3">
                  <span className="w-5 h-5 rounded-full bg-amber-400/20 text-amber-400 text-[11px] font-bold flex items-center justify-center">
                    2
                  </span>
                  <span className="text-xs font-bold text-neutral-200">
                    Marca de Agua & Formato
                  </span>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-400 mb-1">
                      Nombre del Taller / Negocio
                    </label>
                    <input
                      type="text"
                      value={tallerNombre}
                      onChange={(e) => setTallerNombre(e.target.value)}
                      placeholder="Ej: The Zone Car Detailing"
                      className="w-full bg-[#18181c] border border-neutral-800 rounded-xl px-3.5 py-2 text-neutral-200 focus:outline-none focus:border-amber-400 font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-400 mb-1">
                      Servicio o Tratamiento Realizado
                    </label>
                    <input
                      type="text"
                      value={servicioNombre}
                      onChange={(e) => setServicioNombre(e.target.value)}
                      placeholder="Ej: Corrección de Pintura & Cerámico 9H"
                      className="w-full bg-[#18181c] border border-neutral-800 rounded-xl px-3.5 py-2 text-neutral-200 focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  {/* Selector de Proporción / Formato para Redes */}
                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-400 mb-1.5">
                      Formato de Destino:
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: "9:16", label: "9:16 Vertical", sub: "Reels / Stories" },
                        { id: "4:5", label: "4:5 Feed", sub: "Post Vertical IG" },
                        { id: "1:1", label: "1:1 Cuadrado", sub: "Post Clásico" },
                      ].map((asp) => (
                        <button
                          key={asp.id}
                          type="button"
                          onClick={() => setAspectRatio(asp.id as AspectRatio)}
                          className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                            aspectRatio === asp.id
                              ? "bg-amber-400/20 text-amber-300 border-amber-400/60 font-bold shadow-sm"
                              : "bg-[#18181c] border-neutral-800 text-neutral-400 hover:text-white"
                          }`}
                        >
                          <span className="text-xs block">{asp.label}</span>
                          <span className="text-[10px] text-neutral-500 block">{asp.sub}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Estilo de corte: Recto vs Diagonal */}
                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-400 mb-1.5">
                      Estilo de División:
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setSplitStyle("vertical")}
                        className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                          splitStyle === "vertical"
                            ? "bg-neutral-800 text-white border-amber-400/50 shadow-sm"
                            : "bg-[#18181c] border-neutral-800 text-neutral-400"
                        }`}
                      >
                        Vertical Recto
                      </button>
                      <button
                        type="button"
                        onClick={() => setSplitStyle("diagonal")}
                        className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                          splitStyle === "diagonal"
                            ? "bg-neutral-800 text-white border-amber-400/50 shadow-sm"
                            : "bg-[#18181c] border-neutral-800 text-neutral-400"
                        }`}
                      >
                        Diagonal Agresivo ⚡
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* COLUMNA DERECHA: VISOR INTERACTIVO & EXPORTACIÓN (7 cols) */}
            <div className="lg:col-span-7 space-y-5">
              {/* CENTRO DE EXPORTACIÓN (TABS) */}
              <div className="bg-[#121214] p-1.5 rounded-2xl border border-neutral-800 flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setExportTab("video")}
                  className={`flex-1 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    exportTab === "video"
                      ? "bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 text-neutral-950 font-black shadow-md shadow-amber-500/20"
                      : "text-neutral-400 hover:text-white"
                  }`}
                >
                  <span>🎥 Video Reel / Story (MP4)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setExportTab("split")}
                  className={`flex-1 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    exportTab === "split"
                      ? "bg-neutral-800 text-amber-300 border border-amber-400/50 shadow-md"
                      : "text-neutral-400 hover:text-white"
                  }`}
                >
                  <span>🖼️ Imagen Split (PNG)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setExportTab("carrusel")}
                  className={`flex-1 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    exportTab === "carrusel"
                      ? "bg-neutral-800 text-amber-300 border border-amber-400/50 shadow-md"
                      : "text-neutral-400 hover:text-white"
                  }`}
                >
                  <span>📲 Carrusel ("Deslizá 👉")</span>
                </button>
              </div>

              {/* VISOR SLIDER INTERACTIVO */}
              <div className="flex flex-col items-center">
                <div
                  ref={containerRef}
                  onPointerDown={handlePointerDown}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                  className={`relative overflow-hidden rounded-3xl border-2 border-neutral-800 bg-neutral-950 shadow-2xl select-none cursor-ew-resize group w-full ${
                    aspectRatio === "9:16"
                      ? "max-w-[360px] aspect-[9/16]"
                      : aspectRatio === "4:5"
                      ? "max-w-[420px] aspect-[4/5]"
                      : "max-w-[440px] aspect-square"
                  }`}
                >
                  {/* FOTO DESPUÉS (FONDO COMPLETO) */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={fotoDespues}
                    alt="Después"
                    className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                  />

                  {/* FOTO ANTES (CLIPPED CON LA POSICIÓN DEL SLIDER) */}
                  <div
                    style={{
                      clipPath:
                        splitStyle === "diagonal"
                          ? `polygon(0% 0%, ${sliderPos + 15}% 0%, ${sliderPos - 15}% 100%, 0% 100%)`
                          : `polygon(0% 0%, ${sliderPos}% 0%, ${sliderPos}% 100%, 0% 100%)`,
                    }}
                    className="absolute inset-0 w-full h-full pointer-events-none"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={fotoAntes}
                      alt="Antes"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* LÍNEA DIVISORIA DORADA CON TIRADOR */}
                  <div
                    style={{ left: `${sliderPos}%` }}
                    className="absolute top-0 bottom-0 -translate-x-1/2 pointer-events-none z-20 flex flex-col items-center justify-center"
                  >
                    {/* Línea luminosa */}
                    <div className="w-[3px] h-full bg-gradient-to-b from-amber-300 via-amber-400 to-amber-300 shadow-[0_0_15px_rgba(251,191,36,0.9)]" />

                    {/* Tirador táctil central */}
                    <div className="absolute top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-neutral-950 border-2 border-amber-400 text-amber-300 flex items-center justify-center shadow-2xl shadow-black text-xs font-black group-hover:scale-110 transition-transform">
                      <span>◂ ▸</span>
                    </div>
                  </div>

                  {/* BADGES FLOTANTES SUPERIORES */}
                  <div className="absolute top-4 left-4 z-10 pointer-events-none">
                    <span className="bg-black/80 backdrop-blur-md text-white font-black text-[11px] px-3 py-1.5 rounded-full border border-white/20 shadow-lg tracking-wider">
                      ANTES
                    </span>
                  </div>

                  <div className="absolute top-4 right-4 z-10 pointer-events-none">
                    <span className="bg-gradient-to-r from-amber-400 to-amber-500 text-neutral-950 font-black text-[11px] px-3 py-1.5 rounded-full shadow-lg tracking-wider border border-amber-300">
                      DESPUÉS
                    </span>
                  </div>

                  {/* MARCA DE AGUA INFERIOR EN EL SLIDER */}
                  <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black/95 via-black/70 to-transparent z-10 pointer-events-none flex flex-col gap-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="font-extrabold text-sm text-white tracking-tight">
                        {tallerNombre || "The Zone Car Detailing"}
                      </span>
                      <span className="text-amber-400 text-xs">✓</span>
                    </div>
                    <span className="text-[11px] font-bold text-amber-300">
                      {servicioNombre}
                    </span>
                    <span className="text-[10px] text-neutral-400 italic mt-0.5">
                      👆 Arrastrá la línea para comparar el cambio
                    </span>
                  </div>
                </div>

                <span className="text-xs text-neutral-400 mt-2 font-mono">
                  Posición del divisor: {Math.round(sliderPos)}%
                </span>
              </div>

              {/* BOTONES DE ACCIÓN SEGÚN PESTAÑA */}
              <div className="bg-[#121214] border border-neutral-800 rounded-3xl p-5 space-y-4 shadow-xl">
                {/* PESTAÑA 1: VIDEO ANIMADO */}
                {exportTab === "video" && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-white block">
                          Video de Barrido Automático (4.5s)
                        </span>
                        <span className="text-[11px] text-neutral-400">
                          La línea se desliza sola revelando el brillo. Ideal para Reels y Stories.
                        </span>
                      </div>
                      <span className="text-xs font-mono px-2 py-0.5 rounded bg-amber-400/10 text-amber-400 border border-amber-400/20 font-bold">
                        {aspectRatio}
                      </span>
                    </div>

                    {/* Barra de progreso si está grabando */}
                    {generatingVideo && (
                      <div className="space-y-1.5 pt-2">
                        <div className="flex justify-between text-xs font-mono text-neutral-300">
                          <span>Generando video animado...</span>
                          <span>{videoProgress}%</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-neutral-800 overflow-hidden">
                          <div
                            style={{ width: `${videoProgress}%` }}
                            className="h-full bg-gradient-to-r from-amber-400 to-amber-500 transition-all duration-150"
                          />
                        </div>
                      </div>
                    )}

                    {/* Previsualizador de Video si ya se generó */}
                    {videoUrl && (
                      <div className="p-3 bg-neutral-900/80 rounded-2xl border border-amber-400/30 space-y-2">
                        <span className="text-[11px] font-bold text-amber-400 block">
                          🎬 Vista previa del video generado:
                        </span>
                        <video
                          src={videoUrl}
                          controls
                          loop
                          autoPlay
                          muted
                          className="w-full max-h-56 rounded-xl bg-black object-contain mx-auto"
                        />
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => handleExportVideo("download")}
                        disabled={generatingVideo}
                        className="bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 hover:brightness-110 active:scale-95 text-neutral-950 font-black text-xs py-3.5 px-4 rounded-2xl shadow-lg shadow-amber-500/20 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {generatingVideo ? (
                          <>
                            <span className="w-4 h-4 border-2 border-neutral-950 border-t-transparent rounded-full animate-spin" />
                            <span>Animando ({videoProgress}%)...</span>
                          </>
                        ) : (
                          <>
                            <span>🎥</span>
                            <span>Generar y Descargar Video (MP4)</span>
                          </>
                        )}
                      </button>

                      {canShare && (
                        <button
                          type="button"
                          onClick={() => handleExportVideo("share")}
                          disabled={generatingVideo}
                          className="bg-neutral-800 hover:bg-neutral-700 active:scale-95 text-white font-bold text-xs py-3.5 px-4 rounded-2xl border border-neutral-700 transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
                        >
                          <span>📲</span>
                          <span>Compartir a Instagram / WhatsApp</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* PESTAÑA 2: IMAGEN SPLIT HD */}
                {exportTab === "split" && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-white block">
                          Imagen Comparativa en Alta Definición (PNG 1080p)
                        </span>
                        <span className="text-[11px] text-neutral-400">
                          Exporta la división exacta configurada con tu marca de agua.
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => handleExportImage("download")}
                        disabled={generatingImage}
                        className="bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 hover:brightness-110 active:scale-95 text-neutral-950 font-black text-xs py-3.5 px-4 rounded-2xl shadow-lg shadow-amber-500/20 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {generatingImage ? (
                          <>
                            <span className="w-4 h-4 border-2 border-neutral-950 border-t-transparent rounded-full animate-spin" />
                            <span>Renderizando HD...</span>
                          </>
                        ) : (
                          <>
                            <span>📥</span>
                            <span>Descargar Imagen HD (PNG)</span>
                          </>
                        )}
                      </button>

                      {canShare && (
                        <button
                          type="button"
                          onClick={() => handleExportImage("share")}
                          disabled={generatingImage}
                          className="bg-neutral-800 hover:bg-neutral-700 active:scale-95 text-white font-bold text-xs py-3.5 px-4 rounded-2xl border border-neutral-700 transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
                        >
                          <span>📲</span>
                          <span>Compartir Imagen</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* PESTAÑA 3: CARRUSEL PARA INSTAGRAM */}
                {exportTab === "carrusel" && (
                  <div className="space-y-3">
                    <div>
                      <span className="text-xs font-bold text-white block">
                        Pack de 2 Fotos para Carrusel ("Deslizá 👉")
                      </span>
                      <span className="text-[11px] text-neutral-400">
                        Exporta las 2 fotos alineadas con el banner de llamada a la acción para que el cliente pase de página en el feed de Instagram.
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => handleExportCarrusel(1)}
                        className="bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 hover:border-amber-400 text-neutral-200 hover:text-white text-xs font-bold py-3 px-3 rounded-2xl transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95"
                      >
                        <span>📸</span>
                        <span>Descargar Foto 1 (Antes)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleExportCarrusel(2)}
                        className="bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 hover:brightness-110 text-neutral-950 font-black text-xs py-3 px-3 rounded-2xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-md shadow-amber-500/20 active:scale-95"
                      >
                        <span>✨</span>
                        <span>Descargar Foto 2 (Resultado)</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
