"use client";

import { useEffect, useState, useRef } from "react";
import type { Business, ServiceItem } from "@/data/business-helpers";
import { DEFAULT_DEMO_BUSINESS } from "@/data/demo-business";
import { getDemoBusiness, saveDemoBusiness, resetDemoBusiness } from "@/lib/supabase";

// Presets de fotos reales de alta definición listas para usar
const PRESETS_BEFORE_AFTER = [
  {
    label: "Cerámico 9H",
    antes: "/servicios/ceramico-antes.png",
    despues: "/servicios/ceramico-despues.png",
  },
  {
    label: "Detallado Motor",
    antes: "/before-after/motor-antes.jpg",
    despues: "/before-after/motor-despues.jpg",
  },
  {
    label: "Corrección Pintura",
    antes: "/before-after/pintura-antes.jpg",
    despues: "/before-after/pintura-despues.jpg",
  },
  {
    label: "PPF Gloss",
    antes: "/servicios/ppf-brilloso-antes.png",
    despues: "/servicios/ppf-brilloso-despues.png",
  },
  {
    label: "Limpieza Tapizados",
    antes: "/servicios/limpieza-tapizado-antes.png",
    despues: "/servicios/limpieza-tapizado-despues.png",
  },
  {
    label: "Reparación Cuero",
    antes: "/servicios/reparacion-tapizado-antes.png",
    despues: "/servicios/reparacion-tapizado-despues.png",
  },
  {
    label: "Polarizado Nano",
    antes: "/servicios/polarizado-antes.png",
    despues: "/servicios/polarizado-despues.png",
  },
  {
    label: "Sacabollos PDR",
    antes: "/servicios/sacabollos-antes.png",
    despues: "/servicios/sacabollos-despues.png",
  },
];

