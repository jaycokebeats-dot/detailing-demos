"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import type { Business } from "@/data/business-helpers";
import { DEFAULT_DEMO_BUSINESS } from "@/data/demo-business";
import { getBusinessData } from "@/lib/supabase";
import {
  MedioPago,
  ChequeInfo,
  Trabajo,
  GastoCategoria,
  Gasto,
  TallerStoreData,
  fetchTallerCloudData,
  saveTallerCloudData,
  subscribeToTallerRealtime,
} from "@/lib/taller-sync";
import {
  FaCar,
  FaMoneyBillWave,
  FaMoneyCheckAlt,
  FaCalendarAlt,
  FaFileInvoiceDollar,
  FaPlus,
  FaTrash,
  FaEye,
  FaEyeSlash,
  FaDownload,
  FaArrowUp,
  FaArrowDown,
  FaBuilding,
  FaWifi,
  FaBolt,
  FaSprayCan,
  FaCheckCircle,
  FaExclamationTriangle,
  FaWhatsapp,
  FaSearch,
  FaTabletAlt,
  FaTimes,
  FaShieldAlt,
  FaCloud,
  FaSyncAlt,
  FaUndo,
} from "react-icons/fa";

// Tipos importados desde @/lib/taller-sync

const CATEGORIAS_GASTO_CONFIG: Record<
  GastoCategoria,
  { label: string; icon: string; color: string }
> = {
  alquiler: { label: "Alquiler Taller", icon: "🏢", color: "#38bdf8" },
  luz: { label: "Luz / Electricidad", icon: "⚡", color: "#fbbf24" },
  internet: { label: "Internet / Teléfono", icon: "🌐", color: "#818cf8" },
  insumos: { label: "Insumos Detailing", icon: "🧽", color: "#34d399" },
  polarizado_ppf: { label: "Láminas & PPF", icon: "🛡️", color: "#38bdf8" },
  proveedor: { label: "Proveedores Varios", icon: "📦", color: "#f472b6" },
  impuestos: { label: "Impuestos / Tasas", icon: "🏛️", color: "#fb7185" },
  mantenimiento: { label: "Mantenimiento / Taller", icon: "🔧", color: "#a78bfa" },
  otro: { label: "Otros Gastos", icon: "🏷️", color: "#94a3b8" },
};

const SERVICIOS_SUGERIDOS_DEFAULT = [
  "Pulidos y Tratamientos",
  "Limpiezas de Interior",
  "Polarizados",
  "PPF Patentes / Zonas",
  "Pintura y Llantas",
  "Limpieza Motor y Chasis",
  "Sacabollos y Microbollos",
  "Iluminación LED y Ópticas",
  "Accesorios 4x4",
];

// Helper: Formato Pesos Argentinos ($ 450.000)
function formatPesos(monto: number, ocultar = false): string {
  if (ocultar) return "$ ••••••";
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(monto);
}

// Helper: Formato de Fecha (DD/MM/AAAA)
function formatFechaVisual(fechaIso: string): string {
  if (!fechaIso) return "-";
  const [y, m, d] = fechaIso.split("-");
  return `${d}/${m}/${y}`;
}

// Datos de ejemplo iniciales para que Ariel entienda la herramienta al instante
function getInitialData(slug: string): { trabajos: Trabajo[]; gastos: Gasto[] } {
  const hoy = new Date();
  const yyyy = hoy.getFullYear();
  const mm = String(hoy.getMonth() + 1).padStart(2, "0");

  const trabajosIniciales: Trabajo[] = [
    {
      id: "trabajo-1",
      fecha: `${yyyy}-${mm}-04`,
      vehiculo: "Ford Ranger XLT",
      cliente: "Martín Rossi",
      telefono: "3534123456",
      servicios: ["Pulidos y Tratamientos", "Polarizados"],
      monto: 480000,
      medioPago: "cheque",
      chequeData: {
        nroCheque: "04829102",
        banco: "Banco Macro",
        fechaCobro: `${yyyy}-${mm}-28`,
        cobrado: false,
      },
      estadoPago: "pendiente",
      notas: "Polarizado SunControl y tratamiento cerámico",
    },
    {
      id: "trabajo-2",
      fecha: `${yyyy}-${mm}-06`,
      vehiculo: "Toyota Hilux SRV",
      cliente: "Gonzalo V.",
      telefono: "3534789012",
      servicios: ["Limpiezas de Interior", "PPF Patentes / Zonas"],
      monto: 435000,
      medioPago: "transferencia",
      estadoPago: "cobrado",
      notas: "Limpieza profunda de cuero y PPF en ambas chapas",
    },
    {
      id: "trabajo-3",
      fecha: `${yyyy}-${mm}-08`,
      vehiculo: "Volkswagen Vento 2.0 TSI",
      cliente: "Carlos M.",
      telefono: "3535987654",
      servicios: ["Pulidos y Tratamientos", "Pintura y Llantas"],
      monto: 520000,
      medioPago: "efectivo",
      estadoPago: "cobrado",
      notas: "Diamantado de las 4 ruedas y abrillantado general",
    },
  ];

  const gastosIniciales: Gasto[] = [
    {
      id: "gasto-1",
      fecha: `${yyyy}-${mm}-02`,
      categoria: "alquiler",
      concepto: "Alquiler Galpón Taller (Av. Colón)",
      monto: 320000,
      medioPago: "transferencia",
      notas: "Inmobiliaria Colón",
    },
    {
      id: "gasto-2",
      fecha: `${yyyy}-${mm}-05`,
      categoria: "insumos",
      concepto: "Pastas de pulir, pads y cerámicos",
      monto: 145000,
      medioPago: "transferencia",
      notas: "Distribuidor Insumos Cba",
    },
    {
      id: "gasto-3",
      fecha: `${yyyy}-${mm}-07`,
      categoria: "internet",
      concepto: "Internet fibra óptica negocio",
      monto: 28000,
      medioPago: "efectivo",
      notas: "Abono mensual",
    },
  ];

  return { trabajos: trabajosIniciales, gastos: gastosIniciales };
}

