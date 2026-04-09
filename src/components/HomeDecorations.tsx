/** Decorative SVG elements for the HomeScreen: bunting garlands + tropical foliage */

/* ── Bunting garlands ─────────────────────────────────────────────── */

const flagColors = [
  '#4ade80', // green
  '#a78bfa', // violet
  '#fbbf24', // amber
  '#22d3ee', // cyan
  '#f472b6', // pink
  '#4ade80',
  '#a78bfa',
  '#fbbf24',
  '#22d3ee',
  '#f472b6',
]

/**
 * Point along a quadratic Bézier  Q(t) = (1-t)²·P0 + 2(1-t)t·P1 + t²·P2
 */
function quadBezier(
  t: number,
  p0: [number, number],
  p1: [number, number],
  p2: [number, number],
): [number, number] {
  const u = 1 - t
  return [
    u * u * p0[0] + 2 * u * t * p1[0] + t * t * p2[0],
    u * u * p0[1] + 2 * u * t * p1[1] + t * t * p2[1],
  ]
}

export function Bunting() {
  // Left garland: center-top → deep droop → bottom-left
  const lP0: [number, number] = [200, 2]
  const lP1: [number, number] = [85, 140]
  const lP2: [number, number] = [-20, 65]

  // Right garland: center-top → deep droop → bottom-right
  const rP0: [number, number] = [200, 2]
  const rP1: [number, number] = [315, 140]
  const rP2: [number, number] = [420, 65]

  const flagCount = 10
  const flagH = 22
  const flagW = 14

  const makeFlags = (
    p0: [number, number],
    p1: [number, number],
    p2: [number, number],
    prefix: string,
  ) =>
    Array.from({ length: flagCount }, (_, i) => {
      const t = (i + 0.5) / flagCount
      const [cx, cy] = quadBezier(t, p0, p1, p2)
      return (
        <polygon
          key={`${prefix}${i}`}
          points={`${cx - flagW / 2},${cy} ${cx + flagW / 2},${cy} ${cx},${cy + flagH}`}
          fill={flagColors[i % flagColors.length]}
          opacity={0.55}
        />
      )
    })

  return (
    <svg
      className="absolute top-0 left-0 w-full pointer-events-none"
      style={{ zIndex: 5, height: 140 }}
      viewBox="0 0 400 160"
      preserveAspectRatio="xMidYMin slice"
    >
      {/* Strings */}
      <path
        d={`M${lP0[0]},${lP0[1]} Q${lP1[0]},${lP1[1]} ${lP2[0]},${lP2[1]}`}
        fill="none"
        stroke="rgba(255,255,255,0.12)"
        strokeWidth="1.5"
      />
      <path
        d={`M${rP0[0]},${rP0[1]} Q${rP1[0]},${rP1[1]} ${rP2[0]},${rP2[1]}`}
        fill="none"
        stroke="rgba(255,255,255,0.12)"
        strokeWidth="1.5"
      />
      {/* Flags */}
      {makeFlags(lP0, lP1, lP2, 'l')}
      {makeFlags(rP0, rP1, rP2, 'r')}
    </svg>
  )
}

/* ── Tropical foliage ─────────────────────────────────────────────── */

function LeftFoliage() {
  return (
    <svg
      className="absolute bottom-0 left-0 pointer-events-none"
      style={{ width: 160, height: 260 }}
      viewBox="0 0 180 300"
    >
      {/* ── Large palm frond (teal) ── */}
      <g opacity="0.55">
        {/* Main stem */}
        <path d="M20,300 Q28,220 40,140 Q45,110 55,80" fill="none" stroke="rgba(13,148,136,0.8)" strokeWidth="2.5" />
        {/* Left leaflets */}
        <path d="M40,260 Q10,240 -5,210 Q20,230 38,245" fill="rgba(20,184,166,0.6)" />
        <path d="M38,230 Q5,205 -10,170 Q18,195 36,218" fill="rgba(20,184,166,0.55)" />
        <path d="M40,200 Q12,170 0,135 Q20,165 38,190" fill="rgba(20,184,166,0.5)" />
        <path d="M42,170 Q18,140 10,105 Q25,135 42,160" fill="rgba(20,184,166,0.45)" />
        <path d="M45,140 Q28,110 22,78 Q33,108 46,132" fill="rgba(20,184,166,0.4)" />
        {/* Right leaflets */}
        <path d="M42,255 Q68,238 85,215 Q65,235 44,248" fill="rgba(20,184,166,0.55)" />
        <path d="M40,225 Q70,200 88,175 Q65,200 42,218" fill="rgba(20,184,166,0.5)" />
        <path d="M42,195 Q72,168 90,140 Q68,168 43,188" fill="rgba(20,184,166,0.45)" />
        <path d="M44,165 Q70,138 85,110 Q66,138 45,158" fill="rgba(20,184,166,0.4)" />
        <path d="M48,135 Q68,112 80,88 Q64,112 49,128" fill="rgba(20,184,166,0.35)" />
      </g>

      {/* ── Monstera-style leaf (violet/purple) ── */}
      <g opacity="0.45" transform="translate(50,60)">
        <path
          d="M30,240 Q25,200 20,160 Q10,130 15,100 Q20,70 40,50
             Q55,65 65,95 Q72,130 60,165 Q55,200 45,240 Z"
          fill="rgba(109,60,196,0.6)"
        />
        {/* Leaf holes / fenestrations */}
        <path d="M35,180 Q30,165 35,150 Q42,162 38,178Z" fill="rgba(15,10,30,0.5)" />
        <path d="M40,130 Q36,118 42,108 Q48,116 44,128Z" fill="rgba(15,10,30,0.5)" />
        {/* Central vein */}
        <path d="M38,235 Q32,170 28,120 Q30,85 40,55" fill="none" stroke="rgba(80,40,150,0.5)" strokeWidth="1.5" />
      </g>

      {/* ── Smaller teal leaf behind ── */}
      <g opacity="0.35" transform="translate(80,110)">
        <path
          d="M15,190 Q10,150 8,110 Q5,75 18,45
             Q30,70 35,105 Q38,145 28,190 Z"
          fill="rgba(45,212,191,0.6)"
        />
        <path d="M20,185 Q14,130 14,75 Q18,50 18,48" fill="none" stroke="rgba(20,184,166,0.5)" strokeWidth="1" />
      </g>

      {/* ── Tiny accent leaf ── */}
      <g opacity="0.3" transform="translate(0,180)">
        <path d="M5,120 Q0,90 8,60 Q15,85 12,120Z" fill="rgba(139,92,246,0.5)" />
      </g>
    </svg>
  )
}

