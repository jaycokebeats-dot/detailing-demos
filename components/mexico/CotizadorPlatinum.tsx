"use client";

import { useState, useMemo } from "react";
import type { Business } from "@/data/business-helpers";

interface ServicioCotizador {
  id: string;
  nombre: string;
  descripcion: string;
  precioBase: number;
  popular?: boolean;
}

const SERVICIOS_COTIZADOR: ServicioCotizador[] = [
  {
    id: "interior",
    nombre: "Detallado Interior & Vestiduras",
    descripcion: "Lavado profundo con vapor, desinfección de asientos (piel/tela), alfombras y plásticos.",
    precioBase: 1900,
    popular: true,
  },
  {
    id: "motor",
    nombre: "Estética & Detallado de Motor",
    descripcion: "Limpieza técnica a vapor y abrillantado protector dieléctrico de plásticos y gomas.",
    precioBase: 1200,
  },
  {
    id: "correccion",
    nombre: "Corrección de Pintura & Abrillantado",
    descripcion: "Eliminación de microrrayones (swirls) y recuperación del brillo espejo de agencia.",
    precioBase: 2800,
    popular: true,
  },
  {
    id: "ceramico",
    nombre: "Tratamiento Cerámico 9H (2 a 3 Años)",
    descripcion: "Escudo nanotecnológico hidrofóbico con máxima protección UV y brillo cristalino.",
    precioBase: 4800,
    popular: true,
  },
  {
    id: "polarizado",
    nombre: "Película de Control Solar Cerámica",
    descripcion: "Rechazo de calor extremo y protección UV para cristales con alta claridad óptica.",
    precioBase: 2400,
  },
  {
    id: "faros",
    nombre: "Restauración & Sellado de Faros",
    descripcion: "Eliminación de paño amarillo y sellado cerámico para restaurar iluminación original.",
    precioBase: 800,
  },
];

const TIPOS_VEHICULO = [
  {
    id: "chico",
    label: "Compacto / Chico",
    ejemplos: "Aveo, Versa, Ibiza, Swift, March",
    multiplicador: 1.0,
    icono: "🚗",
  },
  {
    id: "mediano",
    label: "Mediano / Sedán",
    ejemplos: "Jetta, Sentra, Civic, Mazda 3, Forte",
    multiplicador: 1.15,
    icono: "🚘",
  },
  {
    id: "grande",
    label: "SUV / Troca / Pick-up",
    ejemplos: "Tacoma, Silverado, RAV4, CR-V, Lobo",
    multiplicador: 1.35,
    icono: "🚙",
  },
];

