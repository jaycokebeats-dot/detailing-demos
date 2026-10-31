"use client";

import { useEffect, useState, useMemo } from "react";
import type { Business, ServiceItem } from "@/data/business-helpers";
import { DEFAULT_DEMO_BUSINESS } from "@/data/demo-business";
import { getBusinessData } from "@/lib/supabase";
import { SERVICIOS_MEXICO } from "@/components/mexico/LandingMexico";
import { SERVICIOS_ESPANA } from "@/components/spain/LandingSpain";

type CountryCode = "AR" | "MX" | "ES";

interface CountryConfig {
  nombrePais: string;
  bandera: string;
  terminoCotizacion: string; // "Presupuesto" / "Cotización"
  terminoVehiculo: string; // "Auto" / "Coche"
  monedaSimbolo: string; // "$" / "€"
  monedaPosicion: "left" | "right";
  tamanios: {
    id: string;
    label: string;
    ejemplos: string;
  }[];
  tiemposSugeridos: string[];
  formasPagoSugeridas: string[];
}

const COUNTRY_CONFIGS: Record<CountryCode, CountryConfig> = {
  AR: {
    nombrePais: "Argentina",
    bandera: "🇦🇷",
    terminoCotizacion: "Presupuesto",
    terminoVehiculo: "Auto",
    monedaSimbolo: "$",
    monedaPosicion: "left",
    tamanios: [
      { id: "chico", label: "Chico", ejemplos: "Gol, 208, Sandero, Onix, Etios" },
      { id: "mediano", label: "Mediano / Sedán", ejemplos: "Corolla, Cruze, Vento, Focus, Cronos" },
      { id: "grande", label: "Camioneta / SUV", ejemplos: "Hilux, Amarok, Ranger, SW4, Taos, Tracker" },
    ],
    tiemposSugeridos: ["En el día (8 a 10 hs)", "24 a 48 hs hábiles", "48 a 72 hs (Curado cerámico)"],
    formasPagoSugeridas: [
      "Efectivo / Transferencia",
      "10% de descuento abonando en efectivo",
      "Tarjetas de crédito / Cuotas disponibles",
    ],
  },
  MX: {
    nombrePais: "México",
    bandera: "🇲🇽",
    terminoCotizacion: "Cotización",
    terminoVehiculo: "Auto",
    monedaSimbolo: "$",
    monedaPosicion: "left",
    tamanios: [
      { id: "chico", label: "Compacto / Chico", ejemplos: "Aveo, Versa, Ibiza, March, Swift" },
      { id: "mediano", label: "Mediano / Sedán", ejemplos: "Jetta, Sentra, Civic, Mazda 3, Forte" },
      { id: "grande", label: "SUV / Troca / Pick-up", ejemplos: "Tacoma, Silverado, RAV4, CR-V, Lobo" },
    ],
    tiemposSugeridos: ["Mismo día (8 a 10 hrs)", "24 a 48 hrs hábiles", "48 a 72 hrs (Curado cerámico)"],
    formasPagoSugeridas: [
      "Efectivo / Transferencia SPEI",
      "Meses sin intereses disponibles",
      "10% de descuento pago de contado",
    ],
  },
  ES: {
    nombrePais: "España",
    bandera: "🇪🇸",
    terminoCotizacion: "Presupuesto",
    terminoVehiculo: "Coche",
    monedaSimbolo: "€",
    monedaPosicion: "right",
    tamanios: [
      { id: "chico", label: "Pequeño / Utilitario", ejemplos: "Clio, Ibiza, 208, Polo, Yaris" },
      { id: "mediano", label: "Mediano / Berlina", ejemplos: "León, Golf, Serie 3, Clase C, A3" },
      { id: "grande", label: "SUV / 4x4 / Furgoneta", ejemplos: "Tiguan, Tucson, Qashqai, X3, Sportage" },
    ],
    tiemposSugeridos: ["En el mismo día", "24 a 48 horas laborales", "48 a 72 horas (Curado cerámico)"],
    formasPagoSugeridas: [
      "Bizum o Transferencia",
      "Tarjeta o Efectivo",
      "Pago fraccionado disponible",
    ],
  },
};

