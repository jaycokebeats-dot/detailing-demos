import os

# 1. Update app/presupuesto/page.tsx
presupuesto_file = os.path.join("Code", "black-line-detailing", "app", "presupuesto", "page.tsx")
with open(presupuesto_file, "r", encoding="utf-8") as f:
    p_code = f.read()

# Add "Ir al Taller" in header
target_header = '''              <button
                type="button"
                onClick={handlePrint}
                className="bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 hover:border-neutral-500 text-neutral-200 hover:text-white text-xs font-semibold px-3 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                title="Descargar o imprimir presupuesto formal en PDF"
              >
                <span>📄</span>
                <span>Descargar PDF</span>
              </button>
              <a
                href={`/d/${currentSlug}/`}'''

repl_header = '''              <button
                type="button"
                onClick={handlePrint}
                className="bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 hover:border-neutral-500 text-neutral-200 hover:text-white text-xs font-semibold px-3 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                title="Descargar o imprimir presupuesto formal en PDF"
              >
                <span>📄</span>
                <span>Descargar PDF</span>
              </button>
              <a
                href={`/taller?slug=${encodeURIComponent(currentSlug)}`}
                className="bg-sky-950/60 hover:bg-sky-900/80 border border-sky-500/40 text-sky-200 hover:text-white text-xs font-semibold px-3 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
                title="Ir al Control de Taller & Caja"
              >
                <span>🏢</span>
                <span>Ir al Taller</span>
              </a>
              <a
                href={`/d/${currentSlug}/`}'''

assert target_header in p_code, "target_header not found"
p_code = p_code.replace(target_header, repl_header, 1)

# Remove the confusing "Pasar al Taller y Agendar Turno" button at bottom
target_bottom_btn = '''                {/* Botón Puente: Ir al Taller & Agendar Turno */}
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

assert target_bottom_btn in p_code, "target_bottom_btn not found"
p_code = p_code.replace(target_bottom_btn, "", 1)

with open(presupuesto_file, "w", encoding="utf-8") as f:
    f.write(p_code)
print("Updated app/presupuesto/page.tsx successfully!")

# 2. Update app/taller/page.tsx
taller_file = os.path.join("Code", "black-line-detailing", "app", "taller", "page.tsx")
with open(taller_file, "r", encoding="utf-8") as f:
    t_code = f.read()

target_taller_load = '''        // Paso B: Conectar a la base de datos en la nube (Supabase)
        setSyncStatus("saving");
        const cloudData = await fetchTallerCloudData(slug);
        if (cloudData && Array.isArray(cloudData.trabajos) && Array.isArray(cloudData.gastos)) {
          setTrabajos(cloudData.trabajos);
          setGastos(cloudData.gastos);
          if (Array.isArray(cloudData.presupuestos)) {
            setPresupuestos(cloudData.presupuestos);
          }
          setSyncStatus("synced");
        }'''

repl_taller_load = '''        // Paso B: Conectar a la base de datos en la nube (Supabase)
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
        }'''

assert target_taller_load in t_code, "target_taller_load not found"
t_code = t_code.replace(target_taller_load, repl_taller_load, 1)

with open(taller_file, "w", encoding="utf-8") as f:
    f.write(t_code)
print("Updated app/taller/page.tsx successfully!")
