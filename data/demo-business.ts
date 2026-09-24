import type { Business } from "./business-helpers";

export const DEFAULT_DEMO_BUSINESS: Business = {
  slug: "demo",
  nombre: "Demo Detail Studio",
  nombreCorto: "Demo Detail",
  telefono: "+54 9 11 5555-8888",
  whatsapp: "5491155558888",
  instagram: "demodetailstudio",
  direccion: "Av. Del Libertador 4500",
  ciudad: "Buenos Aires",
  rating: 4.9,
  reviews_count: 128,
  horario: "Lunes a Sábados: 09:00 a 19:00 hs",
  fotos: [],
  maps_url: "https://maps.google.com",
  servicios: [
    {
      nombre: "Lavado Detail Premium",
      descripcion: "Lavado técnico con espuma de PH neutro, secado por aire caliente, acondicionado de cubiertas y cera sintética protectora.",
      precio: "$35.000",
      destacado: false,
    },
    {
      nombre: "Corrección de Pintura (2 Pasos)",
      descripcion: "Eliminación del 80-90% de microrrayones (swirls), restauración del brillo profundo y nivelación de laca profesional.",
      precio: "$95.000",
      destacado: true,
      proteccion: "Incluye Sellador Sintético 6 Meses",
    },
    {
      nombre: "Recubrimiento Cerámico 9H",
      descripcion: "Tratamiento cerámico multicapa. Repelencia extrema al agua/polvo, protección UV y dureza antirrayas garantizada por 3 años.",
      precio: "$180.000",
      destacado: true,
      proteccion: "Protección 3 Años Garantizada",
    },
    {
      nombre: "PPF — Paint Protection Film (Frente Completo)",
      descripcion: "Película de poliuretano autorregenerable de máximo grosor. Protege contra piedrazos de ruta y daños físicos.",
      precio: "$450.000",
      destacado: false,
      proteccion: "Garantía Oficial 10 Años",
    },
    {
      nombre: "Detailing & Nutrición de Interiores",
      descripcion: "Limpieza a vapor de tapizados, desinfección con ozono y tratamiento hidratante para cuero y plásticos.",
      precio: "$45.000",
      destacado: false,
    },
  ],
};
