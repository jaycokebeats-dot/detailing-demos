"use client";

import { useEffect, useState } from "react";
import Landing from "@/components/Landing";
import type { Business } from "@/data/business-helpers";
import { getDemoBusiness } from "@/lib/supabase";

export default function DemoClientLanding({ initialBiz }: { initialBiz: Business }) {
  const [biz, setBiz] = useState<Business>(initialBiz);
  const [isDemo, setIsDemo] = useState(false);

  useEffect(() => {
    if (initialBiz.slug === "demo") {
      setIsDemo(true);
      getDemoBusiness().then((data) => {
        setBiz(data);
      });
    }
  }, [initialBiz]);

  return (
    <>
      <Landing biz={biz} />

      {isDemo && (
        <div className="fixed bottom-4 left-4 z-50 animate-bounce">
          <a
            href="/admin/"
            className="flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-2.5 text-xs sm:text-sm font-bold text-black shadow-lg shadow-amber-500/20 hover:scale-105 hover:from-amber-400 hover:to-amber-500 transition-all border border-amber-300/30"
          >
            <span className="flex h-2 w-2 rounded-full bg-black animate-ping" />
            <span>✏️ Probar Panel de Autogestión</span>
          </a>
        </div>
      )}
    </>
  );
}
