// Interactive / decorative objects placed on the stage. All hand-drawn SVG,
// sized by the stage (width = a multiple of the rover width).

// igniting = engines lit during the countdown (rumble, small flame, smoke building up)
export function Rocket({ launched, igniting }) {
  return (
    <svg
      viewBox="0 0 120 300"
      className={`rocket${launched ? ' is-launched' : ''}${igniting ? ' is-igniting' : ''}`}
      aria-hidden="true"
    >
      <g className="rocket-body">
        {/* side boosters */}
        {[18, 92].map((x) => (
          <g key={x}>
            <rect x={x} y="190" width="14" height="80" rx="7" fill="#f4f6ff" stroke="#9aa3c7" strokeWidth="2" />
            <path d={`M${x} 196 q7 -18 14 0`} fill="#f4f6ff" stroke="#9aa3c7" strokeWidth="2" />
          </g>
        ))}
        <rect x="32" y="200" width="12" height="70" rx="6" fill="#e6e9f7" stroke="#9aa3c7" strokeWidth="2" />
        <rect x="76" y="200" width="12" height="70" rx="6" fill="#e6e9f7" stroke="#9aa3c7" strokeWidth="2" />
        {/* first stage (Delta teal) */}
        <rect x="42" y="110" width="36" height="165" rx="8" fill="#3fb6b0" stroke="#22807c" strokeWidth="2.5" />
        <rect x="42" y="150" width="36" height="8" fill="#2a8f8a" />
        <text x="60" y="215" className="rocket-text" transform="rotate(-90 60 215)">DELTA II</text>
        {/* fairing with Oppy inside */}
        <path d="M40 112 L40 70 Q60 6 80 70 L80 112 Z" fill="#ffffff" stroke="#9aa3c7" strokeWidth="2.5" />
        <circle cx="60" cy="80" r="11" fill="#cfe7ff" stroke="#7b86b5" strokeWidth="2.5" />
        <circle cx="56" cy="78" r="2.4" fill="#1d2147" />
        <circle cx="64" cy="78" r="2.4" fill="#1d2147" />
        <path d="M56 84 q4 3 8 0" stroke="#1d2147" strokeWidth="1.8" fill="none" strokeLinecap="round" />
        {/* nozzle + flame */}
        <path d="M48 275 L72 275 L76 288 L44 288 Z" fill="#5d648c" />
        <g className="flame">
          <path d="M46 288 Q60 345 74 288 Z" fill="#ffb347" />
          <path d="M52 288 Q60 325 68 288 Z" fill="#fff2a8" />
        </g>
      </g>
      <g className="smoke">
        <circle cx="30" cy="290" r="16" />
        <circle cx="60" cy="296" r="20" />
        <circle cx="92" cy="290" r="16" />
      </g>
    </svg>
  );
}

export function Capsule() {
  return (
    <svg viewBox="0 0 160 160" className="capsule" aria-hidden="true">
      <defs>
        <radialGradient id="cap-glow" cx="50%" cy="70%" r="60%">
          <stop offset="0" stopColor="#fff3a8" />
          <stop offset="0.45" stopColor="#ff9a3c" stopOpacity="0.85" />
          <stop offset="1" stopColor="#ff5a3c" stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx="80" cy="104" rx="72" ry="52" fill="url(#cap-glow)" className="capsule-glow" />
      <path d="M38 92 L58 44 Q80 32 102 44 L122 92 Z" fill="#eef0fa" stroke="#8a91b8" strokeWidth="3" />
      <path d="M30 92 Q80 128 130 92 Z" fill="#c9773f" stroke="#8e4a22" strokeWidth="3" />
      <circle cx="72" cy="70" r="3" fill="#1d2147" />
      <circle cx="88" cy="70" r="3" fill="#1d2147" />
      <path d="M73 79 q7 5 14 0" stroke="#1d2147" strokeWidth="2.2" fill="none" strokeLinecap="round" />
    </svg>
  );
}

