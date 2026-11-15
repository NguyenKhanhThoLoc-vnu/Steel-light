import { useEffect, useMemo, useRef, useState } from 'react';
import { MAP_POINTS } from '../data/story.js';
import { DustDevil } from './Objects.jsx';

// ── helpers ───────────────────────────────────────────────────────────────────
function rng(seed) {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function Stars({ count = 90, seed = 7, className = '', maxTop = 100 }) {
  const stars = useMemo(() => {
    const r = rng(seed);
    return Array.from({ length: count }, () => ({
      left: r() * 100,
      top: r() * maxTop,
      size: r() < 0.12 ? 3 : r() < 0.5 ? 2 : 1.4,
      delay: r() * 4,
    }));
  }, [count, seed, maxTop]);
  return (
    <div className={`stars ${className}`} aria-hidden="true">
      {stars.map((s, i) => (
        <i
          key={i}
          style={{ left: `${s.left}%`, top: `${s.top}%`, width: s.size, height: s.size, animationDelay: `${s.delay}s` }}
        />
      ))}
    </div>
  );
}

function useTween(target, ms = 1700, initial = 0) {
  const [value, setValue] = useState(initial);
  const current = useRef(initial);
  useEffect(() => {
    const from = current.current;
    const start = performance.now();
    let raf;
    const step = (now) => {
      const k = Math.min(1, (now - start) / ms);
      const e = k < 0.5 ? 2 * k * k : 1 - (-2 * k + 2) ** 2 / 2;
      current.current = from + (target - from) * e;
      setValue(current.current);
      if (k < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, ms]);
  return value;
}

function Face({ cx = 50, cy = 54, s = 1, blush = true }) {
  return (
    <g>
      <circle cx={cx - 12 * s} cy={cy - 4 * s} r={3.6 * s} fill="#1d2147" />
      <circle cx={cx + 12 * s} cy={cy - 4 * s} r={3.6 * s} fill="#1d2147" />
      <circle cx={cx - 13 * s} cy={cy - 5.4 * s} r={1.2 * s} fill="#fff" />
      <circle cx={cx + 11 * s} cy={cy - 5.4 * s} r={1.2 * s} fill="#fff" />
      <path d={`M${cx - 7 * s} ${cy + 4 * s} q${7 * s} ${7 * s} ${14 * s} 0`} stroke="#1d2147" strokeWidth={2.6 * s} fill="none" strokeLinecap="round" />
      {blush && (
        <>
          <ellipse cx={cx - 20 * s} cy={cy + 3 * s} rx={5 * s} ry={2.6 * s} fill="#ff8fa3" opacity="0.7" />
          <ellipse cx={cx + 20 * s} cy={cy + 3 * s} rx={5 * s} ry={2.6 * s} fill="#ff8fa3" opacity="0.7" />
        </>
      )}
    </g>
  );
}

export function EarthPlanet() {
  return (
    <svg viewBox="0 0 100 100" aria-hidden="true">
      <circle cx="50" cy="50" r="46" fill="#4aa3ff" stroke="#2b6fc2" strokeWidth="3" />
      <path d="M18 34 q10 -12 24 -6 q6 10 -6 14 q-10 2 -8 12 q-6 4 -12 -6 q-4 -8 2 -14z" fill="#5fcf7a" />
      <path d="M62 18 q14 2 20 14 q-8 4 -14 0 q-8 -2 -6 -14z" fill="#5fcf7a" />
      <path d="M60 70 q12 -6 20 2 q-4 12 -16 12 q-8 -6 -4 -14z" fill="#5fcf7a" />
      <Face cx={50} cy={56} s={0.9} />
    </svg>
  );
}

export function MarsPlanet() {
  return (
    <svg viewBox="0 0 100 100" aria-hidden="true">
      <circle cx="50" cy="50" r="46" fill="#e0703f" stroke="#a9481f" strokeWidth="3" />
      <ellipse cx="50" cy="10" rx="16" ry="5" fill="#fff4ea" />
      <ellipse cx="28" cy="36" rx="9" ry="6" fill="#c5582b" />
      <ellipse cx="74" cy="72" rx="11" ry="6" fill="#c5582b" />
      <ellipse cx="70" cy="30" rx="5" ry="4" fill="#c5582b" />
      <Face cx={50} cy={56} s={0.9} />
    </svg>
  );
}

export function Cruiser({ mood = 'happy' }) {
  const sad = mood === 'sad';
  return (
    <svg viewBox="0 0 80 80" aria-hidden="true">
      <circle cx="40" cy="40" r="34" fill="#2d3e8f" stroke="#9fb3ff" strokeWidth="3" />
      {Array.from({ length: 12 }).map((_, i) => (
        <line key={i} x1="40" y1="40" x2={40 + 34 * Math.cos((i * Math.PI) / 6)} y2={40 + 34 * Math.sin((i * Math.PI) / 6)} stroke="#5a78d6" strokeWidth="1.5" />
      ))}
      <circle cx="40" cy="40" r="18" fill="#eef0fa" stroke="#8a91b8" strokeWidth="3" />
      <circle cx="34" cy="38" r="3" fill="#1d2147" />
      <circle cx="46" cy="38" r="3" fill="#1d2147" />
      {sad ? (
        <>
          <path d="M29 33 l8 -2 M51 33 l-8 -2" stroke="#1d2147" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M35 47 q5 -4 10 0" stroke="#1d2147" strokeWidth="2" fill="none" strokeLinecap="round" />
          <path className="cruiser-tear" d="M48 41 q2.5 4 0 6 q-2.5 -2 0 -6z" fill="#7cc8ff" />
        </>
      ) : (
        <path d="M35 45 q5 4 10 0" stroke="#1d2147" strokeWidth="2" fill="none" strokeLinecap="round" />
      )}
    </svg>
  );
}

// A tiny clean-room engineer ("bunny suit") for the lab background and Oppy's memories.
export function Engineer({ wave = false, item = 'clipboard', visor = '#4a6ad8' }) {
  return (
    <svg viewBox="0 0 40 90" aria-hidden="true">
      <ellipse cx="20" cy="88" rx="13" ry="2.5" fill="rgba(20,27,61,.18)" />
      <g className="eng-legs">
        <rect x="9" y="64" width="9" height="22" rx="4" fill="#f4f6ff" stroke="#9aa3c7" strokeWidth="1.6" className="eng-leg l" />
        <rect x="22" y="64" width="9" height="22" rx="4" fill="#f4f6ff" stroke="#9aa3c7" strokeWidth="1.6" className="eng-leg r" />
      </g>
      <rect x="6" y="30" width="28" height="40" rx="11" fill="#ffffff" stroke="#9aa3c7" strokeWidth="1.8" />
      <g className={wave ? 'eng-wave' : 'eng-arm'}>
        <rect x="27" y="34" width="7" height="24" rx="3.5" fill="#ffffff" stroke="#9aa3c7" strokeWidth="1.6" />
      </g>
      {!wave && item === 'clipboard' && <rect x="2" y="38" width="11" height="15" rx="2" fill="#7c84a8" />}
      {!wave && item === 'tablet' && <rect x="1" y="40" width="13" height="10" rx="2" fill="#2b3550" stroke="#57c1ff" strokeWidth="1.4" />}
      {!wave && item === 'box' && (
        <g>
          <rect x="4" y="42" width="32" height="20" rx="2" fill="#d9a86c" stroke="#a8763c" strokeWidth="1.6" />
          <path d="M4 48 H36" stroke="#a8763c" strokeWidth="1.2" />
        </g>
      )}
      <circle cx="20" cy="18" r="14" fill="#ffffff" stroke="#9aa3c7" strokeWidth="1.8" />
      <rect x="10" y="12" width="20" height="10" rx="5" fill={visor} />
      <circle cx="15" cy="16" r="1.6" fill="#fff" />
    </svg>
  );
}

// People walking around the JPL clean room: direction, speed, start time, size (closer = bigger, lower).
const WALKERS = [
  { dir: 'r', dur: 21, delay: -3, size: 0.2, low: 3, item: 'clipboard', visor: '#4a6ad8' },
  { dir: 'l', dur: 26, delay: -11, size: 0.16, low: 6.5, item: 'box', visor: '#45b3a7' },
  { dir: 'r', dur: 33, delay: -19, size: 0.15, low: 7.5, item: 'tablet', visor: '#9b7fe6' },
  { dir: 'l', dur: 18, delay: -7, size: 0.22, low: 1.5, item: 'clipboard', visor: '#f08a3c' },
  { dir: 'r', dur: 28, delay: -24, size: 0.18, low: 5, item: 'box', visor: '#4a6ad8' },
  { dir: 'l', dur: 37, delay: -30, size: 0.14, low: 8.5, item: 'tablet', visor: '#45b3a7' },
];

// An engineer sitting at a workstation, typing and checking the screens.
function Workstation() {
  return (
    <svg viewBox="0 0 160 110" aria-hidden="true">
      <rect x="62" y="20" width="70" height="44" rx="5" fill="#2b3550" stroke="#9aa3c7" strokeWidth="3" />
      <rect x="68" y="26" width="58" height="32" rx="2" className="ws-screen" />
      <path className="ws-graph" d="M70 50 L80 44 L88 48 L98 34 L108 40 L118 30 L124 36" />
      <rect x="92" y="64" width="10" height="12" fill="#9aa3c7" />
      <rect x="10" y="76" width="146" height="8" rx="3" fill="#c7cde6" stroke="#8a91b8" strokeWidth="2" />
      <rect x="18" y="84" width="6" height="26" fill="#8a91b8" />
      <rect x="142" y="84" width="6" height="26" fill="#8a91b8" />
      <rect x="70" y="70" width="40" height="6" rx="2" fill="#7c84a8" />
      {/* the engineer (seen from the side) */}
      <g className="ws-person">
        <rect x="16" y="88" width="34" height="8" rx="4" fill="#7c84a8" />
        <rect x="30" y="96" width="5" height="14" fill="#7c84a8" />
        <rect x="18" y="52" width="26" height="38" rx="11" fill="#fff" stroke="#9aa3c7" strokeWidth="2" />
        <g className="ws-head">
          <circle cx="32" cy="40" r="13" fill="#fff" stroke="#9aa3c7" strokeWidth="2" />
          <rect x="34" y="34" width="12" height="10" rx="5" fill="#4a6ad8" />
        </g>
        <g className="ws-arm">
          <rect x="34" y="62" width="34" height="7" rx="3.5" fill="#fff" stroke="#9aa3c7" strokeWidth="1.8" />
        </g>
      </g>
    </svg>
  );
}

// floating dust specks (lab light beams, Martian air)
const MOTES = (() => {
  const r = rng(77);
  return Array.from({ length: 16 }, () => ({ x: r() * 100, y: 15 + r() * 60, d: -r() * 12, t: 9 + r() * 8 }));
})();

function Motes({ className = '' }) {
  return (
    <div className={`motes ${className}`} aria-hidden="true">
      {MOTES.map((m, i) => (
        <i key={i} style={{ left: `${m.x}%`, top: `${m.y}%`, animationDelay: `${m.d}s`, animationDuration: `${m.t}s` }} />
      ))}
    </div>
  );
}

// ── backdrops ─────────────────────────────────────────────────────────────────
// wake = chapter 1 opening: the lab is dark until the line starts, then Oppy boots up,
// the monitor prints its start-up checks and the lamps switch on one by one.
export function LabScene({ set, revealed }) {
  const wake = set.wake ? (revealed ? ' wake-on' : ' wake-off') : '';
  return (
    <div className={`bd bd-lab${wake}`}>
      <div className="lab-wall" />
      <div className="lab-window">
        <Stars count={28} seed={4} />
        <div className="lab-window-mars">
          <MarsPlanet />
        </div>
      </div>
      <div className="lab-banner">JET PROPULSION LABORATORY · PASADENA, CALIFORNIA</div>
      <div className="lab-console" aria-hidden="true">
        <div className="lab-screen">
          {set.wake ? (
            <div className="boot-lines">
              <span>&gt; POWER ON</span>
              <span>&gt; CAMERAS ... OK</span>
              <span>&gt; WHEELS .... OK</span>
              <span>&gt; HELLO, WORLD!</span>
            </div>
          ) : (
            <svg className="lab-wave" viewBox="0 0 200 40" preserveAspectRatio="none">
              <path d="M0 20 L20 20 L26 6 L32 34 L38 20 L70 20 L76 6 L82 34 L88 20 L120 20 L126 6 L132 34 L138 20 L170 20 L176 6 L182 34 L188 20 L200 20" />
            </svg>
          )}
        </div>
        <div className="lab-leds">
          {Array.from({ length: 8 }, (_, i) => (
            <i key={i} style={{ animationDelay: `${(i * 0.37) % 1.9}s` }} />
          ))}
        </div>
      </div>
      <div className="lab-lamps">
        <i />
        <i />
        <i />
      </div>
      <div className="lab-floor">
        <svg viewBox="0 0 100 40" preserveAspectRatio="none" aria-hidden="true">
          {[-60, -30, 0, 30, 60, 90, 120, 150].map((x) => (
            <line key={x} x1={50 + (x - 45) * 0.35} y1="0" x2={x - 10} y2="40" />
          ))}
          {[8, 18, 30].map((y) => (
            <line key={y} x1="0" y1={y} x2="100" y2={y} />
          ))}
        </svg>
      </div>
      <div className="lab-workstation" aria-hidden="true">
        <Workstation />
      </div>
      {/* in the wake-up scene the people come in after the lights switch on */}
      {WALKERS.map((w, i) => ({ ...w, i })).sort((a, b) => a.size - b.size).map((w) => (
        <div
          key={w.i}
          className={`lab-walker walk-${w.dir}`}
          aria-hidden="true"
          style={{
            width: `calc(var(--rw) * ${w.size})`,
            bottom: `calc(var(--horizon) - ${w.low}vh)`,
            animationDuration: `${w.dur}s`,
            animationDelay: `${set.wake ? 4 + w.i * 2.2 : w.delay}s`,
          }}
        >
          <Engineer item={w.item} visor={w.visor} />
        </div>
      ))}
      <Motes />
      {set.wake && <div className="lab-dark" aria-hidden="true" />}
    </div>
  );
}

export function LaunchScene({ set }) {
  return (
    <div className={`bd bd-launch${set.launched ? ' is-launched' : ''}`}>
      <Stars count={130} seed={3} maxTop={70} />
      <div className="launch-glow" />
      <div className="searchlights" aria-hidden="true">
        <i />
        <i />
      </div>
      <div className="launch-sea" />
      <div className="launch-ground" />
      <svg className="launch-tower" viewBox="0 0 60 300" preserveAspectRatio="none" aria-hidden="true">
        <rect x="8" y="10" width="44" height="290" fill="none" stroke="#e05a4f" strokeWidth="5" />
        {Array.from({ length: 14 }).map((_, i) => (
          <path key={i} d={`M8 ${10 + i * 20} L52 ${30 + i * 20} M52 ${10 + i * 20} L8 ${30 + i * 20}`} stroke="#e05a4f" strokeWidth="2.5" />
        ))}
        <rect x="52" y="60" width="10" height="6" fill="#e05a4f" />
        <rect x="52" y="140" width="10" height="6" fill="#e05a4f" />
        <circle cx="30" cy="7" r="5" className="tower-light" />
      </svg>
      <div className="launch-flash" />
    </div>
  );
}

const P0 = { x: 15, y: 58 };
const P1 = { x: 46, y: 4 };
const P2 = { x: 82, y: 30 };
function bezier(t) {
  const u = 1 - t;
  return {
    x: u * u * P0.x + 2 * u * t * P1.x + t * t * P2.x,
    y: u * u * P0.y + 2 * u * t * P1.y + t * t * P2.y,
  };
}

export function SpaceScene({ set }) {
  const p = useTween(set.progress ?? 0, 2200, 0);
  const pt = bezier(p);
  // during the dodge-the-rocks mini-game only the stars stay; the game draws everything else
  if (set.game) {
    return (
      <div className="bd bd-space">
        <Stars count={170} seed={11} />
      </div>
    );
  }
  return (
    <div className="bd bd-space">
      <Stars count={170} seed={11} />
      <div className="comet" aria-hidden="true" />
      <svg className="space-path" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        <path d={`M${P0.x} ${P0.y} Q${P1.x} ${P1.y} ${P2.x} ${P2.y}`} />
      </svg>
      <div className={`planet planet-earth${set.lookBack ? ' is-home' : ''}`} style={{ left: `${P0.x}%`, top: `${P0.y}%` }}>
        <EarthPlanet />
        <span className="planet-label">{set.lookBack ? 'Earth · home ♥' : 'Earth'}</span>
      </div>
      <div className="planet planet-mars" style={{ left: `${P2.x}%`, top: `${P2.y}%` }}>
        <MarsPlanet />
        <span className="planet-label">Mars</span>
        {set.spirit && <span className="spirit-ping">Spirit landed! ✓</span>}
      </div>
      <div className={`cruiser${set.lookBack ? ' is-looking-back' : ''}`} style={{ left: `${pt.x}%`, top: `${pt.y}%` }}>
        <div className="cruiser-body">
          <Cruiser mood={set.lookBack ? 'sad' : 'happy'} />
        </div>
        {set.correction && <span className="thruster" />}
        {set.lookBack && (
          <div className="memory-bubble" aria-hidden="true">
            <i className="mb-dot d1" />
            <i className="mb-dot d2" />
            <div className="mb-cloud">
              <span className="mb-title">JPL · my team</span>
              <div className="mb-team">
                <Engineer wave />
                <Engineer wave />
                <Engineer wave />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function EntryScene({ set }) {
  return (
    <div className={`bd bd-entry phase-${set.phase}`}>
      <Stars count={60} seed={5} maxTop={40} />
      <div className="entry-ground" />
      {set.phase === 'entry' && <div className="entry-trail" />}
      {set.phase === 'bounce' && (
        <>
          <div className="chute">
            <svg viewBox="0 0 120 150" aria-hidden="true">
              <path d="M6 50 Q60 -20 114 50 Q96 40 78 50 Q60 40 42 50 Q24 40 6 50Z" fill="#fff" stroke="#c9bfa8" strokeWidth="2" />
              <path d="M42 50 Q60 40 78 50 Q72 10 60 6 Q48 10 42 50Z" fill="#f08a3c" />
              <path d="M6 50 L52 120 M114 50 L68 120 M42 50 L56 120 M78 50 L64 120" stroke="#cfd3e6" strokeWidth="1.5" />
              <path d="M44 120 L76 120 L70 142 L50 142Z" fill="#e8ebf6" stroke="#8a91b8" strokeWidth="2" />
            </svg>
          </div>
          <div className="airball-track">
            <div className="airball">
              <svg viewBox="0 0 100 100" aria-hidden="true">
                {[[50, 28], [28, 46], [72, 46], [38, 70], [62, 70], [50, 50]].map(([x, y], i) => (
                  <circle key={i} cx={x} cy={y} r="22" fill="#f6f1e8" stroke="#c9bfa8" strokeWidth="2.5" />
                ))}
                <circle cx="44" cy="48" r="3" fill="#1d2147" />
                <circle cx="56" cy="48" r="3" fill="#1d2147" />
                <ellipse cx="50" cy="58" rx="4" ry="3" fill="#1d2147" />
              </svg>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

const HILLS = {
  far: 'M0 200 L0 120 C150 84 300 138 450 110 S750 72 900 112 S1250 88 1400 118 S1550 98 1600 108 L1600 200 Z',
  near: 'M0 200 L0 150 C200 128 380 168 600 150 S1000 132 1200 152 S1480 140 1600 150 L1600 200 Z',
  eagle: 'M0 200 L0 30 C220 52 380 150 620 176 L980 176 C1220 150 1380 52 1600 30 L1600 200 Z',
  rim: 'M0 200 L0 132 C180 110 380 96 600 104 S980 54 1200 84 S1480 114 1600 104 L1600 200 Z',
  valley: 'M0 200 L0 10 C320 52 600 168 800 180 C1000 168 1280 52 1600 10 L1600 200 Z',
};

function Pebbles({ seed = 2 }) {
  const items = useMemo(() => {
    const r = rng(seed);
    return Array.from({ length: 46 }, () => ({ x: r() * 1000, y: 30 + r() * 360, rx: 3 + r() * 9, ry: 2 + r() * 4 }));
  }, [seed]);
  return (
    <svg className="pebbles" viewBox="0 0 1000 400" preserveAspectRatio="none" aria-hidden="true">
      {items.map((p, i) => (
        <ellipse key={i} cx={p.x} cy={p.y} rx={p.rx * (0.5 + p.y / 400)} ry={p.ry * (0.5 + p.y / 400)} />
      ))}
    </svg>
  );
}

export function MarsScene({ set }) {
  const sky = set.sky || 'day';
  const terrain = set.terrain || 'plains';
  const dusty = sky === 'storm' || sky === 'dark' || sky === 'dusty';
  const night = sky === 'night';
  const calmDay = sky === 'day' || sky === 'winter';
  return (
    <div className={`bd bd-mars sky-${sky} terrain-${terrain}${set.storm ? ' has-storm' : ''}`}>
      <div className="mars-sky" />
      {(sky === 'dark' || night) && <Stars count={night ? 110 : 36} seed={9} maxTop={night ? 60 : 45} className="mars-stars" />}
      {night && (
        <>
          {/* Earth seen from Mars: a bright bluish "star" low in the sky before sunrise */}
          <div className="earth-star" aria-hidden="true">
            <i />
            <span>
              Earth · home <small>Trái Đất · quê nhà</small>
            </span>
          </div>
          {/* Phobos crosses the Martian sky fast enough to watch it move */}
          <div className="phobos" aria-hidden="true" />
          <div className="shooting-star mars-shoot" aria-hidden="true" />
        </>
      )}
      <div className="mars-sun" />
      {calmDay && (
        <div className="mars-clouds" aria-hidden="true">
          <i />
          <i />
          <i />
        </div>
      )}
      <svg className="mars-hills hills-far" viewBox="0 0 1600 200" preserveAspectRatio="none" aria-hidden="true">
        <path d={terrain === 'rim' ? HILLS.rim : HILLS.far} />
      </svg>
      {calmDay && terrain !== 'eagle' && (
        <div className="far-devil" aria-hidden="true">
          <DustDevil />
        </div>
      )}
      {(terrain === 'eagle' || terrain === 'valley') && (
        <svg className="mars-hills hills-walls" viewBox="0 0 1600 200" preserveAspectRatio="none" aria-hidden="true">
          <path d={HILLS[terrain]} />
        </svg>
      )}
      {set.storm && (
        <div className="dust-wall" aria-hidden="true">
          {Array.from({ length: 9 }, (_, i) => (
            <i key={i} style={{ left: `${i * 12 - 4}%`, animationDelay: `${-i * 0.7}s` }} />
          ))}
        </div>
      )}
      <svg className="mars-hills hills-near" viewBox="0 0 1600 200" preserveAspectRatio="none" aria-hidden="true">
        <path d={HILLS.near} />
      </svg>
      <div className="mars-ground">
        <Pebbles seed={terrain.length * 7} />
      </div>
      {set.cutaway && <div className="cut-face" aria-hidden="true" />}
      {dusty && <div className="dust-layer" />}
      {set.storm && (
        <div className="wind-streaks" aria-hidden="true">
          {STREAKS.map((w, i) => (
            <i key={i} style={{ top: `${w.y}%`, width: `${w.w}vw`, animationDelay: `${w.d}s`, animationDuration: `${w.t}s` }} />
          ))}
        </div>
      )}
      {!set.storm && !night && <Motes className="mars-motes" />}
      {set.wind && (
        <div className="wind-sweep" aria-hidden="true">
          <DustDevil />
        </div>
      )}
    </div>
  );
}

const STREAKS = (() => {
  const r = rng(31);
  return Array.from({ length: 22 }, () => ({ y: 8 + r() * 80, w: 8 + r() * 22, d: -r() * 2, t: 0.7 + r() * 0.9 }));
})();

const ROUTE = ['eagle', 'endurance', 'victoria', 'road', 'endeavour'];

export function MapScene({ set }) {
  const many = useMemo(() => {
    const r = rng(42);
    return Array.from({ length: 70 }, () => ({ x: 4 + r() * 92, y: 30 + r() * 62, s: 0.5 + r() * 2.2, d: r() * 1.4 }));
  }, []);
  const doneIdx = ROUTE.indexOf(set.at ?? 'eagle');
  const pts = ROUTE.map((k) => MAP_POINTS[k]);
  const toPoly = (list) => list.map((p) => `${p.x},${100 - p.y}`).join(' ');
  return (
    <div className="bd bd-map">
      <div className="map-paper" />
      <div className="map-title">
        Meridiani Planum <span>· seen from orbit (not to scale)</span>
      </div>
      <div className="map-compass">N ↑</div>
      <svg className="map-path" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        <polyline points={toPoly(pts)} className="route-todo" />
        <polyline points={toPoly(pts.slice(0, Math.max(1, doneIdx + 1)))} className="route-done" />
      </svg>
      {set.many &&
        many.map((c, i) => (
          <i
            key={i}
            className="mini-crater"
            style={{ left: `${c.x}%`, bottom: `${c.y}%`, width: `${c.s}vmin`, height: `${c.s}vmin`, animationDelay: `${c.d}s` }}
          />
        ))}
    </div>
  );
}

export function FinaleScene({ set }) {
  return (
    <div className="bd bd-finale">
      <Stars count={230} seed={21} maxTop={75} />
      <div className="milky" />
      <div className="earth-dot">
        <i />
        <span>Earth</span>
      </div>
      {set.shooting && <div className="shooting-star" />}
      <svg className="mars-hills hills-night" viewBox="0 0 1600 200" preserveAspectRatio="none" aria-hidden="true">
        <path d={HILLS.valley} />
      </svg>
      <div className="finale-ground" />
    </div>
  );
}

export const SCENES = {
  lab: LabScene,
  launch: LaunchScene,
  space: SpaceScene,
  entry: EntryScene,
  mars: MarsScene,
  map: MapScene,
  finale: FinaleScene,
};
