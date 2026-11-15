import { useId } from 'react';

// Oppy, drawn as a cute side-view cartoon of a Mars Exploration Rover.
// viewBox 0 0 320 262 → wheels touch the ground at y≈258, arm tip reaches x≈300.

const EYE_Y = -9;
const EYE_X = [-16, 16];

function OpenEye({ cx, r, mood, side }) {
  const lid = (() => {
    const top = EYE_Y - r - 2;
    const x0 = cx - r - 2;
    const x1 = cx + r + 2;
    switch (mood) {
      case 'sleepy':
        return <rect x={x0} y={top} width={x1 - x0} height={r + 2} className="lid" />;
      case 'tired':
        return <rect x={x0} y={top} width={x1 - x0} height={r * 0.9 + 2} className="lid" />;
      case 'determined':
        return <rect x={x0} y={top} width={x1 - x0} height={r * 0.6 + 2} className="lid" />;
      case 'waking':
        // a full eyelid that flutters open once (CSS: .mood-waking .lid-wake)
        return <rect x={x0} y={top} width={x1 - x0} height={2 * r + 4} className="lid lid-wake" />;
      case 'sad':
      case 'worried': {
        // outer corner droops (sad eyebrows)
        const outerLow = EYE_Y - r * 0.15;
        const innerHigh = EYE_Y - r * 0.75;
        const pts =
          side === 'left'
            ? `${x0},${outerLow} ${x1},${innerHigh} ${x1},${top} ${x0},${top}`
            : `${x0},${innerHigh} ${x1},${outerLow} ${x1},${top} ${x0},${top}`;
        return <polygon points={pts} className="lid" />;
      }
      default:
        return null;
    }
  })();
  const pupil = mood === 'scared' ? 0.3 : 0.56;
  return (
    <g>
      <circle cx={cx} cy={EYE_Y} r={r} className="lens" />
      {/* iris = pupil + glint, moved together when Oppy glances around */}
      <g className="iris">
        <circle cx={cx} cy={EYE_Y} r={r * pupil} className="pupil" />
        <circle cx={cx - r * 0.33} cy={EYE_Y - r * 0.35} r={r * 0.24} className="glint" />
      </g>
      {lid}
      <rect x={cx - r - 2} y={EYE_Y - r - 2} width={2 * r + 4} height={2 * r + 4} className="blink" />
    </g>
  );
}

function Eyes({ mood }) {
  const [L, R] = EYE_X;
  if (mood === 'happy' || mood === 'proud') {
    return (
      <g className="eyes">
        <path d={`M${L - 9},${EYE_Y + 3} q9,-12 18,0`} className="eye-arc" />
        <path d={`M${R - 9},${EYE_Y + 3} q9,-12 18,0`} className="eye-arc" />
        <ellipse cx={L - 6} cy={EYE_Y + 12} rx="6" ry="3" className="blush" />
        <ellipse cx={R + 6} cy={EYE_Y + 12} rx="6" ry="3" className="blush" />
      </g>
    );
  }
  if (mood === 'sleep') {
    return (
      <g className="eyes">
        <path d={`M${L - 8},${EYE_Y} q8,6 16,0`} className="eye-arc" />
        <path d={`M${R - 8},${EYE_Y} q8,6 16,0`} className="eye-arc" />
      </g>
    );
  }
  const rL = mood === 'curious' ? 8.5 : mood === 'excited' || mood === 'scared' ? 12 : 10;
  const rR = mood === 'curious' ? 12.5 : mood === 'excited' || mood === 'scared' ? 12 : mood === 'confused' ? 6.5 : 10;
  return (
    <g className="eyes">
      <OpenEye cx={L} r={rL} mood={mood} side="left" />
      <OpenEye cx={R} r={rR} mood={mood} side="right" />
      {mood === 'excited' && (
        <g className="sparkles">
          <path d="M-44,-30 l3,7 7,3 -7,3 -3,7 -3,-7 -7,-3 7,-3z" />
          <path d="M44,-34 l2,5 5,2 -5,2 -2,5 -2,-5 -5,-2 5,-2z" />
        </g>
      )}
      {mood === 'confused' && (
        <text x="40" y="-30" className="qmark">?</text>
      )}
      {(mood === 'worried' || mood === 'sad') && (
        <path d="M30,-2 q4,7 0,10 q-4,-3 0,-10z" className="tear" />
      )}
      {mood === 'scared' && (
        <g className="scared-bits">
          {/* raised, frightened eyebrows + a drop of sweat */}
          <path d={`M${L - 11},${EYE_Y - 15} L${L + 7},${EYE_Y - 20}`} className="brow" />
          <path d={`M${R - 7},${EYE_Y - 20} L${R + 11},${EYE_Y - 15}`} className="brow" />
          <path d="M40,-24 q5,8 0,11 q-5,-3 0,-11z" className="sweat" />
        </g>
      )}
    </g>
  );
}

