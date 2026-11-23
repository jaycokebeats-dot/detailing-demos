"use client";

import { useState, useMemo, useEffect } from "react";
import { FaCarSide, FaTruckPickup, FaWhatsapp } from "react-icons/fa6";
import {
  LuSparkles,
  LuShieldCheck,
  LuSun,
  LuCheck,
  LuPlus,
  LuInfo,
  LuRotateCcw,
  LuClock,
  LuLayers,
  LuEye,
} from "react-icons/lu";
import type { Business } from "@/data/business-helpers";
import { waHref } from "@/data/business-helpers";

// 1. Tipos de Vehículos soportados por Shalom
export type VehiculoShalomId = "sedan" | "suv" | "pickup" | "suburban";

export interface TipoVehiculoShalom {
  id: VehiculoShalomId;
  label: string;
  sublabel: string;
  ejemplos: string;
  Icono: React.ComponentType<{ className?: string }>;
}

export const TIPOS_VEHICULO_SHALOM: TipoVehiculoShalom[] = [
  {
    id: "sedan",
    label: "Sedán / Hatchback",
    sublabel: "Compacto o Mediano",
    ejemplos: "Versa, Aveo, Jetta, Civic, Ibiza, Mazda 3, Swift",
    Icono: FaCarSide,
  },
  {
    id: "suv",
    label: "SUV (Camioneta)",
    sublabel: "2 Filas / Mediana",
    ejemplos: "CR-V, RAV4, Tucson, CX-5, Tiguan, Sportage",
    Icono: FaCarSide,
  },
  {
    id: "pickup",
    label: "Pick up",
    sublabel: "Caja corta / doble cabina",
    ejemplos: "Hilux, Ranger, Tacoma, Frontier, Colorado, L200",
    Icono: FaTruckPickup,
  },
  {
    id: "suburban",
    label: "Camioneta Amplia / XL",
    sublabel: "3 Filas o Gran Tamaño",
    ejemplos: "Suburban, Tahoe, Sienna, Odyssey, Durango, Yukon",
    Icono: FaCarSide,
  },
];

export type CategoriaShalomId = "polarizado" | "detallado" | "ppf" | "mantenimiento";

interface CotizadorShalomProps {
  biz: Business;
  onCotizacionChange?: (activa: boolean) => void;
}

