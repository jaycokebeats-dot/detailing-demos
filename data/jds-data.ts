import type { Business } from "./business-helpers";

export const JDS_DETAILING_BUSINESS: Business = {
  slug: "jds-detailing",
  nombre: "JDS Detail Car Estudio",
  nombreCorto: "JDS Detail Car Estudio",
  telefono: "011 15-5451-4393",
  whatsapp: "5491154514393",
  instagram: "Jdscardetail",
  direccion: "Lynch Pueyrredón 4386, Villa Ballester",
  ciudad: "Villa Ballester",
  provincia: "Buenos Aires",
  rating: 5,
  reviews_count: 20,
  horario: "Lunes a Viernes: 10:00 a 18:00 | Sábados: 10:00 a 16:00 (Turno previo)",
  color_theme: "rojo",
  logo_url: "/logo/jds/jds-logo-transparent.png",
  fotos: [],
  maps_url: "https://www.google.com/maps/place/Jds+detailing+Car+estudio/data=!4m7!3m6!1s0x95bcb9e9ff10fe3b:0xf29f5d44d22954a1!8m2!3d-34.5652775!4d-58.5639934!16s%2Fg%2F11nwvzb3zw!19sChIJO_4Q_-m5vJURoVQp0kRdn_I?authuser=0&hl=es-419&g_ep=EgoyMDI2MTAwNS4wIJJjKgBIAVAD&rclk=1",
  pais: "AR",
  template: "argentina",
  video_hero: "/videos/hero-compilado-blanco.mp4",
  hero_titulo: "Detailing Profesional & Estética del Auto,",
  hero_titulo_gold: "Tu Auto, en las Mejores Manos",
  hero_subtitulo: "Tratamientos cerámicos 9H, pulido y corrección de pintura, PPF brillante, restauración de ópticas y limpieza de motor a vapor en Villa Ballester. Cuidado artesanal sin atajos.",
  servicios: [
    {
      nombre: "Tratamiento Cerámico 9H",
      precio: "Consultar Presupuesto",
      descripcion:
        "Recubrimiento nanotecnológico de máxima dureza tipo vidrio líquido. Otorga brillo cristalino profundo efecto espejo, extrema repelencia hidrofóbica y protección contra rayos UV, marcas de agua y químicos por años.",
      ideal_si: "Blindar la pintura con la máxima protección, repeler agua y barro, y facilitar enormemente los lavados.",
      proteccion: "Dureza 9H & Brillo Espejo",
      antes_img: "/servicios/ceramico-antes.png",
      despues_img: "/servicios/ceramico-despues.png",
    },
    {
      nombre: "Pulido y Corrección de Pintura",
      precio: "Presupuesto Previo",
      descripcion:
        "Corrección técnica de laca en 2 o 3 pasos de pulido con luz LED de alta precisión para eliminar microrrayones circulares (swirls), marcas de lavadero y manchas. Opciones de abrillantado fino o sellado acrílico protector.",
      ideal_si: "Eliminar las marcas circulares del lavado y devolverle la profundidad y claridad de 0km al color.",
      proteccion: "Corrección Real de Laca sin Rellenos",
      antes_img: "/before-after/pintura-antes.jpg",
      despues_img: "/before-after/pintura-despues.jpg",
    },
    {
      nombre: "Restauración de Ópticas",
      precio: "A Cotizar / Presupuesto",
      descripcion:
        "Micro-lijado progresivo y pulido técnico de ópticas opacas, quemadas o amarillentas por el sol. Aplicación de polímero sellador con filtro UV para recuperar el 100% de la transparencia y potencia lumínica original.",
      ideal_si: "Recuperar la visión nocturna segura y renovar la mirada del auto para la VTV sin cambiar las ópticas.",
      proteccion: "Sellado UV & Máxima Claridad",
      antes_img: "/before-after/faros-antes.jpg",
      despues_img: "/before-after/faros-despues.jpg",
    },
    {
      nombre: "Limpieza de Motor a Vapor",
      precio: "Presupuesto Previo",
      descripcion:
        "Higienización técnica exhaustiva del vano motor con vapor seco controlado a temperatura y desengrasantes dieléctricos seguros para conexiones y sensores. Acondicionado satinado de mangueras, plásticos y gomas sin siliconas grasosas.",
      ideal_si: "Dejar el motor impecable de exhibición, libre de grasa y con plásticos protegidos contra resecamiento.",
      proteccion: "Vapor Seco & Acondicionado Dieléctrico",
      antes_img: "/before-after/motor-antes.jpg",
      despues_img: "/before-after/motor-despues.jpg",
    },
    {
      nombre: "PPF Brillante | Paint Protection Film",
      precio: "Consultar Presupuesto",
      descripcion:
        "Lámina transparente autorregenerable de poliuretano de alta resistencia con acabado Gloss brillante. Escudo físico contra piedrazos en autopista, rayones de estacionamiento y rozaduras, manteniendo la pintura original intacta.",
      ideal_si: "Film autorregenerable con calor · Cobertura para trompa / frente o zonas vulnerables del vehículo.",
      proteccion: "Protección Física de Alto Impacto",
      antes_img: "/servicios/ppf-brilloso-antes.png",
      despues_img: "/servicios/ppf-brilloso-despues.png",
    },
    {
      nombre: "Limpieza de Interior Full",
      precio: "Presupuesto según Vehículo",
      descripcion:
        "Desinfección e higienización integral del habitáculo con inyección-extracción y vapor a presión: limpieza a fondo en tapizados de tela o nutrición artesanal para butacas de cuero, alfombras, techo, paneles de puerta y conductos de climatización.",
      ideal_si: "Desmanchar butacas, eliminar olores y recuperar la sensación y textura de habitáculo recién salido de fábrica.",
      proteccion: "Desinfección Integral & Cuidado de Cuero",
      antes_img: "/servicios/limpieza-tapizado-antes.png",
      despues_img: "/servicios/limpieza-tapizado-despues.png",
    },
    {
      nombre: "Lavado Premium",
      precio: "A Cotizar / Presupuesto",
      descripcion:
        "Lavado artesanal meticuloso con técnica de dos baldes y shampoo de pH neutro para evitar micro-swirls. Limpieza detallada de llantas, pasarruedas, marcos de puerta, secado seguro con toallas de microfibra de alta absorción y terminación con cera rápida.",
      ideal_si: "Un lavado a fondo con cuidado artesanal que respeta los tratamientos y mantiene el brillo real del auto.",
      proteccion: "Lavado Artesanal Sin Microrrayones",
      antes_img: "/servicios/lavado-premium-antes.jpg",
      despues_img: "/servicios/lavado-premium-despues.jpg",
    },
    {
      nombre: "Sacabollos Artesanal (PDR)",
      precio: "Presupuesto según Inspección",
      descripcion:
        "Técnica artesanal de varillero para reparar toques de estacionamiento, golpes cotidianos y daños por granizo sin tocar ni masillar la pintura original de fábrica.",
      ideal_si: "Eliminar bollos manteniendo el 100% de la pintura original y el máximo valor de reventa.",
      proteccion: "100% Pintura Original de Fábrica",
      antes_img: "/servicios/sacabollos-antes.png",
      despues_img: "/servicios/sacabollos-despues.png",
    },
    {
      nombre: "Preparación para la Venta & Limpieza de Chasis",
      precio: "Presupuesto Previo",
      descripcion:
        "Puesta a punto estética integral pensada para revalorizar tu auto y acelerar la venta: limpieza profunda de chasis y bajos, detallado exterior con abrillantado rápido, habitáculo reacondicionado y vano motor impecable.",
      ideal_si: "Maximizar el atractivo visual del auto para fotos y visitas de compradores, logrando el mejor precio.",
      proteccion: "Revalorización Comercial del Auto",
      img: "/servicios/exterior.jpg",
    },
  ],
};
