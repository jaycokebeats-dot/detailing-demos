import { FaWhatsapp } from "react-icons/fa";
import { HiOutlineMapPin, HiOutlineClock, HiOutlinePhone, HiOutlineCamera } from "react-icons/hi2";
import { type Business, MSG_PRESUPUESTO, instagramHref, mapsHref, waHref } from "@/data/business-helpers";

export default function Location({ biz }: { biz: Business }) {
  const direccionTexto = biz.direccion.toLowerCase().includes(biz.ciudad.toLowerCase())
    ? biz.direccion
    : `${biz.direccion}, ${biz.ciudad}`;

  const datos = [
    { icon: HiOutlineMapPin, label: "Dirección", valor: `${direccionTexto} ↗`, subtext: "Haz clic para abrir en Google Maps", href: mapsHref(biz) },
    { icon: HiOutlineClock, label: "Horario", valor: biz.horario ?? "Consultá por WhatsApp", subtext: null, href: null },
    { icon: HiOutlinePhone, label: "Teléfono", valor: biz.telefono, subtext: null, href: null },
    ...(biz.instagram
      ? [{ icon: HiOutlineCamera, label: "Instagram", valor: `@${biz.instagram} ↗`, subtext: "Haz clic para ver fotos y trabajos en Instagram", href: instagramHref(biz.instagram) }]
      : []),
  ];

  return (
    <section id="ubicacion" className="px-5 sm:px-8 py-24">
      <div className="max-w-3xl mx-auto text-center">
        <span className="section-badge mb-5">Encontranos</span>
        <h2 className="text-3xl md:text-4xl font-medium text-gold mb-8">Te esperamos en nuestras instalaciones</h2>
        <div className="glass-panel rounded-[28px] p-8 md:p-10 text-left inline-block w-full">
          <div className="grid sm:grid-cols-2 gap-6">
            {datos.map((d) => (
              <div key={d.label} className="flex items-start gap-3">
                <d.icon aria-hidden className="size-5 shrink-0 mt-0.5" style={{ color: "#b8c2cc" }} />
                <div>
                  <p className="text-xs uppercase tracking-widest text-slate-500 mb-1">{d.label}</p>
                  {d.href ? (
                    <a
                      href={d.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group block"
                    >
                      <span className="block text-white font-medium group-hover:text-gold transition-colors underline underline-offset-4 decoration-slate-600 group-hover:decoration-gold">
                        {d.valor}
                      </span>
                      {d.subtext && (
                        <span className="block text-[11px] text-slate-400 group-hover:text-slate-300 mt-1 font-light">
                          {d.subtext}
                        </span>
                      )}
                    </a>
                  ) : (
                    <p className="text-white font-medium">{d.valor}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
          <a
            href={waHref(biz, MSG_PRESUPUESTO)}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-red-premium flex items-center justify-center gap-2 w-full py-3.5 rounded-full text-sm font-semibold uppercase tracking-wide mt-8"
          >
            <FaWhatsapp aria-hidden className="size-4" />
            Contáctanos por WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
}
