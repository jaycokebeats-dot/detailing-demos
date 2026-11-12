"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import type { Business } from "@/data/business-helpers";
import { DEFAULT_DEMO_BUSINESS } from "@/data/demo-business";
import { getBusinessData, resolveWorkshopSlug } from "@/lib/supabase";
import {
  MedioPago,
  ChequeInfo,
  Trabajo,
  EstadoTrabajo,
  PresupuestoGuardado,
  GastoCategoria,
  Gasto,
  TallerStoreData,
  fetchTallerCloudData,
  saveTallerCloudData,
  subscribeToTallerRealtime,
  getTallerLocalKey,
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
  FaClock,
  FaCalendarCheck,
  FaPaperPlane,
  FaCheck,
  FaCopy,
  FaBell,
  FaHistory,
  FaRedo,
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

// Helper: Formato de Fecha con Día de la semana (Ej: Lunes 16 de Noviembre)
function formatFechaConDia(fechaIso: string): string {
  if (!fechaIso) return "-";
  const parts = fechaIso.split("-");
  if (parts.length < 3) return fechaIso;
  const y = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10);
  const d = parseInt(parts[2], 10);
  const dateObj = new Date(y, m - 1, d);
  const dias = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
  const meses = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];
  const nombreDia = dias[dateObj.getDay()] || "";
  const nombreMes = meses[m - 1] || "";
  return `${nombreDia} ${d} de ${nombreMes}`;
}

// Helper: Limpiar teléfono de Argentina para URL de WhatsApp wa.me
function cleanWhatsAppPhone(tel?: string): string {
  if (!tel) return "";
  let digits = tel.replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("0")) digits = digits.slice(1);
  if (digits.startsWith("549")) return digits;
  if (digits.startsWith("54") && !digits.startsWith("549")) return `549${digits.slice(2)}`;
  digits = digits.replace(/^(11|[23]\d{1,3})15(\d+)$/, "$1$2");
  if (digits.length === 10) return `549${digits}`;
  return digits;
}

// Helper: Verificar si una fecha es mañana
function isTomorrow(fechaIso: string): boolean {
  if (!fechaIso) return false;
  const hoy = new Date();
  const maniana = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() + 1);
  const manianaStr = `${maniana.getFullYear()}-${String(maniana.getMonth() + 1).padStart(2, "0")}-${String(maniana.getDate()).padStart(2, "0")}`;
  return fechaIso === manianaStr;
}

// Helper: Verificar si una fecha es hoy
function isToday(fechaIso: string): boolean {
  if (!fechaIso) return false;
  const hoy = new Date();
  const hoyStr = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, "0")}-${String(hoy.getDate()).padStart(2, "0")}`;
  return fechaIso === hoyStr;
}

// Datos de ejemplo iniciales para que Ariel entienda la herramienta al instante
function getInitialData(slug: string): { trabajos: Trabajo[]; gastos: Gasto[]; presupuestos: PresupuestoGuardado[] } {
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
      estadoTrabajo: "en_taller",
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
      estadoTrabajo: "listo",
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
      estadoTrabajo: "entregado",
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

  const presupuestosIniciales: PresupuestoGuardado[] = [
    {
      id: "presupuesto-demo-1",
      fechaCreacion: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      cliente: "Martín Rodríguez",
      telefono: "3534141738",
      vehiculo: "Volkswagen Polo 2004",
      tamanio: "mediano",
      servicios: ["Polarizados (SunControl & 3M)", "Sacabollos y Microbollos"],
      monto: 316000,
      estado: "pendiente",
      notas: "Consulta para coordinar ingreso la próxima semana.",
    },
  ];

  return { trabajos: trabajosIniciales, gastos: gastosIniciales, presupuestos: presupuestosIniciales };
}

// Estilos visuales dinámicos según el estado del vehículo en el taller
function getEstadoCardClasses(estadoTrabajo?: EstadoTrabajo): string {
  switch (estadoTrabajo) {
    case "agendado":
      return "border-l-4 border-l-sky-400 bg-gradient-to-r from-sky-950/25 via-[#0f1728] to-[#0f1728] border-t border-r border-b border-sky-500/20 hover:border-sky-400/40 shadow-sm";
    case "en_taller":
      return "border-l-4 border-l-indigo-400 bg-gradient-to-r from-indigo-950/25 via-[#0f1728] to-[#0f1728] border-t border-r border-b border-indigo-500/20 hover:border-indigo-400/40 shadow-sm";
    case "listo":
      return "border-l-4 border-l-emerald-400 bg-gradient-to-r from-emerald-950/30 via-[#0f1728] to-[#0f1728] border-t border-r border-b border-emerald-500/35 hover:border-emerald-400/50 shadow-[0_0_16px_rgba(16,185,129,0.12)]";
    case "entregado":
      return "border-l-4 border-l-slate-600 bg-[#0c121e]/85 border-t border-r border-b border-slate-700/40 opacity-80 hover:opacity-100 shadow-sm";
    default:
      return "border-l-4 border-l-sky-500/40 bg-[#0f1728] border-sky-500/15 hover:border-sky-500/35 shadow-md";
  }
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
  const presupuestosRef = useRef<PresupuestoGuardado[]>([]);

  // Presupuestos enviados y pendientes de agendar turno
  const [presupuestos, setPresupuestos] = useState<PresupuestoGuardado[]>([]);
  const [filtroEstadoPresupuesto, setFiltroEstadoPresupuesto] = useState<"todos" | "pendiente" | "agendado" | "descartado">("todos");

  // Modal Agendar Turno desde Presupuesto
  const [modalAgendarPresupuesto, setModalAgendarPresupuesto] = useState<PresupuestoGuardado | null>(null);
  const [agendarFecha, setAgendarFecha] = useState<string>("");
  const [agendarHora, setAgendarHora] = useState<string>("09:00");
  const [agendarMedioPago, setAgendarMedioPago] = useState<MedioPago>("efectivo");
  const [agendarEstadoPago, setAgendarEstadoPago] = useState<"pendiente" | "cobrado">("pendiente");
  const [agendarNotas, setAgendarNotas] = useState<string>("");

  // Modal Mensajes Rápidos de WhatsApp para un Trabajo
  const [trabajoWhatsAppModal, setTrabajoWhatsAppModal] = useState<Trabajo | null>(null);

  useEffect(() => {
    trabajosRef.current = trabajos;
  }, [trabajos]);

  useEffect(() => {
    gastosRef.current = gastos;
  }, [gastos]);

  useEffect(() => {
    presupuestosRef.current = presupuestos;
  }, [presupuestos]);

  // Pestaña activa: trabajos, presupuestos, gastos, cheques, balance
  const [activeTab, setActiveTab] = useState<"trabajos" | "presupuestos" | "gastos" | "cheques" | "balance">("trabajos");

  // Filtro de mes (formato YYYY-MM)
  const currentMonthStr = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  }, []);
  const [mesFiltro, setMesFiltro] = useState<string>(currentMonthStr);

  // Modo privacidad (ocultar montos para usar tablet frente al público)
  const [ocultarMontos, setOcultarMontos] = useState<boolean>(false);

  // Filtro por Estado del Trabajo (Turno, En taller, Listo, Entregado, Pendiente de pago)
  const [filtroEstadoTrabajo, setFiltroEstadoTrabajo] = useState<"todos" | EstadoTrabajo | "pendiente_pago">("todos");

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
  const [formTrabajoHoraTurno, setFormTrabajoHoraTurno] = useState<string>("09:00");
  const [formTrabajoEstadoTrabajo, setFormTrabajoEstadoTrabajo] = useState<EstadoTrabajo>("agendado");
  const [formTrabajoEstadoPago, setFormTrabajoEstadoPago] = useState<"pendiente" | "cobrado">("pendiente");
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
      // Si el trabajo restaurado vino de un presupuesto, volver a marcar el presupuesto como "agendado"
      let presRestaurados = presupuestosRef.current;
      const presId = ultimoEliminado.itemTrabajo.presupuestoId;
      if (presId) {
        presRestaurados = presupuestosRef.current.map((p) =>
          p.id === presId ? { ...p, estado: "agendado" as const, trabajoId: ultimoEliminado.itemTrabajo?.id } : p
        );
      }
      guardarDatos(restaurado, gastosRef.current, presRestaurados);
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
  const guardarDatos = async (
    nuevosTrabajos: Trabajo[],
    nuevosGastos: Gasto[],
    nuevosPresupuestos?: PresupuestoGuardado[]
  ) => {
    const presToSave = nuevosPresupuestos !== undefined ? nuevosPresupuestos : presupuestosRef.current;
    setTrabajos(nuevosTrabajos);
    setGastos(nuevosGastos);
    if (nuevosPresupuestos !== undefined) {
      setPresupuestos(nuevosPresupuestos);
    }
    setSyncStatus("saving");
    const res = await saveTallerCloudData(currentSlug, {
      trabajos: nuevosTrabajos,
      gastos: nuevosGastos,
      presupuestos: presToSave,
    });
    if (res.success) {
      setSyncStatus("synced");
    } else {
      setSyncStatus("offline");
      showToast("⚠️ Guardado en este equipo (sin internet a la base de datos)");
    }
  };

  const guardarTrabajos = (nuevos: Trabajo[]) => {
    guardarDatos(nuevos, gastosRef.current, presupuestosRef.current);
  };

  const guardarGastos = (nuevos: Gasto[]) => {
    guardarDatos(trabajosRef.current, nuevos, presupuestosRef.current);
  };

  const guardarPresupuestos = (nuevos: PresupuestoGuardado[]) => {
    guardarDatos(trabajosRef.current, gastosRef.current, nuevos);
  };

  // Escuchar si viene de la URL con ?agendar=ID para abrir el modal automáticamente
  useEffect(() => {
    if (typeof window !== "undefined" && presupuestos.length > 0) {
      const urlParams = new URLSearchParams(window.location.search);
      const agendarId = urlParams.get("agendar");
      if (agendarId) {
        const found = presupuestos.find((p) => p.id === agendarId);
        if (found && found.estado === "pendiente") {
          handleAbrirModalAgendar(found);
          const newUrl = window.location.pathname + `?slug=${encodeURIComponent(currentSlug)}`;
          window.history.replaceState({}, "", newUrl);
        }
      }
    }
  }, [presupuestos, currentSlug]);

  // Manejo de Agendar Turno desde Presupuesto
  const handleAbrirModalAgendar = (p: PresupuestoGuardado) => {
    setModalAgendarPresupuesto(p);
    const hoy = new Date();
    const maniana = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() + 1);
    const manianaStr = `${maniana.getFullYear()}-${String(maniana.getMonth() + 1).padStart(2, "0")}-${String(maniana.getDate()).padStart(2, "0")}`;
    setAgendarFecha(manianaStr);
    setAgendarHora("09:00");
    setAgendarMedioPago("efectivo");
    setAgendarEstadoPago("pendiente");
    setAgendarNotas(p.notas || "");
  };

  const handleConfirmarTurnoPresupuesto = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalAgendarPresupuesto) return;

    const nuevoTrabajo: Trabajo = {
      id: `trabajo-${Date.now()}`,
      fecha: agendarFecha || new Date().toISOString().split("T")[0],
      horaTurno: agendarHora || "09:00",
      vehiculo: modalAgendarPresupuesto.vehiculo,
      cliente: modalAgendarPresupuesto.cliente,
      telefono: modalAgendarPresupuesto.telefono,
      servicios: modalAgendarPresupuesto.servicios,
      monto: modalAgendarPresupuesto.monto,
      medioPago: agendarMedioPago,
      estadoPago: agendarEstadoPago,
      estadoTrabajo: "agendado",
      notas: agendarNotas || modalAgendarPresupuesto.notas,
      presupuestoId: modalAgendarPresupuesto.id,
    };

    const updatedTrabajos = [nuevoTrabajo, ...trabajos];
    const updatedPresupuestos = presupuestos.map((p) =>
      p.id === modalAgendarPresupuesto.id
        ? { ...p, estado: "agendado" as const, trabajoId: nuevoTrabajo.id }
        : p
    );

    guardarDatos(updatedTrabajos, gastos, updatedPresupuestos);

    // Mensaje formal de confirmación de turno por WhatsApp
    const saludo = modalAgendarPresupuesto.cliente ? `¡Hola ${modalAgendarPresupuesto.cliente}!` : "¡Hola!";
    const serviciosTexto = modalAgendarPresupuesto.servicios.map((s) => `• ${s}`).join("\n");
    const textoConfirmacion = `${saludo} Te confirmamos el turno para tu *${modalAgendarPresupuesto.vehiculo}* en *${biz.nombre}*.

