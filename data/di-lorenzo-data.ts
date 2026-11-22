import type { Business, ServiceItem } from "./business-helpers";

export const DI_LORENZO_SERVICIOS: ServiceItem[] = [
  {
    nombre: "Tratamiento Cerámico 9H",
    precio: "A Cotizar / Presupuesto",
    descripcion:
      "Recubrimiento nanotecnológico de máxima dureza y durabilidad. Brinda un brillo cristalino profundo tipo espejo, extrema repelencia al agua y suciedad (efecto hidrofóbico), y protección UV contra decoloración solar y marcas de agua.",
    ideal_si: "Proteger la pintura a largo plazo, repeler lluvia y suciedad, y facilitar los lavados diarios.",
    proteccion: "Brillo Espejo & Máxima Hidrofobia",
    antes_img: "/servicios/ceramico-antes.png",
    despues_img: "/servicios/ceramico-despues.png",
  },
  {
    nombre: "Pulido y Corrección de Pintura",
    precio: "Presupuesto Previo",
    descripcion:
      "Proceso técnico artesanal en etapas bajo lámpara de inspección para eliminar microrrayones circulares (swirls), marcas de lavado y opacidad. Recupera la claridad óptica y profundidad de color de fábrica.",
    ideal_si: "Eliminar marcas circulares y devolverle a la carrocería el brillo de un 0km.",
    proteccion: "Pintura Renovada Sin Rayas",
    antes_img: "/before-after/pintura-antes.jpg",
    despues_img: "/before-after/pintura-despues.jpg",
  },
  {
    nombre: "PPF Brillante | Paint Protection Film",
    precio: "Consultar Presupuesto",
    descripcion:
      "Lámina transparente de poliuretano autorregenerable de alto impacto. Blinda la pintura original contra piedrazos en autopista o ruta, rayones de estacionamiento y rozaduras. Con el calor se regenera sola.",
    ideal_si: "Blindar trompa, ópticas o carrocería completa manteniendo el 100% de la pintura original.",
    proteccion: "Blindaje Anti-Piedrazos Autorregenerable",
    antes_img: "/servicios/ppf-brilloso-antes.png",
    despues_img: "/servicios/ppf-brilloso-despues.png",
  },
  {
    nombre: "Detailing Interior & Limpieza de Tapizados",
    precio: "Presupuesto según Vehículo",
    descripcion:
      "Higienización integral del habitáculo con inyección-extracción y vapor seco: limpieza profunda y desmanchado de butacas de tela o hidratación artesanal de cuero, alfombras, techo, paneles y desinfección de conductos de aire.",
    ideal_si: "Dejar el interior desinfectado, libre de manchas, bacterias y con aroma a nuevo.",
    proteccion: "Desinfección Total & Habitáculo Impecable",
    antes_img: "/servicios/limpieza-tapizado-antes.png",
    despues_img: "/servicios/limpieza-tapizado-despues.png",
  },
  {
    nombre: "Polarizado Nano Cerámico & Control Solar",
    precio: "Consultar Presupuesto",
    descripcion:
      "Láminas de seguridad y control térmico con nanotecnología cerámica. Máxima reducción del calor en cabina y bloqueo del 99% de rayos UV sin oscurecer ni distorsionar la visión nocturna.",
    ideal_si: "Bajar la temperatura del habitáculo, proteger el interior del sol y mayor privacidad y seguridad.",
    proteccion: "Filtro UV 99% & Rechazo Térmico",
    antes_img: "/servicios/polarizado-antes.png",
    despues_img: "/servicios/polarizado-despues.png",
  },
  {
    nombre: "Limpieza de Motor a Vapor & Dieléctrico",
    precio: "Presupuesto Previo",
    descripcion:
      "Higienización técnica exhaustiva a vapor seco y desengrasantes dieléctricos 100% seguros para sensores y componentes eléctricos. Nutrición y acondicionado satinado libre de siliconas grasosas.",
    ideal_si: "Tener el vano motor impecable y protegido sin riesgos eléctricos.",
    proteccion: "Nutrición Dieléctrica & Limpieza Segura",
    antes_img: "/before-after/motor-antes.jpg",
    despues_img: "/before-after/motor-despues.jpg",
  },
  {
    nombre: "Restauración de Ópticas con Protección UV",
    precio: "A Cotizar / Presupuesto",
    descripcion:
      "Micro-lijado técnico progresivo para remover la capa amarillenta y gastada por el sol, pulido de alta transparencia y sellador cerámico UV para que no vuelvan a opacarse. Mejora la visibilidad nocturna y estética.",
    ideal_si: "Recuperar 100% la claridad de los faros para viajar seguro y pasar la VTV.",
    proteccion: "Ópticas Transparentes & Protección UV",
    antes_img: "/before-after/faros-antes.jpg",
    despues_img: "/before-after/faros-despues.jpg",
  },
  {
    nombre: "Lavado Premium Artesanal",
    precio: "A Cotizar / Presupuesto",
    descripcion:
      "Lavado técnico detallado de 2 baldes con shampoo pH neutro, prelavado snow foam, limpieza al detalle de llantas, pasarruedas y emblemas, y sellado rápido con cera sintética de alto brillo sin generar microrrayones.",
    ideal_si: "Mantenimiento periódico seguro superior al lavadero convencional que cuida la laca.",
    proteccion: "Lavado Técnico Anti-Swirls",
    antes_img: "/before-after/platinum-full-detail-antes.jpg",
    despues_img: "/before-after/platinum-full-detail-despues.jpg",
  },
  {
    nombre: "Sacabollos Artesanal (PDR)",
    precio: "Presupuesto según Inspección",
    descripcion:
      "Técnica artesanal de varillero para reparar toques de estacionamiento, golpes y daños por granizo sin necesidad de masillar ni repintar el vehículo, conservando 100% la pintura de fábrica.",
    ideal_si: "Reparar golpes manteniendo intacta la pintura original y el valor de reventa.",
    proteccion: "100% Pintura Original de Fábrica",
    antes_img: "/servicios/sacabollos-antes.png",
    despues_img: "/servicios/sacabollos-despues.png",
  },
];

export const DI_LORENZO_BUSINESS: Business = {
  slug: "di-lorenzo-detailing",
  nombre: "Di Lorenzo Detailing",
  nombreCorto: "Di Lorenzo Detailing",
  telefono: "011 15-3376-7004",
  whatsapp: "5491133767004",
  instagram: null,
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
  hero_titulo: "Detailing Profesional & Estética Vehicular,",
  hero_titulo_gold: "Tu Auto Impecable en Haedo.",
  hero_subtitulo:
    "Tratamientos cerámicos 9H, corrección de laca, PPF y estética interior artesanal. Resultados reales y duraderos.",
  servicios: DI_LORENZO_SERVICIOS,
};
