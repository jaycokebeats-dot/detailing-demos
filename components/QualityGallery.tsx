import type { Business } from "@/data/business-helpers";
import SectionDivider from "./SectionDivider";

const ITEMS = [
  "Pintura opaca que perdió el brillo de fábrica",
  "Marcas de remolino (swirls) por lavados mal hechos",
  "Manchas que ya no salen con agua y jabón",
  "Plásticos del interior resecos y grises",
  "Tapizados con olores que no se van",
  "Cuero rígido o descolorido",
];

export default function QualityGallery({ biz }: { biz: Business }) {
  return (
    <section className="relative px-5 sm:px-8 py-20" style={{ background: "#101010" }}>
      <SectionDivider edge="top" />
      <div className="max-w-3xl mx-auto text-center">
        <span className="section-badge mb-5">El problema real</span>
        <h2 className="text-3xl md:text-4xl font-medium text-gold mb-3">Lavado no es lo Mismo que Detailing</h2>
        <p className="text-slate-400 max-w-xl mx-auto mb-10">
          Puede estar limpio y seguir viéndose mal. Señales típicas:
        </p>
        <div className="grid sm:grid-cols-2 gap-3 text-left max-w-xl mx-auto">
          {ITEMS.map((item) => (
            <div key={item} className="glass-panel rounded-2xl px-4 py-3 flex items-start gap-3">
              <span className="shrink-0 w-1.5 h-1.5 rounded-full mt-2" style={{ backgroundColor: "#b8c2cc" }} />
              <p className="text-sm text-slate-300">{item}</p>
            </div>
          ))}
        </div>
      </div>

      {/* fotos reales del negocio; en "/" no hay y no se renderiza */}
      {biz.fotos.length > 0 && (
        <div className="max-w-6xl mx-auto mt-16">
          <div className="text-center mb-8">
            <span className="section-badge mb-4">Nuestro trabajo</span>
            <h3 className="text-2xl md:text-3xl font-medium text-gold" style={{ textTransform: "none", fontFamily: "inherit" }}>
              Así trabajamos en {biz.nombre}
            </h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {biz.fotos.slice(0, 8).map((src, i) => (
              <div key={`${src}-${i}`} className="product-card rounded-[20px] overflow-hidden aspect-square" style={{ background: "#141414" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt={`${biz.nombre} — trabajo ${i + 1}`} className="w-full h-full object-cover" loading="lazy" />
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
