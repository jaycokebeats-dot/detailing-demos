"use client";

import { useEffect, useState } from "react";
import type { Business, ServiceItem } from "@/data/business-helpers";
import { DEFAULT_DEMO_BUSINESS } from "@/data/demo-business";
import { getDemoBusiness, saveDemoBusiness, resetDemoBusiness } from "@/lib/supabase";

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  const [activeTab, setActiveTab] = useState<"general" | "services" | "photos">("general");
  const [biz, setBiz] = useState<Business>(DEFAULT_DEMO_BUSINESS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Verificar sesión iniciada en sessionStorage
  useEffect(() => {
    const auth = sessionStorage.getItem("black_line_admin_auth");
    if (auth === "true") {
      setIsAuthenticated(true);
    }
  }, []);

  // Cargar datos del taller cuando está autenticado
  useEffect(() => {
    if (isAuthenticated) {
      setLoading(true);
      getDemoBusiness().then((data) => {
        setBiz(data);
        setLoading(false);
      });
    }
  }, [isAuthenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim().toLowerCase() === "demo" && password === "demo") {
      setIsAuthenticated(true);
      sessionStorage.setItem("black_line_admin_auth", "true");
      setLoginError("");
    } else {
      setLoginError("Usuario o contraseña incorrectos. Usá demo / demo");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem("black_line_admin_auth");
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleSave = async () => {
    setSaving(true);
    const res = await saveDemoBusiness(biz);
    setSaving(false);

    if (res.success) {
      showToast("✨ ¡Cambios guardados con éxito! Los datos ya se actualizaron en la web.");
    } else {
      showToast(`⚠️ Error al guardar: ${res.error || "No se pudo actualizar"}`);
    }
  };

  const handleReset = async () => {
    if (confirm("¿Estás seguro de restablecer los datos por defecto de la demo?")) {
      setLoading(true);
      await resetDemoBusiness();
      setBiz(DEFAULT_DEMO_BUSINESS);
      setLoading(false);
      showToast("🔄 Datos restablecidos a los valores originales.");
    }
  };

  // Manejo de Lista de Servicios
  const handleServiceChange = (index: number, field: keyof ServiceItem, value: any) => {
    const updatedServices = [...(biz.servicios || [])];
    updatedServices[index] = { ...updatedServices[index], [field]: value };
    setBiz({ ...biz, servicios: updatedServices });
  };

  const handleAddService = () => {
    const newService: ServiceItem = {
      nombre: "Nuevo Tratamiento Detail",
      descripcion: "Descripción detallada del nuevo servicio ofrecido por el taller.",
      precio: "$50.000",
      destacado: false,
    };
    setBiz({ ...biz, servicios: [...(biz.servicios || []), newService] });
  };

  const handleRemoveService = (index: number) => {
    const updatedServices = (biz.servicios || []).filter((_, i) => i !== index);
    setBiz({ ...biz, servicios: updatedServices });
  };

  // --- VISTA DE LOGIN ---
  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-neutral-950 text-neutral-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-amber-500/5 relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="text-center mb-6">
            <span className="inline-block px-3 py-1 bg-amber-500/10 text-amber-400 text-xs font-semibold rounded-full border border-amber-500/20 mb-3">
              ⚡ BLACK LINE DEMO
            </span>
            <h1 className="text-2xl font-bold tracking-tight">Panel de Autogestión</h1>
            <p className="text-xs text-neutral-400 mt-1">
              Ingresá con las credenciales demo para probar la edición en vivo de la web.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">
                Usuario
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="demo"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-neutral-100 focus:outline-none focus:border-amber-500 transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="demo"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-neutral-100 focus:outline-none focus:border-amber-500 transition-colors"
                required
              />
            </div>

            {loginError && (
              <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg p-2.5 text-center">
                {loginError}
              </p>
            )}

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold py-3 rounded-xl shadow-lg shadow-amber-500/20 transition-all text-sm cursor-pointer"
            >
              Ingresar al Panel
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-neutral-800/80 text-center">
            <p className="text-[11px] text-neutral-400">
              💡 Credenciales de prueba rápidas:<br />
              <strong className="text-amber-400">Usuario:</strong> demo | <strong className="text-amber-400">Contraseña:</strong> demo
            </p>
          </div>
        </div>
      </main>
    );
  }

  // --- VISTA DEL PANEL DE CONTROL ---
  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 pb-24">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-neutral-900 border border-amber-500/40 text-neutral-100 px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-fade-in text-xs sm:text-sm">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Superior */}
      <header className="sticky top-0 z-40 bg-neutral-950/80 backdrop-blur-md border-b border-neutral-800/80">
        <div className="max-w-5xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-black text-base">
              ⚡
            </div>
            <div>
              <h1 className="text-base font-bold text-neutral-100 flex items-center gap-2">
                {biz.nombre}
                <span className="text-[10px] font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full">
                  DEMO LIVE
                </span>
              </h1>
              <p className="text-xs text-neutral-400">Panel de Autogestión del Taller</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="/d/demo/"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-200 text-xs font-medium px-3.5 py-2 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <span>🔗</span>
              <span>Ver Web en Vivo</span>
            </a>

            <button
              onClick={handleReset}
              title="Restablecer valores originales"
              className="bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-400 hover:text-neutral-200 text-xs px-3 py-2 rounded-lg transition-colors"
            >
              🔄
            </button>

            <button
              onClick={handleLogout}
              className="bg-neutral-900 hover:bg-red-500/20 border border-neutral-800 hover:border-red-500/40 text-neutral-400 hover:text-red-400 text-xs px-3 py-2 rounded-lg transition-colors"
            >
              Salir
            </button>
          </div>
        </div>
      </header>

      {/* Creador de contenido principal */}
      <div className="max-w-5xl mx-auto px-4 py-6">
        {loading ? (
          <div className="py-20 text-center text-neutral-400 text-sm">
            Cargando datos del taller...
          </div>
        ) : (
          <div className="space-y-6">
            {/* Tabs de navegación */}
            <div className="flex border-b border-neutral-800 gap-2">
              <button
                onClick={() => setActiveTab("general")}
                className={`px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-all cursor-pointer ${
                  activeTab === "general"
                    ? "border-amber-500 text-amber-400 bg-amber-500/5"
                    : "border-transparent text-neutral-400 hover:text-neutral-200"
                }`}
              >
                📝 Información General
              </button>
              <button
                onClick={() => setActiveTab("services")}
                className={`px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-all cursor-pointer ${
                  activeTab === "services"
                    ? "border-amber-500 text-amber-400 bg-amber-500/5"
                    : "border-transparent text-neutral-400 hover:text-neutral-200"
                }`}
              >
                💰 Servicios y Precios ({biz.servicios?.length || 0})
              </button>
              <button
                onClick={() => setActiveTab("photos")}
                className={`px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-all cursor-pointer ${
                  activeTab === "photos"
                    ? "border-amber-500 text-amber-400 bg-amber-500/5"
                    : "border-transparent text-neutral-400 hover:text-neutral-200"
                }`}
              >
                📷 Fotos del Showroom
              </button>
            </div>

            {/* TAB 1: INFORMACIÓN GENERAL */}
            {activeTab === "general" && (
              <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 sm:p-6 space-y-4">
                <h2 className="text-sm font-bold text-amber-400 uppercase tracking-wider">
                  Datos Principales del Negocio
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-neutral-300 mb-1">
                      Nombre del Taller
                    </label>
                    <input
                      type="text"
                      value={biz.nombre}
                      onChange={(e) => setBiz({ ...biz, nombre: e.target.value })}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2 text-sm text-neutral-100 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-neutral-300 mb-1">
                      Número de WhatsApp (Sin + ni espacios)
                    </label>
                    <input
                      type="text"
                      value={biz.whatsapp || ""}
                      onChange={(e) => setBiz({ ...biz, whatsapp: e.target.value })}
                      placeholder="5491155558888"
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2 text-sm text-neutral-100 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-neutral-300 mb-1">
                      Teléfono Visible
                    </label>
                    <input
                      type="text"
                      value={biz.telefono}
                      onChange={(e) => setBiz({ ...biz, telefono: e.target.value })}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2 text-sm text-neutral-100 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-neutral-300 mb-1">
                      Usuario de Instagram (Sin @)
                    </label>
                    <input
                      type="text"
                      value={biz.instagram || ""}
                      onChange={(e) => setBiz({ ...biz, instagram: e.target.value })}
                      placeholder="demodetailstudio"
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2 text-sm text-neutral-100 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-neutral-300 mb-1">
                      Dirección Taller
                    </label>
                    <input
                      type="text"
                      value={biz.direccion}
                      onChange={(e) => setBiz({ ...biz, direccion: e.target.value })}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2 text-sm text-neutral-100 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-neutral-300 mb-1">
                      Ciudad / Zona
                    </label>
                    <input
                      type="text"
                      value={biz.ciudad}
                      onChange={(e) => setBiz({ ...biz, ciudad: e.target.value })}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2 text-sm text-neutral-100 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-neutral-300 mb-1">
                      Horario de Atención
                    </label>
                    <input
                      type="text"
                      value={biz.horario || ""}
                      onChange={(e) => setBiz({ ...biz, horario: e.target.value })}
                      placeholder="Lunes a Sábados: 09:00 a 19:00 hs"
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2 text-sm text-neutral-100 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: SERVICIOS Y PRECIOS */}
            {activeTab === "services" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-bold text-amber-400 uppercase tracking-wider">
                      Catálogo de Servicios & Lista de Precios
                    </h2>
                    <p className="text-xs text-neutral-400">
                      Modificá nombres, precios o descripciones. Se actualizarán automáticamente en las tarjetas de la web.
                    </p>
                  </div>
                  <button
                    onClick={handleAddService}
                    className="bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs px-3.5 py-2 rounded-xl transition-all cursor-pointer shadow-md shadow-amber-500/10"
                  >
                    ➕ Agregar Servicio
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {(biz.servicios || []).map((srv, idx) => (
                    <div
                      key={idx}
                      className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-3 relative group"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <span className="text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-lg">
                          Servicio #{idx + 1}
                        </span>

                        <button
                          onClick={() => handleRemoveService(idx)}
                          className="text-neutral-500 hover:text-red-400 text-xs px-2 py-1 rounded transition-colors"
                          title="Eliminar este servicio"
                        >
                          🗑️ Eliminar
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="sm:col-span-2">
                          <label className="block text-[11px] font-medium text-neutral-400 mb-1">
                            Nombre del Tratamiento
                          </label>
                          <input
                            type="text"
                            value={srv.nombre}
                            onChange={(e) => handleServiceChange(idx, "nombre", e.target.value)}
                            className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-1.5 text-sm text-neutral-100 focus:outline-none focus:border-amber-500"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-medium text-neutral-400 mb-1">
                            Precio Mostrado
                          </label>
                          <input
                            type="text"
                            value={srv.precio}
                            onChange={(e) => handleServiceChange(idx, "precio", e.target.value)}
                            className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-1.5 text-sm font-semibold text-amber-400 focus:outline-none focus:border-amber-500"
                          />
                        </div>

                        <div className="sm:col-span-3">
                          <label className="block text-[11px] font-medium text-neutral-400 mb-1">
                            Descripción Breve
                          </label>
                          <textarea
                            rows={2}
                            value={srv.descripcion}
                            onChange={(e) => handleServiceChange(idx, "descripcion", e.target.value)}
                            className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-1.5 text-xs text-neutral-200 focus:outline-none focus:border-amber-500 resize-none"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block text-[11px] font-medium text-neutral-400 mb-1">
                            Garantía / Detalle Adicional (Opcional)
                          </label>
                          <input
                            type="text"
                            value={srv.proteccion || ""}
                            onChange={(e) => handleServiceChange(idx, "proteccion", e.target.value)}
                            placeholder="Ej: Incluye Sellador 6 Meses"
                            className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-1.5 text-xs text-neutral-300 focus:outline-none focus:border-amber-500"
                          />
                        </div>

                        <div className="flex items-center pt-4">
                          <label className="flex items-center gap-2 cursor-pointer text-xs text-neutral-300">
                            <input
                              type="checkbox"
                              checked={!!srv.destacado}
                              onChange={(e) => handleServiceChange(idx, "destacado", e.target.checked)}
                              className="accent-amber-500 w-4 h-4 rounded"
                            />
                            <span>⭐ Destacar en la Web</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: FOTOS DEL SHOWROOM */}
            {activeTab === "photos" && (
              <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 sm:p-6 space-y-4">
                <h2 className="text-sm font-bold text-amber-400 uppercase tracking-wider">
                  Galería y Fotos del Taller
                </h2>

                <p className="text-xs text-neutral-400 leading-relaxed">
                  💡 Si dejás el arreglo de fotos vacío, la web activa automáticamente el **video cinematográfico 3D de Car Detailing HD (`hero.mp4`)**. Si agregás URLs de fotos, la web mostrará tu galería personalizada.
                </p>

                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">
                    URLs de Fotos (Una por línea)
                  </label>
                  <textarea
                    rows={5}
                    value={(biz.fotos || []).join("\n")}
                    onChange={(e) =>
                      setBiz({
                        ...biz,
                        fotos: e.target.value.split("\n").map((s) => s.trim()).filter(Boolean),
                      })
                    }
                    placeholder="https://images.unsplash.com/photo-..."
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-xs text-neutral-200 focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Barra de Guardado Inferior */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-neutral-950/90 backdrop-blur-md border-t border-neutral-800 p-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <div className="hidden sm:block">
            <p className="text-xs text-neutral-300 font-medium">
              ¿Terminaste de editar los datos de tu taller?
            </p>
            <p className="text-[11px] text-neutral-400">
              Hacé clic en guardar para actualizar la web en vivo.
            </p>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full sm:w-auto bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-sm px-8 py-3 rounded-xl shadow-lg shadow-amber-500/20 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                <span>Guardando...</span>
              </>
            ) : (
              <>
                <span>💾 Guardar Cambios en la Web</span>
              </>
            )}
          </button>
        </div>
      </div>
    </main>
  );
}
