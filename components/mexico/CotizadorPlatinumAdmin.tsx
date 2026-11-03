"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import type {
  Business,
  CotizadorPlatinumServicio,
  CotizadorPlatinumComplemento,
  VehiculoId,
} from "@/data/business-helpers";
import {
  SERVICIOS_PLATINUM,
  COMPLEMENTOS_PLATINUM,
} from "./CotizadorPlatinum";
import {
  LuSparkles,
  LuChevronDown,
  LuChevronUp,
  LuSave,
  LuRotateCcw,
  LuCheck,
  LuCar,
  LuLayers,
  LuSearch,
  LuPlus,
  LuTag,
  LuDollarSign,
  LuEye,
} from "react-icons/lu";

interface CotizadorPlatinumAdminProps {
  biz: Business;
  onChange: (updatedBiz: Business) => void;
  onSave: () => Promise<void>;
  saving: boolean;
}

const VEHICULOS: { id: VehiculoId; label: string; sub: string }[] = [
  { id: "auto", label: "Auto / Sedán", sub: "Versa, Jetta, Civic..." },
  { id: "suv2", label: "SUV 2 Filas", sub: "RAV4, CR-V, Sportage..." },
  { id: "pickup", label: "Pick-Up", sub: "Tacoma, Hilux, Ranger..." },
  { id: "suv3", label: "SUV 3 Filas", sub: "Tahoe, Suburban, Explorer..." },
  { id: "van", label: "Van / Comercial", sub: "Transit, Urvan, Hiace..." },
];

const CATEGORIAS_INFO: Record<string, { label: string; color: string }> = {
  combos: { label: "Combos Estrella", color: "border-amber-400/40 text-amber-400 bg-amber-400/10" },
  mantenimiento: { label: "Mantenimiento Express", color: "border-emerald-400/40 text-emerald-400 bg-emerald-400/10" },
  "brillo-proteccion": { label: "Brillo & Protección", color: "border-sky-400/40 text-sky-400 bg-sky-400/10" },
  interiores: { label: "Interiores & Vapor", color: "border-purple-400/40 text-purple-400 bg-purple-400/10" },
  correccion: { label: "Pulidos & Cerámico", color: "border-cyan-400/40 text-cyan-400 bg-cyan-400/10" },
};

