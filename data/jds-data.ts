import type { Business } from "./business-helpers";

export const JDS_DETAILING_BUSINESS: Business = {
  slug: "jds-detailing",
  nombre: "JDS Detailing Car Studio",
  nombreCorto: "JDS Detailing Car Studio",
  telefono: "011 15-5451-4393",
  whatsapp: "5491154514393",
  instagram: "jdscardetail_",
  direccion: "Lynch Pueyrredón 4386, Villa Ballester",
  ciudad: "Villa Ballester",
  provincia: "Buenos Aires",
  rating: 5,
  reviews_count: 20,
  horario: "Lunes a Viernes: 10:00 a 18:00 | Sábados: 10:00 a 16:00 (Turno previo)",
  color_theme: "rojo",
  logo_url: "/logo/jds/jds-logo-transparent.png",
  fotos: ["/og-jds.jpg"],
  maps_url: "https://www.google.com/maps/place/Jds+detailing+Car+estudio/data=!4m7!3m6!1s0x95bcb9e9ff10fe3b:0xf29f5d44d22954a1!8m2!3d-34.5652775!4d-58.5639934!16s%2Fg%2F11nwvzb3zw!19sChIJO_4Q_-m5vJURoVQp0kRdn_I?authuser=0&hl=es-419&g_ep=EgoyMDI2MTAwNS4wIJJjKgBIAVAD&rclk=1",
  pais: "AR",
  template: "argentina",
  video_hero: "/videos/hero-compilado-blanco.mp4",
  hero_titulo: "Detailing Profesional & Estética del Automotor",
  hero_titulo_gold: "Tu Auto, en las Mejores Manos",
  hero_subtitulo: "",
  servicios: [
    {
      nombre: "Tratamiento Cerámico",
      precio: "Consultar Presupuesto",
      descripcion:
        "Un sellado transparente de alta duración que le da a la pintura un brillo increíble tipo espejo. Hace que el agua y la suciedad resbalen solas, protegiendo el color del sol y haciendo que lavar el auto sea mucho más fácil y rápido.",
      ideal_si: "Proteger la pintura a largo plazo y tener el auto siempre con brillo impecable.",
      proteccion: "Brillo Espejo & Protección Duradera",
      antes_img: "/servicios/ceramico-antes.png",
      despues_img: "/servicios/ceramico-despues.png",
    },
    {
      nombre: "Pulido y Corrección de Pintura",
      precio: "Presupuesto Previo",
      descripcion:
        "Pulido artesanal para eliminar las marcas circulares que dejan los lavaderos, rayas superficiales y manchas. Le devuelve a la pintura la profundidad de color y la claridad que tenía cuando el auto salió de 0km.",
      ideal_si: "Sacar las rayas del lavado y renovar la pintura para que se vea como nueva.",
      proteccion: "Pintura Renovada Sin Rayas",
      antes_img: "/before-after/pintura-antes.jpg",
      despues_img: "/before-after/pintura-despues.jpg",
    },
    {
      nombre: "Restauración de Ópticas",
      precio: "A Cotizar / Presupuesto",
      descripcion:
        "Pulido y sellado protector para ópticas opacas, gastadas o amarillentas por el sol. Vuelven a quedar totalmente transparentes, mejorando la facha del auto y permitiendo ver mucho mejor de noche para viajar seguro y pasar la VTV.",
      ideal_si: "Recuperar la transparencia de los faros sin tener que cambiarlos por unos nuevos.",
      proteccion: "Ópticas Transparentes & Protección UV",
      antes_img: "/before-after/faros-antes.jpg",
      despues_img: "/before-after/faros-despues.jpg",
    },
    {
      nombre: "Limpieza de Motor a Vapor",
      precio: "Presupuesto Previo",
      descripcion:
        "Lavado cuidadoso del motor usando vapor a temperatura y productos especiales que no dañan cables ni partes eléctricas. Limpia la grasa y la tierra acumulada, dejando plásticos y mangueras protegidos y con terminación original.",
      ideal_si: "Tener el vano motor impecable y cuidado sin correr ningún riesgo eléctrico.",
      proteccion: "Limpieza Segura a Vapor",
      antes_img: "/before-after/motor-antes.jpg",
      despues_img: "/before-after/motor-despues.jpg",
    },
    {
      nombre: "PPF Brillante | Paint Protection Film",
      precio: "Consultar Presupuesto",
      descripcion:
        "Un film transparente de alta resistencia que se coloca sobre la pintura para blindar el auto contra piedrazos en la ruta, rayones de estacionamiento y rozaduras. Si se marca con el calor del sol se regenera solo.",
      ideal_si: "Cuidar la pintura original de piedras en la ruta y toques de estacionamiento.",
      proteccion: "Escudo Anti-Piedrazos Autorregenerable",
      antes_img: "/servicios/ppf-brilloso-antes.png",
      despues_img: "/servicios/ppf-brilloso-despues.png",
    },
    {
      nombre: "Limpieza de Interior Full",
      precio: "Presupuesto según Vehículo",
      descripcion:
        "Limpieza profunda y desinfección completa del habitáculo. Lavamos y desmanchamos asientos de tela o acondicionamos cuero, limpiamos techo, alfombras, plásticos y desinfectamos los conductos del aire para eliminar olores y dejar olor a limpio.",
      ideal_si: "Dejar el interior como nuevo, desinfectado, sin manchas ni malos olores.",
      proteccion: "Desinfección Total & Habitáculo Impecable",
      antes_img: "/servicios/limpieza-tapizado-antes.png",
      despues_img: "/servicios/limpieza-tapizado-despues.png",
    },
    {
      nombre: "Lavado Premium",
      precio: "A Cotizar / Presupuesto",
      descripcion:
        "Lavado detallado a mano con shampoo especial y técnica que no raya la pintura. Limpiamos a fondo llantas, pasarruedas, marcos de puerta y terminamos con un secado suave y cera rápida para darle un brillo extra.",
      ideal_si: "Un lavado a fondo superior al lavadero común que cuida la pintura de tu auto.",
      proteccion: "Lavado Artesanal Sin Rayas",
      antes_img: "/before-after/platinum-full-detail-antes.jpg",
      despues_img: "/before-after/platinum-full-detail-despues.jpg",
    },
    {
      nombre: "Sacabollos Artesanal (PDR)",
      precio: "Presupuesto según Inspección",
      descripcion:
        "Reparamos bollos de estacionamiento, toques cotidianos y granizo con herramientas artesanales sin masillar ni pintar. Mantiene el auto 100% con su pintura de fábrica y conserva su valor original.",
      ideal_si: "Sacar bollos manteniendo intacta la pintura original del auto.",
      proteccion: "100% Pintura Original de Fábrica",
      antes_img: "/servicios/sacabollos-antes.png",
      despues_img: "/servicios/sacabollos-despues.png",
    },
    {
      nombre: "Preparación para la Venta & Limpieza de Chasis",
      precio: "Presupuesto Previo",
      descripcion:
        "Acondicionamiento estético completo para que el auto destaque al máximo en fotos y visitas de compradores: lavado de chasis, abrillantado exterior y habitáculo impecable para venderlo más rápido y al mejor precio.",
      ideal_si: "Dejar el auto listo para publicar y conseguir un mejor precio de venta.",
      proteccion: "Revalorización Total del Vehículo",
      img: "/servicios/exterior.jpg",
    },
  ],
};
