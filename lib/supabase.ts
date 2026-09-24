import { createClient } from "@supabase/supabase-js";
import type { Business } from "@/data/business-helpers";
import { DEFAULT_DEMO_BUSINESS } from "@/data/demo-business";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const supabase = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

const DEMO_STORAGE_KEY = "black_line_demo_business_data_v1";

export async function getDemoBusiness(): Promise<Business> {
  // 1. Intentar desde Supabase si está configurado
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("businesses")
        .select("data")
        .eq("slug", "demo")
        .single();

      if (!error && data?.data) {
        return data.data as Business;
      }
    } catch (e) {
      console.warn("Error leyendo de Supabase, usando fallback local:", e);
    }
  }

  // 2. Fallback a localStorage en cliente
  if (typeof window !== "undefined") {
    try {
      const local = localStorage.getItem(DEMO_STORAGE_KEY);
      if (local) {
        return JSON.parse(local) as Business;
      }
    } catch (e) {
      console.warn("Error leyendo localStorage:", e);
    }
  }

  return DEFAULT_DEMO_BUSINESS;
}

export async function saveDemoBusiness(updated: Business): Promise<{ success: boolean; error?: string }> {
  // Guardar en localStorage siempre para respuesta instantánea en navegador
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn("Error guardando en localStorage:", e);
    }
  }

  // Guardar en Supabase si el cliente está conectado
  if (supabase) {
    try {
      const { error } = await supabase
        .from("businesses")
        .upsert({ slug: "demo", data: updated, updated_at: new Date().toISOString() }, { onConflict: "slug" });

      if (error) {
        return { success: false, error: error.message };
      }
    } catch (e: any) {
      return { success: false, error: e?.message || "Error al conectar con Supabase" };
    }
  }

  return { success: true };
}

export async function resetDemoBusiness(): Promise<void> {
  if (typeof window !== "undefined") {
    localStorage.removeItem(DEMO_STORAGE_KEY);
  }
  if (supabase) {
    try {
      await supabase.from("businesses").delete().eq("slug", "demo");
    } catch (e) {
      console.warn("Error al borrar en Supabase:", e);
    }
  }
}
