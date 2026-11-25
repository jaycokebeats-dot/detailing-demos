import type { Business, ServiceItem } from "./business-helpers";

export const DI_LORENZO_SERVICIOS: ServiceItem[] = [
  {
    nombre: "Pulido y Restauración de Ópticas",
    descripcion:
      "Micro-lijado progresivo multicapa y pulido óptico para eliminar la opacidad, manchas amarillentas y resecamiento por rayos UV. Sellado protector para garantizar máxima transparencia, luminosidad nocturna segura y aprobación de VTV.",
    ideal_si: "Ópticas amarillentas, opacas o con visibilidad reducida.",
    precio: "Consultar Presupuesto",
    proteccion: "Sellado UV Polimérico de Alta Duración",
    antes_img: "/before-after/faros-polymer-antes.jpg",
    despues_img: "/before-after/faros-polymer-despues.jpg",
    modo_foto: "before_after",
  },
  {
    nombre: "Abrillantado Premium",
    descripcion:
      "Pulido técnico en un solo paso intensivo para remover microrrayones superficiales y la película de suciedad incrustada. Devuelve la nitidez de reflejo, revive la profundidad del color y sella la laca con cera sintética de alto brillo.",
    ideal_si: "Revivir el brillo del vehículo de forma rápida a un costo accesible.",
    precio: "Desde $165.000",
    proteccion: "Sellador Sintético / Carnauba de Alto Brillo",
    antes_img: "/before-after/pintura-antes.jpg",
    despues_img: "/before-after/pintura-despues.jpg",
    modo_foto: "before_after",
  },
  {
    nombre: "Tratamientos para Motos",
    descripcion:
      "Estética y protección integral para motos de todas las cilindradas y cuatriciclos. Descontaminado exhaustivo de chasis y llantas, pulido artesanal de piezas y carenados, sellado cerámico térmico y nutrición de plásticos y metales.",
    ideal_si: "Cuidado artesanal y protección duradera para motos de calle, pista o custom.",
    precio: "$180.000",
    proteccion: "Sellado Cerámico Térmico & Hidrofóbico",
    img: "/ec-detail/foto-3.jpg",
  },
  {
    nombre: "Servicio Pre-Venta Integral",
    descripcion:
      "Acondicionamiento estético estratégico pensado para maximizar el valor de reventa de tu vehículo y venderlo mucho más rápido. Incluye abrillantado de carrocería, limpieza profunda de tapizados e interiores, vano motor y terminación de showroom.",
    ideal_si: "Vas a publicar tu auto para la venta y querés que se destaque de inmediato.",
    precio: "Solicitar Presupuesto",
    proteccion: "Preparación Comercial Showroom",
    img: "/ec-detail/foto-7.jpg",
  },
  {
    nombre: "Tratamiento Cerámico (0km y Usados)",
    descripcion:
      "Recubrimiento nanotecnológico de vidrio líquido de extrema dureza y resistencia química. Otorga un brillo cristalino y profundo tipo espejo, extrema repelencia al agua y suciedad (hidrofobia), y protección UV duradera contra marcas de agua y sol.",
    ideal_si: "Conserva la pintura impecable, repele agua y barro, y facilita enormemente los lavados diarios.",
    precio: "Consultar según vehículo",
    proteccion: "Brillo Espejo & Máxima Hidrofobia",
    antes_img: "/servicios/ceramico-antes.png",
    despues_img: "/servicios/ceramico-despues.png",
    modo_foto: "before_after",
  },
  {
    nombre: "Tratamiento Acrílico Sellador",
    descripcion:
      "Corrección intermedia de pintura con pulido y sellador acrílico de alta duración. Elimina un alto porcentaje de marcas circulares (swirls), intensifica el tono del color y deja un acabado suave y protegido durante meses.",
    ideal_si: "Excelente relación entre corrección de rayas y costo accesible.",
    precio: "Consultar Presupuesto",
    proteccion: "Sellado Acrílico Sintético de Larga Duración",
    antes_img: "/before-after/pintura-antes.jpg",
    despues_img: "/before-after/pintura-despues.jpg",
    modo_foto: "before_after",
  },
  {
    nombre: "Detailing Interior & Limpieza de Tapizados",
    descripcion:
      "Higienización y desinfección integral del habitáculo con inyección-extracción y vapor seco: limpieza profunda en tapizados de tela o nutrición artesanal para butacas de cuero, alfombras, techo, conductos de aire y plásticos.",
    ideal_si: "Recuperar la textura, aroma y sensación de auto limpio y cuidado al detalle.",
    precio: "Desde $65.000",
    proteccion: "Desinfección & Acondicionado",
    antes_img: "/servicios/limpieza-tapizado-antes.png",
    despues_img: "/servicios/limpieza-tapizado-despues.png",
    modo_foto: "before_after",
  },
  {
    nombre: "Detallado y Nutrición de Motor",
    descripcion:
      "Limpieza técnica profunda del vano motor con vapor controlado y desengrasantes dieléctricos seguros. Nutrición y acondicionamiento de mangueras, plásticos y gomas con terminación satinada original, libre de siliconas grasosas.",
    ideal_si: "Recuperar el aspecto de 0km bajo el capot y proteger plásticos y mangueras contra resecamiento.",
    precio: "Desde $45.000",
    proteccion: "Acondicionado Dieléctrico de Plásticos",
    antes_img: "/before-after/motor-antes.jpg",
    despues_img: "/before-after/motor-despues.jpg",
    modo_foto: "before_after",
  },
  {
    nombre: "PPF | Paint Protection Film",
    descripcion:
      "Lámina de poliuretano autorregenerable de alto impacto. Blinda la pintura original contra piedrazos en autopista o ruta, rayones de estacionamiento y rayos UV, disponible en acabado transparente brillante, mate satinado o color.",
    ideal_si: "Film autorregenerable con calor · Cobertura para trompa / frente o carrocería completa.",
    precio: "Consultar Presupuesto",
    proteccion: "Protección Física de Alto Impacto",
    antes_img: "/servicios/ppf-brilloso-antes.png",
    despues_img: "/servicios/ppf-brilloso-despues.png",
    modo_foto: "before_after",
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
  reviews_count: 18,
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
