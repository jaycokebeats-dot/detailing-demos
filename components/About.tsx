"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import type { Business } from "@/data/businesses";
import SectionDivider from "./SectionDivider";

// El visor 3D pesa (three + el modelo), asi que no entra en el bundle inicial
// ni se descarga hasta que la seccion esta por aparecer en pantalla.
const CarShowcase = dynamic(() => import("./CarShowcase"), {
  ssr: false,
  loading: () => <div className="w-full aspect-square" />,
});

export default function About({ biz }: { biz: Business }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { rootMargin: "300px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section id="nosotros" className="relative px-5 sm:px-8 pt-24 pb-28" style={{ background: "#101010" }}>
      <SectionDivider edge="top" />

      <div className="max-w-6xl mx-auto grid gap-10 md:gap-14 md:grid-cols-2 md:items-center">
        <div>
          <span className="section-badge mb-5">Sobre nosotros</span>
          <h2 className="text-3xl md:text-4xl font-medium text-gold mb-6">
            Un auto por vez, hecho a mano
          </h2>
          <div className="space-y-4 text-slate-400 leading-relaxed">
            <p>
              {biz.nombreCorto} arrancó en un garage de {biz.ciudad}, con una idea simple: un auto puede
              quedar mejor que el día que salió del concesionario.
            </p>
            <p>
              Seguimos siendo un equipo chico y nos gusta así. Cada auto lo trabaja la misma persona de
              principio a fin, y esa persona es la que te lo entrega y te cuenta qué le hizo.
            </p>
            <p>
              Por eso tomamos pocos autos por día. Preferimos que te vayas mostrándole el resultado a
              todo el mundo, y no que esperes tres semanas por un turno.
            </p>
          </div>

          <dl className="grid grid-cols-3 gap-4 mt-9">
            {[
              { k: "Trabajo", v: "A mano" },
              { k: "Turnos", v: "Acotados" },
              { k: "Atención", v: "Personalizada" },
            ].map((d) => (
              <div key={d.k}>
                <dt className="text-[11px] uppercase tracking-widest text-slate-500 mb-1">{d.k}</dt>
                <dd className="text-white font-medium">{d.v}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div ref={ref} className="relative">
          <div
            className="absolute inset-0 -z-10 rounded-full blur-3xl opacity-25 pointer-events-none"
            style={{ background: "radial-gradient(circle at 50% 55%, #b8c2cc 0%, transparent 65%)" }}
          />
          {visible ? <CarShowcase /> : <div className="w-full aspect-square" />}
        </div>
      </div>
    </section>
  );
}
