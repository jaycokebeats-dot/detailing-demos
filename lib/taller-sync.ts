import { supabase } from "./supabase";

export type MedioPago = "efectivo" | "transferencia" | "cheque" | "tarjeta";

export type ChequeInfo = {
  nroCheque: string;
  banco: string;
  fechaCobro: string; // YYYY-MM-DD
  cobrado: boolean;
};

export type EstadoTrabajo = "agendado" | "en_taller" | "listo" | "entregado";

export type Trabajo = {
  id: string;
  fecha: string; // YYYY-MM-DD
  horaTurno?: string; // HH:mm ej. "09:00"
  vehiculo: string;
  cliente?: string;
  telefono?: string;
  servicios: string[];
  monto: number;
  medioPago: MedioPago;
  chequeData?: ChequeInfo;
  estadoPago: "cobrado" | "pendiente";
  estadoTrabajo?: EstadoTrabajo;
  notas?: string;
  presupuestoId?: string;
};

export type PresupuestoGuardado = {
  id: string;
  fechaCreacion: string; // ISO string
  cliente: string;
  telefono: string;
  vehiculo: string;
  tamanio?: string;
  servicios: string[];
  monto: number;
  estado: "pendiente" | "agendado" | "descartado";
  notas?: string;
  trabajoId?: string;
};

export type GastoCategoria =
  | "alquiler"
  | "luz"
  | "internet"
  | "insumos"
  | "polarizado_ppf"
  | "proveedor"
  | "impuestos"
  | "mantenimiento"
  | "otro";

export type Gasto = {
  id: string;
  fecha: string; // YYYY-MM-DD
  categoria: GastoCategoria;
  concepto: string;
  monto: number;
  medioPago: "efectivo" | "transferencia" | "cheque";
  notas?: string;
};

export type TallerStoreData = {
  trabajos: Trabajo[];
  gastos: Gasto[];
  presupuestos?: PresupuestoGuardado[];
  version?: number;
};

export function getTallerDbKey(slug: string): string {
  const cleanSlug = (slug || "am-centro-de-estetica-vehicular").toLowerCase().trim();
  return `taller_${cleanSlug}`;
}

export function getTallerLocalKey(slug: string, type: "trabajos" | "gastos" | "presupuestos"): string {
  const cleanSlug = (slug || "am-centro-de-estetica-vehicular").toLowerCase().trim();
  return `taller_${type}_${cleanSlug}`;
}

/**
 * Obtener datos del taller (Nube Supabase -> Caché Local)
 */
export async function fetchTallerCloudData(slug: string): Promise<TallerStoreData | null> {
  const dbKey = getTallerDbKey(slug);

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("businesses")
        .select("data, updated_at")
        .eq("slug", dbKey)
        .maybeSingle();

      if (!error && data?.data) {
        const payload = data.data as TallerStoreData;
        if (Array.isArray(payload.trabajos) && Array.isArray(payload.gastos)) {
          const presupuestos = Array.isArray(payload.presupuestos) ? payload.presupuestos : [];
          // Guardar en caché local para próximas cargas ultra rápidas
          if (typeof window !== "undefined") {
            try {
              localStorage.setItem(getTallerLocalKey(slug, "trabajos"), JSON.stringify(payload.trabajos));
              localStorage.setItem(getTallerLocalKey(slug, "gastos"), JSON.stringify(payload.gastos));
              localStorage.setItem(getTallerLocalKey(slug, "presupuestos"), JSON.stringify(presupuestos));
            } catch (err) {
              console.warn("[TallerSync] Error actualizando cache local:", err);
            }
          }
          return {
            ...payload,
            presupuestos,
          };
        }
      }
    } catch (e) {
      console.warn(`[TallerSync] Error leyendo datos de la nube para ${dbKey}:`, e);
    }
  }

  // Fallback a caché local si la nube no responde o no hay internet
  if (typeof window !== "undefined") {
    try {
      const localTrabajos = localStorage.getItem(getTallerLocalKey(slug, "trabajos"));
      const localGastos = localStorage.getItem(getTallerLocalKey(slug, "gastos"));
      const localPresupuestos = localStorage.getItem(getTallerLocalKey(slug, "presupuestos"));
      if (localTrabajos || localGastos || localPresupuestos) {
        return {
          trabajos: localTrabajos ? JSON.parse(localTrabajos) : [],
          gastos: localGastos ? JSON.parse(localGastos) : [],
          presupuestos: localPresupuestos ? JSON.parse(localPresupuestos) : [],
        };
      }
    } catch (err) {
      console.warn("[TallerSync] Error leyendo fallback local:", err);
    }
  }

  return null;
}

