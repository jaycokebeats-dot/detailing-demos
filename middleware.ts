import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const hostname = request.headers.get("host") || "";
  const cleanHost = hostname.split(":")[0].toLowerCase();
  const { pathname } = request.nextUrl;

  // Servir favicon.ico específico según el dominio (para Google Search Console y navegadores)
  if (pathname === "/favicon.ico") {
    const referer = (request.headers.get("referer") || "").toLowerCase();
    const activeSlug = (request.cookies.get("black_line_active_slug")?.value || "").toLowerCase();

    if (cleanHost === "mcdetail.com.ar" || cleanHost === "www.mcdetail.com.ar" || referer.includes("mc-detail") || activeSlug.includes("mc-detail")) {
      return NextResponse.rewrite(new URL("/favicon-mcdetail.ico", request.url));
    }
    if (cleanHost === "amesteticavehicular.com.ar" || cleanHost === "www.amesteticavehicular.com.ar" || referer.includes("am-centro") || activeSlug.includes("am-centro")) {
      return NextResponse.rewrite(new URL("/favicon-am.ico", request.url));
    }
    if (cleanHost.includes("jds") || cleanHost.includes("jdscardetail") || referer.includes("jds") || activeSlug.includes("jds")) {
      return NextResponse.rewrite(new URL("/favicon-jds.ico", request.url));
    }
    if (cleanHost === "platinumdetallado.com" || cleanHost === "www.platinumdetallado.com") {
      return NextResponse.rewrite(new URL("/favicon-platinum.ico", request.url));
    }
    if (cleanHost === "shalomdetailing.com" || cleanHost === "www.shalomdetailing.com" || referer.includes("shalom") || activeSlug.includes("shalom")) {
      return NextResponse.rewrite(new URL("/favicon-shalom.ico", request.url));
    }
    return NextResponse.rewrite(new URL("/favicon-platinum.ico", request.url));
  }

  // Marcar cookie de taller activo para jds-detailing
  if (pathname === "/d/jds-detailing" || pathname === "/jds-detailing") {
    const res = NextResponse.next();
    res.cookies.set("black_line_active_slug", "jds-detailing", { path: "/" });
    return res;
  }

  // Ficha de recepción / Check-in directa para JDS Detailing
  if (pathname === "/jds-checkin" || pathname === "/checkin-jds" || pathname === "/ficha-jds") {
    const url = new URL("/checkin", request.url);
    url.searchParams.set("slug", "jds-detailing");
    url.searchParams.set("taller", "jds-detailing");
    const res = NextResponse.rewrite(url);
    res.cookies.set("black_line_active_slug", "jds-detailing", { path: "/" });
    return res;
  }

  // Panel de Taller Demo independiente para mostrar a potenciales clientes
  if (pathname === "/panel-demo" || pathname === "/taller-demo") {
    const demoSlug = "demo-taller";
    const url = new URL("/taller", request.url);
    url.searchParams.set("slug", demoSlug);
    url.searchParams.set("taller", demoSlug);
    const res = NextResponse.rewrite(url);
    res.cookies.set("black_line_active_slug", demoSlug, { path: "/" });
    return res;
  }

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

  // Si acceden desde el dominio exclusivo de Shalom Detailing Toluca
  if (cleanHost === "shalomdetailing.com" || cleanHost === "www.shalomdetailing.com") {
    const shalomSlug = "shalom-estetica-automotriz";
    if (pathname === "/") {
      const res = NextResponse.rewrite(
        new URL(`/d/${shalomSlug}`, request.url)
      );
      res.cookies.set("black_line_active_slug", shalomSlug, { path: "/" });
      return res;
    }

    if (pathname === "/admin") {
      const url = new URL("/admin", request.url);
      url.searchParams.set("taller", shalomSlug);
      const res = NextResponse.rewrite(url);
      res.cookies.set("black_line_active_slug", shalomSlug, { path: "/" });
      return res;
    }

    if (pathname === "/presupuesto") {
      const url = new URL("/presupuesto", request.url);
      url.searchParams.set("taller", shalomSlug);
      const res = NextResponse.rewrite(url);
      res.cookies.set("black_line_active_slug", shalomSlug, { path: "/" });
      return res;
    }

    if (pathname === "/checkin") {
      const url = new URL("/checkin", request.url);
      url.searchParams.set("taller", shalomSlug);
      const res = NextResponse.rewrite(url);
      res.cookies.set("black_line_active_slug", shalomSlug, { path: "/" });
      return res;
    }

    if (pathname === "/gestion" || pathname === "/taller") {
      const url = new URL(pathname, request.url);
      url.searchParams.set("taller", shalomSlug);
      const res = NextResponse.rewrite(url);
      res.cookies.set("black_line_active_slug", shalomSlug, { path: "/" });
      return res;
    }
  }

  // Si acceden desde el dominio exclusivo de AM Centro de Estética Vehicular
  if (cleanHost === "amesteticavehicular.com.ar" || cleanHost === "www.amesteticavehicular.com.ar") {
    const amSlug = "am-centro-de-estetica-vehicular";

    // Si acceden a la raíz '/', servir la landing de AM directamente en la raíz
    if (pathname === "/") {
      const res = NextResponse.rewrite(
        new URL(`/d/${amSlug}`, request.url)
      );
      res.cookies.set("black_line_active_slug", amSlug, { path: "/" });
      return res;
    }

    // Si acceden al admin '/admin'
    if (pathname === "/admin") {
      const url = new URL("/admin", request.url);
      url.searchParams.set("taller", amSlug);
      const res = NextResponse.rewrite(url);
      res.cookies.set("black_line_active_slug", amSlug, { path: "/" });
      return res;
    }

    // Rutas protegidas / discretas para las herramientas del taller (no expuestas en URLs genéricas)
    // 1. Presupuestador: '/presupuestador-1611' (y '/cotizador-1611')
    if (pathname === "/presupuestador-1611" || pathname === "/cotizador-1611") {
      const url = new URL("/presupuesto", request.url);
      url.searchParams.set("slug", amSlug);
      url.searchParams.set("taller", amSlug);
      const res = NextResponse.rewrite(url);
      res.cookies.set("black_line_active_slug", amSlug, { path: "/" });
      return res;
    }

    // 2. Panel de Taller y Caja: '/panel-caja-1611' (y '/taller-1611')
    if (pathname === "/panel-caja-1611" || pathname === "/taller-1611") {
      const url = new URL("/taller", request.url);
      url.searchParams.set("slug", amSlug);
      url.searchParams.set("taller", amSlug);
      const res = NextResponse.rewrite(url);
      res.cookies.set("black_line_active_slug", amSlug, { path: "/" });
      return res;
    }

    // 3. Ficha de recepción / Check-in: '/ficha-recepcion-1611' (y '/checkin-1611')
    if (pathname === "/ficha-recepcion-1611" || pathname === "/checkin-1611") {
      const url = new URL("/checkin", request.url);
      url.searchParams.set("slug", amSlug);
      url.searchParams.set("taller", amSlug);
      const res = NextResponse.rewrite(url);
      res.cookies.set("black_line_active_slug", amSlug, { path: "/" });
      return res;
    }

    // Si alguien intenta adivinar las URLs obvias genéricas (/panel, /cotizador, /taller, /presupuesto, /gestion, /checkin, /recepcion)
    // redirigir silenciosamente al inicio público '/' para proteger la privacidad del taller
    if (
      pathname === "/panel" ||
      pathname === "/taller" ||
      pathname === "/cotizador" ||
      pathname === "/presupuesto" ||
      pathname === "/gestion" ||
      pathname === "/checkin" ||
      pathname === "/recepcion"
    ) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  // Si acceden desde el dominio exclusivo de Mc Detail
  if (cleanHost === "mcdetail.com.ar" || cleanHost === "www.mcdetail.com.ar") {
    // Si acceden a la raíz '/', servir la landing de Mc Detail directamente en la raíz
    if (pathname === "/") {
      const res = NextResponse.rewrite(
        new URL("/d/mc-detail-detailing", request.url)
      );
      res.cookies.set("black_line_active_slug", "mc-detail-detailing", { path: "/" });
      return res;
    }

    // Si acceden al admin '/admin', preseleccionar el taller de Mc Detail
    if (pathname === "/admin") {
      const url = new URL("/admin", request.url);
      url.searchParams.set("taller", "mc-detail-detailing");
      const res = NextResponse.rewrite(url);
      res.cookies.set("black_line_active_slug", "mc-detail-detailing", { path: "/" });
      return res;
    }

    // Si acceden al presupuestador '/presupuesto'
    if (pathname === "/presupuesto") {
      const url = new URL("/presupuesto", request.url);
      url.searchParams.set("taller", "mc-detail-detailing");
      const res = NextResponse.rewrite(url);
      res.cookies.set("black_line_active_slug", "mc-detail-detailing", { path: "/" });
      return res;
    }

    // Si acceden a la ficha de recepción '/checkin'
    if (pathname === "/checkin") {
      const url = new URL("/checkin", request.url);
      url.searchParams.set("taller", "mc-detail-detailing");
      const res = NextResponse.rewrite(url);
      res.cookies.set("black_line_active_slug", "mc-detail-detailing", { path: "/" });
      return res;
    }

    // Si acceden al panel de gestión '/gestion' o '/taller'
    if (pathname === "/gestion" || pathname === "/taller") {
      const url = new URL(pathname, request.url);
      url.searchParams.set("taller", "mc-detail-detailing");
      const res = NextResponse.rewrite(url);
      res.cookies.set("black_line_active_slug", "mc-detail-detailing", { path: "/" });
      return res;
    }
  }

  // Si acceden desde el dominio exclusivo de JDS Detailing Car Studio
  if (cleanHost.includes("jdsdetailing") || cleanHost.includes("jdscardetail")) {
    const jdsSlug = "jds-detailing";
    if (pathname === "/") {
      const res = NextResponse.rewrite(new URL(`/d/${jdsSlug}`, request.url));
      res.cookies.set("black_line_active_slug", jdsSlug, { path: "/" });
      return res;
    }
    if (pathname === "/admin") {
      const url = new URL("/admin", request.url);
      url.searchParams.set("taller", jdsSlug);
      const res = NextResponse.rewrite(url);
      res.cookies.set("black_line_active_slug", jdsSlug, { path: "/" });
      return res;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/favicon.ico",
    "/((?!api|_next/static|_next/image|.*\\..*).*)",
  ],
};
