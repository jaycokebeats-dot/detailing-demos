import { NextResponse } from "next/server";
import { getAllBusinesses, getBusiness } from "@/data/businesses";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug");
  const query = (searchParams.get("q") || "").toLowerCase().trim();

  // 1. Obtener datos completos de un taller específico
  if (slug) {
    const biz = getBusiness(slug);
    if (!biz) {
      return NextResponse.json({ error: "Taller no encontrado" }, { status: 404 });
    }
    return NextResponse.json(biz);
  }

  // 2. Búsqueda o listado de talleres
  const all = getAllBusinesses();

  let filtered = all;
  if (query) {
    filtered = all.filter(
      (b) =>
        b.slug.toLowerCase().includes(query) ||
        b.nombre.toLowerCase().includes(query) ||
        (b.ciudad && b.ciudad.toLowerCase().includes(query))
    );
  }

  // Retornar información ligera (primeros 150 para máxima velocidad)
  const results = filtered.slice(0, 150).map((b) => ({
    slug: b.slug,
    nombre: b.nombre,
    ciudad: b.ciudad || "",
    pais: b.pais || "AR",
    template: b.template || "argentina",
  }));

  return NextResponse.json({
    total: filtered.length,
    workshops: results,
  });
}
