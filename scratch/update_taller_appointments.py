import os

taller_file = os.path.join("Code", "black-line-detailing", "app", "taller", "page.tsx")
with open(taller_file, "r", encoding="utf-8") as f:
    code = f.read()

# 1. Update imports
target_imp1 = '''import {
  MedioPago,
  ChequeInfo,
  Trabajo,
  GastoCategoria,
  Gasto,
  TallerStoreData,
  fetchTallerCloudData,
  saveTallerCloudData,
  subscribeToTallerRealtime,
} from "@/lib/taller-sync";'''

repl_imp1 = '''import {
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
} from "@/lib/taller-sync";'''

assert target_imp1 in code, "target_imp1 not found"
code = code.replace(target_imp1, repl_imp1, 1)

target_icons = '''  FaUndo,
} from "react-icons/fa";'''

repl_icons = '''  FaUndo,
  FaClock,
  FaCalendarCheck,
  FaPaperPlane,
  FaCheck,
  FaCopy,
  FaBell,
  FaHistory,
  FaRedo,
} from "react-icons/fa";'''

assert target_icons in code, "target_icons not found"
code = code.replace(target_icons, repl_icons, 1)

# 2. Add Helper Functions
target_helpers = '''// Helper: Formato de Fecha (DD/MM/AAAA)
function formatFechaVisual(fechaIso: string): string {
  if (!fechaIso) return "-";
  const [y, m, d] = fechaIso.split("-");
  return `${d}/${m}/${y}`;
}'''

repl_helpers = '''// Helper: Formato de Fecha (DD/MM/AAAA)
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
  let digits = tel.replace(/\\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("0")) digits = digits.slice(1);
  if (digits.startsWith("549")) return digits;
  if (digits.startsWith("54") && !digits.startsWith("549")) return `549${digits.slice(2)}`;
  digits = digits.replace(/^(11|[23]\\d{1,3})15(\\d+)$/, "$1$2");
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
}'''

assert target_helpers in code, "target_helpers not found"
code = code.replace(target_helpers, repl_helpers, 1)

# 3. Update getInitialData to include initial Presupuesto
target_init_fn = '''function getInitialData(slug: string): { trabajos: Trabajo[]; gastos: Gasto[] } {'''
repl_init_fn = '''function getInitialData(slug: string): { trabajos: Trabajo[]; gastos: Gasto[]; presupuestos: PresupuestoGuardado[] } {'''
assert target_init_fn in code, "target_init_fn not found"
code = code.replace(target_init_fn, repl_init_fn, 1)

target_init_ret = '''  return { trabajos: trabajosIniciales, gastos: gastosIniciales };
}'''

repl_init_ret = '''  const presupuestosIniciales: PresupuestoGuardado[] = [
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
}'''

assert target_init_ret in code, "target_init_ret not found"
code = code.replace(target_init_ret, repl_init_ret, 1)

# 4. State updates in TallerGestionPage
target_state = '''  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const trabajosRef = useRef<Trabajo[]>([]);
  const gastosRef = useRef<Gasto[]>([]);

  useEffect(() => {
    trabajosRef.current = trabajos;
  }, [trabajos]);

  useEffect(() => {
    gastosRef.current = gastos;
  }, [gastos]);

  // Pestaña activa: trabajos, gastos, cheques, balance
  const [activeTab, setActiveTab] = useState<"trabajos" | "gastos" | "cheques" | "balance">("trabajos");'''

repl_state = '''  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);
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
  const [activeTab, setActiveTab] = useState<"trabajos" | "presupuestos" | "gastos" | "cheques" | "balance">("trabajos");'''

assert target_state in code, "target_state not found"
code = code.replace(target_state, repl_state, 1)

# 5. Update guardarDatos and guardarTrabajos/guardarGastos
target_save_fns = '''  // Guardar de forma sincronizada en Supabase (Nube) y LocalStorage (Caché local)
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
  };'''

