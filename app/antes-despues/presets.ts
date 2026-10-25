// Preset data URLs for instant testing without needing external images

// 1. Corrección de Pintura: Capó Negro con Swirls vs Brillo Espejo 9H
export const PRESET_PINTURA_ANTES = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1000" width="800" height="1000">
  <defs>
    <radialGradient id="sun" cx="50%" cy="45%" r="40%">
      <stop offset="0%" stop-color="#777777" />
      <stop offset="30%" stop-color="#333333" />
      <stop offset="100%" stop-color="#141416" />
    </radialGradient>
    <filter id="noise">
      <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" result="noise" />
      <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.15 0" />
      <feComposite in2="SourceGraphic" in="glare" operator="arithmetic" k1="0" k2="1" k3="1" k4="0" />
    </filter>
  </defs>
  
  <!-- Fondo base chapa opaca -->
  <rect width="800" height="1000" fill="url(#sun)" />
  <rect width="800" height="1000" fill="#18181b" opacity="0.6" filter="url(#noise)" />
  
  <!-- Reflejo opaco distorsionado -->
  <ellipse cx="400" cy="420" rx="180" ry="140" fill="#999999" opacity="0.25" filter="blur(20px)" />
  
  <!-- Telaraña de Swirls y Microrrayones circulares -->
  <g stroke="#e2e8f0" stroke-width="1.2" opacity="0.45" fill="none">
    <circle cx="400" cy="420" r="45" stroke-dasharray="12 4 8 3" />
    <circle cx="400" cy="420" r="75" stroke-dasharray="25 6 15 5" />
    <circle cx="400" cy="420" r="110" stroke-dasharray="18 5 30 7" />
    <circle cx="400" cy="420" r="150" stroke-dasharray="40 8 20 6" />
    <circle cx="400" cy="420" r="195" stroke-dasharray="30 10 50 8" />
    <circle cx="400" cy="420" r="245" stroke-dasharray="60 12 40 10" />
    <circle cx="400" cy="420" r="300" stroke-dasharray="50 15 80 12" />
    
    <!-- Microarañazos lineales cruzados (marcas de lavado con trapo sucio) -->
    <path d="M 150 200 L 650 650" opacity="0.3" stroke-width="1.5" />
    <path d="M 180 230 L 620 620" opacity="0.3" stroke-width="1.2" />
    <path d="M 220 180 L 680 580" opacity="0.3" />
    <path d="M 600 220 L 150 700" opacity="0.35" stroke-width="1.4" />
    <path d="M 640 250 L 180 730" opacity="0.25" />
    <path d="M 250 350 Q 400 480 550 370" opacity="0.35" stroke-width="1.5" />
  </g>
  
  <!-- Gotas secas / Marcas de agua ácida calcificadas -->
  <g fill="none" stroke="#cbd5e1" stroke-width="1" opacity="0.3">
    <circle cx="280" cy="300" r="14" />
    <circle cx="281" cy="301" r="12" />
    <circle cx="520" cy="320" r="18" />
    <circle cx="460" cy="580" r="15" />
    <circle cx="340" cy="620" r="22" />
  </g>
  
  <!-- Etiqueta de contexto -->
  <text x="400" y="880" text-anchor="middle" fill="#94a3b8" font-family="sans-serif" font-size="22" font-weight="bold" letter-spacing="2">
    PINTURA OPACA • MICRORRAYAS Y SWIRLS
  </text>
  <text x="400" y="915" text-anchor="middle" fill="#64748b" font-family="sans-serif" font-size="16">
    Daño acumulado por lavados con escobillón y sol UV
  </text>
</svg>
`)}`;

