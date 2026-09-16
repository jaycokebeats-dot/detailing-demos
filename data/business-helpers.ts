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
  nombreCorto?: string;
  horario?: string;
};

export const MSG_PRESUPUESTO = "Hola! Quiero pedir un presupuesto para mi auto.";
export const MSG_FOTOS = "Hola! Te mando fotos de mi auto para que me digan qué tratamiento me recomiendan.";

// wa.me si hay whatsapp, sino tel:
export function waHref(biz: Business, msg: string): string {
  if (biz.whatsapp) return `https://wa.me/${biz.whatsapp}?text=${encodeURIComponent(msg)}`;
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