repl_save_fns = '''  // Guardar de forma sincronizada en Supabase (Nube) y LocalStorage (Caché local)
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
    const serviciosTexto = modalAgendarPresupuesto.servicios.map((s) => `• ${s}`).join("\\n");
    const textoConfirmacion = `${saludo} Te confirmamos el turno para tu *${modalAgendarPresupuesto.vehiculo}* en *${biz.nombre}*.

• *Fecha de ingreso:* ${formatFechaConDia(agendarFecha)}
• *Horario:* ${agendarHora} hs
• *Trabajos a realizar:*
${serviciosTexto}
• *Total presupuestado:* ${formatPesos(modalAgendarPresupuesto.monto)}
${biz.direccion ? `• *Taller:* ${biz.direccion}, ${biz.ciudad}\\n` : ""}
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
    if (confirm("¿Eliminar este presupuesto del historial?")) {
      const updated = presupuestos.filter((p) => p.id !== id);
      guardarPresupuestos(updated);
      showToast("Presupuesto eliminado.");
    }
  };'''

assert target_save_fns in code, "target_save_fns not found"
code = code.replace(target_save_fns, repl_save_fns, 1)

# 6. Load Workshop logic update
target_load = '''        // Paso A: Cargar inmediatamente de caché local (para 0ms de espera visual)
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
        });'''

repl_load = '''        // Paso A: Cargar inmediatamente de caché local (para 0ms de espera visual)
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
          if (Array.isArray(cloudData.presupuestos)) {
            setPresupuestos(cloudData.presupuestos);
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
        });'''

assert target_load in code, "target_load not found"
code = code.replace(target_load, repl_load, 1)

# 7. Update handleRestablecerEjemplos to restore presupuestos too
target_restablecer = '''      const init = getInitialData(currentSlug);
      await guardarDatos(init.trabajos, init.gastos);
      showToast("✅ Datos de demostración restablecidos con éxito.");'''

repl_restablecer = '''      const init = getInitialData(currentSlug);
      await guardarDatos(init.trabajos, init.gastos, init.presupuestos);
      showToast("✅ Datos de demostración restablecidos con éxito.");'''

assert target_restablecer in code, "target_restablecer not found"
code = code.replace(target_restablecer, repl_restablecer, 1)

# 8. WhatsApp message generator functions
target_wa_old = '''  // Enviar detalle / aviso del trabajo por WhatsApp al cliente
  const handleEnviarWhatsAppTrabajo = (t: Trabajo) => {
    const saludo = t.cliente ? `¡Hola ${t.cliente}!` : "¡Hola!";
    const estado = t.estadoPago === "cobrado" ? "Abonado" : "Pendiente de pago";
    const serviciosTexto = t.servicios && t.servicios.length > 0 
      ? t.servicios.map((s) => `• ${s}`).join("\\n")
      : "• Servicio General";

    const texto = `${saludo} Te escribimos desde *${biz.nombre}*.

*Vehículo:* ${t.vehiculo}
*Trabajos:*
${serviciosTexto}
*Total:* ${formatPesos(t.monto)} (${estado} - ${t.medioPago.toUpperCase()})
${t.notas ? `• Nota: ${t.notas}\\n` : ""}${biz.direccion ? `• Taller: ${biz.direccion}, ${biz.ciudad}\\n` : ""}
¡Quedamos a tu disposición por cualquier consulta! Muchas gracias.`;

    let digits = (t.telefono || "").replace(/\\D/g, "");
    let cleanPhone = "";
    if (digits) {
      if (digits.startsWith("549")) {
        cleanPhone = digits;
      } else if (digits.startsWith("54") && !digits.startsWith("549")) {
        cleanPhone = "549" + digits.slice(2);
      } else {
        if (digits.startsWith("0")) digits = digits.slice(1);
        digits = digits.replace(/^(11|[23]\\d{1,3})15(\\d+)$/, "$1$2");
        cleanPhone = `549${digits}`;
      }
    }

    const url = cleanPhone
      ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(texto)}`
      : `https://wa.me/?text=${encodeURIComponent(texto)}`;

    window.open(url, "_blank");
  };'''

