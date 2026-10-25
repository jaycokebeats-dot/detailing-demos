"use client";

import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import type { Business } from "@/data/business-helpers";
import { DEFAULT_DEMO_BUSINESS } from "@/data/demo-business";
import { getBusinessData } from "@/lib/supabase";

type CountryCode = "AR" | "MX" | "ES";

interface CountryConfig {
  nombrePais: string;
  bandera: string;
  terminoVehiculo: string;
  terminoPatente: string;
  terminoCombustible: string;
  terminoRuedaAuxilio: string;
  terminoBaul: string;
  terminoRayon: string;
  terminoBollo: string;
  codigoTelefonico: string;
}

const COUNTRY_CONFIGS: Record<CountryCode, CountryConfig> = {
  AR: {
    nombrePais: "Argentina",
    bandera: "🇦🇷",
    terminoVehiculo: "Auto",
    terminoPatente: "Patente",
    terminoCombustible: "Nafta",
    terminoRuedaAuxilio: "Rueda de auxilio",
    terminoBaul: "Baúl",
    terminoRayon: "Rayón",
    terminoBollo: "Bollo / Toque",
    codigoTelefonico: "+54 9 ",
  },
  MX: {
    nombrePais: "México",
    bandera: "🇲🇽",
    terminoVehiculo: "Auto / Troca",
    terminoPatente: "Placas",
    terminoCombustible: "Gasolina",
    terminoRuedaAuxilio: "Llanta de refacción",
    terminoBaul: "Cajuela",
    terminoRayon: "Rayón / Arañazo",
    terminoBollo: "Golpe / Abolladura",
    codigoTelefonico: "+52 ",
  },
  ES: {
    nombrePais: "España",
    bandera: "🇪🇸",
    terminoVehiculo: "Coche",
    terminoPatente: "Matrícula",
    terminoCombustible: "Depósito",
    terminoRuedaAuxilio: "Rueda de repuesto",
    terminoBaul: "Maletero",
    terminoRayon: "Arañazo / Chinazo",
    terminoBollo: "Bollo / Golpe",
    codigoTelefonico: "+34 ",
  },
};

interface DamagePoint {
  id: string;
  x: number; // 0 to 100%
  y: number; // 0 to 100%
  zone: string;
  typeId: string;
  severity: "leve" | "medio" | "grave";
  nota?: string;
  foto?: string;
}

