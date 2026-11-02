"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { FaCarSide, FaTruckPickup, FaVanShuttle, FaWhatsapp } from "react-icons/fa6";
import { 
  LuSparkles, 
  LuShieldCheck, 
  LuDroplets, 
  LuSun, 
  LuWrench, 
  LuCheck, 
  LuPlus, 
  LuInfo,
  LuTrash2,
  LuMapPin,
  LuChevronDown,
  LuChevronUp,
  LuX
} from "react-icons/lu";
import type { Business } from "@/data/business-helpers";

// Tipos de vehículos oficiales de Platinum Detallado
export type VehiculoId = "auto" | "suv2" | "pickup" | "suv3" | "van";

export interface TipoVehiculo {
  id: VehiculoId;
  label: string;
  sublabel: string;
  ejemplos: string;
  Icono: React.ComponentType<{ className?: string }>;
}

export const TIPOS_VEHICULO: TipoVehiculo[] = [
  {
    id: "auto",
    label: "Auto / Sedán",
    sublabel: "Compacto o Mediano",
    ejemplos: "Versa, Jetta, Civic, Ibiza, Mazda 3, Swift",
    Icono: FaCarSide,
  },
  {
    id: "suv2",
    label: "SUV 2 Filas",
    sublabel: "Camioneta Mediana",
    ejemplos: "RAV4, CR-V, Sportage, CX-5, Tucson",
    Icono: FaCarSide,
  },
  {
    id: "pickup",
    label: "Pick-Up",
    sublabel: "Caja corta / mediana",
    ejemplos: "Tacoma, Hilux, Ranger, Colorado, Frontier",
    Icono: FaTruckPickup,
  },
  {
    id: "suv3",
    label: "SUV 3 Filas",
    sublabel: "Camioneta Grande",
    ejemplos: "Tahoe, Suburban, Explorer, Traverse, Durango",
    Icono: FaCarSide,
  },
  {
    id: "van",
    label: "Van / Comercial",
    sublabel: "XL o 4 Filas",
    ejemplos: "Transit, Urvan, Hiace, Sprinter",
    Icono: FaVanShuttle,
  },
];

export type CategoriaId = "mantenimiento" | "brillo-proteccion" | "interiores" | "combos" | "correccion";

export interface ServicioBase {
  id: string;
  categoria: CategoriaId;
  nombre: string;
  subtitulo: string;
  descripcion: string;
  badge?: string;
  zonaAviso?: string;
  detalles: string[];
  precios: Record<VehiculoId, number | null>;
}

// Catálogo Oficial Resumido y Optimizado de Platinum
export const SERVICIOS_PLATINUM: ServicioBase[] = [
  // --- COMBOS ESTRELLA ---
  {
    id: "full-detail",
    categoria: "combos",
    nombre: "Platinum Full Detail",
    subtitulo: "Renovación Integral Interior & Exterior",
    descripcion: "Desinfección profunda a vapor en habitáculo, pulido a máquina y sellador cerámico exterior.",
    badge: "Más Solicitado",
    detalles: [
      "Inyección-succión en vestiduras (tela o piel) y alfombras",
      "Sanitización por vapor a 140°C en ductos de A/C y habitáculo",
      "Pulido a máquina de 1 paso (elimina 50%-70% de microrrayones)",
      "Sellador cerámico exterior (3 meses) y acondicionador UV",
    ],
    precios: {
      auto: 3690,
      suv2: 4290,
      pickup: 4590,
      suv3: 5390,
      van: 6990,
    },
  },
  {
    id: "express-sale",
    categoria: "combos",
    nombre: "Pack Express Sale",
    subtitulo: "Preparación Rápida para Venta",
    descripcion: "Acondicionamiento para incrementar valor de reventa: faros como nuevos, interiores y brillo express.",
    badge: "Especial Venta",
    detalles: [
      "Restauración óptica de ambos faros con polímero de vapor",
      "Lavado de asientos por inyección-succión y aspirado profundo",
      "Abrillantado All-In-One a máquina (elimina opacidad y sella brillo)",
      "Acondicionado de plásticos y detallado de rines y llantas",
    ],
    precios: {
      auto: 2490,
      suv2: 2890,
      pickup: 3190,
      suv3: 3390,
      van: 4290,
    },
  },

  // --- INTERIORES A PROFUNDIDAD ---
  {
    id: "full-interior",
    categoria: "interiores",
    nombre: "Full Interior & Sanitización",
    subtitulo: "Renovación Total de Interiores a Vapor",
    descripcion: "Desinfección profunda de cabina: elimina manchas difíciles, suciedad, olores y bacterias a vapor.",
    badge: "Desinfección Total",
    detalles: [
      "Inyección-succión en vestiduras, alfombras, tapetes y cajuela",
      "Sanitización por vapor a 140°C en ductos de aire acondicionado",
      "Detallado con brochas en tablero, consola, volante y rejillas",
      "Acondicionador UV en plásticos (1 año) + lavado exterior de cortesía",
    ],
    precios: {
      auto: 1990,
      suv2: 2190,
      pickup: 2490,
      suv3: 2790,
      van: 3690,
    },
  },
  {
    id: "premier-pro",
    categoria: "interiores",
    nombre: "Premier Pro Interior",
    subtitulo: "Lavado Pro de Vestiduras & Plásticos",
    descripcion: "Lavado profundo de asientos y plásticos con lavado exterior de cortesía.",
    detalles: [
      "Inyección-succión en vestiduras y aspirado de habitáculo/cajuela",
      "Restauración y acondicionador UV en tablero y consolas (6 meses)",
      "Detallado con brochas en puertas, volante y portavasos",
      "Lavado exterior pH neutro con cera líquida protectora (1 mes)",
    ],
    precios: {
      auto: 1290,
      suv2: 1550,
      pickup: 1750,
      suv3: 1990,
      van: 2800,
    },
  },

  // --- CORRECCIÓN & CERÁMICOS ---
  {
    id: "ceramic-coating",
    categoria: "correccion",
    nombre: "Ceramic Coating 9H",
    subtitulo: "Corrección Profunda & Cerámico 9H",
    descripcion: "Blindaje de carrocería: corrección de pintura en 2 pasos bajo carpa y sellado nanocerámico 9H.",
    badge: "Máxima Gama",
    detalles: [
      "Descontaminado físico (clay bar) y químico de pintura",
      "Corrección de pintura en 2 pasos (corte pesado + refinado espejo)",
      "Recubrimiento Nanocerámico 9H (1 a 2 años de duración)",
      "Máxima hidrofobia (efecto gota) y protección UV total",
    ],
    precios: {
      auto: 5500,
      suv2: 6500,
      pickup: 6800,
      suv3: 7800,
      van: 9200,
    },
  },
  {
    id: "ceramico-interior-integral-servicio",
    categoria: "interiores",
    nombre: "Protección Cerámica Integral (Interiores)",
    subtitulo: "Blindaje Nanotecnológico de Asientos + Plásticos",
    descripcion: "Escudo nanotecnológico contra derrames de líquidos, decoloración solar UV y tinte de jeans.",
    badge: "Escudo Nanotecnológico",
    detalles: [
      "Repelencia anti-manchas: encapsula líquidos en piel y tela",
      "Escudo térmico UV: sella plásticos y previene cuarteaduras",
      "Barrera anti-transferencia de tinte para ropa oscura o mezclilla",
      "Terminado mate original al tacto, sin texturas grasosas (12 meses)",
    ],
    precios: {
      auto: 1800,
      suv2: 2300,
      pickup: 2300,
      suv3: 2800,
      van: 3200,
    },
  },
  {
    id: "titanium-shine",
    categoria: "correccion",
    nombre: "Titanium Shine",
    subtitulo: "Pulido a 2 Pasos & Refinado Espejo",
    descripcion: "Elimina 80%-90% de microrrayones y swirls, dejando reflejo espejo protegido con SiO2.",
    badge: "Efecto Espejo",
    detalles: [
      "Descontaminado completo con clay bar bajo carpa móvil",
      "Paso 1: Corte pesado para eliminar rayones y marcas de lavado",
      "Paso 2: Refinado a máquina para máxima claridad y brillo espejo",
      "Sellador híbrido cerámico SiO2 (4 a 6 meses de duración)",
    ],
    precios: {
      auto: 3200,
      suv2: 3700,
      pickup: 3700,
      suv3: 4200,
      van: 5400,
    },
  },
  {
    id: "gloss-shine",
    categoria: "correccion",
    nombre: "Gloss & Shine",
    subtitulo: "Pulido a 1 Paso & Abrillantado",
    descripcion: "Recupera la profundidad y tono de la pintura eliminando microrrayones leves (50%-70%).",
    detalles: [
      "Pre-lavado con espuma activa y descontaminado rápido de pintura",
      "Pulido técnico a máquina de 1 paso para recuperar brillo profundo",
      "Protección con sellador sintético cerámico (hasta 3 meses)",
      "Limpieza de rines, tolvas y llantas en negro brillante",
    ],
    precios: {
      auto: 1890,
      suv2: 2190,
      pickup: 2290,
      suv3: 2590,
      van: 3400,
    },
  },

  // --- MANTENIMIENTO & ESTÉTICA ---
  {
    id: "diamond-protect",
    categoria: "brillo-proteccion",
    nombre: "Diamond Protect",
    subtitulo: "Sellador Cerámico de 3 Meses",
    descripcion: "Tratamiento exterior con descontaminado químico y sellador cerámico, más limpieza interior.",
    badge: "Sellador Cerámico",
    detalles: [
      "Lavado técnico a presión y descontaminado químico de pintura",
      "Sellador cerámico exterior de alta hidrofobia (3 meses)",
      "Limpieza y acondicionador UV en asientos de piel/vinil y plásticos",
      "Descontaminado profundo de rines y abrillantado de llantas",
    ],
    precios: {
      auto: 1290,
      suv2: 1590,
      pickup: 1790,
      suv3: 2090,
      van: 2890,
    },
  },
  {
    id: "hydro-gloss",
    categoria: "brillo-proteccion",
    nombre: "Hydro Gloss",
    subtitulo: "Brillo & Hidrofobia Express",
    descripcion: "Sellador hidrofóbico anti-polvo de 30 días, cañón de espuma y aspirado interior.",
    badge: "Hidrofóbico",
    detalles: [
      "Lavado técnico a presión con cañón de espuma anti-rayones",
      "Sellador hidrofóbico y anti-polvo de carrocería (hasta 30 días)",
      "Acondicionador UV en plásticos y aspirado de habitáculo",
      "Limpieza de rines y neumáticos de alto brillo",
    ],
    precios: {
      auto: 690,
      suv2: 790,
      pickup: 890,
      suv3: 1090,
      van: 1490,
    },
  },
  {
    id: "mantenimiento-core",
    categoria: "mantenimiento",
    nombre: "Mantenimiento Core",
    subtitulo: "Lavado Técnico & Cera Rápida",
    descripcion: "Lavado técnico anti-rayones, shampoo con cera y sellado rápido de 15 días con detallado de plásticos.",
    badge: "Cera Rápida",
    detalles: [
      "Pre-lavado y lavado técnico a presión con método anti-rayones",
      "Lavado con shampoo con cera + aplicación de cera líquida (15 días)",
      "Acondicionado mate para tablero y puertas con filtro UV",
      "Limpieza de cristales y aspirado completo de habitáculo",
    ],
    precios: {
      auto: 420,
      suv2: 470,
      pickup: 520,
      suv3: 630,
      van: 890,
    },
  },
  {
    id: "essential-care",
    categoria: "mantenimiento",
    nombre: "Essential Care",
    subtitulo: "Lavado Técnico pH Neutro",
    descripcion: "Lavado seguro a presión con shampoo neutro, aspirado de cabina y plásticos mate.",
    badge: "Mantenimiento Regular",
    detalles: [
      "Pre-lavado y lavado técnico a presión anti-rayones con pH neutro",
      "Acondicionado mate en plásticos interiores con filtro UV (15 días)",
      "Aspirado general de habitáculo y cajuela",
      "Limpieza de cara de rines y abrillantado de neumáticos",
    ],
    precios: {
      auto: 300,
      suv2: 350,
      pickup: 400,
      suv3: 500,
      van: 690,
    },
  },


];

