import { FaWhatsapp } from "react-icons/fa";
import { type Business, type ServiceItem, waHref } from "@/data/business-helpers";
import CompareSlider from "./CompareSlider";
import PpfColorVisualizer from "./PpfColorVisualizer";

export default function Inventory({ biz }: { biz: Business }) {
  const isBorges = biz.slug === "borges-ppf-y-detailing";
  const listaServicios = biz.servicios ?? [];

  const renderCard = (s: ServiceItem, i: number) => {
    const reservaMsg = `Hola! Quiero pedir un turno / presupuesto para el servicio: ${s.nombre}`;
    const imgSource = s.img ? s.img : "/servicios/ppf.jpg";
    const isPpfColor = s.nombre.toLowerCase().includes("ppf color");

    return (
      <div key={s.nombre} className="product-card rounded-[24px] overflow-hidden flex flex-col relative bg-slate-950/80 border border-slate-800/80 hover:border-gold/50 transition w-full h-full justify-between">
        {s.destacado && (
          <span className="absolute top-3 right-3 z-10 text-[10px] px-2.5 py-1 rounded-full text-black font-bold uppercase tracking-wider shadow-md" style={{ background: "#d4af37" }}>
            Recomendado
          </span>
        )}

        <div className="aspect-[4/3] overflow-hidden relative" style={{ background: "#141414" }}>
          {isPpfColor ? (
            <PpfColorVisualizer biz={biz} />
          ) : s.antes_img && s.despues_img ? (
            <CompareSlider before={s.antes_img} after={s.despues_img} alt={s.nombre} real />
          ) : (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={imgSource} alt={s.nombre} className="w-full h-full object-cover" />
          )}
          {s.proteccion && !isPpfColor && (
            <div className="absolute bottom-2 left-2 right-2 bg-slate-950/85 backdrop-blur-md px-2.5 py-1 rounded-lg border border-gold/40 text-[11px] font-semibold text-gold flex items-center gap-1.5 shadow-lg z-20 pointer-events-none">
              <span>{s.proteccion}</span>
            </div>
          )}
        </div>

        <div className="p-5 flex flex-col gap-2 flex-1 justify-between">
          <div className="space-y-2">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-bold text-lg text-white leading-tight" style={{ textTransform: "none", fontFamily: "inherit" }}>
                {s.nombre}
              </h3>
            </div>
            <p className="text-base font-extrabold text-gold">{s.precio}</p>
            <p className="text-xs text-slate-300 leading-relaxed">{s.descripcion}</p>

            {s.ideal_si && (
              <p className="text-[11px] text-slate-400 pt-1">
                <span className="font-semibold text-slate-300">Detalles:</span> {s.ideal_si}
              </p>
            )}
          </div>

          <a
            href={waHref(biz, reservaMsg)}
            target="_blank"
            rel="noopener noreferrer"
            className={`${isBorges ? "btn-red-premium" : "btn-gold"} mt-4 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider`}
          >
            <FaWhatsapp aria-hidden className="size-3.5" />
            Asesorarme
          </a>
        </div>
      </div>
    );
  };

  return (
    <section id="servicios" className="px-5 sm:px-8 py-24">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-14 max-w-2xl mx-auto">
          <span className="section-badge mb-5">Nuestros servicios</span>
          <h2 className="text-3xl md:text-5xl font-medium text-gold mb-4">Qué Hacemos</h2>
          <p className="text-slate-400">
            Protección de pintura, corrección y tratamientos cerámicos. Sin remolinos, sin atajos.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-6 max-w-7xl mx-auto">
          {listaServicios.map((s, i) => (
            <div key={s.nombre} className="w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] max-w-md flex flex-col">
              {renderCard(s, i)}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