const PRESETS_SINGLE = [
  { label: "Lavado Premium Exterior", img: "/servicios/exterior.jpg" },
  { label: "Interior Detallado", img: "/servicios/interior.jpg" },
  { label: "Tratamiento Acrílico", img: "/servicios/acrilico.jpg" },
  { label: "Cerámico Terminado", img: "/servicios/ceramico-real.jpg" },
  { label: "Protección PPF", img: "/servicios/ppf.jpg" },
  { label: "Polarizado Control Solar", img: "/servicios/polarizado.jpg" },
  { label: "Ploteo & Wrap", img: "/servicios/ploteo.jpg" },
  { label: "Reparación Butaca", img: "/servicios/tapizado-reparacion.jpg" },
];

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  const [activeTab, setActiveTab] = useState<"general" | "services">("services");
  const [biz, setBiz] = useState<Business>(DEFAULT_DEMO_BUSINESS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    const auth = sessionStorage.getItem("black_line_admin_auth");
    if (auth === "true") {
      setIsAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      setLoading(true);
      getDemoBusiness().then((data) => {
        if (data) setBiz(data);
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
    if (confirm("¿Estás seguro de restablecer los datos originales de la demo?")) {
      setLoading(true);
      await resetDemoBusiness();
      setBiz(DEFAULT_DEMO_BUSINESS);
      setLoading(false);
      showToast("🔄 Datos restablecidos a los valores por defecto.");
    }
  };

  // Manejo de servicios
  const handleServiceChange = (index: number, field: keyof ServiceItem, value: any) => {
    const updatedServices = [...(biz.servicios || [])];
    updatedServices[index] = { ...updatedServices[index], [field]: value };
    setBiz({ ...biz, servicios: updatedServices });
  };

  const handleAddService = () => {
    const newService: ServiceItem = {
      nombre: "Nuevo Tratamiento Detail",
      descripcion: "Descripción detallada del servicio ofrecido con materiales de máxima calidad.",
      precio: "Desde $45.000",
      destacado: false,
      proteccion: "Garantía Oficial de Calidad",
      img: "/servicios/exterior.jpg",
    };
    setBiz({ ...biz, servicios: [...(biz.servicios || []), newService] });
  };

  const handleRemoveService = (index: number) => {
    if (confirm(`¿Eliminar el servicio "${biz.servicios?.[index]?.nombre || "seleccionado"}"?`)) {
      const updatedServices = (biz.servicios || []).filter((_, i) => i !== index);
      setBiz({ ...biz, servicios: updatedServices });
    }
  };

  // Subir imagen local (FileReader a Base64)
  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number,
    field: "antes_img" | "despues_img" | "img"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 4 * 1024 * 1024) {
      alert("La imagen es muy pesada. Por favor seleccioná una imagen menor a 4MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        handleServiceChange(index, field, result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Cambiar modo de foto del servicio
  const setServicePhotoMode = (index: number, mode: "before_after" | "single") => {
    const s = (biz.servicios || [])[index];
    if (!s) return;

    if (mode === "before_after") {
      // Activar antes y después
      handleServiceChange(index, "antes_img", s.antes_img || "/servicios/ceramico-antes.png");
      handleServiceChange(index, "despues_img", s.despues_img || "/servicios/ceramico-despues.png");
    } else {
      // Activar foto única
      const updatedServices = [...(biz.servicios || [])];
      delete updatedServices[index].antes_img;
      delete updatedServices[index].despues_img;
      updatedServices[index].img = s.img || "/servicios/exterior.jpg";
      setBiz({ ...biz, servicios: updatedServices });
    }
  };

  // --- VISTA DE LOGIN ---
  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-[#0a0a0a] text-neutral-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-[#121212] border border-amber-500/20 rounded-3xl p-7 sm:p-9 shadow-2xl shadow-amber-500/5 relative overflow-hidden">
          <div className="absolute -top-16 -right-16 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="text-center mb-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 text-amber-400 text-xs font-bold rounded-full border border-amber-500/30 mb-3 tracking-wide">
              <span>⚡</span> BLACK LINE STUDIO
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Panel de Autogestión
            </h1>
            <p className="text-xs text-neutral-400 mt-2">
              Ingresá con las credenciales demo para probar cómo tu cliente puede editar su web en tiempo real.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                Usuario
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="demo"
                className="w-full bg-[#0a0a0a] border border-neutral-800 rounded-xl px-4 py-3 text-sm text-neutral-100 focus:outline-none focus:border-amber-500 transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="demo"
                className="w-full bg-[#0a0a0a] border border-neutral-800 rounded-xl px-4 py-3 text-sm text-neutral-100 focus:outline-none focus:border-amber-500 transition-colors"
                required
              />
            </div>

            {loginError && (
              <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-center">
                {loginError}
              </p>
            )}

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:brightness-110 text-black font-extrabold py-3.5 rounded-xl shadow-lg shadow-amber-500/25 transition-all text-sm cursor-pointer mt-2"
            >
              Ingresar al Panel
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-neutral-800/80 text-center">
            <p className="text-xs text-neutral-400">
              💡 Credenciales de demostración:<br />
              <strong className="text-amber-400">Usuario:</strong> demo &nbsp;|&nbsp;{" "}
              <strong className="text-amber-400">Contraseña:</strong> demo
            </p>
          </div>
        </div>
      </main>
    );
  }

  // --- VISTA DEL PANEL DE CONTROL ---
  return (
    <main className="min-h-screen bg-[#090909] text-neutral-100 pb-32">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-[#161616] border border-amber-500/50 text-neutral-100 px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 animate-fade-in text-xs sm:text-sm font-medium">
          <span className="text-base">✨</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Superior Sticky */}
      <header className="sticky top-0 z-40 bg-[#090909]/90 backdrop-blur-md border-b border-neutral-800/80">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-black text-lg">
              ⚡
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-extrabold text-neutral-100 truncate max-w-[180px] sm:max-w-none">
                  {biz.nombre}
                </h1>
                <span className="text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/40 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Panel Demo
                </span>
              </div>
              <p className="text-[11px] text-neutral-400">Panel de Control & Autogestión</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="/d/demo/"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-neutral-900 hover:bg-neutral-800 border border-amber-500/30 hover:border-amber-500 text-amber-400 text-xs font-bold px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 shadow-sm"
              title="Abrir la web en vivo en una pestaña nueva"
            >
              <span>🔗</span>
              <span className="hidden sm:inline">Ver Web en Vivo</span>
              <span className="sm:hidden">Ver Web</span>
            </a>

            <button
              onClick={handleReset}
              title="Restablecer valores originales de la demo"
              className="bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-400 hover:text-neutral-200 text-xs px-3 py-2 rounded-xl transition-colors cursor-pointer"
            >
              🔄
            </button>

            <button
              onClick={handleLogout}
              className="bg-neutral-900 hover:bg-red-500/20 border border-neutral-800 hover:border-red-500/40 text-neutral-400 hover:text-red-400 text-xs px-3 py-2 rounded-xl transition-colors cursor-pointer"
            >
              Salir
            </button>
          </div>
        </div>
      </header>

      {/* Contenido Principal */}
      <div className="max-w-5xl mx-auto px-4 py-6">
        {loading ? (
          <div className="py-24 text-center text-neutral-400 text-sm flex flex-col items-center gap-3">
            <span className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
            <span>Cargando datos del taller...</span>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Tabs de Navegación (Solo 2 secciones, limpias y directas) */}
            <div className="grid grid-cols-2 gap-2 bg-[#121212] p-1.5 rounded-2xl border border-neutral-800 max-w-md mx-auto">
              <button
                type="button"
                onClick={() => setActiveTab("general")}
                className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  activeTab === "general"
                    ? "bg-amber-500 text-black shadow-md shadow-amber-500/20"
                    : "text-neutral-400 hover:text-neutral-200"
                }`}
              >
                <span>📝</span>
                <span>1. Datos del Taller</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("services")}
                className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  activeTab === "services"
                    ? "bg-amber-500 text-black shadow-md shadow-amber-500/20"
                    : "text-neutral-400 hover:text-neutral-200"
                }`}
              >
                <span>🛠️</span>
                <span>2. Servicios y Precios ({biz.servicios?.length || 0})</span>
              </button>
            </div>

            {/* SECCIÓN 1: DATOS GENERALES DEL TALLER */}
            {activeTab === "general" && (
              <div className="bg-[#121212] border border-neutral-800 rounded-3xl p-5 sm:p-7 space-y-6">
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                    <span>📌</span>
                    <span>Información Principal de tu Negocio</span>
                  </h2>
                  <p className="text-xs text-neutral-400 mt-1">
                    Estos datos se muestran en la cabecera, pie de página y botones de contacto de toda tu web.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                      Nombre Comercial del Taller
                    </label>
                    <input
                      type="text"
                      value={biz.nombre}
                      onChange={(e) => setBiz({ ...biz, nombre: e.target.value })}
                      placeholder="Ej: Black Line Detail Studio"
                      className="w-full bg-[#0a0a0a] border border-neutral-800 rounded-xl px-4 py-3 text-sm text-neutral-100 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  {/* Número de WhatsApp - Destacado especial */}
                  <div className="sm:col-span-2 bg-emerald-500/5 border border-emerald-500/30 rounded-2xl p-4 sm:p-5 space-y-2">
                    <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs sm:text-sm">
                      <span className="text-base">💬</span>
                      <span>Número de WhatsApp para Presupuestos y Consultas</span>
                    </div>
                    <p className="text-[11px] sm:text-xs text-neutral-400 leading-relaxed">
                      💡 Todos los botones de la web (el del menú, el botón del Hero, los botones de cada servicio y el WhatsApp flotante) enviarán los mensajes a este número.
                    </p>
                    <div className="pt-1">
                      <input
                        type="text"
                        value={biz.whatsapp || ""}
                        onChange={(e) => setBiz({ ...biz, whatsapp: e.target.value.replace(/[^\d]/g, "") })}
                        placeholder="Ej: 5491155558888 (Código de país + área + número, sin + ni espacios)"
                        className="w-full bg-[#0a0a0a] border border-emerald-500/40 rounded-xl px-4 py-3 text-sm font-mono text-emerald-400 focus:outline-none focus:border-emerald-400"
                      />
                      <p className="text-[10px] text-neutral-500 mt-1.5">
                        Formato internacional: <strong>549</strong> (Argentina), <strong>52</strong> (México), <strong>34</strong> (España), seguido del número sin espacios ni guiones.
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                      Teléfono de Línea / Visible
                    </label>
                    <input
                      type="text"
                      value={biz.telefono}
                      onChange={(e) => setBiz({ ...biz, telefono: e.target.value })}
                      placeholder="+54 9 11 5555-8888"
                      className="w-full bg-[#0a0a0a] border border-neutral-800 rounded-xl px-4 py-3 text-sm text-neutral-100 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                      Usuario de Instagram (Sin @)
                    </label>
                    <input
                      type="text"
                      value={biz.instagram || ""}
                      onChange={(e) => setBiz({ ...biz, instagram: e.target.value.replace("@", "").trim() })}
                      placeholder="blacklinedetailing"
                      className="w-full bg-[#0a0a0a] border border-neutral-800 rounded-xl px-4 py-3 text-sm text-neutral-100 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                      Dirección Física del Taller
                    </label>
                    <input
                      type="text"
                      value={biz.direccion}
                      onChange={(e) => setBiz({ ...biz, direccion: e.target.value })}
                      placeholder="Av. Del Libertador 4500"
                      className="w-full bg-[#0a0a0a] border border-neutral-800 rounded-xl px-4 py-3 text-sm text-neutral-100 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                      Ciudad / Localidad / Zona
                    </label>
                    <input
                      type="text"
                      value={biz.ciudad}
                      onChange={(e) => setBiz({ ...biz, ciudad: e.target.value })}
                      placeholder="Buenos Aires"
                      className="w-full bg-[#0a0a0a] border border-neutral-800 rounded-xl px-4 py-3 text-sm text-neutral-100 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                      Horarios de Atención
                    </label>
                    <input
                      type="text"
                      value={biz.horario || ""}
                      onChange={(e) => setBiz({ ...biz, horario: e.target.value })}
                      placeholder="Lunes a Sábados: 09:00 a 19:00 hs"
                      className="w-full bg-[#0a0a0a] border border-neutral-800 rounded-xl px-4 py-3 text-sm text-neutral-100 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                      Enlace a Google Maps (Opcional)
                    </label>
                    <input
                      type="text"
                      value={biz.maps_url || ""}
                      onChange={(e) => setBiz({ ...biz, maps_url: e.target.value })}
                      placeholder="https://maps.google.com/?q=..."
                      className="w-full bg-[#0a0a0a] border border-neutral-800 rounded-xl px-4 py-3 text-sm text-neutral-100 focus:outline-none focus:border-amber-500 text-xs font-mono"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* SECCIÓN 2: CATÁLOGO DE SERVICIOS Y PRECIOS */}
            {activeTab === "services" && (
              <div className="space-y-5">
                {/* Banner de control de servicios */}
                <div className="bg-[#121212] border border-neutral-800 rounded-2xl p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                      <span>🛠️</span>
                      <span>Catálogo de Servicios & Lista de Precios</span>
                    </h2>
                    <p className="text-xs text-neutral-400 mt-1 max-w-xl">
                      Agregá, editá o eliminá los tratamientos de tu taller. Podés configurar fotos comparativas de <strong>Antes y Después con slider interactivo</strong> o una <strong>foto única</strong> si no tenés el antes.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddService}
                    className="self-start sm:self-center bg-gradient-to-r from-amber-500 to-amber-600 hover:brightness-110 text-black font-extrabold text-xs sm:text-sm px-4 py-2.5 rounded-xl transition-all cursor-pointer shadow-lg shadow-amber-500/20 flex items-center gap-2 shrink-0"
                  >
                    <span>➕</span>
                    <span>Agregar Tratamiento</span>
                  </button>
                </div>

                {/* Lista de Servicios */}
                <div className="grid grid-cols-1 gap-6">
                  {(biz.servicios || []).map((srv, idx) => {
                    const isBeforeAfter = Boolean(srv.antes_img && srv.despues_img);

                    return (
                      <div
                        key={idx}
                        className="bg-[#121212] border border-neutral-800 hover:border-neutral-700/80 rounded-3xl p-5 sm:p-7 space-y-5 relative transition-all shadow-xl"
                      >
                        {/* Header de la tarjeta */}
                        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-neutral-800/80">
                          <div className="flex items-center gap-2.5">
                            <span className="text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-xl">
                              Servicio #{idx + 1}
                            </span>
                            <span className="text-xs font-semibold text-neutral-300 truncate max-w-[200px] sm:max-w-none">
                              {srv.nombre || "Sin Título"}
                            </span>
                          </div>

                          <div className="flex items-center gap-3">
                            <label className="flex items-center gap-1.5 cursor-pointer text-xs font-medium text-neutral-300 bg-neutral-900 px-3 py-1.5 rounded-xl border border-neutral-800 hover:border-neutral-700">
                              <input
                                type="checkbox"
                                checked={!!srv.destacado}
                                onChange={(e) => handleServiceChange(idx, "destacado", e.target.checked)}
                                className="accent-amber-500 w-3.5 h-3.5 rounded cursor-pointer"
                              />
                              <span>⭐ Destacado</span>
                            </label>

                            <button
                              type="button"
                              onClick={() => handleRemoveService(idx)}
                              className="text-neutral-500 hover:text-red-400 text-xs px-2.5 py-1.5 rounded-xl hover:bg-red-500/10 transition-colors flex items-center gap-1 cursor-pointer"
                              title="Eliminar este servicio"
                            >
                              <span>🗑️</span>
                              <span className="hidden sm:inline">Eliminar</span>
                            </button>
                          </div>
                        </div>

                        {/* Campos de texto principales */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div className="sm:col-span-2">
                            <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                              Nombre / Título del Tratamiento
                            </label>
                            <input
                              type="text"
                              value={srv.nombre}
                              onChange={(e) => handleServiceChange(idx, "nombre", e.target.value)}
                              placeholder="Ej: Tratamiento Cerámico 9H"
                              className="w-full bg-[#0a0a0a] border border-neutral-800 rounded-xl px-4 py-2.5 text-sm font-semibold text-neutral-100 focus:outline-none focus:border-amber-500"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                              Precio Mostrado
                            </label>
                            <input
                              type="text"
                              value={srv.precio}
                              onChange={(e) => handleServiceChange(idx, "precio", e.target.value)}
                              placeholder="Ej: $160.000 / Desde $45.000"
                              className="w-full bg-[#0a0a0a] border border-neutral-800 rounded-xl px-4 py-2.5 text-sm font-bold text-amber-400 focus:outline-none focus:border-amber-500"
                            />
                          </div>

                          <div className="sm:col-span-3">
                            <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                              Descripción Completa del Trabajo
                            </label>
                            <textarea
                              rows={2}
                              value={srv.descripcion}
                              onChange={(e) => handleServiceChange(idx, "descripcion", e.target.value)}
                              placeholder="Detallá los pasos técnicos, beneficios y resultados para el cliente..."
                              className="w-full bg-[#0a0a0a] border border-neutral-800 rounded-xl p-3 text-xs sm:text-sm text-neutral-200 focus:outline-none focus:border-amber-500 resize-none leading-relaxed"
                            />
                          </div>

                          <div className="sm:col-span-2">
                            <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                              Garantía / Beneficio Destacado (Insignia en la tarjeta)
                            </label>
                            <input
                              type="text"
                              value={srv.proteccion || ""}
                              onChange={(e) => handleServiceChange(idx, "proteccion", e.target.value)}
                              placeholder="Ej: Brillo Espejo & Máxima Hidrofobia / Garantía 3 Años"
                              className="w-full bg-[#0a0a0a] border border-neutral-800 rounded-xl px-4 py-2.5 text-xs text-neutral-300 focus:outline-none focus:border-amber-500"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                              Detalle Recomendado (Ideal para...)
                            </label>
                            <input
                              type="text"
                              value={srv.ideal_si || ""}
                              onChange={(e) => handleServiceChange(idx, "ideal_si", e.target.value)}
                              placeholder="Ej: Autos 0km o con pintura desgastada"
                              className="w-full bg-[#0a0a0a] border border-neutral-800 rounded-xl px-4 py-2.5 text-xs text-neutral-400 focus:outline-none focus:border-amber-500"
                            />
                          </div>
                        </div>

                        {/* SELECTOR DE FORMATO DE FOTO (Requerimiento Clave) */}
                        <div className="bg-[#0b0b0b] border border-neutral-800/80 rounded-2xl p-4 sm:p-5 space-y-4">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div>
                              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                                📸 Formato de Fotografía del Servicio
                              </span>
                              <p className="text-[11px] text-neutral-400">
                                Elegí si querés slider comparativo de 2 fotos o una sola foto de alta calidad.
                              </p>
                            </div>

                            {/* Switch de modo */}
                            <div className="inline-flex rounded-xl bg-neutral-900 p-1 border border-neutral-800 self-start sm:self-auto">
                              <button
                                type="button"
                                onClick={() => setServicePhotoMode(idx, "before_after")}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                  isBeforeAfter
                                    ? "bg-amber-500 text-black shadow-sm"
                                    : "text-neutral-400 hover:text-white"
                                }`}
                              >
                                🔄 Antes y Después (2 fotos)
                              </button>
                              <button
                                type="button"
                                onClick={() => setServicePhotoMode(idx, "single")}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                  !isBeforeAfter
                                    ? "bg-amber-500 text-black shadow-sm"
                                    : "text-neutral-400 hover:text-white"
                                }`}
                              >
                                🖼️ Foto Única (1 foto)
                              </button>
                            </div>
                          </div>

                          {/* CASO A: ANTES Y DESPUÉS */}
                          {isBeforeAfter ? (
                            <div className="space-y-4 pt-1">
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {/* Foto Antes */}
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between">
                                    <label className="text-xs font-bold text-neutral-300 flex items-center gap-1.5">
                                      <span className="w-2 h-2 rounded-full bg-red-400" />
                                      <span>Foto del ANTES (Estado Inicial)</span>
                                    </label>
                                    <label className="text-[10px] text-amber-400 hover:underline cursor-pointer">
                                      📁 Subir archivo
                                      <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) => handleFileUpload(e, idx, "antes_img")}
                                      />
                                    </label>
                                  </div>

                                  <input
                                    type="text"
                                    value={srv.antes_img || ""}
                                    onChange={(e) => handleServiceChange(idx, "antes_img", e.target.value)}
                                    placeholder="URL o ruta de la foto inicial (/servicios/...)"
                                    className="w-full bg-[#121212] border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-200 focus:outline-none focus:border-amber-500 font-mono"
                                  />

                                  {srv.antes_img && (
                                    <div className="aspect-video w-full rounded-xl overflow-hidden bg-neutral-950 border border-neutral-800 relative group">
                                      {/* eslint-disable-next-line @next/next/no-img-element */}
                                      <img
                                        src={srv.antes_img}
                                        alt="Preview Antes"
                                        className="w-full h-full object-cover"
                                      />
                                      <span className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/80 backdrop-blur-sm text-[10px] font-bold text-red-300 rounded-md border border-red-500/30">
                                        ANTES
                                      </span>
                                    </div>
                                  )}
                                </div>

                                {/* Foto Después */}
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between">
                                    <label className="text-xs font-bold text-neutral-300 flex items-center gap-1.5">
                                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                                      <span>Foto del DESPUÉS (Terminado)</span>
                                    </label>
                                    <label className="text-[10px] text-amber-400 hover:underline cursor-pointer">
                                      📁 Subir archivo
                                      <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) => handleFileUpload(e, idx, "despues_img")}
                                      />
                                    </label>
                                  </div>

                                  <input
                                    type="text"
                                    value={srv.despues_img || ""}
                                    onChange={(e) => handleServiceChange(idx, "despues_img", e.target.value)}
                                    placeholder="URL o ruta de la foto terminada (/servicios/...)"
                                    className="w-full bg-[#121212] border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-200 focus:outline-none focus:border-amber-500 font-mono"
                                  />

                                  {srv.despues_img && (
                                    <div className="aspect-video w-full rounded-xl overflow-hidden bg-neutral-950 border border-neutral-800 relative group">
                                      {/* eslint-disable-next-line @next/next/no-img-element */}
                                      <img
                                        src={srv.despues_img}
                                        alt="Preview Después"
                                        className="w-full h-full object-cover"
                                      />
                                      <span className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/80 backdrop-blur-sm text-[10px] font-bold text-emerald-300 rounded-md border border-emerald-500/30">
                                        DESPUÉS
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Presets rápidos Antes/Después */}
                              <div className="pt-2">
                                <span className="text-[11px] font-semibold text-neutral-400 block mb-1.5">
                                  ⚡ Fotos comparativas listas para aplicar:
                                </span>
                                <div className="flex flex-wrap gap-1.5">
                                  {PRESETS_BEFORE_AFTER.map((p) => (
                                    <button
                                      key={p.label}
                                      type="button"
                                      onClick={() => {
                                        handleServiceChange(idx, "antes_img", p.antes);
                                        handleServiceChange(idx, "despues_img", p.despues);
                                      }}
                                      className="text-[10px] font-medium bg-neutral-900 hover:bg-amber-500/20 text-neutral-300 hover:text-amber-300 border border-neutral-800 hover:border-amber-500/40 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                                    >
                                      {p.label}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </div>
                          ) : (
                            /* CASO B: FOTO ÚNICA */
                            <div className="space-y-4 pt-1">
                              <div className="space-y-2 max-w-lg">
                                <div className="flex items-center justify-between">
                                  <label className="text-xs font-bold text-neutral-300 flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                                    <span>Foto del Trabajo Terminado</span>
                                  </label>
                                  <label className="text-[10px] text-amber-400 hover:underline cursor-pointer">
                                    📁 Subir archivo desde dispositivo
                                    <input
                                      type="file"
                                      accept="image/*"
                                      className="hidden"
                                      onChange={(e) => handleFileUpload(e, idx, "img")}
                                    />
                                  </label>
                                </div>

                                <input
                                  type="text"
                                  value={srv.img || ""}
                                  onChange={(e) => handleServiceChange(idx, "img", e.target.value)}
                                  placeholder="URL o ruta de la foto (/servicios/...)"
                                  className="w-full bg-[#121212] border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-200 focus:outline-none focus:border-amber-500 font-mono"
                                />

                                {srv.img && (
                                  <div className="aspect-video w-full rounded-xl overflow-hidden bg-neutral-950 border border-neutral-800 relative">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                      src={srv.img}
                                      alt="Preview Foto Única"
                                      className="w-full h-full object-cover"
                                    />
                                    <span className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/80 backdrop-blur-sm text-[10px] font-bold text-amber-300 rounded-md border border-amber-500/30">
                                      FOTO FIJA
                                    </span>
                                  </div>
                                )}
                              </div>

                              {/* Presets rápidos Foto Única */}
                              <div className="pt-2">
                                <span className="text-[11px] font-semibold text-neutral-400 block mb-1.5">
                                  ⚡ Fotos premium listas para aplicar:
                                </span>
                                <div className="flex flex-wrap gap-1.5">
                                  {PRESETS_SINGLE.map((p) => (
                                    <button
                                      key={p.label}
                                      type="button"
                                      onClick={() => handleServiceChange(idx, "img", p.img)}
                                      className="text-[10px] font-medium bg-neutral-900 hover:bg-amber-500/20 text-neutral-300 hover:text-amber-300 border border-neutral-800 hover:border-amber-500/40 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                                    >
                                      {p.label}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Barra de Guardado Inferior Sticky */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#090909]/95 backdrop-blur-md border-t border-neutral-800/90 py-3.5 px-4 shadow-2xl">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <div className="hidden sm:flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <div>
              <p className="text-xs text-neutral-200 font-bold">
                Panel de Autogestión Activo
              </p>
              <p className="text-[11px] text-neutral-400">
                Al guardar, los cambios se actualizan automáticamente en la web en vivo.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <a
              href="/d/demo/"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center justify-center gap-1.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-200 text-xs font-bold px-4 py-3 rounded-xl transition-all"
            >
              <span>👁️</span>
              <span>Abrir Web</span>
            </a>

            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="w-full sm:w-auto bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:brightness-110 active:scale-95 text-black font-extrabold text-sm px-8 py-3.5 rounded-xl shadow-xl shadow-amber-500/25 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  <span>Guardando...</span>
                </>
              ) : (
                <>
                  <span>💾</span>
                  <span>Guardar Cambios en la Web</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