const DAMAGE_TYPES = [
  { id: "rayon", label: "Rayón / Arañazo", color: "#ef4444", icon: "🔴", badgeBg: "bg-red-500/15 text-red-400 border-red-500/30" },
  { id: "bollo", label: "Bollo / Abolladura", color: "#eab308", icon: "🟡", badgeBg: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30" },
  { id: "llanta", label: "Llanta / Rin Raspado", color: "#f97316", icon: "🟠", badgeBg: "bg-orange-500/15 text-orange-400 border-orange-500/30" },
  { id: "optica", label: "Óptica / Cristal Rajado", color: "#06b6d4", icon: "🔵", badgeBg: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30" },
  { id: "desgaste", label: "Desgaste / Falta Laca", color: "#a855f7", icon: "🟣", badgeBg: "bg-purple-500/15 text-purple-400 border-purple-500/30" },
  { id: "gravilla", label: "Impacto de Gravilla", color: "#cbd5e1", icon: "⚪", badgeBg: "bg-slate-500/15 text-slate-300 border-slate-500/30" },
  { id: "otro", label: "Otro Detalle", color: "#ec4899", icon: "📍", badgeBg: "bg-pink-500/15 text-pink-400 border-pink-500/30" },
];

function detectDamageZone(x: number, y: number, country: CountryCode): string {
  const isLeft = x < 35;
  const isRight = x > 65;

  if (y < 12) {
    return country === "MX" ? "Fascia / Defensa Delantera" : "Paragolpes Delantero";
  }
  if (y >= 12 && y < 32) {
    if (isLeft) return country === "MX" ? "Salpicadera Delantera Izq. / Rin" : country === "ES" ? "Aleta Delantera Izq. / Llanta" : "Guardabarros Delantero Izq. / Llanta";
    if (isRight) return country === "MX" ? "Salpicadera Delantera Der. / Rin" : country === "ES" ? "Aleta Delantera Der. / Llanta" : "Guardabarros Delantero Der. / Llanta";
    return country === "MX" ? "Cofre / Capó" : "Capó Delantero";
  }
  if (y >= 32 && y < 45) {
    if (isLeft) return country === "ES" ? "Puerta Delantera Izq. / Retrovisor" : "Puerta Delantera Izq. / Espejo";
    if (isRight) return country === "ES" ? "Puerta Delantera Der. / Retrovisor" : "Puerta Delantera Der. / Espejo";
    return "Parabrisas";
  }
  if (y >= 45 && y < 65) {
    if (isLeft) return "Puerta Trasera Izquierda";
    if (isRight) return "Puerta Trasera Derecha";
    return "Techo";
  }
  if (y >= 65 && y < 78) {
    if (isLeft) return country === "MX" ? "Salpicadera Trasera Izq. / Rin" : country === "ES" ? "Aleta Trasera Izq. / Llanta" : "Guardabarros Trasero Izq. / Llanta";
    if (isRight) return country === "MX" ? "Salpicadera Trasera Der. / Rin" : country === "ES" ? "Aleta Trasera Der. / Llanta" : "Guardabarros Trasero Der. / Llanta";
    return country === "MX" ? "Medallón Trasero" : "Luneta Trasera";
  }
  if (y >= 78 && y < 90) {
    if (isLeft) return "Costado Trasero Izquierdo";
    if (isRight) return "Costado Trasero Derecho";
    return country === "MX" ? "Cajuela / Portón" : country === "ES" ? "Portón Maletero" : "Baúl / Portón Trasero";
  }
  return country === "MX" ? "Fascia / Defensa Trasera" : "Paragolpes Trasero";
}

export default function CheckinPage() {
  const [biz, setBiz] = useState<Business>(DEFAULT_DEMO_BUSINESS);
  const [currentSlug, setCurrentSlug] = useState<string>("demo");
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Selector de país manual o automático
  const [manualCountry, setManualCountry] = useState<CountryCode | null>(null);

  const countryCode: CountryCode = useMemo(() => {
    if (manualCountry) return manualCountry;
    const p = (biz.pais || "").toUpperCase();
    if (p === "MX" || biz.template === "mexico") return "MX";
    if (p === "ES" || biz.template === "spain") return "ES";
    return "AR";
  }, [manualCountry, biz.pais, biz.template]);

  const config = COUNTRY_CONFIGS[countryCode];

  // Folio autogenerado y fecha
  const [folio] = useState<string>(() => {
    const random = Math.floor(1000 + Math.random() * 9000);
    const d = new Date();
    const yr = d.getFullYear().toString().slice(-2);
    return `REC-${yr}${random}`;
  });

  const [fechaIngreso] = useState<string>(() => {
    const d = new Date();
    return d.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  });

  // Datos del Cliente y Vehículo
  const [clienteNombre, setClienteNombre] = useState("");
  const [clienteTelefono, setClienteTelefono] = useState("");
  const [vehiculoModelo, setVehiculoModelo] = useState("");
  const [vehiculoColor, setVehiculoColor] = useState("");
  const [vehiculoPatente, setVehiculoPatente] = useState("");
  const [vehiculoKm, setVehiculoKm] = useState("");
  const [nivelCombustible, setNivelCombustible] = useState<string>("1/2");

  // Checklist de Pertenencias
  const [tuercaSeguridad, setTuercaSeguridad] = useState<"si" | "no" | "no_aplica">("si");
  const [ruedaAuxilio, setRuedaAuxilio] = useState<boolean>(true);
  const [documentosGuantera, setDocumentosGuantera] = useState<boolean>(true);
  const [objetosRetirados, setObjetosRetirados] = useState<boolean>(true);
  const [llavesEntregadas, setLlavesEntregadas] = useState<string>("1 juego");
  const [pertenenciasNotas, setPertenenciasNotas] = useState("");

  // Servicios y Entrega
  const [serviciosSolicitados, setServiciosSolicitados] = useState("");
  const [fechaEntregaEstimada, setFechaEntregaEstimada] = useState("");
  const [observacionesEspeciales, setObservacionesEspeciales] = useState("");

  // Inspección de Daños Previos
  const [damages, setDamages] = useState<DamagePoint[]>([]);
  const [pendingPoint, setPendingPoint] = useState<{ x: number; y: number; zone: string } | null>(null);
  const [pendingType, setPendingType] = useState<string>("rayon");
  const [pendingSeverity, setPendingSeverity] = useState<"leve" | "medio" | "grave">("leve");
  const [pendingNota, setPendingNota] = useState<string>("");

  // Fotos de prueba (base64)
  const [fotosDaños, setFotosDaños] = useState<string[]>([]);

  // Pestaña de visualización final
  const [activeTab, setActiveTab] = useState<"whatsapp" | "ficha">("whatsapp");

  // Referencia al contenedor de la silueta del auto
  const carContainerRef = useRef<HTMLDivElement>(null);
  const carSvgRef = useRef<SVGSVGElement>(null);
  const [generatingImage, setGeneratingImage] = useState(false);
  const [canShare, setCanShare] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Carga del taller desde URL
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
          // 1. Supabase
          const supabaseData = await getBusinessData(slug);
          if (supabaseData && supabaseData.nombre) {
            setBiz(supabaseData);
            setLoading(false);
            return;
          }

          // 2. API interna
          if (slug !== "demo" && slug !== "taller-demo") {
            const res = await fetch(`/api/workshops?slug=${encodeURIComponent(slug)}`);
            if (res.ok) {
              const data = await res.json();
              setBiz(data);
              setLoading(false);
              return;
            }
          }

          setBiz(DEFAULT_DEMO_BUSINESS);
        } catch (e) {
          console.error("Error al cargar taller:", e);
          setBiz(DEFAULT_DEMO_BUSINESS);
        } finally {
          setLoading(false);
        }
      }

      load();
    }
  }, []);

  // Manejar clic / tap en la silueta del auto
  const handleCarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!carContainerRef.current) return;
    const rect = carContainerRef.current.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);

    const zone = detectDamageZone(x, y, countryCode);
    setPendingPoint({ x, y, zone });
    setPendingType("rayon");
    setPendingSeverity("leve");
    setPendingNota("");
  };

  const handleConfirmDamage = () => {
    if (!pendingPoint) return;
    const newPoint: DamagePoint = {
      id: Date.now().toString(),
      x: pendingPoint.x,
      y: pendingPoint.y,
      zone: pendingPoint.zone,
      typeId: pendingType,
      severity: pendingSeverity,
      nota: pendingNota.trim() || undefined,
    };
    setDamages((prev) => [...prev, newPoint]);
    setPendingPoint(null);
    showToast(`📍 Daño #${damages.length + 1} registrado en ${pendingPoint.zone}`);
  };

  const handleDeleteDamage = (id: string) => {
    setDamages((prev) => prev.filter((d) => d.id !== id));
  };

  // Manejar carga de fotos
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setFotosDaños((prev) => [...prev, event.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
    showToast("📷 Foto añadida al registro de inspección");
  };

  const handleDeletePhoto = (index: number) => {
    setFotosDaños((prev) => prev.filter((_, i) => i !== index));
  };

  // Construir mensaje de WhatsApp
  const mensajeWhatsApp = useMemo(() => {
    const nombreTaller = biz.nombre || "Taller de Detailing";
    const saludo = clienteNombre.trim() ? `¡Hola ${clienteNombre.trim()}! 👋` : `¡Hola! 👋`;

    const autoText = vehiculoModelo.trim() || "Vehículo sin especificar";
    const patenteText = vehiculoPatente.trim().toUpperCase() || "S/D";
    const colorText = vehiculoColor.trim() ? ` (${vehiculoColor.trim()})` : "";
    const kmText = vehiculoKm.trim() ? `${vehiculoKm.trim()} km` : "No registrado";

    const lineasDaños =
      damages.length === 0
        ? "✅ *Sin daños visibles preexistentes detectados.*"
        : damages
            .map((d, i) => {
              const t = DAMAGE_TYPES.find((dt) => dt.id === d.typeId);
              const severidadText = d.severity === "grave" ? " [Grave]" : d.severity === "medio" ? " [Medio]" : "";
              const notaText = d.nota ? ` — _${d.nota}_` : "";
              return `${i + 1}. ${t?.icon || "📍"} *${d.zone}:* ${t?.label || "Detalle"}${severidadText}${notaText}`;
            })
            .join("\n");

    const pertenenciasList = [
      `• Tuerca antirrobo: ${tuercaSeguridad === "si" ? "✔️ Presente" : tuercaSeguridad === "no" ? "❌ No entregada" : "No aplica"}`,
      `• ${config.terminoRuedaAuxilio}: ${ruedaAuxilio ? "✔️ Presente" : "❌ No posee"}`,
      `• Documentación: ${documentosGuantera ? "✔️ En guantera" : "No declarada"}`,
      `• Objetos de valor: ${objetosRetirados ? "✔️ Retirados por titular" : "Declarados"}`,
      `• Llaves recibidas: ${llavesEntregadas}`,
      pertenenciasNotas.trim() ? `• Otras pertenencias: _${pertenenciasNotas.trim()}_` : null,
    ]
      .filter(Boolean)
      .join("\n");

    const lineas = [
      `${saludo} Te compartimos la *Ficha de Recepción e Inspección Técnica* al ingresar tu vehículo a nuestras instalaciones:\n`,
      `🛡️ *FICHA DE RECEPCIÓN & CONTROL DE INGRESO*`,
      `🏢 *${nombreTaller}* — ${biz.ciudad || "Detailing Studio"}`,
      `📄 *Folio:* \`${folio}\` | 📅 *Fecha:* ${fechaIngreso}\n`,
      `🚘 *DATOS DEL VEHÍCULO:*`,
      `• *Modelo:* ${autoText}${colorText}`,
      `• *${config.terminoPatente}:* \`${patenteText}\``,
      `• *Kilometraje:* ${kmText}`,
      `• *Nivel ${config.terminoCombustible}:* ${nivelCombustible}\n`,
      serviciosSolicitados.trim() ? `🛠️ *TRABAJOS A REALIZAR:*\n• ${serviciosSolicitados.trim()}\n` : null,
      fechaEntregaEstimada.trim() ? `⏰ *Entrega estimada:* ${fechaEntregaEstimada.trim()}\n` : null,
      `🔍 *INSPECCIÓN PREVIA DE DETALLES/DAÑOS (${damages.length}):*`,
      lineasDaños,
      `\n📦 *HABITÁCULO & PERTENENCIAS:*`,
      pertenenciasList,
      observacionesEspeciales.trim() ? `\n📝 *Observaciones especiales:*\n_${observacionesEspeciales.trim()}_\n` : null,
      `\n✅ *Constancia de Ingreso:* Se deja constancia del estado del vehículo al momento de la entrega en custodia para el servicio acordado.`,
      `\nCualquier duda quedamos a tu entera disposición. ¡Muchas gracias por confiar en *${nombreTaller}*! 🚗✨`,
    ]
      .filter((l) => l !== null)
      .join("\n");

    return lineas;
  }, [
    biz.nombre,
    biz.ciudad,
    clienteNombre,
    vehiculoModelo,
    vehiculoPatente,
    vehiculoColor,
    vehiculoKm,
    nivelCombustible,
    folio,
    fechaIngreso,
    config,
    damages,
    tuercaSeguridad,
    ruedaAuxilio,
    documentosGuantera,
    objetosRetirados,
    llavesEntregadas,
    pertenenciasNotas,
    serviciosSolicitados,
    fechaEntregaEstimada,
    observacionesEspeciales,
  ]);

  // Exportar el boceto del auto con daños a imagen PNG en alta definición (Canvas 1080x1620)
  const handleExportImage = async (mode: "download" | "share" = "download") => {
    if (!carSvgRef.current) return;
    setGeneratingImage(true);

    try {
      // 1. Clonar y preparar SVG con dimensiones absolutas
      const svgElement = carSvgRef.current.cloneNode(true) as SVGSVGElement;
      svgElement.setAttribute("xmlns", "http://www.w3.org/2000/svg");
      svgElement.setAttribute("width", "500");
      svgElement.setAttribute("height", "875");

      const svgXml = new XMLSerializer().serializeToString(svgElement);
      const svgBlob = new Blob([svgXml], { type: "image/svg+xml;charset=utf-8" });
      const URLObj = window.URL || window.webkitURL || window;
      const blobURL = URLObj.createObjectURL(svgBlob);

      const img = new Image();
      img.crossOrigin = "anonymous";

      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("Error al cargar SVG en imagen"));
        img.src = blobURL;
      });

      // 2. Configurar Canvas 1080 x 1620 (proporción óptima para celulares y WhatsApp)
      const canvas = document.createElement("canvas");
      canvas.width = 1080;
      canvas.height = 1620;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("No context 2d");

      // Fondo oscuro
      const bgGradient = ctx.createLinearGradient(0, 0, 0, 1620);
      bgGradient.addColorStop(0, "#0b0c0e");
      bgGradient.addColorStop(0.5, "#111317");
      bgGradient.addColorStop(1, "#0a0a0c");
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, 1080, 1620);

      // Marco dorado exterior
      ctx.strokeStyle = "rgba(212, 175, 55, 0.4)";
      ctx.lineWidth = 4;
      ctx.strokeRect(25, 25, 1030, 1570);

      ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
      ctx.lineWidth = 1;
      ctx.strokeRect(35, 35, 1010, 1550);

      // Encabezado
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 36px sans-serif";
      ctx.fillText((biz.nombre || "TALLER DE DETAILING").toUpperCase(), 60, 95);

      ctx.fillStyle = "#fbbf24";
      ctx.font = "bold 15px monospace";
      ctx.fillText("INSPECCIÓN TÉCNICA VISUAL • CONTROL DE INGRESO", 60, 130);

      // Folio y Fecha a la derecha
      ctx.textAlign = "right";
      ctx.fillStyle = "#fbbf24";
      ctx.font = "bold 24px monospace";
      ctx.fillText(folio, 1020, 95);

      ctx.fillStyle = "#888888";
      ctx.font = "15px sans-serif";
      ctx.fillText(fechaIngreso, 1020, 125);
      ctx.textAlign = "left";

      // Tarjeta de datos del auto y cliente
      ctx.fillStyle = "#15181f";
      if (typeof ctx.roundRect === "function") {
        ctx.beginPath();
        ctx.roundRect(60, 155, 960, 135, 16);
        ctx.fill();
        ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
        ctx.stroke();
      } else {
        ctx.fillRect(60, 155, 960, 135);
      }

      // Textos de datos
      ctx.fillStyle = "#777777";
      ctx.font = "bold 12px sans-serif";
      ctx.fillText("CLIENTE", 85, 190);
      ctx.fillText(config.terminoPatente.toUpperCase(), 370, 190);
      ctx.fillText("KM / " + config.terminoCombustible.toUpperCase(), 700, 190);

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 19px sans-serif";
      ctx.fillText(clienteNombre.trim() || "Sin especificar", 85, 220);

      ctx.fillStyle = "#fbbf24";
      ctx.font = "bold 22px monospace";
      ctx.fillText(vehiculoPatente.trim() || "S/D", 370, 220);

      ctx.fillStyle = "#e2e8f0";
      ctx.font = "bold 17px sans-serif";
      ctx.fillText(`${vehiculoKm.trim() || "-"} km (${nivelCombustible})`, 700, 220);

      // Vehículo Modelo
      ctx.fillStyle = "#777777";
      ctx.font = "bold 12px sans-serif";
      ctx.fillText(config.terminoVehiculo.toUpperCase(), 85, 255);
      ctx.fillStyle = "#cbd5e1";
      ctx.font = "bold 17px sans-serif";
      const carTitle = `${vehiculoModelo.trim() || "Vehículo sin especificar"}${vehiculoColor.trim() ? " (" + vehiculoColor.trim() + ")" : ""}`;
      ctx.fillText(carTitle, 85, 278);

      // Dibujar el SVG del auto en el centro (420 x 735)
      // Centro X: (1080 - 420) / 2 = 330
      ctx.drawImage(img, 330, 310, 420, 735);
      URLObj.revokeObjectURL(blobURL);

      // Sección de Lista de Daños
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 20px sans-serif";
      ctx.fillText(`DAÑOS PREVIOS REGISTRADOS (${damages.length})`, 60, 1080);

      if (damages.length === 0) {
        ctx.fillStyle = "rgba(16, 185, 129, 0.12)";
        if (typeof ctx.roundRect === "function") {
          ctx.beginPath();
          ctx.roundRect(60, 1105, 960, 65, 12);
          ctx.fill();
          ctx.strokeStyle = "rgba(16, 185, 129, 0.35)";
          ctx.stroke();
        } else {
          ctx.fillRect(60, 1105, 960, 65);
        }

        ctx.fillStyle = "#34d399";
        ctx.font = "bold 17px sans-serif";
        ctx.fillText("✓ Sin daños visibles preexistentes detectados al momento del ingreso.", 85, 1145);
      } else {
        // Dibujar hasta 8 daños en 2 columnas
        const colWidth = 465;
        const visibleDamages = damages.slice(0, 8);
        visibleDamages.forEach((d, i) => {
          const col = i % 2;
          const row = Math.floor(i / 2);
          const itemX = 60 + col * (colWidth + 30);
          const itemY = 1105 + row * 82;

          ctx.fillStyle = "#15181f";
          if (typeof ctx.roundRect === "function") {
            ctx.beginPath();
            ctx.roundRect(itemX, itemY, colWidth, 72, 12);
            ctx.fill();
            ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
            ctx.stroke();
          } else {
            ctx.fillRect(itemX, itemY, colWidth, 72);
          }

          const typeObj = DAMAGE_TYPES.find((t) => t.id === d.typeId);

          // Círculo número
          ctx.fillStyle = typeObj?.color || "#ef4444";
          ctx.beginPath();
          ctx.arc(itemX + 25, itemY + 36, 15, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = "#ffffff";
          ctx.font = "bold 14px sans-serif";
          ctx.textAlign = "center";
          ctx.fillText(`${i + 1}`, itemX + 25, itemY + 41);
          ctx.textAlign = "left";

          // Nombre de zona
          ctx.fillStyle = "#f8fafc";
          ctx.font = "bold 15px sans-serif";
          ctx.fillText(d.zone, itemX + 50, itemY + 30);

          // Tipo y nota
          ctx.fillStyle = typeObj?.color || "#e2e8f0";
          ctx.font = "13px sans-serif";
          const extraNote = d.nota ? ` • "${d.nota.length > 25 ? d.nota.slice(0, 25) + "..." : d.nota}"` : "";
          ctx.fillText(`${typeObj?.label || "Detalle"} (${d.severity})${extraNote}`, itemX + 50, itemY + 54);
        });

        if (damages.length > 8) {
          ctx.fillStyle = "#fbbf24";
          ctx.font = "italic 13px sans-serif";
          ctx.fillText(`+ ${damages.length - 8} daños adicionales registrados en el informe escrito.`, 60, 1465);
        }
      }

      // Pie de página y constancia legal
      ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(60, 1500);
      ctx.lineTo(1020, 1500);
      ctx.stroke();

      ctx.fillStyle = "#888888";
      ctx.font = "italic 13px sans-serif";
      ctx.fillText(`Constancia emitida por ${biz.nombre || "Taller"}. El cliente toma conocimiento del estado constatado.`, 60, 1540);

      ctx.fillStyle = "#fbbf24";
      ctx.font = "bold 13px monospace";
      ctx.textAlign = "right";
      ctx.fillText("detailing-demos.vercel.app/checkin", 1020, 1540);
      ctx.textAlign = "left";

      // 3. Exportar a Blob y disparar descarga o compartir
      const cleanPlate = (vehiculoPatente || "inspeccion").replace(/[^a-zA-Z0-9]/g, "").toUpperCase() || "AUTO";
      const fileName = `Boceto_${cleanPlate}_${folio}.png`;

      canvas.toBlob(async (blob) => {
        if (!blob) {
          setGeneratingImage(false);
          return;
        }

        // Si el usuario eligió compartir y el navegador soporta compartir archivos
        if (mode === "share" && typeof navigator !== "undefined" && typeof (navigator as any).canShare === "function") {
          try {
            const file = new File([blob], fileName, { type: "image/png" });
            if ((navigator as any).canShare({ files: [file] })) {
              await navigator.share({
                files: [file],
                title: `Inspección de Daños - ${vehiculoPatente || vehiculoModelo}`,
                text: `Boceto de inspección del vehículo ${vehiculoModelo || ""} (${folio}) en ${biz.nombre || "Taller"}`,
              });
              showToast("✨ ¡Imagen compartida con éxito!");
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

        // Descarga tradicional en archivo
        const dlUrl = URLObj.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = dlUrl;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URLObj.revokeObjectURL(dlUrl), 1500);

        showToast("📥 ¡Imagen del boceto descargada en alta resolución!");
        setGeneratingImage(false);
      }, "image/png");

    } catch (err) {
      console.error("Error al exportar imagen:", err);
      showToast("⚠️ No se pudo generar la imagen.");
      setGeneratingImage(false);
    }
  };

  const handleCopiarMensaje = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(mensajeWhatsApp);
      showToast("📋 ¡Ficha copiada con éxito para enviar por WhatsApp!");
    }
  };

  const handleEnviarWhatsAppDirecto = () => {
    let cleanPhone = clienteTelefono.replace(/\D/g, "");
    if (!cleanPhone) {
      handleCopiarMensaje();
      showToast("⚠️ Ingresá el teléfono del cliente para abrir su chat directamente.");
      return;
    }
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(mensajeWhatsApp)}`;
    window.open(url, "_blank");
  };

  const handleImprimir = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  const handleLimpiarTodo = () => {
    if (confirm("¿Estás seguro de iniciar una nueva ficha? Se limpiarán los datos actuales.")) {
      setClienteNombre("");
      setClienteTelefono("");
      setVehiculoModelo("");
      setVehiculoColor("");
      setVehiculoPatente("");
      setVehiculoKm("");
      setNivelCombustible("1/2");
      setDamages([]);
      setFotosDaños([]);
      setPertenenciasNotas("");
      setServiciosSolicitados("");
      setFechaEntregaEstimada("");
      setObservacionesEspeciales("");
      showToast("🧹 Nueva ficha en blanco lista.");
    }
  };

  return (
    <div className="admin-scope min-h-screen bg-[#0a0a0a] text-neutral-100 font-sans selection:bg-gold/30 selection:text-amber-400 pb-28 print:min-h-0 print:bg-white print:text-slate-900 print:p-0 print:m-0">
      {/* Inyección de estilos de impresión garantizados para navegador y PDF */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          @page {
            size: A4 portrait;
            margin: 8mm 10mm;
          }
          html, body {
            background: #ffffff !important;
            background-color: #ffffff !important;
            color: #0f172a !important;
            font-size: 11px !important;
            line-height: 1.3 !important;
            margin: 0 !important;
            padding: 0 !important;
            overflow: visible !important;
            overflow-x: visible !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .screen-only, .no-print {
            display: none !important;
          }
          .print-document {
            display: block !important;
            visibility: visible !important;
            background: #ffffff !important;
            color: #0f172a !important;
            font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .print-page-break-avoid {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }
          .print-page-break-after {
            break-after: page !important;
            page-break-after: always !important;
          }
          h1, h2, h3, h4, h5, h6 {
            background-image: none !important;
            -webkit-background-clip: unset !important;
            background-clip: unset !important;
            color: #0f172a !important;
            text-transform: none !important;
            letter-spacing: normal !important;
          }
        }
      `}} />

      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-neutral-900 border border-amber-400/40 text-neutral-100 px-5 py-3 rounded-2xl shadow-2xl shadow-black flex items-center gap-3 text-xs sm:text-sm font-medium animate-fade-in backdrop-blur-md no-print">
          <span className="text-amber-400 text-base">✨</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* =========================================================================
          VISTA DE PANTALLA WEB (Oculta en modo impresión / PDF)
         ========================================================================= */}
      <div className="screen-only print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8">
        {/* HEADER PRINCIPAL */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-neutral-800">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="text-xs font-mono uppercase tracking-wider text-amber-400 px-2.5 py-0.5 rounded-full bg-gold/10 border border-amber-400/20 font-bold">
                Control de Ingreso & Daños
              </span>
              <span className="text-xs font-mono text-neutral-400">
                Folio: <strong className="text-neutral-200">{folio}</strong>
              </span>
              <span className="text-xs text-neutral-500">• {fechaIngreso}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Ficha de Recepción del {config.terminoVehiculo}
            </h1>
            <p className="text-xs sm:text-sm text-neutral-400 mt-0.5">
              Inspección técnica visual, registro de daños preexistentes y pertenencias para{" "}
              <span className="text-neutral-200 font-bold">{biz.nombre || "Taller Piloto"}</span>.
            </p>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            {/* Selector rápido de país */}
            <div className="flex items-center bg-neutral-900 p-1 rounded-xl border border-neutral-800">
              {(["AR", "MX", "ES"] as CountryCode[]).map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setManualCountry(c)}
                  className={`text-xs px-2.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1 ${
                    countryCode === c
                      ? "bg-neutral-800 text-white shadow-sm border border-neutral-700"
                      : "text-neutral-400 hover:text-neutral-200"
                  }`}
                  title={`Cambiar terminología a ${COUNTRY_CONFIGS[c].nombrePais}`}
                >
                  <span>{COUNTRY_CONFIGS[c].bandera}</span>
                  <span className="text-[10px]">{c}</span>
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={handleImprimir}
              className="bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 hover:border-amber-400/50 text-neutral-200 hover:text-white text-xs font-semibold px-3 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
              title="Imprimir acta o exportar como PDF (1 a 2 páginas)"
            >
              <span>🖨️</span>
              <span>Imprimir / PDF</span>
            </button>

            <button
              type="button"
              onClick={handleLimpiarTodo}
              className="bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-400 hover:text-neutral-200 text-xs font-medium px-3 py-2 rounded-xl transition-all cursor-pointer"
              title="Nueva Ficha en blanco"
            >
              <span>🧹 Nueva Ficha</span>
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
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start mt-6">
            {/* COLUMNA IZQUIERDA: CONFIGURADOR / INSPECCIÓN (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              {/* PASO 1: CLIENTE Y VEHÍCULO */}
              <div className="bg-[#121212] border border-neutral-800 rounded-3xl p-5 sm:p-6 space-y-4 shadow-md">
                <div className="flex items-center gap-2 border-b border-neutral-800 pb-3">
                  <span className="w-6 h-6 rounded-full bg-neutral-800 text-neutral-200 text-xs font-bold flex items-center justify-center">
                    1
                  </span>
                  <span className="font-bold text-sm text-neutral-200">
                    Datos del Cliente y {config.terminoVehiculo}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-400 mb-1">
                      Nombre del Cliente
                    </label>
                    <input
                      type="text"
                      value={clienteNombre}
                      onChange={(e) => setClienteNombre(e.target.value)}
                      placeholder="Ej: Marcelo Morales"
                      className="w-full bg-[#161616] border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-neutral-200 focus:outline-none focus:border-amber-400/60"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-400 mb-1">
                      WhatsApp del Cliente (con código de país)
                    </label>
                    <div className="relative">
                      <input
                        type="tel"
                        value={clienteTelefono}
                        onChange={(e) => setClienteTelefono(e.target.value)}
                        placeholder={`Ej: ${countryCode === "MX" ? "524441234567" : countryCode === "ES" ? "34612345678" : "5491154514393"}`}
                        className="w-full bg-[#161616] border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-neutral-200 focus:outline-none focus:border-amber-400/60"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-400 mb-1">
                      {config.terminoVehiculo} (Marca, Modelo, Año)
                    </label>
                    <input
                      type="text"
                      value={vehiculoModelo}
                      onChange={(e) => setVehiculoModelo(e.target.value)}
                      placeholder="Ej: BMW 330i M Sport 2023"
                      className="w-full bg-[#161616] border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-neutral-200 focus:outline-none focus:border-amber-400/60 font-semibold"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-semibold text-neutral-400 mb-1">
                        Color
                      </label>
                      <input
                        type="text"
                        value={vehiculoColor}
                        onChange={(e) => setVehiculoColor(e.target.value)}
                        placeholder="Ej: Azul Estoril"
                        className="w-full bg-[#161616] border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-neutral-200 focus:outline-none focus:border-amber-400/60"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-neutral-400 mb-1">
                        {config.terminoPatente}
                      </label>
                      <input
                        type="text"
                        value={vehiculoPatente}
                        onChange={(e) => setVehiculoPatente(e.target.value.toUpperCase())}
                        placeholder={countryCode === "MX" ? "ABC-12-34" : countryCode === "ES" ? "1234 ABC" : "AF 123 CD"}
                        className="w-full bg-[#161616] border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-neutral-200 focus:outline-none focus:border-amber-400/60 font-mono font-bold tracking-wider uppercase text-center"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-400 mb-1">
                      Kilometraje Actual
                    </label>
                    <input
                      type="text"
                      value={vehiculoKm}
                      onChange={(e) => setVehiculoKm(e.target.value)}
                      placeholder="Ej: 34,500"
                      className="w-full bg-[#161616] border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-neutral-200 focus:outline-none focus:border-amber-400/60"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-400 mb-1">
                      Nivel de {config.terminoCombustible} / Batería
                    </label>
                    <div className="grid grid-cols-5 gap-1">
                      {["Reserva", "1/4", "1/2", "3/4", "Lleno"].map((lvl) => (
                        <button
                          key={lvl}
                          type="button"
                          onClick={() => setNivelCombustible(lvl)}
                          className={`text-[11px] py-2 rounded-lg font-bold border transition-all cursor-pointer ${
                            nivelCombustible === lvl
                              ? "bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-sm"
                              : "bg-[#161616] border-neutral-800 text-neutral-400 hover:text-white"
                          }`}
                        >
                          {lvl}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* PASO 2: INSPECCIÓN VISUAL DE DAÑOS (THE KILLER FEATURE) */}
              <div className="bg-[#121212] border border-neutral-800 rounded-3xl p-5 sm:p-6 space-y-4 shadow-md">
                <div className="flex items-center justify-between border-b border-neutral-800 pb-3 flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-neutral-800 text-neutral-200 text-xs font-bold flex items-center justify-center">
                      2
                    </span>
                    <span className="font-bold text-sm text-neutral-200">
                      Mapeo Visual de Daños Previos ({damages.length})
                    </span>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => handleExportImage("download")}
                      disabled={generatingImage}
                      className="bg-neutral-800 hover:bg-neutral-700 active:scale-95 text-amber-300 hover:text-amber-200 text-xs font-bold px-3 py-1.5 rounded-xl border border-amber-500/30 flex items-center gap-1.5 shadow-sm transition-all cursor-pointer disabled:opacity-50"
                      title="Descargar boceto con los daños marcados en imagen PNG"
                    >
                      {generatingImage ? (
                        <>
                          <span className="w-3 h-3 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                          <span>Generando...</span>
                        </>
                      ) : (
                        <>
                          <span>📸</span>
                          <span>Descargar Boceto (PNG)</span>
                        </>
                      )}
                    </button>

                    {canShare && (
                      <button
                        type="button"
                        onClick={() => handleExportImage("share")}
                        disabled={generatingImage}
                        className="bg-neutral-800 hover:bg-neutral-700 active:scale-95 text-neutral-300 hover:text-white text-xs font-bold px-2.5 py-1.5 rounded-xl border border-neutral-700 flex items-center gap-1 shadow-sm transition-all cursor-pointer disabled:opacity-50"
                        title="Compartir imagen directo a WhatsApp o guardar en fotos"
                      >
                        <span>📲</span>
                        <span className="hidden sm:inline">Compartir</span>
                      </button>
                    )}

                    <span className="text-[11px] text-neutral-400 bg-neutral-900 border border-neutral-800 px-2.5 py-1 rounded-full">
                      👆 Tocá en la silueta
                    </span>
                  </div>
                </div>

                {/* SILUETA DEL AUTO INTERACTIVA */}
                <div className="flex flex-col items-center">
                  <div className="relative w-full max-w-[340px] sm:max-w-[380px] aspect-[400/700] bg-[#161616] border border-neutral-800 rounded-2xl p-2 select-none">
                    {/* SVG Silueta Automotriz */}
                    <div
                      ref={carContainerRef}
                      onClick={handleCarClick}
                      className="w-full h-full relative cursor-crosshair group"
                      title="Haz clic o toca para marcar un daño previo"
                    >
                      <svg
                        ref={carSvgRef}
                        viewBox="0 0 400 700"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-full h-full pointer-events-none drop-shadow-2xl"
                      >
                        {/* Sombra ambiental */}
                        <ellipse cx="200" cy="355" rx="145" ry="305" fill="black" opacity="0.7" />

                        {/* Ruedas / Rines */}
                        <rect x="58" y="145" width="28" height="75" rx="12" fill="#1e1e1e" stroke="#444" strokeWidth="2" />
                        <rect x="64" y="155" width="16" height="55" rx="6" fill="#2a2a2a" stroke="#d4af37" strokeWidth="1" />
                        <rect x="314" y="145" width="28" height="75" rx="12" fill="#1e1e1e" stroke="#444" strokeWidth="2" />
                        <rect x="320" y="155" width="16" height="55" rx="6" fill="#2a2a2a" stroke="#d4af37" strokeWidth="1" />
                        <rect x="58" y="490" width="28" height="75" rx="12" fill="#1e1e1e" stroke="#444" strokeWidth="2" />
                        <rect x="64" y="500" width="16" height="55" rx="6" fill="#2a2a2a" stroke="#d4af37" strokeWidth="1" />
                        <rect x="314" y="490" width="28" height="75" rx="12" fill="#1e1e1e" stroke="#444" strokeWidth="2" />
                        <rect x="320" y="500" width="16" height="55" rx="6" fill="#2a2a2a" stroke="#d4af37" strokeWidth="1" />

                        {/* Espejos retrovisores */}
                        <path d="M 80 255 Q 60 260 55 245 Q 60 235 85 240 Z" fill="#222" stroke="#666" strokeWidth="1.5" />
                        <path d="M 320 255 Q 340 260 345 245 Q 340 235 315 240 Z" fill="#222" stroke="#666" strokeWidth="1.5" />

                        {/* Silueta Exterior de Chapa */}
                        <path
                          d="M 125 70 
                             C 160 45, 240 45, 275 70 
                             C 300 85, 315 115, 315 145 
                             C 315 155, 305 160, 305 210 
                             C 305 230, 320 250, 320 320 
                             C 320 420, 320 470, 322 490 
                             C 325 510, 308 525, 308 565 
                             C 308 600, 295 625, 275 640 
                             C 240 660, 160 660, 125 640 
                             C 105 625, 92 600, 92 565 
                             C 92 525, 75 510, 78 490 
                             C 80 470, 80 420, 80 320 
                             C 80 250, 95 230, 95 210 
                             C 95 160, 85 155, 85 145 
                             C 85 115, 100 85, 125 70 Z"
                          fill="#181818"
                          stroke="#d4af37"
                          strokeWidth="2.5"
                        />

                        {/* Líneas de Capó */}
                        <path d="M 140 100 Q 200 115 260 100" stroke="#333" strokeWidth="1.5" />
                        <path d="M 135 115 Q 155 190 145 220" stroke="#383838" strokeWidth="1.5" />
                        <path d="M 265 115 Q 245 190 255 220" stroke="#383838" strokeWidth="1.5" />

                        {/* Ópticas delanteras */}
                        <path d="M 110 80 Q 140 75 145 95 Q 120 100 110 80 Z" fill="#00e5ff" opacity="0.3" stroke="#00e5ff" strokeWidth="1.5" />
                        <path d="M 290 80 Q 260 75 255 95 Q 280 100 290 80 Z" fill="#00e5ff" opacity="0.3" stroke="#00e5ff" strokeWidth="1.5" />

                        {/* Parabrisas */}
                        <path d="M 125 235 Q 200 220 275 235 L 260 310 Q 200 300 140 310 Z" fill="#111" stroke="#555" strokeWidth="2" />

                        {/* Techo */}
                        <rect x="135" y="325" width="130" height="150" rx="10" fill="#161616" stroke="#2d2d2d" strokeWidth="1.5" />
                        <rect x="150" y="340" width="100" height="70" rx="8" fill="#0d0d0d" stroke="#444" strokeWidth="1" />

                        {/* Luneta Trasera */}
                        <path d="M 140 490 Q 200 500 260 490 L 275 555 Q 200 565 125 555 Z" fill="#111" stroke="#555" strokeWidth="2" />

                        {/* Baúl / Cajuela */}
                        <path d="M 135 570 Q 200 580 265 570" stroke="#333" strokeWidth="1.5" />
                        <path d="M 145 575 L 140 625" stroke="#2d2d2d" strokeWidth="1.5" />
                        <path d="M 255 575 L 260 625" stroke="#2d2d2d" strokeWidth="1.5" />

                        {/* Ópticas traseras */}
                        <path d="M 115 635 Q 145 640 150 625 Q 125 620 115 635 Z" fill="#ff1744" opacity="0.5" stroke="#ff1744" strokeWidth="1.5" />
                        <path d="M 285 635 Q 255 640 250 625 Q 275 620 285 635 Z" fill="#ff1744" opacity="0.5" stroke="#ff1744" strokeWidth="1.5" />

                        {/* Separador de puertas */}
                        <line x1="90" y1="395" x2="135" y2="395" stroke="#333" strokeWidth="1.5" />
                        <line x1="265" y1="395" x2="310" y2="395" stroke="#333" strokeWidth="1.5" />

                        {/* Textos de zonas */}
                        <text x="200" y="165" textAnchor="middle" fill="#666" fontSize="10" fontWeight="bold" letterSpacing="1">
                          {countryCode === "MX" ? "COFRE" : "CAPÓ"}
                        </text>
                        <text x="200" y="445" textAnchor="middle" fill="#555" fontSize="10" fontWeight="bold" letterSpacing="1">
                          TECHO
                        </text>
                        <text x="200" y="605" textAnchor="middle" fill="#666" fontSize="10" fontWeight="bold" letterSpacing="1">
                          {countryCode === "MX" ? "CAJUELA" : countryCode === "ES" ? "MALETERO" : "BAÚL"}
                        </text>

                        {/* Pins de Daños incrustados en SVG para captura en Canvas/Imagen */}
                        {damages.map((d, index) => {
                          const typeObj = DAMAGE_TYPES.find((t) => t.id === d.typeId);
                          const cx = (d.x / 100) * 400;
                          const cy = (d.y / 100) * 700;
                          const pinColor = typeObj?.color || "#ef4444";
                          return (
                            <g key={`svg-pin-${d.id}`}>
                              <circle cx={cx} cy={cy} r="18" fill={pinColor} opacity="0.3" />
                              <circle cx={cx} cy={cy} r="13" fill={pinColor} stroke="#ffffff" strokeWidth="2.5" />
                              <text
                                x={cx}
                                y={cy + 4.5}
                                textAnchor="middle"
                                fill="#ffffff"
                                fontSize="12"
                                fontWeight="900"
                                fontFamily="sans-serif"
                              >
                                {index + 1}
                              </text>
                            </g>
                          );
                        })}
                      </svg>

                      {/* Pins de Daños Registrados */}
                      {damages.map((d, index) => {
                        const typeObj = DAMAGE_TYPES.find((t) => t.id === d.typeId);
                        return (
                          <div
                            key={d.id}
                            style={{ left: `${d.x}%`, top: `${d.y}%` }}
                            className="absolute -translate-x-1/2 -translate-y-1/2 z-10 flex items-center justify-center cursor-pointer group/pin pointer-events-auto"
                            onClick={(ev) => {
                              ev.stopPropagation();
                              handleDeleteDamage(d.id);
                            }}
                            title={`#${index + 1}: ${d.zone} (${typeObj?.label}). Clic para eliminar.`}
                          >
                            <span
                              className="w-6 h-6 rounded-full flex items-center justify-center font-bold text-[11px] text-white shadow-lg border-2 border-white/80 transition-transform group-hover/pin:scale-125"
                              style={{ backgroundColor: typeObj?.color || "#ef4444" }}
                            >
                              {index + 1}
                            </span>
                            <span className="absolute w-8 h-8 rounded-full border border-white/60 animate-ping opacity-75" />
                          </div>
                        );
                      })}

                      {/* Pin pendiente mientras se elige el tipo */}
                      {pendingPoint && (
                        <div
                          style={{ left: `${pendingPoint.x}%`, top: `${pendingPoint.y}%` }}
                          className="absolute -translate-x-1/2 -translate-y-1/2 z-20 flex items-center justify-center pointer-events-none"
                        >
                          <span className="w-7 h-7 rounded-full bg-white text-black font-extrabold text-xs flex items-center justify-center animate-bounce shadow-2xl border-2 border-amber-400">
                            +
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* MODAL / FORMULARIO RÁPIDO PARA REGISTRAR EL DAÑO SELECCIONADO */}
                {pendingPoint && (
                  <div className="bg-[#181818] border border-amber-400/40 rounded-2xl p-4 space-y-3 animate-fade-in shadow-xl">
                    <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                      <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                        <span>📍</span>
                        <span>Zona seleccionada: {pendingPoint.zone}</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => setPendingPoint(null)}
                        className="text-neutral-400 hover:text-white text-xs"
                      >
                        ✕ Cancelar
                      </button>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-neutral-400 mb-1.5">
                        Tipo de Detalle o Daño:
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                        {DAMAGE_TYPES.map((t) => (
                          <button
                            key={t.id}
                            type="button"
                            onClick={() => setPendingType(t.id)}
                            className={`text-xs px-2.5 py-2 rounded-xl border text-left flex items-center gap-1.5 transition-all cursor-pointer ${
                              pendingType === t.id
                                ? "bg-neutral-800 text-white border-amber-400/70 shadow-sm font-bold"
                                : "bg-[#141414] border-neutral-800 text-neutral-400 hover:text-neutral-200"
                            }`}
                          >
                            <span>{t.icon}</span>
                            <span className="text-[11px] truncate">{t.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-[11px] font-semibold text-neutral-400 mb-1">
                          Gravedad:
                        </label>
                        <div className="grid grid-cols-3 gap-1">
                          {(["leve", "medio", "grave"] as const).map((sev) => (
                            <button
                              key={sev}
                              type="button"
                              onClick={() => setPendingSeverity(sev)}
                              className={`text-[11px] py-1.5 rounded-lg border font-bold capitalize transition-all cursor-pointer ${
                                pendingSeverity === sev
                                  ? sev === "grave"
                                    ? "bg-red-500/20 text-red-400 border-red-500/50"
                                    : sev === "medio"
                                      ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/50"
                                      : "bg-emerald-500/20 text-emerald-400 border-emerald-500/50"
                                  : "bg-[#141414] border-neutral-800 text-neutral-400 hover:text-white"
                              }`}
                            >
                              {sev}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-neutral-400 mb-1">
                          Nota o medida del detalle (opcional):
                        </label>
                        <input
                          type="text"
                          value={pendingNota}
                          onChange={(e) => setPendingNota(e.target.value)}
                          placeholder="Ej: Rayón de 8cm, no salió con pulido"
                          className="w-full bg-[#141414] border border-neutral-800 rounded-xl px-3 py-1.5 text-xs text-neutral-200 focus:outline-none focus:border-amber-400/60"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setPendingPoint(null)}
                        className="px-3 py-1.5 text-xs text-neutral-400 hover:text-white cursor-pointer"
                      >
                        Cancelar
                      </button>
                      <button
                        type="button"
                        onClick={handleConfirmDamage}
                        className="bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 hover:brightness-110 text-neutral-950 font-black text-xs px-5 py-2.5 rounded-xl shadow-lg shadow-amber-500/25 transition-all cursor-pointer active:scale-95 flex items-center gap-1.5 border border-amber-300"
                      >
                        <span className="text-sm font-extrabold">✓</span>
                        <span>Guardar Daño #{damages.length + 1}</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* LISTA DE DAÑOS REGISTRADOS */}
                {damages.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-neutral-800/80">
                    <span className="text-xs font-bold text-neutral-300">
                      Detalle de daños marcados ({damages.length}):
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {damages.map((d, index) => {
                        const t = DAMAGE_TYPES.find((dt) => dt.id === d.typeId);
                        return (
                          <div
                            key={d.id}
                            className="bg-[#161616] border border-neutral-800 hover:border-neutral-700 rounded-xl p-2.5 flex items-start justify-between gap-2 text-xs"
                          >
                            <div className="flex items-start gap-2">
                              <span className="w-5 h-5 rounded-full bg-neutral-800 text-white font-mono text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                                {index + 1}
                              </span>
                              <div>
                                <div className="font-bold text-neutral-200 flex items-center gap-1.5 flex-wrap">
                                  <span>{t?.icon}</span>
                                  <span>{d.zone}</span>
                                </div>
                                <div className="text-[11px] text-neutral-400 flex items-center gap-1.5 mt-0.5">
                                  <span className={`px-1.5 py-0.2 rounded text-[10px] font-semibold border ${t?.badgeBg}`}>
                                    {t?.label}
                                  </span>
                                  <span className="text-neutral-500">•</span>
                                  <span className="capitalize">{d.severity}</span>
                                </div>
                                {d.nota && (
                                  <p className="text-[11px] text-neutral-300 italic mt-1 bg-black/30 px-2 py-0.5 rounded border border-neutral-800">
                                    "{d.nota}"
                                  </p>
                                )}
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleDeleteDamage(d.id)}
                              className="text-neutral-500 hover:text-red-400 text-xs p-1 rounded transition-colors cursor-pointer"
                              title="Eliminar este daño"
                            >
                              ✕
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* ADJUNTAR FOTOS REALES */}
                <div className="pt-2 border-t border-neutral-800/80">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
                      <span>📷</span>
                      <span>Fotos de prueba de los detalles (opcional):</span>
                    </label>

                    <label className="bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold px-3 py-1.5 rounded-xl border border-neutral-700 cursor-pointer transition-all flex items-center gap-1.5 shadow-sm active:scale-95">
                      <span>➕ Agregar Foto</span>
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        multiple
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {fotosDaños.length > 0 ? (
                    <div className="flex gap-2.5 overflow-x-auto pb-2 pt-1">
                      {fotosDaños.map((img, i) => (
                        <div
                          key={i}
                          className="relative w-20 h-20 rounded-xl overflow-hidden bg-black border border-neutral-800 shrink-0 group"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={img} alt="Foto daño" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => handleDeletePhoto(i)}
                            className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-600/90 text-white text-[10px] flex items-center justify-center cursor-pointer shadow-md"
                            title="Eliminar foto"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[11px] text-neutral-500 italic">
                      No se han adjuntado fotos. Podés sacar fotos directas desde la cámara del celular.
                    </p>
                  )}
                </div>
              </div>

              {/* PASO 3: CONTROL DE PERTENENCIAS & HABITÁCULO */}
              <div className="bg-[#121212] border border-neutral-800 rounded-3xl p-5 sm:p-6 space-y-4 shadow-md">
                <div className="flex items-center gap-2 border-b border-neutral-800 pb-3">
                  <span className="w-6 h-6 rounded-full bg-neutral-800 text-neutral-200 text-xs font-bold flex items-center justify-center">
                    3
                  </span>
                  <span className="font-bold text-sm text-neutral-200">
                    Control de Habitáculo & Pertenencias
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {/* Tuerca antirrobo */}
                  <div className="bg-[#161616] p-3 rounded-2xl border border-neutral-800 flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-neutral-200 block">Tuerca de Seguridad / Antirrobo</span>
                      <span className="text-[11px] text-neutral-500">Para desarmar ruedas</span>
                    </div>
                    <div className="flex gap-1">
                      {(["si", "no", "no_aplica"] as const).map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => setTuercaSeguridad(opt)}
                          className={`text-[10px] px-2 py-1 rounded-lg font-bold border transition-all cursor-pointer ${
                            tuercaSeguridad === opt
                              ? opt === "si"
                                ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                                : "bg-neutral-800 text-white border-neutral-600"
                              : "bg-[#121212] border-neutral-800 text-neutral-500"
                          }`}
                        >
                          {opt === "si" ? "Sí" : opt === "no" ? "No" : "N/A"}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Rueda de auxilio */}
                  <div className="bg-[#161616] p-3 rounded-2xl border border-neutral-800 flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-neutral-200 block">{config.terminoRuedaAuxilio}</span>
                      <span className="text-[11px] text-neutral-500">En {config.terminoBaul.toLowerCase()}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setRuedaAuxilio(!ruedaAuxilio)}
                      className={`text-xs px-3 py-1.5 rounded-lg font-bold border transition-all cursor-pointer ${
                        ruedaAuxilio
                          ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                          : "bg-red-500/20 text-red-400 border-red-500/40"
                      }`}
                    >
                      {ruedaAuxilio ? "✔️ Presente" : "❌ No posee"}
                    </button>
                  </div>

                  {/* Documentación en guantera */}
                  <div className="bg-[#161616] p-3 rounded-2xl border border-neutral-800 flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-neutral-200 block">Documentos del Vehículo</span>
                      <span className="text-[11px] text-neutral-500">En guantera</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setDocumentosGuantera(!documentosGuantera)}
                      className={`text-xs px-3 py-1.5 rounded-lg font-bold border transition-all cursor-pointer ${
                        documentosGuantera
                          ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                          : "bg-neutral-800 text-neutral-400 border-neutral-700"
                      }`}
                    >
                      {documentosGuantera ? "✔️ En guantera" : "No declarados"}
                    </button>
                  </div>

                  {/* Objetos de valor retirados */}
                  <div className="bg-[#161616] p-3 rounded-2xl border border-neutral-800 flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-neutral-200 block">Objetos de Valor</span>
                      <span className="text-[11px] text-neutral-500">Billetera, joyas, tecnología</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setObjetosRetirados(!objetosRetirados)}
                      className={`text-xs px-3 py-1.5 rounded-lg font-bold border transition-all cursor-pointer ${
                        objetosRetirados
                          ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                          : "bg-red-500/20 text-red-400 border-red-500/40"
                      }`}
                    >
                      {objetosRetirados ? "✔️ Retirados" : "Declarados"}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-400 mb-1">
                      Juegos de Llaves Entregados
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {["1 juego", "2 juegos"].map((k) => (
                        <button
                          key={k}
                          type="button"
                          onClick={() => setLlavesEntregadas(k)}
                          className={`text-xs py-2 rounded-xl font-bold border transition-all cursor-pointer ${
                            llavesEntregadas === k
                              ? "bg-neutral-800 text-white border-amber-400/50 shadow-sm"
                              : "bg-[#161616] border-neutral-800 text-neutral-400"
                          }`}
                        >
                          🔑 {k}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-400 mb-1">
                      Otras pertenencias dejadas en el vehículo:
                    </label>
                    <input
                      type="text"
                      value={pertenenciasNotas}
                      onChange={(e) => setPertenenciasNotas(e.target.value)}
                      placeholder="Ej: Lentes de sol Ray-Ban, monedas en gaveta"
                      className="w-full bg-[#161616] border border-neutral-800 rounded-xl px-3.5 py-2 text-xs text-neutral-200 focus:outline-none focus:border-amber-400/60"
                    />
                  </div>
                </div>
              </div>

              {/* PASO 4: SERVICIOS A REALIZAR & ENTREGA ESTIMADA */}
              <div className="bg-[#121212] border border-neutral-800 rounded-3xl p-5 sm:p-6 space-y-4 shadow-md">
                <div className="flex items-center gap-2 border-b border-neutral-800 pb-3">
                  <span className="w-6 h-6 rounded-full bg-neutral-800 text-neutral-200 text-xs font-bold flex items-center justify-center">
                    4
                  </span>
                  <span className="font-bold text-sm text-neutral-200">
                    Servicio Solicitado & Entrega
                  </span>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-400 mb-1">
                      Tratamiento o Servicios Contratados
                    </label>
                    <input
                      type="text"
                      value={serviciosSolicitados}
                      onChange={(e) => setServiciosSolicitados(e.target.value)}
                      placeholder="Ej: Corrección de Pintura 2 Pasos + Cerámico 9H 3 Años + Detallado de Motor"
                      className="w-full bg-[#161616] border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-neutral-200 focus:outline-none focus:border-amber-400/60 font-semibold"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-neutral-400 mb-1">
                        Fecha y Hora Estimada de Entrega
                      </label>
                      <input
                        type="text"
                        value={fechaEntregaEstimada}
                        onChange={(e) => setFechaEntregaEstimada(e.target.value)}
                        placeholder="Ej: Mañana a las 18:30 hs"
                        className="w-full bg-[#161616] border border-neutral-800 rounded-xl px-3.5 py-2 text-xs text-neutral-200 focus:outline-none focus:border-amber-400/60"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-neutral-400 mb-1">
                        Observaciones especiales del cliente
                      </label>
                      <input
                        type="text"
                        value={observacionesEspeciales}
                        onChange={(e) => setObservacionesEspeciales(e.target.value)}
                        placeholder="Ej: Cuidado con el splitter delantero de carbono"
                        className="w-full bg-[#161616] border border-neutral-800 rounded-xl px-3.5 py-2 text-xs text-neutral-200 focus:outline-none focus:border-amber-400/60"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* COLUMNA DERECHA: RESULTADO, WHATSAPP & FICHA FORMAL (5 cols) */}
            <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-6">
              {/* SELECTOR DE PESTAÑA: WHATSAPP VS FICHA TÉCNICA */}
              <div className="flex bg-[#121212] p-1.5 rounded-2xl border border-neutral-800">
                <button
                  type="button"
                  onClick={() => setActiveTab("whatsapp")}
                  className={`flex-1 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    activeTab === "whatsapp"
                      ? "bg-emerald-600 text-white shadow-md shadow-emerald-950/40"
                      : "text-neutral-400 hover:text-white"
                  }`}
                >
                  <span>💬 Mensaje WhatsApp</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("ficha")}
                  className={`flex-1 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    activeTab === "ficha"
                      ? "bg-neutral-800 text-amber-400 border border-amber-400/40 shadow-md"
                      : "text-neutral-400 hover:text-white"
                  }`}
                >
                  <span>📋 Ficha Oficial / Imprimir</span>
                </button>
              </div>

              {/* CONTENIDO PESTAÑA WHATSAPP */}
              {activeTab === "whatsapp" && (
                <div className="bg-[#121212] border border-neutral-800 rounded-3xl p-5 sm:p-6 space-y-4 shadow-xl animate-fade-in">
                  <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                    <span className="text-xs font-bold text-neutral-300 flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                      Vista previa del WhatsApp
                    </span>
                    <span className="text-[11px] text-neutral-400 font-mono">
                      {damages.length} daños registrados
                    </span>
                  </div>

                  {/* Burbuja WhatsApp */}
                  <div className="bg-[#0b141a] rounded-2xl p-4 border border-emerald-900/40 text-neutral-200 text-xs font-mono whitespace-pre-wrap leading-relaxed max-h-[460px] overflow-y-auto selection:bg-emerald-500/40 shadow-inner">
                    {mensajeWhatsApp}
                  </div>

                  {/* Acciones principales */}
                  <div className="space-y-2 pt-2">
                    <button
                      type="button"
                      onClick={() => handleExportImage("download")}
                      disabled={generatingImage}
                      className="w-full bg-neutral-900 hover:bg-neutral-800 border border-amber-500/40 hover:border-amber-400 text-amber-300 hover:text-amber-200 font-bold text-xs py-3 px-4 rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md active:scale-98 disabled:opacity-50"
                    >
                      {generatingImage ? (
                        <>
                          <span className="w-3.5 h-3.5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                          <span>Generando imagen de alta resolución...</span>
                        </>
                      ) : (
                        <>
                          <span>📸</span>
                          <span>Descargar Boceto del Auto con Daños (PNG)</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={handleEnviarWhatsAppDirecto}
                      className="w-full bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white font-extrabold text-sm py-3.5 px-4 rounded-2xl shadow-lg shadow-emerald-950/50 flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      <span>💬 Enviar Ficha por WhatsApp</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleCopiarMensaje}
                      className="w-full bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 hover:border-neutral-500 text-neutral-200 hover:text-white font-bold text-xs py-3 px-4 rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm active:scale-98"
                    >
                      <span>📋 Copiar Texto Completo</span>
                    </button>
                  </div>
                </div>
              )}

              {/* CONTENIDO PESTAÑA FICHA TÉCNICA OFICIAL / IMPRIMIBLE */}
              {activeTab === "ficha" && (
                <div className="bg-[#121212] border border-neutral-800 rounded-3xl p-5 sm:p-6 space-y-4 shadow-xl animate-fade-in">
                  <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                    <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                      <span>🛡️</span>
                      <span>Acta de Recepción Oficial</span>
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleExportImage("download")}
                        disabled={generatingImage}
                        className="bg-neutral-800 hover:bg-neutral-700 text-amber-300 hover:text-amber-200 font-bold text-xs px-3 py-1.5 rounded-xl border border-amber-500/30 flex items-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95"
                      >
                        <span>📸</span>
                        <span>Boceto PNG</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleImprimir}
                        className="bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 hover:brightness-110 text-neutral-950 font-black text-xs px-3.5 py-1.5 rounded-xl border border-amber-300 flex items-center gap-1.5 transition-all cursor-pointer shadow-md shadow-amber-500/20 active:scale-95"
                        title="Imprimir acta técnica oficial o guardar en PDF (1 a 2 páginas)"
                      >
                        <span>🖨️</span>
                        <span>Imprimir Hoja (1-2 pág)</span>
                      </button>
                    </div>
                  </div>

                  {/* Tarjeta de Recepción Estilo Luxury */}
                  <div className="bg-[#161616] border border-amber-400/30 rounded-2xl p-4 sm:p-5 text-neutral-200 text-xs space-y-4 shadow-md font-sans">
                    {/* Cabecera */}
                    <div className="flex justify-between items-start border-b border-neutral-800 pb-3">
                      <div>
                        <h3 className="font-extrabold text-sm sm:text-base text-white tracking-tight">
                          {biz.nombre || "Taller de Detailing"}
                        </h3>
                        <p className="text-[11px] text-neutral-400">{biz.ciudad || "Estética Vehicular"}</p>
                      </div>
                      <div className="text-right">
                        <span className="font-mono font-bold text-amber-400 text-xs block">{folio}</span>
                        <span className="text-[10px] text-neutral-500">{fechaIngreso}</span>
                      </div>
                    </div>

                    {/* Datos Vehículo */}
                    <div className="grid grid-cols-2 gap-2 bg-black/40 p-3 rounded-xl border border-neutral-800/80">
                      <div>
                        <span className="text-[10px] text-neutral-500 block uppercase font-bold">Cliente</span>
                        <span className="font-bold text-neutral-200">{clienteNombre || "Sin especificar"}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-neutral-500 block uppercase font-bold">{config.terminoPatente}</span>
                        <span className="font-mono font-bold text-amber-400">{vehiculoPatente || "S/D"}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-neutral-500 block uppercase font-bold">{config.terminoVehiculo}</span>
                        <span className="font-semibold text-neutral-300">{vehiculoModelo || "No especificado"}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-neutral-500 block uppercase font-bold">Km / {config.terminoCombustible}</span>
                        <span className="text-neutral-300 font-semibold">{vehiculoKm || "-"} km ({nivelCombustible})</span>
                      </div>
                    </div>

                    {/* Daños registrados */}
                    <div>
                      <span className="text-[11px] font-bold text-neutral-300 block mb-1.5 uppercase tracking-wider">
                        Inspección Visual Previa ({damages.length})
                      </span>
                      {damages.length === 0 ? (
                        <p className="text-[11px] text-emerald-400 bg-emerald-950/20 border border-emerald-900/40 p-2 rounded-lg">
                          ✓ No se detectaron daños previos visibles al ingresar.
                        </p>
                      ) : (
                        <div className="space-y-1.5 max-h-48 overflow-y-auto">
                          {damages.map((d, i) => {
                            const t = DAMAGE_TYPES.find((dt) => dt.id === d.typeId);
                            return (
                              <div
                                key={d.id}
                                className="flex items-center justify-between bg-black/30 p-2 rounded-lg border border-neutral-800 text-[11px]"
                              >
                                <span className="font-semibold text-neutral-200">
                                  #{i + 1} {d.zone}
                                </span>
                                <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold border ${t?.badgeBg}`}>
                                  {t?.label} ({d.severity})
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Firma / Conformidad */}
                    <div className="pt-4 border-t border-neutral-800 text-[10px] text-neutral-400 space-y-4">
                      <p className="italic leading-normal">
                        "Se deja constancia del ingreso del vehículo descripto en el estado y condiciones aquí detalladas, prestando expresa conformidad con los daños preexistentes constatados."
                      </p>
                      <div className="grid grid-cols-2 gap-4 pt-4 text-center">
                        <div className="border-t border-neutral-700 pt-1">
                          <span className="block font-semibold text-neutral-300">Firma del Cliente</span>
                          <span className="text-[9px] text-neutral-500">Conformidad de entrega</span>
                        </div>
                        <div className="border-t border-neutral-700 pt-1">
                          <span className="block font-semibold text-neutral-300">Recepción Taller</span>
                          <span className="text-[9px] text-neutral-500">{biz.nombre || "Responsable"}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* CARD DE VALOR PARA EL NEGOCIO */}
              <div className="bg-gradient-to-br from-[#141414] to-[#0d0d0d] border border-neutral-800/80 rounded-3xl p-5 text-xs text-neutral-400 space-y-2">
                <span className="font-bold text-neutral-200 flex items-center gap-1.5">
                  <span className="text-amber-400">💡</span>
                  <span>Protección total para el taller</span>
                </span>
                <p className="text-[11px] leading-relaxed">
                  Al enviar la ficha por WhatsApp en el momento de la entrega, tenés una <strong>constancia fehaciente con fecha, hora y detalle de daños</strong>. Si luego el cliente reclama un rayón o bollo que ya traía, la ficha sirve como prueba irrefutable.
                </p>
              </div>
            </div>
          </div>
        )}
        </div>
      </div>

      {/* =========================================================================
          DOCUMENTO OFICIAL IMPRIMIBLE (SOLO VISIBLE EN @MEDIA PRINT / PDF)
          Diseñado estrictamente para A4: 1 página (hasta 8 daños) o máx 2 páginas.
          Protegido contra cortes indebidos mediante 'print-page-break-avoid'.
         ========================================================================= */}
      <div className="print-document hidden print:block bg-white text-slate-900 font-sans p-0 m-0">
        {/* ENCABEZADO / MEMBRETE */}
        <div className="border-b-2 border-slate-900 pb-2.5 mb-2.5 flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black uppercase tracking-tight text-slate-900 m-0 p-0">
                {biz.nombre || "The Zone Car Detailing"}
              </h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 border border-slate-300 text-slate-700">
                {config.bandera} {config.nombrePais}
              </span>
            </div>
            <p className="text-[10px] font-bold text-slate-700 uppercase tracking-wider mt-0.5 m-0">
              Acta de Recepción Técnica, Inspección de Daños & Custodia
            </p>
            <div className="text-[9px] text-slate-500 flex items-center gap-3 mt-1">
              <span>📍 {biz.ciudad || "Estética Automotriz"}</span>
              {biz.telefono && <span>📞 {biz.telefono}</span>}
              <span>🛡️ Constancia Fehaciente de Ingreso</span>
            </div>
          </div>

          <div className="text-right border border-slate-900 rounded-lg p-2 bg-slate-50 min-w-[145px]">
            <span className="text-[8.5px] uppercase font-bold text-slate-500 block tracking-wider">Folio Oficial</span>
            <span className="font-mono font-black text-sm text-slate-900 block leading-tight">{folio}</span>
            <span className="text-[8.5px] text-slate-600 block mt-0.5">{fechaIngreso}</span>
          </div>
        </div>

        {/* SECCIÓN 1: DATOS CLIENTE Y VEHÍCULO (TABLA COMPACTA) */}
        <div className="print-page-break-avoid mb-2.5 border border-slate-300 rounded-lg overflow-hidden text-[9.5px]">
          <div className="bg-slate-100 px-3 py-1 border-b border-slate-300 font-bold text-slate-800 uppercase tracking-wider text-[8.5px] flex justify-between">
            <span>1. Identificación del Titular y Unidad</span>
            <span>Estado: En Custodia Técnica</span>
          </div>
          <div className="grid grid-cols-4 divide-x divide-slate-200">
            <div className="p-2 space-y-0.5">
              <span className="text-[8px] text-slate-500 uppercase font-bold block">Titular / Cliente</span>
              <span className="font-bold text-slate-900 text-[10.5px] block leading-tight">{clienteNombre.trim() || "Sin especificar"}</span>
              <span className="text-slate-600 block text-[8.5px]">Tel: {clienteTelefono.trim() || "No registrado"}</span>
            </div>
            <div className="p-2 space-y-0.5">
              <span className="text-[8px] text-slate-500 uppercase font-bold block">{config.terminoVehiculo}</span>
              <span className="font-bold text-slate-900 text-[10.5px] block leading-tight">{vehiculoModelo.trim() || "No especificado"}</span>
              <span className="text-slate-600 block text-[8.5px]">Color: {vehiculoColor.trim() || "S/D"}</span>
            </div>
            <div className="p-2 space-y-0.5">
              <span className="text-[8px] text-slate-500 uppercase font-bold block">{config.terminoPatente}</span>
              <span className="font-mono font-black text-xs text-slate-900 bg-slate-200/80 px-2 py-0.5 rounded border border-slate-400 inline-block uppercase">
                {vehiculoPatente.trim() || "S/D"}
              </span>
            </div>
            <div className="p-2 space-y-0.5">
              <span className="text-[8px] text-slate-500 uppercase font-bold block">Kilometraje & {config.terminoCombustible}</span>
              <span className="font-bold text-slate-900 block leading-tight">{vehiculoKm.trim() || "-"} km</span>
              <span className="text-slate-600 block text-[8.5px]">Nivel: {nivelCombustible}</span>
            </div>
          </div>
        </div>

        {/* SECCIÓN 2: MAPEO VISUAL + TABLA DE DAÑOS PREVIOS (SIDE-BY-SIDE) */}
        <div className="print-page-break-avoid mb-2.5 border border-slate-300 rounded-lg p-2 bg-white">
          <div className="flex justify-between items-center border-b border-slate-200 pb-1 mb-2">
            <span className="font-bold text-slate-900 text-[9.5px] uppercase tracking-wider flex items-center gap-1.5">
              <span>🔍</span>
              <span>2. Inspección Técnica Visual de Daños Preexistentes</span>
            </span>
            <span className="text-[8.5px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-300">
              {damages.length === 0 ? "Sin daños constatados" : `${damages.length} daños registrados`}
            </span>
          </div>

          <div className="grid grid-cols-12 gap-3 items-start">
            {/* Columna Izquierda: Silueta 2D del Auto con Pines (5 cols) */}
            <div className="col-span-5 flex flex-col items-center border border-slate-200 rounded-lg p-1.5 bg-slate-50/60">
              <div className="w-[180px] h-[310px] relative">
                <svg viewBox="0 0 400 700" fill="none" className="w-full h-full">
                  {/* Sombra base */}
                  <ellipse cx="200" cy="355" rx="145" ry="305" fill="#e2e8f0" opacity="0.6" />

                  {/* Ruedas */}
                  <rect x="58" y="145" width="28" height="75" rx="12" fill="#334155" stroke="#1e293b" strokeWidth="2" />
                  <rect x="64" y="155" width="16" height="55" rx="6" fill="#cbd5e1" stroke="#475569" strokeWidth="1" />
                  <rect x="314" y="145" width="28" height="75" rx="12" fill="#334155" stroke="#1e293b" strokeWidth="2" />
                  <rect x="320" y="155" width="16" height="55" rx="6" fill="#cbd5e1" stroke="#475569" strokeWidth="1" />
                  <rect x="58" y="490" width="28" height="75" rx="12" fill="#334155" stroke="#1e293b" strokeWidth="2" />
                  <rect x="64" y="500" width="16" height="55" rx="6" fill="#cbd5e1" stroke="#475569" strokeWidth="1" />
                  <rect x="314" y="490" width="28" height="75" rx="12" fill="#334155" stroke="#1e293b" strokeWidth="2" />
                  <rect x="320" y="500" width="16" height="55" rx="6" fill="#cbd5e1" stroke="#475569" strokeWidth="1" />

                  {/* Espejos */}
                  <path d="M 80 255 Q 60 260 55 245 Q 60 235 85 240 Z" fill="#e2e8f0" stroke="#475569" strokeWidth="1.5" />
                  <path d="M 320 255 Q 340 260 345 245 Q 340 235 315 240 Z" fill="#e2e8f0" stroke="#475569" strokeWidth="1.5" />

                  {/* Chasis exterior blanco técnico con trazo oscuro */}
                  <path
                    d="M 125 70 
                       C 160 45, 240 45, 275 70 
                       C 300 85, 315 115, 315 145 
                       C 315 155, 305 160, 305 210 
                       C 305 230, 320 250, 320 320 
                       C 320 420, 320 470, 322 490 
                       C 325 510, 308 525, 308 565 
                       C 308 600, 295 625, 275 640 
                       C 240 660, 160 660, 125 640 
                       C 105 625, 92 600, 92 565 
                       C 92 525, 75 510, 78 490 
                       C 80 470, 80 420, 80 320 
                       C 80 250, 95 230, 95 210 
                       C 95 160, 85 155, 85 145 
                       C 85 115, 100 85, 125 70 Z"
                    fill="#ffffff"
                    stroke="#0f172a"
                    strokeWidth="2.5"
                  />

                  {/* Líneas de Capó */}
                  <path d="M 140 100 Q 200 115 260 100" stroke="#94a3b8" strokeWidth="1.5" />
                  <path d="M 135 115 Q 155 190 145 220" stroke="#94a3b8" strokeWidth="1.5" />
                  <path d="M 265 115 Q 245 190 255 220" stroke="#94a3b8" strokeWidth="1.5" />

                  {/* Ópticas delanteras */}
                  <path d="M 110 80 Q 140 75 145 95 Q 120 100 110 80 Z" fill="#e0f2fe" stroke="#0284c7" strokeWidth="1.5" />
                  <path d="M 290 80 Q 260 75 255 95 Q 280 100 290 80 Z" fill="#e0f2fe" stroke="#0284c7" strokeWidth="1.5" />

                  {/* Parabrisas */}
                  <path d="M 125 235 Q 200 220 275 235 L 260 310 Q 200 300 140 310 Z" fill="#f8fafc" stroke="#475569" strokeWidth="1.5" />

                  {/* Techo */}
                  <rect x="135" y="325" width="130" height="150" rx="10" fill="#f1f5f9" stroke="#64748b" strokeWidth="1.5" />
                  <rect x="150" y="340" width="100" height="70" rx="8" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1" />

                  {/* Luneta Trasera */}
                  <path d="M 140 490 Q 200 500 260 490 L 275 555 Q 200 565 125 555 Z" fill="#f8fafc" stroke="#475569" strokeWidth="1.5" />

                  {/* Baúl / Cajuela */}
                  <path d="M 135 570 Q 200 580 265 570" stroke="#94a3b8" strokeWidth="1.5" />
                  <path d="M 145 575 L 140 625" stroke="#cbd5e1" strokeWidth="1.5" />
                  <path d="M 255 575 L 260 625" stroke="#cbd5e1" strokeWidth="1.5" />

                  {/* Ópticas traseras */}
                  <path d="M 115 635 Q 145 640 150 625 Q 125 620 115 635 Z" fill="#fee2e2" stroke="#dc2626" strokeWidth="1.5" />
                  <path d="M 285 635 Q 255 640 250 625 Q 275 620 285 635 Z" fill="#fee2e2" stroke="#dc2626" strokeWidth="1.5" />

                  {/* Separador de puertas */}
                  <line x1="90" y1="395" x2="135" y2="395" stroke="#94a3b8" strokeWidth="1.5" />
                  <line x1="265" y1="395" x2="310" y2="395" stroke="#94a3b8" strokeWidth="1.5" />

                  {/* Textos de zonas */}
                  <text x="200" y="165" textAnchor="middle" fill="#64748b" fontSize="10" fontWeight="bold">
                    {countryCode === "MX" ? "COFRE" : "CAPÓ"}
                  </text>
                  <text x="200" y="445" textAnchor="middle" fill="#64748b" fontSize="10" fontWeight="bold">
                    TECHO
                  </text>
                  <text x="200" y="605" textAnchor="middle" fill="#64748b" fontSize="10" fontWeight="bold">
                    {countryCode === "MX" ? "CAJUELA" : countryCode === "ES" ? "MALETERO" : "BAÚL"}
                  </text>

                  {/* Pines de Daños Numerados */}
                  {damages.map((d, index) => {
                    const typeObj = DAMAGE_TYPES.find((t) => t.id === d.typeId);
                    const cx = (d.x / 100) * 400;
                    const cy = (d.y / 100) * 700;
                    const pinColor = typeObj?.color || "#dc2626";
                    return (
                      <g key={`print-pin-${d.id}`}>
                        <circle cx={cx} cy={cy} r="17" fill={pinColor} opacity="0.3" />
                        <circle cx={cx} cy={cy} r="13" fill={pinColor} stroke="#ffffff" strokeWidth="2.5" />
                        <text
                          x={cx}
                          y={cy + 4.5}
                          textAnchor="middle"
                          fill="#ffffff"
                          fontSize="11"
                          fontWeight="900"
                          fontFamily="sans-serif"
                        >
                          {index + 1}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>
              <span className="text-[7.5px] text-slate-500 mt-1 uppercase font-semibold">Silueta Técnica de Inspección</span>
            </div>

            {/* Columna Derecha: Tabla de Daños Registrados (7 cols) */}
            <div className="col-span-7">
              {damages.length === 0 ? (
                <div className="border border-emerald-300 bg-emerald-50 text-emerald-900 rounded-lg p-3 text-[9.5px] space-y-1">
                  <div className="font-bold flex items-center gap-1 text-[10.5px]">
                    <span>✓</span>
                    <span>Sin daños ni detalles preexistentes constatados</span>
                  </div>
                  <p className="text-slate-600 leading-relaxed text-[8.5px]">
                    La inspección visual inicial no arroja rayones, abolladuras, saltaduras de laca ni desperfectos aparentes en la chapa o cristales al momento de la entrega en custodia.
                  </p>
                </div>
              ) : (
                <div className="border border-slate-300 rounded-lg overflow-hidden text-[8.5px]">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-100 border-b border-slate-300 text-slate-700 font-bold">
                        <th className="py-1 px-1.5 w-5 text-center">#</th>
                        <th className="py-1 px-1.5">Zona</th>
                        <th className="py-1 px-1.5">Tipo</th>
                        <th className="py-1 px-1.5 text-center">Gravedad</th>
                        <th className="py-1 px-1.5">Observación</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {damages.map((d, i) => {
                        const t = DAMAGE_TYPES.find((dt) => dt.id === d.typeId);
                        return (
                          <tr key={d.id} className="hover:bg-slate-50">
                            <td className="py-1 px-1.5 text-center font-bold">
                              <span
                                className="inline-block w-4 h-4 rounded-full text-white text-[8px] font-black leading-4 text-center"
                                style={{ backgroundColor: t?.color || "#dc2626" }}
                              >
                                {i + 1}
                              </span>
                            </td>
                            <td className="py-1 px-1.5 font-bold text-slate-900">{d.zone}</td>
                            <td className="py-1 px-1.5 text-slate-700">{t?.label || "Detalle"}</td>
                            <td className="py-1 px-1.5 text-center">
                              <span
                                className={`px-1 py-0.2 rounded text-[7.5px] font-bold uppercase ${
                                  d.severity === "grave"
                                    ? "bg-red-100 text-red-700 border border-red-200"
                                    : d.severity === "medio"
                                    ? "bg-amber-100 text-amber-800 border border-amber-200"
                                    : "bg-emerald-100 text-emerald-700 border border-emerald-200"
                                }`}
                              >
                                {d.severity}
                              </span>
                            </td>
                            <td className="py-1 px-1.5 text-slate-600 italic">
                              {d.nota || "-"}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              <p className="text-[7.5px] text-slate-500 italic mt-1.5">
                * Los puntos numerados en la silueta corresponden a la ubicación exacta verificada conjuntamente con el titular.
              </p>
            </div>
          </div>
        </div>

        {/* SECCIÓN 3: CONTROL DE HABITÁCULO & PERTENENCIAS */}
        <div className="print-page-break-avoid mb-2.5 border border-slate-300 rounded-lg p-2 text-[8.5px] bg-white">
          <div className="font-bold text-slate-800 uppercase tracking-wider text-[8.5px] border-b border-slate-200 pb-1 mb-1.5">
            3. Control de Habitáculo & Pertenencias
          </div>
          <div className="grid grid-cols-4 gap-2 text-center">
            <div className="border border-slate-200 rounded p-1 bg-slate-50">
              <span className="text-[7.5px] text-slate-500 uppercase block font-bold">Tuerca Antirrobo</span>
              <span className="font-bold text-slate-900 text-[9.5px]">
                {tuercaSeguridad === "si" ? "✓ Presente" : tuercaSeguridad === "no" ? "✗ No entregada" : "N/A"}
              </span>
            </div>
            <div className="border border-slate-200 rounded p-1 bg-slate-50">
              <span className="text-[7.5px] text-slate-500 uppercase block font-bold">{config.terminoRuedaAuxilio}</span>
              <span className="font-bold text-slate-900 text-[9.5px]">
                {ruedaAuxilio ? "✓ Presente" : "✗ No posee"}
              </span>
            </div>
            <div className="border border-slate-200 rounded p-1 bg-slate-50">
              <span className="text-[7.5px] text-slate-500 uppercase block font-bold">Documentación</span>
              <span className="font-bold text-slate-900 text-[9.5px]">
                {documentosGuantera ? "✓ En Guantera" : "No declarada"}
              </span>
            </div>
            <div className="border border-slate-200 rounded p-1 bg-slate-50">
              <span className="text-[7.5px] text-slate-500 uppercase block font-bold">Objetos de Valor</span>
              <span className="font-bold text-slate-900 text-[9.5px]">
                {objetosRetirados ? "✓ Retirados" : "Declarados"}
              </span>
            </div>
          </div>
          {pertenenciasNotas.trim() && (
            <div className="mt-1 pt-1 border-t border-slate-100 text-slate-700">
              <span className="font-bold text-[7.5px] uppercase">Otras pertenencias declaradas: </span>
              <span className="italic">"{pertenenciasNotas.trim()}"</span>
            </div>
          )}
        </div>

        {/* SECCIÓN 4: SERVICIOS CONTRATADOS & ENTREGA */}
        <div className="print-page-break-avoid mb-2.5 border border-slate-300 rounded-lg p-2 text-[8.5px] bg-white">
          <div className="font-bold text-slate-800 uppercase tracking-wider text-[8.5px] border-b border-slate-200 pb-1 mb-1.5">
            4. Trabajos Contratados & Compromiso de Entrega
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <span className="text-[7.5px] text-slate-500 uppercase block font-bold">Tratamiento / Servicios Acordados</span>
              <span className="font-bold text-slate-900 text-[9.5px] block leading-tight">
                {serviciosSolicitados.trim() || "Servicio Integral de Detailing Automotriz"}
              </span>
            </div>
            <div>
              <span className="text-[7.5px] text-slate-500 uppercase block font-bold">Fecha / Hora Estimada de Entrega</span>
              <span className="font-bold text-slate-900 text-[9.5px] block leading-tight">
                {fechaEntregaEstimada.trim() || "A coordinar con cliente"}
              </span>
            </div>
          </div>
          {observacionesEspeciales.trim() && (
            <div className="mt-1 pt-1 border-t border-slate-100 text-slate-700">
              <span className="font-bold text-[7.5px] uppercase">Observaciones especiales: </span>
              <span className="italic">"{observacionesEspeciales.trim()}"</span>
            </div>
          )}
        </div>

        {/* SECCIÓN 5: EVIDENCIA FOTOGRÁFICA (SI EXISTEN FOTOS) */}
        {fotosDaños.length > 0 && (
          <div className="print-page-break-avoid mb-2.5 border border-slate-300 rounded-lg p-2 text-[8.5px] bg-white">
            <div className="font-bold text-slate-800 uppercase tracking-wider text-[8.5px] border-b border-slate-200 pb-1 mb-1.5 flex justify-between">
              <span>5. Registro Fotográfico Adjunto ({fotosDaños.length} fotos)</span>
              <span className="text-slate-500 text-[7.5px]">Tomas directas de recepción</span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {fotosDaños.slice(0, 4).map((f, i) => (
                <div key={i} className="border border-slate-300 rounded overflow-hidden aspect-video bg-slate-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={f} alt={`Foto daño #${i + 1}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
            {fotosDaños.length > 4 && (
              <span className="text-[7.5px] text-slate-500 italic mt-1 block">
                + {fotosDaños.length - 4} fotos adicionales almacenadas en el legajo digital del taller.
              </span>
            )}
          </div>
        )}

        {/* SECCIÓN 6: ACTA LEGAL & FIRMAS DE CONFORMIDAD */}
        <div className="print-page-break-avoid border-t-2 border-slate-900 pt-2 mt-2 text-[8.5px]">
          <p className="text-[7.5px] text-slate-600 leading-snug italic text-justify mb-4">
            "El cliente declara bajo juramento que el vehículo ingresa en las condiciones técnicas, mecánicas y estéticas precedentemente detalladas, prestando expresa conformidad con el relevamiento de daños preexistentes aquí efectuado, y deslindando al taller de responsabilidades por fallas preexistentes, vicios ocultos no manifestados o pertenencias no declaradas expresamente en la presente acta."
          </p>

          <div className="grid grid-cols-2 gap-8 text-center pt-2">
            <div className="border-t border-slate-400 pt-1">
              <span className="block font-bold text-slate-900 text-[9.5px]">Firma del Cliente / Titular</span>
              <span className="block text-[7.5px] text-slate-500">Aclaración & N° de Identificación</span>
            </div>
            <div className="border-t border-slate-400 pt-1">
              <span className="block font-bold text-slate-900 text-[9.5px]">Recepción del Taller: {biz.nombre || "Responsable"}</span>
              <span className="block text-[7.5px] text-slate-500">Firma, Sello & Conformidad Técnica</span>
            </div>
          </div>

          <div className="flex justify-between items-center text-[7px] text-slate-400 border-t border-slate-200 mt-3 pt-1">
            <span>Folio Oficial: {folio} • Documento de Custodia Vehicular</span>
            <span>Impreso el {fechaIngreso} • {biz.nombre || "Taller de Detailing"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
