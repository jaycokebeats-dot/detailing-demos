import { createClient } from "@supabase/supabase-js";
import type { Business } from "@/data/business-helpers";
import { DEFAULT_DEMO_BUSINESS } from "@/data/demo-business";
import { MC_DETAIL_BUSINESS } from "@/data/mc-detail-data";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://sliqwmfzklqwjrxywndl.supabase.co";

const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNsaXF3bWZ6a2xxd2pyeHl3bmRsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI3OTU3MjMsImV4cCI6MjEwODM3MTcyM30.ZIfSCplqA6s0pDeG1BgDAr2hLz0NkYkkTmyvkkUVmb0";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  global: {
    fetch: (url, options = {}) => fetch(url, { ...options, cache: "no-store" }),
  },
});

export function normalizeSlug(slug: string): string {
  const s = (slug || "").toLowerCase().trim();
  if (s === "taller-demo" || s === "demo") return "demo";
  if (s === "thezone" || s === "the-zone") return "the-zone-car-autospa-detailing";
  if (s === "shalom" || s === "shalom-detailing") return "shalom-estetica-automotriz";
  if (s === "mc-detail" || s === "mc-detail-detailing") return "mc-detail-detailing";
  return s;
}

export function getStorageKey(slug: string): string {
  return `black_line_biz_data_${normalizeSlug(slug)}_v1`;
}

/**
 * Resuelve el taller activo priorizando:
 * 1. Parámetros explícitos de URL (?taller= o ?slug=)
 * 2. Hostname / Dominio Propio (ej: mcdetail.com.ar -> mc-detail-detailing)
 * 3. Referrer si navega desde la landing de un taller
 * 4. Sesión activa en sessionStorage o cookies
 * 5. Fallback por defecto ("demo")
 */
export function resolveWorkshopSlug(defaultFallback: string = "demo"): string {
  if (typeof window === "undefined") return defaultFallback;

  // 1. Parámetros de URL
  const params = new URLSearchParams(window.location.search);
  const fromQuery = params.get("taller") || params.get("slug");
  if (fromQuery && fromQuery.trim()) {
    const clean = fromQuery.toLowerCase().trim();
    try {
      sessionStorage.setItem("black_line_active_slug", clean);
    } catch {}
    return normalizeSlug(clean);
  }

  // 2. Detección por Hostname
  const host = (window.location.hostname || "").toLowerCase();
  if (host.includes("mcdetail.com.ar") || host.includes("mc-detail")) {
    return "mc-detail-detailing";
  }
  if (host.includes("platinumdetallado.com")) {
    return "platinum-detallado-automotriz-a-domicilio";
  }
  if (host.includes("dentisaludgroup.com.ar")) {
    return "dentisalud";
  }
  if (host.includes("borgesppf.com")) {
    return "borges-ppf-detailing";
  }

  // 3. Referrer (si viene navegando desde la web de un taller)
  if (typeof document !== "undefined" && document.referrer) {
    try {
      const refUrl = new URL(document.referrer);
      if (refUrl.hostname.includes("mcdetail.com.ar") || refUrl.pathname.includes("mc-detail")) {
        return "mc-detail-detailing";
      }
      if (refUrl.hostname.includes("platinumdetallado.com") || refUrl.pathname.includes("platinum-detallado")) {
        return "platinum-detallado-automotriz-a-domicilio";
      }
      if (refUrl.pathname.includes("/d/")) {
        const parts = refUrl.pathname.split("/d/")[1]?.split("/")[0]?.split("?")[0];
        if (parts) return normalizeSlug(parts);
      }
    } catch {}
  }

  // 4. Recordar slug activo de la sesión
  try {
    const sessionActive = sessionStorage.getItem("black_line_active_slug");
    if (sessionActive && sessionActive !== "demo") {
      return normalizeSlug(sessionActive);
    }
    const adminSlug = sessionStorage.getItem("black_line_admin_slug");
    if (adminSlug && adminSlug !== "demo") {
      return normalizeSlug(adminSlug);
    }
  } catch {}

  // 5. Cookies
  try {
    const match = document.cookie.match(/(?:^|;\s*)black_line_active_slug=([^;]+)/);
    if (match && match[1] && match[1] !== "demo") {
      return normalizeSlug(decodeURIComponent(match[1]));
    }
  } catch {}

  return defaultFallback;
}

/**
 * Obtener datos de un taller por su slug (Supabase -> LocalStorage -> Fallback)
 */
