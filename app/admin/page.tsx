"use client";

import { useEffect, useState, useMemo } from "react";
import type { Business, ServiceItem } from "@/data/business-helpers";
import { DEFAULT_DEMO_BUSINESS } from "@/data/demo-business";
import { SERVICIOS_MEXICO } from "@/components/mexico/LandingMexico";
import { SERVICIOS_ESPANA } from "@/components/spain/LandingSpain";
import { getBusinessData, saveBusinessData, resetBusinessData } from "@/lib/supabase";
import { validateWorkshopAuth, getWorkshopCredentials } from "@/lib/workshop-auth";

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

/**
 * Normaliza y comprime fotos locales (del celular o PC) a proporción estándar 4:3 (1200x900).
 * - Si es horizontal: encuadre suave centrado a 4:3 para llenar la tarjeta sin zoom desmedido.
 * - Si es vertical o cuadrada: centra la foto completa con un fondo ambiental difuminado suave
 *   para que NUNCA se corte la pieza ni se vea rara con exceso de zoom.
 */
function resizeAndCompressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const TARGET_WIDTH = 1200;
        const TARGET_HEIGHT = 900;
        const TARGET_RATIO = TARGET_WIDTH / TARGET_HEIGHT; // 4:3 = 1.3333
        const imgRatio = img.width / img.height;

        const canvas = document.createElement("canvas");
        canvas.width = TARGET_WIDTH;
        canvas.height = TARGET_HEIGHT;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }

        // Caso 1: Foto horizontal (landscape >= 1.15)
        if (imgRatio >= 1.15) {
          let renderW, renderH, offsetX, offsetY;
          if (imgRatio > TARGET_RATIO) {
            renderH = TARGET_HEIGHT;
            renderW = img.width * (TARGET_HEIGHT / img.height);
            offsetX = (TARGET_WIDTH - renderW) / 2;
            offsetY = 0;
          } else {
            renderW = TARGET_WIDTH;
            renderH = img.height * (TARGET_WIDTH / img.width);
            offsetX = 0;
            offsetY = (TARGET_HEIGHT - renderH) / 2;
          }
          ctx.drawImage(img, offsetX, offsetY, renderW, renderH);
        } else {
          // Caso 2: Foto vertical o cuadrada (alargada)
          // 1. Fondo oscuro
          ctx.fillStyle = "#0c0c0c";
          ctx.fillRect(0, 0, TARGET_WIDTH, TARGET_HEIGHT);

          // 2. Fondo difuminado ambiental de la misma foto para evitar franjas negras duras
          ctx.save();
          ctx.filter = "blur(28px) brightness(0.35)";
          const bgScale = Math.max(TARGET_WIDTH / img.width, TARGET_HEIGHT / img.height);
          const bgW = img.width * bgScale;
          const bgH = img.height * bgScale;
          ctx.drawImage(img, (TARGET_WIDTH - bgW) / 2, (TARGET_HEIGHT - bgH) / 2, bgW, bgH);
          ctx.restore();

          // 3. Foto vertical completa centrada y nítida (100% visible, sin zoom exagerado)
          const scale = TARGET_HEIGHT / img.height;
          const fitW = img.width * scale;
          const fitH = TARGET_HEIGHT;
          const fitX = (TARGET_WIDTH - fitW) / 2;
          ctx.drawImage(img, fitX, 0, fitW, fitH);
        }

        // Calidad 0.84 JPEG (~120KB ultra nítido y liviano)
        const dataUrl = canvas.toDataURL("image/jpeg", 0.84);
        resolve(dataUrl);
      };
      img.onerror = () => resolve(e.target?.result as string);
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

