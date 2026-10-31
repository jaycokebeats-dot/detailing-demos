"use client";

import { useState, useMemo, useEffect } from "react";
import { FaCarSide, FaTruckPickup, FaVanShuttle, FaWhatsapp } from "react-icons/fa6";
import { 
  LuSparkles, 
  LuShieldCheck, 
  LuDroplets, 
  LuSun, 
  LuWrench, 
  LuCheck, 
  LuPlus, 
  LuClock, 
  LuInfo 
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

export interface ServicioBase {
  id: string;
  categoria: "combos" | "interiores" | "correccion" | "mantenimiento" | "faros";
  nombre: string;
  subtitulo: string;
  descripcion: string;
  badge?: string;
  duracionEstimada: string;
  detalles: string[];
  precios: Record<VehiculoId, number | null>;
}

// Catálogo Oficial Actualizado (Versión 3.4 sin Interior Care ni Essential Care)
export const SERVICIOS_PLATINUM: ServicioBase[] = [
  // --- COMBOS ESTRELLA ---
  {
    id: "full-detail",
    categoria: "combos",
    nombre: "Platinum Full Detail",
    subtitulo: "Renovación Integral Interior & Exterior",
    descripcion: "El tratamiento insignia a domicilio. Desinfección integral a vapor e inyección-succión en vestiduras y alfombras, pulido de 1 paso y sellador cerámico exterior.",
    badge: "Más Solicitado",
    duracionEstimada: "4 a 6 horas",
    detalles: [
      "Lavado profundo de asientos (inyección-succión tela o nutrición piel)",
      "Extracción profunda en alfombras, tapetes y cajuela",
      "Sanitización por vapor en ductos de A/C y habitáculo",
      "Acondicionamiento y restauración de plásticos UV (hasta 1 año)",
      "Lavado técnico exterior con cañón de espuma y descontaminado con Clay bar",
      "Pulido a máquina de 1 paso (elimina 50% a 70% de microrrayones y swirls)",
      "Sellador sintético cerámico exterior (hasta 3 meses de protección)",
      "Detallado de rines, tolvas y acabado alto brillo en llantas",
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
    descripcion: "Diseñado para incrementar el valor de reventa de tu auto. Incluye restauración completa de faros, limpieza interior y abrillantado exterior express.",
    badge: "Especial Venta",
    duracionEstimada: "3 a 4 horas",
    detalles: [
      "Restauración completa de ambos faros con polímero de vapor óptico",
      "Lavado de asientos por inyección-succión (eliminación de manchas visibles)",
      "Aspirado profundo de habitáculo, cajuela y detallado de tablero con brochas",
      "Acondicionador satinado con renovación de tono en plásticos",
      "Lavado técnico a presión con pH neutro y descontaminado rápido",
      "Abrillantado All-In-One a máquina (elimina opacidad y sella con alto brillo)",
      "Detallado y abrillantado de rines y neumáticos",
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
    descripcion: "Limpieza exhaustiva del habitáculo. Ideal para eliminar suciedad profunda, ácaros, bacterias y manchas difíciles en asientos, alfombras y cajuela.",
    badge: "Desinfección Total",
    duracionEstimada: "3 a 4 horas",
    detalles: [
      "Inyección-succión en vestiduras de tela o nutrición profunda en piel",
      "Tratamiento y extracción profunda en alfombras, tapetes y cajuela",
      "Sanitización por vapor en ductos de aire acondicionado y superficies",
      "Detallado manual con brochas en consola, volante, rejillas y puertas",
      "Acondicionamiento y protección UV en plásticos interiores (hasta 1 año)",
      "Limpieza técnica de cortesía en cielo del auto",
      "Lavado exterior básico de cortesía para entrega impecable",
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
    subtitulo: "Sistema Inyección-Succión & Limpieza Pro",
    descripcion: "Lavado profesional de vestiduras y plásticos interiores con lavado exterior de cortesía.",
    duracionEstimada: "2.5 a 3.5 horas",
    detalles: [
      "Lavado profundo en asientos con máquina de inyección-succión (tela o piel)",
      "Aspirado exhaustivo de habitáculo y cajuela completa",
      "Restauración y acondicionador UV en tablero y consolas (hasta 6 meses)",
      "Detallado con brochas en volante, puertas y portavasos",
      "Lavado exterior con shampoo pH neutro y cera líquida protectora (1 mes)",
      "Detallado de rines y llantas con acabado alto brillo",
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
    subtitulo: "Corrección Profunda & Protección Cerámica 9H",
    descripcion: "Máxima protección de carrocería. Descontaminado con clay bar, corrección de pintura en 2 pasos y sellado nanocerámico 9H bajo carpa móvil climatizada.",
    badge: "Máxima Gama",
    duracionEstimada: "6 a 8 horas",
    detalles: [
      "Lavado a presión con pH neutro y descontaminado físico (clay bar) y químico",
      "Trabajo técnico bajo carpa móvil con paredes para control de polvo y temperatura",
      "Corrección de pintura en 2 pasos (corte pesado + refinado espejo)",
      "Desengrasado completo de la pintura con alcohol isopropílico (IPA)",
      "Aplicación de Recubrimiento Nanocerámico 9H (1 a 2 años de duración)",
      "Máxima hidrofobia (efecto gota), repelencia de suciedad y protección UV",
      "Descontaminado profundo de rines y detallado alto brillo en neumáticos",
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
    id: "titanium-shine",
    categoria: "correccion",
    nombre: "Titanium Shine",
    subtitulo: "Pulido a 2 Pasos & Refinado Espejo",
    descripcion: "Elimina entre 80% y 90% de microrrayones, marcas circulares y opacidad. Deja un reflejo espejo profundo protegido con sellador híbrido SiO2.",
    badge: "Efecto Espejo",
    duracionEstimada: "4 a 5 horas",
    detalles: [
      "Descontaminado químico y físico completo con clay bar",
      "Trabajo bajo carpa móvil acondicionada para detallado profesional",
      "Paso 1: Corte pesado para eliminar rayones y marcas de lavado",
      "Paso 2: Refinado a máquina para máxima claridad y brillo espejo",
      "Sellador híbrido cerámico SiO2 en spray (4 a 6 meses de duración)",
      "Descontaminado de rines, limpieza de tolvas y acondicionado de llantas",
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
    descripcion: "Recupera la profundidad y vida del color eliminando entre 50% y 70% de microrrayones leves. Incluye sellador sintético.",
    duracionEstimada: "3 a 4 horas",
    detalles: [
      "Pre-lavado con cañón de espuma y descontaminado rápido de pintura",
      "Pulido técnico a máquina de 1 paso para recuperar brillo profundo",
      "Protección con sellador sintético / cera híbrida (hasta 3 meses)",
      "Limpieza técnica de rines, tolvas y llantas con acabado negro alto brillo",
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
    categoria: "mantenimiento",
    nombre: "Diamond Protect",
    subtitulo: "Detallado de Precisión & Sellador Cerámico",
    descripcion: "Tratamiento exterior con descontaminado químico y sellador cerámico de 3 meses, más acondicionamiento interior.",
    badge: "Sellador Cerámico",
    duracionEstimada: "2 a 2.5 horas",
    detalles: [
      "Pre-lavado con cañón de espuma y lavado técnico a presión",
      "Descontaminado químico de pintura y sellador cerámico (3 meses)",
      "Descontaminado profundo de rines y abrillantado de llantas (2-3 semanas)",
      "Limpieza y acondicionamiento especializado de asientos de piel o vinil",
      "Tratamiento restaurador UV en plásticos de tablero y consolas (hasta 1 año)",
      "Aspirado profundo de habitáculo y cajuela",
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
    categoria: "mantenimiento",
    nombre: "Hydro Gloss",
    subtitulo: "Brillo & Hidrofobia | Mantenimiento Express",
    descripcion: "Sellador hidrofóbico y anti-polvo con duración de 30 días, pre-lavado con cañón de espuma y limpieza interior.",
    badge: "Hidrofóbico",
    duracionEstimada: "1.5 a 2 horas",
    detalles: [
      "Lavado técnico a presión con cañón de espuma",
      "Sellador hidrofóbico y anti-polvo de carrocería (hasta 30 días)",
      "Descontaminado ligero de rines y llantas de alto brillo",
      "Limpieza rápida y acondicionador UV para asientos de piel/vinil",
      "Acondicionado de plásticos interiores y aspirado de habitáculo",
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
    subtitulo: "Mantenimiento Regular & Brillo Profundo",
    descripcion: "Lavado técnico anti-rayones, shampoo con cera y sellado rápido de hasta 15 días con detallado de plásticos y rines.",
    duracionEstimada: "1.5 horas",
    detalles: [
      "Pre-lavado y lavado técnico a presión con método anti-rayones",
      "Lavado con shampoo con cera + aplicación de cera rápida (15 días)",
      "Limpieza técnica de rines, tolvas y acabado alto brillo en llantas",
      "Acondicionado efecto mate para tablero y puertas con filtro UV",
      "Limpieza de cristales interiores/exteriores y aspirado completo",
    ],
    precios: {
      auto: 420,
      suv2: 470,
      pickup: 520,
      suv3: 630,
      van: 890,
    },
  },

  // --- RESTAURACIÓN DE FAROS ---
  {
    id: "faros",
    categoria: "faros",
    nombre: "Restauración de Faros con Polímero",
    subtitulo: "Tratamiento Óptico con 6 Meses de Garantía",
    descripcion: "Elimina por completo el tono amarillo, quemado y opacidad de los faros delanteros. Recupera hasta 40% más de iluminación nocturna mediante polímero de vapor.",
    badge: "6 Meses de Garantía",
    duracionEstimada: "1.5 horas",
    detalles: [
      "Lijado graduado técnico en ambos faros delanteros",
      "Tratamiento restaurador con polímero de vapor óptico de alta transparencia",
      "Garantía escrita de 6 meses contra amarillamiento",
      "Recupera la estética de agencia y máxima visibilidad nocturna",
    ],
    precios: {
      auto: 650,
      suv2: 750,
      pickup: 750,
      suv3: 750,
      van: 750,
    },
  },
];

// Complementos y Upgrades (Páginas 13-15 del catálogo 3.4)
export interface Complemento {
  id: string;
  nombre: string;
  descripcion: string;
  categoriaTipo: "interior" | "cristales" | "exterior" | "condicion";
  precioTipo: "fijo" | "variable";
  precioFijo?: number;
  preciosVariables?: Record<VehiculoId, number>;
}

export const COMPLEMENTOS_PLATINUM: Complemento[] = [
  {
    id: "pelo-mascota",
    nombre: "Extracción Técnica de Pelo de Mascota",
    descripcion: "Eliminación profunda de pelos incrustados en alfombras, vestiduras y pliegues.",
    categoriaTipo: "condicion",
    precioTipo: "variable",
    preciosVariables: {
      auto: 250,
      suv2: 350,
      pickup: 350,
      suv3: 500,
      van: 750,
    },
  },
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
  {
    id: "lodo-critico",
    nombre: "Remoción de Lodo Crítico / Tierra Severa",
    descripcion: "Desincrustado técnico para camionetas o autos con acumulación densa de lodo.",
    categoriaTipo: "condicion",
    precioTipo: "variable",
    preciosVariables: {
      auto: 350,
      suv2: 500,
      pickup: 500,
      suv3: 700,
      van: 900,
    },
  },
  {
    id: "cuidado-piel",
    nombre: "Humectación & Cuidado de Piel Premium",
    descripcion: "Tratamiento con bálsamos hidratantes que previenen grietas y resequedad.",
    categoriaTipo: "interior",
    precioTipo: "variable",
    preciosVariables: {
      auto: 290,
      suv2: 390,
      pickup: 390,
      suv3: 490,
      van: 490,
    },
  },
  {
    id: "fragancia",
    nombre: "Fragancia Premium de Larga Duración",
    descripcion: "Aroma exclusivo de fijación extendida aplicado directamente en alfombras.",
    categoriaTipo: "interior",
    precioTipo: "fijo",
    precioFijo: 160,
  },
];

interface CategoriaTab {
  id: "combos" | "interiores" | "correccion" | "mantenimiento" | "faros";
  label: string;
  badge?: string;
  Icono: React.ComponentType<{ className?: string }>;
}

const CATEGORIAS: CategoriaTab[] = [
  { id: "combos", label: "Combos Completos", badge: "Recomendado", Icono: LuSparkles },
  { id: "interiores", label: "Interiores & Vapor", Icono: LuDroplets },
  { id: "correccion", label: "Corrección & Cerámico", Icono: LuShieldCheck },
  { id: "mantenimiento", label: "Mantenimiento Express", Icono: LuSun },
  { id: "faros", label: "Restauración de Faros", Icono: LuWrench },
];

export default function CotizadorPlatinum({ biz }: { biz: Business }) {
  const [vehiculoId, setVehiculoId] = useState<VehiculoId>("suv2");
  const [categoriaActiva, setCategoriaActiva] = useState<CategoriaTab["id"]>("combos");
  const [servicioSeleccionadoId, setServicioSeleccionadoId] = useState<string>("full-detail");
  const [complementosSeleccionados, setComplementosSeleccionados] = useState<string[]>([]);

  useEffect(() => {
    const handleSelectService = (event: CustomEvent<{ servicioId?: string; categoria?: string }>) => {
      const { servicioId, categoria } = event.detail || {};
      if (servicioId) {
        const found = SERVICIOS_PLATINUM.find((s) => s.id === servicioId);
        if (found) {
          setCategoriaActiva(found.categoria);
          setServicioSeleccionadoId(found.id);
        }
      } else if (categoria) {
        setCategoriaActiva(categoria as CategoriaTab["id"]);
      }
    };

    window.addEventListener("platinum:cotizar", handleSelectService as EventListener);
    return () => window.removeEventListener("platinum:cotizar", handleSelectService as EventListener);
  }, []);

  const vehiculoActual = useMemo(
    () => TIPOS_VEHICULO.find((v) => v.id === vehiculoId) || TIPOS_VEHICULO[1],
    [vehiculoId]
  );

  const servicioActual = useMemo(
    () => SERVICIOS_PLATINUM.find((s) => s.id === servicioSeleccionadoId) || SERVICIOS_PLATINUM[0],
    [servicioSeleccionadoId]
  );

  const serviciosDeCategoria = useMemo(
    () => SERVICIOS_PLATINUM.filter((s) => s.categoria === categoriaActiva),
    [categoriaActiva]
  );

  const cambiarCategoria = (catId: CategoriaTab["id"]) => {
    setCategoriaActiva(catId);
    const primerServicio = SERVICIOS_PLATINUM.find((s) => s.categoria === catId);
    if (primerServicio) {
      setServicioSeleccionadoId(primerServicio.id);
    }
  };

  const toggleComplemento = (id: string) => {
    setComplementosSeleccionados((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const precioBaseActual = useMemo(() => {
    const p = servicioActual.precios[vehiculoId];
    return p ?? 0;
  }, [servicioActual, vehiculoId]);

  const getPrecioComplemento = (c: Complemento): number => {
    if (c.precioTipo === "fijo") return c.precioFijo ?? 0;
    return c.preciosVariables?.[vehiculoId] ?? 0;
  };

  const totalEstimado = useMemo(() => {
    const totalComplementos = complementosSeleccionados.reduce((acc, id) => {
      const c = COMPLEMENTOS_PLATINUM.find((item) => item.id === id);
      return acc + (c ? getPrecioComplemento(c) : 0);
    }, 0);
    return precioBaseActual + totalComplementos;
  }, [precioBaseActual, complementosSeleccionados, vehiculoId]);

  const whatsAppUrl = useMemo(() => {
    const waNumber = (biz.whatsapp || "524427151535").replace(/\D/g, "");
    
    const lineasComplementos = complementosSeleccionados
      .map((id) => {
        const c = COMPLEMENTOS_PLATINUM.find((item) => item.id === id);
        if (!c) return null;
        return `  - ${c.nombre} (+$${getPrecioComplemento(c).toLocaleString("es-MX")} MXN)`;
      })
      .filter(Boolean)
      .join("\n");

    const bloqueComplementos = lineasComplementos 
      ? `\n*Complementos agregados:*\n${lineasComplementos}` 
      : "";

    const mensaje = `Hola Platinum Detallado Automotriz.
Estuve cotizando en su sitio web para un servicio a domicilio en Querétaro:

*Vehículo:* ${vehiculoActual.label} (${vehiculoActual.ejemplos})
*Tratamiento principal:* ${servicioActual.nombre} ($${precioBaseActual.toLocaleString("es-MX")} MXN)${bloqueComplementos}

*Total estimado:* $${totalEstimado.toLocaleString("es-MX")} MXN

¿Qué fechas y horarios tienen disponibles para agendar la visita en mi domicilio?`;

    return `https://wa.me/${waNumber}?text=${encodeURIComponent(mensaje)}`;
  }, [biz, vehiculoActual, servicioActual, precioBaseActual, complementosSeleccionados, totalEstimado]);

  return (
    <section 
      id="cotizador" 
      className="relative px-4 sm:px-8 py-24 bg-[#0a0a0c] text-white border-t border-b border-white/10 overflow-hidden"
    >
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-amber-500/5 blur-[140px] pointer-events-none rounded-full" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[300px] bg-emerald-500/5 blur-[120px] pointer-events-none rounded-full" />

      <div className="max-w-6xl mx-auto space-y-12 relative z-10">
        
        {/* Cabecera Principal */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/15 text-xs font-medium tracking-wide text-neutral-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Cotizador Oficial en Vivo · Catálogo Actualizado
          </div>
          <h2 className="text-3xl sm:text-5xl font-semibold tracking-tight text-white">
            Cotiza tu Detallado en <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-500">30 Segundos</span>
          </h2>
          <p className="text-sm sm:text-base text-neutral-400">
            Selecciona tu vehículo, elige el nivel de protección o renovación y suma complementos si lo requieres. Precios transparentes con servicio 100% a domicilio en Querétaro.
          </p>
        </div>

        {/* PASO 1: Selector de Tipo de Vehículo */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs uppercase tracking-widest text-neutral-400 font-semibold flex items-center gap-2">
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-white/10 text-white text-[11px] font-bold">1</span>
              Selecciona el tipo de vehículo
            </h3>
            <span className="text-xs text-neutral-500 hidden sm:inline">El tamaño ajusta los insumos y tiempos de trabajo</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {TIPOS_VEHICULO.map((v) => {
              const activo = v.id === vehiculoId;
              const IconComp = v.Icono;
              return (
                <button
                  key={v.id}
                  onClick={() => setVehiculoId(v.id)}
                  type="button"
                  className={`text-left p-4 rounded-2xl border transition-all duration-200 flex flex-col justify-between min-h-[110px] ${
                    activo
                      ? "bg-gradient-to-b from-amber-500/15 to-neutral-900 border-amber-400/60 shadow-[0_0_20px_rgba(245,158,11,0.15)] ring-1 ring-amber-400/40"
                      : "bg-[#111114] border-white/10 hover:border-white/25 hover:bg-[#16161a]"
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <IconComp className={`text-xl ${activo ? "text-amber-400" : "text-neutral-400"}`} />
                    {activo && (
                      <span className="w-5 h-5 rounded-full bg-amber-400 text-black flex items-center justify-center text-xs font-bold">
                        <LuCheck className="stroke-[3]" />
                      </span>
                    )}
                  </div>
                  <div className="mt-2">
                    <p className={`text-sm font-semibold leading-tight ${activo ? "text-white" : "text-neutral-200"}`}>
                      {v.label}
                    </p>
                    <p className="text-[11px] text-neutral-400 line-clamp-1 mt-0.5">
                      {v.ejemplos}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* PASO 2: Categorías de Servicio y Tarjetas */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xs uppercase tracking-widest text-neutral-400 font-semibold flex items-center gap-2">
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-white/10 text-white text-[11px] font-bold">2</span>
              Elige el servicio o combo principal
            </h3>
            <span className="text-xs text-neutral-500 hidden sm:inline">Todos los precios se actualizan según tu vehículo</span>
          </div>

          {/* Pestañas de categorías */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {CATEGORIAS.map((cat) => {
              const activa = cat.id === categoriaActiva;
              const IconComp = cat.Icono;
              return (
                <button
                  key={cat.id}
                  onClick={() => cambiarCategoria(cat.id)}
                  type="button"
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition-all border ${
                    activa
                      ? "bg-amber-400 text-black font-semibold border-amber-300 shadow-[0_4px_16px_rgba(245,158,11,0.25)]"
                      : "bg-[#111114] text-neutral-300 border-white/10 hover:border-white/20 hover:bg-[#17171c]"
                  }`}
                >
                  <IconComp className={`text-base ${activa ? "text-black" : "text-amber-400/80"}`} />
                  <span>{cat.label}</span>
                  {cat.badge && !activa && (
                    <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-white/10 text-neutral-300 ml-1">
                      {cat.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Grid de servicios de la categoría activa */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {serviciosDeCategoria.map((s) => {
              const seleccionado = s.id === servicioSeleccionadoId;
              const precioVehiculo = s.precios[vehiculoId];

              return (
                <div
                  key={s.id}
                  onClick={() => setServicioSeleccionadoId(s.id)}
                  className={`rounded-2xl p-6 border cursor-pointer transition-all duration-200 flex flex-col justify-between relative ${
                    seleccionado
                      ? "bg-gradient-to-b from-neutral-900 to-[#121215] border-amber-400/80 shadow-[0_0_30px_rgba(245,158,11,0.12)] ring-1 ring-amber-400/50"
                      : "bg-[#111114] border-white/10 hover:border-white/25 hover:bg-[#151518]"
                  }`}
                >
                  {s.badge && (
                    <span className="absolute -top-2.5 right-4 text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-amber-400 text-black shadow-md">
                      {s.badge}
                    </span>
                  )}

                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4 className="text-base sm:text-lg font-bold text-white tracking-tight">
                          {s.nombre}
                        </h4>
                        <p className="text-xs text-amber-400/90 font-medium">
                          {s.subtitulo}
                        </p>
                      </div>
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-1 transition ${
                        seleccionado 
                          ? "bg-amber-400 border-amber-400 text-black" 
                          : "border-neutral-600 bg-neutral-900"
                      }`}>
                        {seleccionado && <LuCheck className="text-xs stroke-[3]" />}
                      </div>
                    </div>

                    <p className="text-xs text-neutral-400 leading-relaxed">
                      {s.descripcion}
                    </p>

                    <div className="flex items-center gap-2 text-[11px] text-neutral-400 pt-1">
                      <LuClock className="text-amber-400 text-xs shrink-0" />
                      <span>Duración estimada: <strong className="text-neutral-200">{s.duracionEstimada}</strong></span>
                    </div>

                    <ul className="space-y-1.5 pt-2 border-t border-white/5">
                      {s.detalles.slice(0, 4).map((d, i) => (
                        <li key={i} className="text-[11px] text-neutral-300 flex items-start gap-1.5 leading-snug">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400/70 mt-1 shrink-0" />
                          <span>{d}</span>
                        </li>
                      ))}
                      {s.detalles.length > 4 && (
                        <li className="text-[10px] text-neutral-400 italic pt-0.5">
                          + {s.detalles.length - 4} procesos técnicos adicionales incluidos
                        </li>
                      )}
                    </ul>
                  </div>

                  <div className="pt-5 mt-4 border-t border-white/10 flex items-baseline justify-between">
                    <span className="text-[11px] text-neutral-400 uppercase tracking-wider font-medium">
                      Para {vehiculoActual.label}
                    </span>
                    <div className="text-right">
                      {precioVehiculo ? (
                        <span className="text-xl sm:text-2xl font-extrabold text-white">
                          ${precioVehiculo.toLocaleString("es-MX")}{" "}
                          <span className="text-xs font-medium text-neutral-400">MXN</span>
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

        {/* PASO 3: Complementos y Adicionales */}
        <div className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs uppercase tracking-widest text-neutral-400 font-semibold flex items-center gap-2">
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-white/10 text-white text-[11px] font-bold">3</span>
              Complementos & Tratamientos Opcionales
            </h3>
            <span className="text-xs text-neutral-500 hidden sm:inline">Agrega según la condición actual de tu auto</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {COMPLEMENTOS_PLATINUM.map((comp) => {
              const seleccionado = complementosSeleccionados.includes(comp.id);
              const precio = getPrecioComplemento(comp);

              return (
                <div
                  key={comp.id}
                  onClick={() => toggleComplemento(comp.id)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition flex flex-col justify-between ${
                    seleccionado
                      ? "bg-amber-400/10 border-amber-400/50 text-white shadow-sm"
                      : "bg-[#111114] border-white/10 hover:border-white/20 text-neutral-300"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-xs font-semibold text-white leading-tight">
                      {comp.nombre}
                    </p>
                    <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 mt-0.5 ${
                      seleccionado
                        ? "bg-amber-400 border-amber-400 text-black"
                        : "border-neutral-600 bg-neutral-900"
                    }`}>
                      {seleccionado ? <LuCheck className="text-[10px] stroke-[3]" /> : <LuPlus className="text-[9px] text-neutral-500" />}
                    </div>
                  </div>
                  <p className="text-[11px] text-neutral-400 line-clamp-2 mt-1.5 leading-snug">
                    {comp.descripcion}
                  </p>
                  <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between">
                    <span className="text-[10px] text-neutral-500 uppercase font-medium">Adicional</span>
                    <span className="text-xs font-bold text-amber-400">
                      +${precio.toLocaleString("es-MX")} MXN
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* PASO 4: Resumen de Cotización & Botón a WhatsApp */}
        <div className="bg-gradient-to-r from-[#141418] via-[#18181f] to-[#141418] rounded-3xl p-6 sm:p-10 border border-white/15 shadow-2xl relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-white/5 text-[11px] font-semibold text-neutral-300 tracking-wider uppercase">
                Resumen de tu Cotización
              </div>
              
              <div className="space-y-2">
                <div className="flex items-baseline justify-between border-b border-white/5 pb-2">
                  <span className="text-xs text-neutral-400">Vehículo seleccionado:</span>
                  <span className="text-sm font-semibold text-white">{vehiculoActual.label}</span>
                </div>
                <div className="flex items-baseline justify-between border-b border-white/5 pb-2">
                  <span className="text-xs text-neutral-400">Tratamiento base:</span>
                  <span className="text-sm font-semibold text-amber-400">{servicioActual.nombre}</span>
                </div>
                {complementosSeleccionados.length > 0 && (
                  <div className="pt-1">
                    <span className="text-xs text-neutral-400 block mb-1.5">Complementos agregados ({complementosSeleccionados.length}):</span>
                    <div className="flex flex-wrap gap-1.5">
                      {complementosSeleccionados.map((id) => {
                        const c = COMPLEMENTOS_PLATINUM.find((item) => item.id === id);
                        if (!c) return null;
                        return (
                          <span key={id} className="text-[11px] px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-neutral-300">
                            {c.nombre} (+${getPrecioComplemento(c).toLocaleString("es-MX")})
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              <p className="text-[11px] text-neutral-400 flex items-center gap-1.5 pt-2">
                <LuInfo className="text-amber-400 text-xs shrink-0" />
                <span>Precios referenciales oficiales de Platinum. Servicio realizado 100% a domicilio en Querétaro con equipo e insumos profesionales.</span>
              </p>
            </div>

            <div className="lg:col-span-5 bg-black/60 rounded-2xl p-6 border border-white/10 flex flex-col justify-center items-center text-center space-y-4">
              <div>
                <span className="text-xs uppercase tracking-widest text-neutral-400 font-medium">Total Estimado</span>
                <div className="text-3xl sm:text-4xl font-extrabold text-white mt-1">
                  ${totalEstimado.toLocaleString("es-MX")}{" "}
                  <span className="text-sm font-medium text-amber-400">MXN</span>
                </div>
              </div>

              <a
                href={whatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-3 px-6 py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-black font-extrabold text-sm sm:text-base tracking-wide transition-all shadow-[0_4px_25px_rgba(16,185,129,0.3)] hover:scale-[1.02]"
              >
                <FaWhatsapp className="text-xl" />
                <span>Agendar Cita con este Presupuesto</span>
              </a>

              <span className="text-[11px] text-neutral-400">
                Atención directa por WhatsApp con Edgar · Respuesta ágil
              </span>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