export function Lander() {
  return (
    <svg viewBox="0 0 360 80" className="lander" aria-hidden="true">
      {/* deflated airbags */}
      {[22, 58, 300, 336].map((x, i) => (
        <ellipse key={i} cx={x} cy="66" rx="30" ry="13" fill="#f3efe6" stroke="#c9bfa8" strokeWidth="2" />
      ))}
      {/* open petals */}
      <polygon points="20,62 120,44 120,58 30,70" fill="#c7cde6" stroke="#7c84a8" strokeWidth="2" />
      <polygon points="340,62 240,44 240,58 330,70" fill="#c7cde6" stroke="#7c84a8" strokeWidth="2" />
      {/* base petal */}
      <rect x="110" y="40" width="140" height="20" rx="5" fill="#dfe3f3" stroke="#7c84a8" strokeWidth="2" />
      <rect x="120" y="58" width="120" height="10" rx="4" fill="#9aa1c4" />
      {/* egress ramp */}
      <path d="M250 44 L292 62" stroke="#8a91b8" strokeWidth="5" strokeLinecap="round" />
    </svg>
  );
}

export function Outcrop() {
  return (
    <svg viewBox="0 0 220 80" className="outcrop" aria-hidden="true">
      <path d="M6 76 L18 40 L60 30 L120 34 L170 26 L210 44 L216 76 Z" fill="#d8a06a" stroke="#a8693a" strokeWidth="3" />
      <path d="M18 52 L210 54 M14 64 L214 66" stroke="#b97a46" strokeWidth="3" fill="none" />
    </svg>
  );
}

export function Blueberries() {
  const berries = [
    [30, 52, 7], [52, 46, 6], [70, 56, 8], [92, 48, 6], [112, 58, 7], [134, 47, 6], [150, 57, 8],
    [172, 50, 6], [42, 64, 6], [84, 66, 7], [126, 66, 6], [162, 66, 6], [186, 62, 5], [18, 66, 5],
  ];
  return (
    <svg viewBox="0 0 210 80" className="blueberries" aria-hidden="true">
      <path d="M4 74 Q20 40 70 38 Q130 34 180 40 Q206 46 206 74 Z" fill="#e3b98c" stroke="#b07a48" strokeWidth="3" />
      {berries.map(([x, y, r], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r={r} fill="#566185" stroke="#323a5c" strokeWidth="1.5" />
          <circle cx={x - r * 0.35} cy={y - r * 0.35} r={r * 0.3} fill="#a9b6e0" />
        </g>
      ))}
    </svg>
  );
}

export function Backshell() {
  return (
    <svg viewBox="0 0 220 90" className="backshell" aria-hidden="true">
      <path d="M100 70 Q130 48 160 62 Q190 50 214 72 L214 80 L96 80 Z" fill="#f6f1e8" stroke="#cbbfa5" strokeWidth="2" />
      <path d="M112 66 Q140 56 170 64 M176 62 Q196 58 210 72" stroke="#f08a3c" strokeWidth="5" fill="none" />
      <path d="M18 80 L36 30 Q60 18 84 30 L100 80 Z" fill="#e8ebf6" stroke="#8a91b8" strokeWidth="3" />
      <rect x="40" y="44" width="40" height="8" rx="3" fill="#c7cde6" />
    </svg>
  );
}

export function HeatShield() {
  return (
    <svg viewBox="0 0 200 90" className="heatshield" aria-hidden="true">
      <path d="M10 82 Q40 30 96 34 Q150 38 170 82 Z" fill="#c9a26b" stroke="#7a5a2e" strokeWidth="3" />
      <path d="M30 82 Q60 50 96 52 Q132 54 150 82" fill="#2d2b3a" opacity="0.55" />
      <path d="M52 44 L74 62 M118 40 L104 62" stroke="#f3e2b8" strokeWidth="3" />
      <path d="M160 84 L178 64 L196 84 Z" fill="#b79562" stroke="#7a5a2e" strokeWidth="2" />
    </svg>
  );
}

