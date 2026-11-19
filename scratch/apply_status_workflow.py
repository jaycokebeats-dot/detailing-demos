import os

taller_file = os.path.join("Code", "black-line-detailing", "app", "taller", "page.tsx")
with open(taller_file, "r", encoding="utf-8") as f:
    code = f.read()

# 1. Update initial demo data to have distinct estadoTrabajo
target_ranger = '''      estadoPago: "pendiente",
      notas: "Polarizado SunControl y tratamiento cerámico",'''
repl_ranger = '''      estadoPago: "pendiente",
      estadoTrabajo: "en_taller",
      notas: "Polarizado SunControl y tratamiento cerámico",'''
assert target_ranger in code, "target_ranger not found"
code = code.replace(target_ranger, repl_ranger, 1)

target_hilux = '''      estadoPago: "cobrado",
      notas: "Limpieza profunda de cuero y PPF en ambas chapas",'''
repl_hilux = '''      estadoPago: "cobrado",
      estadoTrabajo: "listo",
      notas: "Limpieza profunda de cuero y PPF en ambas chapas",'''
assert target_hilux in code, "target_hilux not found"
code = code.replace(target_hilux, repl_hilux, 1)

target_vento = '''      estadoPago: "cobrado",
      notas: "Diamantado de las 4 ruedas y abrillantado general",'''
repl_vento = '''      estadoPago: "cobrado",
      estadoTrabajo: "entregado",
      notas: "Diamantado de las 4 ruedas y abrillantado general",'''
assert target_vento in code, "target_vento not found"
code = code.replace(target_vento, repl_vento, 1)

# 2. Add filtroEstadoTrabajo state
target_filtro_state = '''  // Buscador de trabajos
  const [busquedaTrabajos, setBusquedaTrabajos] = useState<string>("");'''

repl_filtro_state = '''  // Filtro por Estado del Trabajo (Turno, En taller, Listo, Entregado, Pendiente de pago)
  const [filtroEstadoTrabajo, setFiltroEstadoTrabajo] = useState<"todos" | EstadoTrabajo | "pendiente_pago">("todos");

  // Buscador de trabajos
  const [busquedaTrabajos, setBusquedaTrabajos] = useState<string>("");'''
assert target_filtro_state in code, "target_filtro_state not found"
code = code.replace(target_filtro_state, repl_filtro_state, 1)

# 3. Add toggleEstadoPago and handleCambiarEstadoTrabajo
target_toggle_cheque = '''  const toggleCobroCheque = (trabajoId: string) => {
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
  };'''

repl_toggle_cheque = '''  const toggleCobroCheque = (trabajoId: string) => {
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
  };'''

assert target_toggle_cheque in code, "target_toggle_cheque not found"
code = code.replace(target_toggle_cheque, repl_toggle_cheque, 1)

# 4. Add filtered works and counts
target_trabajos_mes = '''  // Trabajos filtrados por mes actual y búsqueda
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
  }, [trabajos, mesFiltro, busquedaTrabajos]);'''

repl_trabajos_mes = '''  // Trabajos filtrados por mes actual y búsqueda
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
  }, [trabajosMes, filtroEstadoTrabajo]);'''

assert target_trabajos_mes in code, "target_trabajos_mes not found"
code = code.replace(target_trabajos_mes, repl_trabajos_mes, 1)

# 5. Add quick filter bar below search input
target_search_bar = '''              <button
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
            </div>'''

repl_search_bar = '''              <button
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
            </div>'''

assert target_search_bar in code, "target_search_bar not found"
code = code.replace(target_search_bar, repl_search_bar, 1)

# 6. Replace trabajosMes.map with trabajosMesFiltrados.map and add status selectors to each card
target_map = '''            {/* Listado de trabajos */}
            {trabajosMes.length === 0 ? (
              <div className="bg-[#0f1728] border border-dashed border-sky-500/20 rounded-2xl p-10 text-center space-y-3">
                <FaCar className="size-10 text-sky-400/40 mx-auto" />
                <p className="text-sm font-semibold text-slate-300">No hay trabajos registrados en este mes</p>
                <p className="text-xs text-slate-500">Tocá en &quot;Cargar Auto / Trabajo&quot; para anotar el primer vehículo.</p>
              </div>
            ) : (
              <div className="grid gap-3">
                {trabajosMes.map((t) => ('''

