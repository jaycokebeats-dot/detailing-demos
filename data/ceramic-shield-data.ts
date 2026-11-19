import { ServicioBase } from "../components/mexico/CotizadorPlatinum";

export const CERAMIC_SHIELD: ServicioBase = {
  id: "ceramic-shield",
  categoria: "brillo-proteccion",
  nombre: "Ceramic Shield",
  subtitulo: "Detallado Exterior | Cerámico Express",
  descripcion: "Protección avanzada con tecnología de carbono y silicio para un brillo espejo y repelencia extrema.",
  badge: "Nivel 2",
  detalles: [
    "Lavado Técnico Seguro con espuma activa",
    "Descontaminación Férrica profunda",
    "Preparación con IPA",
    "Sellado en Pintura y Plásticos (hasta 12 meses)",
    "Blindaje Térmico en Rines (hasta 6 meses)",
    "Repelente hidrofóbico en cristales y acondicionador de llantas"
  ],
  precios: {
    auto: 1350,
    suv2: 1550,
    pickup: 1750,
    suv3: 2050,
    van: 2590
  }
};
