"use client";

import { useCallback, useRef, useState } from "react";

export default function CompareSlider({
  before,
  after,
  alt,
  real = false,
  fit = "cover",
}: {
  before: string;
  after: string;
  alt: string;
  /** true when before/after are genuinely different photos (skips the grayscale trick) */
  real?: boolean;
  fit?: "cover" | "contain";
}) {
  const [pos, setPos] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);

  const updateFromClientX = useCallback((clientX: number) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const pct = ((clientX - rect.left) / rect.width) * 100;
    setPos(Math.min(100, Math.max(0, pct)));
  }, []);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    draggingRef.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    updateFromClientX(e.clientX);
  };
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    updateFromClientX(e.clientX);
  };
  const stopDragging = () => {
    draggingRef.current = false;
  };

  const imgFitClass = fit === "contain" ? "object-contain" : "object-cover";

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden select-none touch-none cursor-ew-resize bg-[#0d0d0d]"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={stopDragging}
      onPointerCancel={stopDragging}
    >
      {/* Fondo ambiental difuminado para fotos que no llenan el marco (verticales/alargadas) */}
      {fit === "contain" && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={after}
          alt=""
          aria-hidden
          className="absolute inset-0 w-full h-full object-cover blur-2xl opacity-35 scale-110 pointer-events-none"
        />
      )}

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={after} alt={`Después — ${alt}`} className={`absolute inset-0 w-full h-full ${imgFitClass}`} draggable={false} />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={before}
        alt={`Antes — ${alt}`}
        className={`absolute inset-0 w-full h-full ${imgFitClass}${real ? "" : " grayscale contrast-75"}`}
        style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}
        draggable={false}
      />

      <span className="absolute top-2 left-2 text-[10px] px-2 py-1 rounded-full bg-black/70 text-white uppercase tracking-wide z-10">
        Antes
      </span>
      <span
        className="absolute top-2 right-2 text-[10px] px-2 py-1 rounded-full text-black font-semibold uppercase tracking-wide z-10"
        style={{ background: "#b8c2cc" }}
      >
        Después
      </span>

      <div className="absolute top-0 bottom-0 w-0.5 bg-white/90 pointer-events-none" style={{ left: `${pos}%` }} />
      <div
        className="absolute top-1/2 w-9 h-9 rounded-full flex items-center justify-center -translate-y-1/2 -translate-x-1/2 shadow-lg pointer-events-none"
        style={{ left: `${pos}%`, background: "#b8c2cc" }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2">
          <path d="M8 7l-5 5 5 5M16 7l5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  );
}