type WorkshopSummary = {
  slug: string;
  nombre: string;
  ciudad: string;
  pais: string;
  template?: string;
};

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [currentSlug, setCurrentSlug] = useState<string>("demo");
  const [targetSlugFromUrl, setTargetSlugFromUrl] = useState<string | null>(null);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  // Pestaña inicial por defecto: Datos del Taller (general)
  const [activeTab, setActiveTab] = useState<"general" | "services">("general");
  const [biz, setBiz] = useState<Business>(DEFAULT_DEMO_BUSINESS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Selector de talleres para Super-Admin
  const [showWorkshopPicker, setShowWorkshopPicker] = useState(false);
  const [workshopsList, setWorkshopsList] = useState<WorkshopSummary[]>([]);
  const [searchWorkshopQuery, setSearchWorkshopQuery] = useState("");
  const [loadingList, setLoadingList] = useState(false);

  // Carga inicial y sesión
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const urlSlug = params.get("taller") || params.get("slug");
      if (urlSlug) {
        const clean = urlSlug.toLowerCase().trim();
        setTargetSlugFromUrl(clean);
        setCurrentSlug(clean);
      }

      const auth = sessionStorage.getItem("black_line_admin_auth") === "true";
      const superAdmin = sessionStorage.getItem("black_line_is_superadmin") === "true";
      const storedSlug = sessionStorage.getItem("black_line_admin_slug");

      if (auth) {
        setIsAuthenticated(true);
        setIsSuperAdmin(superAdmin);
        if (storedSlug && !urlSlug) {
          setCurrentSlug(storedSlug);
        }
      }
    }
  }, []);

  // Función para cargar los datos del taller activo
  const loadWorkshop = async (slugToLoad: string) => {
    setLoading(true);
    const norm = slugToLoad.toLowerCase().trim();

    try {
      // 1. Revisar si hay datos guardados en Supabase
      const supabaseData = await getBusinessData(norm);
      if (supabaseData && supabaseData.nombre) {
        setBiz(supabaseData);
        setLoading(false);
        return;
      }

      // 2. Si es demo o taller-demo
      if (norm === "demo" || norm === "taller-demo") {
        setBiz(DEFAULT_DEMO_BUSINESS);
        setLoading(false);
        return;
      }

      // 3. Cargar desde la API interna
      const res = await fetch(`/api/workshops?slug=${encodeURIComponent(norm)}`);
      if (res.ok) {
        const initialData = await res.json();
        if (!initialData.servicios || initialData.servicios.length === 0) {
          if (initialData.pais === "MX" || initialData.template === "mexico") {
            initialData.servicios = SERVICIOS_MEXICO;
          } else if (initialData.pais === "ES" || initialData.template === "spain") {
            initialData.servicios = SERVICIOS_ESPANA;
          } else {
            initialData.servicios = DEFAULT_DEMO_BUSINESS.servicios;
          }
        }
        setBiz(initialData);
      } else {
        showToast(`⚠️ No se encontró el taller "${norm}". Cargando demo.`);
        setBiz(DEFAULT_DEMO_BUSINESS);
      }
    } catch (e) {
      console.error("Error al cargar taller:", e);
      setBiz(DEFAULT_DEMO_BUSINESS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && currentSlug) {
      loadWorkshop(currentSlug);
    }
  }, [isAuthenticated, currentSlug]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const target = targetSlugFromUrl || currentSlug;
    const authResult = validateWorkshopAuth(username, password, target);

    if (authResult.valid) {
      setIsAuthenticated(true);
      setIsSuperAdmin(authResult.isSuperAdmin);
      const finalSlug = authResult.slug || target || "demo";
      setCurrentSlug(finalSlug);

      if (typeof window !== "undefined") {
        sessionStorage.setItem("black_line_admin_auth", "true");
        sessionStorage.setItem("black_line_is_superadmin", authResult.isSuperAdmin ? "true" : "false");
        sessionStorage.setItem("black_line_admin_slug", finalSlug);
      }
      setLoginError("");
      loadWorkshop(finalSlug);
    } else {
      setLoginError(authResult.error || "Usuario o contraseña incorrectos.");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setIsSuperAdmin(false);
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("black_line_admin_auth");
      sessionStorage.removeItem("black_line_is_superadmin");
      sessionStorage.removeItem("black_line_admin_slug");
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleSave = async () => {
    setSaving(true);
    const res = await saveBusinessData(currentSlug, biz);
    setSaving(false);

    if (res.success) {
      showToast(`✨ ¡Cambios guardados con éxito en Supabase para "${biz.nombre}"! Ya se actualizaron en la web.`);
    } else {
      showToast(`⚠️ Error al guardar: ${res.error || "No se pudo actualizar"}`);
    }
  };

  const handleReset = async () => {
    if (confirm(`¿Estás seguro de restablecer los datos originales de "${biz.nombre}"? Volverá al diseño y datos originales de este taller.`)) {
      setLoading(true);
      await resetBusinessData(currentSlug);
      await loadWorkshop(currentSlug);
      showToast("🔄 Datos restablecidos a los valores originales.");
    }
  };

  const handleCopyCredentials = () => {
    const creds = getWorkshopCredentials(currentSlug);
    const text = `¡Hola! Te dejo el acceso a tu Panel de Control de Autogestión:\n\n🔗 Enlace: https://detailing-demos-three.vercel.app/admin?taller=${currentSlug}\n👤 Usuario: ${creds.username}\n🔑 Contraseña: ${creds.password}\n\nCualquier cambio que guardes se reflejará al instante en tu web.`;
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      showToast("📋 ¡Mensaje y credenciales copiados para enviar al cliente por WhatsApp!");
    }
  };

  const openWorkshopPicker = async () => {
    setShowWorkshopPicker(true);
    if (workshopsList.length === 0) {
      setLoadingList(true);
      try {
        const res = await fetch("/api/workshops");
        if (res.ok) {
          const data = await res.json();
          setWorkshopsList(data.workshops || []);
        }
      } catch (e) {
        console.error("Error al cargar talleres:", e);
      } finally {
        setLoadingList(false);
      }
    }
  };

  const filteredWorkshops = useMemo(() => {
    if (!searchWorkshopQuery.trim()) return workshopsList;
    const q = searchWorkshopQuery.toLowerCase().trim();
    return workshopsList.filter(
      (w) =>
        w.nombre.toLowerCase().includes(q) ||
        w.slug.toLowerCase().includes(q) ||
        w.ciudad.toLowerCase().includes(q)
    );
  }, [workshopsList, searchWorkshopQuery]);

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
      foto_fit: "cover",
      modo_foto: "single",
    };
    setBiz({ ...biz, servicios: [...(biz.servicios || []), newService] });
  };

  const handleRemoveService = (index: number) => {
    if (confirm(`¿Eliminar el servicio "${biz.servicios?.[index]?.nombre || "seleccionado"}"?`)) {
      const updatedServices = (biz.servicios || []).filter((_, i) => i !== index);
      setBiz({ ...biz, servicios: updatedServices });
    }
  };

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number,
    field: "antes_img" | "despues_img" | "img"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const optimizedDataUrl = await resizeAndCompressImage(file);
      handleServiceChange(index, field, optimizedDataUrl);
      showToast("📸 Foto procesada y encuadrada con éxito en 4:3.");
    } catch (err) {
      console.error(err);
      showToast("⚠️ No se pudo procesar la imagen seleccionada.");
    }
  };

  const setServicePhotoMode = (index: number, mode: "before_after" | "single") => {
    const updatedServices = [...(biz.servicios || [])];
    const s = { ...updatedServices[index] };

    s.modo_foto = mode;
    if (mode === "before_after") {
      if (s.antes_img === undefined) s.antes_img = "";
      if (s.despues_img === undefined) s.despues_img = "";
    } else {
      if (!s.img) s.img = "/servicios/exterior.jpg";
    }

    updatedServices[index] = s;
    setBiz({ ...biz, servicios: updatedServices });
  };

  // --- VISTA DE LOGIN ---
  if (!isAuthenticated) {
    const targetCreds = targetSlugFromUrl ? getWorkshopCredentials(targetSlugFromUrl) : null;

    return (
      <main className="min-h-screen bg-[#070707] text-neutral-100 flex items-center justify-center p-4 sm:p-6 admin-scope">
        <div className="w-full max-w-lg bg-[#121212]/95 border border-neutral-700/80 rounded-3xl p-8 sm:p-10 shadow-2xl relative overflow-hidden backdrop-blur-md">
          <div className="text-center mb-8">
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-neutral-900/90 text-neutral-300 text-xs sm:text-sm font-semibold rounded-full border border-neutral-700/80 mb-4 shadow-sm">
              <span className="text-amber-400">⚡</span> Black Line Studio
            </span>
            <div
              className="text-2xl sm:text-3xl font-black text-white tracking-normal mb-3"
              style={{
                fontFamily: "var(--font-soehne), -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                textTransform: "none",
                letterSpacing: "-0.01em",
              }}
            >
              Panel de Autogestión
            </div>
            {targetSlugFromUrl ? (
              <p className="text-sm sm:text-base text-neutral-300 font-medium">
                Acceso exclusivo para el taller:{" "}
                <span className="text-white font-bold bg-neutral-800 px-2.5 py-1 rounded-lg border border-neutral-700 font-mono">
                  {targetSlugFromUrl}
                </span>
              </p>
            ) : (
              <p className="text-sm sm:text-base text-neutral-300/90 leading-relaxed max-w-sm mx-auto">
                Ingresá con las credenciales asignadas a tu taller para editar tu web en tiempo real.
              </p>
            )}
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-neutral-200 mb-2">
                Usuario
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={targetCreds ? targetCreds.username : "pro-nombredeltaller o demo"}
                className="w-full bg-[#181818] border border-neutral-700/80 rounded-2xl px-4 py-3.5 text-base sm:text-sm text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:border-neutral-300 focus:bg-[#1c1c1c] transition-all shadow-inner"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-neutral-200 mb-2">
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#181818] border border-neutral-700/80 rounded-2xl px-4 py-3.5 text-base sm:text-sm text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:border-neutral-300 focus:bg-[#1c1c1c] transition-all shadow-inner"
                required
              />
            </div>

            {loginError && (
              <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-2xl p-3.5 text-center font-medium">
                {loginError}
              </p>
            )}

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-neutral-200 via-neutral-100 to-neutral-300 hover:from-white hover:to-neutral-100 text-neutral-950 font-black py-4 rounded-2xl shadow-xl transition-all text-base cursor-pointer mt-3 active:scale-98 flex items-center justify-center gap-2 border border-white/40 tracking-wide"
            >
              Ingresar al Panel
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-neutral-800/90 text-center">
            {targetCreds ? (
              <div className="bg-neutral-900/90 border border-neutral-700/60 rounded-2xl p-4 text-center">
                <p className="text-xs sm:text-sm text-neutral-300 font-semibold mb-2 flex items-center justify-center gap-2">
                  <span>🔑</span> Credenciales para este taller:
                </p>
                <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs sm:text-sm">
                  <span className="bg-black/80 px-3 py-1.5 rounded-xl border border-neutral-700/70 text-neutral-300">
                    Usuario: <strong className="text-white font-mono font-bold">{targetCreds.username}</strong>
                  </span>
                  <span className="bg-black/80 px-3 py-1.5 rounded-xl border border-neutral-700/70 text-neutral-300">
                    Clave: <strong className="text-white font-mono font-bold">{targetCreds.password}</strong>
                  </span>
                </div>
              </div>
            ) : (
              <div className="bg-neutral-900/90 border border-neutral-700/60 rounded-2xl p-4 text-left sm:text-center space-y-2">
                <p className="text-xs sm:text-sm text-neutral-300 font-semibold flex items-center justify-center gap-2">
                  <span>💡</span> Accesos Disponibles:
                </p>
                <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs sm:text-sm">
                  <span className="bg-black/80 px-3 py-1.5 rounded-xl border border-neutral-700/70 text-neutral-300">
                    Demo: <strong className="text-white font-mono font-bold">demo</strong>
                  </span>
                  <span className="bg-black/80 px-3 py-1.5 rounded-xl border border-neutral-700/70 text-neutral-300">
                    Super-Admin: <strong className="text-white font-mono font-bold">admin</strong>
                  </span>
                </div>
                <p className="text-[11px] text-neutral-400 text-center pt-1">
                  Cada taller tiene su usuario: <strong>pro-[nombre-taller]</strong> (usuario y contraseña idénticos).
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    );
  }

  const liveWebHref = currentSlug === "demo" ? "/d/taller-demo/" : `/d/${currentSlug}/`;

  // --- VISTA DEL PANEL DE CONTROL ---
  return (
    <main className="min-h-screen bg-[#090909] text-neutral-100 pb-56 sm:pb-36 admin-scope">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-[#161616] border border-neutral-600 text-neutral-100 px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 animate-fade-in text-xs sm:text-sm font-medium">
          <span className="text-base">✨</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Superior Sticky */}
      <header className="sticky top-0 z-40 bg-[#090909]/95 backdrop-blur-md border-b border-neutral-800/80">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-neutral-900 border border-neutral-700 flex items-center justify-center text-neutral-200 font-black text-lg shadow-sm">
              ⚡
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <div
                  className="text-sm sm:text-base font-bold text-neutral-100 truncate max-w-[170px] sm:max-w-none"
                  style={{ textTransform: "none", fontFamily: "var(--font-soehne), sans-serif" }}
                >
                  {biz.nombre}
                </div>
                <span className="text-[10px] font-bold bg-neutral-800 text-neutral-300 border border-neutral-700 px-2 py-0.5 rounded-full uppercase tracking-wider font-mono">
                  {currentSlug}
                </span>
                <span className="hidden sm:inline-flex items-center gap-1.5 text-[10px] font-semibold bg-emerald-950/60 text-emerald-400 border border-emerald-800/50 px-2.5 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Nube Supabase Conectada
                </span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-neutral-400 mt-0.5">
                <span>Autogestión de Taller en Vivo</span>
                {isSuperAdmin && (
                  <span className="text-amber-400 font-bold bg-amber-400/10 px-1.5 py-0.2 rounded border border-amber-400/30 text-[9px] uppercase">
                    Modo Super-Admin
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Botón Cambiar Taller para Super-Admin */}
            {isSuperAdmin && (
              <button
                type="button"
                onClick={openWorkshopPicker}
                className="bg-neutral-800 hover:bg-neutral-700 border border-neutral-600 text-neutral-200 hover:text-white text-xs font-bold px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
                title="Cambiar taller para editar"
              >
                <span>🔍</span>
                <span className="hidden sm:inline">Cambiar Taller</span>
              </button>
            )}

            {/* Botón para copiar credenciales para WhatsApp */}
            <button
              type="button"
              onClick={handleCopyCredentials}
              className="hidden md:flex items-center gap-1.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 hover:border-neutral-500 text-neutral-300 hover:text-white text-xs px-3 py-2 rounded-xl transition-all cursor-pointer"
              title="Copiar mensaje con credenciales para enviar al cliente por WhatsApp"
            >
              <span>📋</span>
              <span>Copiar Acceso</span>
            </button>

            {/* Acceso directo a la App de Presupuestos */}
            <a
              href={`/presupuesto?taller=${currentSlug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 hover:border-neutral-500 text-neutral-200 hover:text-white text-xs font-bold px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 shadow-sm"
              title="Abrir App de Presupuestos para este taller"
            >
              <span>🧾</span>
              <span className="hidden sm:inline">Presupuestador</span>
            </a>

            {/* Botón rápido Guardar arriba en el header */}
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="bg-gradient-to-r from-neutral-200 via-neutral-100 to-neutral-300 hover:from-white hover:to-neutral-100 active:scale-95 text-neutral-950 font-black text-xs px-3 sm:px-4 py-2 rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer border border-white/40"
              title="Guardar cambios en la web"
            >
              {saving ? (
                <span className="w-3.5 h-3.5 border-2 border-neutral-950 border-t-transparent rounded-full animate-spin" />
              ) : (
                <span>💾</span>
              )}
              <span className="font-extrabold">Guardar</span>
            </button>

            <a
              href={liveWebHref}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 hover:border-neutral-500 text-neutral-200 hover:text-white text-xs font-bold px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 shadow-sm"
              title="Abrir la web en una pestaña nueva"
            >
              <span>🔗</span>
              <span className="hidden sm:inline">Ver Web</span>
            </a>

            <button
              onClick={handleReset}
              title="Restablecer valores originales"
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
            <span className="w-6 h-6 border-2 border-neutral-400 border-t-transparent rounded-full animate-spin" />
            <span>Cargando datos de "{currentSlug}"...</span>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Tabs de Navegación en Gris / Composé */}
            <div className="grid grid-cols-2 gap-2 bg-[#121212] p-1.5 rounded-2xl border border-neutral-800 max-w-md mx-auto">
              <button
                type="button"
                onClick={() => setActiveTab("general")}
                className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  activeTab === "general"
                    ? "bg-neutral-800 text-white shadow-sm border border-neutral-700"
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
                    ? "bg-neutral-800 text-white shadow-sm border border-neutral-700"
                    : "text-neutral-400 hover:text-neutral-200"
                }`}
              >
                <span>🛠️</span>
                <span>2. Servicios ({biz.servicios?.length || 0})</span>
              </button>
            </div>

            {/* SECCIÓN 1: DATOS GENERALES DEL TALLER */}
            {activeTab === "general" && (
              <div className="bg-[#121212] border border-neutral-800 rounded-3xl p-5 sm:p-7 space-y-6">
                <div>
                  <div
                    className="text-base sm:text-lg font-bold text-white flex items-center gap-2"
                    style={{ textTransform: "none", fontFamily: "var(--font-soehne), sans-serif" }}
                  >
                    <span>📌</span>
                    <span>Información Principal de tu Negocio</span>
                  </div>
                  <p className="text-xs text-neutral-400 mt-1">
                    Estos datos se muestran en la cabecera (logo superior), pie de página y botones de contacto de toda tu web.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-semibold text-neutral-200 mb-2">
                      Nombre Comercial del Taller (Actualiza el título y el logo superior)
                    </label>
                    <input
                      type="text"
                      value={biz.nombre}
                      onChange={(e) =>
                        setBiz({
                          ...biz,
                          nombre: e.target.value,
                          nombreCorto: e.target.value,
                        })
                      }
                      placeholder="Ej: Black Line Detail Studio"
                      className="w-full bg-[#0a0a0a] border border-neutral-800 rounded-xl px-4 py-3 text-sm text-neutral-100 focus:outline-none focus:border-neutral-500"
                    />
                  </div>

                  {/* Número de WhatsApp - Conexión directa a todos los botones */}
                  <div className="sm:col-span-2 bg-neutral-900/60 border border-neutral-700/80 rounded-2xl p-4 sm:p-5 space-y-2">
                    <div className="flex items-center gap-2 text-neutral-200 font-bold text-xs sm:text-sm">
                      <span className="text-emerald-400 text-base">💬</span>
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
                        placeholder="Ej: 5491155558888 (Código país + área + número, sin + ni espacios)"
                        className="w-full bg-[#0a0a0a] border border-neutral-700 rounded-xl px-4 py-3 text-sm font-mono text-emerald-400 focus:outline-none focus:border-neutral-400"
                      />
                      <p className="text-[10px] text-neutral-500 mt-1.5">
                        Formato internacional: <strong>549</strong> (Argentina), <strong>52</strong> (México), <strong>34</strong> (España), seguido del número sin espacios ni guiones.
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-neutral-200 mb-2">
                      Teléfono de Línea / Visible
                    </label>
                    <input
                      type="text"
                      value={biz.telefono}
                      onChange={(e) => setBiz({ ...biz, telefono: e.target.value })}
                      placeholder="+54 9 11 5555-8888"
                      className="w-full bg-[#0a0a0a] border border-neutral-800 rounded-xl px-4 py-3 text-sm text-neutral-100 focus:outline-none focus:border-neutral-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-neutral-200 mb-2">
                      Usuario de Instagram (Sin @)
                    </label>
                    <input
                      type="text"
                      value={biz.instagram || ""}
                      onChange={(e) => setBiz({ ...biz, instagram: e.target.value.replace("@", "").trim() })}
                      placeholder="blacklinedetailing"
                      className="w-full bg-[#0a0a0a] border border-neutral-800 rounded-xl px-4 py-3 text-sm text-neutral-100 focus:outline-none focus:border-neutral-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-neutral-200 mb-2">
                      Dirección Física del Taller
                    </label>
                    <input
                      type="text"
                      value={biz.direccion}
                      onChange={(e) => setBiz({ ...biz, direccion: e.target.value })}
                      placeholder="Av. del Libertador 4500"
                      className="w-full bg-[#0a0a0a] border border-neutral-800 rounded-xl px-4 py-3 text-sm text-neutral-100 focus:outline-none focus:border-neutral-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-neutral-200 mb-2">
                      Ciudad / Localidad / Zona
                    </label>
                    <input
                      type="text"
                      value={biz.ciudad}
                      onChange={(e) => setBiz({ ...biz, ciudad: e.target.value })}
                      placeholder="Nordelta / Tigre / Buenos Aires"
                      className="w-full bg-[#0a0a0a] border border-neutral-800 rounded-xl px-4 py-3 text-sm text-neutral-100 focus:outline-none focus:border-neutral-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-sm font-semibold text-neutral-200 mb-2">
                      Horarios de Atención
                    </label>
                    <input
                      type="text"
                      value={biz.horario || ""}
                      onChange={(e) => setBiz({ ...biz, horario: e.target.value })}
                      placeholder="Lunes a Viernes de 8:30 a 19:00 hs — Sábados con turno previo"
                      className="w-full bg-[#0a0a0a] border border-neutral-800 rounded-xl px-4 py-3 text-sm text-neutral-100 focus:outline-none focus:border-neutral-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-sm font-semibold text-neutral-200 mb-2">
                      Enlace a Google Maps (Opcional)
                    </label>
                    <input
                      type="text"
                      value={biz.maps_url || ""}
                      onChange={(e) => setBiz({ ...biz, maps_url: e.target.value })}
                      placeholder="https://maps.app.goo.gl/..."
                      className="w-full bg-[#0a0a0a] border border-neutral-800 rounded-xl px-4 py-3 text-sm text-neutral-100 focus:outline-none focus:border-neutral-500"
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
                    <div
                      className="text-base sm:text-lg font-bold text-white flex items-center gap-2"
                      style={{ textTransform: "none", fontFamily: "var(--font-soehne), sans-serif" }}
                    >
                      <span>🛠️</span>
                      <span>Catálogo de Servicios & Lista de Precios</span>
                    </div>
                    <p className="text-xs text-neutral-400 mt-1 max-w-xl">
                      Agregá, editá o eliminá los tratamientos de tu taller. Podés configurar fotos comparativas de <strong>Antes y Después con slider interactivo</strong> o una <strong>foto única</strong> si no tenés el antes.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddService}
                    className="self-start sm:self-center bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl transition-all cursor-pointer border border-neutral-600 hover:border-neutral-400 flex items-center gap-2 shrink-0 shadow-sm active:scale-95"
                  >
                    <span>➕</span>
                    <span>Agregar Tratamiento</span>
                  </button>
                </div>

                {/* Lista de Servicios */}
                <div className="grid grid-cols-1 gap-6">
                  {(biz.servicios || []).map((srv, idx) => {
                    const isBeforeAfter = srv.modo_foto ? srv.modo_foto === "before_after" : Boolean(srv.antes_img || srv.despues_img);
                    const fitMode = srv.foto_fit || "cover";

                    return (
                      <div
                        key={idx}
                        className="bg-[#121212] border border-neutral-800 hover:border-neutral-700/80 rounded-3xl p-5 sm:p-7 space-y-5 relative transition-all shadow-xl"
                      >
                        {/* Cabecera del Servicio */}
                        <div className="flex items-center justify-between border-b border-neutral-800/80 pb-3">
                          <div className="flex items-center gap-3">
                            <span className="w-7 h-7 rounded-full bg-neutral-900 border border-neutral-700 text-neutral-300 font-mono text-xs flex items-center justify-center font-bold">
                              #{idx + 1}
                            </span>
                            <span className="text-sm sm:text-base font-bold text-neutral-100 truncate max-w-[200px] sm:max-w-md">
                              {srv.nombre}
                            </span>
                            {srv.destacado && (
                              <span className="text-[10px] font-bold bg-neutral-800 text-neutral-200 border border-neutral-600 px-2 py-0.5 rounded-full uppercase">
                                ★ Destacado
                              </span>
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={() => handleRemoveService(idx)}
                            className="text-xs text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 px-3 py-1.5 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
                          >
                            <span>🗑️</span>
                            <span className="hidden sm:inline">Eliminar</span>
                          </button>
                        </div>

                        {/* Campos de texto principales */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div className="sm:col-span-2">
                            <label className="block text-sm font-semibold text-neutral-200 mb-2">
                              Nombre / Título del Tratamiento
                            </label>
                            <input
                              type="text"
                              value={srv.nombre}
                              onChange={(e) => handleServiceChange(idx, "nombre", e.target.value)}
                              placeholder="Ej: Tratamiento Cerámico 9H (3 Años)"
                              className="w-full bg-[#0a0a0a] border border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-neutral-100 focus:outline-none focus:border-neutral-500"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-neutral-200 mb-2">
                              Precio Mostrado
                            </label>
                            <input
                              type="text"
                              value={srv.precio}
                              onChange={(e) => handleServiceChange(idx, "precio", e.target.value)}
                              placeholder="Ej: Desde $180.000 / Consultar"
                              className="w-full bg-[#0a0a0a] border border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-neutral-100 focus:outline-none focus:border-neutral-500 font-mono"
                            />
                          </div>

                          <div className="sm:col-span-3">
                            <label className="block text-sm font-semibold text-neutral-200 mb-2">
                              Descripción Completa del Trabajo
                            </label>
                            <textarea
                              rows={2}
                              value={srv.descripcion}
                              onChange={(e) => handleServiceChange(idx, "descripcion", e.target.value)}
                              placeholder="Describí los pasos, beneficios y qué incluye el tratamiento..."
                              className="w-full bg-[#0a0a0a] border border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-neutral-100 focus:outline-none focus:border-neutral-500 leading-relaxed"
                            />
                          </div>

                          <div className="sm:col-span-2">
                            <label className="block text-sm font-semibold text-neutral-200 mb-2">
                              Garantía / Beneficio Destacado (Insignia en la tarjeta)
                            </label>
                            <input
                              type="text"
                              value={srv.proteccion || ""}
                              onChange={(e) => handleServiceChange(idx, "proteccion", e.target.value)}
                              placeholder="Ej: 3 Años Garantía Escrita / Sellado Gyeon"
                              className="w-full bg-[#0a0a0a] border border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-neutral-100 focus:outline-none focus:border-neutral-500"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-neutral-200 mb-2">
                              Detalle Recomendado (Ideal para...)
                            </label>
                            <input
                              type="text"
                              value={srv.ideal_si || ""}
                              onChange={(e) => handleServiceChange(idx, "ideal_si", e.target.value)}
                              placeholder="Ej: 0km o repintados recientes"
                              className="w-full bg-[#0a0a0a] border border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-neutral-100 focus:outline-none focus:border-neutral-500"
                            />
                          </div>
                        </div>

                        {/* CONFIGURACIÓN DE FOTOGRAFÍA */}
                        <div className="bg-[#0c0c0c] border border-neutral-800 rounded-2xl p-4 sm:p-5 space-y-4">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div>
                              <span className="text-xs font-bold text-neutral-200 block">
                                📸 Formato de Fotografía del Servicio
                              </span>
                              <p className="text-[11px] text-neutral-400">
                                Elegí si querés slider comparativo de 2 fotos o una foto fija.
                              </p>
                            </div>

                            {/* Selector de Modo */}
                            <div className="inline-flex rounded-xl p-1 bg-neutral-900 border border-neutral-700 self-start sm:self-auto">
                              <button
                                type="button"
                                onClick={() => setServicePhotoMode(idx, "before_after")}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                                  isBeforeAfter
                                    ? "bg-neutral-700 text-white shadow-sm border border-neutral-600"
                                    : "text-neutral-400 hover:text-neutral-200"
                                }`}
                              >
                                <span>🔄</span>
                                <span>Antes y Después (2 fotos)</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => setServicePhotoMode(idx, "single")}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                                  !isBeforeAfter
                                    ? "bg-neutral-700 text-white shadow-sm border border-neutral-600"
                                    : "text-neutral-400 hover:text-neutral-200"
                                }`}
                              >
                                <span>📷</span>
                                <span>Foto Única (1 foto)</span>
                              </button>
                            </div>
                          </div>

                          {/* Ajuste de encuadre */}
                          <div className="flex items-center gap-2 pt-1 border-t border-neutral-800/60">
                            <span className="text-[11px] text-neutral-400">Encuadre:</span>
                            <button
                              type="button"
                              onClick={() => handleServiceChange(idx, "foto_fit", "cover")}
                              className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border transition-colors cursor-pointer ${
                                fitMode === "cover"
                                  ? "bg-neutral-800 text-white border-neutral-600"
                                  : "text-neutral-400 border-neutral-800 hover:text-neutral-200"
                              }`}
                            >
                              Llenar tarjeta (Cover)
                            </button>
                            <button
                              type="button"
                              onClick={() => handleServiceChange(idx, "foto_fit", "contain")}
                              className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border transition-colors cursor-pointer ${
                                fitMode === "contain"
                                  ? "bg-neutral-800 text-white border-neutral-600"
                                  : "text-neutral-400 border-neutral-800 hover:text-neutral-200"
                              }`}
                            >
                              Foto completa sin cortes + Fondo ambiental
                            </button>
                          </div>

                          {/* Modo A: Antes y Después (2 fotos) */}
                          {isBeforeAfter ? (
                            <div className="space-y-3 pt-2">
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {/* Foto Antes */}
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between">
                                    <label className="text-xs font-semibold text-red-300 flex items-center gap-1.5">
                                      <span className="w-2 h-2 rounded-full bg-red-400" />
                                      <span>Foto del ANTES</span>
                                    </label>
                                    <label className="text-[10px] text-neutral-300 hover:text-white hover:underline cursor-pointer bg-neutral-900 border border-neutral-700 px-2 py-0.5 rounded-md">
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
                                    placeholder="URL o subí un archivo arriba"
                                    className="w-full bg-[#121212] border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-200 focus:outline-none focus:border-neutral-500 font-mono"
                                  />

                                  {srv.antes_img ? (
                                    <div className="aspect-[4/3] w-full rounded-xl overflow-hidden bg-neutral-950 border border-neutral-800 relative group">
                                      {/* eslint-disable-next-line @next/next/no-img-element */}
                                      <img
                                        src={srv.antes_img}
                                        alt="Antes"
                                        className={`w-full h-full ${fitMode === "contain" ? "object-contain" : "object-cover"}`}
                                      />
                                      <span className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/80 backdrop-blur-sm text-[10px] font-bold text-red-300 rounded-md border border-red-500/30">
                                        ANTES
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() => handleServiceChange(idx, "antes_img", "")}
                                        className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center rounded-md bg-black/75 hover:bg-red-500 text-white text-xs transition-colors cursor-pointer"
                                        title="Quitar foto"
                                      >
                                        ✕
                                      </button>
                                    </div>
                                  ) : (
                                    <label className="aspect-[4/3] w-full rounded-xl border border-dashed border-red-900/40 hover:border-red-500/60 bg-red-950/10 flex flex-col items-center justify-center gap-1.5 cursor-pointer text-center p-4 transition-colors">
                                      <span className="text-xl">📷</span>
                                      <span className="text-xs font-semibold text-red-200">Subir Foto del ANTES</span>
                                      <span className="text-[10px] text-neutral-400">Tocá para elegir de tu galería o cámara</span>
                                      <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) => handleFileUpload(e, idx, "antes_img")}
                                      />
                                    </label>
                                  )}
                                </div>

                                {/* Foto Después */}
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between">
                                    <label className="text-xs font-semibold text-emerald-300 flex items-center gap-1.5">
                                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                                      <span>Foto del DESPUÉS</span>
                                    </label>
                                    <label className="text-[10px] text-neutral-300 hover:text-white hover:underline cursor-pointer bg-neutral-900 border border-neutral-700 px-2 py-0.5 rounded-md">
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
                                    placeholder="URL o subí un archivo arriba"
                                    className="w-full bg-[#121212] border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-200 focus:outline-none focus:border-neutral-500 font-mono"
                                  />

                                  {srv.despues_img ? (
                                    <div className="aspect-[4/3] w-full rounded-xl overflow-hidden bg-neutral-950 border border-neutral-800 relative group">
                                      {/* eslint-disable-next-line @next/next/no-img-element */}
                                      <img
                                        src={srv.despues_img}
                                        alt="Después"
                                        className={`w-full h-full ${fitMode === "contain" ? "object-contain" : "object-cover"}`}
                                      />
                                      <span className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/80 backdrop-blur-sm text-[10px] font-bold text-emerald-300 rounded-md border border-emerald-500/30">
                                        DESPUÉS
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() => handleServiceChange(idx, "despues_img", "")}
                                        className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center rounded-md bg-black/75 hover:bg-red-500 text-white text-xs transition-colors cursor-pointer"
                                        title="Quitar foto"
                                      >
                                        ✕
                                      </button>
                                    </div>
                                  ) : (
                                    <label className="aspect-[4/3] w-full rounded-xl border border-dashed border-emerald-900/40 hover:border-emerald-500/60 bg-emerald-950/10 flex flex-col items-center justify-center gap-1.5 cursor-pointer text-center p-4 transition-colors">
                                      <span className="text-xl">📷</span>
                                      <span className="text-xs font-semibold text-emerald-200">Subir Foto del DESPUÉS</span>
                                      <span className="text-[10px] text-neutral-400">Tocá para elegir de tu galería o cámara</span>
                                      <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) => handleFileUpload(e, idx, "despues_img")}
                                      />
                                    </label>
                                  )}
                                </div>
                              </div>

                              {/* Presets rápidos Antes/Después en Gris */}
                              <div className="pt-2">
                                <span className="text-[11px] text-neutral-400 block mb-1.5 font-medium">
                                  O elegí fotos sugeridas de alta resolución:
                                </span>
                                <div className="flex flex-wrap gap-1.5">
                                  {PRESETS_BEFORE_AFTER.map((p) => (
                                    <button
                                      key={p.label}
                                      type="button"
                                      onClick={() => {
                                        const updatedServices = [...(biz.servicios || [])];
                                        updatedServices[idx] = {
                                          ...updatedServices[idx],
                                          modo_foto: "before_after",
                                          antes_img: p.antes,
                                          despues_img: p.despues,
                                        };
                                        setBiz({ ...biz, servicios: updatedServices });
                                      }}
                                      className="text-[10px] font-medium bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-800 hover:border-neutral-600 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                                    >
                                      {p.label}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </div>
                          ) : (
                            /* Modo B: Foto Única (1 sola foto) */
                            <div className="space-y-3 pt-2">
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <label className="text-xs font-semibold text-neutral-200 flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full bg-neutral-300" />
                                    <span>Foto del Trabajo Terminado</span>
                                  </label>
                                  <label className="text-[10px] text-neutral-300 hover:text-white hover:underline cursor-pointer bg-neutral-900 border border-neutral-700 px-2 py-0.5 rounded-md">
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
                                  className="w-full bg-[#121212] border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-200 focus:outline-none focus:border-neutral-500 font-mono"
                                />

                                {srv.img ? (
                                  <div className="aspect-[4/3] w-full rounded-xl overflow-hidden bg-neutral-950 border border-neutral-800 relative">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                      src={srv.img}
                                      alt="Trabajo"
                                      className={`w-full h-full ${fitMode === "contain" ? "object-contain" : "object-cover"}`}
                                    />
                                    <span className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/80 backdrop-blur-sm text-[10px] font-bold text-neutral-200 rounded-md border border-neutral-700">
                                      FOTO FIJA
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => handleServiceChange(idx, "img", "")}
                                      className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center rounded-md bg-black/75 hover:bg-red-500 text-white text-xs transition-colors cursor-pointer"
                                      title="Quitar foto"
                                    >
                                      ✕
                                    </button>
                                  </div>
                                ) : (
                                  <label className="aspect-[4/3] w-full rounded-xl border border-dashed border-neutral-700 hover:border-neutral-500 bg-neutral-950/60 flex flex-col items-center justify-center gap-1.5 cursor-pointer text-center p-4 transition-colors">
                                    <span className="text-xl">📷</span>
                                    <span className="text-xs font-semibold text-neutral-300">Subir Foto del Trabajo</span>
                                    <span className="text-[10px] text-neutral-500">Tocá para elegir de tu galería o cámara</span>
                                    <input
                                      type="file"
                                      accept="image/*"
                                      className="hidden"
                                      onChange={(e) => handleFileUpload(e, idx, "img")}
                                    />
                                  </label>
                                )}
                              </div>

                              {/* Presets rápidos para foto única */}
                              <div className="pt-2">
                                <span className="text-[11px] text-neutral-400 block mb-1.5 font-medium">
                                  O elegí fotos sugeridas listas para usar:
                                </span>
                                <div className="flex flex-wrap gap-1.5">
                                  {PRESETS_SINGLE.map((p) => (
                                    <button
                                      key={p.label}
                                      type="button"
                                      onClick={() => {
                                        const updatedServices = [...(biz.servicios || [])];
                                        updatedServices[idx] = {
                                          ...updatedServices[idx],
                                          modo_foto: "single",
                                          img: p.img,
                                        };
                                        setBiz({ ...biz, servicios: updatedServices });
                                      }}
                                      className="text-[10px] font-medium bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-800 hover:border-neutral-600 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
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

      {/* Barra de Guardado Inferior Sticky con soporte Safe Area para iPhone */}
      <div
        className="fixed bottom-0 left-0 right-0 z-40 bg-[#090909]/95 backdrop-blur-md border-t border-neutral-800 px-4 pt-3.5 shadow-2xl"
        style={{
          paddingBottom: "max(24px, calc(env(safe-area-inset-bottom, 0px) + 20px))",
        }}
      >
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <div className="hidden sm:flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <div>
              <p className="text-xs text-neutral-200 font-bold">
                Panel de Autogestión Activo: <span className="text-white font-mono">{currentSlug}</span>
              </p>
              <p className="text-[11px] text-neutral-400">
                Al guardar, los cambios se actualizan automáticamente en la web en vivo.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <a
              href={liveWebHref}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center justify-center gap-1.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 hover:border-neutral-500 text-neutral-200 text-xs font-bold px-4 py-3 rounded-xl transition-all"
            >
              <span>👁️</span>
              <span>Abrir Web en Vivo</span>
            </a>

            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="w-full sm:w-auto bg-gradient-to-r from-neutral-200 via-neutral-100 to-neutral-300 hover:from-white hover:to-neutral-100 active:scale-95 text-neutral-950 font-black text-sm px-8 py-3.5 rounded-xl shadow-xl shadow-white/5 transition-all cursor-pointer flex items-center justify-center gap-2 border border-white/30"
            >
              {saving ? (
                <>
                  <span className="w-4 h-4 border-2 border-neutral-950 border-t-transparent rounded-full animate-spin" />
                  <span>Guardando en Nube...</span>
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

      {/* MODAL: SELECTOR DE TALLERES (SUPER-ADMIN) */}
      {showWorkshopPicker && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#141414] border border-neutral-700 rounded-3xl w-full max-w-xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-fade-in">
            {/* Cabecera del modal */}
            <div className="p-5 border-b border-neutral-800 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>🏢</span>
                  <span>Seleccionar Taller para Editar</span>
                </h3>
                <p className="text-xs text-neutral-400">
                  Modo Super-Admin: elegí cualquier taller de Argentina, México o España.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowWorkshopPicker(false)}
                className="w-8 h-8 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-300 flex items-center justify-center text-sm transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Input de búsqueda */}
            <div className="p-4 border-b border-neutral-800/80 bg-neutral-950/40">
              <input
                type="text"
                value={searchWorkshopQuery}
                onChange={(e) => setSearchWorkshopQuery(e.target.value)}
                placeholder="Buscar por nombre, slug o ciudad (ej: JDS, Madrid, Nordelta)..."
                className="w-full bg-[#1c1c1c] border border-neutral-700 rounded-xl px-4 py-2.5 text-sm text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:border-neutral-400"
                autoFocus
              />
            </div>

            {/* Lista de resultados */}
            <div className="overflow-y-auto p-4 space-y-2 flex-1">
              {loadingList ? (
                <div className="py-12 text-center text-neutral-400 text-sm flex flex-col items-center gap-2">
                  <span className="w-5 h-5 border-2 border-neutral-400 border-t-transparent rounded-full animate-spin" />
                  <span>Cargando catálogo de talleres...</span>
                </div>
              ) : filteredWorkshops.length === 0 ? (
                <div className="py-12 text-center text-neutral-500 text-xs">
                  No se encontraron talleres que coincidan con "{searchWorkshopQuery}".
                </div>
              ) : (
                filteredWorkshops.map((w) => {
                  const isCurrent = w.slug === currentSlug;
                  const flag = w.pais === "ES" ? "🇪🇸" : w.pais === "MX" ? "🇲🇽" : "🇦🇷";

                  return (
                    <button
                      key={w.slug}
                      type="button"
                      onClick={() => {
                        setCurrentSlug(w.slug);
                        setShowWorkshopPicker(false);
                        setSearchWorkshopQuery("");
                        showToast(`✨ Taller seleccionado: ${w.nombre}`);
                      }}
                      className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 cursor-pointer ${
                        isCurrent
                          ? "bg-neutral-800 border-neutral-600 shadow-md"
                          : "bg-neutral-900/60 border-neutral-800/80 hover:bg-neutral-800/80 hover:border-neutral-700"
                      }`}
                    >
                      <div className="truncate">
                        <div className="flex items-center gap-2">
                          <span className="text-base">{flag}</span>
                          <span className="text-sm font-bold text-white truncate">{w.nombre}</span>
                          {isCurrent && (
                            <span className="text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded-full">
                              ACTIVO
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-neutral-400 flex items-center gap-2 mt-0.5 font-mono">
                          <span>{w.slug}</span>
                          {w.ciudad && <span>• {w.ciudad}</span>}
                        </div>
                      </div>

                      <div className="text-xs text-neutral-400 shrink-0">
                        {isCurrent ? "✓" : "→"}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