export async function getBusinessData(slug: string = "demo"): Promise<Business | null> {
  const normSlug = normalizeSlug(slug);

  // 1. Intentar desde Supabase en la nube
  if (supabase) {
    try {
      const candidateSlugs = [normSlug];
      if (normSlug === "the-zone-car-autospa-detailing" || normSlug === "thezone") {
        candidateSlugs.push("the-zone-car-autospa-detailing", "thezone");
      }
      const { data, error } = await supabase
        .from("businesses")
        .select("data")
        .in("slug", Array.from(new Set(candidateSlugs)))
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!error && data?.data && typeof data.data === "object" && (data.data as Business).nombre) {
        return data.data as Business;
      }
    } catch (e) {
      console.warn(`[Supabase] Error leyendo slug "${normSlug}":`, e);
    }
  }

  // 2. Fallback a localStorage local del navegador
  if (typeof window !== "undefined") {
    try {
      const local = localStorage.getItem(getStorageKey(normSlug));
      if (local) {
        return JSON.parse(local) as Business;
      }
      // Chequear legacy key para demo
      if (normSlug === "demo") {
        const legacy = localStorage.getItem("black_line_demo_business_data_v1");
        if (legacy) return JSON.parse(legacy) as Business;
      }
    } catch (e) {
      console.warn("[Storage] Error leyendo local:", e);
    }
  }

  if (normSlug === "mc-detail-detailing") {
    return MC_DETAIL_BUSINESS;
  }

  if (normSlug === "demo" && slug !== "taller-demo") {
    return DEFAULT_DEMO_BUSINESS;
  }

  return null;
}

/**
 * Guardar datos de un taller en Supabase y sincronizar en navegador
 */
export async function saveBusinessData(
  slug: string = "demo",
  updated: Business
): Promise<{ success: boolean; error?: string }> {
  const normSlug = normalizeSlug(slug);

  // 1. Guardar en localStorage para feedback visual instantáneo
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(getStorageKey(normSlug), JSON.stringify(updated));
      if (normSlug === "demo") {
        localStorage.setItem("black_line_demo_business_data_v1", JSON.stringify(updated));
      }
      window.dispatchEvent(new Event("black_line_demo_updated"));
      window.dispatchEvent(new CustomEvent("black_line_biz_updated", { detail: { slug: normSlug } }));
    } catch (e) {
      console.warn("[Storage] Error guardando local:", e);
    }
  }

  // 2. Guardar en Supabase persistente en la nube
  if (supabase) {
    try {
      const slugsToSave = [normSlug];
      if (normSlug === "the-zone-car-autospa-detailing" || normSlug === "thezone") {
        slugsToSave.push("the-zone-car-autospa-detailing", "thezone");
      }
      let saveError: any = null;
      for (const s of Array.from(new Set(slugsToSave))) {
        const { error } = await supabase
          .from("businesses")
          .upsert(
            {
              slug: s,
              data: updated,
              updated_at: new Date().toISOString(),
            },
            { onConflict: "slug" }
          );
        if (error) saveError = error;
      }
      const error = saveError;

      if (error) {
        console.error("[Supabase] Error en upsert:", error);
        return { success: false, error: error.message };
      }
    } catch (e: any) {
      return { success: false, error: e?.message || "Error al conectar con Supabase" };
    }
  }

  return { success: true };
}

/**
 * Restablecer datos a los originales
 */
export async function resetBusinessData(slug: string = "demo"): Promise<void> {
  const normSlug = normalizeSlug(slug);
  if (typeof window !== "undefined") {
    localStorage.removeItem(getStorageKey(normSlug));
    if (normSlug === "demo") {
      localStorage.removeItem("black_line_demo_business_data_v1");
    }
    window.dispatchEvent(new Event("black_line_demo_updated"));
  }
  if (supabase) {
    try {
      const slugsToDelete = [normSlug];
      if (normSlug === "the-zone-car-autospa-detailing" || normSlug === "thezone") {
        slugsToDelete.push("the-zone-car-autospa-detailing", "thezone");
      }
      await supabase.from("businesses").delete().in("slug", Array.from(new Set(slugsToDelete)));
    } catch (e) {
      console.warn("[Supabase] Error borrando slug:", e);
    }
  }
}

/**
 * Suscripción en Tiempo Real a cambios en Supabase
 */
export function subscribeToBusiness(
  slug: string,
  callback: (data: Business) => void
): (() => void) | null {
  if (!supabase) return null;
  const normSlug = normalizeSlug(slug);

  const channel = supabase
    .channel(`realtime-biz-${normSlug}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "businesses",
        filter: `slug=eq.${normSlug}`,
      },
      (payload) => {
        if (payload.eventType === "DELETE") {
          callback(null as any);
        } else if (payload.new && (payload.new as any).data) {
          callback((payload.new as any).data as Business);
        }
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

// Helpers retrocompatibles para no romper nada existente
export const getDemoBusiness = () => getBusinessData("demo").then((b) => b || DEFAULT_DEMO_BUSINESS);
export const saveDemoBusiness = (updated: Business) => saveBusinessData("demo", updated);
export const resetDemoBusiness = () => resetBusinessData("demo");