export default function CotizadorPlatinum({ biz }: { biz: Business }) {
  const [tamanioId, setTamanioId] = useState<string>("mediano");
  const [serviciosSeleccionados, setServiciosSeleccionados] = useState<string[]>([
    "interior",
    "correccion",
  ]);

  const tamanioActual = useMemo(
    () => TIPOS_VEHICULO.find((t) => t.id === tamanioId) || TIPOS_VEHICULO[1],
    [tamanioId]
  );

  const toggleServicio = (id: string) => {
    setServiciosSeleccionados((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  // Calcular precios por servicio según tamaño de vehículo
  const getPrecioServicio = (precioBase: number) => {
    const raw = precioBase * tamanioActual.multiplicador;
    // Redondear a centenas limpias en MXN (ej: 2185 -> 2200)
    return Math.round(raw / 100) * 100;
  };

  // Calcular total general
  const totalEstimado = useMemo(() => {
    return serviciosSeleccionados.reduce((acc, id) => {
      const s = SERVICIOS_COTIZADOR.find((item) => item.id === id);
      return acc + (s ? getPrecioServicio(s.precioBase) : 0);
    }, 0);
  }, [serviciosSeleccionados, tamanioActual]);

  // Mensaje para WhatsApp
  const whatsAppUrl = useMemo(() => {
    const waNumber = (biz.whatsapp || "524427151535").replace(/\D/g, "");
    const listaServicios = serviciosSeleccionados
      .map((id) => {
        const s = SERVICIOS_COTIZADOR.find((item) => item.id === id);
        if (!s) return null;
        return `• ${s.nombre} ($${getPrecioServicio(s.precioBase).toLocaleString("es-MX")} MXN)`;
      })
      .filter(Boolean)
      .join("\n");

    const texto = `¡Hola ${biz.nombre}! 👋
Acabo de cotizar en su página para un vehículo *${tamanioActual.label}*:

📋 *Tratamientos elegidos:*
${listaServicios || "• Consulta general"}

💰 *Estimado:* $${totalEstimado.toLocaleString("es-MX")} MXN

¿Tienen disponibilidad esta semana para agendar mi cita?`;

    return `https://wa.me/${waNumber}?text=${encodeURIComponent(texto)}`;
  }, [biz, tamanioActual, serviciosSeleccionados, totalEstimado]);

  return (
    <section id="cotizador" className="relative px-4 sm:px-8 py-20 bg-[#0a0a0a] border-t border-b border-neutral-800">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Cabecera */}
        <div className="text-center space-y-3">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-600/40 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
            ⚡ Cotizador Interactivo en Vivo
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Calcula tu Cotización en 10 Segundos
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400 max-w-xl mx-auto">
            Elige el tipo de vehículo y los tratamientos que deseas para obtener un presupuesto estimado y transparente al instante.
          </p>
        </div>

        {/* Paso 1: Tipo de Vehículo */}
        <div className="bg-[#121212] border border-neutral-800 rounded-3xl p-5 sm:p-7 space-y-4 shadow-xl">
          <div className="flex items-center gap-2.5 pb-3 border-b border-neutral-800/80">
            <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center justify-center border border-emerald-500/30">
              1
            </span>
            <span className="text-sm sm:text-base font-bold text-white">
              Selecciona el Tamaño de tu Vehículo
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {TIPOS_VEHICULO.map((t) => {
              const activo = tamanioId === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTamanioId(t.id)}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                    activo
                      ? "bg-neutral-800/90 border-emerald-400/80 ring-1 ring-emerald-400/50 shadow-lg shadow-emerald-950/20"
                      : "bg-[#171717] border-neutral-800 hover:border-neutral-700 text-neutral-400"
                  }`}
                >
                  <div className="text-2xl mb-1">{t.icono}</div>
                  <div className={`text-xs sm:text-sm font-bold ${activo ? "text-white" : "text-neutral-200"}`}>
                    {t.label}
                  </div>
                  <div className="text-[11px] text-neutral-400 mt-1 line-clamp-2">
                    {t.ejemplos}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Paso 2: Selección de Servicios */}
        <div className="bg-[#121212] border border-neutral-800 rounded-3xl p-5 sm:p-7 space-y-4 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-800/80">
            <div className="flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center justify-center border border-emerald-500/30">
                2
              </span>
              <span className="text-sm sm:text-base font-bold text-white">
                Elige los Tratamientos que Necesitas
              </span>
            </div>
            <span className="text-xs text-neutral-400 font-mono">
              {serviciosSeleccionados.length} seleccionados
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {SERVICIOS_COTIZADOR.map((srv) => {
              const seleccionado = serviciosSeleccionados.includes(srv.id);
              const precio = getPrecioServicio(srv.precioBase);
              return (
                <div
                  key={srv.id}
                  onClick={() => toggleServicio(srv.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                    seleccionado
                      ? "bg-[#181818] border-emerald-500/60 ring-1 ring-emerald-500/30 shadow-md"
                      : "bg-[#141414] border-neutral-800/80 hover:border-neutral-700 opacity-70 hover:opacity-100"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs sm:text-sm font-bold text-white">
                          {srv.nombre}
                        </span>
                        {srv.popular && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold">
                            Popular
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-neutral-400 line-clamp-2">
                        {srv.descripcion}
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={seleccionado}
                      onChange={() => {}}
                      className="w-4 h-4 rounded border-neutral-600 bg-neutral-900 text-emerald-400 cursor-pointer accent-emerald-500 mt-1 shrink-0"
                    />
                  </div>

                  <div className="pt-2 border-t border-neutral-800/60 flex items-center justify-between text-xs font-mono">
                    <span className="text-neutral-400">Precio estimado:</span>
                    <span className="font-bold text-emerald-400 text-sm">
                      ${precio.toLocaleString("es-MX")} MXN
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Paso 3: Total y Acción Directa a WhatsApp */}
        <div className="bg-gradient-to-br from-[#121a16] to-[#0f1412] border border-emerald-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center sm:text-left">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
              Total Estimado Transparente
            </span>
            <div className="text-3xl sm:text-5xl font-black text-white font-mono tracking-tight">
              ${totalEstimado.toLocaleString("es-MX")}{" "}
              <span className="text-base sm:text-xl font-normal text-neutral-400">MXN</span>
            </div>
            <p className="text-[11px] text-neutral-400">
              *Estimado sujeto a valoración visual del estado de la pintura y requerimientos especiales.
            </p>
          </div>

          <div className="w-full sm:w-auto shrink-0">
            <a
              href={whatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-neutral-950 font-black text-sm sm:text-base shadow-lg shadow-emerald-500/20 active:scale-95 transition-all text-center"
            >
              <span>📲</span>
              <span>Agendar Cita con este Presupuesto</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