repl_wa_new = '''  // Generadores de Mensajes de WhatsApp
  const getMensajeConfirmacionTurno = (t: Trabajo) => {
    const saludo = t.cliente ? `¡Hola ${t.cliente}!` : "¡Hola!";
    const serviciosTexto = t.servicios?.length ? t.servicios.map((s) => `• ${s}`).join("\\n") : "• Servicio General";
    return `${saludo} Te confirmamos el turno para tu *${t.vehiculo}* en *${biz.nombre}*.

• *Fecha de ingreso:* ${formatFechaConDia(t.fecha)}
• *Horario:* ${t.horaTurno || "09:00"} hs
• *Trabajos a realizar:*
${serviciosTexto}
• *Total:* ${formatPesos(t.monto)}
${biz.direccion ? `• *Taller:* ${biz.direccion}, ${biz.ciudad}\\n` : ""}
¡Te esperamos! Cualquier consulta podés escribirnos por acá.`;
  };

  const getMensajeRecordatorioTurno = (t: Trabajo) => {
    const saludo = t.cliente ? `¡Hola ${t.cliente}!` : "¡Hola!";
    const serviciosTexto = t.servicios?.length ? t.servicios.map((s) => `• ${s}`).join("\\n") : "• Servicio General";
    return `${saludo} Te recordamos que mañana ${formatFechaConDia(t.fecha)} a las *${t.horaTurno || "09:00"} hs* ingresa tu *${t.vehiculo}* a *${biz.nombre}*.

• *Trabajos:*
${serviciosTexto}
${biz.direccion ? `• *Taller:* ${biz.direccion}, ${biz.ciudad}\\n` : ""}
Por favor avisanos con un "SÍ" para confirmar la recepción del vehículo. ¡Muchas gracias!`;
  };

  const getMensajeAutoListo = (t: Trabajo) => {
    const saludo = t.cliente ? `¡Hola ${t.cliente}!` : "¡Hola!";
    const estado = t.estadoPago === "cobrado" ? "Abonado" : "Pendiente de pago";
    const serviciosTexto = t.servicios?.length ? t.servicios.map((s) => `• ${s}`).join("\\n") : "• Servicio General";
    return `${saludo} Te avisamos que tu *${t.vehiculo}* ya está terminado y listo para retirar en *${biz.nombre}*.

• *Trabajos realizados:*
${serviciosTexto}
• *Total:* ${formatPesos(t.monto)} (${estado} - ${t.medioPago.toUpperCase()})
${biz.direccion ? `• *Taller:* ${biz.direccion}, ${biz.ciudad}\\n` : ""}
¡Quedó impecable! Podés pasar a retirarlo cuando gustes. ¡Muchas gracias!`;
  };

  const getMensajeDetalleTrabajo = (t: Trabajo) => {
    const saludo = t.cliente ? `¡Hola ${t.cliente}!` : "¡Hola!";
    const estado = t.estadoPago === "cobrado" ? "Abonado" : "Pendiente de pago";
    const serviciosTexto = t.servicios && t.servicios.length > 0 
      ? t.servicios.map((s) => `• ${s}`).join("\\n")
      : "• Servicio General";
    return `${saludo} Te escribimos desde *${biz.nombre}*.

*Vehículo:* ${t.vehiculo}
*Trabajos:*
${serviciosTexto}
*Total:* ${formatPesos(t.monto)} (${estado} - ${t.medioPago.toUpperCase()})
${t.notas ? `• Nota: ${t.notas}\\n` : ""}${biz.direccion ? `• Taller: ${biz.direccion}, ${biz.ciudad}\\n` : ""}
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
  };'''

assert target_wa_old in code, "target_wa_old not found"
code = code.replace(target_wa_old, repl_wa_new, 1)

# 9. Update Navigation Solapas
target_tabs_nav = '''        {/* NAVEGACIÓN DE SOLAPAS (PESTAÑAS GRANDES TÁCTILES) */}
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
          </button>'''

repl_tabs_nav = '''        {/* NAVEGACIÓN DE SOLAPAS (PESTAÑAS GRANDES TÁCTILES) */}
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
          </button>'''

assert target_tabs_nav in code, "target_tabs_nav not found"
code = code.replace(target_tabs_nav, repl_tabs_nav, 1)

# 10. Add Banners on top of SOLAPA 1: TRABAJOS & AUTOS
target_solapa1 = '''        {/* SOLAPA 1: TRABAJOS & AUTOS */}
        {activeTab === "trabajos" && (
          <div className="space-y-4">'''