export const PRESET_PINTURA_DESPUES = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1000" width="800" height="1000">
  <defs>
    <radialGradient id="deepGlow" cx="50%" cy="40%" r="55%">
      <stop offset="0%" stop-color="#1e293b" />
      <stop offset="40%" stop-color="#090d14" />
      <stop offset="100%" stop-color="#020408" />
    </radialGradient>
    <linearGradient id="neonLight" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.9" />
      <stop offset="25%" stop-color="#f8fafc" stop-opacity="0.7" />
      <stop offset="60%" stop-color="#38bdf8" stop-opacity="0.3" />
      <stop offset="100%" stop-color="#0284c7" stop-opacity="0" />
    </linearGradient>
    <linearGradient id="goldGlow" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#fbbf24" stop-opacity="0.4" />
      <stop offset="100%" stop-color="#d97706" stop-opacity="0" />
    </linearGradient>
  </defs>
  
  <!-- Fondo Negro Piano Profundo / Espejo -->
  <rect width="800" height="1000" fill="url(#deepGlow)" />
  
  <!-- Reflejo nítido de lámparas de estudio LED de detailing (Softbox de techo) -->
  <g transform="rotate(-15 400 450)">
    <!-- Marco de softbox reflejado con nitidez cristalina -->
    <rect x="220" y="240" width="360" height="280" rx="16" fill="none" stroke="#ffffff" stroke-width="6" opacity="0.95" />
    <rect x="235" y="255" width="330" height="250" rx="10" fill="none" stroke="#38bdf8" stroke-width="2" opacity="0.7" />
    <!-- Rejilla difusora del softbox -->
    <line x1="330" y1="240" x2="330" y2="520" stroke="#ffffff" stroke-width="2" opacity="0.6" />
    <line x1="440" y1="240" x2="440" y2="520" stroke="#ffffff" stroke-width="2" opacity="0.6" />
    <line x1="220" y1="330" x2="580" y2="330" stroke="#ffffff" stroke-width="2" opacity="0.6" />
    <line x1="220" y1="430" x2="580" y2="430" stroke="#ffffff" stroke-width="2" opacity="0.6" />
    
    <!-- Resplandor central del tubo LED -->
    <ellipse cx="400" cy="380" rx="120" ry="70" fill="url(#neonLight)" />
  </g>
  
  <!-- Línea de luz rasante dorada que acentúa la curvatura del nervio del capó -->
  <path d="M 80 80 Q 400 350 720 180" stroke="#fbbf24" stroke-width="4" fill="none" opacity="0.6" filter="blur(2px)" />
  <path d="M 80 80 Q 400 350 720 180" stroke="#ffffff" stroke-width="1.8" fill="none" opacity="0.9" />
  
  <!-- Destellos de brillo puntual (Lens Flare / Starburst) -->
  <g transform="translate(320, 310)">
    <circle cx="0" cy="0" r="8" fill="#ffffff" />
    <ellipse cx="0" cy="0" rx="35" ry="3" fill="#ffffff" opacity="0.9" />
    <ellipse cx="0" cy="0" rx="3" ry="35" fill="#ffffff" opacity="0.9" />
    <ellipse cx="0" cy="0" rx="20" ry="2" fill="#38bdf8" opacity="0.8" transform="rotate(45)" />
    <ellipse cx="0" cy="0" rx="2" ry="20" fill="#38bdf8" opacity="0.8" transform="rotate(45)" />
  </g>
  
  <!-- Gotas hidrofóbicas perfectas con ángulo de contacto > 115° -->
  <g>
    <circle cx="210" cy="680" r="14" fill="#38bdf8" opacity="0.3" />
    <circle cx="208" cy="678" r="10" fill="#ffffff" opacity="0.8" />
    <circle cx="260" cy="650" r="9" fill="#38bdf8" opacity="0.3" />
    <circle cx="258" cy="649" r="6" fill="#ffffff" opacity="0.8" />
    <circle cx="310" cy="710" r="16" fill="#38bdf8" opacity="0.3" />
    <circle cx="308" cy="708" r="12" fill="#ffffff" opacity="0.8" />
    <circle cx="580" cy="640" r="12" fill="#38bdf8" opacity="0.3" />
    <circle cx="578" cy="638" r="8" fill="#ffffff" opacity="0.8" />
  </g>
  
  <!-- Etiqueta de resultado -->
  <text x="400" y="880" text-anchor="middle" fill="#fbbf24" font-family="sans-serif" font-size="22" font-weight="900" letter-spacing="2">
    CORRECCIÓN EN 2 PASOS + CERÁMICO 9H
  </text>
  <text x="400" y="915" text-anchor="middle" fill="#e2e8f0" font-family="sans-serif" font-size="16" font-weight="bold">
    Brillo espejo profundo • Repelencia hidrofóbica total
  </text>
</svg>
`)}`;