export function Meteorite() {
  return (
    <svg viewBox="0 0 120 90" className="meteorite" aria-hidden="true">
      <defs>
        <linearGradient id="met-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#7d7c8c" />
          <stop offset="0.5" stopColor="#4a4958" />
          <stop offset="1" stopColor="#2c2b37" />
        </linearGradient>
      </defs>
      <path d="M10 82 Q4 50 26 30 Q52 8 84 18 Q112 30 112 60 Q112 84 84 86 L20 86 Z" fill="url(#met-g)" stroke="#23222c" strokeWidth="3" />
      {[[40, 40, 7], [70, 34, 5], [86, 58, 8], [52, 64, 5], [30, 62, 4]].map(([x, y, r], i) => (
        <ellipse key={i} cx={x} cy={y} rx={r} ry={r * 0.7} fill="#2a2934" />
      ))}
      <path d="M30 26 Q50 14 70 18" stroke="#d9dcef" strokeWidth="4" strokeLinecap="round" fill="none" className="met-shine" />
    </svg>
  );
}

export function Vein() {
  return (
    <svg viewBox="0 0 220 90" className="vein" aria-hidden="true">
      <path d="M4 86 L16 46 L70 34 L140 38 L200 30 L216 86 Z" fill="#b8703f" stroke="#7d4523" strokeWidth="3" />
      <path d="M16 60 L212 62" stroke="#9c5c32" strokeWidth="3" />
      <path d="M40 80 Q70 70 96 58 Q130 44 176 40" stroke="#fffaf0" strokeWidth="7" strokeLinecap="round" fill="none" className="vein-line" />
      <path d="M40 80 Q70 70 96 58 Q130 44 176 40" stroke="#ffe9a8" strokeWidth="2" strokeLinecap="round" fill="none" />
    </svg>
  );
}

export function ClayRock() {
  return (
    <svg viewBox="0 0 160 110" className="clay" aria-hidden="true">
      <path d="M8 106 Q4 60 34 34 Q70 6 112 20 Q150 36 154 80 L154 106 Z" fill="#c9a37a" stroke="#7d5a3a" strokeWidth="3" />
      <path d="M16 70 Q80 58 150 70" stroke="#a7b08a" strokeWidth="9" fill="none" />
      <path d="M12 88 Q80 78 152 90" stroke="#d9c39a" strokeWidth="7" fill="none" />
      <path d="M30 46 Q80 34 136 46" stroke="#b8a07a" strokeWidth="6" fill="none" />
    </svg>
  );
}

export function DustDevil() {
  return (
    <svg viewBox="0 0 120 220" className="dustdevil" aria-hidden="true">
      <g className="dd-spin">
        {[
          [60, 30, 48, 12], [60, 62, 40, 11], [60, 94, 32, 10], [60, 124, 25, 9], [60, 152, 18, 8], [60, 178, 12, 7], [60, 200, 8, 5],
        ].map(([cx, cy, rx, ry], i) => (
          <ellipse key={i} cx={cx} cy={cy} rx={rx} ry={ry} fill="none" stroke="#e7c08f" strokeWidth="6" strokeDasharray="22 10" opacity={0.9 - i * 0.06} />
        ))}
      </g>
    </svg>
  );
}

export function FinishLine() {
  return (
    <svg viewBox="0 0 220 200" className="finish" aria-hidden="true">
      <rect x="14" y="20" width="8" height="180" rx="3" fill="#eef0fa" stroke="#7c84a8" strokeWidth="2" />
      <rect x="198" y="20" width="8" height="180" rx="3" fill="#eef0fa" stroke="#7c84a8" strokeWidth="2" />
      <rect x="22" y="24" width="176" height="44" fill="#fff" stroke="#1d2147" strokeWidth="2" />
      {Array.from({ length: 22 }).map((_, i) => (
        <rect key={i} x={22 + (i % 11) * 16} y={i < 11 ? 24 : 46} width="8" height="22" fill="#1d2147" transform={i < 11 ? '' : 'translate(8 0)'} />
      ))}
      <rect x="40" y="70" width="140" height="30" rx="8" fill="#f08a3c" />
      <text x="110" y="92" className="finish-text">42.195 KM</text>
    </svg>
  );
}

