/**
 * Sample editorial plates matching the reference MorphPDF Atelier design.
 */

function createSvgDataUrl(svgString) {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgString.trim())}`;
}

export const INITIAL_SAMPLE_PLATES = [
  {
    id: 'plate-1',
    name: 'Elevation_Blueprint_A.png',
    dimensions: '3200 × 2400 PX',
    sizeFormatted: '3.8 MB',
    preview: createSvgDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
        <rect width="800" height="600" fill="#EAE5DB"/>
        <defs>
          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#D1CABE" stroke-width="0.75"/>
          </pattern>
        </defs>
        <rect width="800" height="600" fill="url(#grid)" />
        <rect x="120" y="100" width="560" height="380" fill="none" stroke="#686358" stroke-width="2"/>
        <path d="M 120 180 L 680 180 M 120 300 L 680 300 M 340 180 L 340 480 M 500 180 L 500 480" stroke="#7A7468" stroke-width="1.5" stroke-dasharray="4 2"/>
        <polygon points="120,100 400,30 680,100" fill="none" stroke="#4C483F" stroke-width="2.5"/>
        <circle cx="400" cy="70" r="15" fill="none" stroke="#8C867A" stroke-width="1"/>
        <text x="140" y="140" font-family="monospace" font-size="14" fill="#5A554A">ELEVATION SECTION A-A' • SCALE 1:50</text>
        <text x="140" y="460" font-family="monospace" font-size="12" fill="#8C867A">REF: ARCH-2024-V9 // STRUCTURAL CAD DRAFT</text>
      </svg>
    `),
    isEdited: false,
  },
  {
    id: 'plate-2',
    name: 'Watch_Product_Hero.jpg',
    dimensions: '4000 × 3000 PX',
    sizeFormatted: '4.2 MB',
    preview: createSvgDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
        <rect width="800" height="600" fill="#1C1E22"/>
        <radialGradient id="dialGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#2D323A"/>
          <stop offset="100%" stop-color="#0E1012"/>
        </radialGradient>
        <rect x="360" y="0" width="80" height="600" fill="#24272C"/>
        <circle cx="400" cy="300" r="180" fill="#3A3E45" stroke="#8F96A3" stroke-width="4"/>
        <circle cx="400" cy="300" r="160" fill="url(#dialGlow)" stroke="#535965" stroke-width="2"/>
        <circle cx="400" cy="300" r="150" fill="none" stroke="#A6ACB8" stroke-width="1" stroke-dasharray="2 12"/>
        <circle cx="340" cy="300" r="35" fill="none" stroke="#686F7D" stroke-width="1.5"/>
        <circle cx="460" cy="300" r="35" fill="none" stroke="#686F7D" stroke-width="1.5"/>
        <circle cx="400" cy="360" r="35" fill="none" stroke="#686F7D" stroke-width="1.5"/>
        <line x1="400" y1="300" x2="350" y2="230" stroke="#FFFFFF" stroke-width="4" stroke-linecap="round"/>
        <line x1="400" y1="300" x2="480" y2="280" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round"/>
        <line x1="400" y1="300" x2="400" y2="180" stroke="#D93829" stroke-width="1.5"/>
        <circle cx="400" cy="300" r="6" fill="#D93829"/>
        <text x="400" y="240" font-family="sans-serif" font-size="12" font-weight="bold" fill="#CED3DC" text-anchor="middle" letter-spacing="2">CHRONOMÈTRE</text>
      </svg>
    `),
    isEdited: false,
  },
  {
    id: 'plate-3',
    name: 'Tax_Receipt_Nov24.webp',
    dimensions: '1800 × 2600 PX',
    sizeFormatted: '1.1 MB',
    preview: createSvgDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
        <rect width="800" height="600" fill="#E8E4DA"/>
        <rect x="220" y="50" width="360" height="500" fill="#FFFFFF" filter="drop-shadow(0 4px 12px rgba(0,0,0,0.06))"/>
        <text x="260" y="100" font-family="sans-serif" font-size="16" font-weight="900" fill="#141413">INVOICE</text>
        <text x="480" y="100" font-family="monospace" font-size="11" fill="#78756F">#INV-891024</text>
        <line x1="260" y1="120" x2="540" y2="120" stroke="#E5E1D8" stroke-width="1"/>
        <rect x="260" y="150" width="160" height="8" rx="2" fill="#D3CDC2"/>
        <rect x="260" y="170" width="220" height="6" rx="2" fill="#EAE5DB"/>
        <rect x="260" y="190" width="190" height="6" rx="2" fill="#EAE5DB"/>
        <line x1="260" y1="230" x2="540" y2="230" stroke="#E5E1D8" stroke-width="1"/>
        <rect x="260" y="250" width="280" height="18" fill="#F6F3EC"/>
        <rect x="260" y="280" width="280" height="18" fill="#FFFFFF"/>
        <rect x="260" y="310" width="280" height="18" fill="#F6F3EC"/>
        <!-- Stamp -->
        <g transform="translate(360, 260) rotate(-18)">
          <rect x="-80" y="-20" width="160" height="40" fill="none" stroke="#C23829" stroke-width="2" rx="4"/>
          <text x="0" y="5" font-family="sans-serif" font-size="13" font-weight="bold" fill="#C23829" text-anchor="middle" letter-spacing="1">APPROVED • NOV 21 2024</text>
        </g>
        <text x="440" y="400" font-family="monospace" font-size="14" font-weight="bold" fill="#141413">TOTAL: $4,850.00</text>
      </svg>
    `),
    isEdited: false,
  },
  {
    id: 'plate-4',
    name: 'Brand_Styleguide_v4.png',
    dimensions: '2880 × 1800 PX',
    sizeFormatted: '2.9 MB',
    preview: createSvgDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
        <rect width="800" height="600" fill="#EFECE5"/>
        <rect x="120" y="80" width="560" height="440" fill="#FFFFFF" rx="4" stroke="#DFD9CD" stroke-width="1"/>
        <text x="160" y="130" font-family="serif" font-size="20" font-weight="bold" fill="#141413">Visual Identity System</text>
        <text x="160" y="155" font-family="monospace" font-size="11" fill="#7A766F">VERSION 4.2 • TYPOGRAPHY &amp; COMPONENT ARCHITECTURE</text>
        <!-- Swatches -->
        <rect x="160" y="190" width="60" height="60" rx="3" fill="#141413"/>
        <rect x="230" y="190" width="60" height="60" rx="3" fill="#4338CA"/>
        <rect x="300" y="190" width="60" height="60" rx="3" fill="#065F46"/>
        <rect x="370" y="190" width="60" height="60" rx="3" fill="#B91C1C"/>
        <rect x="440" y="190" width="60" height="60" rx="3" fill="#E2DDD2" stroke="#CCC5B8" stroke-width="1"/>
        <!-- Type Specimen -->
        <text x="160" y="300" font-family="serif" font-size="32" font-style="italic" fill="#141413">Newsreader Display Italic</text>
        <text x="160" y="340" font-family="sans-serif" font-size="14" fill="#4B4842">Hanken Grotesk Light 300, Regular 400, Semibold 600, Bold 700</text>
        <line x1="160" y1="370" x2="640" y2="370" stroke="#EAE5DB" stroke-width="1"/>
        <!-- UI Cards mini -->
        <rect x="160" y="390" width="140" height="90" rx="3" fill="#F8F6F2" stroke="#E2DCD1" stroke-width="1"/>
        <rect x="320" y="390" width="140" height="90" rx="3" fill="#F8F6F2" stroke="#E2DCD1" stroke-width="1"/>
        <rect x="480" y="390" width="140" height="90" rx="3" fill="#F8F6F2" stroke="#E2DCD1" stroke-width="1"/>
      </svg>
    `),
    isEdited: false,
  },
  {
    id: 'plate-5',
    name: 'User_Flow_Specs.jpg',
    dimensions: '3840 × 2160 PX',
    sizeFormatted: '2.1 MB',
    preview: createSvgDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
        <rect width="800" height="600" fill="#F5F3EC"/>
        <rect x="80" y="60" width="640" height="480" fill="#FFFFFF" stroke="#E2DDD2" stroke-width="1"/>
        <!-- Flowchart nodes -->
        <rect x="130" y="240" width="100" height="50" rx="4" fill="#F3EFE7" stroke="#141413" stroke-width="1.5"/>
        <text x="180" y="270" font-family="sans-serif" font-size="11" font-weight="bold" fill="#141413" text-anchor="middle">Entry Point</text>
        <line x1="230" y1="265" x2="290" y2="265" stroke="#141413" stroke-width="1.5" marker-end="url(#arrow)"/>
        
        <polygon points="340,230 390,265 340,300 290,265" fill="#FFFFFF" stroke="#141413" stroke-width="1.5"/>
        <text x="340" y="268" font-family="sans-serif" font-size="10" font-weight="bold" fill="#141413" text-anchor="middle">Valid?</text>
        <line x1="390" y1="265" x2="460" y2="265" stroke="#141413" stroke-width="1.5"/>
        
        <rect x="460" y="240" width="110" height="50" rx="4" fill="#141413"/>
        <text x="515" y="270" font-family="sans-serif" font-size="11" font-weight="bold" fill="#FFFFFF" text-anchor="middle">Render Stage</text>
        
        <line x1="340" y1="300" x2="340" y2="380" stroke="#141413" stroke-width="1.5"/>
        <line x1="340" y1="380" x2="460" y2="380" stroke="#141413" stroke-width="1.5"/>
        <rect x="460" y="355" width="110" height="50" rx="4" fill="#F3EFE7" stroke="#B91C1C" stroke-width="1.5"/>
        <text x="515" y="385" font-family="sans-serif" font-size="11" font-weight="bold" fill="#B91C1C" text-anchor="middle">Reject Modal</text>
      </svg>
    `),
    isEdited: false,
  },
];