/**
 * Guardar datos del taller tanto en Supabase como en LocalStorage
 */
export async function saveTallerCloudData(
  slug: string,
  store: TallerStoreData
): Promise<{ success: boolean; error?: string }> {
  const dbKey = getTallerDbKey(slug);
  const presupuestos = Array.isArray(store.presupuestos) ? store.presupuestos : [];

  // 1. Guardar de inmediato en LocalStorage para respuesta instantánea (optimistic UI)
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(getTallerLocalKey(slug, "trabajos"), JSON.stringify(store.trabajos));
      localStorage.setItem(getTallerLocalKey(slug, "gastos"), JSON.stringify(store.gastos));
      localStorage.setItem(getTallerLocalKey(slug, "presupuestos"), JSON.stringify(presupuestos));
      window.dispatchEvent(new CustomEvent("taller_data_local_updated", { detail: { slug } }));
    } catch (err) {
      console.warn("[TallerSync] Error escribiendo en localStorage:", err);
    }
  }

  // 2. Guardar en Supabase persistente en la nube (compartido entre tablet, celular y PC)
  if (supabase) {
    try {
      const { error } = await supabase
        .from("businesses")
        .upsert(
          {
            slug: dbKey,
            data: {
              ...store,
              presupuestos,
            },
            updated_at: new Date().toISOString(),
          },
          { onConflict: "slug" }
        );

      if (error) {
        console.error("[TallerSync] Error guardando en Supabase:", error);
        return { success: false, error: error.message };
      }
    } catch (e: any) {
      return { success: false, error: e?.message || "Error al conectar con la base de datos" };
    }
  }

  return { success: true };
}

/**
 * Guardar o actualizar un presupuesto individual directamente desde la pantalla de presupuestos
 */
export async function guardarPresupuestoCloud(
  slug: string,
  presupuesto: PresupuestoGuardado
): Promise<{ success: boolean; error?: string }> {
  try {
    const current = (await fetchTallerCloudData(slug)) || { trabajos: [], gastos: [], presupuestos: [] };
    const currentPresupuestos = current.presupuestos || [];

    const idx = currentPresupuestos.findIndex((p) => p.id === presupuesto.id);
    let updatedPresupuestos: PresupuestoGuardado[];
    if (idx >= 0) {
      updatedPresupuestos = [...currentPresupuestos];
      updatedPresupuestos[idx] = presupuesto;
    } else {
      updatedPresupuestos = [presupuesto, ...currentPresupuestos];
    }

    const updatedStore: TallerStoreData = {
      ...current,
      presupuestos: updatedPresupuestos,
    };

    return await saveTallerCloudData(slug, updatedStore);
  } catch (err: any) {
    console.error("[TallerSync] Error al guardar presupuesto en la nube:", err);
    return { success: false, error: err?.message || "Error al guardar presupuesto" };
  }
}

/**
 * Suscripción en Tiempo Real:
 * Si alguien borra, edita o agrega un auto, presupuesto o gasto en el celular o la compu,
 * la tablet se actualiza en vivo al segundo sin tener que recargar la página.
 */
export function subscribeToTallerRealtime(
  slug: string,
  onRemoteUpdate: (data: TallerStoreData) => void
): (() => void) | null {
  if (!supabase) return null;
  const dbKey = getTallerDbKey(slug);

  try {
    const channel = supabase
      .channel(`realtime-taller-${dbKey}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "businesses",
          filter: `slug=eq.${dbKey}`,
        },
        (payload) => {
          if (payload.new && (payload.new as any).data) {
            const fresh = (payload.new as any).data as TallerStoreData;
            if (fresh && Array.isArray(fresh.trabajos) && Array.isArray(fresh.gastos)) {
              const freshPresupuestos = Array.isArray(fresh.presupuestos) ? fresh.presupuestos : [];
              // Actualizar caché local
              if (typeof window !== "undefined") {
                try {
                  localStorage.setItem(getTallerLocalKey(slug, "trabajos"), JSON.stringify(fresh.trabajos));
                  localStorage.setItem(getTallerLocalKey(slug, "gastos"), JSON.stringify(fresh.gastos));
                  localStorage.setItem(getTallerLocalKey(slug, "presupuestos"), JSON.stringify(freshPresupuestos));
                } catch (e) {
                  // ignore
                }
              }
              onRemoteUpdate({
                ...fresh,
                presupuestos: freshPresupuestos,
              });
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  } catch (err) {
    console.warn("[TallerSync] No se pudo inicializar Realtime channel:", err);
    return null;
  }
}