// ── craters seen from the ground (chapter 6) ──────────────────────────────────
// A crater is a dip in the ground line, side view. The box is `depth + rise` rover-widths
// tall: the ground line sits `rise` below the top, the crater floor is the bottom edge.
// Inside the dip we see the crater's far wall, with its layers of rock.
const BOWLS = {
  // Endurance: ~130 m wide; Oppy drove down inside and read its layered walls
  endurance: {
    surface: (G) => `M0,${G} L60,${G} C130,${G} 210,${G + (100 - G) * 0.45} 270,${G + (100 - G) * 0.8} C300,96 330,100 370,100 L630,100 C670,100 700,96 730,${G + (100 - G) * 0.8} C790,${G + (100 - G) * 0.45} 870,${G} 940,${G} L1000,${G}`,
    inner: (G) =>
      `M60,${G} Q500,${G - 50} 940,${G} C870,${G} 790,${G + (100 - G) * 0.45} 730,${G + (100 - G) * 0.8} C700,96 670,100 630,100 L370,100 C330,100 300,96 270,${G + (100 - G) * 0.8} C210,${G + (100 - G) * 0.45} 130,${G} 60,${G} Z`,
    rim: (G) => `M60,${G} Q500,${G - 50} 940,${G}`,
    layers: 7,
  },
  // Victoria: ~750 m wide, rimmed by cliffs with capes and bays (the box runs off-screen)
  victoria: {
    surface: (G) => `M0,${G} L40,${G} C60,${G} 70,60 80,92 C84,99 90,100 100,100 L1000,100`,
    inner: (G) =>
      `M40,${G} L120,${G - 16} L160,${G - 6} L230,${G - 35} L270,${G - 29} L320,${G - 13} L400,${G - 42} L450,${G - 32} L520,${G - 10} L600,${G - 38} L650,${G - 26} L720,${G - 8} L800,${G - 35} L860,${G - 22} L930,${G - 38} L1000,${G - 29} L1000,100 L100,100 C90,100 84,99 80,92 C70,60 60,${G} 40,${G} Z`,
    rim: (G) =>
      `M40,${G} L120,${G - 16} L160,${G - 6} L230,${G - 35} L270,${G - 29} L320,${G - 13} L400,${G - 42} L450,${G - 32} L520,${G - 10} L600,${G - 38} L650,${G - 26} L720,${G - 8} L800,${G - 35} L860,${G - 22} L930,${G - 38} L1000,${G - 29}`,
    capes: [230, 400, 600, 800, 930],
    shadowX: 40,
    layers: 9,
  },
  // Endeavour: 22 km wide — from its rim the floor stretches away to the horizon
  endeavour: {
    surface: (G) => `M0,${G} L90,${G} C160,${G} 200,70 260,92 C290,100 320,100 360,100 L1000,100`,
    inner: (G) => `M90,${G} L1000,${G - 3} L1000,100 L360,100 C320,100 290,100 260,92 C200,70 160,${G} 90,${G} Z`,
    rim: (G) => `M90,${G} L1000,${G - 3}`,
    layers: 3,
    floor: true,
    shadowX: 120,
  },
};