// Complementos y Upgrades Curados (9 opciones de alto valor)
export interface Complemento {
  id: string;
  nombre: string;
  descripcion: string;
  categoriaTipo: "interior" | "cristales" | "exterior" | "ceramico";
  precioTipo: "fijo" | "variable";
  precioFijo?: number;
  preciosVariables?: Record<VehiculoId, number>;
}

export const COMPLEMENTOS_PLATINUM: Complemento[] = [
  // --- FAROS Y MOTOR A VAPOR (ADDONS OFICIALES) ---
  {
    id: "faros-addon",
    nombre: "Restauración de Faros con Polímero de Vapor",
    descripcion: "Elimina opacidad y tono amarillo mediante polímero de vapor óptico. Recupera hasta 40% más de iluminación con 6 meses de garantía.",
    categoriaTipo: "exterior",
    precioTipo: "variable",
    preciosVariables: {
      auto: 650,
      suv2: 750,
      pickup: 750,
      suv3: 750,
      van: 750,
    },
  },
  {
    id: "motor-addon",
    nombre: "Lavado de Motor a Vapor Técnico",
    descripcion: "Desengrasado seguro a vapor y acondicionado térmico mate de plásticos y mangueras (sin riesgo eléctrico).",
    categoriaTipo: "exterior",
    precioTipo: "variable",
    preciosVariables: {
      auto: 550,
      suv2: 750,
      pickup: 750,
      suv3: 750,
      van: 850,
    },
  },
  {
    id: "ceramico-asientos",
    nombre: "Protección Cerámica en Asientos (Piel / Tela)",
    descripcion: "Escudo nanotecnológico anti-manchas: encapsula líquidos y evita transferencia de tinte de jeans (12 meses).",
    categoriaTipo: "ceramico",
    precioTipo: "variable",
    preciosVariables: {
      auto: 1200,
      suv2: 1500,
      pickup: 1500,
      suv3: 1500,
      van: 1800,
    },
  },
  {
    id: "ceramico-rines",
    nombre: "Cerámico Térmico en Rines Gyeon Q² (4 Ruedas)",
    descripcion: "Resistencia térmica hasta 800°C contra polvo de balata y suciedad de frenos (12 a 18 meses).",
    categoriaTipo: "ceramico",
    precioTipo: "variable",
    preciosVariables: {
      auto: 1400,
      suv2: 1800,
      pickup: 1800,
      suv3: 1800,
      van: 1800,
    },
  },
  {
    id: "ceramico-plasticos",
    nombre: "Cerámico de Plásticos Exteriores (12 Meses UV)",
    descripcion: "Sella molduras y plásticos exteriores contra rayos UV y resequedad sin acabados grasosos.",
    categoriaTipo: "ceramico",
    precioTipo: "variable",
    preciosVariables: {
      auto: 1300,
      suv2: 1800,
      pickup: 1800,
      suv3: 2400,
      van: 2400,
    },
  },
  {
    id: "ceramico-interior-integral",
    nombre: "Cerámico Interior Integral (Asientos + Plásticos)",
    descripcion: "Blindaje completo de cabina: vestiduras y tablero protegidos contra derrames y rayos solares.",
    categoriaTipo: "ceramico",
    precioTipo: "variable",
    preciosVariables: {
      auto: 1800,
      suv2: 2300,
      pickup: 2300,
      suv3: 2800,
      van: 3200,
    },
  },

  // --- TRATAMIENTOS DE CRISTALES Y DETALLE EXTERIOR/INTERIOR ---
  {
    id: "vision-clara",
    nombre: "Combo Visión Clara (Repelente de Lluvia)",
    descripcion: "Sellador cerámico hidrofóbico en todos los cristales. Repele el agua de lluvia por 3 meses.",
    categoriaTipo: "cristales",
    precioTipo: "fijo",
    precioFijo: 350,
  },
  {
    id: "ozono",
    nombre: "Sanitización Profunda con Ozono",
    descripcion: "Generador de gas ozono para eliminar olores severos de cigarro, humedad o bacterias.",
    categoriaTipo: "interior",
    precioTipo: "fijo",
    precioFijo: 350,
  },
  {
    id: "rines-calipers",
    nombre: "Descontaminado de Rines & Calipers",
    descripcion: "Remoción profunda de polvo de balata y hollín quemado en las 4 ruedas.",
    categoriaTipo: "exterior",
    precioTipo: "fijo",
    precioFijo: 300,
  },
  {
    id: "sellado-rines",
    nombre: "Sellado Cerámico de Rines SiO2",
    descripcion: "Capa protectora que evita que el polvo de frenos se incruste y facilita el lavado.",
    categoriaTipo: "exterior",
    precioTipo: "fijo",
    precioFijo: 200,
  },
];

interface CategoriaTab {
  id: CategoriaId;
  label: string;
  nivel?: string;
  isExtra?: boolean;
  badge?: string;
  Icono: React.ComponentType<{ className?: string }>;
}