repl_solapa1 = '''        {/* SOLAPA 1: TRABAJOS & AUTOS */}
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
            )}'''

assert target_solapa1 in code, "target_solapa1 not found"
code = code.replace(target_solapa1, repl_solapa1, 1)

# 11. Show horaTurno tag on Trabajo card and trigger WhatsApp modal
target_trabajo_item = '''                        <span className="text-xs font-mono font-bold text-sky-400 px-2 py-0.5 rounded-md bg-sky-950/60 border border-sky-500/30">
                          {formatFechaVisual(t.fecha)}
                        </span>'''

repl_trabajo_item = '''                        <span className="text-xs font-mono font-bold text-sky-400 px-2 py-0.5 rounded-md bg-sky-950/60 border border-sky-500/30">
                          {formatFechaVisual(t.fecha)}
                        </span>
                        {t.horaTurno && (
                          <span className="text-xs font-mono font-bold text-emerald-400 px-2 py-0.5 rounded-md bg-emerald-950/60 border border-emerald-500/30 flex items-center gap-1">
                            <FaClock className="size-2.5" />
                            <span>{t.horaTurno} hs</span>
                          </span>
                        )}'''

assert target_trabajo_item in code, "target_trabajo_item not found"
code = code.replace(target_trabajo_item, repl_trabajo_item, 1)

target_wa_btn = '''                        <button
                          type="button"
                          onClick={() => handleEnviarWhatsAppTrabajo(t)}
                          className="p-2 rounded-xl bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-500/30 transition-all cursor-pointer shadow-sm hover:scale-105"
                          title={t.telefono ? `Enviar detalle x WhatsApp a ${t.cliente || "cliente"} (${t.telefono})` : "Enviar detalle x WhatsApp"}
                        >
                          <FaWhatsapp className="size-4 text-emerald-400" />
                        </button>'''

repl_wa_btn = '''                        <button
                          type="button"
                          onClick={() => setTrabajoWhatsAppModal(t)}
                          className="p-2 rounded-xl bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-500/30 transition-all cursor-pointer shadow-sm hover:scale-105"
                          title={t.telefono ? `Mensajes rápidos x WhatsApp a ${t.cliente || "cliente"} (${t.telefono})` : "Mensajes rápidos x WhatsApp"}
                        >
                          <FaWhatsapp className="size-4 text-emerald-400" />
                        </button>'''

assert target_wa_btn in code, "target_wa_btn not found"
code = code.replace(target_wa_btn, repl_wa_btn, 1)

# 12. Add Solapa Presupuestos (before Solapa 2: Gastos)
target_solapa2 = '''        {/* SOLAPA 2: GASTOS & PROVEEDORES */}'''

repl_solapa_presupuestos = '''        {/* SOLAPA: PRESUPUESTOS ENVIADOS & AGENDADOS */}
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
                            <>
                              <button
                                type="button"
                                onClick={() => handleRecuperarPresupuesto(p.id)}
                                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center gap-1"
                              >
                                <FaRedo className="size-3" />
                                <span>Reabrir</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleEliminarPresupuesto(p.id)}
                                className="p-2 rounded-xl bg-red-950/30 hover:bg-red-900/50 text-red-400 border border-red-500/20 transition-all cursor-pointer"
                                title="Eliminar definitivamente"
                              >
                                <FaTrash className="size-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}

        {/* SOLAPA 2: GASTOS & PROVEEDORES */}'''

assert target_solapa2 in code, "target_solapa2 not found"
code = code.replace(target_solapa2, repl_solapa_presupuestos, 1)

# 13. Add Modals: modalAgendarPresupuesto and trabajoWhatsAppModal
target_modal_end = '''            <button
              type="button"
              onClick={() => setModalInstallOpen(false)}
              className="w-full btn-celeste py-2.5 rounded-xl font-bold uppercase tracking-wider text-xs cursor-pointer"
            >
              Entendido
            </button>
          </div>
        </div>
      )}'''

repl_modals_new = '''            <button
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
      )}'''

assert target_modal_end in code, "target_modal_end not found"
code = code.replace(target_modal_end, repl_modals_new, 1)

with open(taller_file, "w", encoding="utf-8") as f:
    f.write(code)

print("Updated app/taller/page.tsx successfully!")
