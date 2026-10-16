import type { Business } from "@/data/business-helpers";

export default function Footer({ biz }: { biz: Business }) {
  return (
    <footer className="relative px-5 sm:px-8 pt-12 pb-8" style={{ background: "#101010" }}>
      {/* L\u00ednea divisoria de acento met\u00e1lico sutil */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-[1px]" style={{ background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.12) 20%, rgba(212,175,55,0.35) 50%, rgba(255,255,255,0.12) 80%, transparent 100%)" }} />

      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-slate-400 font-light">
        <span>© {new Date().getFullYear()} {biz.nombre} — {biz.ciudad}</span>
        <span>{biz.direccion} · {biz.telefono}</span>
      </div>
    </footer>
  );
}