// 2. Restauración de Ópticas: Amarillenta vs Cristalina LED
export const PRESET_OPTICA_ANTES = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1000" width="800" height="1000">
  <defs>
    <linearGradient id="yellowHaze" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#713f12" />
      <stop offset="35%" stop-color="#a16207" />
      <stop offset="70%" stop-color="#ca8a04" />
      <stop offset="100%" stop-color="#422006" />
    </linearGradient>
  </defs>
  
  <!-- Fondo chapa oscura alrededor de la óptica -->
  <rect width="800" height="1000" fill="#0f172a" />
  
  <!-- Silueta de faro óptico angular moderno -->
  <path d="M 120 280 L 680 220 L 720 620 L 260 720 Z" fill="#1e293b" stroke="#334155" stroke-width="4" />
  
  <!-- Lente de policarbonato oxidado y amarillento por el sol -->
  <path d="M 135 295 L 665 235 L 705 605 L 270 705 Z" fill="url(#yellowHaze)" opacity="0.85" />
  
  <!-- Interior borroso y opaco (apenas se ve la lupa o reflector) -->
  <ellipse cx="440" cy="440" rx="130" ry="110" fill="#854d0e" opacity="0.6" filter="blur(15px)" />
  <circle cx="440" cy="440" r="60" fill="#ca8a04" opacity="0.4" filter="blur(10px)" />
  
  <!-- Microfisuras y cascarilla de laca UV quemada -->
  <g stroke="#fef08a" stroke-width="1.5" opacity="0.4" fill="none">
    <path d="M 220 360 Q 280 400 350 370 T 480 410" />
    <path d="M 310 440 Q 380 480 450 450" />
    <path d="M 500 320 Q 560 360 620 330" />
    <path d="M 260 520 Q 340 560 410 530" />
    <circle cx="560" cy="460" r="35" stroke-dasharray="10 5" />
  </g>
  
  <text x="400" y="880" text-anchor="middle" fill="#facc15" font-family="sans-serif" font-size="22" font-weight="bold" letter-spacing="2">
    ÓPTICA QUEMADA POR EL SOL Y POLICARBONATO OXIDADO
  </text>
  <text x="400" y="915" text-anchor="middle" fill="#94a3b8" font-family="sans-serif" font-size="16">
    Pérdida de hasta un 60% de iluminación nocturna
  </text>
</svg>
`)}`;

export const PRESET_OPTICA_DESPUES = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1000" width="800" height="1000">
  <defs>
    <linearGradient id="lensGlass" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a" />
      <stop offset="50%" stop-color="#1e293b" />
      <stop offset="100%" stop-color="#020617" />
    </linearGradient>
    <radialGradient id="projectorGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#ffffff" />
      <stop offset="20%" stop-color="#38bdf8" />
      <stop offset="60%" stop-color="#0284c7" stop-opacity="0.5" />
      <stop offset="100%" stop-color="#0369a1" stop-opacity="0" />
    </radialGradient>
  </defs>
  
  <!-- Fondo chapa oscura -->
  <rect width="800" height="1000" fill="#0f172a" />
  
  <!-- Carcasa exterior nítida -->
  <path d="M 120 280 L 680 220 L 720 620 L 260 720 Z" fill="#090d16" stroke="#475569" stroke-width="4" />
  
  <!-- Fondo interior cromo oscuro y negro brillante -->
  <path d="M 135 295 L 665 235 L 705 605 L 270 705 Z" fill="url(#lensGlass)" />
  
  <!-- Lupa de proyector LED cristalina con bisel de cromo -->
  <circle cx="440" cy="440" r="105" fill="#1e293b" stroke="#e2e8f0" stroke-width="5" />
  <circle cx="440" cy="440" r="95" fill="none" stroke="#38bdf8" stroke-width="2" />
  
  <!-- Haz de luz y aro LED Angel Eye / DRL iluminado -->
  <circle cx="440" cy="440" r="85" fill="url(#projectorGlow)" />
  <circle cx="440" cy="440" r="85" fill="none" stroke="#ffffff" stroke-width="4" opacity="0.9" />
  
  <!-- Reflejo nítido diagonal sobre el policarbonato 100% transparente -->
  <path d="M 240 280 L 400 260 L 520 640 L 360 660 Z" fill="#ffffff" opacity="0.18" />
  <path d="M 440 255 L 480 250 L 580 630 L 540 635 Z" fill="#ffffff" opacity="0.25" />
  
  <!-- Destello de lente cristalina -->
  <circle cx="410" cy="400" r="10" fill="#ffffff" />
  <ellipse cx="410" cy="400" rx="35" ry="3" fill="#ffffff" opacity="0.9" />
  <ellipse cx="410" cy="400" rx="3" ry="35" fill="#ffffff" opacity="0.9" />
  
  <text x="400" y="880" text-anchor="middle" fill="#38bdf8" font-family="sans-serif" font-size="22" font-weight="900" letter-spacing="2">
    LENTE RESTAURADA A NUEVO + SELLADO CERÁMICO UV
  </text>
  <text x="400" y="915" text-anchor="middle" fill="#e2e8f0" font-family="sans-serif" font-size="16" font-weight="bold">
    100% de visibilidad recuperada • Garantía contra amarilleo
  </text>
</svg>
`)}`;

