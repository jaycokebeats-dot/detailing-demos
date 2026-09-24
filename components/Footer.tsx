import type { Business } from "@/data/business-helpers";

export default function Footer({ biz }: { biz: Business }) {
  return (
    <footer className="px-5 sm:px-8 pt-14 pb-8" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-slate-500">
        <span>© {new Date().getFullYear()} {biz.nombre} — {biz.ciudad}</span>
        <span>{biz.direccion} · {biz.telefono}</span>
      </div>
    </footer>
  );
}
