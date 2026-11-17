import { supabase } from "./supabase";

export type MedioPago = "efectivo" | "transferencia" | "cheque" | "tarjeta";

export type ChequeInfo = {
  nroCheque: string;
  banco: string;
  fechaCobro: string; // YYYY-MM-DD
  cobrado: boolean;
};

export type EstadoTrabajo = "agendado" | "en_taller" | "listo" | "entregado";

export type TrabajoServicioDetalle = {
  nombre: string;
  precio?: number;
  detalle?: string;
};

export type Trabajo = {
  id: string;
  fecha: string; // YYYY-MM-DD
  horaTurno?: string; // HH:mm ej. "09:00"
  vehiculo: string;
  cliente?: string;
  telefono?: string;
  servicios: string[];
  serviciosDetalle?: TrabajoServicioDetalle[];
  monto: number;
  medioPago: MedioPago;
  chequeData?: ChequeInfo;
  estadoPago: "cobrado" | "pendiente";
  estadoTrabajo?: EstadoTrabajo;
  notas?: string;
  presupuestoId?: string;
  recordatorioEnviado?: boolean;
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
  esFijo?: boolean;
};

export type ClienteFrecuente = {
  id: string;
  nombre: string;
  telefono?: string;
  vehiculo?: string;
  fechaUltima?: string;
};

export type TallerStoreData = {
  trabajos: Trabajo[];
  gastos: Gasto[];
  presupuestos?: PresupuestoGuardado[];
  clientes?: ClienteFrecuente[];
  version?: number;
};

/**
 * Capitaliza de forma inteligente nombres de clientes y modelos de vehículos:
 * - Primera letra mayúscula en cada palabra si el usuario lo escribió en minúsculas.
 * - Respeta siglas automotrices reconocidas (BMW, VW, SW4, GTI, GLI, AMG, PPF, TDI, HDI, GR, RS, ST, etc.).
 * - Respeta conectores en español (de, del, la, el, y, en).
 * - Convierte textos en MAYÚSCULAS sostenidas a formato Título.
 */
export function autoCapitalizarTexto(texto: string): string {
  if (!texto) return "";
  const trim = texto.trim();
  if (!trim) return "";

  const conectores = new Set(["de", "del", "la", "el", "y", "en"]);
  const siglas: Record<string, string> = {
    bmw: "BMW",
    vw: "VW",
    sw4: "SW4",
    gti: "GTI",
    gli: "GLI",
    amg: "AMG",
    ppf: "PPF",
    tdi: "TDI",
    hdi: "HDI",
    gr: "GR",
    rs: "RS",
    st: "ST",
    gt: "GT",
    xr: "XR",
    glx: "GLX",
    clx: "CLX",
    xlt: "XLT",
    xl: "XL",
    xls: "XLS",
    ram: "RAM",
    crv: "CR-V",
    hrv: "HR-V",
    rav4: "RAV4",
    hilux: "Hilux",
    amarok: "Amarok",
    ranger: "Ranger",
    corolla: "Corolla",
    corsa: "Corsa",
    gol: "Gol",
    vento: "Vento",
    peugeot: "Peugeot",
    chevrolet: "Chevrolet",
    volkswagen: "Volkswagen",
    ford: "Ford",
    toyota: "Toyota",
    honda: "Honda",
    fiat: "Fiat",
    renault: "Renault",
    audi: "Audi",
    mercedes: "Mercedes",
    benz: "Benz",
    nissan: "Nissan",
    jeep: "Jeep",
    citroen: "Citroën",
    citroën: "Citroën",
    hyundai: "Hyundai",
    kia: "Kia",
  };

  return trim
    .split(/\s+/)
    .map((palabra, index) => {
      if (!palabra) return "";
      const lower = palabra.toLowerCase().replace(/[^a-záéíóúüñ0-9]/g, "");
      if (siglas[lower]) {
        return palabra.replace(new RegExp(lower, "i"), siglas[lower]);
      }
      if (index > 0 && conectores.has(palabra.toLowerCase())) {
        return palabra.toLowerCase();
      }
      if (palabra === palabra.toUpperCase() && palabra.length > 3) {
        return palabra.charAt(0).toUpperCase() + palabra.slice(1).toLowerCase();
      }
      return palabra.charAt(0).toUpperCase() + palabra.slice(1);
    })
    .join(" ");
}

export function getTallerDbKey(slug: string): string {
  const cleanSlug = (slug || "am-centro-de-estetica-vehicular").toLowerCase().trim();
  return `taller_${cleanSlug}`;
}

export function getTallerLocalKey(slug: string, type: "trabajos" | "gastos" | "presupuestos" | "clientes"): string {
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
          const clientes = Array.isArray(payload.clientes) ? payload.clientes : [];
          // Guardar en caché local para próximas cargas ultra rápidas
          if (typeof window !== "undefined") {
            try {
              localStorage.setItem(getTallerLocalKey(slug, "trabajos"), JSON.stringify(payload.trabajos));
              localStorage.setItem(getTallerLocalKey(slug, "gastos"), JSON.stringify(payload.gastos));
              localStorage.setItem(getTallerLocalKey(slug, "presupuestos"), JSON.stringify(presupuestos));
              localStorage.setItem(getTallerLocalKey(slug, "clientes"), JSON.stringify(clientes));
            } catch (err) {
              console.warn("[TallerSync] Error actualizando cache local:", err);
            }
          }
          return {
            ...payload,
            presupuestos,
            clientes,
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
      const localClientes = localStorage.getItem(getTallerLocalKey(slug, "clientes"));
      if (localTrabajos !== null || localGastos !== null || localPresupuestos !== null || localClientes !== null) {
        return {
          trabajos: localTrabajos ? JSON.parse(localTrabajos) : [],
          gastos: localGastos ? JSON.parse(localGastos) : [],
          presupuestos: localPresupuestos ? JSON.parse(localPresupuestos) : [],
          clientes: localClientes ? JSON.parse(localClientes) : [],
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
  const clientes = Array.isArray(store.clientes) ? store.clientes : [];

  // 1. Guardar de inmediato en LocalStorage para respuesta instantánea (optimistic UI)
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(getTallerLocalKey(slug, "trabajos"), JSON.stringify(store.trabajos));
      localStorage.setItem(getTallerLocalKey(slug, "gastos"), JSON.stringify(store.gastos));
      localStorage.setItem(getTallerLocalKey(slug, "presupuestos"), JSON.stringify(presupuestos));
      localStorage.setItem(getTallerLocalKey(slug, "clientes"), JSON.stringify(clientes));
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
              clientes,
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