// 3. Detailing Interior: Cuero Brilloso Sucio vs Mate Original
export const PRESET_CUERO_ANTES = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1000" width="800" height="1000">
  <defs>
    <linearGradient id="greasyLeather" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1c1917" />
      <stop offset="50%" stop-color="#292524" />
      <stop offset="100%" stop-color="#1c1917" />
    </linearGradient>
  </defs>
  
  <rect width="800" height="1000" fill="url(#greasyLeather)" />
  
  <!-- Pliegues del asiento de cuero -->
  <path d="M 100 250 Q 400 320 700 250" stroke="#0c0a09" stroke-width="8" fill="none" />
  <path d="M 100 500 Q 400 570 700 500" stroke="#0c0a09" stroke-width="8" fill="none" />
  <path d="M 100 750 Q 400 820 700 750" stroke="#0c0a09" stroke-width="8" fill="none" />
  
  <!-- Brillo grasiento / aceitoso típico del cuero sucio con sebo corporal -->
  <ellipse cx="380" cy="400" rx="240" ry="80" fill="#ffffff" opacity="0.32" filter="blur(25px)" />
  <ellipse cx="420" cy="650" rx="200" ry="70" fill="#ffffff" opacity="0.28" filter="blur(20px)" />
  
  <!-- Suciedad acumulada en las costuras -->
  <line x1="200" y1="150" x2="200" y2="850" stroke="#0c0a09" stroke-width="6" stroke-dasharray="14 6" />
  <line x1="600" y1="150" x2="600" y2="850" stroke="#0c0a09" stroke-width="6" stroke-dasharray="14 6" />
  
  <text x="400" y="880" text-anchor="middle" fill="#d6d3d1" font-family="sans-serif" font-size="22" font-weight="bold" letter-spacing="2">
    CUERO BRILLOSO, GRASIENTO Y ACARTONADO
  </text>
  <text x="400" y="915" text-anchor="middle" fill="#78716c" font-family="sans-serif" font-size="16">
    Grasitud corporal y suciedad incrustada en el poro
  </text>
</svg>
`)}`;

export const PRESET_CUERO_DESPUES = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1000" width="800" height="1000">
  <defs>
    <linearGradient id="matteLeather" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#18181b" />
      <stop offset="50%" stop-color="#27272a" />
      <stop offset="100%" stop-color="#18181b" />
    </linearGradient>
  </defs>
  
  <rect width="800" height="1000" fill="url(#matteLeather)" />
  
  <!-- Pliegues limpios y definidos -->
  <path d="M 100 250 Q 400 320 700 250" stroke="#09090b" stroke-width="6" fill="none" />
  <path d="M 100 500 Q 400 570 700 500" stroke="#09090b" stroke-width="6" fill="none" />
  <path d="M 100 750 Q 400 820 700 750" stroke="#09090b" stroke-width="6" fill="none" />
  
  <!-- Reflejo suave SATINADO MATE ORIGINAL (sin brillo grasiento) -->
  <ellipse cx="380" cy="400" rx="180" ry="60" fill="#ffffff" opacity="0.08" filter="blur(35px)" />
  <ellipse cx="420" cy="650" rx="160" ry="50" fill="#ffffff" opacity="0.06" filter="blur(30px)" />
  
  <!-- Costuras limpias con contraste nítido y acondicionador mate -->
  <line x1="200" y1="150" x2="200" y2="850" stroke="#f59e0b" stroke-width="4" stroke-dasharray="12 6" opacity="0.8" />
  <line x1="600" y1="150" x2="600" y2="850" stroke="#f59e0b" stroke-width="4" stroke-dasharray="12 6" opacity="0.8" />
  
  <text x="400" y="880" text-anchor="middle" fill="#fbbf24" font-family="sans-serif" font-size="22" font-weight="900" letter-spacing="2">
    ACABADO MATE DE FÁBRICA + HIDRATACIÓN
  </text>
  <text x="400" y="915" text-anchor="middle" fill="#e4e4e7" font-family="sans-serif" font-size="16" font-weight="bold">
    Desinfección profunda • Tacto suave sin grasitud
  </text>
</svg>
`)}`;

export interface PresetItem {
  id: string;
  nombre: string;
  subtitulo: string;
  icon: string;
  servicioSugerido: string;
  fotoAntes: string;
  fotoDespues: string;
}

export const PRESETS: PresetItem[] = [
  {
    id: "pintura",
    nombre: "Pintura & Swirls",
    subtitulo: "Capó Negro • Rayones vs Cerámico 9H",
    icon: "✨",
    servicioSugerido: "Corrección de Pintura & Cerámico 9H",
    fotoAntes: PRESET_PINTURA_ANTES,
    fotoDespues: PRESET_PINTURA_DESPUES,
  },
  {
    id: "optica",
    nombre: "Restauración de Ópticas",
    subtitulo: "Faro Amarillento vs Cristalino LED",
    icon: "💡",
    servicioSugerido: "Pulido Óptico & Sellador UV",
    fotoAntes: PRESET_OPTICA_ANTES,
    fotoDespues: PRESET_OPTICA_DESPUES,
  },
  {
    id: "cuero",
    nombre: "Detailing Interior",
    subtitulo: "Cuero Grasiento vs Mate de Fábrica",
    icon: "💺",
    servicioSugerido: "Limpieza Profunda & Nutrición de Cuero",
    fotoAntes: PRESET_CUERO_ANTES,
    fotoDespues: PRESET_CUERO_DESPUES,
  },
];
