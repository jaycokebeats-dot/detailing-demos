"use client";

import { useEffect, useState, useCallback } from "react";
import Landing from "@/components/Landing";
import type { Business } from "@/data/business-helpers";
import { getBusinessData, subscribeToBusiness, normalizeSlug } from "@/lib/supabase";

export default function DemoClientLanding({ initialBiz }: { initialBiz: Business }) {
  const [biz, setBiz] = useState<Business>(initialBiz);
  const [isDemo, setIsDemo] = useState(false);
  const [hasAdminSession, setHasAdminSession] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const slug = initialBiz.slug;
  const isDemoSlug = slug === "demo" || slug === "taller-demo";

  const refreshData = useCallback(() => {
    getBusinessData(slug).then((data) => {
      if (data) {
        setBiz(data);
      } else {
        setBiz(initialBiz);
      }
    });
  }, [slug, initialBiz]);

  useEffect(() => {
    if (isDemoSlug) {
      setIsDemo(true);
      refreshData();

      // Solo administradores autenticados ven el botón flotante
      if (typeof window !== "undefined") {
        const isAuth = sessionStorage.getItem("black_line_admin_auth") === "true";
        setHasAdminSession(isAuth);
      }

      // Escuchar eventos en vivo locales (cambio de pestaña, foco, storage)
      window.addEventListener("storage", refreshData);
      window.addEventListener("focus", refreshData);
      window.addEventListener("black_line_demo_updated", refreshData);

      // Suscripción en tiempo real a Supabase en la nube
      const unsubscribe = subscribeToBusiness(slug, (newData) => {
        if (newData) setBiz(newData);
        else setBiz(initialBiz);
      });

      return () => {
        window.removeEventListener("storage", refreshData);
        window.removeEventListener("focus", refreshData);
        window.removeEventListener("black_line_demo_updated", refreshData);
        if (unsubscribe) unsubscribe();
      };
    } else {
      // Para cualquier taller, escuchar eventos en vivo locales y en Supabase
      window.addEventListener("storage", refreshData);
      window.addEventListener("focus", refreshData);
      window.addEventListener("black_line_biz_updated", refreshData);

      const unsubscribe = subscribeToBusiness(slug, (newData) => {
        if (newData) setBiz(newData);
        else setBiz(initialBiz);
      });

      return () => {
        window.removeEventListener("storage", refreshData);
        window.removeEventListener("focus", refreshData);
        window.removeEventListener("black_line_biz_updated", refreshData);
        if (unsubscribe) unsubscribe();
      };
    }
  }, [slug, isDemoSlug, refreshData, initialBiz]);

  return (
    <>
      <Landing biz={biz} />

      {/* Acceso rápido visible ÚNICAMENTE si el administrador inició sesión en /admin */}
      {isDemo && hasAdminSession && !dismissed && (
        <div className="fixed bottom-5 left-5 z-50 flex items-center gap-2 animate-fade-in">
          <a
            href="/admin/"
            className="group flex items-center gap-2.5 rounded-full bg-neutral-900/95 hover:bg-neutral-800 text-neutral-100 px-4 py-2.5 text-xs sm:text-sm font-bold shadow-2xl shadow-black/80 hover:scale-105 active:scale-95 transition-all border border-neutral-700 hover:border-neutral-500 backdrop-blur-md"
          >
            <span className="flex h-2 w-2 rounded-full bg-white/90 animate-ping" />
            <span className="tracking-wide">⚙️ Volver al Panel</span>
          </a>
          <button
            type="button"
            onClick={() => setDismissed(true)}
            className="h-8 w-8 rounded-full bg-black/80 hover:bg-neutral-800 text-neutral-400 hover:text-white flex items-center justify-center border border-neutral-700/60 text-xs transition-colors cursor-pointer"
            title="Ocultar acceso rápido"
          >
            ✕
          </button>
        </div>
      )}
    </>
  );
}