export default function Rover({
  mood = 'normal',
  arm = false,
  driving = false,
  dusty = false,
  look = null,
  power = 100,
  highlight = null,
  variant = 'oppy',
  className = '',
  talking = false,
  fidget = null,
}) {
  const uid = useId().replace(/:/g, '');
  const a1 = arm ? 12 : 170;
  const a2 = arm ? 58 : -165;
  const tilt =
    look === 'up' ? -14 : look === 'down' ? 12 : mood === 'curious' ? 7 : mood === 'sad' ? 8 : mood === 'sleep' ? 12 : 0;
  const hl = (part) => (highlight === part ? ' hl' : '');
  const lowPower = power <= 12;

  return (
    <svg
      viewBox="0 0 320 262"
      className={`rover rover--${variant} mood-${mood}${driving ? ' is-driving' : ''}${lowPower ? ' is-low' : ''}${arm ? ' arm-out' : ''}${talking ? ' is-talking' : ''}${fidget ? ` fidget-${fidget}` : ''} ${className}`}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`${uid}-body`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="var(--rv-body-1)" />
          <stop offset="1" stopColor="var(--rv-body-2)" />
        </linearGradient>
        <linearGradient id={`${uid}-panel`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#4361c9" />
          <stop offset="1" stopColor="#23307a" />
        </linearGradient>
      </defs>

      <ellipse cx="152" cy="258" rx="128" ry="6" className="rover-shadow" />

      {/* rover-pose: idle "fidget" animations (hop, shiver, sigh...) · rover-bob: driving lean & bumps */}
      <g className="rover-pose">
      <g className="rover-bob">
        {/* robotic arm (behind the wheels) */}
        <g transform="translate(226 196)">
          <g className={`arm-upper${hl('arm')}`} style={{ transform: `rotate(${a1}deg)` }}>
            <rect x="-4" y="-5" width="66" height="10" rx="5" className="arm-seg" />
            <g transform="translate(58 0)">
              <g className="arm-lower" style={{ transform: `rotate(${a2}deg)` }}>
                <rect x="-3" y="-4" width="52" height="8" rx="4" className="arm-seg" />
                <g transform="translate(50 0)">
                  <rect x="-3" y="-15" width="6" height="9" rx="2" className="turret-tool" />
                  <rect x="6" y="-3" width="9" height="6" rx="2" className="turret-tool" />
                  <rect x="-3" y="6" width="6" height="9" rx="2" className="turret-tool" />
                  <circle r="9.5" className="turret" />
                  <circle r="3.5" className="turret-eye" />
                </g>
              </g>
              <circle r="6.5" className="arm-joint" />
            </g>
          </g>
          <circle r="7" className="arm-joint" />
        </g>

        {/* rocker-bogie suspension */}
        <path d="M62 232 L112 194 L198 206 M150 232 L198 206 L238 232" className="suspension" />

        {/* warm electronics box */}
        <rect x="80" y="150" width="148" height="48" rx="11" fill={`url(#${uid}-body)`} className="body" />
        <rect x="80" y="186" width="148" height="12" rx="6" className="body-shade" />
        <rect x="100" y="162" width="52" height="16" rx="5" className="body-plate" />
        <text x="126" y="174" className="body-label">{variant === 'twin' ? 'MER-A' : 'MER-B'}</text>
        <circle cx="178" cy="170" r="4" className="bolt" />
        <circle cx="194" cy="170" r="4" className="bolt" />
        <circle cx="210" cy="170" r="4" className="bolt" />
        {dusty && <rect x="80" y="150" width="148" height="48" rx="11" className="dust" />}

        {/* antennas */}
        <g className="antenna-g">
          <line x1="122" y1="132" x2="122" y2="80" className="antenna" />
          <circle cx="122" cy="78" r="5.5" className="antenna-tip" />
          {/* little radio waves while Oppy is talking */}
          <g className="talk-waves">
            <path d="M131 70 q6 8 0 16" />
            <path d="M137 64 q10 14 0 28" />
          </g>
        </g>
        <g transform="translate(160 120) rotate(-18)">
          <g className="dish-spin">
            <rect x="-2.5" y="0" width="5" height="10" className="antenna-post" />
            <ellipse rx="18" ry="6.5" className="dish" />
          </g>
        </g>

        {/* solar deck */}
        <polygon points="24,150 290,150 266,125 48,125" fill={`url(#${uid}-panel)`} className={`deck${hl('panels')}`} />
        <g className="deck-grid">
          <line x1="36" y1="138" x2="278" y2="138" />
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => {
            const t = (i + 1) / 11;
            return <line key={i} x1={24 + 266 * t} y1="150" x2={48 + 218 * t} y2="125" />;
          })}
        </g>
        {dusty && <polygon points="24,150 290,150 266,125 48,125" className="dust dust-deck" />}

        {/* mast */}
        <rect x="196" y="54" width="10" height="74" rx="3" className={`mast${hl('mast')}`} />

        {/* camera head with "eyes" */}
        <g transform="translate(201 50)">
          <g className="head" style={{ transform: `rotate(${tilt}deg)` }}>
            <g className="head-fidget">
              <rect x="-36" y="-28" width="72" height="36" rx="13" className={`head-shell${hl('mast')}`} />
              <rect x="-28" y="-35" width="56" height="9" rx="4.5" className="head-visor" />
              <Eyes mood={mood} />
            </g>
          </g>
        </g>
      </g>

      {/* wheels (front layer). --b0..2 = per-wheel bump, --wheel = roll angle (set while driving) */}
      {[62, 150, 238].map((cx, i) => (
        <g key={cx} transform={`translate(${cx} 232)`} className={`wheel${hl('wheels')}`}>
          <g className="wheel-bump" style={{ transform: `translateY(var(--b${i}, 0px))` }}>
            <g className="wheel-spin">
              <circle r="26" className="tire" />
              <circle r="23" className="tread" />
              <circle r="15" className="rim" />
              <path d="M0 -14 L0 14 M-12 -7 L12 7 M-12 7 L12 -7" className="spokes" />
              <circle r="5" className="hub" />
            </g>
          </g>
        </g>
      ))}
      </g>

      {mood === 'sleep' && (
        <g className="zzz">
          <text x="246" y="22">z</text>
          <text x="262" y="6">Z</text>
          <text x="282" y="-12">Z</text>
        </g>
      )}
    </svg>
  );
}
