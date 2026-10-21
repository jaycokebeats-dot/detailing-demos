"use client";

import type { Business } from "@/data/business-helpers";
import SectionDivider from "./SectionDivider";

export default function About({ biz }: { biz: Business }) {
  const isBorges = biz.slug === "borges-ppf-y-detailing";

  return (
    <section id="nosotros" className="relative px-5 sm:px-8 py-20" style={{ background: "#101010" }}>
      <SectionDivider edge="top" />

      <div className="max-w-3xl mx-auto text-center space-y-6">
        <span className="section-badge mb-3">Sobre nosotros</span>
        
        <h2 className="text-3xl md:text-4xl font-medium text-gold mb-3">
          {isBorges ? "Somos Líderes en la Colocación de PPF en Canning" : `Pasión por la Estética Automotriz en ${biz.ciudad}`}
        </h2>

        <div className="space-y-4 text-slate-300 max-w-2xl mx-auto leading-relaxed text-sm sm:text-base font-light">
          <p>
            {isBorges ? (
              <>
                Con más de <strong className="text-white font-semibold">8 años de experiencia</strong> en el rubro, nos respaldan las reseñas reales de clientes que confían en nosotros.
              </>
            ) : (
              <>
                En <strong className="text-white font-semibold">{biz.nombre}</strong> nos respaldan las calificaciones y experiencias de clientes que confían en nuestro trabajo artesanal y cuidado minucioso.
              </>
            )}
          </p>
          <p>
            {isBorges ? (
              <>
                Nos caracteriza la calidad del servicio y de nuestros productos. Trabajamos con <strong className="text-white font-semibold">PPF XPEL</strong> y recubrimientos cerámicos premium, que traemos del exterior.
              </>
            ) : (
              <>
                Nos caracteriza la dedicación al detalle y productos de máxima calidad. Aplicamos tratamientos cerámicos de alta gama, correcciones de pintura y protección vehicular premium.
              </>
            )}
          </p>
          <div className="glass-panel rounded-2xl p-5 text-left max-w-2xl mx-auto border border-white/10 mt-6 space-y-2">
            <p className="text-xs uppercase tracking-widest font-bold text-slate-200">
              Visitanos & Asesoramiento Gratuito
            </p>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-light">
              Te asesoramos para encontrar la protección ideal para tu vehículo. Podés visitarnos en nuestras instalaciones en {biz.ciudad} y conocer nuestros materiales y terminaciones.
            </p>
          </div>
        </div>

        <div className="pt-6">
          <p className="text-xs sm:text-sm text-slate-400 mb-5 font-light">
            ¿Querés conocer la experiencia de nuestros clientes?
          </p>
          <a
            href={biz.maps_url || "https://maps.google.com"}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-gold inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-xs font-semibold uppercase tracking-wider active:scale-95 transition-transform"
          >
            Ver Reseñas Reales en Google Maps ↗
          </a>
        </div>
      </div>
    </section>
  );
}
