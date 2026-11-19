import os

taller_file = os.path.join("Code", "black-line-detailing", "app", "taller", "page.tsx")
with open(taller_file, "r", encoding="utf-8") as f:
    code = f.read()

target_card = '''                {trabajosMesFiltrados.map((t) => (
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
                        {t.horaTurno && (
                          <span className="text-xs font-mono font-bold text-emerald-400 px-2 py-0.5 rounded-md bg-emerald-950/60 border border-emerald-500/30 flex items-center gap-1">
                            <FaClock className="size-2.5" />
                            <span>{t.horaTurno} hs</span>
                          </span>
                        )}
                        <h3 className="font-extrabold text-base sm:text-lg text-white tracking-tight flex items-center gap-2">
                          <FaCar className="size-4 text-sky-400 shrink-0" />
                          <span>{t.vehiculo}</span>
                        </h3>
                        {t.cliente && (
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
                      </div>

                      <div className="flex items-center gap-1.5">
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
                ))}'''

repl_card = '''                {trabajosMesFiltrados.map((t) => (
                  <div
                    key={t.id}
                    className="bg-[#0f1728] border border-sky-500/15 hover:border-sky-500/35 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all shadow-md group"
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
                ))}'''

assert target_card in code, "target_card not found"
code = code.replace(target_card, repl_card, 1)

with open(taller_file, "w", encoding="utf-8") as f:
    f.write(code)

print("Updated alignment successfully!")
