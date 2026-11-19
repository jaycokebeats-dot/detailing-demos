import os

file_path = os.path.join("app", "presupuesto", "page.tsx")
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Update imports
target_imp = 'import { FaWhatsapp, FaCopy, FaFilePdf, FaCheck } from "react-icons/fa";'
repl_imp = '''import { FaWhatsapp, FaCopy, FaFilePdf, FaCheck, FaCalendarCheck } from "react-icons/fa";
import { guardarPresupuestoCloud, PresupuestoGuardado } from "@/lib/taller-sync";'''
assert target_imp in content, "target_imp not found"
content = content.replace(target_imp, repl_imp, 1)

# 2. Add guardarPresupuestoSilencioso & update handleCopyMessage
target_copy = '''  const handleCopyMessage = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(whatsAppMessage);
      setCopied(true);
      setToastMsg("✨ ¡Mensaje copiado! Pegalo en el chat de WhatsApp de tu cliente.");
      setTimeout(() => {
        setCopied(false);
        setToastMsg(null);
      }, 4000);
    }
  };'''

repl_copy = '''  // Guardar presupuesto automáticamente en la nube del Taller
  const guardarPresupuestoSilencioso = async (): Promise<PresupuestoGuardado | null> => {
    const serviciosActivos = serviciosState.filter((s) => s.activo);
    if (serviciosActivos.length === 0 && !clienteNombre.trim() && !vehiculoModelo.trim()) {
      return null;
    }

    const nuevo: PresupuestoGuardado = {
      id: `presupuesto-${Date.now()}`,
      fechaCreacion: new Date().toISOString(),
      cliente: clienteNombre.trim() || "Cliente",
      telefono: clienteTelefono.trim(),
      vehiculo: vehiculoModelo.trim() || `Vehículo (${selectedTamanioObj.label})`,
      tamanio: vehiculoTamanio,
      servicios: serviciosActivos.map((s) => `${s.nombre} (${formatAmount(s.precioNum)})`),
      monto: totalCotizado,
      estado: "pendiente",
      notas: notasExtras.trim() || undefined,
    };

    try {
      await guardarPresupuestoCloud(currentSlug, nuevo);
      return nuevo;
    } catch (err) {
      console.warn("No se pudo guardar presupuesto en nube:", err);
      return null;
    }
  };

  const handleCopyMessage = async () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(whatsAppMessage);
      setCopied(true);
      await guardarPresupuestoSilencioso();
      setToastMsg("✨ ¡Mensaje copiado y guardado en el Taller!");
      setTimeout(() => {
        setCopied(false);
        setToastMsg(null);
      }, 4000);
    }
  };'''

assert target_copy in content, "target_copy not found"
content = content.replace(target_copy, repl_copy, 1)

# 3. Update handlePrint
target_print = '''  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };'''
repl_print = '''  const handlePrint = async () => {
    await guardarPresupuestoSilencioso();
    if (typeof window !== "undefined") {
      window.print();
    }
  };'''
assert target_print in content, "target_print not found"
content = content.replace(target_print, repl_print, 1)