repl_map = '''            {/* Listado de trabajos */}
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
                    ? "Probá tocando en \\"Todos\\" para ver la lista completa."
                    : "Tocá en \\"Cargar Auto / Trabajo\\" para anotar el primer vehículo."}
                </p>
              </div>
            ) : (
              <div className="grid gap-3">
                {trabajosMesFiltrados.map((t) => ('''

assert target_map in code, "target_map not found"
code = code.replace(target_map, repl_map, 1)

# 7. Add estadoTrabajo selector into card header
target_card_header = '''                        {t.cliente && (
                          <span className="text-xs text-slate-400 font-medium">· Cliente: {t.cliente}</span>
                        )}
                      </div>'''

repl_card_header = '''                        {t.cliente && (
                          <span className="text-xs text-slate-400 font-medium">· Cliente: {t.cliente}</span>
                        )}

                        {/* SELECTOR INTERACTIVO DE ESTADO DEL TRABAJO */}
                        <div className="ml-auto inline-block">
                          <select
                            value={t.estadoTrabajo || "en_taller"}
                            onChange={(e) => handleCambiarEstadoTrabajo(t.id, e.target.value as EstadoTrabajo)}
                            className={`text-[11px] font-bold px-2.5 py-1 rounded-xl border transition-all cursor-pointer focus:outline-none ${
                              t.estadoTrabajo === "agendado"
                                ? "bg-sky-950 text-sky-300 border-sky-500/40"
                                : t.estadoTrabajo === "en_taller"
                                ? "bg-indigo-950 text-indigo-300 border-indigo-500/40"
                                : t.estadoTrabajo === "listo"
                                ? "bg-emerald-950 text-emerald-300 border-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.25)] font-extrabold"
                                : "bg-slate-900 text-slate-400 border-slate-700"
                            }`}
                            title="Cambiar estado del auto en el taller"
                          >
                            <option value="agendado">📅 Turno Agendado</option>
                            <option value="en_taller">🔧 En Taller</option>
                            <option value="listo">🚗 Listo para Retirar</option>
                            <option value="entregado">✅ Entregado</option>
                          </select>
                        </div>
                      </div>'''

assert target_card_header in code, "target_card_header not found"
code = code.replace(target_card_header, repl_card_header, 1)

# 8. Add interactive estadoPago button into card right side
target_payment_side = '''                    {/* Monto y acciones */}
                    <div className="flex items-center justify-between md:justify-end gap-4 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-white/5">
                      <div className="text-left md:text-right">
                        <span className="text-[11px] uppercase font-semibold text-slate-400 block">
                          {t.medioPago.toUpperCase()}
                        </span>
                        <p className="text-lg sm:text-xl font-extrabold text-sky-400">
                          {formatPesos(t.monto, ocultarMontos)}
                        </p>
                      </div>'''

repl_payment_side = '''                    {/* Monto y acciones */}
                    <div className="flex items-center justify-between md:justify-end gap-4 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-white/5">
                      <div className="text-left md:text-right">
                        <div className="flex items-center gap-1.5 justify-start md:justify-end mb-0.5">
                          <span className="text-[10px] uppercase font-semibold text-slate-400 block">
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
                        <p className="text-lg sm:text-xl font-extrabold text-sky-400">
                          {formatPesos(t.monto, ocultarMontos)}
                        </p>
                      </div>'''

assert target_payment_side in code, "target_payment_side not found"
code = code.replace(target_payment_side, repl_payment_side, 1)

with open(taller_file, "w", encoding="utf-8") as f:
    f.write(code)

print("Updated app/taller/page.tsx with interactive status workflow successfully!")