function RightFoliage() {
  return (
    <svg
      className="absolute bottom-0 right-0 pointer-events-none"
      style={{ width: 160, height: 260, transform: 'scaleX(-1)' }}
      viewBox="0 0 180 300"
    >
      {/* Reuse same shapes, mirrored via scaleX(-1) on the container */}
      <g opacity="0.55">
        <path d="M20,300 Q28,220 40,140 Q45,110 55,80" fill="none" stroke="rgba(13,148,136,0.8)" strokeWidth="2.5" />
        <path d="M40,260 Q10,240 -5,210 Q20,230 38,245" fill="rgba(20,184,166,0.6)" />
        <path d="M38,230 Q5,205 -10,170 Q18,195 36,218" fill="rgba(20,184,166,0.55)" />
        <path d="M40,200 Q12,170 0,135 Q20,165 38,190" fill="rgba(20,184,166,0.5)" />
        <path d="M42,170 Q18,140 10,105 Q25,135 42,160" fill="rgba(20,184,166,0.45)" />
        <path d="M45,140 Q28,110 22,78 Q33,108 46,132" fill="rgba(20,184,166,0.4)" />
        <path d="M42,255 Q68,238 85,215 Q65,235 44,248" fill="rgba(20,184,166,0.55)" />
        <path d="M40,225 Q70,200 88,175 Q65,200 42,218" fill="rgba(20,184,166,0.5)" />
        <path d="M42,195 Q72,168 90,140 Q68,168 43,188" fill="rgba(20,184,166,0.45)" />
        <path d="M44,165 Q70,138 85,110 Q66,138 45,158" fill="rgba(20,184,166,0.4)" />
        <path d="M48,135 Q68,112 80,88 Q64,112 49,128" fill="rgba(20,184,166,0.35)" />
      </g>

      <g opacity="0.5" transform="translate(50,60)">
        <path
          d="M30,240 Q25,200 20,160 Q10,130 15,100 Q20,70 40,50
             Q55,65 65,95 Q72,130 60,165 Q55,200 45,240 Z"
          fill="rgba(139,92,246,0.55)"
        />
        <path d="M35,180 Q30,165 35,150 Q42,162 38,178Z" fill="rgba(15,10,30,0.5)" />
        <path d="M40,130 Q36,118 42,108 Q48,116 44,128Z" fill="rgba(15,10,30,0.5)" />
        <path d="M38,235 Q32,170 28,120 Q30,85 40,55" fill="none" stroke="rgba(100,50,180,0.5)" strokeWidth="1.5" />
      </g>

      <g opacity="0.35" transform="translate(80,110)">
        <path
          d="M15,190 Q10,150 8,110 Q5,75 18,45
             Q30,70 35,105 Q38,145 28,190 Z"
          fill="rgba(45,212,191,0.6)"
        />
        <path d="M20,185 Q14,130 14,75 Q18,50 18,48" fill="none" stroke="rgba(20,184,166,0.5)" strokeWidth="1" />
      </g>

      <g opacity="0.3" transform="translate(0,180)">
        <path d="M5,120 Q0,90 8,60 Q15,85 12,120Z" fill="rgba(139,92,246,0.5)" />
      </g>
    </svg>
  )
}

export function TropicalFoliage() {
  return (
    <>
      <LeftFoliage />
      <RightFoliage />
    </>
  )
}
