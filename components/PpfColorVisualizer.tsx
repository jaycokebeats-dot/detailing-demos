"use client";

import { useState, useEffect } from "react";
import { FaCheck } from "react-icons/fa";
import { type Business } from "@/data/business-helpers";

export type CarType = "SEDAN" | "SPORT" | "SUV";

export type ColorOption = {
  id: string;
  name: string;
  hex: string;
  finish: "Gloss" | "Satin" | "Matte" | "Metallic";
};

export const XPEL_COLORS: ColorOption[] = [
  { id: "pearl-white", name: "XPEL PEARL WHITE", hex: "#f5f5f7", finish: "Gloss" },
  { id: "xpel-yellow", name: "XPEL YELLOW", hex: "#f5c518", finish: "Gloss" },
  { id: "molten-orange", name: "XPEL MOLTEN ORANGE", hex: "#e65100", finish: "Gloss" },
  { id: "monza-red", name: "XPEL MONZA RED", hex: "#d32f2f", finish: "Gloss" },
  { id: "thermal-beige", name: "XPEL SATIN THERMAL BEIGE", hex: "#c2a675", finish: "Satin" },
  { id: "battle-green", name: "XPEL SATIN BATTLE GREEN", hex: "#485842", finish: "Satin" },
  { id: "moss-green", name: "XPEL GLOSS MOSS GREEN", hex: "#2e4d36", finish: "Gloss" },
  { id: "south-beach-blue", name: "XPEL SOUTH BEACH BLUE", hex: "#00a8b5", finish: "Gloss" },
  { id: "abyss-blue", name: "XPEL SATIN ABYSS BLUE", hex: "#2b5b84", finish: "Satin" },
  { id: "midnight-black", name: "XPEL SATIN MIDNIGHT BLACK", hex: "#1c2833", finish: "Satin" },
  { id: "ultra-plum", name: "XPEL ULTRA PLUM", hex: "#4a154b", finish: "Gloss" },
  { id: "bond-silver", name: "XPEL METALLIC BOND SILVER", hex: "#b0bec5", finish: "Metallic" },
  { id: "heritage-grey", name: "XPEL HERITAGE GREY", hex: "#78909c", finish: "Gloss" },
  { id: "grey-black", name: "XPEL GREY BLACK", hex: "#37474f", finish: "Gloss" },
  { id: "satin-tarmac", name: "XPEL SATIN TARMAC", hex: "#212121", finish: "Satin" },
  { id: "obsidian-black", name: "XPEL OBSIDIAN BLACK", hex: "#121212", finish: "Gloss" },
];

export default function PpfColorVisualizer({ biz }: { biz: Business }) {
  const [carType, setCarType] = useState<CarType>("SEDAN");
  const [selectedColor, setSelectedColor] = useState<ColorOption>(XPEL_COLORS[1]); // Default XPEL Yellow

  const carKey = carType.toLowerCase();
  const carImgSrc = `/visualizer/${carKey}_${selectedColor.id}.png`;

  // Preload all 16 official XPEL images for instant 0ms switching
  useEffect(() => {
    XPEL_COLORS.forEach((c) => {
      const img = new Image();
      img.src = `/visualizer/${carKey}_${c.id}.png`;
    });
  }, [carKey]);

  return (
    <div className="relative w-full h-full bg-gradient-to-b from-[#12141d] via-[#090b10] to-[#040406] flex flex-col justify-between p-3 select-none overflow-hidden">
      {/* Top Bar: Vehicle Type Pills & Selected Color Badge */}
      <div className="flex items-center justify-between z-20 gap-1">
        <div className="flex items-center gap-1 p-0.5 rounded-full bg-slate-900/90 border border-white/10 backdrop-blur-md">
          {(["SEDAN", "SPORT", "SUV"] as CarType[]).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setCarType(type)}
              className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all duration-150 ${
                carType === type
                  ? "bg-white text-slate-950 shadow-md scale-105"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40 uppercase tracking-widest truncate max-w-[150px]">
          {selectedColor.name}
        </span>
      </div>

      {/* Center: Official XPEL Car Cutout */}
      <div className="relative flex-1 w-full flex items-center justify-center my-1 min-h-0">
        {/* Soft Ambient Color Floor Glow */}
        <div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4/5 h-8 rounded-full opacity-35 blur-xl pointer-events-none transition-colors duration-300"
          style={{ backgroundColor: selectedColor.hex }}
        />

        {/* Photorealistic Official XPEL Car Cutout */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          key={`${carKey}_${selectedColor.id}`}
          src={carImgSrc}
          alt={`${carType} ${selectedColor.name}`}
          className="w-full h-full object-contain relative z-10 drop-shadow-[0_12px_24px_rgba(0,0,0,0.95)] transition-opacity duration-150"
        />
      </div>

      {/* Bottom Bar: Compact Swatches Palette */}
      <div className="z-20 pt-1">
        <div className="flex flex-wrap justify-center gap-1.5 max-w-full">
          {XPEL_COLORS.map((c) => {
            const isSelected = selectedColor.id === c.id;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setSelectedColor(c)}
                title={`${c.name} (${c.finish})`}
                className={`size-6 sm:size-6.5 rounded-full transition-all flex items-center justify-center shadow-md ${
                  isSelected
                    ? "ring-2 ring-amber-400 ring-offset-1 ring-offset-slate-950 scale-125 z-30"
                    : "hover:scale-110 opacity-80 hover:opacity-100 border border-white/20"
                }`}
                style={{ backgroundColor: c.hex }}
              >
                {isSelected && (
                  <FaCheck className={`size-2.5 ${c.id === "pearl-white" || c.id === "xpel-yellow" || c.id === "bond-silver" || c.id === "thermal-beige" ? "text-slate-950" : "text-white"}`} />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