• *Fecha de ingreso:* ${formatFechaConDia(agendarFecha)}
• *Horario:* ${agendarHora} hs
• *Trabajos a realizar:*
${serviciosTexto}
• *Total presupuestado:* ${formatPesos(modalAgendarPresupuesto.monto)}
${biz.direccion ? `• *Taller:* ${biz.direccion}, ${biz.ciudad}\n` : ""}
¡Te esperamos! Cualquier consulta podés escribirnos por acá.`;

    const cleanPhone = cleanWhatsAppPhone(modalAgendarPresupuesto.telefono);
    const url = cleanPhone
      ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(textoConfirmacion)}`
      : `https://wa.me/?text=${encodeURIComponent(textoConfirmacion)}`;

    window.open(url, "_blank");
    setModalAgendarPresupuesto(null);
    showToast(`📅 ¡Turno agendado para ${modalAgendarPresupuesto.vehiculo}!`);
  };

  const handleDescartarPresupuesto = (id: string) => {
    const updated = presupuestos.map((p) =>
      p.id === id ? { ...p, estado: "descartado" as const } : p
    );
    guardarPresupuestos(updated);
    showToast("Presupuesto marcado como descartado.");
  };

  const handleRecuperarPresupuesto = (id: string) => {
    const updated = presupuestos.map((p) =>
      p.id === id ? { ...p, estado: "pendiente" as const } : p
    );
    guardarPresupuestos(updated);
    showToast("Presupuesto reabierto como pendiente.");
  };

  const handleEliminarPresupuesto = (id: string) => {
    const target = presupuestos.find((p) => p.id === id);
    if (!target) return;

    if (window.confirm(`¿Seguro que querés eliminar el presupuesto de "${target.cliente || target.vehiculo}"?`)) {
      const updated = presupuestos.filter((p) => p.id !== id);
      guardarPresupuestos(updated);
      showToast(`🗑️ Presupuesto de ${target.vehiculo} eliminado.`);
    }
  };

  // 1. Cargar datos del taller por Slug y sincronizar en Tiempo Real
  useEffect(() => {
    let unsubscribe: (() => void) | null = null;

    async function loadWorkshop() {
      try {
        const slug = resolveWorkshopSlug("am-centro-de-estetica-vehicular");
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
        const storageKeyTrabajos = getTallerLocalKey(slug, "trabajos");
        const storageKeyGastos = getTallerLocalKey(slug, "gastos");
        const storageKeyPresupuestos = getTallerLocalKey(slug, "presupuestos");
        const savedTrabajos = localStorage.getItem(storageKeyTrabajos);
        const savedGastos = localStorage.getItem(storageKeyGastos);
        const savedPresupuestos = localStorage.getItem(storageKeyPresupuestos);

        if (savedTrabajos || savedGastos || savedPresupuestos) {
          try {
            if (savedTrabajos) setTrabajos(JSON.parse(savedTrabajos));
            if (savedGastos) setGastos(JSON.parse(savedGastos));
            if (savedPresupuestos) setPresupuestos(JSON.parse(savedPresupuestos));
          } catch (err) {
            // ignore
          }
        } else {
          const init = getInitialData(slug);
          setTrabajos(init.trabajos);
          setGastos(init.gastos);
          setPresupuestos(init.presupuestos);
        }

        // Paso B: Conectar a la base de datos en la nube (Supabase)
        setSyncStatus("saving");
        const cloudData = await fetchTallerCloudData(slug);
        if (cloudData && Array.isArray(cloudData.trabajos) && Array.isArray(cloudData.gastos)) {
          setTrabajos(cloudData.trabajos);
          setGastos(cloudData.gastos);
          if (Array.isArray(cloudData.presupuestos) && cloudData.presupuestos.length > 0) {
            setPresupuestos(cloudData.presupuestos);
          } else {
            // Si en la nube no hay presupuestos aún, sembrar el de ejemplo
            const init = getInitialData(slug);
            setPresupuestos(init.presupuestos);
          }
          setSyncStatus("synced");
        } else {
          // Si es la primera vez que entra, sembramos en la base de datos
          const init = getInitialData(slug);
          await saveTallerCloudData(slug, init);
          setTrabajos(init.trabajos);
          setGastos(init.gastos);
          setPresupuestos(init.presupuestos);
          setSyncStatus("synced");
        }

        // Paso C: Suscribirse en Tiempo Real (si alguien borra/agrega en celu, se refleja en tablet)
        unsubscribe = subscribeToTallerRealtime(slug, (fresh) => {
          setTrabajos(fresh.trabajos);
          setGastos(fresh.gastos);
          if (Array.isArray(fresh.presupuestos)) {
            setPresupuestos(fresh.presupuestos);
          }
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

  // Contadores de estados para los filtros rápidos
  const conteoAgendados = useMemo(() => trabajosMes.filter((t) => t.estadoTrabajo === "agendado").length, [trabajosMes]);
  const conteoEnTaller = useMemo(() => trabajosMes.filter((t) => (t.estadoTrabajo || "en_taller") === "en_taller").length, [trabajosMes]);
  const conteoListos = useMemo(() => trabajosMes.filter((t) => t.estadoTrabajo === "listo").length, [trabajosMes]);
  const conteoEntregados = useMemo(() => trabajosMes.filter((t) => t.estadoTrabajo === "entregado").length, [trabajosMes]);
  const conteoPendientesPago = useMemo(() => trabajosMes.filter((t) => t.estadoPago === "pendiente").length, [trabajosMes]);

  // Trabajos filtrados según el botón de estado seleccionado
  const trabajosMesFiltrados = useMemo(() => {
    return trabajosMes.filter((t) => {
      if (filtroEstadoTrabajo === "todos") return true;
      if (filtroEstadoTrabajo === "pendiente_pago") return t.estadoPago === "pendiente";
      const estadoActual = t.estadoTrabajo || "en_taller";
      return estadoActual === filtroEstadoTrabajo;
    });
  }, [trabajosMes, filtroEstadoTrabajo]);

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

  // Métricas financieras del mes (Diferenciando Cobrado en Mano vs. Pendiente de Cobro)
  const metricas = useMemo(() => {
    const totalFacturado = trabajosMes.reduce((acc, t) => acc + t.monto, 0);
    const totalCobrado = trabajosMes
      .filter((t) => t.estadoPago === "cobrado")
      .reduce((acc, t) => acc + t.monto, 0);
    const totalPendiente = trabajosMes
      .filter((t) => t.estadoPago === "pendiente")
      .reduce((acc, t) => acc + t.monto, 0);
    const totalGastos = gastosMes.reduce((acc, g) => acc + g.monto, 0);

    // Ganancia real en mano (lo efectivamente cobrado menos los gastos)
    const gananciaNetaReal = totalCobrado - totalGastos;
    const margenReal = totalCobrado > 0 ? Math.round((gananciaNetaReal / totalCobrado) * 100) : 0;

    // Ganancia proyectada (al cobrar todo lo pendiente)
    const gananciaNetaProyectada = totalFacturado - totalGastos;
    const margenProyectado = totalFacturado > 0 ? Math.round((gananciaNetaProyectada / totalFacturado) * 100) : 0;

    const chequesEnCarteraMonto = chequesPendientes.reduce((acc, c) => acc + c.monto, 0);
    const cantPendientes = trabajosMes.filter((t) => t.estadoPago === "pendiente").length;
    const cantCobrados = trabajosMes.filter((t) => t.estadoPago === "cobrado").length;
    const totalAutos = trabajosMes.length;

    return {
      totalFacturado,
      totalCobrado,
      totalPendiente,
      totalGastos,
      gananciaNetaReal,
      margenReal,
      gananciaNetaProyectada,
      margenProyectado,
      // Compatibilidad con vistas previas
      totalIngresos: totalCobrado,
      gananciaNeta: gananciaNetaReal,
      margen: margenReal,
      chequesEnCarteraMonto,
      cantPendientes,
      cantCobrados,
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
      horaTurno: formTrabajoEstadoTrabajo === "agendado" ? (formTrabajoHoraTurno || "09:00") : undefined,
      vehiculo: formTrabajoVehiculo.trim(),
      cliente: formTrabajoCliente.trim() || undefined,
      telefono: formTrabajoTelefono.trim() || undefined,
      servicios: serviciosFinales,
      monto: montoNum,
      medioPago: formTrabajoMedioPago,
      chequeData: chequeFinal,
      estadoPago: formTrabajoMedioPago === "cheque" ? "pendiente" : formTrabajoEstadoPago,
      estadoTrabajo: formTrabajoEstadoTrabajo,
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
    setFormTrabajoHoraTurno("09:00");
    setFormTrabajoEstadoTrabajo("agendado");
    setFormTrabajoEstadoPago("pendiente");
    setModalTrabajoOpen(false);

    showToast(
      formTrabajoEstadoTrabajo === "agendado"
        ? `📅 ¡Turno agendado para ${nuevoTrabajo.vehiculo} (${nuevoTrabajo.horaTurno} hs)!`
        : `✅ ¡${nuevoTrabajo.vehiculo} registrado en el taller!`
    );

    // Si agendó turno y cargó teléfono, opcionalmente abrir WhatsApp de confirmación
    if (formTrabajoEstadoTrabajo === "agendado" && formTrabajoTelefono.trim()) {
      const cleanPhone = cleanWhatsAppPhone(formTrabajoTelefono);
      const textoConfirmacion = getMensajeConfirmacionTurno(nuevoTrabajo);
      const url = cleanPhone
        ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(textoConfirmacion)}`
        : `https://wa.me/?text=${encodeURIComponent(textoConfirmacion)}`;
      window.open(url, "_blank");
    }
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

  // Alternar entre Cobrado y Pendiente con 1 clic
  const toggleEstadoPago = (trabajoId: string) => {
    const actualizados = trabajos.map((t) => {
      if (t.id === trabajoId) {
        const nuevoEstado: "cobrado" | "pendiente" = t.estadoPago === "cobrado" ? "pendiente" : "cobrado";
        return {
          ...t,
          estadoPago: nuevoEstado,
          chequeData: t.chequeData ? { ...t.chequeData, cobrado: nuevoEstado === "cobrado" } : undefined,
        };
      }
      return t;
    });

    guardarTrabajos(actualizados);
    const target = trabajos.find((t) => t.id === trabajoId);
    showToast(
      target?.estadoPago === "cobrado"
        ? `⏳ ${target.vehiculo}: marcado como pendiente.`
        : `✅ ${target?.vehiculo}: marcado como cobrado.`
    );
  };

  // Cambiar fase/estado del vehículo (Turno -> En Taller -> Listo -> Entregado)
  const handleCambiarEstadoTrabajo = (trabajoId: string, nuevoEstado: EstadoTrabajo) => {
    const actualizados = trabajos.map((t) =>
      t.id === trabajoId ? { ...t, estadoTrabajo: nuevoEstado } : t
    );
    guardarTrabajos(actualizados);
    const target = trabajos.find((t) => t.id === trabajoId);
    const labels: Record<EstadoTrabajo, string> = {
      agendado: "Turno Agendado",
      en_taller: "En Taller",
      listo: "Listo para Retirar",
      entregado: "Entregado al Cliente",
    };
    showToast(`🚗 ${target?.vehiculo || "Vehículo"}: ahora está "${labels[nuevoEstado]}"`);

    // Si pasa a "listo", abrir de inmediato el modal de WhatsApp para avisar al cliente
    if (nuevoEstado === "listo" && target) {
      setTrabajoWhatsAppModal({ ...target, estadoTrabajo: nuevoEstado });
    }
  };

  // Generadores de Mensajes de WhatsApp
  const getMensajeConfirmacionTurno = (t: Trabajo) => {
    const saludo = t.cliente ? `¡Hola ${t.cliente}!` : "¡Hola!";
    const serviciosTexto = t.servicios?.length ? t.servicios.map((s) => `• ${s}`).join("\n") : "• Servicio General";
    return `${saludo} Te confirmamos el turno para tu *${t.vehiculo}* en *${biz.nombre}*.

• *Fecha de ingreso:* ${formatFechaConDia(t.fecha)}
• *Horario:* ${t.horaTurno || "09:00"} hs
• *Trabajos a realizar:*
${serviciosTexto}
• *Total:* ${formatPesos(t.monto)}
${biz.direccion ? `• *Taller:* ${biz.direccion}, ${biz.ciudad}\n` : ""}
¡Te esperamos! Cualquier consulta podés escribirnos por acá.`;
  };

  const getMensajeRecordatorioTurno = (t: Trabajo) => {
    const saludo = t.cliente ? `¡Hola ${t.cliente}!` : "¡Hola!";
    const serviciosTexto = t.servicios?.length ? t.servicios.map((s) => `• ${s}`).join("\n") : "• Servicio General";
    return `${saludo} Te recordamos que mañana ${formatFechaConDia(t.fecha)} a las *${t.horaTurno || "09:00"} hs* ingresa tu *${t.vehiculo}* a *${biz.nombre}*.

• *Trabajos:*
${serviciosTexto}
${biz.direccion ? `• *Taller:* ${biz.direccion}, ${biz.ciudad}\n` : ""}
Por favor avisanos con un "SÍ" para confirmar la recepción del vehículo. ¡Muchas gracias!`;
  };

  const getMensajeAutoListo = (t: Trabajo) => {
    const saludo = t.cliente ? `¡Hola ${t.cliente}!` : "¡Hola!";
    const estado = t.estadoPago === "cobrado" ? "Abonado" : "Pendiente de pago";
    const serviciosTexto = t.servicios?.length ? t.servicios.map((s) => `• ${s}`).join("\n") : "• Servicio General";
    return `${saludo} Te avisamos que tu *${t.vehiculo}* ya está terminado y listo para retirar en *${biz.nombre}*.

• *Trabajos realizados:*
${serviciosTexto}
• *Total:* ${formatPesos(t.monto)} (${estado} - ${t.medioPago.toUpperCase()})
${biz.direccion ? `• *Taller:* ${biz.direccion}, ${biz.ciudad}\n` : ""}
¡Quedó impecable! Podés pasar a retirarlo cuando gustes. ¡Muchas gracias!`;
  };

  const getMensajeDetalleTrabajo = (t: Trabajo) => {
    const saludo = t.cliente ? `¡Hola ${t.cliente}!` : "¡Hola!";
    const estado = t.estadoPago === "cobrado" ? "Abonado" : "Pendiente de pago";
    const serviciosTexto = t.servicios && t.servicios.length > 0 
      ? t.servicios.map((s) => `• ${s}`).join("\n")
      : "• Servicio General";
    return `${saludo} Te escribimos desde *${biz.nombre}*.

*Vehículo:* ${t.vehiculo}
*Trabajos:*
${serviciosTexto}
*Total:* ${formatPesos(t.monto)} (${estado} - ${t.medioPago.toUpperCase()})
${t.notas ? `• Nota: ${t.notas}\n` : ""}${biz.direccion ? `• Taller: ${biz.direccion}, ${biz.ciudad}\n` : ""}
¡Quedamos a tu disposición por cualquier consulta! Muchas gracias.`;
  };

  const enviarWhatsAppDirecto = (t: Trabajo, texto: string) => {
    const cleanPhone = cleanWhatsAppPhone(t.telefono);
    const url = cleanPhone
      ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(texto)}`
      : `https://wa.me/?text=${encodeURIComponent(texto)}`;
    window.open(url, "_blank");
  };

  const copiarTextoMensaje = (texto: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(texto);
      showToast("✨ ¡Texto copiado al portapapeles!");
    }
  };

  // Eliminar Trabajo (con confirmación rápida, desvinculación de presupuestos y opción de Deshacer)
  const handleEliminarTrabajo = (id: string, vehiculo: string) => {
    const item = trabajos.find((t) => t.id === id);
    if (!item) return;

    if (window.confirm(`¿Seguro que querés eliminar el registro de ${vehiculo}?`)) {
      const nuevos = trabajos.filter((t) => t.id !== id);

      // Si este trabajo estaba vinculado a un presupuesto, devolver el presupuesto a "pendiente"
      let nuevosPresupuestos = presupuestosRef.current;
      const presupuestoVinculado = presupuestosRef.current.find(
        (p) => (item.presupuestoId && p.id === item.presupuestoId) || p.trabajoId === id
      );

      if (presupuestoVinculado) {
        nuevosPresupuestos = presupuestosRef.current.map((p) =>
          p.id === presupuestoVinculado.id
            ? { ...p, estado: "pendiente" as const, trabajoId: undefined }
            : p
        );
      }

      guardarDatos(nuevos, gastosRef.current, nuevosPresupuestos);
      setUltimoEliminado({ tipo: "trabajo", itemTrabajo: item });
      showToast(
        presupuestoVinculado
          ? `🗑️ ${vehiculo} eliminado del taller. Su cotización volvió a figurar como "Pendiente".`
          : `🗑️ ${vehiculo} eliminado. ¿Fue un error? Podés deshacerlo 👉`,
        7000
      );
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
      await guardarDatos(init.trabajos, init.gastos, init.presupuestos);
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

🚗 *Vehículos:* ${metricas.totalAutos} (${metricas.cantCobrados} cobrados, ${metricas.cantPendientes} pendientes)
💵 *Ingresos Cobrados:* ${formatPesos(metricas.totalCobrado)}
⏳ *Pendiente de Cobro:* ${formatPesos(metricas.totalPendiente)}
📑 *Total Facturado:* ${formatPesos(metricas.totalFacturado)}
📉 *Total Gastos:* ${formatPesos(metricas.totalGastos)}
━━━━━━━━━━━━━━━━━━━
💎 *GANANCIA REAL EN MANO:* ${formatPesos(metricas.gananciaNetaReal)} (${metricas.margenReal}% margen)
📈 *Ganancia Proyectada:* ${formatPesos(metricas.gananciaNetaProyectada)} (al cobrar todo)

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
          {/* Tarjeta 1: Ingresos Cobrados */}
          <div className="bg-[#0f1728] border border-sky-500/25 rounded-2xl p-4 sm:p-5 shadow-lg relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-sky-500/5 rounded-full blur-xl group-hover:bg-sky-500/10 transition-colors pointer-events-none" />
            <div className="flex items-center justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              <span>Ingresos Cobrados</span>
              <span className="px-2 py-0.5 rounded-full bg-sky-500/15 text-sky-300 text-[10px] font-bold">
                {metricas.cantCobrados} de {metricas.totalAutos} cobrados
              </span>
            </div>
            <p className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
              {formatPesos(metricas.totalCobrado, ocultarMontos)}
            </p>
            <span className="text-[11px] text-sky-400/80 font-medium mt-1 inline-block">
              Total facturado: {formatPesos(metricas.totalFacturado, ocultarMontos)}
            </span>
          </div>

          {/* Tarjeta 2: Gastos del Mes */}
          <div className="bg-[#0f1728] border border-red-500/20 rounded-2xl p-4 sm:p-5 shadow-lg relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 rounded-full blur-xl group-hover:bg-red-500/10 transition-colors pointer-events-none" />
            <div className="flex items-center justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              <span>Gastos del Mes ({gastosMes.length})</span>
              <span className="size-7 rounded-lg bg-red-500/15 text-red-400 flex items-center justify-center">
                <FaArrowDown className="size-3" />
              </span>
            </div>
            <p className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-red-200 tracking-tight">
              {formatPesos(metricas.totalGastos, ocultarMontos)}
            </p>
            <span className="text-[11px] text-red-400/80 font-medium mt-1 inline-block">Egresos e insumos</span>
          </div>

          {/* Tarjeta 3: Ganancia Real en Mano */}
          <div className="bg-[#0f1728] border border-emerald-500/30 rounded-2xl p-4 sm:p-5 shadow-lg relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl group-hover:bg-emerald-500/15 transition-colors pointer-events-none" />
            <div className="flex items-center justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              <span>Ganancia Real en Mano</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                {metricas.margenReal}% margen
              </span>
            </div>
            <p className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-emerald-400 tracking-tight">
              {formatPesos(metricas.gananciaNetaReal, ocultarMontos)}
            </p>
            <span className="text-[11px] text-emerald-400/80 font-medium mt-1 inline-block">
              Proyectada: {formatPesos(metricas.gananciaNetaProyectada, ocultarMontos)} al cobrar todo
            </span>
          </div>

          {/* Tarjeta 4: Pendiente de Cobro */}
          <div className="bg-[#0f1728] border border-amber-500/25 rounded-2xl p-4 sm:p-5 shadow-lg relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-xl group-hover:bg-amber-500/15 transition-colors pointer-events-none" />
            <div className="flex items-center justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              <span>Pendiente de Cobro</span>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold">
                {metricas.cantPendientes} por cobrar
              </span>
            </div>
            <p className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-amber-300 tracking-tight">
              {formatPesos(metricas.totalPendiente, ocultarMontos)}
            </p>
            <span className="text-[11px] text-amber-300/80 font-medium mt-1 inline-block">
              {metricas.chequesEnCarteraMonto > 0
                ? `Incluye ${formatPesos(metricas.chequesEnCarteraMonto, ocultarMontos)} en cheques`
                : "Turnos y trabajos sin abonar"}
            </span>
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
            onClick={() => setActiveTab("presupuestos")}
            className={`px-4 sm:px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm tracking-wide transition-all flex items-center gap-2 cursor-pointer shrink-0 relative ${
              activeTab === "presupuestos"
                ? "bg-sky-500 text-slate-950 shadow-lg shadow-sky-500/30"
                : "bg-[#111927] text-slate-300 hover:text-white border border-white/5"
            }`}
          >
            <FaCalendarCheck className="size-4" />
            <span>Presupuestos</span>
            {presupuestos.filter((p) => p.estado === "pendiente").length > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-400 text-neutral-950 animate-pulse">
                {presupuestos.filter((p) => p.estado === "pendiente").length}
              </span>
            )}
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
            {/* ALERTAS INTELIGENTES: Presupuestos Pendientes de Agendar */}
            {presupuestos.filter((p) => p.estado === "pendiente").length > 0 && (
              <div className="bg-gradient-to-r from-emerald-950/70 via-[#0a231d] to-[#0e1726] border border-emerald-500/30 rounded-2xl p-4 sm:p-5 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <span className="text-2xl sm:text-3xl">📥</span>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-extrabold text-white text-sm sm:text-base">
                        {presupuestos.filter((p) => p.estado === "pendiente").length === 1
                          ? "1 Presupuesto pendiente de agendar turno"
                          : `${presupuestos.filter((p) => p.estado === "pendiente").length} Presupuestos pendientes de agendar`}
                      </h4>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-400 text-slate-950">
                        Listo para agendar
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-1">
                      {presupuestos.filter((p) => p.estado === "pendiente")[0].cliente} ·{" "}
                      <strong className="text-white">
                        {presupuestos.filter((p) => p.estado === "pendiente")[0].vehiculo}
                      </strong>{" "}
                      ({formatPesos(presupuestos.filter((p) => p.estado === "pendiente")[0].monto)})
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleAbrirModalAgendar(presupuestos.filter((p) => p.estado === "pendiente")[0])}
                    className="px-4 py-2.5 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black text-xs rounded-xl shadow-lg transition-transform active:scale-95 flex items-center gap-1.5 cursor-pointer"
                  >
                    <FaCalendarCheck className="size-3.5" />
                    <span>Agendar Turno</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("presupuestos")}
                    className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition-all cursor-pointer"
                  >
                    Ver Presupuestos ({presupuestos.filter((p) => p.estado === "pendiente").length})
                  </button>
                </div>
              </div>
            )}

            {/* ALERTAS INTELIGENTES: Recordatorios de Turnos para Mañana */}
            {trabajos.filter((t) => isTomorrow(t.fecha)).length > 0 && (
              <div className="bg-gradient-to-r from-amber-950/60 via-[#261e10] to-[#0e1726] border border-amber-500/35 rounded-2xl p-4 sm:p-5 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <span className="text-2xl sm:text-3xl">⏰</span>
                  <div>
                    <h4 className="font-extrabold text-amber-200 text-sm sm:text-base">
                      Recordatorio: {trabajos.filter((t) => isTomorrow(t.fecha)).length} auto(s) tienen turno mañana
                    </h4>
                    <p className="text-xs text-slate-300 mt-1">
                      {trabajos
                        .filter((t) => isTomorrow(t.fecha))
                        .map((t) => `${t.cliente || "Cliente"} (${t.vehiculo} - ${t.horaTurno || "09:00"} hs)`)
                        .join(" · ")}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      const primerManiana = trabajos.find((t) => isTomorrow(t.fecha));
                      if (primerManiana) setTrabajoWhatsAppModal(primerManiana);
                    }}
                    className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs rounded-xl shadow-lg transition-transform active:scale-95 flex items-center gap-1.5 cursor-pointer"
                  >
                    <FaWhatsapp className="size-3.5 text-slate-950" />
                    <span>Enviar Recordatorio x WhatsApp</span>
                  </button>
                </div>
              </div>
            )}
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
                  setFormTrabajoHoraTurno("09:00");
                  setFormTrabajoEstadoTrabajo("agendado");
                  setFormTrabajoEstadoPago("pendiente");
                  setModalTrabajoOpen(true);
                }}
                className="btn-celeste px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg cursor-pointer active:scale-95 transition-transform"
              >
                <FaPlus className="size-3.5" />
                <span>Cargar Auto / Trabajo</span>
              </button>
            </div>

            {/* BOTONES DE FILTRO RÁPIDO POR ESTADO DEL AUTO */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-semibold scrollbar-none">
              <button
                type="button"
                onClick={() => setFiltroEstadoTrabajo("todos")}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer shrink-0 ${
                  filtroEstadoTrabajo === "todos"
                    ? "bg-sky-500 text-slate-950 font-bold shadow-md shadow-sky-500/20"
                    : "bg-[#111927] text-slate-300 hover:text-white border border-white/5"
                }`}
              >
                Todos ({trabajosMes.length})
              </button>

              <button
                type="button"
                onClick={() => setFiltroEstadoTrabajo("agendado")}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
                  filtroEstadoTrabajo === "agendado"
                    ? "bg-sky-500 text-slate-950 font-bold shadow-md shadow-sky-500/20"
                    : "bg-[#111927] text-sky-300 hover:text-sky-200 border border-sky-500/25"
                }`}
              >
                <span>📅 Turnos</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-sky-950 text-sky-300 font-mono">
                  {conteoAgendados}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setFiltroEstadoTrabajo("en_taller")}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
                  filtroEstadoTrabajo === "en_taller"
                    ? "bg-indigo-500 text-slate-950 font-bold shadow-md shadow-indigo-500/20"
                    : "bg-[#111927] text-indigo-300 hover:text-indigo-200 border border-indigo-500/25"
                }`}
              >
                <span>🔧 En Taller</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-indigo-950 text-indigo-300 font-mono">
                  {conteoEnTaller}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setFiltroEstadoTrabajo("listo")}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
                  filtroEstadoTrabajo === "listo"
                    ? "bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20"
                    : "bg-[#111927] text-emerald-300 hover:text-emerald-200 border border-emerald-500/25"
                }`}
              >
                <span>🚗 Listos para Retirar</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-950 text-emerald-300 font-mono">
                  {conteoListos}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setFiltroEstadoTrabajo("entregado")}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
                  filtroEstadoTrabajo === "entregado"
                    ? "bg-slate-700 text-white font-bold"
                    : "bg-[#111927] text-slate-400 hover:text-slate-200 border border-white/5"
                }`}
              >
                <span>✅ Entregados</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-800 text-slate-300 font-mono">
                  {conteoEntregados}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setFiltroEstadoTrabajo("pendiente_pago")}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
                  filtroEstadoTrabajo === "pendiente_pago"
                    ? "bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20"
                    : "bg-[#111927] text-amber-300 hover:text-amber-200 border border-amber-500/25"
                }`}
              >
                <span>⏳ Falta Cobrar</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-950 text-amber-300 font-mono">
                  {conteoPendientesPago}
                </span>
              </button>
            </div>

            {/* Listado de trabajos */}
            {trabajosMesFiltrados.length === 0 ? (
              <div className="bg-[#0f1728] border border-dashed border-sky-500/20 rounded-2xl p-10 text-center space-y-3">
                <FaCar className="size-10 text-sky-400/40 mx-auto" />
                <p className="text-sm font-semibold text-slate-300">
                  {busquedaTrabajos.trim() || filtroEstadoTrabajo !== "todos"
                    ? "No hay vehículos que coincidan con el filtro seleccionado"
                    : "No hay trabajos registrados en este mes"}
                </p>
                <p className="text-xs text-slate-500">
                  {filtroEstadoTrabajo !== "todos"
                    ? "Probá tocando en \"Todos\" para ver la lista completa."
                    : "Tocá en \"Cargar Auto / Trabajo\" para anotar el primer vehículo."}
                </p>
              </div>
            ) : (
              <div className="grid gap-3">
                {trabajosMesFiltrados.map((t) => (
                  <div
                    key={t.id}
                    className={`rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all ${getEstadoCardClasses(
                      t.estadoTrabajo
                    )}`}
                  >
                    {/* COLUMNA 1: Datos del Vehículo, Cliente, Servicios y Notas (Flexible) */}
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-mono font-bold text-sky-400 px-2 py-0.5 rounded-md bg-sky-950/60 border border-sky-500/30">
                          {formatFechaVisual(t.fecha)}
                        </span>
                        {t.horaTurno && (
                          <span className="text-xs font-mono font-bold text-emerald-400 px-2 py-0.5 rounded-md bg-emerald-950/60 border border-emerald-500/30 flex items-center gap-1">
                            <FaClock className="size-2.5" />
                            <span>{t.horaTurno} hs</span>
                          </span>
                        )}
                        <h3 className="font-extrabold text-base sm:text-lg text-white tracking-tight flex items-center gap-2 truncate">
                          <FaCar className="size-4 text-sky-400 shrink-0" />
                          <span>{t.vehiculo}</span>
                        </h3>
                        {t.cliente && (
                          <span className="text-xs text-slate-400 font-medium truncate">· Cliente: {t.cliente}</span>
                        )}
                      </div>

                      {/* Tags de servicios */}
                      <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
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

                    {/* COLUMNA 2: SELECTOR DE ESTADO DEL TRABAJO (COLUMNA FIJA, PERFECTAMENTE ALINEADA EN TODAS LAS CARDS) */}
                    <div className="w-full md:w-48 shrink-0 flex items-center justify-start md:justify-center">
                      <select
                        value={t.estadoTrabajo || "en_taller"}
                        onChange={(e) => handleCambiarEstadoTrabajo(t.id, e.target.value as EstadoTrabajo)}
                        className={`w-full max-w-[190px] text-xs font-bold px-3 py-2 rounded-xl border transition-all cursor-pointer focus:outline-none text-center shadow-sm ${
                          t.estadoTrabajo === "agendado"
                            ? "bg-sky-950/90 text-sky-300 border-sky-500/40 hover:border-sky-400"
                            : t.estadoTrabajo === "en_taller"
                            ? "bg-indigo-950/90 text-indigo-300 border-indigo-500/40 hover:border-indigo-400"
                            : t.estadoTrabajo === "listo"
                            ? "bg-emerald-950/90 text-emerald-300 border-emerald-500/50 shadow-[0_0_12px_rgba(16,185,129,0.25)] hover:border-emerald-400 font-extrabold"
                            : "bg-slate-900/90 text-slate-400 border-slate-700 hover:border-slate-600"
                        }`}
                        title="Cambiar estado del auto en el taller"
                      >
                        <option value="agendado">📅 Turno Agendado</option>
                        <option value="en_taller">🔧 En Taller</option>
                        <option value="listo">🚗 Listo para Retirar</option>
                        <option value="entregado">✅ Entregado</option>
                      </select>
                    </div>

                    {/* COLUMNA 3: COBROS, MONTO Y BOTONES DE ACCIÓN (ANCHO FIJO Y ALINEADO A LA DERECHA) */}
                    <div className="w-full md:w-60 shrink-0 flex flex-col justify-center items-stretch md:items-end gap-1.5 pt-3 md:pt-0 border-t md:border-t-0 border-white/5">
                      <div className="flex items-center justify-between md:justify-end gap-2 w-full">
                        <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
                          {t.medioPago.toUpperCase()}
                        </span>
                        {/* BOTÓN INTERACTIVO DE COBRO */}
                        <button
                          type="button"
                          onClick={() => toggleEstadoPago(t.id)}
                          className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                            t.estadoPago === "cobrado"
                              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30"
                              : "bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30"
                          }`}
                          title="Tocar para alternar entre Cobrado y Pendiente"
                        >
                          {t.estadoPago === "cobrado" ? "✓ Cobrado" : "⏳ Pendiente"}
                        </button>
                      </div>

                      <div className="flex items-center justify-between md:justify-end gap-3 w-full">
                        <p className="text-lg sm:text-xl font-extrabold text-sky-400 font-mono tracking-tight">
                          {formatPesos(t.monto, ocultarMontos)}
                        </p>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => setTrabajoWhatsAppModal(t)}
                            className="p-2 rounded-xl bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-500/30 transition-all cursor-pointer shadow-sm hover:scale-105"
                            title={t.telefono ? `Mensajes rápidos x WhatsApp a ${t.cliente || "cliente"} (${t.telefono})` : "Mensajes rápidos x WhatsApp"}
                          >
                            <FaWhatsapp className="size-4 text-emerald-400" />
                          </button>

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
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* SOLAPA: PRESUPUESTOS ENVIADOS & AGENDADOS */}
        {activeTab === "presupuestos" && (
          <div className="space-y-4">
            {/* Barra de Filtros de Presupuestos */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 p-1 bg-[#121c2e] border border-sky-500/20 rounded-xl overflow-x-auto text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setFiltroEstadoPresupuesto("todos")}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    filtroEstadoPresupuesto === "todos"
                      ? "bg-sky-500 text-slate-950 font-bold"
                      : "text-slate-300 hover:text-white"
                  }`}
                >
                  Todos ({presupuestos.length})
                </button>
                <button
                  type="button"
                  onClick={() => setFiltroEstadoPresupuesto("pendiente")}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                    filtroEstadoPresupuesto === "pendiente"
                      ? "bg-emerald-500 text-slate-950 font-bold"
                      : "text-emerald-300 hover:text-emerald-200"
                  }`}
                >
                  <span>Pendientes</span>
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-950 text-emerald-300">
                    {presupuestos.filter((p) => p.estado === "pendiente").length}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setFiltroEstadoPresupuesto("agendado")}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    filtroEstadoPresupuesto === "agendado"
                      ? "bg-sky-500 text-slate-950 font-bold"
                      : "text-sky-300 hover:text-sky-200"
                  }`}
                >
                  Agendados ({presupuestos.filter((p) => p.estado === "agendado").length})
                </button>
                <button
                  type="button"
                  onClick={() => setFiltroEstadoPresupuesto("descartado")}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    filtroEstadoPresupuesto === "descartado"
                      ? "bg-slate-700 text-white font-bold"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Descartados ({presupuestos.filter((p) => p.estado === "descartado").length})
                </button>
              </div>

              <a
                href={`/presupuesto?slug=${encodeURIComponent(currentSlug)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-celeste px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <FaPlus className="size-3" />
                <span>Nuevo Presupuesto</span>
              </a>
            </div>

            {/* Listado de Presupuestos */}
            {presupuestos.filter((p) => filtroEstadoPresupuesto === "todos" || p.estado === filtroEstadoPresupuesto).length === 0 ? (
              <div className="bg-[#0f1728] border border-dashed border-sky-500/20 rounded-2xl p-10 text-center space-y-3">
                <FaCalendarCheck className="size-10 text-sky-400/40 mx-auto" />
                <p className="text-sm font-semibold text-slate-300">No hay presupuestos en esta categoría</p>
                <p className="text-xs text-slate-500">
                  Cada vez que mandás un presupuesto por WhatsApp desde el presupuestador, se guarda automáticamente acá.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {presupuestos
                  .filter((p) => filtroEstadoPresupuesto === "todos" || p.estado === filtroEstadoPresupuesto)
                  .map((p) => (
                    <div
                      key={p.id}
                      className="bg-[#0f1728] border border-sky-500/20 hover:border-sky-500/40 rounded-2xl p-4 sm:p-5 flex flex-col justify-between gap-4 shadow-lg transition-all"
                    >
                      <div className="space-y-2">
                        {/* Header card */}
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="text-[10px] font-mono text-slate-400 block">
                              Enviado: {formatFechaVisual(p.fechaCreacion.split("T")[0])}
                            </span>
                            <h4 className="font-extrabold text-base sm:text-lg text-white">
                              {p.cliente || "Cliente"}
                            </h4>
                            {p.telefono && (
                              <span className="text-xs text-slate-400 font-mono">Tel: {p.telefono}</span>
                            )}
                          </div>
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              p.estado === "pendiente"
                                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                : p.estado === "agendado"
                                ? "bg-sky-500/20 text-sky-300 border border-sky-500/30"
                                : "bg-slate-800 text-slate-400 border border-slate-700"
                            }`}
                          >
                            {p.estado === "pendiente" ? "Pendiente" : p.estado === "agendado" ? "Agendado en Taller" : "Descartado"}
                          </span>
                        </div>

                        {/* Vehículo y Servicios */}
                        <div className="p-3 bg-[#111a2b] border border-white/5 rounded-xl space-y-1.5">
                          <p className="text-xs font-bold text-sky-300 flex items-center gap-1.5">
                            <FaCar className="size-3 text-sky-400" />
                            <span>{p.vehiculo}</span>
                          </p>
                          <div className="text-[11px] text-slate-300 space-y-0.5">
                            {p.servicios.map((s, idx) => (
                              <p key={idx} className="truncate">• {s}</p>
                            ))}
                          </div>
                        </div>

                        {p.notas && <p className="text-xs text-slate-400 italic">Nota: {p.notas}</p>}
                      </div>

                      {/* Footer: Monto y Botones */}
                      <div className="pt-2 border-t border-white/5 flex items-center justify-between gap-2">
                        <div>
                          <span className="text-[10px] uppercase text-slate-400 font-semibold block">Total Cotizado</span>
                          <p className="text-lg font-black text-emerald-400 font-mono">{formatPesos(p.monto)}</p>
                        </div>

                        <div className="flex items-center gap-2">
                          {p.estado === "pendiente" && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleAbrirModalAgendar(p)}
                                className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-transform active:scale-95 flex items-center gap-1.5 cursor-pointer"
                              >
                                <FaCalendarCheck className="size-3.5" />
                                <span>Agendar Turno</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDescartarPresupuesto(p.id)}
                                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer"
                                title="Descartar presupuesto"
                              >
                                <FaTimes className="size-3.5" />
                              </button>
                            </>
                          )}

                          {p.estado === "agendado" && (
                            <button
                              type="button"
                              onClick={() => setActiveTab("trabajos")}
                              className="px-3 py-1.5 bg-sky-950/60 hover:bg-sky-900/80 border border-sky-500/30 text-sky-300 text-xs font-semibold rounded-xl transition-all cursor-pointer"
                            >
                              Ver en Trabajos
                            </button>
                          )}

                          {p.estado === "descartado" && (
                            <button
                              type="button"
                              onClick={() => handleRecuperarPresupuesto(p.id)}
                              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center gap-1"
                            >
                              <FaRedo className="size-3" />
                              <span>Reabrir</span>
                            </button>
                          )}

                          {/* Botón de eliminación disponible en cualquier estado */}
                          <button
                            type="button"
                            onClick={() => handleEliminarPresupuesto(p.id)}
                            className="p-2 rounded-xl bg-red-950/30 hover:bg-red-900/50 text-red-400 border border-red-500/20 transition-all cursor-pointer"
                            title="Eliminar presupuesto definitivamente"
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

              {/* Comparativa visual de Caja Real vs. Proyectado */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-[#090e18] border border-sky-500/20">
                  <span className="text-xs font-semibold text-slate-400 block mb-1">TOTAL COBRADO</span>
                  <p className="text-2xl font-extrabold text-white">{formatPesos(metricas.totalCobrado, ocultarMontos)}</p>
                  <p className="text-xs text-sky-400 mt-1">+{metricas.cantCobrados} autos abonados</p>
                </div>

                <div className="p-4 rounded-2xl bg-[#090e18] border border-amber-500/20">
                  <span className="text-xs font-semibold text-slate-400 block mb-1">PENDIENTE DE COBRO</span>
                  <p className="text-2xl font-extrabold text-amber-300">{formatPesos(metricas.totalPendiente, ocultarMontos)}</p>
                  <p className="text-xs text-amber-400 mt-1">{metricas.cantPendientes} autos por cobrar</p>
                </div>

                <div className="p-4 rounded-2xl bg-[#090e18] border border-red-500/20">
                  <span className="text-xs font-semibold text-slate-400 block mb-1">TOTAL GASTOS</span>
                  <p className="text-2xl font-extrabold text-red-300">{formatPesos(metricas.totalGastos, ocultarMontos)}</p>
                  <p className="text-xs text-red-400 mt-1">{gastosMes.length} gastos cargados</p>
                </div>

                <div className="p-4 rounded-2xl bg-[#090e18] border border-emerald-500/30">
                  <span className="text-xs font-semibold text-slate-400 block mb-1">GANANCIA REAL EN MANO</span>
                  <p className="text-2xl font-extrabold text-emerald-400">{formatPesos(metricas.gananciaNetaReal, ocultarMontos)}</p>
                  <p className="text-xs text-emerald-300 mt-1">Margen real: {metricas.margenReal}%</p>
                </div>
              </div>

              {/* Barra de progreso y proyección */}
              <div className="space-y-2 pt-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs font-semibold gap-1">
                  <span className="text-slate-300">
                    Facturación Total: <strong className="text-white">{formatPesos(metricas.totalFacturado, ocultarMontos)}</strong> · Ganancia Proyectada al cobrar todo: <strong className="text-emerald-400">{formatPesos(metricas.gananciaNetaProyectada, ocultarMontos)}</strong> ({metricas.margenProyectado}% margen)
                  </span>
                  <span className="text-sky-300">
                    Cobrado: {metricas.totalFacturado > 0 ? Math.round((metricas.totalCobrado / metricas.totalFacturado) * 100) : 0}% · Pendiente: {metricas.totalFacturado > 0 ? Math.round((metricas.totalPendiente / metricas.totalFacturado) * 100) : 0}%
                  </span>
                </div>
                <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden flex">
                  <div
                    className="h-full bg-emerald-500 transition-all duration-500"
                    style={{ width: `${metricas.totalFacturado > 0 ? Math.round((metricas.totalCobrado / metricas.totalFacturado) * 100) : 0}%` }}
                    title="Cobrado"
                  />
                  <div
                    className="h-full bg-amber-500 transition-all duration-500"
                    style={{ width: `${metricas.totalFacturado > 0 ? Math.round((metricas.totalPendiente / metricas.totalFacturado) * 100) : 0}%` }}
                    title="Pendiente de Cobro"
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
              {/* Selector de Entrada: ¿Es un Turno a futuro o ya está en el taller? */}
              <div className="p-3 bg-[#111a2c] border border-sky-500/20 rounded-2xl space-y-2">
                <span className="block font-semibold text-slate-200 text-xs">
                  ¿Cómo ingresa este vehículo al sistema?
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormTrabajoEstadoTrabajo("agendado")}
                    className={`py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                      formTrabajoEstadoTrabajo === "agendado"
                        ? "bg-sky-500 text-slate-950 border-sky-400 shadow-md shadow-sky-500/30"
                        : "bg-[#0b1220] text-sky-300 border-sky-500/30 hover:border-sky-400"
                    }`}
                  >
                    <span>📅 Turno Agendado</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormTrabajoEstadoTrabajo("en_taller")}
                    className={`py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                      formTrabajoEstadoTrabajo === "en_taller"
                        ? "bg-indigo-500 text-white border-indigo-400 shadow-md shadow-indigo-500/30"
                        : "bg-[#0b1220] text-indigo-300 border-indigo-500/30 hover:border-indigo-400"
                    }`}
                  >
                    <span>🔧 Ya en Taller</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className={formTrabajoEstadoTrabajo === "agendado" ? "grid grid-cols-2 gap-2" : ""}>
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">
                      {formTrabajoEstadoTrabajo === "agendado" ? "Fecha del Turno *" : "Fecha de Ingreso *"}
                    </label>
                    <input
                      type="date"
                      required
                      value={formTrabajoFecha}
                      onChange={(e) => setFormTrabajoFecha(e.target.value)}
                      className="w-full bg-[#141f33] border border-sky-500/25 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-sky-400 text-xs"
                    />
                  </div>
                  {formTrabajoEstadoTrabajo === "agendado" && (
                    <div>
                      <label className="block font-semibold text-slate-300 mb-1">Hora Turno *</label>
                      <input
                        type="time"
                        required
                        value={formTrabajoHoraTurno}
                        onChange={(e) => setFormTrabajoHoraTurno(e.target.value)}
                        className="w-full bg-[#141f33] border border-sky-500/25 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-sky-400 text-xs"
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Modelo de Vehículo *</label>
                  <input
                    type="text"
                    required
                    placeholder="ej. Ford Ranger XLT, VW Golf, Hilux"
                    value={formTrabajoVehiculo}
                    onChange={(e) => setFormTrabajoVehiculo(e.target.value)}
                    className="w-full bg-[#141f33] border border-sky-500/25 rounded-xl px-3 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-sky-400 text-xs"
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
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Monto Presupuestado ($) *</label>
                  <input
                    type="text"
                    required
                    placeholder="ej. 450000"
                    value={formTrabajoMonto}
                    onChange={(e) => setFormTrabajoMonto(e.target.value)}
                    className="w-full bg-[#141f33] border border-sky-500/35 rounded-xl px-3 py-2 text-base font-extrabold text-sky-400 placeholder-slate-600 focus:outline-none focus:border-sky-400"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Forma de Pago *</label>
                  <select
                    value={formTrabajoMedioPago}
                    onChange={(e) => setFormTrabajoMedioPago(e.target.value as MedioPago)}
                    className="w-full bg-[#141f33] border border-sky-500/25 rounded-xl px-3 py-2.5 text-white font-semibold focus:outline-none focus:border-sky-400 text-xs"
                  >
                    <option value="efectivo">Efectivo</option>
                    <option value="transferencia">Transferencia Bancaria</option>
                    <option value="cheque">Cheque (A fecha / Cartera)</option>
                    <option value="tarjeta">Tarjeta / Posnet</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Estado del Pago</label>
                  <select
                    value={formTrabajoEstadoPago}
                    onChange={(e) => setFormTrabajoEstadoPago(e.target.value as "pendiente" | "cobrado")}
                    className={`w-full border rounded-xl px-3 py-2.5 font-bold focus:outline-none text-xs ${
                      formTrabajoEstadoPago === "cobrado"
                        ? "bg-emerald-950/80 text-emerald-300 border-emerald-500/40"
                        : "bg-amber-950/80 text-amber-300 border-amber-500/40"
                    }`}
                  >
                    <option value="pendiente">⏳ Pendiente (al retirar)</option>
                    <option value="cobrado">✓ Cobrado (ya abonado)</option>
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

      {/* MODAL: AGENDAR TURNO DESDE PRESUPUESTO */}
      {modalAgendarPresupuesto && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-[#0f1728] border border-emerald-500/40 rounded-3xl w-full max-w-lg p-5 sm:p-7 space-y-4 shadow-2xl relative my-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <FaCalendarCheck className="size-5 text-emerald-400" />
                <h3 className="font-extrabold text-lg text-white">Agendar Turno de Presupuesto</h3>
              </div>
              <button
                type="button"
                onClick={() => setModalAgendarPresupuesto(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 cursor-pointer"
              >
                <FaTimes className="size-4" />
              </button>
            </div>

            {/* Resumen del presupuesto que ya vino armado */}
            <div className="p-3.5 bg-[#0a121f] border border-emerald-500/25 rounded-2xl space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-sm">{modalAgendarPresupuesto.vehiculo}</span>
                <span className="font-mono font-bold text-emerald-400 text-sm">
                  {formatPesos(modalAgendarPresupuesto.monto)}
                </span>
              </div>
              <p className="text-slate-300">
                Cliente: <strong>{modalAgendarPresupuesto.cliente}</strong> · Tel: {modalAgendarPresupuesto.telefono || "No especificado"}
              </p>
              <div className="text-slate-400 text-[11px] pt-1">
                {modalAgendarPresupuesto.servicios.map((s, idx) => (
                  <p key={idx}>• {s}</p>
                ))}
              </div>
            </div>

            <form onSubmit={handleConfirmarTurnoPresupuesto} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Fecha del Turno *</label>
                  <input
                    type="date"
                    required
                    value={agendarFecha}
                    onChange={(e) => setAgendarFecha(e.target.value)}
                    className="w-full bg-[#121c2e] border border-sky-500/30 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-sky-400 cursor-pointer"
                  />
                  {agendarFecha && (
                    <span className="text-[10px] text-sky-400 font-medium mt-0.5 block">
                      {formatFechaConDia(agendarFecha)}
                    </span>
                  )}
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Horario de Ingreso *</label>
                  <input
                    type="time"
                    required
                    value={agendarHora}
                    onChange={(e) => setAgendarHora(e.target.value)}
                    className="w-full bg-[#121c2e] border border-sky-500/30 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-sky-400 cursor-pointer"
                  />
                  <div className="flex items-center gap-1.5 mt-1">
                    {["09:00", "14:00", "16:00"].map((hora) => (
                      <button
                        key={hora}
                        type="button"
                        onClick={() => setAgendarHora(hora)}
                        className={`text-[10px] px-2 py-0.5 rounded font-mono transition-all cursor-pointer ${
                          agendarHora === hora
                            ? "bg-sky-500 text-slate-950 font-bold"
                            : "bg-slate-800 text-slate-300 hover:text-white"
                        }`}
                      >
                        {hora} hs
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Medio de Pago Previsto</label>
                  <select
                    value={agendarMedioPago}
                    onChange={(e) => setAgendarMedioPago(e.target.value as MedioPago)}
                    className="w-full bg-[#121c2e] border border-sky-500/30 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-400 cursor-pointer"
                  >
                    <option value="efectivo">Efectivo</option>
                    <option value="transferencia">Transferencia</option>
                    <option value="cheque">Cheque</option>
                    <option value="tarjeta">Tarjeta</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Estado del Pago</label>
                  <select
                    value={agendarEstadoPago}
                    onChange={(e) => setAgendarEstadoPago(e.target.value as "pendiente" | "cobrado")}
                    className="w-full bg-[#121c2e] border border-sky-500/30 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-400 cursor-pointer"
                  >
                    <option value="pendiente">Pendiente de pago</option>
                    <option value="cobrado">Ya cobrado / Seña paga</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Nota adicional (opcional)</label>
                <input
                  type="text"
                  value={agendarNotas}
                  onChange={(e) => setAgendarNotas(e.target.value)}
                  placeholder="Ej: Deja las llaves a la mañana, entrega el miércoles"
                  className="w-full bg-[#121c2e] border border-sky-500/30 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-400"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setModalAgendarPresupuesto(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl font-black bg-emerald-500 hover:bg-emerald-400 text-slate-950 tracking-wider shadow-lg shadow-emerald-950/50 flex items-center gap-2 cursor-pointer active:scale-95 transition-transform"
                >
                  <FaWhatsapp className="size-4" />
                  <span>Confirmar Turno y Enviar WhatsApp</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ACCIONES RÁPIDAS DE WHATSAPP PARA UN TRABAJO */}
      {trabajoWhatsAppModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-[#0f1728] border border-emerald-500/40 rounded-3xl w-full max-w-2xl p-5 sm:p-7 space-y-4 shadow-2xl relative my-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2.5">
                <FaWhatsapp className="size-6 text-emerald-400" />
                <div>
                  <h3 className="font-extrabold text-lg text-white">Mensajes Rápidos de WhatsApp</h3>
                  <p className="text-xs text-slate-400">
                    {trabajoWhatsAppModal.vehiculo} · {trabajoWhatsAppModal.cliente || "Cliente"} ({trabajoWhatsAppModal.telefono || "Sin teléfono"})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setTrabajoWhatsAppModal(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 cursor-pointer"
              >
                <FaTimes className="size-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Elegí qué mensaje querés mandar. Al tocar el botón verde se abre WhatsApp con el texto exacto redactado para este cliente:
            </p>

            <div className="space-y-3 text-xs">
              {/* Opción 1: Confirmación de Turno */}
              <div className="p-4 rounded-2xl bg-[#111c2e] border border-sky-500/25 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sky-300 text-sm flex items-center gap-1.5">
                    <FaCalendarCheck className="size-3.5" />
                    <span>1. Confirmar Turno Agendado</span>
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => copiarTextoMensaje(getMensajeConfirmacionTurno(trabajoWhatsAppModal))}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[11px] font-medium flex items-center gap-1 cursor-pointer"
                    >
                      <FaCopy className="size-3" />
                      <span>Copiar</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        enviarWhatsAppDirecto(trabajoWhatsAppModal, getMensajeConfirmacionTurno(trabajoWhatsAppModal));
                        setTrabajoWhatsAppModal(null);
                      }}
                      className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1.5 cursor-pointer shadow-md"
                    >
                      <FaWhatsapp className="size-3.5" />
                      <span>Enviar por WhatsApp</span>
                    </button>
                  </div>
                </div>
                <div className="bg-[#005c4b]/50 border border-emerald-500/20 p-2.5 rounded-xl text-[11px] font-sans text-slate-200 whitespace-pre-wrap leading-relaxed">
                  {getMensajeConfirmacionTurno(trabajoWhatsAppModal)}
                </div>
              </div>

              {/* Opción 2: Recordatorio Día Previo */}
              <div className="p-4 rounded-2xl bg-[#1e1a12] border border-amber-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-300 text-sm flex items-center gap-1.5">
                    <FaClock className="size-3.5" />
                    <span>2. Recordatorio 24 hs (Día previo al turno)</span>
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => copiarTextoMensaje(getMensajeRecordatorioTurno(trabajoWhatsAppModal))}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[11px] font-medium flex items-center gap-1 cursor-pointer"
                    >
                      <FaCopy className="size-3" />
                      <span>Copiar</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        enviarWhatsAppDirecto(trabajoWhatsAppModal, getMensajeRecordatorioTurno(trabajoWhatsAppModal));
                        setTrabajoWhatsAppModal(null);
                      }}
                      className="px-3.5 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1.5 cursor-pointer shadow-md"
                    >
                      <FaWhatsapp className="size-3.5" />
                      <span>Enviar por WhatsApp</span>
                    </button>
                  </div>
                </div>
                <div className="bg-[#005c4b]/50 border border-emerald-500/20 p-2.5 rounded-xl text-[11px] font-sans text-slate-200 whitespace-pre-wrap leading-relaxed">
                  {getMensajeRecordatorioTurno(trabajoWhatsAppModal)}
                </div>
              </div>

              {/* Opción 3: Auto Listo para Retirar */}
              <div className="p-4 rounded-2xl bg-[#0e221d] border border-emerald-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-300 text-sm flex items-center gap-1.5">
                    <FaCar className="size-3.5" />
                    <span>3. Auto Listo para Retirar</span>
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => copiarTextoMensaje(getMensajeAutoListo(trabajoWhatsAppModal))}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[11px] font-medium flex items-center gap-1 cursor-pointer"
                    >
                      <FaCopy className="size-3" />
                      <span>Copiar</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        enviarWhatsAppDirecto(trabajoWhatsAppModal, getMensajeAutoListo(trabajoWhatsAppModal));
                        setTrabajoWhatsAppModal(null);
                      }}
                      className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1.5 cursor-pointer shadow-md"
                    >
                      <FaWhatsapp className="size-3.5" />
                      <span>Enviar por WhatsApp</span>
                    </button>
                  </div>
                </div>
                <div className="bg-[#005c4b]/50 border border-emerald-500/20 p-2.5 rounded-xl text-[11px] font-sans text-slate-200 whitespace-pre-wrap leading-relaxed">
                  {getMensajeAutoListo(trabajoWhatsAppModal)}
                </div>
              </div>

              {/* Opción 4: Detalle / Comprobante de Cobro */}
              <div className="p-4 rounded-2xl bg-[#121c2e] border border-slate-700 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-300 text-sm flex items-center gap-1.5">
                    <FaFileInvoiceDollar className="size-3.5" />
                    <span>4. Detalle Completo de Trabajos & Cobro</span>
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => copiarTextoMensaje(getMensajeDetalleTrabajo(trabajoWhatsAppModal))}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[11px] font-medium flex items-center gap-1 cursor-pointer"
                    >
                      <FaCopy className="size-3" />
                      <span>Copiar</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        enviarWhatsAppDirecto(trabajoWhatsAppModal, getMensajeDetalleTrabajo(trabajoWhatsAppModal));
                        setTrabajoWhatsAppModal(null);
                      }}
                      className="px-3.5 py-1.5 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 cursor-pointer shadow-md"
                    >
                      <FaWhatsapp className="size-3.5" />
                      <span>Enviar por WhatsApp</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
