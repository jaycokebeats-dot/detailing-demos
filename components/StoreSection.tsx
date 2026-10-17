import SectionDivider from "./SectionDivider";

export default function StoreSection() {
  return (
    <section id="tienda" className="relative px-5 sm:px-8 py-20" style={{ background: "#101010" }}>
      <SectionDivider edge="top" fill="#101010" />

      <div className="max-w-3xl mx-auto text-center space-y-6">
        {/* Insignia de Detailing Studio */}
        <div className="flex justify-center mb-2">
          <div className="size-14 rounded-full border border-gold/30 bg-gold/10 flex items-center justify-center text-gold text-2xl font-bold">
            ✦
          </div>
        </div>

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-red-500/30 bg-red-950/30 text-xs font-semibold uppercase tracking-widest text-red-400">
          <span className="flex size-2 rounded-full shrink-0 animate-pulse bg-red-500" />
          <span>Próximamente</span>
        </div>

        <h2 className="text-3xl md:text-4xl font-medium text-gold">
          Tienda de Insumos & Productos Detailing
        </h2>

        <p className="text-slate-400 max-w-xl mx-auto leading-relaxed text-sm sm:text-base font-light">
          Muy pronto vas a poder conseguir todos los insumos premium y accesorios profesionales para el cuidado de tu auto.
        </p>
      </div>
    </section>
  );
}