export default function CotizadorShalom({ biz, onCotizacionChange }: CotizadorShalomProps) {
  // Estado principal
  const [vehiculo, setVehiculo] = useState<VehiculoShalomId>("sedan");
  const [categoria, setCategoria] = useState<CategoriaShalomId>("polarizado");

  // === SUB-OPCIONES POLARIZADO ===
  // Paquetes: protec, baby, llumar35, llumarTonos, 3m
  const [polarizadoMarca, setPolarizadoMarca] = useState<"protec" | "baby" | "llumar35" | "llumarTonos" | "3m">("llumar35");
  const [polarizadoTono, setPolarizadoTono] = useState<"5%" | "20%" | "35%" | "50%">("35%");
  const [incluirParabrisas, setIncluirParabrisas] = useState(false);
  const [tipoParabrisas, setTipoParabrisas] = useState<"marca" | "inteligente80" | "inteligente90" | "inteligente99" | "nanocenter">("marca");
  const [incluirFranja, setIncluirFranja] = useState(false);
  const [retiroMaterial, setRetiroMaterial] = useState<"ninguno" | "completo" | "laterales" | "medallon" | "parabrisas">("ninguno");

  // === SUB-OPCIONES DETALLADO ===
  // Tipo: full-detail, vestiduras, ceramico
  const [detalladoTipo, setDetalladoTipo] = useState<"full-detail" | "vestiduras" | "ceramico">("full-detail");
  const [desmontarAlfombra, setDesmontarAlfombra] = useState(false);

  // === SUB-OPCIONES PPF ===
  // Marca: dgnr (1 año) vs llumar (8 años)
  const [ppfMarca, setPpfMarca] = useState<"dgnr" | "llumar">("llumar");
  const [ppfCobertura, setPpfCobertura] = useState<"frente" | "completo">("frente");
  const [ppfInteriores, setPpfInteriores] = useState<"ninguno" | "cluster-pantalla" | "completo-puertas">("ninguno");

  // === SUB-OPCIONES MANTENIMIENTO ===
  const [mantenimientoTipo, setMantenimientoTipo] = useState<"motor-carroceria" | "lavado-encerado">("lavado-encerado");
  const [incluirFaros, setIncluirFaros] = useState(false);

  // Escuchar eventos globales para saltar de servicio directo desde las tarjetas de resultados
  useEffect(() => {
    onCotizacionChange?.(true);

    const handleSelectCategory = (e: any) => {
      const cat = e?.detail?.categoria;
      if (cat && ["polarizado", "detallado", "ppf", "mantenimiento"].includes(cat)) {
        setCategoria(cat);
      }
    };
    window.addEventListener("shalom:set-categoria", handleSelectCategory);
    return () => window.removeEventListener("shalom:set-categoria", handleSelectCategory);
  }, [onCotizacionChange]);

  // CÁLCULO DE PRECIO TOTAL Y DESGLOSE DINÁMICO
  const cotizacion = useMemo(() => {
    let subtotal = 0;
    const items: { label: string; precio: number; detalle?: string }[] = [];
    let tiempoEstimado = "Mismo día (Cita previa)";
    let garantiaTexto = "";

    if (categoria === "polarizado") {
      // 1. Paquete Base (Laterales y Medallón)
      const preciosBase: Record<string, Record<VehiculoShalomId, number>> = {
        protec: { sedan: 1500, suv: 1800, pickup: 1800, suburban: 2200 },
        baby: { sedan: 1900, suv: 2200, pickup: 2200, suburban: 2600 },
        llumar35: { sedan: 3300, suv: 3500, pickup: 3500, suburban: 4000 },
        llumarTonos: { sedan: 3600, suv: 3800, pickup: 3800, suburban: 4500 },
        "3m": { sedan: 5500, suv: 5800, pickup: 6000, suburban: 6200 },
      };

      const nombresMarca: Record<string, string> = {
        protec: "Protec Sun (Económica)",
        baby: "Baby Blue / Baby Green",
        llumar35: "Llumar 35% (Intermedio Oficial)",
        llumarTonos: `Llumar Tono Especial (${polarizadoTono})`,
        "3m": "3M LUMAR Protec-Sun (Alta Gama)",
      };

      const basePrice = preciosBase[polarizadoMarca][vehiculo];
      subtotal += basePrice;
      items.push({
        label: `Película Antiasalto ${nombresMarca[polarizadoMarca]} (Laterales + Medallón)`,
        precio: basePrice,
        detalle: `Tono seleccionado: ${polarizadoTono} • Bloqueo UV y control térmico`,
      });

      // 2. Parabrisas adicional
      if (incluirParabrisas) {
        if (tipoParabrisas === "marca") {
          const preciosParabrisas: Record<string, number> = {
            protec: 1100,
            baby: 1200,
            llumar35: 2100,
            llumarTonos: 2100,
            "3m": 3600,
          };
          const pPrice = preciosParabrisas[polarizadoMarca];
          subtotal += pPrice;
          items.push({
            label: `Parabrisas Completo en ${polarizadoMarca === "protec" ? "Protec Sun" : polarizadoMarca === "3m" ? "3M" : "Llumar"}`,
            precio: pPrice,
            detalle: "Instalación térmica en parabrisas delantero completo",
          });
        } else if (tipoParabrisas === "inteligente80") {
          subtotal += 2500;
          items.push({
            label: "Parabrisas Inteligente Tono Azul (80% Rechazo UV)",
            precio: 2500,
            detalle: "Película inteligente atérmica de alta reducción de calor",
          });
        } else if (tipoParabrisas === "inteligente90") {
          subtotal += 3000;
          items.push({
            label: "Parabrisas Inteligente Transparente (90% Rechazo UV)",
            precio: 3000,
            detalle: "Máxima transparencia con ultra rechazo solar de rayos UV",
          });
        } else if (tipoParabrisas === "inteligente99") {
          subtotal += 3300;
          items.push({
            label: "Parabrisas Inteligente Transparente (99.9% Rechazo UV)",
            precio: 3300,
            detalle: "Grado óptico superior con rechazo total del 99.9% UV",
          });
        } else if (tipoParabrisas === "nanocenter") {
          subtotal += 3000;
          items.push({
            label: "Parabrisas Nanocerámico en Colores",
            precio: 3000,
            detalle: "Nanocerámica reflectiva en color personalizado",
          });
        }
      }

      // 3. Franja parasol
      if (incluirFranja) {
        subtotal += 450;
        items.push({
          label: "Franja Parasol Superior en Parabrisas",
          precio: 450,
        });
      }

      // 4. Retiro de película anterior
      if (retiroMaterial !== "ninguno") {
        const retiroPrecios: Record<string, { label: string; precio: number }> = {
          completo: { label: "Retiro de película vieja (Laterales + Medallón)", precio: 600 },
          laterales: { label: "Retiro de película vieja en laterales", precio: 400 },
          medallon: { label: "Retiro de película vieja en medallón trasero", precio: 400 },
          parabrisas: { label: "Retiro de película vieja en parabrisas", precio: 400 },
        };
        const rItem = retiroPrecios[retiroMaterial];
        subtotal += rItem.precio;
        items.push({
          label: rItem.label,
          precio: rItem.precio,
          detalle: "Limpieza profunda de residuos de adhesivo sin dañar las líneas térmicas",
        });
      }

      tiempoEstimado = "3 a 5 horas (mismo día con cita)";
      garantiaTexto = "Garantía por escrito contra desprendimiento o burbujas";
    } else if (categoria === "detallado") {
      if (detalladoTipo === "full-detail") {
        const preciosFull: Record<VehiculoShalomId, number> = {
          sedan: 7000,
          suv: 9000,
          pickup: 9000,
          suburban: 11000,
        };
        const tiemposFull: Record<VehiculoShalomId, string> = {
          sedan: "5 días hábiles aprox.",
          suv: "7 días hábiles aprox.",
          pickup: "7 días hábiles aprox.",
          suburban: "8 días hábiles aprox.",
        };

        const price = preciosFull[vehiculo];
        subtotal += price;
        tiempoEstimado = tiemposFull[vehiculo];
        items.push({
          label: "Paquete Todo Incluido | Detallado Automotriz Profesional",
          precio: price,
          detalle:
            "Lavado de motor, carrocería, descontaminado total 360°, interior a vapor, toldo, ductos, alfombra, cajuela, corrección de pintura en etapas y cerámico de 6 meses.",
        });
        garantiaTexto = "Cerámico 9H garantizado por 6 meses + Acabado espejo";
      } else if (detalladoTipo === "vestiduras") {
        const preciosVest: Record<VehiculoShalomId, { base: number; conAlfombra: number }> = {
          sedan: { base: 2000, conAlfombra: 3000 },
          suv: { base: 2500, conAlfombra: 3500 },
          pickup: { base: 2500, conAlfombra: 3500 },
          suburban: { base: 3000, conAlfombra: 4500 },
        };
        const pVest = preciosVest[vehiculo];
        const finalPrice = desmontarAlfombra ? pVest.conAlfombra : pVest.base;
        subtotal += finalPrice;
        items.push({
          label: `Lavado Profundo de Vestiduras & Interior ${desmontarAlfombra ? "(Con desmonte de alfombra)" : ""}`,
          precio: finalPrice,
          detalle: desmontarAlfombra
            ? "Desinfección con vapor seco, asientos, toldo, plásticos, ductos y desmonte total de alfombra"
            : "Desinfección con vapor seco, lavado de asientos (tela/piel), toldo, ductos y plásticos",
        });
        tiempoEstimado = desmontarAlfombra ? "24 a 48 horas (secado profundo)" : "1 día hábil";
        garantiaTexto = "Garantía de sanitización antibacteriana sin humedad residual";
      } else if (detalladoTipo === "ceramico") {
        const preciosCeramico: Record<VehiculoShalomId, number> = {
          sedan: 4500,
          suv: 6500,
          pickup: 6500,
          suburban: 8500,
        };
        const cPrice = preciosCeramico[vehiculo];
        subtotal += cPrice;
        items.push({
          label: "Corrección de Pintura & Recubrimiento Cerámico",
          precio: cPrice,
          detalle: "Pulido en etapas para eliminar microrrayones + abrillantado fino y sellado cerámico",
        });
        tiempoEstimado = "2 a 3 días hábiles";
        garantiaTexto = "Garantía por escrito de brillo espejo y repelencia hidrofóbica";
      }
    } else if (categoria === "ppf") {
      const preciosPPF: Record<
        "dgnr" | "llumar",
        Record<"frente" | "completo", Record<VehiculoShalomId, number>>
      > = {
        dgnr: {
          frente: { sedan: 15000, suv: 18000, pickup: 20000, suburban: 23000 },
          completo: { sedan: 40000, suv: 45000, pickup: 47000, suburban: 50000 },
        },
        llumar: {
          frente: { sedan: 20000, suv: 25000, pickup: 25000, suburban: 28000 },
          completo: { sedan: 48000, suv: 50000, pickup: 52000, suburban: 59000 },
        },
      };

      const ppfPrice = preciosPPF[ppfMarca][ppfCobertura][vehiculo];
      subtotal += ppfPrice;
      const marcaNombre = ppfMarca === "llumar" ? "Llumar (8 Años de Garantía)" : "DGNR (1 Año de Garantía)";
      items.push({
        label: `Blindaje PPF ${marcaNombre} — ${ppfCobertura === "frente" ? "Paquete Frente Protegido" : "Carrocería Completa"}`,
        precio: ppfPrice,
        detalle:
          ppfCobertura === "frente"
            ? "Cofre completo, facia delantera, salpicaderas frontales y carcasas de espejos"
            : "Blindaje de poliuretano autorregenerable en el 100% de paneles exteriores",
      });

      if (ppfInteriores === "cluster-pantalla") {
        subtotal += 2800;
        items.push({
          label: "PPF en Interiores (Clúster Digital + Pantalla + Contorno de Palanca)",
          precio: 2800,
          detalle: "Corte milimétrico contra rayones en piano black y pantallas táctiles",
        });
      } else if (ppfInteriores === "completo-puertas") {
        subtotal += 3000;
        items.push({
          label: "PPF Interior Completo (+ Molduras y Puertas Interiores)",
          precio: 3000,
          detalle: "Clúster, pantallas, consola central y molduras de puertas",
        });
      }

      tiempoEstimado = ppfCobertura === "completo" ? "4 a 6 días hábiles" : "2 a 3 días hábiles";
      garantiaTexto =
        ppfMarca === "llumar"
          ? "🛡️ 8 AÑOS DE GARANTÍA POR ESCRITO (Contra amarillamiento, craquelado y desprendimiento)"
          : "🛡️ 1 AÑO DE GARANTÍA POR ESCRITO";
    } else if (categoria === "mantenimiento") {
      if (mantenimientoTipo === "motor-carroceria") {
        const preciosMotor: Record<VehiculoShalomId, number> = {
          sedan: 800,
          suv: 1000,
          pickup: 1200,
          suburban: 1400,
        };
        const pM = preciosMotor[vehiculo];
        subtotal += pM;
        items.push({
          label: "Lavado Técnico de Motor con Vapor & Carrocería",
          precio: pM,
          detalle: "Limpieza dieléctrica de motor con hidratación satinada de plásticos + baño exterior",
        });
      } else {
        const preciosEncerado: Record<VehiculoShalomId, number> = {
          sedan: 700,
          suv: 900,
          pickup: 1000,
          suburban: 1200,
        };
        const pE = preciosEncerado[vehiculo];
        subtotal += pE;
        items.push({
          label: "Lavado y Encerado Protector + Humectante Interior",
          precio: pE,
          detalle: "Cera líquida de alta protección UV + hidratación de pieles y plásticos en cabina",
        });
      }

      if (incluirFaros) {
        subtotal += 600;
        items.push({
          label: "Restauración y Pulido de Faros y Calaveras con Polímero",
          precio: 600,
          detalle: "Elimina la capa opaca y amarillenta devolviendo 100% de transparencia",
        });
      }

      tiempoEstimado = "2 a 4 horas (mismo día)";
      garantiaTexto = "Garantía de servicio artesanal a mano sin micro-rayones";
    }

    return {
      subtotal,
      items,
      tiempoEstimado,
      garantiaTexto,
    };
  }, [
    categoria,
    vehiculo,
    polarizadoMarca,
    polarizadoTono,
    incluirParabrisas,
    tipoParabrisas,
    incluirFranja,
    retiroMaterial,
    detalladoTipo,
    desmontarAlfombra,
    ppfMarca,
    ppfCobertura,
    ppfInteriores,
    mantenimientoTipo,
    incluirFaros,
  ]);

  // Mensaje para enviar a WhatsApp
  const mensajeWhatsApp = useMemo(() => {
    const vLabel = TIPOS_VEHICULO_SHALOM.find((v) => v.id === vehiculo)?.label || "Auto";
    let msg = `🇲🇽 *HOLA SHALOM ESTÉTICA AUTOMOTRIZ*\n`;
    msg += `Quisiera agendar una cita con la siguiente cotización generada en su web:\n\n`;
    msg += `🚗 *Vehículo:* ${vLabel}\n`;
    msg += `📋 *Servicios Seleccionados:*\n`;

    cotizacion.items.forEach((it, i) => {
      msg += `  ${i + 1}. ${it.label}: $${it.precio.toLocaleString("es-MX")} MXN\n`;
    });

    msg += `\n💰 *TOTAL ESTIMADO:* $${cotizacion.subtotal.toLocaleString("es-MX")} MXN\n`;
    msg += `⏱️ *Tiempo Estimado:* ${cotizacion.tiempoEstimado}\n`;
    if (cotizacion.garantiaTexto) {
      msg += `🛡️ *Garantía:* ${cotizacion.garantiaTexto}\n`;
    }
    msg += `\n¿Tienen citas disponibles para estos días en Toluca? ¡Muchas gracias!`;
    return msg;
  }, [vehiculo, cotizacion]);

  return (
    <section id="cotizador" className="relative px-3 sm:px-6 py-16 sm:py-24 bg-[#0a0e0c] text-white overflow-hidden">
      {/* Halo y brillo ambiental con los colores de México */}
      <div
        className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[400px] rounded-full pointer-events-none opacity-20 blur-[130px]"
        style={{ background: "radial-gradient(circle, #059669 0%, #10b981 40%, transparent 70%)" }}
      />
      <div
        className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[500px] h-[400px] rounded-full pointer-events-none opacity-15 blur-[130px]"
        style={{ background: "radial-gradient(circle, #dc2626 0%, #ef4444 40%, transparent 70%)" }}
      />

      {/* Marca de agua sutil del águila de Shalom */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden z-0">
        <img
          src="/logo/shalom-logo.png"
          alt=""
          aria-hidden="true"
          className="w-[600px] sm:w-[900px] max-w-none opacity-[0.035] brightness-75 contrast-125 filter"
        />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* ENCABEZADO DEL COTIZADOR TRICOLOR */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
          {/* Badge Bandera de México */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-gradient-to-r from-emerald-950/80 via-neutral-900 to-rose-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-semibold tracking-wider uppercase mb-4 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
            <span className="text-sm">🇲🇽</span>
            <span>Cotizador Oficial Shalom • Toluca, Edo. Méx.</span>
          </div>

          <h2 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight mb-3">
            Cotiza tu Servicio en Vivo{" "}
            <span className="block mt-1 bg-gradient-to-r from-emerald-400 via-slate-100 to-rose-400 bg-clip-text text-transparent">
              con Precios Transparentes
            </span>
          </h2>

          {/* Barrita Tricolor Hairline */}
          <div className="w-40 sm:w-56 h-[3px] mx-auto my-4 rounded-full bg-gradient-to-r from-emerald-500 via-white to-rose-500 shadow-[0_0_12px_rgba(255,255,255,0.4)]" />

          <p className="text-xs sm:text-sm text-slate-300 font-light leading-relaxed max-w-2xl mx-auto">
            Elige tu vehículo y personaliza tu paquete de polarizado, detallado o blindaje PPF. El sistema calculará tu cotización exacta al instante con garantía oficial por escrito.
          </p>
        </div>

        {/* PASO 1: SELECTOR DE VEHÍCULO */}
        <div className="mb-10 sm:mb-12">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <span className="size-5 rounded-full bg-emerald-500 text-black flex items-center justify-center text-xs font-extrabold">1</span>
              <span>Selecciona tu Tipo de Vehículo</span>
            </h3>
            <span className="text-[11px] text-emerald-400 font-medium hidden sm:inline">Tarifas calibradas para México ($ MXN)</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-4">
            {TIPOS_VEHICULO_SHALOM.map((tipo) => {
              const activo = vehiculo === tipo.id;
              const Icono = tipo.Icono;
              return (
                <button
                  key={tipo.id}
                  onClick={() => setVehiculo(tipo.id)}
                  className={`group relative p-3 sm:p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer ${
                    activo
                      ? "border-emerald-500 bg-gradient-to-b from-emerald-950/40 to-neutral-950 shadow-[0_0_25px_rgba(16,185,129,0.3)] ring-1 ring-emerald-400/50 scale-[1.02]"
                      : "border-white/10 bg-neutral-950/70 hover:border-white/25 hover:bg-neutral-900/60"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className={`p-2 rounded-xl ${activo ? "bg-emerald-500/20 text-emerald-400" : "bg-white/5 text-slate-400"}`}>
                      <Icono className="size-5 sm:size-6" />
                    </div>
                    {activo && (
                      <span className="flex items-center justify-center size-5 rounded-full bg-emerald-500 text-black text-xs font-bold">
                        <LuCheck className="size-3 stroke-[3]" />
                      </span>
                    )}
                  </div>
                  <h4 className="text-xs sm:text-sm font-bold text-white mb-0.5">{tipo.label}</h4>
                  <p className="text-[10px] text-slate-400 mb-1.5">{tipo.sublabel}</p>
                  <p className="text-[10px] text-slate-300 font-light truncate">{tipo.ejemplos}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* PASO 2: TABS DE CATEGORÍA DE SERVICIO */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <span className="size-5 rounded-full bg-emerald-500 text-black flex items-center justify-center text-xs font-extrabold">2</span>
              <span>Elige el Servicio o Tratamiento</span>
            </h3>
          </div>

          <div className="flex flex-wrap gap-2 p-1.5 rounded-2xl bg-neutral-950 border border-white/10">
            {[
              { id: "polarizado", label: "🛡️ Películas Antiasalto", desc: "Protec Sun, Llumar y 3M" },
              { id: "detallado", label: "💎 Detallado Profesional", desc: "Integral, Vestiduras o Cerámico" },
              { id: "ppf", label: "🛡️ Protección PPF", desc: "DGNR y Llumar 8 años" },
              { id: "mantenimiento", label: "✨ Mantenimiento Express", desc: "Motor, Encerado y Faros" },
            ].map((cat) => {
              const activo = categoria === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setCategoria(cat.id as CategoriaShalomId)}
                  className={`flex-1 min-w-[140px] px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl text-left transition-all cursor-pointer ${
                    activo
                      ? "bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 text-black font-extrabold shadow-[0_4px_20px_rgba(16,185,129,0.35)]"
                      : "text-slate-300 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <span className={`block text-xs sm:text-sm font-bold ${activo ? "text-neutral-950 font-black" : "text-white"}`}>
                    {cat.label}
                  </span>
                  <span className={`block text-[10px] ${activo ? "text-emerald-950 font-medium" : "text-slate-300 font-light"}`}>
                    {cat.desc}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* PASO 3: CONFIGURADOR DETALLADO SEGÚN CATEGORÍA */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 items-start mb-12">
          {/* PANEL IZQUIERDO: CONTROLES DE CONFIGURACIÓN */}
          <div className="lg:col-span-2 space-y-6">
            {/* === CATEGORÍA 1: POLARIZADOS === */}
            {categoria === "polarizado" && (
              <div className="space-y-6 rounded-3xl p-5 sm:p-7 border border-white/10 bg-neutral-950/70">
                <div>
                  <h4 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                    <LuSun className="size-4 text-emerald-400" />
                    <span>Selecciona Marca y Gama de Película (Laterales + Medallón)</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      { id: "protec", label: "Protec Sun", badge: "Económica", desc: "Filtro solar standard y seguridad antiasalto." },
                      { id: "baby", label: "Baby Blue / Baby Green", badge: "Tono Exclusivo", desc: "Tono traslúcido estético deportivo con filtro UV." },
                      { id: "llumar35", label: "Llumar Tono 35%", badge: "Más Vendido", desc: "Tono intermedio reglamentario de alta durabilidad." },
                      { id: "llumarTonos", label: "Llumar Tonos Especiales", badge: "5%, 20%, 50%", desc: "Elige entre privacidad total (5%) o intermedio oscuro (20%)." },
                      { id: "3m", label: "3M LUMAR Protec-Sun", badge: "Alta Gama", desc: "Máxima tecnología de rechazo térmico y blindaje antiasalto." },
                    ].map((m) => {
                      const activo = polarizadoMarca === m.id;
                      return (
                        <div
                          key={m.id}
                          onClick={() => setPolarizadoMarca(m.id as any)}
                          className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                            activo
                              ? "border-emerald-500 bg-emerald-950/30 ring-1 ring-emerald-500/50"
                              : "border-white/10 bg-black/40 hover:border-white/20"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-xs sm:text-sm text-white">{m.label}</span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                              {m.badge}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-300 leading-snug">{m.desc}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* SELECTOR DE TONO */}
                <div>
                  <h4 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                    <LuEye className="size-4 text-emerald-400" />
                    <span>Tono de Privacidad Deseado</span>
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { id: "5%", label: "5% Limusina", sub: "Máxima Privacidad" },
                      { id: "20%", label: "20% Oscuro", sub: "Equilibrado" },
                      { id: "35%", label: "35% Intermedio", sub: "Reglamentario" },
                      { id: "50%", label: "50% Claro", sub: "Máxima Visión" },
                    ].map((t) => {
                      const activo = polarizadoTono === t.id;
                      return (
                        <button
                          key={t.id}
                          onClick={() => setPolarizadoTono(t.id as any)}
                          className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                            activo
                              ? "border-emerald-500 bg-emerald-500/20 text-white font-bold"
                              : "border-white/10 bg-black/40 text-slate-300 hover:text-white"
                          }`}
                        >
                          <span className="block text-xs font-bold">{t.label}</span>
                          <span className="block text-[10px] text-slate-300">{t.sub}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* ADICIONAL: PARABRISAS COMPLETO */}
                <div className="border-t border-white/10 pt-5 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-sm font-bold text-white block">¿Deseas agregar Parabrisas Delantero Completo?</span>
                      <span className="text-xs text-slate-300">
                        {incluirParabrisas ? "El parabrisas delantero se instalará con termoformado especial" : "Solo laterales y medallón trasero incluidos"}
                      </span>
                    </div>
                    <button
                      onClick={() => setIncluirParabrisas(!incluirParabrisas)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-bold uppercase transition-all cursor-pointer shrink-0 ${
                        incluirParabrisas
                          ? "bg-emerald-500 text-black shadow-[0_0_15px_rgba(16,185,129,0.5)]"
                          : "bg-white/10 text-white hover:bg-white/20"
                      }`}
                    >
                      {incluirParabrisas ? "✓ Agregado" : "+ Agregar"}
                    </button>
                  </div>

                  {incluirParabrisas && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 animate-fade-in">
                      {[
                        { id: "marca", label: "Misma Marca Elegida", desc: "Termoformado en tono homologado" },
                        { id: "inteligente80", label: "Inteligente Azul 80% UV (+$2,500)", desc: "Rechazo de calor sin oscurecer" },
                        { id: "inteligente90", label: "Inteligente Transparente 90% UV (+$3,000)", desc: "Óptica transparente de alto blindaje" },
                        { id: "inteligente99", label: "Inteligente Transparente 99.9% UV (+$3,300)", desc: "Máxima protección dermatológica" },
                        { id: "nanocenter", label: "Nanocerámico Colores (+$3,000)", desc: "Cualquier tono nanocerámico a elección" },
                      ].map((pOpt) => {
                        const activo = tipoParabrisas === pOpt.id;
                        return (
                          <div
                            key={pOpt.id}
                            onClick={() => setTipoParabrisas(pOpt.id as any)}
                            className={`p-2.5 rounded-xl border text-left cursor-pointer text-xs ${
                              activo ? "border-emerald-500 bg-emerald-950/40 text-white" : "border-white/10 bg-black/30 text-slate-300"
                            }`}
                          >
                            <span className="font-bold block">{pOpt.label}</span>
                            <span className="text-[10px] text-slate-300">{pOpt.desc}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* ADICIONAL: FRANJA O RETIRO */}
                <div className="border-t border-white/10 pt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Franja */}
                  <div
                    onClick={() => setIncluirFranja(!incluirFranja)}
                    className={`p-3 rounded-2xl border cursor-pointer flex items-center justify-between ${
                      incluirFranja ? "border-emerald-500 bg-emerald-950/30" : "border-white/10 bg-black/30"
                    }`}
                  >
                    <div>
                      <span className="text-xs font-bold text-white block">Franja Parasol Superior</span>
                      <span className="text-[10px] text-slate-300">+$450 MXN • Bloquea el sol de frente</span>
                    </div>
                    <span className={`size-5 rounded-full flex items-center justify-center text-xs font-bold ${incluirFranja ? "bg-emerald-500 text-black" : "bg-white/10 text-white"}`}>
                      {incluirFranja ? "✓" : "+"}
                    </span>
                  </div>

                  {/* Retiro de Película vieja */}
                  <div>
                    <label className="text-xs font-bold text-white block mb-1">¿Hay que retirar película anterior?</label>
                    <select
                      value={retiroMaterial}
                      onChange={(e) => setRetiroMaterial(e.target.value as any)}
                      className="w-full bg-neutral-900 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                    >
                      <option value="ninguno">No (Cristales limpios de agencia)</option>
                      <option value="completo">Sí, retirar todo el coche (+$600 MXN)</option>
                      <option value="laterales">Solo retirar laterales (+$400 MXN)</option>
                      <option value="medallon">Solo retirar medallón trasero (+$400 MXN)</option>
                      <option value="parabrisas">Solo retirar parabrisas (+$400 MXN)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* === CATEGORÍA 2: DETALLADO Y TRATAMIENTOS === */}
            {categoria === "detallado" && (
              <div className="space-y-6 rounded-3xl p-5 sm:p-7 border border-white/10 bg-neutral-950/70">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    {
                      id: "full-detail",
                      titulo: "Paquete Todo Incluido",
                      tag: "Recomendado",
                      desc: "Motor, carrocería, interiores vapor profundo, sanitizado de ductos, tolvas, rines, corrección de pintura y cerámico de 6 meses.",
                    },
                    {
                      id: "vestiduras",
                      titulo: "Lavado de Vestiduras",
                      tag: "Interiores",
                      desc: "Sanitización profunda con vapor seco en asientos, alfombras, toldo y ductos.",
                    },
                    {
                      id: "ceramico",
                      titulo: "Corrección & Cerámico",
                      tag: "Pintura Espejo",
                      desc: "Pulido en etapas para eliminar rayones circulares + sellador nanocerámico.",
                    },
                  ].map((pkg) => {
                    const activo = detalladoTipo === pkg.id;
                    return (
                      <div
                        key={pkg.id}
                        onClick={() => setDetalladoTipo(pkg.id as any)}
                        className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                          activo
                            ? "border-emerald-500 bg-gradient-to-b from-emerald-950/50 to-neutral-950 shadow-[0_0_20px_rgba(16,185,129,0.25)] ring-1 ring-emerald-500/50"
                            : "border-white/10 bg-black/40 hover:border-white/25"
                        }`}
                      >
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase tracking-wider inline-block mb-2">
                          {pkg.tag}
                        </span>
                        <h4 className="text-sm font-bold text-white mb-1.5">{pkg.titulo}</h4>
                        <p className="text-xs text-slate-300 leading-relaxed font-light">{pkg.desc}</p>
                      </div>
                    );
                  })}
                </div>

                {/* OPCIÓN ADICIONAL: DESMONTE DE ALFOMBRA SI ELIGE VESTIDURAS */}
                {detalladoTipo === "vestiduras" && (
                  <div
                    onClick={() => setDesmontarAlfombra(!desmontarAlfombra)}
                    className={`p-4 rounded-2xl border cursor-pointer flex items-center justify-between transition-all ${
                      desmontarAlfombra
                        ? "border-emerald-500 bg-emerald-950/30 ring-1 ring-emerald-500/50"
                        : "border-white/15 bg-black/40"
                    }`}
                  >
                    <div>
                      <span className="text-xs sm:text-sm font-bold text-white block">
                        ¿Deseas desmontar y lavar la alfombra fuera del auto?
                      </span>
                      <span className="text-xs text-slate-300 leading-relaxed">
                        Permite una extracción 100% libre de olores, humedad oculta y secado en horno.
                        {vehiculo === "suburban" ? " (+ $1,500 MXN)" : " (+ $1,000 MXN)"}
                      </span>
                    </div>
                    <span
                      className={`size-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                        desmontarAlfombra ? "bg-emerald-500 text-black" : "bg-white/10 text-white"
                      }`}
                    >
                      {desmontarAlfombra ? "✓" : "+"}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* === CATEGORÍA 3: PPF === */}
            {categoria === "ppf" && (
              <div className="space-y-6 rounded-3xl p-5 sm:p-7 border border-white/10 bg-neutral-950/70">
                {/* Comparador de Marca */}
                <div>
                  <h4 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                    <LuShieldCheck className="size-4 text-emerald-400" />
                    <span>Selecciona la Calidad y Garantía de tu PPF</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div
                      onClick={() => setPpfMarca("llumar")}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                        ppfMarca === "llumar"
                          ? "border-rose-500/80 bg-gradient-to-b from-rose-950/30 to-neutral-950 ring-1 ring-rose-500/60"
                          : "border-white/10 bg-black/40 hover:border-white/25"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-bold text-white">PPF Llumar</span>
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 uppercase">
                          8 Años por Escrito
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        Gama Platinum mundial. Poliuretano autorregenerable con resistencia balística a piedras y 8 años de garantía por escrito contra amarilleo.
                      </p>
                    </div>

                    <div
                      onClick={() => setPpfMarca("dgnr")}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                        ppfMarca === "dgnr"
                          ? "border-emerald-500 bg-emerald-950/30 ring-1 ring-emerald-500/50"
                          : "border-white/10 bg-black/40 hover:border-white/25"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-bold text-white">PPF DGNR</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase">
                          1 Año de Garantía
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        Protección económica autorregenerable contra impactos frontales y arañazos de uso diario.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Cobertura: Frente vs Completo */}
                <div>
                  <h4 className="text-sm font-bold text-white mb-2">Área de Cobertura Exterior</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setPpfCobertura("frente")}
                      className={`p-3 rounded-xl border text-left cursor-pointer ${
                        ppfCobertura === "frente"
                          ? "border-emerald-500 bg-emerald-950/40 text-white font-bold"
                          : "border-white/10 bg-black/30 text-slate-300"
                      }`}
                    >
                      <span className="block text-xs sm:text-sm font-bold">🛡️ Frente Protegido</span>
                      <span className="block text-[10px] text-slate-300 font-normal">Cofre, facia, salpicaderas y espejos</span>
                    </button>
                    <button
                      onClick={() => setPpfCobertura("completo")}
                      className={`p-3 rounded-xl border text-left cursor-pointer ${
                        ppfCobertura === "completo"
                          ? "border-emerald-500 bg-emerald-950/40 text-white font-bold"
                          : "border-white/10 bg-black/30 text-slate-300"
                      }`}
                    >
                      <span className="block text-xs sm:text-sm font-bold">✨ Carrocería Completa (360°)</span>
                      <span className="block text-[10px] text-slate-300 font-normal">Todos los paneles blindados</span>
                    </button>
                  </div>
                </div>

                {/* PPF Interiores */}
                <div className="border-t border-white/10 pt-4">
                  <h4 className="text-sm font-bold text-white mb-2">Protección de Pantallas y Consola Interior</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {[
                      { id: "ninguno", label: "Sin interiores", desc: "Solo exterior" },
                      { id: "cluster-pantalla", label: "Clúster + Pantalla (+$2,800)", desc: "Tablero digital y palanca" },
                      { id: "completo-puertas", label: "Interior + Puertas (+$3,000)", desc: "Pantallas + molduras de puertas" },
                    ].map((inOpt) => {
                      const activo = ppfInteriores === inOpt.id;
                      return (
                        <div
                          key={inOpt.id}
                          onClick={() => setPpfInteriores(inOpt.id as any)}
                          className={`p-2.5 rounded-xl border cursor-pointer text-xs ${
                            activo ? "border-emerald-500 bg-emerald-950/40 text-white font-bold" : "border-white/10 bg-black/30 text-slate-300"
                          }`}
                        >
                          <span className="block font-bold">{inOpt.label}</span>
                          <span className="block text-[10px] text-slate-300 font-normal">{inOpt.desc}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* === CATEGORÍA 4: MANTENIMIENTO === */}
            {categoria === "mantenimiento" && (
              <div className="space-y-6 rounded-3xl p-5 sm:p-7 border border-white/10 bg-neutral-950/70">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div
                    onClick={() => setMantenimientoTipo("lavado-encerado")}
                    className={`p-4 rounded-2xl border cursor-pointer ${
                      mantenimientoTipo === "lavado-encerado"
                        ? "border-emerald-500 bg-emerald-950/40 ring-1 ring-emerald-500/50"
                        : "border-white/10 bg-black/40"
                    }`}
                  >
                    <span className="text-sm font-bold text-white block mb-1">Lavado y Encerado Protector</span>
                    <p className="text-xs text-slate-300 leading-relaxed font-light">
                      Lavado exterior a mano, encerado protector UV y humectación de pieles y plásticos en interiores.
                    </p>
                  </div>

                  <div
                    onClick={() => setMantenimientoTipo("motor-carroceria")}
                    className={`p-4 rounded-2xl border cursor-pointer ${
                      mantenimientoTipo === "motor-carroceria"
                        ? "border-emerald-500 bg-emerald-950/40 ring-1 ring-emerald-500/50"
                        : "border-white/10 bg-black/40"
                    }`}
                  >
                    <span className="text-sm font-bold text-white block mb-1">Lavado de Motor y Carrocería</span>
                    <p className="text-xs text-slate-300 leading-relaxed font-light">
                      Lavado técnico de motor con vapor y productos dieléctricos sin riesgo para sensores, más baño exterior.
                    </p>
                  </div>
                </div>

                {/* Adicional Faros */}
                <div
                  onClick={() => setIncluirFaros(!incluirFaros)}
                  className={`p-3.5 rounded-2xl border cursor-pointer flex items-center justify-between transition-all ${
                    incluirFaros ? "border-emerald-500 bg-emerald-950/30" : "border-white/10 bg-black/30"
                  }`}
                >
                  <div>
                    <span className="text-xs sm:text-sm font-bold text-white block">
                      Restauración y Pulido de Faros y Calaveras
                    </span>
                    <span className="text-xs text-slate-300 font-light">
                      +$600 MXN • Remueve la capa opaca amarilla y sella contra rayos solares
                    </span>
                  </div>
                  <span
                    className={`size-6 rounded-full flex items-center justify-center font-bold text-xs ${
                      incluirFaros ? "bg-emerald-500 text-black" : "bg-white/10 text-white"
                    }`}
                  >
                    {incluirFaros ? "✓" : "+"}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* PANEL DERECHO: TICKET / RESUMEN EN VIVO (ESTILO TRICOLOR MEXICANO) */}
          <div className="sticky top-24 rounded-3xl p-6 sm:p-7 border border-emerald-500/30 bg-gradient-to-b from-neutral-900 via-neutral-950 to-neutral-950 shadow-[0_15px_40px_rgba(0,0,0,0.7)] space-y-5">
            {/* Cabecera del ticket */}
            <div className="border-b border-white/10 pb-4">
              <div className="h-[2.5px] w-full rounded-full bg-gradient-to-r from-emerald-500 via-white to-rose-500 mb-3 shadow-[0_0_8px_rgba(255,255,255,0.4)]" />
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">Resumen en Tiempo Real</span>
                <span className="text-[10px] text-slate-300">🇲🇽 Toluca, MX</span>
              </div>
              <h4 className="text-lg font-extrabold text-white">Tu Cotización Personalizada</h4>
              <p className="text-xs text-slate-300 font-light">
                Vehículo: <strong className="text-white font-medium">{TIPOS_VEHICULO_SHALOM.find((v) => v.id === vehiculo)?.label}</strong>
              </p>
            </div>

            {/* Lista de Conceptos incluidos */}
            <div className="space-y-3 min-h-[140px] max-h-[300px] overflow-y-auto pr-1">
              {cotizacion.items.map((it, idx) => (
                <div key={idx} className="flex items-start justify-between gap-3 text-xs border-b border-white/5 pb-2.5">
                  <div className="space-y-0.5">
                    <span className="text-slate-200 font-medium block leading-tight">{it.label}</span>
                    {it.detalle && <span className="text-[10px] text-slate-300 block leading-tight font-light">{it.detalle}</span>}
                  </div>
                  <span className="font-bold text-white shrink-0">${it.precio.toLocaleString("es-MX")}</span>
                </div>
              ))}
            </div>

            {/* Garantía y Tiempos */}
            <div className="p-3 rounded-xl bg-black/50 border border-white/10 space-y-1.5 text-[11px]">
              <div className="flex items-center gap-2 text-slate-300">
                <LuClock className="size-3.5 text-emerald-400 shrink-0" />
                <span>Tiempo de trabajo: <strong className="text-white">{cotizacion.tiempoEstimado}</strong></span>
              </div>
              {cotizacion.garantiaTexto && (
                <div className="flex items-start gap-2 text-rose-300">
                  <LuShieldCheck className="size-3.5 text-rose-400 shrink-0 mt-0.5" />
                  <span className="leading-snug">{cotizacion.garantiaTexto}</span>
                </div>
              )}
            </div>

            {/* TOTAL */}
            <div className="pt-2 border-t border-white/10">
              <div className="flex items-baseline justify-between mb-4">
                <span className="text-xs uppercase tracking-wider text-slate-400 font-bold">Total Estimado</span>
                <div className="text-right">
                  <span className="text-2xl sm:text-3xl font-black text-emerald-400 tracking-tight">
                    ${cotizacion.subtotal.toLocaleString("es-MX")}
                  </span>
                  <span className="text-[11px] text-slate-400 block font-normal">Pesos Mexicanos ($ MXN)</span>
                </div>
              </div>

              {/* BOTÓN WHATSAPP TRICOLOR MEXICANO */}
              <a
                href={waHref(biz, mensajeWhatsApp)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-neutral-950 font-black text-sm uppercase tracking-wider active:scale-95 transition-all flex items-center justify-center gap-2.5 shadow-[0_8px_30px_rgba(16,185,129,0.45)] hover:shadow-[0_12px_40px_rgba(16,185,129,0.6)] cursor-pointer"
              >
                <FaWhatsapp className="size-5 text-neutral-950" />
                <span>Apartar Cita por WhatsApp</span>
              </a>
              <p className="text-[10px] text-slate-300 text-center mt-2.5">
                Envía tu configuración directamente a Héctor en Shalom Toluca sin compromiso.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
