export type ServiceItem = {
  nombre: string;
  descripcion: string;
  ideal_si?: string;
  precio: string;
  precios_detalle?: { categoria: string; precio: string }[];
  destacado?: boolean;
  img?: string;
  antes_img?: string;
  despues_img?: string;
  proteccion?: string;
  foto_fit?: "cover" | "contain";
  modo_foto?: "before_after" | "single";
};

export type VehiculoId = "auto" | "suv2" | "pickup" | "suv3" | "van";

export type CotizadorPlatinumServicio = {
  id: string;
  categoria: "mantenimiento" | "brillo-proteccion" | "interiores" | "combos" | "correccion";
  nombre: string;
  subtitulo: string;
  descripcion: string;
  badge?: string;
  zonaAviso?: string;
  detalles: string[];
  precios: Record<VehiculoId, number | null>;
  videos?: { url: string; poster?: string; titulo?: string }[];
};

export type CotizadorPlatinumComplemento = {
  id: string;
  nombre: string;
  descripcion: string;
  categoriaTipo: "interior" | "cristales" | "exterior" | "ceramico";
  precioTipo: "fijo" | "variable";
  precioFijo?: number;
  precioR15_R18?: number;
  precioR19_R22?: number;
  preciosVariables?: Partial<Record<VehiculoId, number | null>>;
};

export type CotizadorPlatinumCategoria = {
  id: "mantenimiento" | "brillo-proteccion" | "interiores" | "combos" | "correccion" | string;
  label: string;
  nivel?: string;
  badge?: string;
};

export const CATEGORIAS_PLATINUM_DEFAULT: CotizadorPlatinumCategoria[] = [
  {
    id: "mantenimiento",
    nivel: "NIVEL 1",
    label: "Mantenimiento Express",
  },
  {
    id: "brillo-proteccion",
    nivel: "NIVEL 2",
    label: "Brillo & Protección",
  },
  {
    id: "interiores",
    nivel: "NIVEL 3",
    label: "Interiores a Profundidad",
  },
  {
    id: "combos",
    nivel: "NIVEL 4",
    label: "Combos Completos",
    badge: "Recomendado",
  },
  {
    id: "correccion",
    nivel: "EXTERIOR PRO",
    label: "Pulidos & Cerámico",
    badge: "Tratamiento Pro",
  },
];

export type CotizadorPlatinumConfig = {
  servicios?: CotizadorPlatinumServicio[];
  complementos?: CotizadorPlatinumComplemento[];
  categorias?: CotizadorPlatinumCategoria[];
};

export type Business = {
  slug: string;
  nombre: string;
  telefono: string;
  whatsapp: string | null;
  instagram: string | null;
  direccion: string;
  ciudad: string;
  rating: number | null;
  reviews_count: number | null;
  fotos: string[];
  maps_url: string | null;
  // campos opcionales que no vienen del scraper
  place_id?: string;
  logo_url?: string;
  nombreCorto?: string;
  horario?: string;
  servicios?: ServiceItem[];
  pais?: string;
  template?: string;
  video_hero?: string;
  cotizador_platinum?: CotizadorPlatinumConfig;
};

export const MSG_PRESUPUESTO = "Hola! Quiero pedir un presupuesto para mi auto.";
export const MSG_FOTOS = "Hola! Te mando fotos de mi auto para que me digan qué tratamiento me recomiendan.";

// wa.me si hay whatsapp, sino tel:
export function waHref(biz: Business, msg: string): string {
  if (biz.whatsapp) {
    if (biz.whatsapp.startsWith("http")) return biz.whatsapp;
    if (biz.whatsapp.startsWith("qr/")) return `https://wa.me/${biz.whatsapp}`;
    return `https://wa.me/${biz.whatsapp}?text=${encodeURIComponent(msg)}`;
  }
  return `tel:${biz.telefono.replace(/[^\d+]/g, "")}`;
}

export function mapsHref(biz: Business): string {
  if (biz.maps_url) return biz.maps_url;
  const q = `${biz.nombre} ${biz.direccion} ${biz.ciudad}`;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
}

export function instagramHref(handle: string): string {
  return `https://instagram.com/${handle}`;
}

export function heroFoto(biz: Business): string | null {
  return biz.fotos?.[0] ?? null;
}
