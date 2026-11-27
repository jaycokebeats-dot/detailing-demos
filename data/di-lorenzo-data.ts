import type { Business, ServiceItem } from "./business-helpers";

export const DI_LORENZO_SERVICIOS: ServiceItem[] = [
  {
    nombre: "Pulido Exterior de Ópticas",
    descripcion:
      "Micro-lijado y sellado UV para eliminar opacidad y recuperar máxima transparencia y luminosidad.",
    ideal_si: "Ópticas amarillentas, opacas o con visibilidad reducida.",
    precio: "Consultar Presupuesto",
    proteccion: "Sellado UV Polimérico de Alta Duración",
    img: "/ec-detail/opticas_full.jpg",
    video: "/videos/di-lorenzo/opticas.mp4",
  },
  {
    nombre: "Abrillantado Premium",
    descripcion:
      "Pulido en 1 paso intensivo para remover microrrayones y devolver brillo y profundidad al color.",
    ideal_si: "Revivir el brillo del vehículo de forma rápida a un costo accesible.",
    precio: "Desde $165.000",
    proteccion: "Sellador Sintético / Carnauba de Alto Brillo",
    img: "/ec-detail/abrillantado.jpg",
    video: "/videos/di-lorenzo/abrillantado.mp4",
  },
  {
    nombre: "Servicio Pre-Venta (Particular - Agencias)",
    descripcion:
      "Acondicionamiento integral de carrocería e interiores para maximizar el valor de reventa.",
    ideal_si: "Vas a publicar tu auto para la venta y querés que se destaque de inmediato.",
    precio: "Solicitar Presupuesto",
    proteccion: "Preparación Comercial Showroom",
    img: "/ec-detail/foto-7.jpg",
  },
  {
    nombre: "Limpieza de Tapizados",
    descripcion:
      "Higienización profunda con inyección-extracción y desinfección total del habitáculo.",
    ideal_si: "Recuperar la textura, aroma y sensación de auto limpio y cuidado al detalle.",
    precio: "Desde $65.000",
    proteccion: "Desinfección & Acondicionado Profundo",
    img: "/ec-detail/tapizado.jpg",
    video: "/videos/di-lorenzo/tapizados.mp4",
  },
  {
    nombre: "Tratamiento Cerámico / Acrílico",
    descripcion:
      "Corrección de laca y sellado nanotecnológico con brillo espejo permanente y máxima hidrofobia.",
    ideal_si: "Brillo extremo espejo y protección a largo plazo contra el sol y factores climáticos.",
    precio: "Consultar según vehículo",
    proteccion: "Brillo Espejo & Máxima Hidrofobia",
    img: "/servicios/ceramico-real.jpg",
    video: "/videos/di-lorenzo/acrilico.mp4",
  },
  {
    nombre: "Tratamiento Motos",
    descripcion:
      "Cuidado artesanal, descontaminado, pulido y protección térmica para motos y cuatriciclos.",
    ideal_si: "Cuidado artesanal y protección duradera para motos de calle, pista o custom.",
    precio: "Desde $180.000",
    proteccion: "Sellado Cerámico Térmico & Hidrofóbico",
    img: "/ec-detail/foto-3.jpg",
    video: "/videos/di-lorenzo/motos.mp4",
  },
];

export const DI_LORENZO_BUSINESS: Business = {
  slug: "di-lorenzo-detailing",
  nombre: "Di Lo Center",
  nombreCorto: "Di Lo Center",
  telefono: "011 15-3376-7004",
  whatsapp: "5491133767004",
  instagram: "dilorenzodetailing",
  direccion: "Orense 711, Haedo",
  ciudad: "Haedo",
  provincia: "Buenos Aires",
  rating: 4.9,
  reviews_count: 40,
  horario: "Lunes a Sábado: 09:00 a 19:00 hs (Con Turno Previo)",
  fotos: [],
  maps_url:
    "https://www.google.com/maps/place/Di+Lorenzo+Detailing/@-34.6272522,-58.6188327,14z/data=!4m11!1m3!2m2!1scar+detailing+haedo+buenos+aires!6e2!3m6!1s0x95bcb904aeabe823:0x4b6d0a9a5eecf773!8m2!3d-34.6272522!4d-58.5827838!15sCiBjYXIgZGV0YWlsaW5nIGhhZWRvIGJ1ZW5vcyBhaXJlc1oiIiBjYXIgZGV0YWlsaW5nIGhhZWRvIGJ1ZW5vcyBhaXJlc5IBFWNhcl9kZXRhaWxpbmdfc2VydmljZZoBJENoZERTVWhOTUc5blMwVkpRMEZuU1VOcWVUazNlbkIzUlJBQuABAPoBBAgQEEI!16s%2Fg%2F11g1x1gjy6?entry=ttu&g_ep=EgoyMDI2MDkyNy4wIKXMDSoASAFQAw%3D%3D",
  pais: "AR",
  template: "argentina",
  video_hero: "/videos/hero-compilado-blanco.mp4",
  hero_titulo: "Centro Integral Automotor en Haedo,",
  hero_titulo_gold: "Detailing, Venta y Mecánica Ligera.",
  hero_subtitulo:
    "Tratamientos cerámicos, corrección de laca, restauración de ópticas, compra-venta de unidades seleccionadas y service preventivo artesanal.",
  servicios: DI_LORENZO_SERVICIOS,
};