export default function CotizadorPlatinumAdmin({
  biz,
  onChange,
  onSave,
  saving,
}: CotizadorPlatinumAdminProps) {
  const [subTab, setSubTab] = useState<"servicios" | "complementos">("servicios");
  const [filtroCategoria, setFiltroCategoria] = useState<string>("todas");
  const [busqueda, setBusqueda] = useState<string>("");
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});

  // Auto-guardado inteligente (Debounce de 2.5s tras editar)
  const [autoSaveState, setAutoSaveState] = useState<"idle" | "saving" | "saved">("idle");
  const isFirstLoadRef = useRef(true);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Evitar auto-guardar en la carga inicial
    if (isFirstLoadRef.current) {
      isFirstLoadRef.current = false;
      return;
    }

    setAutoSaveState("saving");

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(async () => {
      try {
        await onSave();
        setAutoSaveState("saved");
        const t = setTimeout(() => {
          setAutoSaveState("idle");
        }, 3000);
        return () => clearTimeout(t);
      } catch (e) {
        setAutoSaveState("idle");
      }
    }, 2500);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [biz.cotizador_platinum]);

  // Catálogo activo actual con fallback al oficial
  const servicios: CotizadorPlatinumServicio[] = useMemo(() => {
    if (biz.cotizador_platinum?.servicios && biz.cotizador_platinum.servicios.length > 0) {
      return biz.cotizador_platinum.servicios;
    }
    return SERVICIOS_PLATINUM;
  }, [biz.cotizador_platinum?.servicios]);

  const complementos: CotizadorPlatinumComplemento[] = useMemo(() => {
    if (biz.cotizador_platinum?.complementos && biz.cotizador_platinum.complementos.length > 0) {
      return biz.cotizador_platinum.complementos;
    }
    return COMPLEMENTOS_PLATINUM;
  }, [biz.cotizador_platinum?.complementos]);

  // Expandir / Colapsar acordeones
  const toggleExpanded = (id: string) => {
    setExpandedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const expandAll = () => {
    const all: Record<string, boolean> = {};
    if (subTab === "servicios") {
      servicios.forEach((s) => (all[s.id] = true));
    } else {
      complementos.forEach((c) => (all[c.id] = true));
    }
    setExpandedIds(all);
  };

  const collapseAll = () => {
    setExpandedIds({});
  };

  // Mutadores de servicios
  const updateServicio = (id: string, updates: Partial<CotizadorPlatinumServicio>) => {
    const list = [...servicios];
    const idx = list.findIndex((s) => s.id === id);
    if (idx === -1) return;
    list[idx] = { ...list[idx], ...updates };

    onChange({
      ...biz,
      cotizador_platinum: {
        servicios: list,
        complementos: complementos,
      },
    });
  };

  const updateServicioPrecio = (id: string, vehiculo: VehiculoId, precioRaw: string) => {
    const val = precioRaw.trim() === "" ? null : Number(precioRaw.replace(/\D/g, ""));
    const list = [...servicios];
    const idx = list.findIndex((s) => s.id === id);
    if (idx === -1) return;
    list[idx] = {
      ...list[idx],
      precios: {
        ...list[idx].precios,
        [vehiculo]: val,
      },
    };

    onChange({
      ...biz,
      cotizador_platinum: {
        servicios: list,
        complementos: complementos,
      },
    });
  };

  // Mutadores de complementos
  const updateComplemento = (id: string, updates: Partial<CotizadorPlatinumComplemento>) => {
    const list = [...complementos];
    const idx = list.findIndex((c) => c.id === id);
    if (idx === -1) return;
    list[idx] = { ...list[idx], ...updates };

    onChange({
      ...biz,
      cotizador_platinum: {
        servicios: servicios,
        complementos: list,
      },
    });
  };

  const updateComplementoPrecioVariable = (id: string, vehiculo: VehiculoId, precioRaw: string) => {
    const val = precioRaw.trim() === "" ? null : Number(precioRaw.replace(/\D/g, ""));
    const list = [...complementos];
    const idx = list.findIndex((c) => c.id === id);
    if (idx === -1) return;
    const currentVars = list[idx].preciosVariables || {};
    list[idx] = {
      ...list[idx],
      preciosVariables: {
        ...currentVars,
        [vehiculo]: val,
      },
    };

    onChange({
      ...biz,
      cotizador_platinum: {
        servicios: servicios,
        complementos: list,
      },
    });
  };

  // Restablecer catálogo oficial de Platinum
  const handleResetCatalog = () => {
    if (
      confirm(
        "¿Estás seguro de restablecer el cotizador al catálogo oficial de Platinum Querétaro?\n\nSe restaurarán los 10 tratamientos, 10 adicionales y todos sus precios oficiales por defecto."
      )
    ) {
      onChange({
        ...biz,
        cotizador_platinum: {
          servicios: JSON.parse(JSON.stringify(SERVICIOS_PLATINUM)),
          complementos: JSON.parse(JSON.stringify(COMPLEMENTOS_PLATINUM)),
        },
      });
      alert("✅ Catálogo oficial de Platinum restablecido. Recuerda hacer clic en 'Guardar' para aplicar.");
    }
  };

  // Filtros de búsqueda
  const serviciosFiltrados = useMemo(() => {
    return servicios.filter((s) => {
      const matchCat = filtroCategoria === "todas" || s.categoria === filtroCategoria;
      const matchBusqueda =
        busqueda.trim() === "" ||
        s.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        s.descripcion.toLowerCase().includes(busqueda.toLowerCase());
      return matchCat && matchBusqueda;
    });
  }, [servicios, filtroCategoria, busqueda]);

  const complementosFiltrados = useMemo(() => {
    return complementos.filter((c) => {
      return (
        busqueda.trim() === "" ||
        c.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        c.descripcion.toLowerCase().includes(busqueda.toLowerCase())
      );
    });
  }, [complementos, busqueda]);

  return (
    <div className="space-y-6">
      {/* Banner / Header del Cotizador */}
      <div className="bg-gradient-to-r from-[#18181b] via-[#141416] to-[#18181b] border border-amber-500/30 rounded-3xl p-5 sm:p-7 shadow-lg relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">⚡</span>
              <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                <span>Editor del Cotizador Platinum</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-amber-400 text-black">
                  Querétaro
                </span>
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-neutral-400 mt-1 max-w-2xl leading-relaxed">
              Modifica en tiempo real nombres, descripciones completas, paquetes y precios de los 5 tipos de vehículos.
              Los cambios se actualizan al instante en la web del cotizador tras guardar.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2.5 shrink-0">
            {autoSaveState === "saving" && (
              <span className="text-[11px] text-amber-400 font-semibold flex items-center gap-1.5 animate-pulse bg-amber-400/10 border border-amber-400/20 px-2.5 py-1 rounded-lg">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span>Guardando automáticamente en Supabase...</span>
              </span>
            )}
            {autoSaveState === "saved" && (
              <span className="text-[11px] text-emerald-400 font-bold flex items-center gap-1.5 bg-emerald-400/10 border border-emerald-400/20 px-2.5 py-1 rounded-lg">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>✓ Guardado en Supabase</span>
              </span>
            )}
            {autoSaveState === "idle" && (
              <span className="text-[11px] text-neutral-400 hidden lg:inline-flex items-center gap-1">
                <span>☁️ Supabase sincronizado</span>
              </span>
            )}

            <button
              type="button"
              onClick={handleResetCatalog}
              className="bg-neutral-900/80 hover:bg-neutral-800 border border-neutral-700 hover:border-neutral-500 text-neutral-300 hover:text-white text-xs font-semibold px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
              title="Restaurar textos y precios oficiales de Platinum"
            >
              <LuRotateCcw className="text-xs" />
              <span>Restablecer Oficial</span>
            </button>

            <button
              type="button"
              onClick={onSave}
              disabled={saving}
              className="bg-amber-400 hover:bg-amber-300 active:scale-95 text-black font-extrabold text-xs px-4 py-2 rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
            >
              {saving ? (
                <span className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : (
                <LuSave className="text-sm" />
              )}
              <span>Guardar Cotizador</span>
            </button>
          </div>
        </div>
      </div>

      {/* Selector de Sección: Tratamientos Principales vs Adicionales */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="grid grid-cols-2 gap-2 bg-[#121214] p-1.5 rounded-2xl border border-neutral-800 w-full sm:w-auto sm:min-w-[380px]">
          <button
            type="button"
            onClick={() => {
              setSubTab("servicios");
              setFiltroCategoria("todas");
            }}
            className={`py-2 px-3 sm:px-4 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
              subTab === "servicios"
                ? "bg-amber-400 text-black shadow-sm font-black"
                : "text-neutral-400 hover:text-neutral-200"
            }`}
          >
            <LuCar className="text-sm" />
            <span>Tratamientos ({servicios.length})</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setSubTab("complementos");
              setFiltroCategoria("todas");
            }}
            className={`py-2 px-3 sm:px-4 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
              subTab === "complementos"
                ? "bg-amber-400 text-black shadow-sm font-black"
                : "text-neutral-400 hover:text-neutral-200"
            }`}
          >
            <LuLayers className="text-sm" />
            <span>Adicionales & Upgrades ({complementos.length})</span>
          </button>
        </div>

        {/* Buscador & Controles Expandir */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <LuSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 text-xs" />
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por nombre..."
              className="w-full bg-[#141416] border border-neutral-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-neutral-200 placeholder:text-neutral-500 focus:outline-none focus:border-amber-400/60"
            />
          </div>

          <button
            type="button"
            onClick={expandAll}
            className="px-2.5 py-1.5 rounded-xl bg-neutral-900 border border-neutral-800 text-[11px] font-medium text-neutral-300 hover:text-white hover:border-neutral-700 transition"
          >
            Expandir todos
          </button>
          <button
            type="button"
            onClick={collapseAll}
            className="px-2.5 py-1.5 rounded-xl bg-neutral-900 border border-neutral-800 text-[11px] font-medium text-neutral-300 hover:text-white hover:border-neutral-700 transition"
          >
            Colapsar
          </button>
        </div>
      </div>

      {/* Filtro de Categorías para Tratamientos */}
      {subTab === "servicios" && (
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <button
            type="button"
            onClick={() => setFiltroCategoria("todas")}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
              filtroCategoria === "todas"
                ? "bg-neutral-200 text-black"
                : "bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800"
            }`}
          >
            Todas ({servicios.length})
          </button>

          {Object.entries(CATEGORIAS_INFO).map(([catKey, info]) => {
            const count = servicios.filter((s) => s.categoria === catKey).length;
            const activo = filtroCategoria === catKey;
            return (
              <button
                key={catKey}
                type="button"
                onClick={() => setFiltroCategoria(catKey)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                  activo
                    ? "bg-amber-400 text-black font-bold"
                    : "bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800"
                }`}
              >
                <span>{info.label}</span>
                <span className={`text-[10px] px-1.5 rounded-md ${activo ? "bg-black/20 text-black" : "bg-neutral-800 text-neutral-300"}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* ======================================================== */}
      {/* SECCIÓN 1: TRATAMIENTOS PRINCIPALES (10 ITEMS)          */}
      {/* ======================================================== */}
      {subTab === "servicios" && (
        <div className="space-y-4">
          {serviciosFiltrados.length === 0 ? (
            <div className="bg-[#121214] border border-neutral-800 rounded-2xl p-8 text-center text-neutral-500 text-xs">
              No se encontraron tratamientos que coincidan con la búsqueda.
            </div>
          ) : (
            serviciosFiltrados.map((s, idx) => {
              const isExpanded = !!expandedIds[s.id];
              const catInfo = CATEGORIAS_INFO[s.categoria] || {
                label: s.categoria,
                color: "border-neutral-700 text-neutral-300 bg-neutral-800",
              };

              // Resumen de precios
              const preciosArray = Object.values(s.precios).filter((p): p is number => typeof p === "number");
              const minPrecio = preciosArray.length > 0 ? Math.min(...preciosArray) : 0;
              const maxPrecio = preciosArray.length > 0 ? Math.max(...preciosArray) : 0;

              return (
                <div
                  key={s.id}
                  className={`bg-[#121214] border rounded-2xl transition-all duration-200 overflow-hidden ${
                    isExpanded ? "border-amber-400/50 shadow-md ring-1 ring-amber-400/20" : "border-neutral-800 hover:border-neutral-700"
                  }`}
                >
                  {/* Cabecera / Resumen de la tarjeta */}
                  <div
                    onClick={() => toggleExpanded(s.id)}
                    className="p-4 sm:p-5 flex items-center justify-between gap-3 cursor-pointer select-none bg-[#141417] hover:bg-[#18181c] transition-colors"
                  >
                    <div className="flex flex-wrap items-center gap-2.5 min-w-0">
                      <span className="text-xs font-mono font-bold text-neutral-500 w-5">
                        {String(idx + 1).padStart(2, "0")}
                      </span>

                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${catInfo.color}`}
                      >
                        {catInfo.label}
                      </span>

                      {s.badge && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400/15 text-amber-400 border border-amber-400/30">
                          {s.badge}
                        </span>
                      )}

                      <h3 className="text-sm sm:text-base font-bold text-white truncate">{s.nombre}</h3>

                      <span className="hidden md:inline text-xs text-neutral-400 truncate max-w-xs">
                        • {s.subtitulo}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <span className="text-[11px] text-neutral-500 block leading-tight">Precios</span>
                        <span className="text-xs sm:text-sm font-extrabold text-amber-400">
                          ${minPrecio.toLocaleString("es-MX")}{" "}
                          {maxPrecio > minPrecio && `a $${maxPrecio.toLocaleString("es-MX")}`} MXN
                        </span>
                      </div>

                      <div className="w-7 h-7 rounded-lg bg-neutral-800 text-neutral-400 flex items-center justify-center text-xs">
                        {isExpanded ? <LuChevronUp /> : <LuChevronDown />}
                      </div>
                    </div>
                  </div>

                  {/* Cuerpo desplegable con los campos editables */}
                  {isExpanded && (
                    <div className="p-4 sm:p-6 border-t border-neutral-800/80 space-y-5 bg-[#0f0f12]">
                      {/* Fila 1: Nombre, Subtítulo y Badge */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-neutral-300 mb-1.5 flex items-center gap-1.5">
                            <span>Nombre del Tratamiento</span>
                          </label>
                          <input
                            type="text"
                            value={s.nombre}
                            onChange={(e) => updateServicio(s.id, { nombre: e.target.value })}
                            className="w-full bg-[#18181b] border border-neutral-700 focus:border-amber-400 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-white focus:outline-none"
                            placeholder="Ej: Platinum Full Detail"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-neutral-300 mb-1.5 flex items-center gap-1.5">
                            <span>Subtítulo Corto</span>
                          </label>
                          <input
                            type="text"
                            value={s.subtitulo}
                            onChange={(e) => updateServicio(s.id, { subtitulo: e.target.value })}
                            className="w-full bg-[#18181b] border border-neutral-700 focus:border-amber-400 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-white focus:outline-none"
                            placeholder="Ej: Renovación Integral Interior & Exterior"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-neutral-300 mb-1.5 flex items-center gap-1.5">
                            <LuTag className="text-xs text-amber-400" />
                            <span>Etiqueta Destacada (Badge)</span>
                          </label>
                          <input
                            type="text"
                            value={s.badge || ""}
                            onChange={(e) => updateServicio(s.id, { badge: e.target.value })}
                            className="w-full bg-[#18181b] border border-neutral-700 focus:border-amber-400 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-white focus:outline-none"
                            placeholder="Opcional: Más Solicitado, Especial Venta, etc."
                          />
                        </div>
                      </div>

                      {/* Fila 2: Descripción Completa */}
                      <div>
                        <label className="block text-xs font-bold text-neutral-300 mb-1.5">
                          Descripción para el cliente
                        </label>
                        <textarea
                          rows={2}
                          value={s.descripcion}
                          onChange={(e) => updateServicio(s.id, { descripcion: e.target.value })}
                          className="w-full bg-[#18181b] border border-neutral-700 focus:border-amber-400 rounded-xl p-3 text-xs sm:text-sm text-white focus:outline-none resize-y"
                          placeholder="Explicación clara del procedimiento para el cliente..."
                        />
                      </div>

                      {/* Fila 3: Precios por los 5 tipos de vehículos */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="block text-xs font-bold text-neutral-300 flex items-center gap-1.5">
                            <LuDollarSign className="text-xs text-amber-400" />
                            <span>Precios por Tipo de Vehículo ($ MXN)</span>
                          </label>
                          <span className="text-[11px] text-neutral-500">
                            Deja en blanco si un vehículo no aplica
                          </span>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                          {VEHICULOS.map((v) => {
                            const val = s.precios[v.id];
                            return (
                              <div
                                key={v.id}
                                className="bg-[#151518] border border-neutral-800 rounded-xl p-2.5 focus-within:border-amber-400/70 transition"
                              >
                                <span className="text-[11px] font-bold text-neutral-300 block leading-tight">
                                  {v.label}
                                </span>
                                <span className="text-[9px] text-neutral-500 block truncate mb-1.5">
                                  {v.sub}
                                </span>
                                <div className="relative">
                                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-500 text-xs">
                                    $
                                  </span>
                                  <input
                                    type="text"
                                    inputMode="numeric"
                                    value={val !== null && val !== undefined ? val : ""}
                                    onChange={(e) => updateServicioPrecio(s.id, v.id, e.target.value)}
                                    placeholder="N/A"
                                    className="w-full bg-[#1c1c20] border border-neutral-700 focus:border-amber-400 rounded-lg pl-6 pr-2 py-1.5 text-xs font-bold text-amber-400 focus:outline-none"
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Fila 4: Viñetas / Detalles de qué incluye */}
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="block text-xs font-bold text-neutral-300">
                            Qué incluye este servicio (1 viñeta por renglón)
                          </label>
                          <span className="text-[11px] text-neutral-500">
                            {(s.detalles || []).length} puntos destacados
                          </span>
                        </div>
                        <textarea
                          rows={4}
                          value={(s.detalles || []).join("\n")}
                          onChange={(e) => {
                            const lines = e.target.value.split("\n");
                            updateServicio(s.id, { detalles: lines });
                          }}
                          className="w-full bg-[#18181b] border border-neutral-700 focus:border-amber-400 rounded-xl p-3 text-xs sm:text-sm text-white focus:outline-none font-sans leading-relaxed"
                          placeholder="Paso 1: Lavado a presión con shampoo pH neutro&#10;Paso 2: Pulido a máquina de 1 paso..."
                        />
                        <p className="text-[11px] text-neutral-500 mt-1">
                          Cada renglón aparecerá con una viñeta dorada en la tarjeta del cotizador.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* SECCIÓN 2: ADICIONALES & UPGRADES (10 ITEMS)             */}
      {/* ======================================================== */}
      {subTab === "complementos" && (
        <div className="space-y-4">
          {complementosFiltrados.length === 0 ? (
            <div className="bg-[#121214] border border-neutral-800 rounded-2xl p-8 text-center text-neutral-500 text-xs">
              No se encontraron adicionales que coincidan con la búsqueda.
            </div>
          ) : (
            complementosFiltrados.map((c, idx) => {
              const isExpanded = !!expandedIds[c.id];
              const isRines = c.id === "ceramico-rines";
              const isFijo = c.precioTipo === "fijo";

              // Resumen de precio para la cabecera
              let precioResumen = "";
              if (isRines) {
                const p18 = c.precioR15_R18 ?? 1400;
                const p22 = c.precioR19_R22 ?? 1800;
                precioResumen = `$${p18.toLocaleString("es-MX")} / $${p22.toLocaleString("es-MX")} MXN`;
              } else if (isFijo) {
                precioResumen = `$${(c.precioFijo ?? 0).toLocaleString("es-MX")} MXN (Fijo)`;
              } else {
                const vars = Object.values(c.preciosVariables || {}).filter(
                  (p): p is number => typeof p === "number"
                );
                const min = vars.length > 0 ? Math.min(...vars) : 0;
                const max = vars.length > 0 ? Math.max(...vars) : 0;
                precioResumen = `$${min.toLocaleString("es-MX")}${
                  max > min ? ` a $${max.toLocaleString("es-MX")}` : ""
                } MXN`;
              }

              return (
                <div
                  key={c.id}
                  className={`bg-[#121214] border rounded-2xl transition-all duration-200 overflow-hidden ${
                    isExpanded ? "border-amber-400/50 shadow-md ring-1 ring-amber-400/20" : "border-neutral-800 hover:border-neutral-700"
                  }`}
                >
                  {/* Cabecera / Resumen del addon */}
                  <div
                    onClick={() => toggleExpanded(c.id)}
                    className="p-4 sm:p-5 flex items-center justify-between gap-3 cursor-pointer select-none bg-[#141417] hover:bg-[#18181c] transition-colors"
                  >
                    <div className="flex flex-wrap items-center gap-2.5 min-w-0">
                      <span className="text-xs font-mono font-bold text-neutral-500 w-5">
                        {String(idx + 1).padStart(2, "0")}
                      </span>

                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                          c.categoriaTipo === "ceramico"
                            ? "border-amber-400/40 text-amber-400 bg-amber-400/10"
                            : "border-sky-400/40 text-sky-400 bg-sky-400/10"
                        }`}
                      >
                        {c.categoriaTipo === "ceramico" ? "Upgrade Cerámico" : "Adicional"}
                      </span>

                      <h3 className="text-sm sm:text-base font-bold text-white truncate">{c.nombre}</h3>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <span className="text-[11px] text-neutral-500 block leading-tight">Tarifa</span>
                        <span className="text-xs sm:text-sm font-extrabold text-amber-400">
                          {precioResumen}
                        </span>
                      </div>

                      <div className="w-7 h-7 rounded-lg bg-neutral-800 text-neutral-400 flex items-center justify-center text-xs">
                        {isExpanded ? <LuChevronUp /> : <LuChevronDown />}
                      </div>
                    </div>
                  </div>

                  {/* Cuerpo desplegable con los campos editables */}
                  {isExpanded && (
                    <div className="p-4 sm:p-6 border-t border-neutral-800/80 space-y-5 bg-[#0f0f12]">
                      {/* Fila 1: Nombre */}
                      <div>
                        <label className="block text-xs font-bold text-neutral-300 mb-1.5">
                          Nombre del Adicional / Upgrade
                        </label>
                        <input
                          type="text"
                          value={c.nombre}
                          onChange={(e) => updateComplemento(c.id, { nombre: e.target.value })}
                          className="w-full bg-[#18181b] border border-neutral-700 focus:border-amber-400 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-white focus:outline-none"
                          placeholder="Ej: Cerámico Interior Integral"
                        />
                      </div>

                      {/* Fila 2: Descripción */}
                      <div>
                        <label className="block text-xs font-bold text-neutral-300 mb-1.5">
                          Descripción para el cliente
                        </label>
                        <textarea
                          rows={2}
                          value={c.descripcion}
                          onChange={(e) => updateComplemento(c.id, { descripcion: e.target.value })}
                          className="w-full bg-[#18181b] border border-neutral-700 focus:border-amber-400 rounded-xl p-3 text-xs sm:text-sm text-white focus:outline-none resize-y"
                          placeholder="Beneficios y aplicación para el cliente..."
                        />
                      </div>

                      {/* Fila 3: Configuración de Precios según el tipo */}
                      <div>
                        {/* CASO A: Cerámico de Rines (R15-R18 y R19-R22) */}
                        {isRines && (
                          <div className="space-y-3">
                            <label className="block text-xs font-bold text-neutral-300 flex items-center gap-1.5">
                              <LuDollarSign className="text-xs text-amber-400" />
                              <span>Precios por Medida de Rines ($ MXN)</span>
                            </label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg">
                              <div className="bg-[#151518] border border-neutral-800 rounded-xl p-3">
                                <span className="text-xs font-bold text-neutral-200 block mb-1">
                                  Rines R15 a R18 (Compactos / Medianos)
                                </span>
                                <div className="relative">
                                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-500 text-xs">
                                    $
                                  </span>
                                  <input
                                    type="text"
                                    inputMode="numeric"
                                    value={c.precioR15_R18 ?? 1400}
                                    onChange={(e) => {
                                      const num = Number(e.target.value.replace(/\D/g, ""));
                                      updateComplemento(c.id, { precioR15_R18: num });
                                    }}
                                    className="w-full bg-[#1c1c20] border border-neutral-700 focus:border-amber-400 rounded-lg pl-6 pr-3 py-1.5 text-xs sm:text-sm font-bold text-amber-400 focus:outline-none"
                                  />
                                </div>
                              </div>

                              <div className="bg-[#151518] border border-neutral-800 rounded-xl p-3">
                                <span className="text-xs font-bold text-neutral-200 block mb-1">
                                  Rines R19 a R22 (Grandes / Deportivos)
                                </span>
                                <div className="relative">
                                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-500 text-xs">
                                    $
                                  </span>
                                  <input
                                    type="text"
                                    inputMode="numeric"
                                    value={c.precioR19_R22 ?? 1800}
                                    onChange={(e) => {
                                      const num = Number(e.target.value.replace(/\D/g, ""));
                                      updateComplemento(c.id, { precioR19_R22: num });
                                    }}
                                    className="w-full bg-[#1c1c20] border border-neutral-700 focus:border-amber-400 rounded-lg pl-6 pr-3 py-1.5 text-xs sm:text-sm font-bold text-amber-400 focus:outline-none"
                                  />
                                </div>
                              </div>
                            </div>
                            <p className="text-[11px] text-neutral-500">
                              Estos valores actualizan los dos botones de selección rápida en la tarjeta de rines.
                            </p>
                          </div>
                        )}

                        {/* CASO B: Precio Fijo (Visión Clara, Ozono, etc.) */}
                        {!isRines && isFijo && (
                          <div className="max-w-xs">
                            <label className="block text-xs font-bold text-neutral-300 mb-1.5 flex items-center gap-1.5">
                              <LuDollarSign className="text-xs text-amber-400" />
                              <span>Precio Fijo Único ($ MXN)</span>
                            </label>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 text-xs">
                                $
                              </span>
                              <input
                                type="text"
                                inputMode="numeric"
                                value={c.precioFijo ?? ""}
                                onChange={(e) => {
                                  const num = Number(e.target.value.replace(/\D/g, ""));
                                  updateComplemento(c.id, { precioFijo: num });
                                }}
                                className="w-full bg-[#18181b] border border-neutral-700 focus:border-amber-400 rounded-xl pl-7 pr-3 py-2 text-xs sm:text-sm font-bold text-amber-400 focus:outline-none"
                              />
                            </div>
                            <p className="text-[11px] text-neutral-500 mt-1">
                              Tarifa plana que no varía según el tamaño del auto.
                            </p>
                          </div>
                        )}

                        {/* CASO C: Precio Variable por Vehículo */}
                        {!isRines && !isFijo && (
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <label className="block text-xs font-bold text-neutral-300 flex items-center gap-1.5">
                                <LuDollarSign className="text-xs text-amber-400" />
                                <span>Precios por Tipo de Vehículo ($ MXN)</span>
                              </label>
                              <span className="text-[11px] text-neutral-500">
                                Deja en blanco si no aplica para algún tamaño
                              </span>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                              {VEHICULOS.map((v) => {
                                const val = c.preciosVariables?.[v.id];
                                return (
                                  <div
                                    key={v.id}
                                    className="bg-[#151518] border border-neutral-800 rounded-xl p-2.5 focus-within:border-amber-400/70 transition"
                                  >
                                    <span className="text-[11px] font-bold text-neutral-300 block leading-tight">
                                      {v.label}
                                    </span>
                                    <span className="text-[9px] text-neutral-500 block truncate mb-1.5">
                                      {v.sub}
                                    </span>
                                    <div className="relative">
                                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-500 text-xs">
                                        $
                                      </span>
                                      <input
                                        type="text"
                                        inputMode="numeric"
                                        value={val !== null && val !== undefined ? val : ""}
                                        onChange={(e) =>
                                          updateComplementoPrecioVariable(c.id, v.id, e.target.value)
                                        }
                                        placeholder="N/A"
                                        className="w-full bg-[#1c1c20] border border-neutral-700 focus:border-amber-400 rounded-lg pl-6 pr-2 py-1.5 text-xs font-bold text-amber-400 focus:outline-none"
                                      />
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Barra flotante inferior de Guardar rápida para el cotizador */}
      <div className="sticky bottom-4 z-30 pt-4">
        <div className="bg-[#151518]/95 backdrop-blur-md border border-amber-400/30 p-3 sm:p-4 rounded-2xl flex items-center justify-between gap-3 shadow-2xl max-w-xl mx-auto">
          <div className="flex items-center gap-2">
            <span className="text-amber-400 text-base">⚡</span>
            <div className="text-xs">
              <span className="font-bold text-white block">Cotizador Platinum Querétaro</span>
              {autoSaveState === "saving" ? (
                <span className="text-amber-400 text-[11px] font-semibold animate-pulse">
                  Guardando automáticamente en Supabase...
                </span>
              ) : autoSaveState === "saved" ? (
                <span className="text-emerald-400 text-[11px] font-bold">
                  ✓ Cambios guardados automáticamente
                </span>
              ) : (
                <span className="text-neutral-400 text-[11px]">
                  Auto-guardado activo en Supabase
                </span>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={onSave}
            disabled={saving}
            className="bg-amber-400 hover:bg-amber-300 active:scale-95 text-black font-extrabold text-xs px-5 py-2.5 rounded-xl shadow-lg transition-all flex items-center gap-2 cursor-pointer"
          >
            {saving ? (
              <span className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
            ) : (
              <LuSave className="text-sm" />
            )}
            <span>Guardar Ahora</span>
          </button>
        </div>
      </div>
    </div>
  );
}
