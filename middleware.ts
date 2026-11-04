import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const hostname = request.headers.get("host") || "";
  const cleanHost = hostname.split(":")[0].toLowerCase();
  const { pathname } = request.nextUrl;

  // Si acceden desde el dominio exclusivo de Platinum
  if (cleanHost === "platinumdetallado.com" || cleanHost === "www.platinumdetallado.com") {
    // Si acceden a la raíz '/', servir la landing de Platinum directamente en la raíz
    if (pathname === "/") {
      return NextResponse.rewrite(
        new URL("/d/platinum-detallado-automotriz-a-domicilio", request.url)
      );
    }

    // Si acceden al admin '/admin', preseleccionar el taller de Platinum
    if (pathname === "/admin") {
      const url = new URL("/admin", request.url);
      url.searchParams.set("taller", "platinum-detallado-automotriz-a-domicilio");
      return NextResponse.rewrite(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Interceptar rutas excepto archivos estáticos, imágenes y APIs
     */
    "/((?!api|_next/static|_next/image|favicon|.*\\..*).*)",
  ],
};
