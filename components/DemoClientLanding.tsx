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
    if (initialBiz.slug === "demo") {
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
            className="group flex items-center gap-2.5 rounded-full bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 px-4 py-2.5 text-xs sm:text-sm font-bold text-black shadow-xl shadow-amber-500/30 hover:scale-105 active:scale-95 transition-all border border-amber-200/50"
          >
            <span className="flex h-2.5 w-2.5 rounded-full bg-black/80 animate-ping" />
            <span className="tracking-wide">⚙️ Panel de Control Demo</span>
          </a>
        </div>
      )}
    </>
  );
}