function getEffectiveServices(bizData: Business): ServiceItem[] {
  if (bizData.servicios && bizData.servicios.length > 0) {
    return bizData.servicios;
  }
  const p = (bizData.pais || "").toUpperCase();
  if (p === "MX" || bizData.template === "mexico") {
    return SERVICIOS_MEXICO;
  }
  if (p === "ES" || bizData.template === "spain") {
    return SERVICIOS_ESPANA;
  }
  return DEFAULT_DEMO_BUSINESS.servicios || [];
}

function parseNumericPrice(str: string): number {
  if (!str) return 0;
  const digits = str.replace(/[^\d]/g, "");
  return digits ? parseInt(digits, 10) : 0;
}

interface SelectedServiceState {
  nombre: string;
  precioNum: number;
  precioManual: string;
  proteccion?: string;
  activo: boolean;
}

export default function PresupuestoPage() {
  const [biz, setBiz] = useState<Business>(DEFAULT_DEMO_BUSINESS);
  const [currentSlug, setCurrentSlug] = useState<string>("demo");
  const [loading, setLoading] = useState(true);

  // Formulario del cliente
  const [clienteNombre, setClienteNombre] = useState("");
  const [vehiculoModelo, setVehiculoModelo] = useState("");
  const [vehiculoTamanio, setVehiculoTamanio] = useState("mediano");
  const [tiempoEstimado, setTiempoEstimado] = useState("");
  const [garantia, setGarantia] = useState("");
  const [formaPago, setFormaPago] = useState("");
  const [notasExtras, setNotasExtras] = useState("");

  // Servicios seleccionables
  const [serviciosState, setServiciosState] = useState<SelectedServiceState[]>([]);

  // Estados visuales
  const [copied, setCopied] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Detectar país del taller
  const countryCode: CountryCode = useMemo(() => {
    const p = (biz.pais || "").toUpperCase();
    if (p === "MX" || biz.template === "mexico") return "MX";
    if (p === "ES" || biz.template === "spain") return "ES";
    return "AR";
  }, [biz]);

  const config = COUNTRY_CONFIGS[countryCode] || COUNTRY_CONFIGS.AR;

  // Carga del taller desde URL o Supabase
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const slug = (params.get("taller") || params.get("slug") || "demo").toLowerCase().trim();
      setCurrentSlug(slug);

      async function load() {
        setLoading(true);
        try {
          // 1. Probar en Supabase
          const supabaseData = await getBusinessData(slug);
          if (supabaseData && supabaseData.nombre) {
            const effectiveServices = getEffectiveServices(supabaseData);
            setBiz({ ...supabaseData, servicios: effectiveServices });
            initServices(effectiveServices);
            setLoading(false);
            return;
          }

          // 2. Probar API de talleres
          if (slug !== "demo" && slug !== "taller-demo") {
            const res = await fetch(`/api/workshops?slug=${encodeURIComponent(slug)}`);
            if (res.ok) {
              const data = await res.json();
              const effectiveServices = getEffectiveServices(data);
              setBiz({ ...data, servicios: effectiveServices });
              initServices(effectiveServices);
              setLoading(false);
              return;
            }
          }

          // Fallback demo
          setBiz(DEFAULT_DEMO_BUSINESS);
          initServices(getEffectiveServices(DEFAULT_DEMO_BUSINESS));
        } catch (e) {
          console.error("Error al cargar taller:", e);
          setBiz(DEFAULT_DEMO_BUSINESS);
          initServices(getEffectiveServices(DEFAULT_DEMO_BUSINESS));
        } finally {
          setLoading(false);
        }
      }

      load();
    }
  }, []);

  const initServices = (servicios: ServiceItem[]) => {
    const list: SelectedServiceState[] = servicios.map((s, idx) => {
      const num = parseNumericPrice(s.precio || "");
      return {
        nombre: s.nombre,
        precioNum: num,
        precioManual: num > 0 ? num.toString() : "",
        proteccion: s.proteccion,
        activo: idx === 0, // El primer servicio marcado por defecto
      };
    });
    setServiciosState(list);
  };

  const handleToggleService = (index: number) => {
    setServiciosState((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], activo: !next[index].activo };
      return next;
    });
  };

  const handlePriceChange = (index: number, val: string) => {
    const cleanNum = val.replace(/[^\d]/g, "");
    const parsed = cleanNum ? parseInt(cleanNum, 10) : 0;
    setServiciosState((prev) => {
      const next = [...prev];
      next[index] = {
        ...next[index],
        precioManual: cleanNum,
        precioNum: parsed,
      };
      return next;
    });
  };

  const handleAddCustomService = () => {
    const customNombre = prompt("Nombre del servicio extra (Ej: Pulido de Ópticas, Sellado de Llantas):");
    if (!customNombre || !customNombre.trim()) return;

    setServiciosState((prev) => [
      ...prev,
      {
        nombre: customNombre.trim(),
        precioNum: 0,
        precioManual: "",
        activo: true,
      },
    ]);
  };

  // Calcular total
  const totalCotizado = useMemo(() => {
    return serviciosState
      .filter((s) => s.activo)
      .reduce((acc, s) => acc + (s.precioNum || 0), 0);
  }, [serviciosState]);

  const formatAmount = (amount: number) => {
    if (amount === 0) return "A convenir";
    const locale =
      config.nombrePais === "España"
        ? "es-ES"
        : config.nombrePais === "México"
        ? "es-MX"
        : "es-AR";
    const str = amount.toLocaleString(locale);
    return config.monedaPosicion === "left"
      ? `${config.monedaSimbolo}${str}`
      : `${str} ${config.monedaSimbolo}`;
  };

  // Tamaño del vehículo seleccionado
  const selectedTamanioObj = useMemo(() => {
    return config.tamanios.find((t) => t.id === vehiculoTamanio) || config.tamanios[1];
  }, [config, vehiculoTamanio]);

  // Mensaje de WhatsApp generado
  const whatsAppMessage = useMemo(() => {
    const nombreTaller = biz.nombre || "Taller de Detailing";
    const saludo = clienteNombre.trim() ? `¡Hola ${clienteNombre.trim()}! 👋` : `¡Hola! 👋`;
    const infoAuto = vehiculoModelo.trim()
      ? ` para tu *${vehiculoModelo.trim()}* (${selectedTamanioObj.label})`
      : ``;

    const serviciosActivos = serviciosState.filter((s) => s.activo);

    const lineasServicios = serviciosActivos.length > 0
      ? serviciosActivos
          .map((s) => {
            const precioFormatted = formatAmount(s.precioNum);
            const extra = s.proteccion ? ` _(${s.proteccion})_` : "";
            return `▪️ *${s.nombre}*: ${precioFormatted}${extra}`;
          })
          .join("\n")
      : `▪️ A coordinar según estado de la pintura.`;

    const bloques: string[] = [
      `${saludo} Te paso el *${config.terminoCotizacion.toLowerCase()}* detallado${infoAuto} en *${nombreTaller}*:\n`,
      `📋 *TRABAJOS INCLUIDOS:*`,
      lineasServicios,
      `\n💰 *TOTAL:* ${formatAmount(totalCotizado)}`,
    ];

    if (tiempoEstimado.trim()) {
      bloques.push(`⏱️ *Tiempo de entrega:* ${tiempoEstimado.trim()}`);
    }
    if (garantia.trim()) {
      bloques.push(`🛡️ *Garantía:* ${garantia.trim()}`);
    }
    if (formaPago.trim()) {
      bloques.push(`💳 *Forma de pago:* ${formaPago.trim()}`);
    }
    if (notasExtras.trim()) {
      bloques.push(`📌 *Nota:* ${notasExtras.trim()}`);
    }

    const despedida =
      config.nombrePais === "México"
        ? `\nQuedamos a tus órdenes para agendar tu cita cuando gustes. ¡Saludos!`
        : `\nQuedamos a tu disposición para coordinar tu turno cuando gustes. ¡Saludos!`;

    bloques.push(despedida);

    return bloques.join("\n");
  }, [
    biz.nombre,
    clienteNombre,
    vehiculoModelo,
    selectedTamanioObj,
    serviciosState,
    totalCotizado,
    tiempoEstimado,
    garantia,
    formaPago,
    notasExtras,
    config,
  ]);

  const handleCopyMessage = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(whatsAppMessage);
      setCopied(true);
      setToastMsg("✨ ¡Mensaje copiado! Pegalo en el chat de WhatsApp de tu cliente.");
      setTimeout(() => {
        setCopied(false);
        setToastMsg(null);
      }, 4000);
    }
  };

  const handleResetForm = () => {
    if (confirm("¿Limpiar los datos para armar un presupuesto nuevo?")) {
      setClienteNombre("");
      setVehiculoModelo("");
      setVehiculoTamanio("mediano");
      setTiempoEstimado("");
      setGarantia("");
      setFormaPago("");
      setNotasExtras("");
      initServices(getEffectiveServices(biz));
      setToastMsg("🔄 Formulario listo para un nuevo cliente.");
      setTimeout(() => setToastMsg(null), 3000);
    }
  };

  return (
    <main className="min-h-screen bg-[#070707] text-neutral-100 p-4 sm:p-6 pb-24 admin-scope">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-5 right-5 z-50 bg-[#161616] border border-neutral-600 text-neutral-100 px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 animate-fade-in text-xs sm:text-sm font-medium">
          <span className="text-base">✨</span>
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Contenedor Principal */}
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Cabecera de la App */}
        <header className="bg-[#121212] border border-neutral-800 rounded-3xl p-5 sm:p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-neutral-900 border border-neutral-700 flex items-center justify-center text-2xl shadow-sm shrink-0">
              🧾
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm sm:text-base font-extrabold text-white">
                  {biz.nombre}
                </span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-neutral-800 text-neutral-300 border border-neutral-700 font-mono">
                  {config.bandera} {config.nombrePais}
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-0.5">
                App de {config.terminoCotizacion} Rápida para WhatsApp
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              type="button"
              onClick={handleResetForm}
              className="bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-300 hover:text-white text-xs font-semibold px-3 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
              title="Limpiar campos"
            >
              <span>🔄</span>
              <span>Nuevo</span>
            </button>
            <a
              href={`/d/${currentSlug}/`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-300 hover:text-white text-xs font-semibold px-3 py-2 rounded-xl transition-all flex items-center gap-1.5"
            >
              <span>🔗</span>
              <span>Ver Web</span>
            </a>
          </div>
        </header>

        {loading ? (
          <div className="py-20 text-center text-neutral-400 text-sm flex flex-col items-center gap-2">
            <span className="w-6 h-6 border-2 border-neutral-400 border-t-transparent rounded-full animate-spin" />
            <span>Cargando servicios del taller...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* COLUMNA IZQUIERDA: CONFIGURADOR (7 cols) */}
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
                    <label className="block text-xs font-bold text-neutral-300 mb-1.5">
                      Nombre del Cliente
                    </label>
                    <input
                      type="text"
                      value={clienteNombre}
                      onChange={(e) => setClienteNombre(e.target.value)}
                      placeholder="Ej: Martín / Lucas"
                      className="w-full bg-[#181818] border border-neutral-700 rounded-xl px-3.5 py-2.5 text-sm text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:border-neutral-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-300 mb-1.5">
                      Modelo del {config.terminoVehiculo}
                    </label>
                    <input
                      type="text"
                      value={vehiculoModelo}
                      onChange={(e) => setVehiculoModelo(e.target.value)}
                      placeholder="Ej: Toyota Hilux / Audi A3"
                      className="w-full bg-[#181818] border border-neutral-700 rounded-xl px-3.5 py-2.5 text-sm text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:border-neutral-400"
                    />
                  </div>
                </div>

                {/* Tamaño del vehículo */}
                <div>
                  <label className="block text-xs font-bold text-neutral-300 mb-2">
                    Tamaño del Vehículo
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {config.tamanios.map((t) => {
                      const isSelected = vehiculoTamanio === t.id;
                      return (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => setVehiculoTamanio(t.id)}
                          className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                            isSelected
                              ? "bg-neutral-800 border-neutral-500 shadow-md ring-1 ring-neutral-400"
                              : "bg-[#181818] border-neutral-800 hover:border-neutral-700"
                          }`}
                        >
                          <div className="text-xs font-bold text-white">{t.label}</div>
                          <div className="text-[10px] text-neutral-400 mt-0.5 truncate">
                            {t.ejemplos}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* PASO 2: SERVICIOS Y PRECIOS EDITABLES */}
              <div className="bg-[#121212] border border-neutral-800 rounded-3xl p-5 sm:p-6 space-y-4 shadow-md">
                <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-neutral-800 text-neutral-200 text-xs font-bold flex items-center justify-center">
                      2
                    </span>
                    <span className="font-bold text-sm text-neutral-200">
                      Tratamientos a Incluir & Precios
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddCustomService}
                    className="text-xs text-neutral-300 hover:text-white bg-neutral-900 border border-neutral-700 hover:border-neutral-500 px-2.5 py-1 rounded-xl transition-all cursor-pointer flex items-center gap-1"
                  >
                    <span>➕</span>
                    <span>Extra</span>
                  </button>
                </div>

                <p className="text-[11px] text-neutral-400">
                  Tildá los servicios que querés incluir. Podés modificar el precio de cada uno libremente para este cliente:
                </p>

                <div className="space-y-2.5">
                  {serviciosState.map((srv, idx) => {
                    return (
                      <div
                        key={idx}
                        className={`p-3.5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                          srv.activo
                            ? "bg-[#171717] border-neutral-700 shadow-sm"
                            : "bg-[#101010]/80 border-neutral-800/80 opacity-60"
                        }`}
                      >
                        <div
                          onClick={() => handleToggleService(idx)}
                          className="flex items-center gap-3 cursor-pointer flex-1 select-none"
                        >
                          <input
                            type="checkbox"
                            checked={srv.activo}
                            onChange={() => {}}
                            className="w-4 h-4 rounded border-neutral-600 bg-neutral-900 text-white cursor-pointer accent-neutral-300 shrink-0"
                          />
                          <div>
                            <div className="text-xs sm:text-sm font-bold text-neutral-100">
                              {srv.nombre}
                            </div>
                            {srv.proteccion && (
                              <div className="text-[10px] text-neutral-400 mt-0.5">
                                {srv.proteccion}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Casillero de Precio Editable */}
                        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                          <span className="text-xs text-neutral-400 font-mono">
                            {config.monedaSimbolo}
                          </span>
                          <input
                            type="text"
                            value={srv.precioManual}
                            onChange={(e) => handlePriceChange(idx, e.target.value)}
                            placeholder="Precio"
                            disabled={!srv.activo}
                            className={`w-28 sm:w-32 bg-[#0c0c0c] border rounded-xl px-3 py-1.5 text-xs sm:text-sm font-mono font-bold text-right transition-colors ${
                              srv.activo
                                ? "border-neutral-600 text-white focus:border-neutral-300"
                                : "border-neutral-800 text-neutral-600"
                            }`}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* PASO 3: DETALLES EXTRA (TIEMPO, PAGO, NOTAS) */}
              <div className="bg-[#121212] border border-neutral-800 rounded-3xl p-5 sm:p-6 space-y-4 shadow-md">
                <div className="flex items-center gap-2 border-b border-neutral-800 pb-3">
                  <span className="w-6 h-6 rounded-full bg-neutral-800 text-neutral-200 text-xs font-bold flex items-center justify-center">
                    3
                  </span>
                  <span className="font-bold text-sm text-neutral-200">
                    Detalles Opcionales del Trabajo
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-neutral-300 mb-1.5">
                      Tiempo Estimado de Entrega
                    </label>
                    <input
                      type="text"
                      value={tiempoEstimado}
                      onChange={(e) => setTiempoEstimado(e.target.value)}
                      placeholder="Ej: 24 a 48 hs hábiles"
                      className="w-full bg-[#181818] border border-neutral-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:border-neutral-400"
                    />
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {config.tiemposSugeridos.map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setTiempoEstimado(t)}
                          className="text-[9px] bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white px-2 py-0.5 rounded border border-neutral-800 cursor-pointer"
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-300 mb-1.5">
                      Garantía / Sellado Aplicado
                    </label>
                    <input
                      type="text"
                      value={garantia}
                      onChange={(e) => setGarantia(e.target.value)}
                      placeholder="Ej: Garantía oficial por escrito"
                      className="w-full bg-[#181818] border border-neutral-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:border-neutral-400"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-neutral-300 mb-1.5">
                      Forma de Pago / Promoción
                    </label>
                    <input
                      type="text"
                      value={formaPago}
                      onChange={(e) => setFormaPago(e.target.value)}
                      placeholder="Ej: 10% OFF en efectivo / 3 Cuotas sin interés"
                      className="w-full bg-[#181818] border border-neutral-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:border-neutral-400"
                    />
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {config.formasPagoSugeridas.map((fp) => (
                        <button
                          key={fp}
                          type="button"
                          onClick={() => setFormaPago(fp)}
                          className="text-[9px] bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white px-2 py-0.5 rounded border border-neutral-800 cursor-pointer"
                        >
                          {fp}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-neutral-300 mb-1.5">
                      Nota o Aclaración Adicional
                    </label>
                    <input
                      type="text"
                      value={notasExtras}
                      onChange={(e) => setNotasExtras(e.target.value)}
                      placeholder="Ej: Incluye lavado de cortesía y aspirado completo."
                      className="w-full bg-[#181818] border border-neutral-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:border-neutral-400"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* COLUMNA DERECHA: VISTA PREVIA Y ACCIÓN (5 cols) */}
            <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-6">
              {/* Card de Resumen y Total */}
              <div className="bg-[#121212] border border-neutral-800 rounded-3xl p-5 sm:p-6 space-y-4 shadow-xl">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                    Total del {config.terminoCotizacion}
                  </span>
                  <span className="text-[10px] font-bold bg-neutral-800 text-neutral-300 px-2 py-0.5 rounded-full font-mono">
                    {serviciosState.filter((s) => s.activo).length} servicios
                  </span>
                </div>

                <div className="text-3xl sm:text-4xl font-black text-white font-mono tracking-tight">
                  {formatAmount(totalCotizado)}
                </div>

                {/* Botón Principal: Copiar para WhatsApp */}
                <button
                  type="button"
                  onClick={handleCopyMessage}
                  className={`w-full py-4 rounded-2xl font-black text-sm sm:text-base transition-all cursor-pointer flex items-center justify-center gap-2 shadow-xl active:scale-95 ${
                    copied
                      ? "bg-emerald-500 text-neutral-950 border border-emerald-400"
                      : "bg-gradient-to-r from-emerald-400 via-emerald-300 to-teal-400 hover:from-emerald-300 hover:to-teal-300 text-neutral-950 border border-emerald-300/40"
                  }`}
                >
                  {copied ? (
                    <>
                      <span className="text-lg">✓</span>
                      <span>¡Mensaje Copiado!</span>
                    </>
                  ) : (
                    <>
                      <span className="text-lg">💬</span>
                      <span>Copiar Mensaje para WhatsApp</span>
                    </>
                  )}
                </button>
              </div>

              {/* Burbuja de Vista Previa de WhatsApp */}
              <div className="bg-[#0b141a] border border-[#202c33] rounded-3xl p-4 sm:p-5 shadow-2xl relative overflow-hidden">
                <div className="flex items-center justify-between border-b border-[#202c33] pb-2.5 mb-3 text-xs text-neutral-400">
                  <span className="flex items-center gap-1.5 font-semibold text-emerald-400">
                    <span>📱</span> Vista Previa en WhatsApp
                  </span>
                  <span className="text-[10px] text-neutral-500">Formato exacto</span>
                </div>

                {/* Burbuja verde oscura de chat de WhatsApp */}
                <div className="bg-[#005c4b] text-neutral-100 rounded-2xl rounded-tr-none p-4 text-xs sm:text-sm font-sans leading-relaxed whitespace-pre-wrap shadow-md selection:bg-emerald-800 selection:text-white">
                  {whatsAppMessage}
                </div>

                <div className="mt-3 text-center">
                  <p className="text-[10px] text-neutral-400">
                    Al tocar <strong>"Copiar Mensaje"</strong> podés ir a WhatsApp y pegarlo directo en el chat con tu cliente.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