export default function TallerGestionPage() {
  const [biz, setBiz] = useState<Business>(DEFAULT_DEMO_BUSINESS);
  const [currentSlug, setCurrentSlug] = useState<string>("am-centro-de-estetica-vehicular");
  const [loading, setLoading] = useState<boolean>(true);

  // Estados de datos principales
  const [trabajos, setTrabajos] = useState<Trabajo[]>([]);
  const [gastos, setGastos] = useState<Gasto[]>([]);
  const [syncStatus, setSyncStatus] = useState<"synced" | "saving" | "offline">("synced");
  const [ultimoEliminado, setUltimoEliminado] = useState<{
    tipo: "trabajo" | "gasto";
    itemTrabajo?: Trabajo;
    itemGasto?: Gasto;
  } | null>(null);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const trabajosRef = useRef<Trabajo[]>([]);
  const gastosRef = useRef<Gasto[]>([]);

  useEffect(() => {
    trabajosRef.current = trabajos;
  }, [trabajos]);

  useEffect(() => {
    gastosRef.current = gastos;
  }, [gastos]);

  // Pestaña activa: trabajos, gastos, cheques, balance
  const [activeTab, setActiveTab] = useState<"trabajos" | "gastos" | "cheques" | "balance">("trabajos");

  // Filtro de mes (formato YYYY-MM)
  const currentMonthStr = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  }, []);
  const [mesFiltro, setMesFiltro] = useState<string>(currentMonthStr);

  // Modo privacidad (ocultar montos para usar tablet frente al público)
  const [ocultarMontos, setOcultarMontos] = useState<boolean>(false);

  // Buscador de trabajos
  const [busquedaTrabajos, setBusquedaTrabajos] = useState<string>("");

  // Modales
  const [modalTrabajoOpen, setModalTrabajoOpen] = useState<boolean>(false);
  const [modalGastoOpen, setModalGastoOpen] = useState<boolean>(false);
  const [modalChequeOpen, setModalChequeOpen] = useState<boolean>(false);

  // Formulario de Cheque Directo
  const [formChequeBanco, setFormChequeBanco] = useState<string>("");
  const [formChequeNro, setFormChequeNro] = useState<string>("");
  const [formChequeMonto, setFormChequeMonto] = useState<string>("");
  const [formChequeFechaCobro, setFormChequeFechaCobro] = useState<string>("");
  const [formChequeConcepto, setFormChequeConcepto] = useState<string>("");
  const [formChequeCliente, setFormChequeCliente] = useState<string>("");
  const [formChequeTelefono, setFormChequeTelefono] = useState<string>("");
  const [formChequeNotas, setFormChequeNotas] = useState<string>("");
  const [modalInstallOpen, setModalInstallOpen] = useState<boolean>(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Formulario de Nuevo Trabajo
  const [formTrabajoFecha, setFormTrabajoFecha] = useState<string>("");
  const [formTrabajoVehiculo, setFormTrabajoVehiculo] = useState<string>("");
  const [formTrabajoCliente, setFormTrabajoCliente] = useState<string>("");
  const [formTrabajoTelefono, setFormTrabajoTelefono] = useState<string>("");
  const [formTrabajoServicios, setFormTrabajoServicios] = useState<string[]>([]);
  const [formTrabajoOtroServicio, setFormTrabajoOtroServicio] = useState<string>("");
  const [formTrabajoMonto, setFormTrabajoMonto] = useState<string>("");
  const [formTrabajoMedioPago, setFormTrabajoMedioPago] = useState<MedioPago>("efectivo");
  const [formTrabajoChequeNro, setFormTrabajoChequeNro] = useState<string>("");
  const [formTrabajoChequeBanco, setFormTrabajoChequeBanco] = useState<string>("");
  const [formTrabajoChequeVencimiento, setFormTrabajoChequeVencimiento] = useState<string>("");
  const [formTrabajoNotas, setFormTrabajoNotas] = useState<string>("");

  // Formulario de Nuevo Gasto
  const [formGastoFecha, setFormGastoFecha] = useState<string>("");
  const [formGastoCategoria, setFormGastoCategoria] = useState<GastoCategoria>("insumos");
  const [formGastoConcepto, setFormGastoConcepto] = useState<string>("");
  const [formGastoMonto, setFormGastoMonto] = useState<string>("");
  const [formGastoMedioPago, setFormGastoMedioPago] = useState<"efectivo" | "transferencia" | "cheque">("transferencia");
  const [formGastoNotas, setFormGastoNotas] = useState<string>("");

  const showToast = (msg: string, durationMs = 3500) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToastMsg(msg);
    toastTimeoutRef.current = setTimeout(() => {
      setToastMsg(null);
      setUltimoEliminado(null);
    }, durationMs);
  };

  const handleDeshacer = () => {
    if (!ultimoEliminado) return;
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);

    if (ultimoEliminado.tipo === "trabajo" && ultimoEliminado.itemTrabajo) {
      const restaurado = [ultimoEliminado.itemTrabajo, ...trabajosRef.current];
      guardarTrabajos(restaurado);
      setToastMsg(`✅ ${ultimoEliminado.itemTrabajo.vehiculo} recuperado con éxito.`);
    } else if (ultimoEliminado.tipo === "gasto" && ultimoEliminado.itemGasto) {
      const restaurado = [ultimoEliminado.itemGasto, ...gastosRef.current];
      guardarGastos(restaurado);
      setToastMsg(`✅ Gasto "${ultimoEliminado.itemGasto.concepto}" recuperado.`);
    }

    setUltimoEliminado(null);
    toastTimeoutRef.current = setTimeout(() => setToastMsg(null), 3000);
  };

  // Guardar de forma sincronizada en Supabase (Nube) y LocalStorage (Caché local)
  const guardarDatos = async (nuevosTrabajos: Trabajo[], nuevosGastos: Gasto[]) => {
    setTrabajos(nuevosTrabajos);
    setGastos(nuevosGastos);
    setSyncStatus("saving");
    const res = await saveTallerCloudData(currentSlug, {
      trabajos: nuevosTrabajos,
      gastos: nuevosGastos,
    });
    if (res.success) {
      setSyncStatus("synced");
    } else {
      setSyncStatus("offline");
      showToast("⚠️ Guardado en este equipo (sin internet a la base de datos)");
    }
  };

  const guardarTrabajos = (nuevos: Trabajo[]) => {
    guardarDatos(nuevos, gastosRef.current);
  };

  const guardarGastos = (nuevos: Gasto[]) => {
    guardarDatos(trabajosRef.current, nuevos);
  };

  // 1. Cargar datos del taller por Slug y sincronizar en Tiempo Real
  useEffect(() => {
    let unsubscribe: (() => void) | null = null;

    async function loadWorkshop() {
      try {
        const params = new URLSearchParams(window.location.search);
        const slug = (params.get("slug") || params.get("taller") || "am-centro-de-estetica-vehicular")
          .toLowerCase()
          .trim();
        setCurrentSlug(slug);

        // Supabase o API para info general del taller
        const sbData = await getBusinessData(slug);
        if (sbData && sbData.nombre) {
          setBiz(sbData);
        } else {
          const res = await fetch(`/api/workshops?slug=${encodeURIComponent(slug)}`);
          if (res.ok) {
            const data = await res.json();
            setBiz(data);
          }
        }

        // Paso A: Cargar inmediatamente de caché local (para 0ms de espera visual)
        const storageKeyTrabajos = `taller_trabajos_${slug}`;
        const storageKeyGastos = `taller_gastos_${slug}`;
        const savedTrabajos = localStorage.getItem(storageKeyTrabajos);
        const savedGastos = localStorage.getItem(storageKeyGastos);

        if (savedTrabajos && savedGastos) {
          try {
            setTrabajos(JSON.parse(savedTrabajos));
            setGastos(JSON.parse(savedGastos));
          } catch (err) {
            // ignore
          }
        } else {
          const init = getInitialData(slug);
          setTrabajos(init.trabajos);
          setGastos(init.gastos);
        }

        // Paso B: Conectar a la base de datos en la nube (Supabase)
        setSyncStatus("saving");
        const cloudData = await fetchTallerCloudData(slug);
        if (cloudData && Array.isArray(cloudData.trabajos) && Array.isArray(cloudData.gastos)) {
          setTrabajos(cloudData.trabajos);
          setGastos(cloudData.gastos);
          setSyncStatus("synced");
        } else {
          // Si es la primera vez que entra, sembramos en la base de datos
          const init = getInitialData(slug);
          await saveTallerCloudData(slug, init);
          setTrabajos(init.trabajos);
          setGastos(init.gastos);
          setSyncStatus("synced");
        }

        // Paso C: Suscribirse en Tiempo Real (si alguien borra/agrega en celu, se refleja en tablet)
        unsubscribe = subscribeToTallerRealtime(slug, (fresh) => {
          setTrabajos(fresh.trabajos);
          setGastos(fresh.gastos);
          setSyncStatus("synced");
          showToast("🔄 Sincronizado en vivo con otro dispositivo");
        });
      } catch (e) {
        console.error("Error al cargar datos del taller:", e);
        setSyncStatus("offline");
      } finally {
        setLoading(false);
      }
    }

    loadWorkshop();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Lista de servicios sugeridos (usa los servicios reales del taller si existen)
  const serviciosOpciones = useMemo(() => {
    if (biz.servicios && biz.servicios.length > 0) {
      return biz.servicios.map((s) => s.nombre);
    }
    return SERVICIOS_SUGERIDOS_DEFAULT;
  }, [biz.servicios]);

  // Trabajos filtrados por mes actual y búsqueda
  const trabajosMes = useMemo(() => {
    return trabajos.filter((t) => {
      const matchMes = t.fecha.startsWith(mesFiltro);
      if (!matchMes) return false;
      if (!busquedaTrabajos.trim()) return true;
      const q = busquedaTrabajos.toLowerCase();
      return (
        t.vehiculo.toLowerCase().includes(q) ||
        (t.cliente && t.cliente.toLowerCase().includes(q)) ||
        t.servicios.some((s) => s.toLowerCase().includes(q))
      );
    });
  }, [trabajos, mesFiltro, busquedaTrabajos]);

  // Gastos filtrados por mes
  const gastosMes = useMemo(() => {
    return gastos.filter((g) => g.fecha.startsWith(mesFiltro));
  }, [gastos, mesFiltro]);

  // Todos los cheques (en cartera y cobrados)
  const todosCheques = useMemo(() => {
    const list: {
      trabajoId: string;
      vehiculo: string;
      cliente?: string;
      monto: number;
      cheque: ChequeInfo;
    }[] = [];

    trabajos.forEach((t) => {
      if (t.medioPago === "cheque" && t.chequeData) {
        list.push({
          trabajoId: t.id,
          vehiculo: t.vehiculo,
          cliente: t.cliente,
          monto: t.monto,
          cheque: t.chequeData,
        });
      }
    });

    // Ordenar: primero los pendientes por fecha de cobro ascendente
    return list.sort((a, b) => {
      if (a.cheque.cobrado !== b.cheque.cobrado) {
        return a.cheque.cobrado ? 1 : -1;
      }
      return a.cheque.fechaCobro.localeCompare(b.cheque.fechaCobro);
    });
  }, [trabajos]);

  // Cheques pendientes
  const chequesPendientes = useMemo(() => {
    return todosCheques.filter((c) => !c.cheque.cobrado);
  }, [todosCheques]);

  // Métricas financieras del mes
  const metricas = useMemo(() => {
    const totalIngresos = trabajosMes.reduce((acc, t) => acc + t.monto, 0);
    const totalGastos = gastosMes.reduce((acc, g) => acc + g.monto, 0);
    const gananciaNeta = totalIngresos - totalGastos;
    const margen = totalIngresos > 0 ? Math.round((gananciaNeta / totalIngresos) * 100) : 0;

    const chequesEnCarteraMonto = chequesPendientes.reduce((acc, c) => acc + c.monto, 0);
    const totalAutos = trabajosMes.length;

    return {
      totalIngresos,
      totalGastos,
      gananciaNeta,
      margen,
      chequesEnCarteraMonto,
      totalAutos,
    };
  }, [trabajosMes, gastosMes, chequesPendientes]);

  // Manejar creación de nuevo Trabajo
  const handleCrearTrabajo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTrabajoVehiculo.trim()) {
      showToast("⚠️ Ingresá el modelo del vehículo.");
      return;
    }
    const montoNum = parseFloat(formTrabajoMonto.replace(/[^\d]/g, "")) || 0;
    if (montoNum <= 0) {
      showToast("⚠️ Ingresá un monto válido.");
      return;
    }

    const hoyIso = new Date().toISOString().split("T")[0];
    const fechaFinal = formTrabajoFecha || hoyIso;

    let serviciosFinales = [...formTrabajoServicios];
    if (formTrabajoOtroServicio.trim()) {
      serviciosFinales.push(formTrabajoOtroServicio.trim());
    }
    if (serviciosFinales.length === 0) {
      serviciosFinales = ["Servicio General"];
    }

    let chequeFinal: ChequeInfo | undefined = undefined;
    if (formTrabajoMedioPago === "cheque") {
      chequeFinal = {
        nroCheque: formTrabajoChequeNro.trim() || "S/N",
        banco: formTrabajoChequeBanco.trim() || "Banco",
        fechaCobro: formTrabajoChequeVencimiento || fechaFinal,
        cobrado: false,
      };
    }

    const nuevoTrabajo: Trabajo = {
      id: `trabajo-${Date.now()}`,
      fecha: fechaFinal,
      vehiculo: formTrabajoVehiculo.trim(),
      cliente: formTrabajoCliente.trim() || undefined,
      telefono: formTrabajoTelefono.trim() || undefined,
      servicios: serviciosFinales,
      monto: montoNum,
      medioPago: formTrabajoMedioPago,
      chequeData: chequeFinal,
      estadoPago: formTrabajoMedioPago === "cheque" ? "pendiente" : "cobrado",
      notas: formTrabajoNotas.trim() || undefined,
    };

    guardarTrabajos([nuevoTrabajo, ...trabajos]);

    // Reset form
    setFormTrabajoVehiculo("");
    setFormTrabajoCliente("");
    setFormTrabajoTelefono("");
    setFormTrabajoServicios([]);
    setFormTrabajoOtroServicio("");
    setFormTrabajoMonto("");
    setFormTrabajoNotas("");
    setFormTrabajoChequeNro("");
    setFormTrabajoChequeBanco("");
    setFormTrabajoChequeVencimiento("");
    setFormTrabajoMedioPago("efectivo");
    setModalTrabajoOpen(false);

    showToast(`✅ ¡${nuevoTrabajo.vehiculo} registrado con éxito!`);
  };

  // Manejar creación de Cheque directo en Cartera
  const handleCrearChequeDirecto = (e: React.FormEvent) => {
    e.preventDefault();
    const montoNum = parseFloat(formChequeMonto.replace(/[^\d]/g, "")) || 0;
    if (montoNum <= 0) {
      showToast("⚠️ Ingresá un monto válido para el cheque.");
      return;
    }
    if (!formChequeBanco.trim()) {
      showToast("⚠️ Ingresá el banco emisor del cheque.");
      return;
    }

    const hoyIso = new Date().toISOString().split("T")[0];
    const fechaCobroFinal = formChequeFechaCobro || hoyIso;

    const nuevoChequeTrabajo: Trabajo = {
      id: `cheque-${Date.now()}`,
      fecha: fechaCobroFinal,
      vehiculo: formChequeConcepto.trim() || `Cheque ${formChequeBanco.trim()}`,
      cliente: formChequeCliente.trim() || undefined,
      telefono: formChequeTelefono.trim() || undefined,
      servicios: ["Cheque en Cartera"],
      monto: montoNum,
      medioPago: "cheque",
      chequeData: {
        nroCheque: formChequeNro.trim() || "S/N",
        banco: formChequeBanco.trim(),
        fechaCobro: fechaCobroFinal,
        cobrado: false,
      },
      estadoPago: "pendiente",
      notas: formChequeNotas.trim() || undefined,
    };

    guardarTrabajos([nuevoChequeTrabajo, ...trabajos]);
    setModalChequeOpen(false);

    // Reset form
    setFormChequeBanco("");
    setFormChequeNro("");
    setFormChequeMonto("");
    setFormChequeConcepto("");
    setFormChequeCliente("");
    setFormChequeTelefono("");
    setFormChequeFechaCobro("");
    setFormChequeNotas("");

    showToast(`✅ Cheque de ${nuevoChequeTrabajo.chequeData?.banco} N° ${nuevoChequeTrabajo.chequeData?.nroCheque} cargado en cartera.`);
  };

  // Manejar creación de nuevo Gasto
  const handleCrearGasto = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formGastoConcepto.trim()) {
      showToast("⚠️ Ingresá el concepto del gasto.");
      return;
    }
    const montoNum = parseFloat(formGastoMonto.replace(/[^\d]/g, "")) || 0;
    if (montoNum <= 0) {
      showToast("⚠️ Ingresá un monto válido.");
      return;
    }

    const hoyIso = new Date().toISOString().split("T")[0];
    const fechaFinal = formGastoFecha || hoyIso;

    const nuevoGasto: Gasto = {
      id: `gasto-${Date.now()}`,
      fecha: fechaFinal,
      categoria: formGastoCategoria,
      concepto: formGastoConcepto.trim(),
      monto: montoNum,
      medioPago: formGastoMedioPago,
      notas: formGastoNotas.trim() || undefined,
    };

    guardarGastos([nuevoGasto, ...gastos]);

    // Reset
    setFormGastoConcepto("");
    setFormGastoMonto("");
    setFormGastoNotas("");
    setModalGastoOpen(false);

    showToast(`✅ Gasto de ${formatPesos(nuevoGasto.monto)} guardado.`);
  };

  // Marcar Cheque como Cobrado / Pendiente
  const toggleCobroCheque = (trabajoId: string) => {
    const actualizados = trabajos.map((t) => {
      if (t.id === trabajoId && t.chequeData) {
        const nuevoEstado = !t.chequeData.cobrado;
        return {
          ...t,
          estadoPago: (nuevoEstado ? "cobrado" : "pendiente") as "cobrado" | "pendiente",
          chequeData: {
            ...t.chequeData,
            cobrado: nuevoEstado,
          },
        };
      }
      return t;
    });

    guardarTrabajos(actualizados);
    showToast("💳 Estado del cheque actualizado.");
  };

  // Eliminar Trabajo (con confirmación rápida y opción de Deshacer)
  const handleEliminarTrabajo = (id: string, vehiculo: string) => {
    const item = trabajos.find((t) => t.id === id);
    if (!item) return;

    if (window.confirm(`¿Seguro que querés eliminar el registro de ${vehiculo}?`)) {
      const nuevos = trabajos.filter((t) => t.id !== id);
      guardarTrabajos(nuevos);
      setUltimoEliminado({ tipo: "trabajo", itemTrabajo: item });
      showToast(`🗑️ ${vehiculo} eliminado. ¿Fue un error? Podés deshacerlo 👉`, 7000);
    }
  };

  // Eliminar Gasto
  const handleEliminarGasto = (id: string, concepto: string) => {
    const item = gastos.find((g) => g.id === id);
    if (!item) return;

    if (window.confirm(`¿Seguro que querés eliminar el gasto "${concepto}"?`)) {
      const nuevos = gastos.filter((g) => g.id !== id);
      guardarGastos(nuevos);
      setUltimoEliminado({ tipo: "gasto", itemGasto: item });
      showToast(`🗑️ Gasto "${concepto}" eliminado. ¿Fue un error? Podés deshacerlo 👉`, 7000);
    }
  };

  // Restablecer datos de ejemplo para demostración
  const handleRestablecerEjemplos = async () => {
    if (
      window.confirm(
        "¿Querés restablecer los datos de ejemplo (Ford Ranger con cheque en cartera, Toyota Hilux y VW Vento)?"
      )
    ) {
      const init = getInitialData(currentSlug);
      await guardarDatos(init.trabajos, init.gastos);
      showToast("✅ Datos de demostración restablecidos con éxito.");
    }
  };

  // Exportar backup completo en JSON
  const handleExportarDatos = () => {
    const dataBackup = {
      taller: biz.nombre,
      slug: currentSlug,
      fechaExportacion: new Date().toISOString(),
      trabajos,
      gastos,
    };

    const blob = new Blob([JSON.stringify(dataBackup, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `backup-taller-${currentSlug}-${mesFiltro}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("📥 Backup descargado con éxito.");
  };

  // Generar reporte de texto para WhatsApp
  const compartirResumenWhatsApp = () => {
    const [y, m] = mesFiltro.split("-");
    const meses = [
      "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
      "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];
    const nombreMes = meses[parseInt(m, 10) - 1] || mesFiltro;

    const texto = `📊 *RESUMEN MENSUAL DE TALLER - ${biz.nombre.toUpperCase()}*
🗓️ *Período:* ${nombreMes} ${y}

🚗 *Vehículos Atendidos:* ${metricas.totalAutos}
💰 *Total Facturado:* ${formatPesos(metricas.totalIngresos)}
📉 *Total Gastos:* ${formatPesos(metricas.totalGastos)}
━━━━━━━━━━━━━━━━━━━
💎 *GANANCIA NETA:* ${formatPesos(metricas.gananciaNeta)} (${metricas.margen}% margen)

💳 *Cheques en Cartera:* ${formatPesos(metricas.chequesEnCarteraMonto)} (${chequesPendientes.length} pendientes)

_Generado automáticamente desde el Sistema de Control de Taller._`;

    const url = `https://wa.me/?text=${encodeURIComponent(texto)}`;
    window.open(url, "_blank");
  };

  return (
    <div className="min-h-screen bg-[#070b12] text-slate-100 flex flex-col font-sans selection:bg-sky-500/30 selection:text-sky-200">
      {/* Toast flotante con botón de Deshacer */}
      {toastMsg && (
        <div className="fixed top-4 right-4 z-50 bg-[#0e1726] border border-sky-500/50 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-fade-in text-sm font-semibold">
          <span>{toastMsg}</span>
          {ultimoEliminado && (
            <button
              type="button"
              onClick={handleDeshacer}
              className="px-3 py-1 bg-sky-400 hover:bg-sky-300 text-slate-950 font-bold text-xs rounded-lg transition-transform active:scale-95 flex items-center gap-1.5 shadow-[0_0_12px_rgba(56,189,248,0.5)] cursor-pointer"
            >
              <FaUndo className="size-3" />
              <span>Deshacer</span>
            </button>
          )}
        </div>
      )}

      {/* HEADER SUPERIOR */}
      <header className="sticky top-0 z-40 bg-[#0b101c]/95 backdrop-blur-md border-b border-sky-500/15 px-4 sm:px-8 py-3.5 flex flex-wrap items-center justify-between gap-3 shadow-lg">
        {/* Identidad del taller */}
        <div className="flex items-center gap-3">
          {biz.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={biz.logo_url}
              alt={biz.nombre}
              className="h-9 sm:h-11 w-auto max-w-[180px] sm:max-w-[240px] object-contain drop-shadow-[0_2px_12px_rgba(56,189,248,0.4)]"
            />
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-xl">💎</span>
              <span className="font-bold text-white tracking-wide">{biz.nombre}</span>
            </div>
          )}
          <span className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wider uppercase bg-sky-950/60 text-sky-300 border border-sky-500/30">
            <span className="size-1.5 rounded-full bg-sky-400 animate-pulse" />
            Control de Taller & Caja
          </span>
        </div>

        {/* Controles de cabecera */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Indicador de Base de Datos en la Nube */}
          <div
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all ${
              syncStatus === "synced"
                ? "bg-emerald-950/50 border-emerald-500/40 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.15)]"
                : syncStatus === "saving"
                ? "bg-sky-950/50 border-sky-500/40 text-sky-300"
                : "bg-amber-950/50 border-amber-500/40 text-amber-300"
            }`}
            title={
              syncStatus === "synced"
                ? "Conectado a la base de datos en la nube. Tablet, celular y PC sincronizados en vivo."
                : syncStatus === "saving"
                ? "Guardando cambios en la nube..."
                : "Modo sin conexión. Guardado en la memoria de este equipo."
            }
          >
            {syncStatus === "saving" ? (
              <FaSyncAlt className="size-2.5 animate-spin text-sky-400" />
            ) : (
              <span
                className={`size-1.5 rounded-full ${
                  syncStatus === "synced"
                    ? "bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.9)] animate-pulse"
                    : "bg-amber-400"
                }`}
              />
            )}
            <span className="hidden sm:inline">
              {syncStatus === "synced" ? "En la Nube" : syncStatus === "saving" ? "Guardando..." : "Sin Conexión"}
            </span>
            <FaCloud className="size-3 opacity-80" />
          </div>
          {/* Selector de Mes */}
          <div className="flex items-center gap-1.5 bg-[#121c2e] border border-sky-500/25 rounded-xl px-2.5 py-1.5 text-xs text-sky-200">
            <FaCalendarAlt className="size-3.5 text-sky-400 shrink-0" />
            <input
              type="month"
              value={mesFiltro}
              onChange={(e) => setMesFiltro(e.target.value)}
              className="bg-transparent border-none text-xs font-semibold text-white focus:outline-none cursor-pointer"
            />
          </div>

          {/* Botón modo privacidad */}
          <button
            type="button"
            onClick={() => setOcultarMontos(!ocultarMontos)}
            className={`p-2 rounded-xl border text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
              ocultarMontos
                ? "bg-amber-950/40 border-amber-500/40 text-amber-300"
                : "bg-[#121c2e] border-sky-500/25 text-slate-300 hover:text-white"
            }`}
            title={ocultarMontos ? "Mostrar números" : "Ocultar números (Modo Mostrador)"}
          >
            {ocultarMontos ? <FaEyeSlash className="size-4" /> : <FaEye className="size-4" />}
            <span className="hidden sm:inline">{ocultarMontos ? "Montos ocultos" : "Privacidad"}</span>
          </button>

          {/* Ayuda Tablet / Instalar PWA */}
          <button
            type="button"
            onClick={() => setModalInstallOpen(true)}
            className="p-2 rounded-xl bg-[#121c2e] border border-sky-500/25 text-slate-300 hover:text-white transition-all text-xs font-medium flex items-center gap-1.5 cursor-pointer"
            title="Usar como App en Tablet o Celular"
          >
            <FaTabletAlt className="size-4 text-sky-400" />
            <span className="hidden sm:inline">Modo Tablet</span>
          </button>
        </div>
      </header>

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 lg:p-8 space-y-6">
        {/* BARRA DE KPIS DEL MES */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          {/* Facturado */}
          <div className="bg-[#0f1728] border border-sky-500/20 rounded-2xl p-4 sm:p-5 shadow-lg relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-sky-500/5 rounded-full blur-xl group-hover:bg-sky-500/10 transition-colors pointer-events-none" />
            <div className="flex items-center justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              <span>Ingresos ({trabajosMes.length} autos)</span>
              <span className="size-7 rounded-lg bg-sky-500/15 text-sky-400 flex items-center justify-center">
                <FaArrowUp className="size-3" />
              </span>
            </div>
            <p className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
              {formatPesos(metricas.totalIngresos, ocultarMontos)}
            </p>
            <span className="text-[11px] text-sky-400/80 font-medium mt-1 inline-block">Total facturado en el mes</span>
          </div>

          {/* Gastos */}
          <div className="bg-[#0f1728] border border-red-500/20 rounded-2xl p-4 sm:p-5 shadow-lg relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 rounded-full blur-xl group-hover:bg-red-500/10 transition-colors pointer-events-none" />
            <div className="flex items-center justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              <span>Gastos ({gastosMes.length})</span>
              <span className="size-7 rounded-lg bg-red-500/15 text-red-400 flex items-center justify-center">
                <FaArrowDown className="size-3" />
              </span>
            </div>
            <p className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-red-200 tracking-tight">
              {formatPesos(metricas.totalGastos, ocultarMontos)}
            </p>
            <span className="text-[11px] text-red-400/80 font-medium mt-1 inline-block">Egresos e insumos</span>
          </div>

          {/* Ganancia Neta */}
          <div className="bg-[#0f1728] border border-emerald-500/30 rounded-2xl p-4 sm:p-5 shadow-lg relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl group-hover:bg-emerald-500/15 transition-colors pointer-events-none" />
            <div className="flex items-center justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              <span>Ganancia Neta</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                {metricas.margen}% margen
              </span>
            </div>
            <p className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-emerald-400 tracking-tight">
              {formatPesos(metricas.gananciaNeta, ocultarMontos)}
            </p>
            <span className="text-[11px] text-emerald-400/80 font-medium mt-1 inline-block">Bolsillo libre del taller</span>
          </div>

          {/* Cheques en Cartera */}
          <div className="bg-[#0f1728] border border-amber-500/25 rounded-2xl p-4 sm:p-5 shadow-lg relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-xl group-hover:bg-amber-500/15 transition-colors pointer-events-none" />
            <div className="flex items-center justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              <span>Cheques en Cartera</span>
              <span className="size-7 rounded-lg bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold text-xs">
                {chequesPendientes.length}
              </span>
            </div>
            <p className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-amber-300 tracking-tight">
              {formatPesos(metricas.chequesEnCarteraMonto, ocultarMontos)}
            </p>
            <span className="text-[11px] text-amber-300/80 font-medium mt-1 inline-block">Cobros pendientes</span>
          </div>
        </section>

        {/* NAVEGACIÓN DE SOLAPAS (PESTAÑAS GRANDES TÁCTILES) */}
        <div className="flex items-center gap-2 border-b border-sky-500/15 pb-2 overflow-x-auto scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTab("trabajos")}
            className={`px-4 sm:px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm tracking-wide transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === "trabajos"
                ? "bg-sky-500 text-slate-950 shadow-lg shadow-sky-500/30"
                : "bg-[#111927] text-slate-300 hover:text-white border border-white/5"
            }`}
          >
            <FaCar className="size-4" />
            <span>Trabajos & Autos ({trabajosMes.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("gastos")}
            className={`px-4 sm:px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm tracking-wide transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === "gastos"
                ? "bg-sky-500 text-slate-950 shadow-lg shadow-sky-500/30"
                : "bg-[#111927] text-slate-300 hover:text-white border border-white/5"
            }`}
          >
            <FaFileInvoiceDollar className="size-4" />
            <span>Gastos & Insumos ({gastosMes.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("cheques")}
            className={`px-4 sm:px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm tracking-wide transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === "cheques"
                ? "bg-sky-500 text-slate-950 shadow-lg shadow-sky-500/30"
                : "bg-[#111927] text-slate-300 hover:text-white border border-white/5"
            }`}
          >
            <FaMoneyCheckAlt className="size-4" />
            <span>Cartera de Cheques ({chequesPendientes.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("balance")}
            className={`px-4 sm:px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm tracking-wide transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === "balance"
                ? "bg-sky-500 text-slate-950 shadow-lg shadow-sky-500/30"
                : "bg-[#111927] text-slate-300 hover:text-white border border-white/5"
            }`}
          >
            <FaCheckCircle className="size-4" />
            <span>Balance & Cierre</span>
          </button>
        </div>

        {/* SOLAPA 1: TRABAJOS & AUTOS */}
        {activeTab === "trabajos" && (
          <div className="space-y-4">
            {/* Barra de acción: Cargar trabajo + Buscador */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 size-3.5" />
                <input
                  type="text"
                  placeholder="Buscar por auto, cliente o servicio..."
                  value={busquedaTrabajos}
                  onChange={(e) => setBusquedaTrabajos(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-[#101726] border border-sky-500/20 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-400"
                />
              </div>

              <button
                type="button"
                onClick={() => {
                  setFormTrabajoFecha(new Date().toISOString().split("T")[0]);
                  setModalTrabajoOpen(true);
                }}
                className="btn-celeste px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg cursor-pointer active:scale-95 transition-transform"
              >
                <FaPlus className="size-3.5" />
                <span>Cargar Auto / Trabajo</span>
              </button>
            </div>

            {/* Listado de trabajos */}
            {trabajosMes.length === 0 ? (
              <div className="bg-[#0f1728] border border-dashed border-sky-500/20 rounded-2xl p-10 text-center space-y-3">
                <FaCar className="size-10 text-sky-400/40 mx-auto" />
                <p className="text-sm font-semibold text-slate-300">No hay trabajos registrados en este mes</p>
                <p className="text-xs text-slate-500">Tocá en &quot;Cargar Auto / Trabajo&quot; para anotar el primer vehículo.</p>
              </div>
            ) : (
              <div className="grid gap-3">
                {trabajosMes.map((t) => (
                  <div
                    key={t.id}
                    className="bg-[#0f1728] border border-sky-500/15 hover:border-sky-500/35 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all shadow-md group"
                  >
                    {/* Info del auto */}
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-mono font-bold text-sky-400 px-2 py-0.5 rounded-md bg-sky-950/60 border border-sky-500/30">
                          {formatFechaVisual(t.fecha)}
                        </span>
                        <h3 className="font-extrabold text-base sm:text-lg text-white tracking-tight flex items-center gap-2">
                          <FaCar className="size-4 text-sky-400 shrink-0" />
                          <span>{t.vehiculo}</span>
                        </h3>
                        {t.cliente && (
                          <span className="text-xs text-slate-400 font-medium">· Cliente: {t.cliente}</span>
                        )}
                      </div>

                      {/* Tags de servicios */}
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        {t.servicios.map((s, idx) => (
                          <span
                            key={idx}
                            className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#182338] text-slate-200 border border-white/5"
                          >
                            {s}
                          </span>
                        ))}
                      </div>

                      {/* Cheque detalle si aplica */}
                      {t.medioPago === "cheque" && t.chequeData && (
                        <div className="inline-flex items-center gap-2 mt-1 text-xs px-2.5 py-1 rounded-lg bg-amber-950/30 border border-amber-500/30 text-amber-200">
                          <FaMoneyCheckAlt className="size-3.5 text-amber-400" />
                          <span>
                            Cheque {t.chequeData.banco} (N° {t.chequeData.nroCheque}) · Vence:{" "}
                            <strong>{formatFechaVisual(t.chequeData.fechaCobro)}</strong>
                          </span>
                          <span
                            className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                              t.chequeData.cobrado
                                ? "bg-emerald-500/30 text-emerald-300 border border-emerald-500/40"
                                : "bg-amber-500/30 text-amber-300 border border-amber-500/40"
                            }`}
                          >
                            {t.chequeData.cobrado ? "Cobrado" : "En cartera"}
                          </span>
                        </div>
                      )}

                      {t.notas && <p className="text-xs text-slate-400 italic pt-0.5">Nota: {t.notas}</p>}
                    </div>

                    {/* Monto y acciones */}
                    <div className="flex items-center justify-between md:justify-end gap-4 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-white/5">
                      <div className="text-left md:text-right">
                        <span className="text-[11px] uppercase font-semibold text-slate-400 block">
                          {t.medioPago.toUpperCase()}
                        </span>
                        <p className="text-lg sm:text-xl font-extrabold text-sky-400">
                          {formatPesos(t.monto, ocultarMontos)}
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {t.medioPago === "cheque" && (
                          <button
                            type="button"
                            onClick={() => toggleCobroCheque(t.id)}
                            className={`p-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                              t.chequeData?.cobrado
                                ? "bg-emerald-950/40 text-emerald-300 border border-emerald-500/30"
                                : "bg-amber-950/40 text-amber-300 border border-amber-500/30 hover:bg-emerald-950/60"
                            }`}
                            title={t.chequeData?.cobrado ? "Cheque marcado como cobrado" : "Marcar como cobrado"}
                          >
                            <FaMoneyCheckAlt className="size-4" />
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => handleEliminarTrabajo(t.id, t.vehiculo)}
                          className="p-2 rounded-xl bg-red-950/30 hover:bg-red-900/50 text-red-400 border border-red-500/20 transition-all cursor-pointer"
                          title="Eliminar trabajo"
                        >
                          <FaTrash className="size-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* SOLAPA 2: GASTOS & PROVEEDORES */}
        {activeTab === "gastos" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Total Gastos: <strong className="text-red-300">{formatPesos(metricas.totalGastos, ocultarMontos)}</strong>
              </span>

              <button
                type="button"
                onClick={() => {
                  setFormGastoFecha(new Date().toISOString().split("T")[0]);
                  setModalGastoOpen(true);
                }}
                className="px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm uppercase tracking-wider bg-red-500 hover:bg-red-400 text-slate-950 flex items-center gap-2 shadow-lg cursor-pointer active:scale-95 transition-transform"
              >
                <FaPlus className="size-3.5" />
                <span>Registrar Gasto</span>
              </button>
            </div>

            {gastosMes.length === 0 ? (
              <div className="bg-[#0f1728] border border-dashed border-red-500/20 rounded-2xl p-10 text-center space-y-3">
                <FaFileInvoiceDollar className="size-10 text-red-400/40 mx-auto" />
                <p className="text-sm font-semibold text-slate-300">No hay gastos registrados en este mes</p>
                <p className="text-xs text-slate-500">Tocá en &quot;Registrar Gasto&quot; para asentar alquileres, luz o compras de insumos.</p>
              </div>
            ) : (
              <div className="grid gap-3">
                {gastosMes.map((g) => {
                  const catCfg = CATEGORIAS_GASTO_CONFIG[g.categoria] || CATEGORIAS_GASTO_CONFIG.otro;
                  return (
                    <div
                      key={g.id}
                      className="bg-[#0f1728] border border-red-500/15 hover:border-red-500/35 rounded-2xl p-4 sm:p-5 flex items-center justify-between gap-4 transition-all shadow-md"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl p-2 rounded-xl bg-white/5 border border-white/5 shrink-0">
                          {catCfg.icon}
                        </span>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-mono font-bold text-slate-400">
                              {formatFechaVisual(g.fecha)}
                            </span>
                            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-white/5 text-slate-300 border border-white/10">
                              {catCfg.label}
                            </span>
                          </div>
                          <h4 className="font-bold text-base text-white mt-0.5">{g.concepto}</h4>
                          {g.notas && <p className="text-xs text-slate-400 italic">Nota: {g.notas}</p>}
                        </div>
                      </div>

                      <div className="flex items-center gap-4 shrink-0">
                        <p className="text-base sm:text-lg font-extrabold text-red-300">
                          {formatPesos(g.monto, ocultarMontos)}
                        </p>
                        <button
                          type="button"
                          onClick={() => handleEliminarGasto(g.id, g.concepto)}
                          className="p-2 rounded-xl bg-red-950/30 hover:bg-red-900/50 text-red-400 border border-red-500/20 transition-all cursor-pointer"
                          title="Eliminar gasto"
                        >
                          <FaTrash className="size-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* SOLAPA 3: CARTERA DE CHEQUES */}
        {activeTab === "cheques" && (
          <div className="space-y-4">
            <div className="bg-[#121c2e] border border-amber-500/30 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <FaMoneyCheckAlt className="size-5 text-amber-400" />
                  <span>Control de Cheques de Clientes</span>
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  Visualizá los cheques que tenés en cartera, sus fechas de vencimiento y cobro.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-left sm:text-right">
                  <span className="text-xs font-semibold text-slate-400 uppercase">Total en cartera</span>
                  <p className="text-xl sm:text-2xl font-extrabold text-amber-300">
                    {formatPesos(metricas.chequesEnCarteraMonto, ocultarMontos)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const hoy = new Date().toISOString().split("T")[0];
                    setFormChequeFechaCobro(hoy);
                    setModalChequeOpen(true);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wide flex items-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(245,158,11,0.25)] transition-all shrink-0"
                >
                  <FaPlus className="size-3.5" />
                  <span>+ Cargar Cheque</span>
                </button>
              </div>
            </div>

            {todosCheques.length === 0 ? (
              <div className="bg-[#0f1728] border border-dashed border-amber-500/20 rounded-2xl p-10 text-center space-y-2">
                <FaMoneyCheckAlt className="size-10 text-amber-400/40 mx-auto" />
                <p className="text-sm font-semibold text-slate-300">No hay cheques registrados</p>
                <p className="text-xs text-slate-500">Al cargar un trabajo con medio de pago &quot;Cheque&quot;, aparecerá automáticamente acá.</p>
              </div>
            ) : (
              <div className="grid gap-3">
                {todosCheques.map((c) => {
                  const hoyStr = new Date().toISOString().split("T")[0];
                  const esVencido = !c.cheque.cobrado && c.cheque.fechaCobro < hoyStr;
                  const esHoy = !c.cheque.cobrado && c.cheque.fechaCobro === hoyStr;

                  return (
                    <div
                      key={c.trabajoId}
                      className={`bg-[#0f1728] border rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all shadow-md ${
                        c.cheque.cobrado
                          ? "border-emerald-500/20 opacity-80"
                          : esVencido || esHoy
                          ? "border-amber-500/50 bg-amber-950/10"
                          : "border-sky-500/20"
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-base text-white">{c.cheque.banco}</span>
                          <span className="text-xs font-mono px-2 py-0.5 rounded bg-white/5 border border-white/10 text-slate-300">
                            N° {c.cheque.nroCheque}
                          </span>
                          <span
                            className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                              c.cheque.cobrado
                                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                : esVencido
                                ? "bg-red-500/20 text-red-300 border border-red-500/30"
                                : esHoy
                                ? "bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse"
                                : "bg-sky-500/20 text-sky-300 border border-sky-500/30"
                            }`}
                          >
                            {c.cheque.cobrado ? "Cobrado / Depositado" : esVencido ? "Vencido / A Cobrar" : esHoy ? "Vence Hoy" : "En Cartera"}
                          </span>
                        </div>

                        <p className="text-xs text-slate-300">
                          Auto: <strong className="text-white">{c.vehiculo}</strong>
                          {c.cliente ? ` · Titular: ${c.cliente}` : ""}
                        </p>

                        <p className="text-xs text-slate-400">
                          Fecha de cobro / vencimiento:{" "}
                          <strong className="text-white">{formatFechaVisual(c.cheque.fechaCobro)}</strong>
                        </p>
                      </div>

                      <div className="flex items-center justify-between md:justify-end gap-4 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-white/5">
                        <div className="text-left md:text-right">
                          <span className="text-[11px] uppercase font-semibold text-slate-400 block">Monto Cheque</span>
                          <p className="text-lg sm:text-xl font-extrabold text-amber-300">
                            {formatPesos(c.monto, ocultarMontos)}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => toggleCobroCheque(c.trabajoId)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
                              c.cheque.cobrado
                                ? "bg-slate-800 text-slate-300 hover:bg-slate-700"
                                : "btn-celeste"
                            }`}
                          >
                            <FaCheckCircle className="size-3.5" />
                            <span>{c.cheque.cobrado ? "Marcar Pendiente" : "Marcar Cobrado"}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleEliminarTrabajo(c.trabajoId, `Cheque ${c.cheque.banco} N° ${c.cheque.nroCheque}`)}
                            className="p-2.5 rounded-xl bg-white/5 hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors border border-white/5 hover:border-red-500/30 cursor-pointer"
                            title="Eliminar cheque de la cartera"
                          >
                            <FaTrash className="size-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* SOLAPA 4: BALANCE & CIERRE */}
        {activeTab === "balance" && (
          <div className="space-y-6">
            {/* Tarjeta resumen grande */}
            <div className="bg-[#0e1626] border border-sky-500/25 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
                <div>
                  <h3 className="text-lg sm:text-xl font-extrabold text-white">Estado de Resultados del Mes</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Control de ingresos, gastos y rentabilidad</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={compartirResumenWhatsApp}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wide flex items-center gap-2 cursor-pointer transition-all"
                  >
                    <FaWhatsapp className="size-4" />
                    <span>Compartir x WhatsApp</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleExportarDatos}
                    className="px-4 py-2 rounded-xl bg-[#182338] hover:bg-[#202f4a] text-slate-200 font-bold text-xs uppercase tracking-wide flex items-center gap-2 border border-white/10 cursor-pointer transition-all"
                  >
                    <FaDownload className="size-3.5" />
                    <span>Descargar Backup</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleRestablecerEjemplos}
                    className="px-3.5 py-2 rounded-xl bg-sky-950/40 hover:bg-sky-900/50 text-sky-300 font-bold text-xs uppercase tracking-wide flex items-center gap-1.5 border border-sky-500/30 cursor-pointer transition-all"
                    title="Recargar ejemplos de prueba (Ranger con cheque, Hilux, Vento)"
                  >
                    <FaUndo className="size-3" />
                    <span>Restablecer Ejemplos</span>
                  </button>
                </div>
              </div>

              {/* Comparativa visual */}
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-[#090e18] border border-sky-500/20">
                  <span className="text-xs font-semibold text-slate-400 block mb-1">TOTAL INGRESOS</span>
                  <p className="text-2xl font-extrabold text-white">{formatPesos(metricas.totalIngresos, ocultarMontos)}</p>
                  <p className="text-xs text-sky-400 mt-1">+{trabajosMes.length} vehículos terminados</p>
                </div>

                <div className="p-4 rounded-2xl bg-[#090e18] border border-red-500/20">
                  <span className="text-xs font-semibold text-slate-400 block mb-1">TOTAL EGRESOS / COSTOS</span>
                  <p className="text-2xl font-extrabold text-red-300">{formatPesos(metricas.totalGastos, ocultarMontos)}</p>
                  <p className="text-xs text-red-400 mt-1">{gastosMes.length} gastos cargados</p>
                </div>

                <div className="p-4 rounded-2xl bg-[#090e18] border border-emerald-500/30">
                  <span className="text-xs font-semibold text-slate-400 block mb-1">RESULTADO FINAL (NETO)</span>
                  <p className="text-2xl font-extrabold text-emerald-400">{formatPesos(metricas.gananciaNeta, ocultarMontos)}</p>
                  <p className="text-xs text-emerald-300 mt-1">Margen operativo: {metricas.margen}%</p>
                </div>
              </div>

              {/* Barra de progreso de costos */}
              <div className="space-y-2 pt-2">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-400">Distribución de Facturación</span>
                  <span className="text-sky-300">
                    Costos: {metricas.totalIngresos > 0 ? Math.round((metricas.totalGastos / metricas.totalIngresos) * 100) : 0}% · Margen: {metricas.margen}%
                  </span>
                </div>
                <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden flex">
                  <div
                    className="h-full bg-emerald-500 transition-all duration-500"
                    style={{ width: `${Math.max(0, Math.min(100, metricas.margen))}%` }}
                    title="Margen neto"
                  />
                  <div
                    className="h-full bg-red-500 transition-all duration-500"
                    style={{ width: `${Math.max(0, Math.min(100, 100 - metricas.margen))}%` }}
                    title="Gastos / Costos"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* MODAL: CARGAR NUEVO TRABAJO */}
      {modalTrabajoOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-[#0f1728] border border-sky-500/30 rounded-3xl w-full max-w-xl p-5 sm:p-7 space-y-4 shadow-2xl relative my-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <FaCar className="size-5 text-sky-400" />
                <h3 className="font-extrabold text-lg text-white">Cargar Vehículo / Trabajo</h3>
              </div>
              <button
                type="button"
                onClick={() => setModalTrabajoOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 cursor-pointer"
              >
                <FaTimes className="size-4" />
              </button>
            </div>

            <form onSubmit={handleCrearTrabajo} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Fecha de Ingreso *</label>
                  <input
                    type="date"
                    required
                    value={formTrabajoFecha}
                    onChange={(e) => setFormTrabajoFecha(e.target.value)}
                    className="w-full bg-[#141f33] border border-sky-500/25 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-sky-400"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Modelo de Vehículo *</label>
                  <input
                    type="text"
                    required
                    placeholder="ej. Ford Ranger XLT, VW Golf, Hilux"
                    value={formTrabajoVehiculo}
                    onChange={(e) => setFormTrabajoVehiculo(e.target.value)}
                    className="w-full bg-[#141f33] border border-sky-500/25 rounded-xl px-3 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-sky-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Nombre del Cliente (Opcional)</label>
                  <input
                    type="text"
                    placeholder="ej. Juan Pérez"
                    value={formTrabajoCliente}
                    onChange={(e) => setFormTrabajoCliente(e.target.value)}
                    className="w-full bg-[#141f33] border border-sky-500/25 rounded-xl px-3 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-sky-400"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Teléfono / WhatsApp (Opcional)</label>
                  <input
                    type="text"
                    placeholder="ej. 3534123456"
                    value={formTrabajoTelefono}
                    onChange={(e) => setFormTrabajoTelefono(e.target.value)}
                    className="w-full bg-[#141f33] border border-sky-500/25 rounded-xl px-3 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-sky-400"
                  />
                </div>
              </div>

              {/* Selector de servicios táctil */}
              <div>
                <label className="block font-semibold text-slate-300 mb-1.5">Servicios Realizados (Tocá los que apliquen)</label>
                <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-1 bg-[#0a0f1a] rounded-xl border border-white/5">
                  {serviciosOpciones.map((s, idx) => {
                    const sel = formTrabajoServicios.includes(s);
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          if (sel) {
                            setFormTrabajoServicios(formTrabajoServicios.filter((item) => item !== s));
                          } else {
                            setFormTrabajoServicios([...formTrabajoServicios, s]);
                          }
                        }}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                          sel
                            ? "bg-sky-500 text-slate-950 shadow-sm"
                            : "bg-[#162238] text-slate-300 hover:text-white border border-white/5"
                        }`}
                      >
                        {sel ? "✓ " : "+ "}
                        {s}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Monto y medio de pago */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Monto Total Cobrado ($ ARS) *</label>
                  <input
                    type="text"
                    required
                    placeholder="ej. 450000"
                    value={formTrabajoMonto}
                    onChange={(e) => setFormTrabajoMonto(e.target.value)}
                    className="w-full bg-[#141f33] border border-sky-500/35 rounded-xl px-3 py-2.5 text-base font-extrabold text-sky-400 placeholder-slate-600 focus:outline-none focus:border-sky-400"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Forma de Pago *</label>
                  <select
                    value={formTrabajoMedioPago}
                    onChange={(e) => setFormTrabajoMedioPago(e.target.value as MedioPago)}
                    className="w-full bg-[#141f33] border border-sky-500/25 rounded-xl px-3 py-2.5 text-white font-semibold focus:outline-none focus:border-sky-400"
                  >
                    <option value="efectivo">Efectivo</option>
                    <option value="transferencia">Transferencia Bancaria</option>
                    <option value="cheque">Cheque (A fecha / Cartera)</option>
                    <option value="tarjeta">Tarjeta / Posnet</option>
                  </select>
                </div>
              </div>

              {/* Si es CHEQUE, pedir datos de cobro */}
              {formTrabajoMedioPago === "cheque" && (
                <div className="p-3.5 rounded-2xl bg-amber-950/20 border border-amber-500/30 space-y-3">
                  <div className="flex items-center gap-2 text-amber-300 font-bold">
                    <FaMoneyCheckAlt className="size-4" />
                    <span>Datos del Cheque Recibido</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[11px] text-slate-300 mb-0.5">Banco Emisor</label>
                      <input
                        type="text"
                        placeholder="ej. Macro, Galicia, Nación"
                        value={formTrabajoChequeBanco}
                        onChange={(e) => setFormTrabajoChequeBanco(e.target.value)}
                        className="w-full bg-[#121c2e] border border-amber-500/30 rounded-xl px-2.5 py-1.5 text-white text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] text-slate-300 mb-0.5">N° de Cheque</label>
                      <input
                        type="text"
                        placeholder="ej. 09482711"
                        value={formTrabajoChequeNro}
                        onChange={(e) => setFormTrabajoChequeNro(e.target.value)}
                        className="w-full bg-[#121c2e] border border-amber-500/30 rounded-xl px-2.5 py-1.5 text-white text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] text-slate-300 mb-0.5">Fecha de Vencimiento *</label>
                      <input
                        type="date"
                        required={formTrabajoMedioPago === "cheque"}
                        value={formTrabajoChequeVencimiento}
                        onChange={(e) => setFormTrabajoChequeVencimiento(e.target.value)}
                        className="w-full bg-[#121c2e] border border-amber-500/30 rounded-xl px-2.5 py-1.5 text-white text-xs"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Notas u Observaciones (Opcional)</label>
                <input
                  type="text"
                  placeholder="ej. Dejó seña, pidió factura, etc."
                  value={formTrabajoNotas}
                  onChange={(e) => setFormTrabajoNotas(e.target.value)}
                  className="w-full bg-[#141f33] border border-sky-500/25 rounded-xl px-3 py-2 text-white placeholder-slate-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setModalTrabajoOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-celeste px-6 py-2 rounded-xl font-bold uppercase tracking-wider cursor-pointer"
                >
                  Guardar Trabajo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: REGISTRAR NUEVO GASTO */}
      {modalGastoOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-[#0f1728] border border-red-500/30 rounded-3xl w-full max-w-lg p-5 sm:p-7 space-y-4 shadow-2xl relative my-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <FaFileInvoiceDollar className="size-5 text-red-400" />
                <h3 className="font-extrabold text-lg text-white">Registrar Gasto / Compra</h3>
              </div>
              <button
                type="button"
                onClick={() => setModalGastoOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 cursor-pointer"
              >
                <FaTimes className="size-4" />
              </button>
            </div>

            <form onSubmit={handleCrearGasto} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Fecha *</label>
                  <input
                    type="date"
                    required
                    value={formGastoFecha}
                    onChange={(e) => setFormGastoFecha(e.target.value)}
                    className="w-full bg-[#141f33] border border-red-500/25 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-red-400"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Rubro / Categoría *</label>
                  <select
                    value={formGastoCategoria}
                    onChange={(e) => setFormGastoCategoria(e.target.value as GastoCategoria)}
                    className="w-full bg-[#141f33] border border-red-500/25 rounded-xl px-3 py-2.5 text-white font-semibold focus:outline-none focus:border-red-400"
                  >
                    {Object.entries(CATEGORIAS_GASTO_CONFIG).map(([k, v]) => (
                      <option key={k} value={k}>
                        {v.icon} {v.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Concepto / Proveedor *</label>
                <input
                  type="text"
                  required
                  placeholder="ej. Alquiler local, Insumos Córdoba, Fibertel"
                  value={formGastoConcepto}
                  onChange={(e) => setFormGastoConcepto(e.target.value)}
                  className="w-full bg-[#141f33] border border-red-500/25 rounded-xl px-3 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-red-400"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Monto Pagado ($ ARS) *</label>
                  <input
                    type="text"
                    required
                    placeholder="ej. 150000"
                    value={formGastoMonto}
                    onChange={(e) => setFormGastoMonto(e.target.value)}
                    className="w-full bg-[#141f33] border border-red-500/35 rounded-xl px-3 py-2.5 text-base font-extrabold text-red-300 placeholder-slate-600 focus:outline-none focus:border-red-400"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Forma de Pago</label>
                  <select
                    value={formGastoMedioPago}
                    onChange={(e) => setFormGastoMedioPago(e.target.value as "efectivo" | "transferencia" | "cheque")}
                    className="w-full bg-[#141f33] border border-red-500/25 rounded-xl px-3 py-2.5 text-white font-semibold focus:outline-none focus:border-red-400"
                  >
                    <option value="transferencia">Transferencia</option>
                    <option value="efectivo">Efectivo</option>
                    <option value="cheque">Cheque propio emitido</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Notas / Factura (Opcional)</label>
                <input
                  type="text"
                  placeholder="ej. Factura B 1204, pagado a término"
                  value={formGastoNotas}
                  onChange={(e) => setFormGastoNotas(e.target.value)}
                  className="w-full bg-[#141f33] border border-red-500/25 rounded-xl px-3 py-2 text-white placeholder-slate-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setModalGastoOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl font-bold uppercase tracking-wider bg-red-500 hover:bg-red-400 text-slate-950 cursor-pointer"
                >
                  Guardar Gasto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CARGAR CHEQUE DIRECTO EN CARTERA */}
      {modalChequeOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-[#0f1728] border border-amber-500/30 rounded-3xl w-full max-w-lg p-5 sm:p-7 space-y-4 shadow-2xl relative my-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <FaMoneyCheckAlt className="size-5 text-amber-400" />
                <h3 className="font-extrabold text-lg text-white">Ingresar Cheque a Cartera</h3>
              </div>
              <button
                type="button"
                onClick={() => setModalChequeOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 cursor-pointer"
              >
                <FaTimes className="size-4" />
              </button>
            </div>

            <form onSubmit={handleCrearChequeDirecto} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Banco Emisor *</label>
                  <input
                    type="text"
                    required
                    placeholder="ej. Banco Macro, Santander, Nación"
                    value={formChequeBanco}
                    onChange={(e) => setFormChequeBanco(e.target.value)}
                    className="w-full bg-[#141f33] border border-amber-500/25 rounded-xl px-3 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Número de Cheque *</label>
                  <input
                    type="text"
                    required
                    placeholder="ej. 04829102"
                    value={formChequeNro}
                    onChange={(e) => setFormChequeNro(e.target.value)}
                    className="w-full bg-[#141f33] border border-amber-500/25 rounded-xl px-3 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Fecha de Cobro / Vencimiento *</label>
                  <input
                    type="date"
                    required
                    value={formChequeFechaCobro}
                    onChange={(e) => setFormChequeFechaCobro(e.target.value)}
                    className="w-full bg-[#141f33] border border-amber-500/25 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Importe del Cheque ($ ARS) *</label>
                  <input
                    type="text"
                    required
                    placeholder="ej. 450000"
                    value={formChequeMonto}
                    onChange={(e) => setFormChequeMonto(e.target.value)}
                    className="w-full bg-[#141f33] border border-amber-500/25 rounded-xl px-3 py-2.5 text-amber-300 font-bold text-sm placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Concepto / Vehículo / Trabajo</label>
                <input
                  type="text"
                  placeholder="ej. Seña Ford Ranger, Polarizado Hilux, Venta de llantas"
                  value={formChequeConcepto}
                  onChange={(e) => setFormChequeConcepto(e.target.value)}
                  className="w-full bg-[#141f33] border border-amber-500/25 rounded-xl px-3 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Titular / Cliente (opcional)</label>
                  <input
                    type="text"
                    placeholder="ej. Martín Rossi"
                    value={formChequeCliente}
                    onChange={(e) => setFormChequeCliente(e.target.value)}
                    className="w-full bg-[#141f33] border border-white/15 rounded-xl px-3 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Teléfono (opcional)</label>
                  <input
                    type="tel"
                    placeholder="ej. 3534123456"
                    value={formChequeTelefono}
                    onChange={(e) => setFormChequeTelefono(e.target.value)}
                    className="w-full bg-[#141f33] border border-white/15 rounded-xl px-3 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Notas u Observaciones (opcional)</label>
                <input
                  type="text"
                  placeholder="ej. Cheque cruzado no a la orden / Entregado por tercero"
                  value={formChequeNotas}
                  onChange={(e) => setFormChequeNotas(e.target.value)}
                  className="w-full bg-[#141f33] border border-white/15 rounded-xl px-3 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setModalChequeOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-[0_0_15px_rgba(245,158,11,0.3)] cursor-pointer"
                >
                  <FaPlus className="size-3" />
                  <span>Ingresar a Cartera</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: INSTRUCCIONES MODO TABLET / PWA */}
      {modalInstallOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-[#0f1728] border border-sky-500/40 rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl relative my-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <FaTabletAlt className="size-5 text-sky-400" />
                <h3 className="font-extrabold text-base text-white">Instalar en Tablet o Celular</h3>
              </div>
              <button
                type="button"
                onClick={() => setModalInstallOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer"
              >
                <FaTimes className="size-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Podés dejar este sistema fijado en la pantalla de inicio de tu tablet en el mostrador del taller para usarlo como una aplicación:
            </p>

            <div className="space-y-3 text-xs bg-[#090e18] p-4 rounded-2xl border border-white/5">
              <div className="flex items-start gap-2.5">
                <span className="font-bold text-sky-400">1.</span>
                <p>Abrí este link desde el navegador de tu tablet (Chrome o Safari).</p>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="font-bold text-sky-400">2.</span>
                <p>Tocá los 3 puntitos de arriba a la derecha (en Chrome) o el botón de compartir (en iPad).</p>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="font-bold text-sky-400">3.</span>
                <p>
                  Elegí <strong>&quot;Agregar a la pantalla de inicio&quot;</strong> o <strong>&quot;Instalar aplicación&quot;</strong>.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setModalInstallOpen(false)}
              className="w-full btn-celeste py-2.5 rounded-xl font-bold uppercase tracking-wider text-xs cursor-pointer"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
