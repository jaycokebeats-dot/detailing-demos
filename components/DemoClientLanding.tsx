"use client";

import { useEffect, useState, useCallback } from "react";
import Landing from "@/components/Landing";
import type { Business } from "@/data/business-helpers";
import { getDemoBusiness } from "@/lib/supabase";

export default function DemoClientLanding({ initialBiz }: { initialBiz: Business }) {
  const [biz, setBiz] = useState<Business>(initialBiz);
  const [isDemo, setIsDemo] = useState(false);

  const refreshData = useCallback(() => {
    getDemoBusiness().then((data) => {
      if (data) {
        setBiz(data);
      }
    });
  }, []);

  useEffect(() => {
    if (initialBiz.slug === "demo" || initialBiz.slug === "taller-demo") {
      setIsDemo(true);
      refreshData();

      // Escuchar cambios en vivo entre pestañas o foco de ventana
      window.addEventListener("storage", refreshData);
      window.addEventListener("focus", refreshData);
      window.addEventListener("black_line_demo_updated", refreshData);

      return () => {
        window.removeEventListener("storage", refreshData);
        window.removeEventListener("focus", refreshData);
        window.removeEventListener("black_line_demo_updated", refreshData);
      };
    }
  }, [initialBiz, refreshData]);

  return (
    <>
      <Landing biz={biz} />

      {isDemo && (
        <div className="fixed bottom-5 left-5 z-50">
          <a
            href="/admin/"
            className="group flex items-center gap-2.5 rounded-full bg-neutral-900/95 hover:bg-neutral-800 text-neutral-100 px-4 py-2.5 text-xs sm:text-sm font-bold shadow-2xl shadow-black/80 hover:scale-105 active:scale-95 transition-all border border-neutral-700 hover:border-neutral-500 backdrop-blur-md"
          >
            <span className="flex h-2 w-2 rounded-full bg-white/90 animate-ping" />
            <span className="tracking-wide">⚙️ Panel de Control</span>
          </a>
        </div>
      )}
    </>
  );
}