export function Bowl({ variant = 'endurance', depth = 0.3, rise = 0.06 }) {
  const b = BOWLS[variant] || BOWLS.endurance;
  const G = (rise / (depth + rise)) * 100; // ground line, in viewBox units
  const id = `bowl-${variant}`;
  const layerYs = Array.from({ length: b.layers }, (_, i) => G + ((100 - G) * (i + 0.6)) / (b.layers + 0.4));
  return (
    <svg viewBox="0 0 1000 100" preserveAspectRatio="none" className={`bowl bowl-${variant}`} aria-hidden="true">
      <defs>
        <linearGradient id={`${id}-wall`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={b.floor ? '#c27a4a' : '#dc9560'} />
          <stop offset="1" stopColor={b.floor ? '#a4613a' : '#ad6237'} />
        </linearGradient>
        <clipPath id={`${id}-clip`}>
          <path d={b.inner(G)} />
        </clipPath>
      </defs>
      <path d={b.inner(G)} fill={`url(#${id}-wall)`} />
      <g clipPath={`url(#${id}-clip)`}>
        {/* layers of rock in the far wall (or dune ripples on Endeavour's floor) */}
        {layerYs.map((y, i) => (
          <path
            key={i}
            d={`M0,${y} Q250,${y - 2.5} 500,${y} T1000,${y}`}
            className={i % 2 ? 'bowl-layer dark' : 'bowl-layer'}
            vectorEffect="non-scaling-stroke"
          />
        ))}
        <path d={`M0,${G - 60} L${b.shadowX || 200},${G - 60} L${(b.shadowX || 200) + 120},100 L0,100 Z`} className="bowl-shade" />
        {b.capes?.map((x) => (
          <path key={x} d={`M${x},${G - 34} L${x - 14},${G + 34} M${x + 16},${G - 26} L${x + 9},${G + 24}`} className="bowl-cliff" vectorEffect="non-scaling-stroke" />
        ))}
      </g>
      <path d={b.rim(G)} className="bowl-rim" vectorEffect="non-scaling-stroke" />
      <path d={b.surface(G)} className="bowl-surface" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

// The far rim of Endeavour, low on the horizon, 22 km away.
export function FarRim() {
  return (
    <svg viewBox="0 0 600 60" preserveAspectRatio="none" className="far-rim" aria-hidden="true">
      <path d="M0 60 L0 44 C40 36 70 30 110 34 L150 46 L190 40 C230 26 270 24 300 32 L330 46 L370 44 C410 30 460 22 500 30 C540 36 570 42 600 40 L600 60 Z" />
    </svg>
  );
}

// Wooden signpost pointing to the next crater.
export function Signpost({ label = 'VICTORIA' }) {
  return (
    <svg viewBox="0 0 170 112" className="signpost" aria-hidden="true">
      <rect x="74" y="50" width="16" height="62" rx="4" fill="#8a5a33" stroke="#5c3a1f" strokeWidth="3" />
      <path d="M8 6 L140 6 L164 32 L140 58 L8 58 Z" fill="#e3b06f" stroke="#7a4a24" strokeWidth="4" strokeLinejoin="round" />
      <text x="78" y="31" className="sign-text">{label}</text>
      <text x="78" y="49" className="sign-sub">crater →</text>
    </svg>
  );
}

// A soft sand ripple ("Purgatory Dune", 2005). Drawn in front of Oppy so the wheels look buried.
export function Dune() {
  return (
    <svg viewBox="0 0 300 64" className="dune" aria-hidden="true">
      <path d="M0 64 C40 60 70 30 120 22 C160 16 200 20 236 36 C262 48 284 58 300 64 Z" fill="#e2a46c" stroke="#b57442" strokeWidth="2.5" />
      <path d="M60 46 C90 30 130 24 170 28" fill="none" stroke="#f5c48f" strokeWidth="4" strokeLinecap="round" opacity="0.8" />
      <path d="M40 58 C80 44 120 40 160 42 M150 56 C180 48 220 50 250 58" fill="none" stroke="#c4864f" strokeWidth="2.5" strokeLinecap="round" opacity="0.7" />
      <ellipse cx="96" cy="40" rx="4" ry="2" fill="#b57442" opacity="0.5" />
      <ellipse cx="206" cy="44" rx="5" ry="2" fill="#b57442" opacity="0.5" />
    </svg>
  );
}

// ── a round crater seen from the ground (Endurance, chapter 5) ────────────────
// Drawn as an ellipse in perspective, in two layers that sandwich Oppy:
//   PitBack  (behind Oppy): far raised rim, the layered far wall, the dune floor
//   PitFront (in front of Oppy): the near raised rim, so it hides Oppy's wheels
//            when Oppy drives down inside.
// Both use the same box (Stage.jsx: pit = 1.1 rover-widths tall, ground line at 0.15)
// and the same viewBox, stretched to fit (preserveAspectRatio="none").
const PIT = { cx: 500, cy: 36.4, rx: 420, ry: 29.1, ocy: 48.4, orx: 470, ory: 51.1 };
const ell = (cx, cy, rx, ry) => `M${cx - rx},${cy} A${rx} ${ry} 0 1 1 ${cx + rx},${cy} A${rx} ${ry} 0 1 1 ${cx - rx},${cy} Z`;
const PIT_RING = ell(PIT.cx, PIT.ocy, PIT.orx, PIT.ory) + ell(PIT.cx, PIT.cy, PIT.rx, PIT.ry);

function MoundGradient({ id }) {
  return (
    <radialGradient
      id={id}
      gradientUnits="userSpaceOnUse"
      cx={PIT.cx}
      cy={PIT.ocy}
      r={PIT.orx}
      gradientTransform={`translate(0 ${PIT.ocy}) scale(1 ${PIT.ory / PIT.orx}) translate(0 ${-PIT.ocy})`}
    >
      <stop offset="0.5" stopColor="#efb682" />
      <stop offset="0.76" stopColor="#d6925b" />
      <stop offset="0.92" stopColor="#c98048" stopOpacity="0.85" />
      <stop offset="1" stopColor="#c98048" stopOpacity="0" />
    </radialGradient>
  );
}

export function PitBack() {
  const { cx, cy, rx, ry } = PIT;
  return (
    <svg viewBox="0 0 1000 100" preserveAspectRatio="none" className="pit pit-back" aria-hidden="true">
      <defs>
        <MoundGradient id="pit-mound-b" />
        <linearGradient id="pit-wall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ecae78" />
          <stop offset="0.5" stopColor="#c67b47" />
          <stop offset="1" stopColor="#8a4627" />
        </linearGradient>
        <linearGradient id="pit-shade" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#3c1406" stopOpacity="0.55" />
          <stop offset="0.42" stopColor="#3c1406" stopOpacity="0" />
          <stop offset="0.85" stopColor="#fff2d8" stopOpacity="0" />
          <stop offset="1" stopColor="#fff2d8" stopOpacity="0.18" />
        </linearGradient>
        <clipPath id="pit-in">
          <ellipse cx={cx} cy={cy} rx={rx} ry={ry} />
        </clipPath>
        <clipPath id="pit-top">
          <rect x="0" y="-10" width="1000" height={cy + 10} />
        </clipPath>
      </defs>
      {/* raised rim around the crater (back half) */}
      <path d={PIT_RING} fillRule="evenodd" fill="url(#pit-mound-b)" clipPath="url(#pit-top)" />
      {/* inside: the far wall with its layers of rock, shade on the left, dunes on the floor */}
      <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="url(#pit-wall)" />
      <g clipPath="url(#pit-in)">
        {[1, 2, 3, 4, 5, 6, 7].map((k) => (
          <ellipse key={k} cx={cx} cy={cy + k * 4.4} rx={rx} ry={ry} className={k % 2 ? 'pit-layer' : 'pit-layer dark'} vectorEffect="non-scaling-stroke" />
        ))}
        <ellipse cx="520" cy="60" rx="270" ry="12" className="pit-floor" />
        <path d="M330 58 q40 -4 80 0 M450 61 q50 -5 100 0 M590 57 q40 -4 80 0 M400 64 q60 -4 120 0" className="pit-dune" vectorEffect="non-scaling-stroke" />
        <rect x="0" y="0" width="1000" height="100" fill="url(#pit-shade)" />
      </g>
      <ellipse cx={cx} cy={cy} rx={rx} ry={ry} className="pit-rim" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

export function PitFront() {
  const { cx, cy, rx, ry } = PIT;
  return (
    <svg viewBox="0 0 1000 100" preserveAspectRatio="none" className="pit pit-front" aria-hidden="true">
      <defs>
        <MoundGradient id="pit-mound-f" />
        <clipPath id="pit-bottom">
          <rect x="0" y={cy} width="1000" height={110 - cy} />
        </clipPath>
      </defs>
      {/* the near raised rim: in front of Oppy, so Oppy disappears behind it inside the crater */}
      <path d={PIT_RING} fillRule="evenodd" fill="url(#pit-mound-f)" clipPath="url(#pit-bottom)" />
      {[
        [170, 64, 9],
        [300, 78, 12],
        [470, 86, 8],
        [640, 83, 13],
        [800, 72, 10],
        [905, 56, 7],
      ].map(([x, y, r], i) => (
        <g key={i}>
          <ellipse cx={x} cy={y} rx={r} ry={r * 0.12} className="pit-rock" />
          <ellipse cx={x - r * 0.25} cy={y - r * 0.04} rx={r * 0.45} ry={r * 0.04} className="pit-rock-hi" />
        </g>
      ))}
      <path d={`M${cx - rx},${cy} A${rx} ${ry} 0 0 0 ${cx + rx},${cy}`} className="pit-crest" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}
