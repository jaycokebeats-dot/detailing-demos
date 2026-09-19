import { FaWhatsapp } from "react-icons/fa";
import { type Business, type ServiceItem, MSG_FOTOS, MSG_PRESUPUESTO, waHref } from "@/data/businesses";

const SERVICIOS: ServiceItem[] = [
  {
    nombre: "Detail de Interior",
    descripcion: "Aspirado profundo, manchas en tapizados, cuero tratado y desinfección completa.",
    ideal_si: "Compraste un usado, tenés chicos o usás el auto todos los días.",
    precio: "Desde $60.000",
    img: "/servicios/interior.jpg",
  },
  {
    nombre: "Detail de Exterior",
    descripcion: "Lavado a mano, descontaminación con arcilla, corrección de pintura y cera premium.",
    ideal_si: "Notás la pintura opaca o con marcas.",
    precio: "Desde $95.000",
    destacado: true,
    img: "/servicios/exterior.jpg",
  },
  {
    nombre: "Tratamiento Acrílico",
    descripcion: "Sellador de pintura de alta durabilidad, una alternativa más accesible al cerámico.",
    ideal_si: "Querés protección extra sin el gasto del tratamiento cerámico.",
    precio: "Desde $110.000",
    img: "/servicios/acrilico.jpg",
  },
  {
    nombre: "Recubrimiento Cerámico",
    descripcion: "Incluye el Detail de Exterior completo, más protección cerámica que dura años.",
    ideal_si: "Ya lo dejaste impecable y querés que se mantenga así.",
    precio: "Desde $140.000",
    img: "/servicios/ceramico-real.jpg",
  },
  {
    nombre: "PPF (Film de Protección)",
    descripcion: "Película transparente que blinda la pintura contra piedras, ramas y rayones.",
    ideal_si: "Tenés un auto nuevo o premium y querés cuidarlo desde el día uno.",
    precio: "Desde $250.000",
    img: "/servicios/ppf.jpg",
  },
  {
    nombre: "Polarizado",
    descripcion: "Película de control solar en los vidrios: menos calor adentro y más privacidad.",
    ideal_si: "Viajás mucho al sol o querés más intimidad en el auto.",
    precio: "Desde $80.000",
    img: "/servicios/polarizado.jpg",
  },
  {
    nombre: "Ploteo",
    descripcion: "Vinilo decorativo o wrap completo para cambiar el color o sumar un diseño propio.",
    ideal_si: "Querés renovar el look del auto sin pintarlo.",
    precio: "Desde $180.000",
    img: "/servicios/ploteo.jpg",
  },
  {
    nombre: "Saca Bollos (PDR)",
    descripcion: "Reparación de abolladuras sin pintar, sin dejar marcas ni diferencia de color.",
    ideal_si: "Tenés un golpe de puerta o granizo y querés arreglarlo sin repintar.",
    precio: "Desde $70.000",
    img: "/servicios/saca-bollos.jpg",
  },
];

export default function Inventory({ biz }: { biz: Business }) {
  const listaServicios = biz.servicios && biz.servicios.length > 0 ? biz.servicios : SERVICIOS;
  const isCustomList = Boolean(biz.servicios && biz.servicios.length > 0);

  return (
    <section id="servicios" className="px-5 sm:px-8 py-24">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-14 max-w-2xl mx-auto">
          <span className="section-badge mb-5">Nuestros servicios</span>
          <h2 className="text-3xl md:text-5xl font-medium text-gold mb-4">Qué Hacemos</h2>
          <p className="text-slate-400">
            Lavado a mano, corrección de pintura y protección cerámica. Sin remolinos, sin atajos.
          </p>
        </div>

        <div className={`grid sm:grid-cols-2 ${isCustomList ? "lg:grid-cols-3" : "lg:grid-cols-4"} gap-6`}>
          {listaServicios.map((s, i) => {
            const reservaMsg = `Hola! Quiero pedir un turno / presupuesto para el servicio: ${s.nombre}`;
            const imgSource = s.img ? s.img : (biz.fotos[i] ?? "/servicios/exterior.jpg");

            return (
              <div key={s.nombre} className="product-card rounded-[24px] overflow-hidden flex flex-col relative bg-slate-950/80 border border-slate-800/80 hover:border-gold/50 transition">
                {s.destacado && (
                  <span className="absolute top-3 right-3 z-10 text-[10px] px-2.5 py-1 rounded-full text-black font-bold uppercase tracking-wider shadow-md" style={{ background: "#d4af37" }}>
                    Recomendado
                  </span>
                )}
                <div className="aspect-[4/3] overflow-hidden relative" style={{ background: "#141414" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={imgSource} alt={s.nombre} className="w-full h-full object-cover" />
                  {s.proteccion && (
                    <div className="absolute bottom-2 left-2 right-2 bg-slate-950/85 backdrop-blur-md px-2.5 py-1 rounded-lg border border-emerald-500/40 text-[11px] font-semibold text-emerald-400 flex items-center gap-1.5 shadow-lg">
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
                        <span className="font-semibold text-slate-300">Ideal si:</span> {s.ideal_si}
                      </p>
                    )}

                    {s.precios_detalle && s.precios_detalle.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-1.5 bg-slate-900/50 p-2.5 rounded-xl">
                        <p className="text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">Precios por Vehículo:</p>
                        {s.precios_detalle.map((item) => (
                          <div key={item.categoria} className="flex justify-between items-center text-xs">
                            <span className="text-slate-400">{item.categoria}</span>
                            <span className="font-mono font-bold text-slate-200">{item.precio}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <a
                    href={waHref(biz, reservaMsg)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-outline-gold mt-4 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider"
                  >
                    <FaWhatsapp aria-hidden className="size-3.5" />
                    Consultar / Reservar
                  </a>
                </div>
              </div>
            );
          })}
        </div>

        <div className="glass-panel rounded-[28px] mt-10 p-8 md:p-10 flex flex-col md:flex-row items-center gap-6 justify-between border border-slate-800">
          <div>
            <span className="section-badge mb-3">¿No sabés qué necesita tu auto?</span>
            <h3 className="font-semibold text-xl md:text-2xl mb-2 text-white" style={{ textTransform: "none", fontFamily: "inherit" }}>
              Mandanos 3 Fotos y Te Decimos Qué Hacerle
            </h3>
            <p className="text-sm text-slate-400 max-w-xl">
              Sacale fotos del techo, capot e interior. Te orientamos en {biz.nombre} para elegir el tratamiento ideal.
            </p>
          </div>
          <a
            href={waHref(biz, MSG_FOTOS)}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-gold shrink-0 inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-sm font-semibold uppercase tracking-wide whitespace-nowrap"
          >
            <FaWhatsapp aria-hidden className="size-4" />
            Mandar fotos por WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
}