const CATEGORIAS: CategoriaTab[] = [
  { 
    id: "mantenimiento", 
    label: "Mantenimiento Express", 
    nivel: "NIVEL 1", 
    Icono: LuSun 
  },
  { 
    id: "brillo-proteccion", 
    label: "Brillo & Protección", 
    nivel: "NIVEL 2", 
    Icono: LuSparkles 
  },
  { 
    id: "interiores", 
    label: "Interiores a Profundidad", 
    nivel: "NIVEL 3", 
    Icono: LuDroplets 
  },
  { 
    id: "combos", 
    label: "Combos Completos", 
    nivel: "NIVEL 4", 
    badge: "Recomendado", 
    Icono: LuSparkles 
  },
  { 
    id: "correccion", 
    label: "Pulidos & Cerámico", 
    isExtra: true, 
    badge: "Tratamiento Pro", 
    Icono: LuShieldCheck 
  },
];

// Grupos para reglas de exclusividad mutua e inteligencia de selección
const GRUPO_COMBOS = ["full-detail", "express-sale"];
const GRUPO_INTERIORES = ["full-interior", "premier-pro"];
const GRUPO_CORRECCION_EXTERIOR = ["gloss-shine", "titanium-shine", "ceramic-coating"];
const GRUPO_MANTENIMIENTO = ["essential-care", "mantenimiento-core"];
const GRUPO_BRILLO_PROTECCION = ["diamond-protect", "hydro-gloss"];

export interface InclusionInfo {
  isIncluded: boolean;
  byComboId?: string;
  byComboName?: string;
  reason?: string;
}

export function getInclusionInfo(serviceId: string, selectedIds: string[]): InclusionInfo {
  const hasFullDetail = selectedIds.includes("full-detail");
  const hasExpressSale = selectedIds.includes("express-sale");

  if (hasFullDetail) {
    if (serviceId === "full-interior") {
      return {
        isIncluded: true,
        byComboId: "full-detail",
        byComboName: "Platinum Full Detail",
        reason: "Desinfección integral a vapor e inyección-succión ya incluidos",
      };
    }
    if (serviceId === "premier-pro") {
      return {
        isIncluded: true,
        byComboId: "full-detail",
        byComboName: "Platinum Full Detail",
        reason: "Lavado profundo de vestiduras y habitáculo ya incluido",
      };
    }
    if (serviceId === "gloss-shine") {
      return {
        isIncluded: true,
        byComboId: "full-detail",
        byComboName: "Platinum Full Detail",
        reason: "Pulido a máquina de 1 paso y sellador exterior ya incluidos",
      };
    }
    if ([...GRUPO_MANTENIMIENTO, ...GRUPO_BRILLO_PROTECCION].includes(serviceId)) {
      return {
        isIncluded: true,
        byComboId: "full-detail",
        byComboName: "Platinum Full Detail",
        reason: "Lavado técnico exterior, descontaminado y sellador cerámico ya cubiertos en tu combo",
      };
    }
  }

  if (hasExpressSale) {
    if (serviceId === "faros-addon") {
      return {
        isIncluded: true,
        byComboId: "express-sale",
        byComboName: "Pack Express Sale",
        reason: "Restauración de faros con polímero de vapor óptico ya incluida",
      };
    }
    if (["essential-care", "mantenimiento-core"].includes(serviceId)) {
      return {
        isIncluded: true,
        byComboId: "express-sale",
        byComboName: "Pack Express Sale",
        reason: "Lavado técnico exterior y aspirado ya cubiertos en tu combo",
      };
    }
  }

  return { isIncluded: false };
}

interface NotificacionState {
  texto: string;
  subtexto?: string;
  accionTexto?: string;
  onAccion?: () => void;
}

export const ZONAS_QUERETARO = [
  "Zibatá",
  "Zákia",
  "El Campanario",
  "Juriquilla",
  "Milenio III",
  "El Refugio",
  "Centro Sur",
];

export interface CotizadorPlatinumProps {
  biz: Business;
  onCotizacionChange?: (active: boolean) => void;
}