# 4. Update WhatsApp link and add bridge button
target_btn = '''                {/* Botón Principal: Enviar Directo a WhatsApp */}
                <a
                  href={whatsAppUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-4 rounded-2xl font-black text-sm sm:text-base transition-all cursor-pointer flex items-center justify-center gap-2.5 shadow-xl shadow-emerald-950/40 active:scale-95 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 border border-emerald-400"
                >
                  <FaWhatsapp className="size-5 text-neutral-950 shrink-0" />
                  <span>
                    {clienteTelefono.trim()
                      ? `Enviar Presupuesto por WhatsApp ${clienteNombre.trim() ? `a ${clienteNombre.trim()}` : ""}`
                      : "Abrir WhatsApp y Enviar Presupuesto"}
                  </span>
                </a>

                {/* Botones Secundarios: Copiar Mensaje & Descargar PDF */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={handleCopyMessage}
                    className="w-full py-3 rounded-xl font-bold text-xs bg-[#181818] hover:bg-[#222222] border border-neutral-700 hover:border-neutral-500 text-neutral-200 hover:text-white transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95"
                  >
                    {copied ? (
                      <>
                        <FaCheck className="size-3.5 text-emerald-400" />
                        <span className="text-emerald-400 font-bold">¡Copiado!</span>
                      </>
                    ) : (
                      <>
                        <FaCopy className="size-3.5 text-slate-400" />
                        <span>Copiar Mensaje</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handlePrint}
                    className="w-full py-3 rounded-xl font-bold text-xs bg-[#181818] hover:bg-[#222222] border border-neutral-700 hover:border-neutral-500 text-neutral-200 hover:text-white transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95"
                    title={`Descargar ${config.terminoCotizacion} Formal en formato PDF listo para enviar o imprimir`}
                  >
                    <FaFilePdf className="size-3.5 text-red-400" />
                    <span>Descargar PDF</span>
                  </button>
                </div>'''

repl_btn = '''                {/* Botón Principal: Enviar Directo a WhatsApp */}
                <a
                  href={whatsAppUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={async () => {
                    await guardarPresupuestoSilencioso();
                  }}
                  className="w-full py-4 rounded-2xl font-black text-sm sm:text-base transition-all cursor-pointer flex items-center justify-center gap-2.5 shadow-xl shadow-emerald-950/40 active:scale-95 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 border border-emerald-400"
                >
                  <FaWhatsapp className="size-5 text-neutral-950 shrink-0" />
                  <span>
                    {clienteTelefono.trim()
                      ? `Enviar Presupuesto por WhatsApp ${clienteNombre.trim() ? `a ${clienteNombre.trim()}` : ""}`
                      : "Abrir WhatsApp y Enviar Presupuesto"}
                  </span>
                </a>

                {/* Botones Secundarios: Copiar Mensaje & Descargar PDF */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={handleCopyMessage}
                    className="w-full py-3 rounded-xl font-bold text-xs bg-[#181818] hover:bg-[#222222] border border-neutral-700 hover:border-neutral-500 text-neutral-200 hover:text-white transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95"
                  >
                    {copied ? (
                      <>
                        <FaCheck className="size-3.5 text-emerald-400" />
                        <span className="text-emerald-400 font-bold">¡Copiado!</span>
                      </>
                    ) : (
                      <>
                        <FaCopy className="size-3.5 text-slate-400" />
                        <span>Copiar Mensaje</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handlePrint}
                    className="w-full py-3 rounded-xl font-bold text-xs bg-[#181818] hover:bg-[#222222] border border-neutral-700 hover:border-neutral-500 text-neutral-200 hover:text-white transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95"
                    title={`Descargar ${config.terminoCotizacion} Formal en formato PDF listo para enviar o imprimir`}
                  >
                    <FaFilePdf className="size-3.5 text-red-400" />
                    <span>Descargar PDF</span>
                  </button>
                </div>

                {/* Botón Puente: Ir al Taller & Agendar Turno */}
                <button
                  type="button"
                  onClick={async () => {
                    const guardado = await guardarPresupuestoSilencioso();
                    const idParam = guardado ? `&agendar=${encodeURIComponent(guardado.id)}` : "";
                    window.location.href = `/taller?slug=${encodeURIComponent(currentSlug)}${idParam}`;
                  }}
                  className="w-full py-3 rounded-xl font-bold text-xs bg-sky-950/50 hover:bg-sky-900/70 border border-sky-500/40 text-sky-200 hover:text-white transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95 shadow-md shadow-sky-950/30"
                >
                  <FaCalendarCheck className="size-3.5 text-sky-400" />
                  <span>Pasar al Taller y Agendar Turno</span>
                </button>'''

assert target_btn in content, "target_btn not found"
content = content.replace(target_btn, repl_btn, 1)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
print("Updated app/presupuesto/page.tsx successfully!")
