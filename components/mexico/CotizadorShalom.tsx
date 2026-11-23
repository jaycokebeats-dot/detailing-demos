"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { FaCarSide, FaTruckPickup, FaWhatsapp } from "react-icons/fa6";
import {
  LuSparkles,
  LuShieldCheck,
  LuSun,
  LuCheck,
  LuPlus,
  LuClock,
  LuEye,
  LuTrash2,
  LuInfo,
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

export interface ItemPresupuestoShalom {
  id: "polarizado" | "detallado" | "ppf" | "encerado" | "motor" | "faros";
  categoriaId: CategoriaShalomId;
  titulo: string;
  detalle: string;
  precio: number;
  tiempo: string;
  garantia?: string;
}

interface CotizadorShalomProps {
  biz: Business;
  onCotizacionChange?: (activa: boolean) => void;
}

export default function CotizadorShalom({ biz, onCotizacionChange }: CotizadorShalomProps) {
  // Estado principal
  const [vehiculo, setVehiculo] = useState<VehiculoShalomId>("sedan");
  const [categoria, setCategoria] = useState<CategoriaShalomId>("polarizado");

  // Observer para la barra flotante en móviles
  const resumenRef = useRef<HTMLDivElement | null>(null);
  const [isResumenVisible, setIsResumenVisible] = useState(false);

  useEffect(() => {
    const el = resumenRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsResumenVisible(entry.isIntersecting);
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // === SERVICIOS ACTIVOS EN EL PRESUPUESTO (CARRITO MULTI-SERVICIO) ===
  const [polarizadoActivo, setPolarizadoActivo] = useState(true); // Inicia con polarizado por defecto
  const [detalladoActivo, setDetalladoActivo] = useState(false);
  const [ppfActivo, setPpfActivo] = useState(false);
  const [enceradoActivo, setEnceradoActivo] = useState(false);
  const [motorActivo, setMotorActivo] = useState(false);
  const [farosActivo, setFarosActivo] = useState(false);

  // === SUB-OPCIONES POLARIZADO ===
  const [polarizadoMarca, setPolarizadoMarca] = useState<"protec" | "baby" | "llumar35" | "llumarTonos" | "3m">("llumar35");
  const [polarizadoTono, setPolarizadoTono] = useState<"5%" | "20%" | "35%" | "50%">("35%");
  const [incluirParabrisas, setIncluirParabrisas] = useState(false);
  const [tipoParabrisas, setTipoParabrisas] = useState<"marca" | "inteligente80" | "inteligente90" | "inteligente99" | "nanocenter">("marca");
  const [incluirFranja, setIncluirFranja] = useState(false);
  const [retiroMaterial, setRetiroMaterial] = useState<"ninguno" | "completo" | "laterales" | "medallon" | "parabrisas">("ninguno");

  // === SUB-OPCIONES DETALLADO ===
  const [detalladoTipo, setDetalladoTipo] = useState<"full-detail" | "vestiduras" | "ceramico">("full-detail");
  const [desmontarAlfombra, setDesmontarAlfombra] = useState(false);

  // === SUB-OPCIONES PPF ===
  const [ppfMarca, setPpfMarca] = useState<"dgnr" | "llumar">("llumar");
  const [ppfCobertura, setPpfCobertura] = useState<"frente" | "completo">("frente");
  const [ppfInteriores, setPpfInteriores] = useState<"ninguno" | "cluster-pantalla" | "completo-puertas">("ninguno");

  // === SUB-OPCIONES MANTENIMIENTO: FAROS (Héctor: solo faros $700 / faros y calaveras $1000) ===
  const [farosTipo, setFarosTipo] = useState<"solo-faros" | "faros-calaveras">("solo-faros");

  // Escuchar eventos globales para saltar de servicio directo desde las tarjetas de resultados
  useEffect(() => {
    const handleSelectCategory = (e: any) => {
      const cat = e?.detail?.categoria;
      if (cat && ["polarizado", "detallado", "ppf", "mantenimiento"].includes(cat)) {
        setCategoria(cat);
        if (cat === "polarizado") setPolarizadoActivo(true);
        if (cat === "detallado") setDetalladoActivo(true);
        if (cat === "ppf") setPpfActivo(true);
        if (cat === "mantenimiento") setEnceradoActivo(true);
      }
    };
    window.addEventListener("shalom:set-categoria", handleSelectCategory);
    return () => window.removeEventListener("shalom:set-categoria", handleSelectCategory);
  }, []);

  // Manejador al presionar tipo de vehículo: actualiza y scrollea suavemente al configurador
  const handleSelectVehiculo = (id: VehiculoShalomId) => {
    setVehiculo(id);
    const target = document.getElementById("paso-servicios-shalom");
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // 1. CÁLCULO DINÁMICO DE COSTOS POR SERVICIO INDIVIDUAL (SEGÚN VEHÍCULO)

  // Costo actual configurado de Polarizado (Héctor: 40-60 min + decoloración incluida)
  const costoPolarizado = useMemo(() => {
    const preciosBase: Record<string, Record<VehiculoShalomId, number>> = {
      protec: { sedan: 1500, suv: 1800, pickup: 1800, suburban: 2200 },
      baby: { sedan: 1900, suv: 2200, pickup: 2200, suburban: 2600 },
      llumar35: { sedan: 3300, suv: 3500, pickup: 3500, suburban: 4000 },
      llumarTonos: { sedan: 3600, suv: 3800, pickup: 3800, suburban: 4500 },
      "3m": { sedan: 5500, suv: 5800, pickup: 6000, suburban: 6200 },
    };

    const nombresMarca: Record<string, string> = {
      protec: "Protec Sun",
      baby: "Baby Blue / Baby Green",
      llumar35: "Llumar 35%",
      llumarTonos: `Llumar Tono ${polarizadoTono}`,
      "3m": "3M LUMAR Protec-Sun",
    };

    let total = preciosBase[polarizadoMarca][vehiculo];
    const detallesArr: string[] = [`Tono: ${polarizadoTono}`];

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
        total += pPrice;
        detallesArr.push(`Parabrisas ${polarizadoMarca === "protec" ? "Protec Sun" : polarizadoMarca === "3m" ? "3M" : "Llumar"}`);
      } else if (tipoParabrisas === "inteligente80") {
        total += 2500;
        detallesArr.push("Parabrisas Inteligente Azul 80% UV");
      } else if (tipoParabrisas === "inteligente90") {
        total += 3000;
        detallesArr.push("Parabrisas Inteligente Transparente 90% UV");
      } else if (tipoParabrisas === "inteligente99") {
        total += 3300;
        detallesArr.push("Parabrisas Inteligente Transparente 99.9% UV");
      } else if (tipoParabrisas === "nanocenter") {
        total += 3000;
        detallesArr.push("Parabrisas Nanocerámico Colores");
      }
    }

    if (incluirFranja) {
      total += 450;
      detallesArr.push("Franja parasol");
    }

    if (retiroMaterial !== "ninguno") {
      const retiroPrecios: Record<string, { label: string; precio: number }> = {
        completo: { label: "Retiro completo", precio: 600 },
        laterales: { label: "Retiro laterales", precio: 400 },
        medallon: { label: "Retiro medallón", precio: 400 },
        parabrisas: { label: "Retiro parabrisas", precio: 400 },
      };
      const rItem = retiroPrecios[retiroMaterial];
      total += rItem.precio;
      detallesArr.push(rItem.label);
    }

    return {
      precio: total,
      titulo: `Película Antiasalto ${nombresMarca[polarizadoMarca]} (Laterales + Medallón)`,
      detalle: detallesArr.join(" • "),
      tiempo: "40 a 60 minutos",
      garantia: "Garantía por escrito contra desprendimiento, burbujas o decoloración del material",
    };
  }, [polarizadoMarca, vehiculo, polarizadoTono, incluirParabrisas, tipoParabrisas, incluirFranja, retiroMaterial]);

  // Costo actual configurado de Detallado
  const costoDetallado = useMemo(() => {
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
      return {
        precio: preciosFull[vehiculo],
        titulo: "Paquete Todo Incluido | Detallado Profesional",
        detalle: "Motor, carrocería, descontaminado 360°, interiores a vapor, toldo, alfombra, corrección en etapas y cerámico de 6 meses.",
        tiempo: tiemposFull[vehiculo],
        garantia: "Cerámico 9H garantizado por 6 meses + Acabado espejo",
      };
    } else if (detalladoTipo === "vestiduras") {
      const preciosVest: Record<VehiculoShalomId, { base: number; conAlfombra: number }> = {
        sedan: { base: 2000, conAlfombra: 3000 },
        suv: { base: 2500, conAlfombra: 3500 },
        pickup: { base: 2500, conAlfombra: 3500 },
        suburban: { base: 3000, conAlfombra: 4500 },
      };
      const pVest = preciosVest[vehiculo];
      const precioFinal = desmontarAlfombra ? pVest.conAlfombra : pVest.base;
      return {
        precio: precioFinal,
        titulo: `Lavado Profundo de Vestiduras & Interior ${desmontarAlfombra ? "(Con desmonte de alfombra)" : ""}`,
        detalle: desmontarAlfombra
          ? "Desinfección con vapor seco, asientos (tela/piel), toldo, ductos, plásticos y desmonte total de alfombra"
          : "Desinfección con vapor seco, asientos (tela/piel), toldo, ductos y plásticos",
        tiempo: desmontarAlfombra ? "24 a 48 horas (secado profundo)" : "1 día hábil",
        garantia: "Garantía de sanitización antibacteriana sin humedad residual",
      };
    } else {
      const preciosCeramico: Record<VehiculoShalomId, number> = {
        sedan: 4500,
        suv: 6500,
        pickup: 6500,
        suburban: 8500,
      };
      return {
        precio: preciosCeramico[vehiculo],
        titulo: "Corrección de Pintura & Recubrimiento Cerámico",
        detalle: "Pulido en etapas para eliminar microrrayones + abrillantado fino y sellado nanocerámico",
        tiempo: "2 a 3 días hábiles",
        garantia: "Garantía por escrito de brillo espejo y repelencia hidrofóbica",
      };
    }
  }, [detalladoTipo, vehiculo, desmontarAlfombra]);

  // Costo actual configurado de PPF
  const costoPPF = useMemo(() => {
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

    let total = preciosPPF[ppfMarca][ppfCobertura][vehiculo];
    const detallesArr: string[] = [
      ppfCobertura === "frente"
        ? "Cofre, facia delantera, salpicaderas y espejos"
        : "Carrocería completa 360° en todos los paneles exteriores",
    ];

    if (ppfInteriores === "cluster-pantalla") {
      total += 2800;
      detallesArr.push("PPF en Clúster y Pantalla");
    } else if (ppfInteriores === "completo-puertas") {
      total += 3000;
      detallesArr.push("PPF en Interiores Completo y Molduras de Puertas");
    }

    const marcaLabel = ppfMarca === "llumar" ? "Llumar (8 Años de Garantía)" : "DGNR (1 Año de Garantía)";

    return {
      precio: total,
      titulo: `Blindaje PPF ${marcaLabel} — ${ppfCobertura === "frente" ? "Frente Protegido" : "Carrocería Completa"}`,
      detalle: detallesArr.join(" • "),
      tiempo: ppfCobertura === "completo" ? "4 a 6 días hábiles" : "2 a 3 días hábiles",
      garantia:
        ppfMarca === "llumar"
          ? "🛡️ 8 AÑOS DE GARANTÍA POR ESCRITO (Contra amarillamiento y craquelado)"
          : "🛡️ 1 AÑO DE GARANTÍA POR ESCRITO",
    };
  }, [ppfMarca, ppfCobertura, vehiculo, ppfInteriores]);

  // Costos de Mantenimiento Express
  const costoEncerado = useMemo(() => {
    const precios: Record<VehiculoShalomId, number> = {
      sedan: 700,
      suv: 900,
      pickup: 1000,
      suburban: 1200,
    };
    return {
      precio: precios[vehiculo],
      titulo: "Lavado y Encerado Protector + Humectante Interior",
      detalle: "Cera líquida protectora UV + nutrición de plásticos y pieles",
      tiempo: "2 horas",
    };
  }, [vehiculo]);

  const costoMotor = useMemo(() => {
    const precios: Record<VehiculoShalomId, number> = {
      sedan: 800,
      suv: 1000,
      pickup: 1200,
      suburban: 1400,
    };
    return {
      precio: precios[vehiculo],
      titulo: "Lavado Técnico de Motor con Vapor & Carrocería",
      detalle: "Limpieza dieléctrica profunda con hidratación satinada de plásticos + baño exterior",
      tiempo: "2 a 3 horas",
    };
  }, [vehiculo]);

  // Héctor: Faros y calaveras $1,000 / solo faros $700
  const costoFaros = useMemo(() => {
    const esSoloFaros = farosTipo === "solo-faros";
    return {
      precio: esSoloFaros ? 700 : 1000,
      titulo: esSoloFaros
        ? "Restauración y Pulido de Faros Delanteros con Polímero"
        : "Restauración y Pulido de Faros y Calaveras Completas",
      detalle: esSoloFaros
        ? "Elimina la capa amarilla y opaca con polímero vaporizado. Deja ópticas frontales 100% claras."
        : "Restauración integral de ópticas frontales (faros) y traseras (calaveras) con polímero vaporizado.",
      tiempo: esSoloFaros ? "40 a 60 min" : "1 a 2 horas",
    };
  }, [farosTipo]);

  // 2. CONSTRUCCIÓN DEL TICKET INTEGRADO (SUMA DE TODOS LOS SERVICIOS ACTIVOS)
  const itemsPresupuesto = useMemo<ItemPresupuestoShalom[]>(() => {
    const list: ItemPresupuestoShalom[] = [];

    if (polarizadoActivo) {
      list.push({
        id: "polarizado",
        categoriaId: "polarizado",
        titulo: costoPolarizado.titulo,
        detalle: costoPolarizado.detalle,
        precio: costoPolarizado.precio,
        tiempo: costoPolarizado.tiempo,
        garantia: costoPolarizado.garantia,
      });
    }

    if (detalladoActivo) {
      list.push({
        id: "detallado",
        categoriaId: "detallado",
        titulo: costoDetallado.titulo,
        detalle: costoDetallado.detalle,
        precio: costoDetallado.precio,
        tiempo: costoDetallado.tiempo,
        garantia: costoDetallado.garantia,
      });
    }

    if (ppfActivo) {
      list.push({
        id: "ppf",
        categoriaId: "ppf",
        titulo: costoPPF.titulo,
        detalle: costoPPF.detalle,
        precio: costoPPF.precio,
        tiempo: costoPPF.tiempo,
        garantia: costoPPF.garantia,
      });
    }

    if (enceradoActivo) {
      list.push({
        id: "encerado",
        categoriaId: "mantenimiento",
        titulo: costoEncerado.titulo,
        detalle: costoEncerado.detalle,
        precio: costoEncerado.precio,
        tiempo: costoEncerado.tiempo,
      });
    }

    if (motorActivo) {
      list.push({
        id: "motor",
        categoriaId: "mantenimiento",
        titulo: costoMotor.titulo,
        detalle: costoMotor.detalle,
        precio: costoMotor.precio,
        tiempo: costoMotor.tiempo,
      });
    }

    if (farosActivo) {
      list.push({
        id: "faros",
        categoriaId: "mantenimiento",
        titulo: costoFaros.titulo,
        detalle: costoFaros.detalle,
        precio: costoFaros.precio,
        tiempo: costoFaros.tiempo,
      });
    }

    return list;
  }, [
    polarizadoActivo,
    costoPolarizado,
    detalladoActivo,
    costoDetallado,
    ppfActivo,
    costoPPF,
    enceradoActivo,
    costoEncerado,
    motorActivo,
    costoMotor,
    farosActivo,
    costoFaros,
  ]);

  // Total acumulado
  const subtotalPresupuesto = useMemo(() => {
    return itemsPresupuesto.reduce((acc, it) => acc + it.precio, 0);
  }, [itemsPresupuesto]);

  // Tiempo estimado combinado
  const tiempoEstimadoGlobal = useMemo(() => {
    if (itemsPresupuesto.length === 0) return "Selecciona un servicio";
    if (ppfActivo && ppfCobertura === "completo") return "4 a 6 días hábiles";
    if (detalladoActivo && detalladoTipo === "full-detail") {
      return vehiculo === "suburban" ? "8 días hábiles" : vehiculo === "sedan" ? "5 días hábiles" : "7 días hábiles";
    }
    if (ppfActivo && ppfCobertura === "frente") return "2 a 3 días hábiles";
    if (detalladoActivo && detalladoTipo === "ceramico") return "2 a 3 días hábiles";
    if (detalladoActivo && detalladoTipo === "vestiduras") return desmontarAlfombra ? "24 a 48 horas" : "1 día hábil";
    if (polarizadoActivo && itemsPresupuesto.length === 1) return "40 a 60 minutos";
    return "Mismo día (Cita previa)";
  }, [itemsPresupuesto, ppfActivo, ppfCobertura, detalladoActivo, detalladoTipo, vehiculo, desmontarAlfombra, polarizadoActivo]);

  // Garantías combinadas
  const garantiasGlobales = useMemo(() => {
    const setG = new Set<string>();
    itemsPresupuesto.forEach((it) => {
      if (it.garantia) setG.add(it.garantia);
    });
    return Array.from(setG);
  }, [itemsPresupuesto]);

  // Notificar al padre de cotización activa
  useEffect(() => {
    onCotizacionChange?.(itemsPresupuesto.length > 0);
  }, [itemsPresupuesto.length, onCotizacionChange]);

  // Función para eliminar un servicio del carrito
  const eliminarServicio = (id: ItemPresupuestoShalom["id"]) => {
    if (id === "polarizado") setPolarizadoActivo(false);
    if (id === "detallado") setDetalladoActivo(false);
    if (id === "ppf") setPpfActivo(false);
    if (id === "encerado") setEnceradoActivo(false);
    if (id === "motor") setMotorActivo(false);
    if (id === "faros") setFarosActivo(false);
  };

  // Mensaje para enviar a WhatsApp con TODOS los servicios sumados
  const mensajeWhatsApp = useMemo(() => {
    const vLabel = TIPOS_VEHICULO_SHALOM.find((v) => v.id === vehiculo)?.label || "Auto";
    let msg = `🇲🇽 *HOLA SHALOM ESTÉTICA AUTOMOTRIZ*\n`;
    msg += `Quisiera agendar una cita con los siguientes servicios cotizados en su web:\n\n`;
    msg += `🚗 *Vehículo:* ${vLabel}\n`;
    msg += `📋 *SERVICIOS INCLUIDOS (${itemsPresupuesto.length}):*\n`;

    itemsPresupuesto.forEach((it, i) => {
      msg += `\n  ${i + 1}. *${it.titulo}*\n`;
      msg += `     • Detalle: ${it.detalle}\n`;
      msg += `     • Subtotal: $${it.precio.toLocaleString("es-MX")} MXN\n`;
    });

    msg += `\n💰 *TOTAL ESTIMADO:* $${subtotalPresupuesto.toLocaleString("es-MX")} MXN\n`;
    msg += `⏱️ *Tiempo Estimado:* ${tiempoEstimadoGlobal}\n`;
    if (garantiasGlobales.length > 0) {
      msg += `🛡️ *Garantías Incluidas:*\n`;
      garantiasGlobales.forEach((g) => {
        msg += `   - ${g}\n`;
      });
    }
    msg += `\n¿Tienen citas disponibles para estos días en Toluca? ¡Muchas gracias!`;
    return msg;
  }, [vehiculo, itemsPresupuesto, subtotalPresupuesto, tiempoEstimadoGlobal, garantiasGlobales]);

  return (
    <section id="cotizador" className="relative px-3 sm:px-6 py-10 sm:py-16 md:py-20 bg-[#0a0e0c] text-white overflow-hidden">
      {/* Halo y brillo ambiental unificado esmeralda y platino */}
      <div
        className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[350px] rounded-full pointer-events-none opacity-20 blur-[130px]"
        style={{ background: "radial-gradient(circle, #059669 0%, #10b981 40%, transparent 70%)" }}
      />
      <div
        className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[450px] h-[350px] rounded-full pointer-events-none opacity-10 blur-[140px]"
        style={{ background: "radial-gradient(circle, #047857 0%, #064e3b 50%, transparent 70%)" }}
      />

      {/* Marca de agua sutil del águila de Shalom */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden z-0">
        <img
          src="/logo/shalom-logo.png"
          alt=""
          aria-hidden="true"
          className="w-[500px] sm:w-[800px] max-w-none opacity-[0.035] brightness-75 contrast-125 filter"
        />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* ENCABEZADO DEL COTIZADOR */}
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-12">
          {/* Badge Bandera de México */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-emerald-950/80 via-neutral-900 to-neutral-900 border border-emerald-500/40 text-emerald-300 text-[11px] sm:text-xs font-semibold tracking-wider uppercase mb-3 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
            <span className="text-sm">🇲🇽</span>
            <span>Cotizador Oficial Shalom • Toluca, Edo. Méx.</span>
          </div>

          <h2 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight mb-2 sm:mb-3">
            Arma tu Paquete en Vivo{" "}
            <span className="block mt-1 bg-gradient-to-r from-emerald-400 via-white to-emerald-200 bg-clip-text text-transparent">
              Suma Servicios y Precios Reales
            </span>
          </h2>

          {/* Barrita Divisora Refinada */}
          <div className="w-32 sm:w-48 h-[2.5px] mx-auto my-3 rounded-full bg-gradient-to-r from-emerald-500 via-white to-emerald-500 shadow-[0_0_12px_rgba(255,255,255,0.4)]" />

          <p className="text-xs sm:text-sm text-slate-300 font-light leading-relaxed max-w-2xl mx-auto">
            Elige tu vehículo, personaliza tu película antiasalto, detallado o mantenimiento y sumalos a tu cotización en tiempo real con garantía oficial.
          </p>
        </div>

        {/* PASO 1: SELECTOR DE VEHÍCULO (Al hacer clic, scrollea automáticamente al paso 2) */}
        <div className="mb-8 sm:mb-10">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <span className="size-5 rounded-full bg-emerald-500 text-black flex items-center justify-center text-xs font-extrabold">1</span>
              <span>Selecciona tu Tipo de Vehículo</span>
            </h3>
            <span className="text-[11px] text-emerald-400 font-medium hidden sm:inline">Toca tu auto para ver servicios y precios</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3.5">
            {TIPOS_VEHICULO_SHALOM.map((tipo) => {
              const activo = vehiculo === tipo.id;
              const Icono = tipo.Icono;
              return (
                <button
                  key={tipo.id}
                  onClick={() => handleSelectVehiculo(tipo.id)}
                  className={`group relative p-2.5 sm:p-3.5 rounded-2xl border text-left transition-all duration-200 cursor-pointer ${
                    activo
                      ? "border-emerald-500 bg-gradient-to-b from-emerald-950/40 to-neutral-950 shadow-[0_0_22px_rgba(16,185,129,0.28)] ring-1 ring-emerald-400/50 scale-[1.01]"
                      : "border-white/10 bg-neutral-950/70 hover:border-white/25 hover:bg-neutral-900/60"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className={`p-1.5 sm:p-2 rounded-xl ${activo ? "bg-emerald-500/20 text-emerald-400" : "bg-white/5 text-slate-400"}`}>
                      <Icono className="size-4 sm:size-5" />
                    </div>
                    {activo && (
                      <span className="flex items-center justify-center size-4 sm:size-5 rounded-full bg-emerald-500 text-black text-[10px] font-bold">
                        <LuCheck className="size-2.5 sm:size-3 stroke-[3]" />
                      </span>
                    )}
                  </div>
                  <h4 className="text-xs sm:text-sm font-bold text-white mb-0.5">{tipo.label}</h4>
                  <p className="text-[10px] text-slate-400 mb-1">{tipo.sublabel}</p>
                  <p className="text-[10px] text-slate-400/90 font-light truncate">{tipo.ejemplos}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* PASO 2: TABS DE CATEGORÍA DE SERVICIO (Destino del auto-scroll) */}
        <div id="paso-servicios-shalom" className="mb-6 sm:mb-8 scroll-mt-24">
          <div className="flex items-center justify-between mb-2.5">
            <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <span className="size-5 rounded-full bg-emerald-500 text-black flex items-center justify-center text-xs font-extrabold">2</span>
              <span>Personaliza y Suma Servicios a tu Cotización</span>
            </h3>
            <span className="text-[11px] sm:text-xs text-slate-400">
              {itemsPresupuesto.length === 0 ? "Sin servicios aún" : `${itemsPresupuesto.length} servicio${itemsPresupuesto.length > 1 ? "s" : ""} en tu lista`}
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5 sm:gap-2 p-1.5 rounded-2xl bg-neutral-950 border border-white/10">
            {[
              {
                id: "polarizado",
                label: "🛡️ Películas Antiasalto",
                desc: "40 a 60 min • Protec, Llumar y 3M",
                activoEnCarrito: polarizadoActivo,
              },
              {
                id: "detallado",
                label: "💎 Detallado Profesional",
                desc: "Integral, Vestiduras o Cerámico",
                activoEnCarrito: detalladoActivo,
              },
              {
                id: "ppf",
                label: "🛡️ Protección PPF",
                desc: "DGNR y Llumar 8 años",
                activoEnCarrito: ppfActivo,
              },
              {
                id: "mantenimiento",
                label: "✨ Mantenimiento Express",
                desc: "Motor, Encerado y Faros",
                activoEnCarrito: enceradoActivo || motorActivo || farosActivo,
              },
            ].map((cat) => {
              const tabSeleccionado = categoria === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setCategoria(cat.id as CategoriaShalomId)}
                  className={`flex-1 min-w-[135px] sm:min-w-[150px] px-3 py-2 sm:py-2.5 rounded-xl text-left transition-all cursor-pointer relative ${
                    tabSeleccionado
                      ? "bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 text-black font-extrabold shadow-[0_4px_20px_rgba(16,185,129,0.35)]"
                      : "text-slate-300 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`block text-xs sm:text-sm font-bold ${tabSeleccionado ? "text-neutral-950 font-black" : "text-white"}`}>
                      {cat.label}
                    </span>
                    {cat.activoEnCarrito && (
                      <span className={`text-[9px] sm:text-[10px] font-extrabold px-1.5 py-0.2 rounded-md flex items-center gap-1 ${
                        tabSeleccionado ? "bg-black/20 text-neutral-950" : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                      }`}>
                        <LuCheck className="size-2.5 stroke-[3]" />
                        <span>Sumado</span>
                      </span>
                    )}
                  </div>
                  <span className={`block text-[10px] truncate ${tabSeleccionado ? "text-emerald-950 font-medium" : "text-slate-400 font-light"}`}>
                    {cat.desc}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* PASO 3: CONFIGURADOR DETALLADO SEGÚN CATEGORÍA */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-7 items-start mb-10 sm:mb-12">
          {/* PANEL IZQUIERDO: CONTROLES DE CONFIGURACIÓN */}
          <div className="lg:col-span-2 space-y-5">
            {/* === CATEGORÍA 1: POLARIZADOS (Con tiempo de 40 a 60 min) === */}
            {categoria === "polarizado" && (
              <div className="space-y-5 rounded-3xl p-4 sm:p-6 border border-white/10 bg-neutral-950/70">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                      <LuSun className="size-4 text-emerald-400" />
                      <span>1. Elige Marca de Película Antiasalto (Laterales + Medallón)</span>
                    </h4>
                    <span className="text-[10px] sm:text-[11px] text-emerald-400 font-medium">⚡ 40 a 60 min</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
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
                          className={`p-3 rounded-2xl border cursor-pointer transition-all ${
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
                  <h4 className="text-xs sm:text-sm font-bold text-white mb-2 flex items-center gap-2">
                    <LuEye className="size-4 text-emerald-400" />
                    <span>2. Tono de Privacidad Deseado</span>
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
                          className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                            activo
                              ? "border-emerald-500 bg-emerald-500/20 text-white font-bold"
                              : "border-white/10 bg-black/40 text-slate-300 hover:text-white"
                          }`}
                        >
                          <span className="block text-xs font-bold">{t.label}</span>
                          <span className="block text-[10px] text-slate-400">{t.sub}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* ADICIONAL: PARABRISAS COMPLETO */}
                <div className="border-t border-white/10 pt-4 space-y-2.5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-xs sm:text-sm font-bold text-white block">¿Deseas agregar Parabrisas Delantero Completo?</span>
                      <span className="text-[11px] text-slate-300">
                        {incluirParabrisas ? "El parabrisas delantero se instalará con termoformado especial" : "Solo laterales y medallón trasero incluidos"}
                      </span>
                    </div>
                    <button
                      onClick={() => setIncluirParabrisas(!incluirParabrisas)}
                      className={`px-3 py-1 rounded-full text-xs font-bold uppercase transition-all cursor-pointer shrink-0 ${
                        incluirParabrisas
                          ? "bg-emerald-500 text-black shadow-[0_0_15px_rgba(16,185,129,0.5)]"
                          : "bg-white/10 text-white hover:bg-white/20"
                      }`}
                    >
                      {incluirParabrisas ? "✓ Agregado" : "+ Agregar"}
                    </button>
                  </div>

                  {incluirParabrisas && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 animate-fade-in">
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
                            <span className="text-[10px] text-slate-400">{pOpt.desc}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* ADICIONAL: FRANJA O RETIRO */}
                <div className="border-t border-white/10 pt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Franja */}
                  <div
                    onClick={() => setIncluirFranja(!incluirFranja)}
                    className={`p-2.5 sm:p-3 rounded-2xl border cursor-pointer flex items-center justify-between ${
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
                      className="w-full bg-neutral-900 border border-white/15 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                    >
                      <option value="ninguno">No (Cristales limpios de agencia)</option>
                      <option value="completo">Sí, retirar todo el coche (+$600 MXN)</option>
                      <option value="laterales">Solo retirar laterales (+$400 MXN)</option>
                      <option value="medallon">Solo retirar medallón trasero (+$400 MXN)</option>
                      <option value="parabrisas">Solo retirar parabrisas (+$400 MXN)</option>
                    </select>
                  </div>
                </div>

                {/* BOTÓN DE ACCIÓN PARA POLARIZADO EN EL PRESUPUESTO */}
                <div className="border-t border-white/10 pt-3.5 flex flex-col sm:flex-row items-center justify-between gap-2.5">
                  <div>
                    <span className="text-[11px] text-slate-400 block">Total de este servicio de polarizado:</span>
                    <span className="text-base sm:text-lg font-black text-emerald-400">${costoPolarizado.precio.toLocaleString("es-MX")} MXN</span>
                  </div>

                  {polarizadoActivo ? (
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <div className="px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-1.5 flex-1 sm:flex-initial">
                        <LuCheck className="size-3.5 text-emerald-400" />
                        <span>En tu presupuesto</span>
                      </div>
                      <button
                        onClick={() => setPolarizadoActivo(false)}
                        className="px-3 py-1.5 rounded-xl border border-white/20 bg-white/5 text-slate-300 hover:text-white hover:bg-white/10 text-xs font-semibold cursor-pointer transition-colors"
                      >
                        Quitar
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setPolarizadoActivo(true)}
                      className="w-full sm:w-auto px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all active:scale-95"
                    >
                      <LuPlus className="size-4 stroke-[3]" />
                      <span>Agregar Película al Presupuesto</span>
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* === CATEGORÍA 2: DETALLADO Y TRATAMIENTOS === */}
            {categoria === "detallado" && (
              <div className="space-y-5 rounded-3xl p-4 sm:p-6 border border-white/10 bg-neutral-950/70">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
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
                        className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                          activo
                            ? "border-emerald-500 bg-gradient-to-b from-emerald-950/50 to-neutral-950 shadow-[0_0_20px_rgba(16,185,129,0.25)] ring-1 ring-emerald-500/50"
                            : "border-white/10 bg-black/40 hover:border-white/25"
                        }`}
                      >
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase tracking-wider inline-block mb-1.5">
                          {pkg.tag}
                        </span>
                        <h4 className="text-xs sm:text-sm font-bold text-white mb-1">{pkg.titulo}</h4>
                        <p className="text-[11px] text-slate-300 leading-relaxed font-light">{pkg.desc}</p>
                      </div>
                    );
                  })}
                </div>

                {/* OPCIÓN ADICIONAL: DESMONTE DE ALFOMBRA SI ELIGE VESTIDURAS */}
                {detalladoTipo === "vestiduras" && (
                  <div
                    onClick={() => setDesmontarAlfombra(!desmontarAlfombra)}
                    className={`p-3.5 rounded-2xl border cursor-pointer flex items-center justify-between transition-all ${
                      desmontarAlfombra
                        ? "border-emerald-500 bg-emerald-950/30 ring-1 ring-emerald-500/50"
                        : "border-white/15 bg-black/40"
                    }`}
                  >
                    <div>
                      <span className="text-xs sm:text-sm font-bold text-white block">
                        ¿Deseas desmontar y lavar la alfombra fuera del auto?
                      </span>
                      <span className="text-[11px] text-slate-300 leading-relaxed">
                        Permite una extracción 100% libre de olores, humedad oculta y secado en horno.
                        {vehiculo === "suburban" ? " (+ $1,500 MXN)" : " (+ $1,000 MXN)"}
                      </span>
                    </div>
                    <span
                      className={`size-5 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                        desmontarAlfombra ? "bg-emerald-500 text-black" : "bg-white/10 text-white"
                      }`}
                    >
                      {desmontarAlfombra ? "✓" : "+"}
                    </span>
                  </div>
                )}

                {/* BOTÓN DE ACCIÓN PARA DETALLADO EN EL PRESUPUESTO */}
                <div className="border-t border-white/10 pt-3.5 flex flex-col sm:flex-row items-center justify-between gap-2.5">
                  <div>
                    <span className="text-[11px] text-slate-400 block">Total de este detallado:</span>
                    <span className="text-base sm:text-lg font-black text-emerald-400">${costoDetallado.precio.toLocaleString("es-MX")} MXN</span>
                  </div>

                  {detalladoActivo ? (
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <div className="px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-1.5 flex-1 sm:flex-initial">
                        <LuCheck className="size-3.5 text-emerald-400" />
                        <span>En tu presupuesto</span>
                      </div>
                      <button
                        onClick={() => setDetalladoActivo(false)}
                        className="px-3 py-1.5 rounded-xl border border-white/20 bg-white/5 text-slate-300 hover:text-white hover:bg-white/10 text-xs font-semibold cursor-pointer transition-colors"
                      >
                        Quitar
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDetalladoActivo(true)}
                      className="w-full sm:w-auto px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all active:scale-95"
                    >
                      <LuPlus className="size-4 stroke-[3]" />
                      <span>Sumar Detallado al Presupuesto</span>
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* === CATEGORÍA 3: PPF === */}
            {categoria === "ppf" && (
              <div className="space-y-5 rounded-3xl p-4 sm:p-6 border border-white/10 bg-neutral-950/70">
                {/* Comparador de Marca */}
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-white mb-2 flex items-center gap-2">
                    <LuShieldCheck className="size-4 text-emerald-400" />
                    <span>Selecciona la Calidad y Garantía de tu PPF</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div
                      onClick={() => setPpfMarca("llumar")}
                      className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                        ppfMarca === "llumar"
                          ? "border-emerald-500 bg-emerald-950/40 ring-1 ring-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.25)]"
                          : "border-white/10 bg-black/40 hover:border-white/25"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs sm:text-sm font-bold text-white">PPF Llumar</span>
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40 uppercase">
                          8 Años por Escrito
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300 leading-relaxed">
                        Gama Platinum mundial. Poliuretano autorregenerable con resistencia balística a piedras y 8 años de garantía por escrito contra amarilleo.
                      </p>
                    </div>

                    <div
                      onClick={() => setPpfMarca("dgnr")}
                      className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                        ppfMarca === "dgnr"
                          ? "border-emerald-500 bg-emerald-950/40 ring-1 ring-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.25)]"
                          : "border-white/10 bg-black/40 hover:border-white/25"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs sm:text-sm font-bold text-white">PPF DGNR</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase">
                          1 Año de Garantía
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300 leading-relaxed">
                        Protección económica autorregenerable contra impactos frontales y arañazos de uso diario.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Cobertura: Frente vs Completo */}
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-white mb-2">Área de Cobertura Exterior</h4>
                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      onClick={() => setPpfCobertura("frente")}
                      className={`p-2.5 sm:p-3 rounded-xl border text-left cursor-pointer ${
                        ppfCobertura === "frente"
                          ? "border-emerald-500 bg-emerald-950/40 text-white font-bold"
                          : "border-white/10 bg-black/30 text-slate-300"
                      }`}
                    >
                      <span className="block text-xs sm:text-sm font-bold">🛡️ Frente Protegido</span>
                      <span className="block text-[10px] text-slate-400 font-normal">Cofre, facia, salpicaderas y espejos</span>
                    </button>
                    <button
                      onClick={() => setPpfCobertura("completo")}
                      className={`p-2.5 sm:p-3 rounded-xl border text-left cursor-pointer ${
                        ppfCobertura === "completo"
                          ? "border-emerald-500 bg-emerald-950/40 text-white font-bold"
                          : "border-white/10 bg-black/30 text-slate-300"
                      }`}
                    >
                      <span className="block text-xs sm:text-sm font-bold">✨ Carrocería Completa (360°)</span>
                      <span className="block text-[10px] text-slate-400 font-normal">Todos los paneles blindados</span>
                    </button>
                  </div>
                </div>

                {/* PPF Interiores */}
                <div className="border-t border-white/10 pt-3.5">
                  <h4 className="text-xs sm:text-sm font-bold text-white mb-2">Protección de Pantallas y Consola Interior</h4>
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
                          className={`p-2 rounded-xl border cursor-pointer text-xs ${
                            activo ? "border-emerald-500 bg-emerald-950/40 text-white font-bold" : "border-white/10 bg-black/30 text-slate-300"
                          }`}
                        >
                          <span className="block font-bold">{inOpt.label}</span>
                          <span className="block text-[10px] text-slate-400 font-normal">{inOpt.desc}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* BOTÓN DE ACCIÓN PARA PPF EN EL PRESUPUESTO */}
                <div className="border-t border-white/10 pt-3.5 flex flex-col sm:flex-row items-center justify-between gap-2.5">
                  <div>
                    <span className="text-[11px] text-slate-400 block">Total de este blindaje PPF:</span>
                    <span className="text-base sm:text-lg font-black text-emerald-400">${costoPPF.precio.toLocaleString("es-MX")} MXN</span>
                  </div>

                  {ppfActivo ? (
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <div className="px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-1.5 flex-1 sm:flex-initial">
                        <LuCheck className="size-3.5 text-emerald-400" />
                        <span>En tu presupuesto</span>
                      </div>
                      <button
                        onClick={() => setPpfActivo(false)}
                        className="px-3 py-1.5 rounded-xl border border-white/20 bg-white/5 text-slate-300 hover:text-white hover:bg-white/10 text-xs font-semibold cursor-pointer transition-colors"
                      >
                        Quitar
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setPpfActivo(true)}
                      className="w-full sm:w-auto px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all active:scale-95"
                    >
                      <LuPlus className="size-4 stroke-[3]" />
                      <span>Sumar Blindaje PPF al Presupuesto</span>
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* === CATEGORÍA 4: MANTENIMIENTO EXPRESS === */}
            {categoria === "mantenimiento" && (
              <div className="space-y-3.5 rounded-3xl p-4 sm:p-6 border border-white/10 bg-neutral-950/70">
                <p className="text-xs text-slate-300 font-light mb-1">
                  Puedes sumar uno o varios de estos tratamientos rápidos a tu visita:
                </p>

                {/* 1. Lavado y Encerado */}
                <div
                  className={`p-3.5 rounded-2xl border transition-all ${
                    enceradoActivo
                      ? "border-emerald-500 bg-emerald-950/30 ring-1 ring-emerald-500/50"
                      : "border-white/10 bg-black/40 hover:border-white/20"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-1.5">
                    <div>
                      <span className="text-xs sm:text-sm font-bold text-white block">Lavado y Encerado Protector + Humectante</span>
                      <p className="text-[11px] text-slate-300 leading-relaxed font-light mt-0.5">
                        Lavado exterior a mano, encerado protector UV y humectación de pieles y plásticos en cabina.
                      </p>
                    </div>
                    <span className="text-sm font-black text-emerald-400 shrink-0">
                      ${costoEncerado.precio.toLocaleString("es-MX")} MXN
                    </span>
                  </div>
                  <div className="flex justify-end pt-2 border-t border-white/5">
                    <button
                      onClick={() => setEnceradoActivo(!enceradoActivo)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                        enceradoActivo
                          ? "bg-white/10 text-white border border-white/20 hover:bg-white/15"
                          : "bg-emerald-500 text-black hover:bg-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.25)]"
                      }`}
                    >
                      {enceradoActivo ? "✓ En tu presupuesto (Quitar)" : "+ Sumar al Presupuesto"}
                    </button>
                  </div>
                </div>

                {/* 2. Lavado de Motor */}
                <div
                  className={`p-3.5 rounded-2xl border transition-all ${
                    motorActivo
                      ? "border-emerald-500 bg-emerald-950/30 ring-1 ring-emerald-500/50"
                      : "border-white/10 bg-black/40 hover:border-white/20"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-1.5">
                    <div>
                      <span className="text-xs sm:text-sm font-bold text-white block">Lavado Técnico de Motor con Vapor & Carrocería</span>
                      <p className="text-[11px] text-slate-300 leading-relaxed font-light mt-0.5">
                        Lavado técnico de bahía de motor con vapor y productos dieléctricos sin riesgo para sensores, más baño exterior.
                      </p>
                    </div>
                    <span className="text-sm font-black text-emerald-400 shrink-0">
                      ${costoMotor.precio.toLocaleString("es-MX")} MXN
                    </span>
                  </div>
                  <div className="flex justify-end pt-2 border-t border-white/5">
                    <button
                      onClick={() => setMotorActivo(!motorActivo)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                        motorActivo
                          ? "bg-white/10 text-white border border-white/20 hover:bg-white/15"
                          : "bg-emerald-500 text-black hover:bg-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.25)]"
                      }`}
                    >
                      {motorActivo ? "✓ En tu presupuesto (Quitar)" : "+ Sumar al Presupuesto"}
                    </button>
                  </div>
                </div>

                {/* 3. Pulido de Faros (Héctor: solo faros $700 / faros y calaveras $1000) */}
                <div
                  className={`p-3.5 rounded-2xl border transition-all ${
                    farosActivo
                      ? "border-emerald-500 bg-emerald-950/30 ring-1 ring-emerald-500/50"
                      : "border-white/10 bg-black/40 hover:border-white/20"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <span className="text-xs sm:text-sm font-bold text-white block">Restauración y Pulido de Ópticas con Polímero</span>
                      <p className="text-[11px] text-slate-300 leading-relaxed font-light mt-0.5">
                        Remueve la capa amarilla y opaca con polímero vaporizado devolviendo 100% de transparencia.
                      </p>
                    </div>
                    <span className="text-sm font-black text-emerald-400 shrink-0">
                      ${costoFaros.precio.toLocaleString("es-MX")} MXN
                    </span>
                  </div>

                  {/* Selector: solo faros ($700) vs faros y calaveras ($1,000) */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10 mb-2">
                    <button
                      onClick={() => setFarosTipo("solo-faros")}
                      className={`p-2 rounded-xl border text-left cursor-pointer text-xs ${
                        farosTipo === "solo-faros"
                          ? "border-emerald-500 bg-emerald-500/20 text-white font-bold"
                          : "border-white/10 bg-black/30 text-slate-400 hover:text-white"
                      }`}
                    >
                      <span className="block font-bold">Solo Faros ($700)</span>
                      <span className="block text-[10px] text-slate-400">Delanteros</span>
                    </button>
                    <button
                      onClick={() => setFarosTipo("faros-calaveras")}
                      className={`p-2 rounded-xl border text-left cursor-pointer text-xs ${
                        farosTipo === "faros-calaveras"
                          ? "border-emerald-500 bg-emerald-500/20 text-white font-bold"
                          : "border-white/10 bg-black/30 text-slate-400 hover:text-white"
                      }`}
                    >
                      <span className="block font-bold">Faros + Calaveras ($1,000)</span>
                      <span className="block text-[10px] text-slate-400">Frontales y traseras</span>
                    </button>
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      onClick={() => setFarosActivo(!farosActivo)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                        farosActivo
                          ? "bg-white/10 text-white border border-white/20 hover:bg-white/15"
                          : "bg-emerald-500 text-black hover:bg-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.25)]"
                      }`}
                    >
                      {farosActivo ? "✓ En tu presupuesto (Quitar)" : "+ Sumar al Presupuesto"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* PANEL DERECHO: TICKET / RESUMEN EN VIVO (CARRITO CON BOTÓN DE ELIMINAR) */}
          <div
            ref={resumenRef}
            id="resumen-cotizacion-shalom"
            className="sticky top-20 rounded-3xl p-4 sm:p-6 border border-emerald-500/30 bg-gradient-to-b from-neutral-900 via-neutral-950 to-neutral-950 shadow-[0_15px_40px_rgba(0,0,0,0.7)] space-y-4"
          >
            {/* Cabecera del ticket */}
            <div className="border-b border-white/10 pb-3">
              <div className="h-[2px] w-full rounded-full bg-gradient-to-r from-emerald-500 via-white to-emerald-400 mb-2.5 shadow-[0_0_8px_rgba(16,185,129,0.3)]" />
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">Resumen en Tiempo Real</span>
                <span className="text-[10px] text-slate-300">🇲🇽 Toluca, MX</span>
              </div>
              <h4 className="text-base sm:text-lg font-extrabold text-white">Tu Cotización Personalizada</h4>
              <p className="text-xs text-slate-300 font-light">
                Vehículo: <strong className="text-white font-medium">{TIPOS_VEHICULO_SHALOM.find((v) => v.id === vehiculo)?.label}</strong>
              </p>
            </div>

            {/* Lista de Servicios Sumados en el Presupuesto (Con botón para eliminar) */}
            <div className="space-y-2 min-h-[120px] max-h-[300px] overflow-y-auto pr-1">
              {itemsPresupuesto.length === 0 ? (
                <div className="p-3.5 rounded-2xl bg-black/40 border border-dashed border-white/10 text-center space-y-1.5">
                  <LuInfo className="size-5 text-slate-400 mx-auto" />
                  <p className="text-xs text-slate-300 font-medium">Aún no tienes servicios sumados</p>
                  <p className="text-[11px] text-slate-400 font-light leading-relaxed">
                    Navega por las categorías de la izquierda y haz clic en <strong>"+ Sumar al Presupuesto"</strong> para cotizar lo que necesitas.
                  </p>
                </div>
              ) : (
                itemsPresupuesto.map((it) => (
                  <div
                    key={it.id}
                    className="p-2.5 sm:p-3 rounded-2xl bg-black/40 border border-white/10 hover:border-emerald-500/40 transition-colors flex items-start justify-between gap-2.5 group"
                  >
                    <div className="space-y-0.5 flex-1 pr-1">
                      <span className="text-xs font-bold text-white block leading-tight">{it.titulo}</span>
                      <p className="text-[11px] text-slate-300 font-light leading-tight line-clamp-2">{it.detalle}</p>
                      <span className="text-xs font-black text-emerald-400 block">${it.precio.toLocaleString("es-MX")} MXN</span>
                    </div>

                    {/* Botón para eliminar servicio de la lista */}
                    <button
                      onClick={() => eliminarServicio(it.id)}
                      title="Eliminar este servicio del presupuesto"
                      aria-label={`Eliminar ${it.titulo}`}
                      className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all shrink-0 cursor-pointer"
                    >
                      <LuTrash2 className="size-4" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Garantía y Tiempos */}
            <div className="p-2.5 sm:p-3 rounded-xl bg-black/50 border border-white/10 space-y-1 text-[11px]">
              <div className="flex items-center gap-2 text-slate-300">
                <LuClock className="size-3.5 text-emerald-400 shrink-0" />
                <span>Tiempo de trabajo: <strong className="text-white">{tiempoEstimadoGlobal}</strong></span>
              </div>
              {garantiasGlobales.length > 0 && (
                <div className="space-y-1 pt-1 border-t border-white/5">
                  {garantiasGlobales.map((g, idx) => (
                    <div key={idx} className="flex items-start gap-1.5 text-slate-100">
                      <LuShieldCheck className="size-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span className="leading-snug text-white font-medium">{g}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* TOTAL ACUMULADO */}
            <div className="pt-2 border-t border-white/10">
              <div className="flex items-baseline justify-between mb-3">
                <div>
                  <span className="text-xs uppercase tracking-wider text-slate-400 font-bold block">Total Estimado</span>
                  <span className="text-[11px] text-slate-400">
                    {itemsPresupuesto.length} servicio{itemsPresupuesto.length !== 1 ? "s" : ""}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-2xl sm:text-3xl font-black text-emerald-400 tracking-tight">
                    ${subtotalPresupuesto.toLocaleString("es-MX")}
                  </span>
                  <span className="text-[10px] text-slate-400 block font-normal">Pesos Mexicanos ($ MXN)</span>
                </div>
              </div>

              {/* BOTÓN WHATSAPP TRICOLOR MEXICANO */}
              {itemsPresupuesto.length > 0 ? (
                <a
                  href={waHref(biz, mensajeWhatsApp)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-neutral-950 font-black text-xs sm:text-sm uppercase tracking-wider active:scale-95 transition-all flex items-center justify-center gap-2 shadow-[0_8px_30px_rgba(16,185,129,0.45)] hover:shadow-[0_12px_40px_rgba(16,185,129,0.6)] cursor-pointer"
                >
                  <FaWhatsapp className="size-4 sm:size-5 text-neutral-950" />
                  <span>Apartar Cita por WhatsApp</span>
                </a>
              ) : (
                <div className="w-full py-3 px-4 rounded-2xl bg-white/5 border border-white/10 text-slate-500 font-bold text-xs uppercase tracking-wider text-center select-none">
                  Suma al menos un servicio para cotizar
                </div>
              )}
              <p className="text-[10px] text-slate-300 text-center mt-2">
                Envía tu paquete completo directamente a Héctor en Shalom Toluca sin compromiso.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* BARRA FLOTANTE INFERIOR INTELIGENTE (Visible en móviles/tablets cuando hay servicios y el ticket no está en pantalla) */}
      {itemsPresupuesto.length > 0 && (
        <aside
          aria-label="Resumen flotante de cotización"
          className={`fixed bottom-0 left-0 right-0 z-40 lg:hidden transition-[transform,opacity] duration-300 ease-out ${
            isResumenVisible
              ? "translate-y-full opacity-0 pointer-events-none"
              : "translate-y-0 opacity-100 pointer-events-auto"
          }`}
        >
          <div className="bg-[#0a0e0c]/95 backdrop-blur-md border-t border-emerald-500/30 shadow-[0_-10px_35px_rgba(0,0,0,0.85)] px-4 py-2.5 sm:py-3">
            <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
              {/* Info y Total (Al tocarlo, scrollea al ticket de desglose) */}
              <div
                onClick={() => {
                  if (resumenRef.current) {
                    resumenRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
                  }
                }}
                className="cursor-pointer group flex flex-col justify-center min-w-0"
              >
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xl sm:text-2xl font-black text-emerald-400 tracking-tight">
                    ${subtotalPresupuesto.toLocaleString("es-MX")}
                  </span>
                  <span className="text-[10px] font-bold text-slate-300">MXN</span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-300 truncate">
                  <span>{itemsPresupuesto.length} servicio{itemsPresupuesto.length > 1 ? "s" : ""}</span>
                  <span>·</span>
                  <span className="truncate">{TIPOS_VEHICULO_SHALOM.find((v) => v.id === vehiculo)?.label}</span>
                  <span className="text-emerald-400 font-medium ml-1">
                    (Ver ticket ▾)
                  </span>
                </div>
              </div>

              {/* Botón CTA directo a WhatsApp */}
              <a
                href={waHref(biz, mensajeWhatsApp)}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 inline-flex items-center gap-1.5 px-3.5 sm:px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-400 text-neutral-950 font-black text-xs uppercase tracking-wider shadow-[0_4px_20px_rgba(16,185,129,0.35)] active:scale-95 transition-all cursor-pointer"
              >
                <FaWhatsapp className="text-base text-neutral-950" />
                <span>Apartar Cita</span>
              </a>
            </div>
          </div>
        </aside>
      )}
    </section>
  );
}
