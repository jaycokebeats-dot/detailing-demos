"use client";

import { useCallback, useRef, useState } from "react";

export default function CompareSlider({
  before,
  after,
  alt,
  real = false,
  fit = "cover",
  isTheZone = false,
}: {
  before: string;
  after: string;
  alt: string;
  /** true when before/after are genuinely different photos (skips the grayscale trick) */
  real?: boolean;
  fit?: "cover" | "contain";
  isTheZone?: boolean;
}) {
  const [pos, setPos] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);

  const updateFromClientX = useCallback((clientX: number) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    if (rect.width <= 0) return;
    const pct = ((clientX - rect.left) / rect.width) * 100;
    setPos(Math.min(100, Math.max(0, pct)));
  }, []);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    draggingRef.current = true;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // Ignore if pointer capture fails on certain mobile webviews
    }
    updateFromClientX(e.clientX);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    updateFromClientX(e.clientX);
  };

  const stopDragging = (e?: React.PointerEvent<HTMLDivElement>) => {
    if (draggingRef.current && e) {
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {}
    }
    draggingRef.current = false;
  };

  // Direct touch fallback for mobile Safari / Chrome touchscreens
  const onTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length > 0) {
      draggingRef.current = true;
      updateFromClientX(e.touches[0].clientX);
    }
  };

  const onTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (draggingRef.current && e.touches.length > 0) {
      updateFromClientX(e.touches[0].clientX);
    }
  };

  const onTouchEnd = () => {
    draggingRef.current = false;
  };

  const imgFitClass = fit === "contain" ? "object-contain" : "object-cover";

  const clipStyle: React.CSSProperties = {
    clipPath: `inset(0 ${100 - pos}% 0 0)`,
    WebkitClipPath: `inset(0 ${100 - pos}% 0 0)`,
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden select-none cursor-ew-resize bg-[#0d0d0d] group"
      style={{ touchAction: "pan-y" }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={stopDragging}
      onPointerCancel={stopDragging}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onTouchCancel={onTouchEnd}
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
      <img
        src={after}
        alt={`Después — ${alt}`}
        className={`absolute inset-0 w-full h-full ${imgFitClass}`}
        draggable={false}
        loading="lazy"
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={before}
        alt={`Antes — ${alt}`}
        className={`absolute inset-0 w-full h-full ${imgFitClass}${real ? "" : " grayscale contrast-75"}`}
        style={clipStyle}
        draggable={false}
        loading="lazy"
      />

      <span className="absolute top-2 left-2 text-[10px] px-2.5 py-1 rounded-full bg-black/80 text-white uppercase tracking-wider font-semibold z-10 border border-white/10 backdrop-blur-sm pointer-events-none">
        Antes
      </span>
      <span
        className="absolute top-2 right-2 text-[10px] px-2.5 py-1 rounded-full uppercase tracking-wider font-extrabold z-10 backdrop-blur-sm shadow-md pointer-events-none"
        style={{
          background: isTheZone ? "#38bdf8" : "#b8c2cc",
          color: isTheZone ? "#030712" : "black",
          boxShadow: isTheZone ? "0 0 12px rgba(56, 189, 248, 0.7)" : "none",
        }}
      >
        Después
      </span>

      <div
        className="absolute top-0 bottom-0 w-0.5 pointer-events-none"
        style={{
          left: `${pos}%`,
          background: isTheZone
            ? "linear-gradient(180deg, #38bdf8 0%, #0066ff 50%, #38bdf8 100%)"
            : "rgba(255, 255, 255, 0.9)",
          boxShadow: isTheZone ? "0 0 10px rgba(56, 189, 248, 0.9)" : "none",
        }}
      />
      <div
        className="absolute top-1/2 w-9 h-9 rounded-full flex items-center justify-center -translate-y-1/2 -translate-x-1/2 shadow-lg pointer-events-none transition-transform group-hover:scale-105"
        style={{
          left: `${pos}%`,
          background: isTheZone
            ? "linear-gradient(135deg, #0055ff 0%, #00d0ff 100%)"
            : "#b8c2cc",
          boxShadow: isTheZone
            ? "0 0 20px rgba(0, 102, 255, 0.8), 0 0 8px rgba(56, 189, 248, 0.9)"
            : "0 4px 10px rgba(0,0,0,0.5)",
          border: isTheZone ? "2px solid rgba(255,255,255,0.95)" : "none",
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={isTheZone ? "white" : "black"} strokeWidth="2.5">
          <path d="M8 7l-5 5 5 5M16 7l5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  );
}