export default function CotizadorPlatinum({ biz, onCotizacionChange }: CotizadorPlatinumProps) {
  const [vehiculoId, setVehiculoId] = useState<VehiculoId>("auto");
  const [categoriaActiva, setCategoriaActiva] = useState<CategoriaTab["id"]>("mantenimiento");
  
  // Selección múltiple persistente: permite sumar servicios de distintas categorías (inicia sin selección)
  const [serviciosSeleccionadosIds, setServiciosSeleccionadosIds] = useState<string[]>([]);
  const [complementosSeleccionados, setComplementosSeleccionados] = useState<string[]>([]);
  const [notificacion, setNotificacion] = useState<NotificacionState | null>(null);

  // Acordeón desplegable para adicionales (Paso 3)
  const [isComplementosOpen, setIsComplementosOpen] = useState(false);

  // Zona / Fraccionamiento del cliente en Querétaro
  const [zonaCliente, setZonaCliente] = useState("");
  const [zonaError, setZonaError] = useState(false);
  const [showZoneDrawer, setShowZoneDrawer] = useState(false);
  const [isResumenVisible, setIsResumenVisible] = useState(false);
  const resumenRef = useRef<HTMLDivElement | null>(null);
  const zonaInputRef = useRef<HTMLInputElement | null>(null);

  // Notificar al contenedor principal cuando hay cotización activa para coordinar botones flotantes
  useEffect(() => {
    onCotizacionChange?.(serviciosSeleccionadosIds.length > 0);
  }, [serviciosSeleccionadosIds.length, onCotizacionChange]);

  // Observer para detectar si el Paso 4 (Resumen completo) está en pantalla y ocultar suavemente la barra flotante
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

  // Auto-ocultar notificación dinámica tras 7 segundos
  useEffect(() => {
    if (!notificacion) return;
    const timer = setTimeout(() => {
      setNotificacion(null);
    }, 7000);
    return () => clearTimeout(timer);
  }, [notificacion]);

  const aplicarSeleccionServicio = (id: string, forceToggleOffIfSelected = false) => {
    // 1. Si el servicio ya está cubierto por un combo activo:
    const inclusion = getInclusionInfo(id, serviciosSeleccionadosIds);
    if (inclusion.isIncluded) {
      setNotificacion({
        texto: `"${SERVICIOS_PLATINUM.find((s) => s.id === id)?.nombre}" ya forma parte de tu ${inclusion.byComboName}.`,
        subtexto: inclusion.reason ? `${inclusion.reason}. ¡No pagas doble!` : undefined,
        accionTexto: "Contratar solo este servicio individual",
        onAccion: () => {
          setServiciosSeleccionadosIds((prev) => {
            const sinCombo = prev.filter((item) => item !== inclusion.byComboId);
            return sinCombo.includes(id) ? sinCombo : [...sinCombo, id];
          });
          setNotificacion({
            texto: `Se cambió a "${SERVICIOS_PLATINUM.find((s) => s.id === id)?.nombre}" como servicio individual.`,
          });
        },
      });
      return;
    }

    // 2. Si ya estaba seleccionado manualmente:
    if (serviciosSeleccionadosIds.includes(id)) {
      if (forceToggleOffIfSelected) {
        quitarServicio(id);
      }
      return;
    }

    // 3. Activar el servicio aplicando reglas de exclusividad mutua y optimización
    setServiciosSeleccionadosIds((prev) => {
      let next = [...prev];

      // Caso A: Combo Platinum Full Detail
      if (id === "full-detail") {
        const absorbidos = [
          "express-sale",
          ...GRUPO_INTERIORES,
          "gloss-shine",
          ...GRUPO_MANTENIMIENTO,
        ];
        next = next.filter((item) => !absorbidos.includes(item));
        next.push("full-detail");

        setNotificacion({
          texto: "✨ Platinum Full Detail activado: incluye renovación total de interiores a vapor y pulido exterior de 1 paso.",
          subtexto: "Puedes sumar Faros, Lavado de Motor a Vapor o Complementos según lo necesites.",
        });
        return next;
      }

      // Caso B: Pack Express Sale
      if (id === "express-sale") {
        const absorbidos = ["full-detail", "faros", "essential-care", "mantenimiento-core"];
        next = next.filter((item) => !absorbidos.includes(item));
        next.push("express-sale");

        setNotificacion({
          texto: "✨ Pack Express Sale activado: incluye restauración óptica de faros, aspirado profundo y abrillantado express.",
        });
        return next;
      }

      // Caso C: Interiores (Full Interior o Premier Pro)
      if (GRUPO_INTERIORES.includes(id)) {
        next = next.filter((item) => !GRUPO_INTERIORES.includes(item));
        if (next.includes("full-detail")) {
          next = next.filter((item) => item !== "full-detail");
          setNotificacion({
            texto: `✨ Se configuró "${SERVICIOS_PLATINUM.find((s) => s.id === id)?.nombre}" como servicio individual.`,
          });
        }
        next.push(id);
        return next;
      }

      // Caso D: Corrección de pintura exterior (Gloss 1 paso, Titanium 2 pasos, Ceramic Coating 9H)
      if (GRUPO_CORRECCION_EXTERIOR.includes(id)) {
        next = next.filter((item) => !GRUPO_CORRECCION_EXTERIOR.includes(item));

        // Si full-detail estaba activo y se selecciona un upgrade como 2 pasos o Ceramic Coating 9H:
        if (next.includes("full-detail")) {
          next = next.filter((item) => item !== "full-detail");
          if (!next.includes("full-interior")) {
            next.push("full-interior");
          }
          const servicioNombre = SERVICIOS_PLATINUM.find((s) => s.id === id)?.nombre || "Corrección";
          setNotificacion({
            texto: `✨ Optimización automática: Se configuró Full Interior + ${servicioNombre} para no duplicar el pulido exterior.`,
          });
        }
        next.push(id);
        return next;
      }

      // Caso E: Mantenimiento express (Nivel 1)
      if (GRUPO_MANTENIMIENTO.includes(id)) {
        next = next.filter((item) => !GRUPO_MANTENIMIENTO.includes(item));
        next.push(id);
        return next;
      }

      // Caso F: Brillo & Protección (Nivel 2)
      if (GRUPO_BRILLO_PROTECCION.includes(id)) {
        next = next.filter((item) => !GRUPO_BRILLO_PROTECCION.includes(item));
        next.push(id);
        return next;
      }

      // Caso G: Cerámico Interior Integral
      if (id === "ceramico-interior-integral-servicio") {
        if (!next.includes("ceramico-interior-integral-servicio")) {
          next.push("ceramico-interior-integral-servicio");
        }
        setComplementosSeleccionados((cPrev) =>
          cPrev.includes("ceramico-interior-integral") ? cPrev : [...cPrev, "ceramico-interior-integral"]
        );
        return next;
      }

      next.push(id);
      return next;
    });
  };

  const toggleServicio = (id: string) => {
    aplicarSeleccionServicio(id, true);
  };

  const quitarServicio = (id: string) => {
    setServiciosSeleccionadosIds((prev) => prev.filter((item) => item !== id));
    if (id === "ceramico-interior-integral-servicio") {
      setComplementosSeleccionados((prev) => prev.filter((item) => item !== "ceramico-interior-integral"));
    }
  };

  const toggleComplemento = (id: string) => {
    // Si es faros y ya está cubierto por Pack Express Sale, no cobrar doble
    if (id === "faros-addon" && hasExpressSale) {
      setNotificacion({
        texto: "✨ La restauración de faros ya viene incluida sin costo extra en tu Pack Express Sale.",
      });
      return;
    }

    if (id === "ceramico-interior-integral") {
      const isActivo = complementosSeleccionados.includes("ceramico-interior-integral") || serviciosSeleccionadosIds.includes("ceramico-interior-integral-servicio");
      if (isActivo) {
        setComplementosSeleccionados((prev) => prev.filter((item) => item !== "ceramico-interior-integral"));
        setServiciosSeleccionadosIds((prev) => prev.filter((item) => item !== "ceramico-interior-integral-servicio"));
      } else {
        setComplementosSeleccionados((prev) => [...prev, "ceramico-interior-integral"]);
        setServiciosSeleccionadosIds((prev) => prev.includes("ceramico-interior-integral-servicio") ? prev : [...prev, "ceramico-interior-integral-servicio"]);
      }
      return;
    }

    setComplementosSeleccionados((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Escuchar si desde alguna tarjeta exterior se solicita cotizar un servicio
  useEffect(() => {
    const handleSelectService = (event: CustomEvent<{ servicioId?: string; categoria?: string }>) => {
      const { servicioId, categoria } = event.detail || {};
      if (servicioId) {
        const found = SERVICIOS_PLATINUM.find((s) => s.id === servicioId);
        if (found) {
          setCategoriaActiva(found.categoria);
          aplicarSeleccionServicio(found.id, false);
        } else {
          const foundAddon = COMPLEMENTOS_PLATINUM.find((c) => c.id === servicioId);
          if (foundAddon) {
            setIsComplementosOpen(true);
            setComplementosSeleccionados((prev) => prev.includes(foundAddon.id) ? prev : [...prev, foundAddon.id]);
            const el = document.getElementById("paso-3-complementos");
            if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        }
      } else if (categoria) {
        setCategoriaActiva(categoria as CategoriaTab["id"]);
      }
    };

    window.addEventListener("platinum:cotizar", handleSelectService as EventListener);
    return () => window.removeEventListener("platinum:cotizar", handleSelectService as EventListener);
  }, [serviciosSeleccionadosIds]);

  const vehiculoActual = useMemo(
    () => TIPOS_VEHICULO.find((v) => v.id === vehiculoId) || TIPOS_VEHICULO[0],
    [vehiculoId]
  );

  const getPrecioServicio = (s: ServicioBase): number => {
    return s.precios[vehiculoId] ?? 0;
  };

  const getPrecioComplemento = (c: Complemento): number => {
    if (c.precioTipo === "fijo") return c.precioFijo ?? 0;
    return c.preciosVariables?.[vehiculoId] ?? 0;
  };

  // Servicios filtrados y ordenados del más caro al más barato según el vehículo
  const serviciosDeCategoria = useMemo(() => {
    return SERVICIOS_PLATINUM
      .filter((s) => s.categoria === categoriaActiva)
      .slice()
      .sort((a, b) => {
        const pA = a.precios[vehiculoId] ?? 0;
        const pB = b.precios[vehiculoId] ?? 0;
        return pB - pA;
      });
  }, [categoriaActiva, vehiculoId]);

  // Complementos ordenados del más caro al más barato según el vehículo
  const complementosOrdenados = useMemo(() => {
    return COMPLEMENTOS_PLATINUM.slice().sort((a, b) => {
      return getPrecioComplemento(b) - getPrecioComplemento(a);
    });
  }, [vehiculoId]);

  // Lista de todos los servicios base seleccionados
  const serviciosSeleccionados = useMemo(
    () => SERVICIOS_PLATINUM.filter((s) => serviciosSeleccionadosIds.includes(s.id)),
    [serviciosSeleccionadosIds]
  );



  // Complementos filtrados sin duplicaciones con combos o servicios equivalentes
  const complementosSinDuplicados = useMemo(() => {
    return complementosSeleccionados.filter((id) => {
      if (id === "faros-addon" && serviciosSeleccionadosIds.includes("express-sale")) return false;
      if (id === "ceramico-interior-integral" && serviciosSeleccionadosIds.includes("ceramico-interior-integral-servicio")) return false;
      return true;
    });
  }, [complementosSeleccionados, serviciosSeleccionadosIds]);

  // Total acumulado sin duplicaciones
  const totalEstimado = useMemo(() => {
    const totalServicios = serviciosSeleccionados.reduce((acc, s) => {
      return acc + getPrecioServicio(s);
    }, 0);

    const totalComplementos = complementosSinDuplicados.reduce((acc, id) => {
      const c = COMPLEMENTOS_PLATINUM.find((item) => item.id === id);
      return acc + (c ? getPrecioComplemento(c) : 0);
    }, 0);

    return totalServicios + totalComplementos;
  }, [serviciosSeleccionados, complementosSinDuplicados, vehiculoId]);

  // Mensaje estructurado para WhatsApp
  const whatsAppUrl = useMemo(() => {
    const waNumber = (biz.whatsapp || "524427151535").replace(/\D/g, "");
    
    const lineasServicios = serviciosSeleccionados
      .map((s) => {
        let notaExtra = "";
        if (s.id === "full-detail") {
          notaExtra = "\n   ↳ Incluye: Interiores a vapor + Inyección-succión + Pulido 1 paso + Sellador cerámico";
        } else if (s.id === "express-sale") {
          notaExtra = "\n   ↳ Incluye: Restauración de faros + Limpieza de vestiduras + Abrillantado express";
        }
        return `• ${s.nombre} ($${getPrecioServicio(s).toLocaleString("es-MX")} MXN)${notaExtra}`;
      })
      .join("\n");

    const lineasComplementos = complementosSinDuplicados
      .map((id) => {
        const c = COMPLEMENTOS_PLATINUM.find((item) => item.id === id);
        if (!c) return null;
        return `  - ${c.nombre} (+$${getPrecioComplemento(c).toLocaleString("es-MX")} MXN)`;
      })
      .filter(Boolean)
      .join("\n");

    const bloqueServicios = lineasServicios || "• Tratamiento a cotizar en sitio";
    const bloqueComplementos = lineasComplementos 
      ? `\n\n*Complementos agregados:*\n${lineasComplementos}` 
      : "";

    const textoZona = zonaCliente.trim() ? zonaCliente.trim() : "Querétaro (por definir)";
    const mensaje = `Hola Platinum Detallado Automotriz.
Estuve cotizando en su sitio web para un servicio a domicilio en Querétaro:

*Vehículo:* ${vehiculoActual.label} (${vehiculoActual.ejemplos})

*Tratamientos seleccionados:*
${bloqueServicios}${bloqueComplementos}

*Total estimado:* $${totalEstimado.toLocaleString("es-MX")} MXN
*Mi zona / fraccionamiento:* ${textoZona}

¿Qué fechas y horarios tienen disponibles para agendar la visita en mi domicilio?`;

    return `https://wa.me/${waNumber}?text=${encodeURIComponent(mensaje)}`;
  }, [biz, vehiculoActual, serviciosSeleccionados, complementosSinDuplicados, serviciosSeleccionadosIds, totalEstimado, vehiculoId, zonaCliente]);

  const handlePaso4WhatsApp = () => {
    if (totalEstimado > 0 && !zonaCliente.trim()) {
      setZonaError(true);
      if (zonaInputRef.current) {
        zonaInputRef.current.focus();
        zonaInputRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }
    window.open(whatsAppUrl, "_blank", "noopener,noreferrer");
  };

  const handleStickyCtaClick = () => {
    if (!zonaCliente.trim()) {
      setShowZoneDrawer(true);
    } else {
      window.open(whatsAppUrl, "_blank", "noopener,noreferrer");
    }
  };

  const hasFullDetail = serviciosSeleccionadosIds.includes("full-detail");
  const hasExpressSale = serviciosSeleccionadosIds.includes("express-sale");

  return (
    <section 
      id="cotizador" 
      className="relative px-4 sm:px-8 py-20 bg-[#0a0a0c] text-white border-t border-b border-white/10 overflow-hidden scroll-mt-24 sm:scroll-mt-28"
    >
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-amber-500/5 blur-[140px] pointer-events-none rounded-full" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[300px] bg-emerald-500/5 blur-[120px] pointer-events-none rounded-full" />

      <div className="max-w-6xl mx-auto space-y-12 relative z-10">
        
        {/* Cabecera Principal */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/15 text-xs sm:text-sm font-medium tracking-wide text-neutral-200">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            Cotizador Oficial en Vivo · Catálogo Actualizado
          </div>
          <h2 className="text-3xl sm:text-5xl font-semibold tracking-tight text-white">
            Cotiza tu Detallado en <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-500">30 Segundos</span>
          </h2>
          <p className="text-sm sm:text-base text-neutral-300 max-w-2xl mx-auto leading-relaxed">
            Selecciona tu vehículo y suma los tratamientos deseados. Servicio 100% a domicilio en todo Querétaro.
          </p>
        </div>

        {/* PASO 1: Selector de Tipo de Vehículo */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm sm:text-base uppercase tracking-wider text-neutral-200 font-bold flex items-center gap-2.5">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-amber-400 text-black text-xs font-black">1</span>
              Selecciona el tipo de vehículo
            </h3>
            <span className="text-xs sm:text-sm text-neutral-400 hidden sm:inline">Ajusta los insumos y tarifas exactas</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
            {TIPOS_VEHICULO.map((v, idx) => {
              const activo = v.id === vehiculoId;
              const IconComp = v.Icono;
              const isLast = idx === TIPOS_VEHICULO.length - 1;
              return (
                <button
                  key={v.id}
                  onClick={() => setVehiculoId(v.id)}
                  type="button"
                  className={`text-left p-4 sm:p-5 rounded-2xl border transition-all duration-200 flex flex-col justify-between min-h-[120px] sm:min-h-[135px] ${
                    isLast ? "col-span-2 sm:col-span-1 justify-self-center w-full max-w-[calc(50%-7px)] sm:max-w-none" : ""
                  } ${
                    activo
                      ? "bg-gradient-to-b from-amber-500/20 to-neutral-900 border-amber-400/80 shadow-[0_0_24px_rgba(245,158,11,0.2)] ring-1 ring-amber-400/60"
                      : "bg-[#111114] border-white/10 hover:border-white/30 hover:bg-[#16161a]"
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <IconComp className={`text-2xl ${activo ? "text-amber-400" : "text-neutral-300"}`} />
                    {activo && (
                      <span className="w-5 h-5 rounded-full bg-amber-400 text-black flex items-center justify-center text-xs font-bold">
                        <LuCheck className="stroke-[3]" />
                      </span>
                    )}
                  </div>
                  <div className="mt-3">
                    <p className={`text-sm sm:text-base font-bold leading-tight ${activo ? "text-white" : "text-neutral-100"}`}>
                      {v.label}
                    </p>
                    <p className="text-[11px] sm:text-xs text-neutral-400 mt-1 leading-tight break-words">
                      {v.ejemplos}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* PASO 2: Categorías de Servicio y Tarjetas con Selección Inteligente */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm sm:text-base uppercase tracking-wider text-neutral-200 font-bold flex items-center gap-2.5">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-amber-400 text-black text-xs font-black">2</span>
              Elige los tratamientos deseados (puedes sumar más de uno)
            </h3>
            <span className="text-xs sm:text-sm text-amber-400 font-semibold hidden sm:inline">
              {serviciosSeleccionados.length} {serviciosSeleccionados.length === 1 ? "tratamiento seleccionado" : "tratamientos seleccionados"}
            </span>
          </div>

          {/* Pestañas de categorías con Niveles y Extra Pro */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
            {CATEGORIAS.map((cat) => {
              const activa = cat.id === categoriaActiva;
              const IconComp = cat.Icono;
              const cantidadEnCat = SERVICIOS_PLATINUM.filter(
                (s) => s.categoria === cat.id && serviciosSeleccionadosIds.includes(s.id)
              ).length;

              const tieneCubiertos = SERVICIOS_PLATINUM.some(
                (s) => s.categoria === cat.id && getInclusionInfo(s.id, serviciosSeleccionadosIds).isIncluded
              );

              const isExtra = cat.isExtra;

              let botonEstilo = "";
              if (activa) {
                if (isExtra) {
                  botonEstilo = "bg-gradient-to-r from-cyan-400 to-sky-400 text-black border-cyan-300 shadow-[0_4px_22px_rgba(6,182,212,0.4)]";
                } else {
                  botonEstilo = "bg-amber-400 text-black border-amber-300 shadow-[0_4px_18px_rgba(245,158,11,0.28)]";
                }
              } else {
                if (isExtra) {
                  botonEstilo = "bg-gradient-to-br from-[#0a151d] to-[#0f1d28] text-cyan-200 border-cyan-500/50 hover:border-cyan-400 hover:bg-[#132736] shadow-[0_0_15px_rgba(6,182,212,0.15)]";
                } else {
                  botonEstilo = "bg-[#111114] text-neutral-200 border-white/10 hover:border-white/25 hover:bg-[#17171c]";
                }
              }

              return (
                <button
                  key={cat.id}
                  onClick={() => setCategoriaActiva(cat.id)}
                  type="button"
                  className={`w-full flex flex-col justify-between p-3 sm:p-3.5 rounded-2xl text-left transition-all border ${botonEstilo} ${
                    isExtra && !activa ? "col-span-2 sm:col-span-1 lg:col-span-1" : ""
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-2">
                    {/* Badge de Nivel o Extra */}
                    {cat.nivel ? (
                      <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${
                        activa
                          ? "bg-black/20 text-black"
                          : "bg-amber-400/15 text-amber-300 border border-amber-400/25"
                      }`}>
                        {cat.nivel}
                      </span>
                    ) : isExtra ? (
                      <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${
                        activa
                          ? "bg-black/20 text-black"
                          : "bg-cyan-500/20 text-cyan-300 border border-cyan-400/40"
                      }`}>
                        EXTRA PRO
                      </span>
                    ) : null}

                    {/* Contador / Cubierto */}
                    {cantidadEnCat > 0 ? (
                      <span className={`text-xs font-black px-2 py-0.5 rounded-full ${
                        activa ? "bg-black text-amber-400" : isExtra ? "bg-cyan-400 text-black" : "bg-amber-400 text-black"
                      }`}>
                        {cantidadEnCat}
                      </span>
                    ) : tieneCubiertos ? (
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wider ${
                        activa ? "bg-black/30 text-black" : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                      }`}>
                        Cubierto
                      </span>
                    ) : null}
                  </div>

                  <div className="flex items-center gap-2">
                    <IconComp className={`text-base shrink-0 ${
                      activa ? "text-black" : isExtra ? "text-cyan-400" : "text-amber-400"
                    }`} />
                    <span className="font-bold text-xs sm:text-sm tracking-tight leading-snug">{cat.label}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Banner Informativo de Combo Activo */}
          {hasFullDetail && (
            <div className="p-3.5 sm:p-4 rounded-xl bg-gradient-to-r from-amber-500/10 via-[#18181d] to-amber-500/5 border border-amber-400/30 flex items-start sm:items-center gap-3 text-xs sm:text-sm text-neutral-200">
              <LuSparkles className="text-amber-400 text-lg shrink-0 mt-0.5 sm:mt-0" />
              <div className="flex-1 leading-snug">
                <strong className="text-amber-300">Combo Platinum Full Detail activo:</strong> Ya incluye habitáculo a vapor, inyección-succión y pulido exterior de 1 paso. Los tratamientos cubiertos se marcan en <span className="text-emerald-400 font-bold">Verde</span> para evitar cobros dobles. Puedes sumar Faros, Lavado de Motor u otros adicionales abajo.
              </div>
            </div>
          )}
          {hasExpressSale && (
            <div className="p-3.5 sm:p-4 rounded-xl bg-gradient-to-r from-amber-500/10 via-[#18181d] to-amber-500/5 border border-amber-400/30 flex items-start sm:items-center gap-3 text-xs sm:text-sm text-neutral-200">
              <LuSparkles className="text-amber-400 text-lg shrink-0 mt-0.5 sm:mt-0" />
              <div className="flex-1 leading-snug">
                <strong className="text-amber-300">Pack Express Sale activo:</strong> Ya incluye restauración de faros con polímero, limpieza interior y abrillantado express.
              </div>
            </div>
          )}

          {/* Banner de Notificación Dinámica / Acción Inteligente */}
          {notificacion && (
            <div className="p-3.5 sm:p-4 rounded-xl bg-gradient-to-r from-[#1c1c24] via-[#16161b] to-[#1c1c24] border border-amber-400/60 shadow-[0_0_25px_rgba(245,158,11,0.15)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs sm:text-sm text-white">
              <div className="flex items-start sm:items-center gap-2.5">
                <LuSparkles className="text-amber-400 text-base shrink-0 mt-0.5 sm:mt-0" />
                <div>
                  <p className="font-semibold text-neutral-100">{notificacion.texto}</p>
                  {notificacion.subtexto && (
                    <p className="text-neutral-400 text-xs mt-0.5">{notificacion.subtexto}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                {notificacion.accionTexto && notificacion.onAccion && (
                  <button
                    type="button"
                    onClick={notificacion.onAccion}
                    className="px-3 py-1.5 rounded-lg bg-amber-400 text-black font-extrabold text-xs hover:bg-amber-300 transition-colors shadow-sm"
                  >
                    {notificacion.accionTexto}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setNotificacion(null)}
                  className="p-1 text-neutral-400 hover:text-white transition"
                  title="Cerrar aviso"
                >
                  <LuX className="text-base" />
                </button>
              </div>
            </div>
          )}

          {/* Grid de servicios de la categoría activa */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {serviciosDeCategoria.map((s) => {
              const inclusion = getInclusionInfo(s.id, serviciosSeleccionadosIds);
              const isIncluded = inclusion.isIncluded;
              const seleccionado = serviciosSeleccionadosIds.includes(s.id);
              const precioVehiculo = s.precios[vehiculoId];

              return (
                <div
                  key={s.id}
                  onClick={() => toggleServicio(s.id)}
                  className={`rounded-2xl p-6 border cursor-pointer transition-all duration-200 flex flex-col justify-between relative ${
                    isIncluded
                      ? "bg-emerald-950/20 border-emerald-500/50 hover:border-emerald-400/70 shadow-[0_0_24px_rgba(16,185,129,0.12)] ring-1 ring-emerald-500/30"
                      : seleccionado
                      ? "bg-gradient-to-b from-neutral-900 to-[#121215] border-amber-400/80 shadow-[0_0_30px_rgba(245,158,11,0.15)] ring-1 ring-amber-400/50"
                      : "bg-[#111114] border-white/10 hover:border-white/25 hover:bg-[#151518]"
                  }`}
                >
                  {isIncluded ? (
                    <span className="absolute -top-3 right-4 text-[11px] uppercase font-bold tracking-wider px-3 py-1 rounded-full bg-emerald-400 text-black shadow-md flex items-center gap-1.5">
                      <LuCheck className="stroke-[3] text-xs" />
                      Incluido en Combo
                    </span>
                  ) : s.badge ? (
                    <span className="absolute -top-3 right-4 text-[11px] uppercase font-bold tracking-wider px-3 py-1 rounded-full bg-amber-400 text-black shadow-md">
                      {s.badge}
                    </span>
                  ) : null}

                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4 className="text-base sm:text-lg font-bold text-white tracking-tight">
                          {s.nombre}
                        </h4>
                        <p className="text-xs sm:text-sm text-amber-400 font-medium mt-0.5">
                          {s.subtitulo}
                        </p>

                      </div>

                      <div className={`w-6 h-6 rounded-lg border flex items-center justify-center shrink-0 mt-1 transition ${
                        isIncluded
                          ? "bg-emerald-500/20 border-emerald-400 text-emerald-400 shadow-sm"
                          : seleccionado 
                          ? "bg-amber-400 border-amber-400 text-black" 
                          : "border-neutral-500 bg-neutral-900 text-transparent hover:border-neutral-300"
                      }`}>
                        {isIncluded ? (
                          <LuCheck className="text-xs stroke-[3]" />
                        ) : seleccionado ? (
                          <LuCheck className="text-xs stroke-[3]" />
                        ) : (
                          <LuPlus className="text-xs text-neutral-400" />
                        )}
                      </div>
                    </div>

                    <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
                      {s.descripcion}
                    </p>

                    {/* Mensaje de inclusión detallado */}
                    {isIncluded && (
                      <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-xs text-emerald-200 flex items-start gap-2.5">
                        <LuSparkles className="text-emerald-400 shrink-0 text-sm mt-0.5" />
                        <div className="leading-snug">
                          <strong className="text-white block font-bold mb-0.5">Ya cubierto en tu {inclusion.byComboName}</strong>
                          <span className="text-neutral-300">{inclusion.reason}.</span>
                          <span className="block text-emerald-400 font-semibold mt-1 text-[11px] underline">
                            Toca para contratar solo este servicio individual
                          </span>
                        </div>
                      </div>
                    )}

                    <ul className="space-y-2 pt-2 border-t border-white/10">
                      {s.detalles.map((d, i) => (
                        <li key={i} className="text-xs sm:text-sm text-neutral-200 flex items-start gap-2 leading-snug">
                          <span className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${isIncluded ? "bg-emerald-400" : "bg-amber-400"}`} />
                          <span>{d}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-5 mt-5 border-t border-white/10 flex items-baseline justify-between">
                    <span className="text-xs text-neutral-400 uppercase tracking-wider font-semibold">
                      Para {vehiculoActual.label}
                    </span>
                    <div className="text-right">
                      {isIncluded ? (
                        <div className="flex items-center gap-2">
                          <span className="line-through text-neutral-500 text-sm font-semibold">
                            ${precioVehiculo?.toLocaleString("es-MX")}
                          </span>
                          <span className="text-xs sm:text-sm font-extrabold text-emerald-300 bg-emerald-500/20 px-2.5 py-1 rounded-md border border-emerald-500/30 uppercase tracking-wide">
                            Cubierto
                          </span>
                        </div>
                      ) : precioVehiculo ? (
                        <span className="text-2xl sm:text-3xl font-extrabold text-white">
                          ${precioVehiculo.toLocaleString("es-MX")}{" "}
                          <span className="text-xs sm:text-sm font-semibold text-neutral-400">MXN</span>
                        </span>
                      ) : (
                        <span className="text-sm font-semibold text-amber-400">
                          Cotización Previa
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* PASO 3: Complementos & Upgrades Opcionales (Pestaña Desplegable) */}
        <div id="paso-3-complementos" className="space-y-4 pt-2">
          
          {/* Barra de cabecera / Disparador del Acordeón */}
          <div 
            onClick={() => setIsComplementosOpen(!isComplementosOpen)}
            className="w-full bg-[#121216] hover:bg-[#16161c] border border-white/10 hover:border-amber-400/40 p-4 sm:p-5 rounded-2xl transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg group"
          >
            <div className="flex items-start sm:items-center gap-3">
              <span className="flex items-center justify-center w-7 h-7 rounded-full bg-amber-400 text-black text-xs font-black shrink-0 mt-0.5 sm:mt-0 shadow-sm">
                3
              </span>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-sm sm:text-base uppercase tracking-wider text-white font-bold group-hover:text-amber-300 transition">
                    Adicionales & Upgrades Opcionales
                  </h3>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-neutral-300">
                    {COMPLEMENTOS_PLATINUM.length} disponibles
                  </span>
                  {complementosSinDuplicados.length > 0 && (
                    <span className="text-[11px] font-black px-2.5 py-0.5 rounded-full bg-amber-400 text-black shadow-sm">
                      {complementosSinDuplicados.length} añadido{complementosSinDuplicados.length > 1 ? "s" : ""}
                    </span>
                  )}
                </div>
                <p className="text-xs text-neutral-400 mt-1">
                  Faros con polímero, motor a vapor, protección de asientos, cerámicos en rines y más.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 shrink-0 self-end sm:self-center">
              <span className="text-xs font-bold text-amber-400 group-hover:underline">
                {isComplementosOpen ? "Ocultar adicionales" : "Ver adicionales"}
              </span>
              <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-neutral-300 group-hover:text-amber-400 group-hover:border-amber-400/40 transition">
                {isComplementosOpen ? <LuChevronUp className="text-base" /> : <LuChevronDown className="text-base" />}
              </div>
            </div>
          </div>

          {/* Contenido Desplegable */}
          {isComplementosOpen && (
            <div className="space-y-4 pt-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {complementosOrdenados.map((comp) => {
                  const isFaros = comp.id === "faros-addon";
                  const isFarosCubierto = isFaros && hasExpressSale;
                  const isCeramicoInterior = comp.id === "ceramico-interior-integral";
                  const seleccionado = isFarosCubierto
                    ? true
                    : isCeramicoInterior
                    ? (complementosSeleccionados.includes("ceramico-interior-integral") || serviciosSeleccionadosIds.includes("ceramico-interior-integral-servicio"))
                    : complementosSeleccionados.includes(comp.id);

                  const precio = getPrecioComplemento(comp);

                  return (
                    <div
                      key={comp.id}
                      onClick={() => toggleComplemento(comp.id)}
                      className={`p-4 sm:p-5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                        seleccionado
                          ? "bg-amber-400/15 border-amber-400/70 text-white shadow-md ring-1 ring-amber-400/40"
                          : "bg-[#111114] border-white/10 hover:border-white/25 hover:bg-[#16161a] text-neutral-200"
                      }`}
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2.5">
                          <p className="text-sm sm:text-base font-bold text-white leading-tight">
                            {comp.nombre}
                          </p>
                          <div className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 ${
                            seleccionado
                              ? "bg-amber-400 border-amber-400 text-black"
                              : "border-neutral-500 bg-neutral-900"
                          }`}>
                            {seleccionado ? <LuCheck className="text-xs stroke-[3]" /> : <LuPlus className="text-xs text-neutral-400" />}
                          </div>
                        </div>
                        <p className="text-xs sm:text-sm text-neutral-300 leading-snug mt-2 line-clamp-2">
                          {comp.descripcion}
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
                        <span className={`text-xs uppercase tracking-wider font-semibold ${
                          isFarosCubierto ? "text-emerald-400" : "text-neutral-400"
                        }`}>
                          {isFarosCubierto ? "✨ Ya Incluido" : comp.categoriaTipo === "ceramico" ? "Upgrade" : "Adicional"}
                        </span>
                        <span className={`text-sm sm:text-base font-extrabold ${
                          isFarosCubierto ? "text-emerald-400 text-xs sm:text-sm" : "text-amber-400"
                        }`}>
                          {isFarosCubierto ? "Incluido en Pack Express" : `+$${precio.toLocaleString("es-MX")} MXN`}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Botón sutil al pie para replegar si ya terminó */}
              <div className="flex justify-center pt-2">
                <button
                  type="button"
                  onClick={() => setIsComplementosOpen(false)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-neutral-400 hover:text-white bg-white/5 border border-white/10 hover:border-white/20 transition cursor-pointer"
                >
                  <LuChevronUp className="text-sm" />
                  <span>Cerrar pestaña de adicionales</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* PASO 4: Resumen de Cotización & Botón a WhatsApp */}
        <div ref={resumenRef} id="resumen-cotizacion" className="bg-gradient-to-r from-[#141418] via-[#18181f] to-[#141418] rounded-3xl p-6 sm:p-10 border border-white/15 shadow-2xl relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Columna Izquierda: Desglose Completo */}
            <div className="lg:col-span-7 space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-white/5 border border-white/10 text-xs sm:text-sm font-bold text-neutral-200 tracking-wider uppercase">
                Resumen de tu Cotización ({serviciosSeleccionados.length + complementosSeleccionados.filter(id => {
                  if (id === "motor-addon" && serviciosSeleccionadosIds.includes("lavado-motor")) return false;
                  if (id === "ceramico-interior-integral" && serviciosSeleccionadosIds.includes("ceramico-interior-integral-servicio")) return false;
                  return true;
                }).length} ítems)
              </div>
              
              <div className="space-y-3">
                <div className="flex items-baseline justify-between border-b border-white/10 pb-2.5">
                  <span className="text-xs sm:text-sm font-medium text-neutral-400">Vehículo:</span>
                  <span className="text-sm sm:text-base font-bold text-white">{vehiculoActual.label}</span>
                </div>

                {/* Lista de tratamientos principales seleccionados */}
                <div className="space-y-2 border-b border-white/10 pb-3">
                  <span className="text-xs sm:text-sm font-medium text-neutral-400 block">Tratamientos elegidos:</span>
                  {serviciosSeleccionados.length === 0 ? (
                    <p className="text-sm text-amber-400/90 italic">
                      Selecciona al menos un tratamiento arriba para calcular el total.
                    </p>
                  ) : (
                    serviciosSeleccionados.map((s) => (
                      <div key={s.id} className="py-2 border-b border-white/5 last:border-b-0">
                        <div className="flex items-center justify-between text-sm sm:text-base">
                          <span className="text-white font-medium flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
                            {s.nombre}
                          </span>
                          <div className="flex items-center gap-3">
                            <span className="text-amber-400 font-bold">
                              ${getPrecioServicio(s).toLocaleString("es-MX")} MXN
                            </span>
                            <button
                              type="button"
                              onClick={() => quitarServicio(s.id)}
                              className="text-neutral-400 hover:text-red-400 transition p-1"
                              title="Quitar tratamiento"
                            >
                              <LuTrash2 className="text-sm" />
                            </button>
                          </div>
                        </div>
                        {s.id === "full-detail" && (
                          <p className="text-xs text-neutral-400 pl-4 mt-1 leading-snug">
                            ↳ Incluye habitáculo a vapor, inyección-succión, pulido 1 paso y sellador cerámico
                          </p>
                        )}
                        {s.id === "express-sale" && (
                          <p className="text-xs text-neutral-400 pl-4 mt-1 leading-snug">
                            ↳ Incluye restauración de faros con polímero, interiores y abrillantado express
                          </p>
                        )}
                      </div>
                    ))
                  )}
                </div>

                {/* Complementos */}
                {complementosSeleccionados.filter(id => {
                  if (id === "motor-addon" && serviciosSeleccionadosIds.includes("lavado-motor")) return false;
                  if (id === "ceramico-interior-integral" && serviciosSeleccionadosIds.includes("ceramico-interior-integral-servicio")) return false;
                  return true;
                }).length > 0 && (
                  <div className="pt-1 space-y-1.5">
                    <span className="text-xs sm:text-sm font-medium text-neutral-400 block">
                      Complementos & Upgrades ({complementosSeleccionados.filter(id => {
                        if (id === "motor-addon" && serviciosSeleccionadosIds.includes("lavado-motor")) return false;
                        if (id === "ceramico-interior-integral" && serviciosSeleccionadosIds.includes("ceramico-interior-integral-servicio")) return false;
                        return true;
                      }).length}):
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {complementosSeleccionados
                        .filter(id => {
                          if (id === "motor-addon" && serviciosSeleccionadosIds.includes("lavado-motor")) return false;
                          if (id === "ceramico-interior-integral" && serviciosSeleccionadosIds.includes("ceramico-interior-integral-servicio")) return false;
                          return true;
                        })
                        .map((id) => {
                          const c = COMPLEMENTOS_PLATINUM.find((item) => item.id === id);
                          if (!c) return null;
                          return (
                            <span key={id} className="text-xs sm:text-sm font-medium px-3 py-1 rounded-lg bg-white/5 border border-white/15 text-neutral-200 flex items-center gap-2">
                              <span>{c.nombre} (+${getPrecioComplemento(c).toLocaleString("es-MX")} MXN)</span>
                              <button
                                type="button"
                                onClick={() => toggleComplemento(id)}
                                className="text-neutral-400 hover:text-red-400 transition"
                                title="Quitar complemento"
                              >
                                <LuX className="text-xs" />
                              </button>
                            </span>
                          );
                        })}
                    </div>
                  </div>
                )}
              </div>



              <p className="text-xs sm:text-sm text-neutral-400 flex items-center gap-2 pt-1">
                <LuInfo className="text-amber-400 text-sm shrink-0" />
                <span>Precios referenciales oficiales de Platinum. Servicio realizado 100% a domicilio en Querétaro con equipo profesional.</span>
              </p>
            </div>

            {/* Columna Derecha: Total & CTA */}
            <div className="lg:col-span-5 bg-black/60 rounded-2xl p-6 sm:p-8 border border-white/10 flex flex-col justify-center items-center text-center space-y-5">
              <div>
                <span className="text-xs sm:text-sm uppercase tracking-widest text-neutral-400 font-semibold">Total Estimado</span>
                {totalEstimado > 0 ? (
                  <div className="text-3xl sm:text-5xl font-black text-white mt-1.5">
                    ${totalEstimado.toLocaleString("es-MX")}{" "}
                    <span className="text-sm sm:text-base font-bold text-amber-400">MXN</span>
                  </div>
                ) : (
                  <div className="text-xl sm:text-2xl font-bold text-amber-400 mt-1.5">
                    Elige tus tratamientos
                  </div>
                )}
              </div>

              {/* CAMPO DE ZONA / FRACCIONAMIENTO INTEGRADO */}
              {totalEstimado > 0 && (
                <div id="campo-zona-paso4" className="w-full text-left space-y-2 pt-1 pb-1">
                  <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-400">
                    <LuMapPin className="text-amber-400 text-sm shrink-0" />
                    <span>Tu fraccionamiento o zona en Querétaro:</span>
                  </label>
                  <input
                    ref={zonaInputRef}
                    type="text"
                    value={zonaCliente}
                    onChange={(e) => {
                      setZonaCliente(e.target.value);
                      if (zonaError) setZonaError(false);
                    }}
                    placeholder="Ej: Zibatá, Zákia, El Campanario..."
                    className={`w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border text-sm text-white placeholder:text-neutral-500 focus:outline-none transition-all ${
                      zonaError
                        ? "border-red-500/80 ring-2 ring-red-500/30 bg-red-950/20"
                        : "border-white/15 focus:border-amber-400/80 focus:ring-1 focus:ring-amber-400/50"
                    }`}
                  />
                  {zonaError && (
                    <p className="text-xs text-red-400 font-medium pt-0.5">
                      * Indícanos tu zona o fraccionamiento para coordinar la visita a domicilio.
                    </p>
                  )}
                  {/* Chips rápidos de Querétaro */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {ZONAS_QUERETARO.map((z) => {
                      const activa = zonaCliente.toLowerCase().trim() === z.toLowerCase().trim();
                      return (
                        <button
                          key={z}
                          type="button"
                          onClick={() => {
                            setZonaCliente(z);
                            if (zonaError) setZonaError(false);
                          }}
                          className={`text-[11px] px-2.5 py-1 rounded-full border transition-all ${
                            activa
                              ? "bg-amber-400 text-black border-amber-300 font-bold shadow-sm"
                              : "bg-white/5 text-neutral-300 border-white/10 hover:border-amber-400/50 hover:text-white"
                          }`}
                        >
                          {z}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={handlePaso4WhatsApp}
                className="w-full inline-flex items-center justify-center gap-3 px-6 py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-black font-extrabold text-sm sm:text-base tracking-wide transition-all shadow-[0_4px_25px_rgba(16,185,129,0.3)] hover:scale-[1.02] active:scale-[0.99] cursor-pointer"
              >
                <FaWhatsapp className="text-xl" />
                <span>{totalEstimado > 0 ? "Agendar Cita con este Presupuesto" : "Consultar Disponibilidad por WhatsApp"}</span>
              </button>

              <span className="text-xs sm:text-sm text-neutral-400">
                Atención directa por WhatsApp con Edgar · Respuesta ágil
              </span>
            </div>

          </div>
        </div>

      </div>

      {/* QUICK ZONE DRAWER / MODAL: Cuando se presiona desde la barra flotante y aún no ingresó zona */}
      {showZoneDrawer && (
        <div 
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setShowZoneDrawer(false)}
        >
          <div 
            className="w-full sm:max-w-md bg-[#16161c] border border-amber-500/30 rounded-t-3xl sm:rounded-3xl p-6 sm:p-7 shadow-[0_-10px_40px_rgba(0,0,0,0.95)] space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400">
                  <LuMapPin className="text-lg" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">¿En qué zona estás?</h3>
                  <p className="text-xs text-neutral-400">Servicio 100% a domicilio en Querétaro</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowZoneDrawer(false)}
                className="p-1.5 rounded-full text-neutral-400 hover:text-white hover:bg-white/10 transition"
              >
                <LuX className="text-lg" />
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-neutral-300 block">
                Selecciona tu fraccionamiento o privada:
              </label>
              <div className="flex flex-wrap gap-1.5">
                {ZONAS_QUERETARO.map((z) => {
                  const activa = zonaCliente.toLowerCase().trim() === z.toLowerCase().trim();
                  return (
                    <button
                      key={z}
                      type="button"
                      onClick={() => setZonaCliente(z)}
                      className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                        activa
                          ? "bg-amber-400 text-black border-amber-300 font-bold shadow-md"
                          : "bg-white/5 text-neutral-300 border-white/10 hover:border-amber-400/40 hover:text-white"
                      }`}
                    >
                      {z}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-300 block">
                O escribe tu colonia específica:
              </label>
              <input
                type="text"
                value={zonaCliente}
                onChange={(e) => setZonaCliente(e.target.value)}
                placeholder="Ej: Cumbres del Lago, Jurica, Vista Hermosa..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-white/15 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                autoFocus
              />
            </div>

            <div className="pt-2 space-y-2">
              <button
                type="button"
                disabled={!zonaCliente.trim()}
                onClick={() => {
                  setShowZoneDrawer(false);
                  window.open(whatsAppUrl, "_blank", "noopener,noreferrer");
                }}
                className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm sm:text-base flex items-center justify-center gap-2 transition-all shadow-lg ${
                  zonaCliente.trim()
                    ? "bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-black shadow-emerald-500/25 cursor-pointer hover:scale-[1.01]"
                    : "bg-neutral-800 text-neutral-500 border border-white/5 cursor-not-allowed"
                }`}
              >
                <FaWhatsapp className="text-lg" />
                <span>Confirmar y Enviar a WhatsApp</span>
              </button>
              <p className="text-[11px] text-center text-neutral-500">
                Total estimado: ${totalEstimado.toLocaleString("es-MX")} MXN · {vehiculoActual.label}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* BARRA FLOTANTE INFERIOR INTELIGENTE (Visible cuando hay servicios y Paso 4 no está en pantalla) */}
      {serviciosSeleccionados.length > 0 && (
        <aside
          aria-label="Resumen flotante de cotización"
          className={`fixed bottom-0 left-0 right-0 z-40 transition-all duration-300 ease-out ${
            isResumenVisible
              ? "translate-y-full opacity-0 pointer-events-none"
              : "translate-y-0 opacity-100"
          }`}
        >
          <div className="bg-[#121217]/95 backdrop-blur-xl border-t border-amber-500/25 shadow-[0_-10px_35px_rgba(0,0,0,0.85)] px-4 py-3 sm:py-3.5">
            <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
              {/* Info y Total */}
              <div 
                onClick={() => {
                  if (resumenRef.current) {
                    resumenRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
                  }
                }}
                className="cursor-pointer group flex flex-col justify-center min-w-0"
              >
                <div className="flex items-baseline gap-1.5">
                  <span className="text-lg sm:text-2xl font-black text-white tracking-tight">
                    ${totalEstimado.toLocaleString("es-MX")}
                  </span>
                  <span className="text-xs font-bold text-amber-400">MXN</span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-neutral-400 truncate">
                  <span>{serviciosSeleccionados.length} servicio{serviciosSeleccionados.length > 1 ? "s" : ""}</span>
                  <span>·</span>
                  <span>{vehiculoActual.label}</span>
                  {zonaCliente.trim() ? (
                    <>
                      <span>·</span>
                      <span className="text-amber-300 font-medium truncate">📍 {zonaCliente.trim()}</span>
                    </>
                  ) : (
                    <span className="hidden sm:inline text-amber-400/80 group-hover:text-amber-300 transition ml-1">
                      (Ver desglose ▾)
                    </span>
                  )}
                </div>
              </div>

              {/* Botón CTA a WhatsApp */}
              <button
                type="button"
                onClick={handleStickyCtaClick}
                className="shrink-0 inline-flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-black font-extrabold text-xs sm:text-sm tracking-wide shadow-[0_4px_20px_rgba(16,185,129,0.35)] hover:scale-105 active:scale-95 transition-all cursor-pointer"
              >
                <FaWhatsapp className="text-base sm:text-lg" />
                <span>{zonaCliente.trim() ? "Agendar Cita" : "Pedir Cita"}</span>
              </button>
            </div>
          </div>
        </aside>
      )}
    </section>
  );
}
