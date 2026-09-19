import { HiOutlineSparkles, HiOutlineShieldCheck, HiOutlineChatBubbleLeftRight } from "react-icons/hi2";
import SectionDivider from "./SectionDivider";

const PUNTOS = [
  { icon: HiOutlineSparkles, titulo: "Productos de grado profesional", texto: "Nada de túnel. Trabajamos a mano, con productos que no dañan la pintura." },
  { icon: HiOutlineShieldCheck, titulo: "Trabajos al Detalle", texto: "Cerámico y correcciones de pintura aplicados con máximo rigor técnico." },
  { icon: HiOutlineChatBubbleLeftRight, titulo: "Te acompañamos después", texto: "Si tenés cualquier consulta sobre el mantenimiento, nos escribís." },
];

export default function Warranty() {
  return (
    <section id="nosotros" className="relative px-5 sm:px-8 pt-24 pb-32 sm:pb-36" style={{ background: "#101010" }}>
      <SectionDivider edge="top" shape="asymmetric" mirror />
      <SectionDivider edge="bottom" />
      <div className="max-w-4xl mx-auto text-center">
        <span className="section-badge mb-5">Por qué nosotros</span>
        <h2 className="text-3xl md:text-4xl font-medium text-gold mb-4">La Diferencia se Nota al Tacto</h2>
        <p className="text-slate-400 max-w-xl mx-auto mb-14">
          No somos el lavadero de la esquina.
        </p>
        <div className="grid sm:grid-cols-3 gap-6 text-left">
          {PUNTOS.map((p) => (
            <div key={p.titulo} className="glass-panel rounded-[24px] p-7">
              <div className="w-11 h-11 rounded-full flex items-center justify-center mb-5" style={{ background: "rgba(184,194,204,0.1)" }}>
                <p.icon aria-hidden className="size-5" style={{ color: "#b8c2cc" }} />
              </div>
              <h3 className="font-semibold text-base mb-2" style={{ textTransform: "none", fontFamily: "inherit" }}>
                {p.titulo}
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">{p.texto}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
