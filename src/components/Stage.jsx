import { useEffect, useMemo, useRef, useState } from 'react';
import Rover from '../art/Rover.jsx';
import { SCENES } from '../art/Scenes.jsx';
import * as Art from '../art/Objects.jsx';
import { CALL_MESSAGES, MAP_POINTS } from '../data/story.js';
import { photos } from '../data/photos.js';
import { ENTRY, roverPos, useRoverDrive } from '../hooks/useRoverDrive.js';
import CruiseGame from './CruiseGame.jsx';
import LandingGame from './LandingGame.jsx';
import PovView from './PovView.jsx';
import { sound } from '../audio/sound.js';

// Where each explorable part sits on the rover drawing (% of its box).
const SPOTS = {
  mast: { x: 62.8, y: 34, label: 'Camera mast' },
  panels: { x: 33, y: 50, label: 'Solar panels' },
  arm: { x: 72, y: 76, label: 'Robotic arm' },
  wheels: { x: 19.4, y: 88, label: 'Wheels' },
};

// Little things Oppy does while standing still and talking (so it never looks frozen).
// Each mood has its own set; CSS classes .fidget-<name> animate parts of the drawing.
const FIDGETS = {
  normal: ['look', 'tilt', 'dish', 'wave'],
  happy: ['hop', 'wave', 'wiggle', 'look', 'dish'],
  proud: ['hop', 'wave', 'look', 'dish'],
  excited: ['hop', 'wiggle', 'wave', 'hop'],
  curious: ['look', 'tilt', 'dish', 'wiggle'],
  determined: ['look', 'wiggle', 'dish'],
  confused: ['tilt', 'look'],
  sad: ['sigh', 'look'],
  worried: ['shiver', 'look'],
  scared: ['flinch', 'look'],
  sleepy: ['yawn', 'nod'],
  tired: ['yawn', 'sigh'],
};
const FIDGET_MS = { hop: 950, wave: 2300, wiggle: 1200, look: 2600, dish: 2600, tilt: 1900, sigh: 2800, shiver: 1100, flinch: 900, yawn: 2300, nod: 2100 };

function useFidget(active, mood, armOut) {
  const [fidget, setFidget] = useState(null);
  useEffect(() => {
    setFidget(null);
    const pool = (FIDGETS[mood] || []).filter((f) => !(armOut && f === 'wave'));
    if (!active || !pool.length) return undefined;
    let t = 0;
    let prev = null;
    const next = (delay) => {
      t = setTimeout(() => {
        let f = pool[Math.floor(Math.random() * pool.length)];
        if (f === prev && pool.length > 1) f = pool[(pool.indexOf(f) + 1) % pool.length];
        prev = f;
        setFidget(f);
        t = setTimeout(() => {
          setFidget(null);
          next(2400 + Math.random() * 3400);
        }, FIDGET_MS[f]);
      }, delay);
    };
    next(1300 + Math.random() * 1500);
    return () => clearTimeout(t);
  }, [active, mood, armOut]);
  return fidget;
}

const SPRAY = Array.from({ length: 12 }, (_, i) => i);

function ObjectArt({ obj, frame }) {
  switch (obj.type) {
    case 'twin':
      return (
        <>
          <Rover variant="twin" mood="happy" />
          <span className="name-tag">Spirit</span>
        </>
      );
    case 'rocket':
      return <Art.Rocket launched={frame.set.launched} igniting={frame.set.igniting} />;
    case 'capsule':
      return <Art.Capsule />;
    case 'lander':
      return <Art.Lander />;
    case 'outcrop':
      return <Art.Outcrop />;
    case 'blueberries':
      return <Art.Blueberries />;
    case 'backshell':
      return <Art.Backshell />;
    case 'heatshield':
      return <Art.HeatShield />;
    case 'meteorite':
      return <Art.Meteorite />;
    case 'vein':
      return <Art.Vein />;
    case 'clay':
      return <Art.ClayRock />;
    case 'dustdevil':
      return <Art.DustDevil />;
    case 'finish':
      return <Art.FinishLine />;
    case 'bowl':
      return <Art.Bowl variant={obj.variant} depth={obj.depth} rise={obj.rise} />;
    case 'pit':
      return <Art.PitBack />;
    case 'farRim':
      return (
        <>
          <Art.FarRim />
          <span className="far-rim-label">
            Far rim of Endeavour · 22 km away <small>Vành bên kia · cách 22 km</small>
          </span>
        </>
      );
    case 'sign':
      return <Art.Signpost label={obj.label} />;
    case 'dune':
      return <Art.Dune />;
    case 'craterField':
      return <CraterField />;
    case 'crater':
      return (
        <>
          <i className={`crater-hole${obj.scalloped ? ' scalloped' : ''}`} />
          <span className="crater-label">{obj.label}</span>
        </>
      );
    case 'spiritNote':
      return (
        <div className="spirit-note">
          <b>Spirit</b>
          <span>Gusev crater · other side of Mars</span>
          <em>Stuck in sand · May 2009</em>
          <em>Last signal · Mar 22, 2010</em>
          <em>NASA kept calling until May 2011</em>
        </div>
      );
    default:
      return null;
  }
}

// "More than 100 craters": little craters popping up all over the plain, smaller further away.
const FIELD = (() => {
  let seed = 7;
  const r = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
  return Array.from({ length: 46 }, (_, i) => {
    const depth = r(); // 0 = near (at Oppy's ground line) → 1 = far (horizon)
    return { x: 3 + r() * 94, y: depth * 92, s: 1.6 + (1 - depth) * 7.5 * (0.55 + r() * 0.8), d: (i % 12) * 0.12 };
  });
})();

function CraterField() {
  return (
    <div className="crater-field" aria-hidden="true">
      {FIELD.map((c, i) => (
        <i key={i} style={{ left: `${c.x}%`, bottom: `${c.y}%`, width: `${c.s}vmin`, animationDelay: `${c.d}s` }} />
      ))}
    </div>
  );
}

// Small "seen from orbit" map in the corner of the crater chapter (not to scale).
const MINI = { eagle: [12, 50], endurance: [22, 43], purgatory: [31, 39], victoria: [40, 34], road: [56, 29], endeavour: [70, 27] };
const MINI_ROUTE = ['eagle', 'endurance', 'purgatory', 'victoria', 'road', 'endeavour'];
function MiniMap({ at = 'eagle', many }) {
  const done = Math.max(0, MINI_ROUTE.indexOf(at));
  const pts = MINI_ROUTE.map((k) => MINI[k].join(',')).join(' ');
  const donePts = MINI_ROUTE.slice(0, done + 1).map((k) => MINI[k].join(',')).join(' ');
  const [rx, ry] = MINI[at] || MINI.eagle;
  return (
    <div className="minimap" aria-hidden="true">
      <svg viewBox="0 0 100 62">
        <rect width="100" height="62" rx="6" className="mm-paper" />
        <circle cx="98" cy="22" r="27" className="mm-crater big" />
        <circle cx="40" cy="34" r="5" className="mm-crater" />
        <circle cx="22" cy="43" r="2.6" className="mm-crater" />
        <circle cx="12" cy="50" r="1.4" className="mm-crater" />
        {many && FIELD.slice(0, 30).map((c, i) => <circle key={i} cx={4 + (c.x * 0.9)} cy={6 + (c.y * 0.55)} r="0.9" className="mm-crater dot" />)}
        <polyline points={pts} className="mm-route" />
        <polyline points={donePts} className="mm-route done" />
        <circle cx={rx} cy={ry} r="4.5" className="mm-you-pulse" />
        <circle cx={rx} cy={ry} r="2.4" className="mm-you" />
        <text x="22" y="56" className="mm-label">Endurance</text>
        <text x="40" y="26" className="mm-label">Victoria</text>
        <text x="80" y="57" className="mm-label">Endeavour</text>
      </svg>
      <span>Oppy's route · seen from orbit</span>
    </div>
  );
}

function objectStyle(o) {
  if (o.type === 'bowl') {
    return {
      left: `${o.x}%`,
      width: `${o.span}%`,
      bottom: `calc(var(--ground) - var(--rw) * ${o.depth})`,
      height: `calc(var(--rw) * ${o.depth + o.rise})`,
    };
  }
  if (o.type === 'craterField') return {};
  // round crater in perspective: 1.1 rover-widths tall, the ground line 0.15 from its top
  if (o.type === 'pit') {
    return { left: `${o.x}%`, width: `${o.span}%`, bottom: 'calc(var(--ground) - var(--rw) * 0.95)', height: 'calc(var(--rw) * 1.1)' };
  }
  if (o.type === 'dune') return { left: `${o.x}%`, bottom: 'calc(var(--ground) - var(--rw) * 0.1)', width: `calc(var(--rw) * ${o.w})` };
  const bottom = o.y === 'horizon' ? 'calc(var(--horizon) - 1.5vh)' : o.y != null ? `${o.y}%` : 'var(--ground)';
  const style = { left: `${o.x}%`, bottom };
  if (o.type === 'crater') {
    style.width = `${o.size}vmin`;
    style.height = `${o.size}vmin`;
  } else if (o.w) {
    style.width = `calc(var(--rw) * ${o.w})`;
  }
  return style;
}

function MapRover({ at, mood }) {
  const p = MAP_POINTS[at] || MAP_POINTS.eagle;
  const sad = mood === 'sad';
  return (
    <div className="map-rover" style={{ left: `${p.x}%`, bottom: `${p.y}%` }} aria-hidden="true">
      <svg viewBox="0 0 60 60">
        <circle cx="30" cy="30" r="26" fill="#eef0fa" stroke="#f08a3c" strokeWidth="4" />
        <circle cx="21" cy="28" r="6" fill="#2b2f45" />
        <circle cx="39" cy="28" r="6" fill="#2b2f45" />
        <circle cx="19" cy="26" r="2" fill="#fff" />
        <circle cx="37" cy="26" r="2" fill="#fff" />
        <path d={sad ? 'M23 44 q7 -6 14 0' : 'M23 40 q7 6 14 0'} stroke="#2b2f45" strokeWidth="3" fill="none" strokeLinecap="round" />
      </svg>
      <span>Oppy</span>
    </div>
  );
}

function StatsPanel({ kind }) {
  if (kind === 'compare') {
    return (
      <div className="stats-panel" key="compare">
        <div className="stat">
          <small>Planned · Dự kiến</small>
          <b>90 days</b>
          <span className="stat-arrow">→</span>
          <b className="big">~15 years</b>
          <small>Actual · Thực tế</small>
        </div>
        <div className="stat">
          <small>Planned · Dự kiến</small>
          <b>1 km</b>
          <span className="stat-arrow">→</span>
          <b className="big">45.16 km</b>
          <small>Actual · Thực tế</small>
        </div>
      </div>
    );
  }
  if (kind === 'discoveries') {
    const items = [
      ['🫐', 'Hematite "blueberries"', '"Việt quất" hematit'],
      ['🪨', 'Iron-nickel meteorite', 'Thiên thạch sắt-niken'],
      ['💧', 'Gypsum veins', 'Mạch thạch cao'],
      ['🧪', 'Neutral-water clays', 'Đất sét nước trung tính'],
      ['🕳️', '100+ craters', 'Hơn 100 miệng hố'],
      ['🦠', 'Once friendly for microbes', 'Từng thuận lợi cho vi sinh vật'],
    ];
    return (
      <div className="stats-panel chips" key="disc">
        {items.map(([icon, en, vi], i) => (
          <div className="chip" key={en} style={{ animationDelay: `${i * 0.15}s` }}>
            <span className="chip-icon">{icon}</span>
            <b>{en}</b>
            <small>{vi}</small>
          </div>
        ))}
      </div>
    );
  }
  if (kind === 'record') {
    return (
      <div className="stats-panel record" key="record">
        <span className="trophy">🏆</span>
        <div>
          <b>Longest drive on another world</b>
          <small>Kỷ lục quãng đường dài nhất ngoài Trái Đất</small>
          <p>Opportunity · 2014 → Oct 2026 · then passed by Perseverance</p>
        </div>
      </div>
    );
  }
  return null;
}

const CONFETTI = Array.from({ length: 36 }, (_, i) => i);
const CALLS = Array.from({ length: 7 }, (_, i) => i);

export default function Stage({
  frame,
  revealed,
  canAdvance,
  onAdvance,
  onTap,
  exploreItems,
  explored,
  activeExplore,
  onExplore,
  onOpenPhoto,
  onRoverClick,
  bubble,
  hold = false,
  countdown = null,
  onGameDone,
  talking = false,
  auto = false,
}) {
  const { rover, set, chapter } = frame;
  const Scene = SCENES[frame.scene] || SCENES.mars;
  const gate = frame.beat.gate;
  const tapTarget = gate?.tap;

  // Rover position is animated by useRoverDrive (rolling wheels, lean, dust).
  // `hold` keeps Oppy parked off-screen until its chapter entrance drive starts.
  const wrapRef = useRef(null);
  const fxRef = useRef(null);
  const { moving, faceLeft } = useRoverDrive({
    wrapRef,
    fxRef,
    target: hold ? { ...ENTRY, snap: true } : roverPos(rover),
    mountKey: frame.ci,
    present: !rover.hidden,
    dusty: frame.scene === 'mars',
    onDrive: (plan) => sound.sfx.drive(plan, frame.scene === 'mars', !!rover.reach),
  });

  const objects = useMemo(
    () => (chapter.objects || []).filter((o) => frame.show.includes(o.id)),
    [chapter, frame.show],
  );

  const active = activeExplore?.id;
  const photoKey = frame.beat.photo;
  const photo = photoKey ? photos[photoKey] : null;
  const showArrow = revealed && canAdvance && !moving;
  const roverIsTarget = revealed && tapTarget === 'rover';
  const stuck = !!rover.stuck && !moving;
  // 'waking' eyes start closed and open when the line starts (after the chapter card / drive)
  const mood = rover.mood === 'waking' && !revealed ? 'sleep' : rover.mood;
  const fidget = useFidget(revealed && !moving && !rover.hidden && !active && !stuck && !gate?.game, mood, !!rover.arm);

  // ── sound effects tied to what happens on stage ──
  // ("bip bip" when Oppy pulls up to a rock is part of the drive sound: sound.sfx.drive)
  const armOut = !!rover.arm && !moving;
  useEffect(() => {
    if (armOut) sound.sfx.servo(0.5); // the arm unfolds just after Oppy stops
  }, [armOut]);
  useEffect(() => {
    sound.loop('stuck', stuck && revealed ? 0.05 : 0);
  }, [stuck, revealed]);
  const stormy = frame.scene === 'mars' && !!set.storm;
  useEffect(() => {
    sound.loop('wind', stormy ? 0.2 : 0);
  }, [stormy]);
  useEffect(() => {
    sound.loop('radio', set.calls ? 0.09 : 0);
  }, [set.calls]);
  useEffect(() => {
    if (!revealed) return;
    if (set.beam) sound.sfx.transmit();
    if (set.glitch) sound.sfx.glitch();
    if (set.confetti) sound.sfx.party();
    if (set.wind) sound.sfx.gust();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [revealed, frame.key]);
  useEffect(() => {
    if (frame.beat.enter === 'drive') sound.sfx.whoosh(0.06);
  }, [frame.key, frame.beat.enter]);
  // leaving the story (end screen): stop the loops
  useEffect(
    () => () => {
      ['stuck', 'wind', 'radio'].forEach((n) => sound.loop(n, 0));
    },
    [],
  );

  // movie camera for this beat: zoom towards Oppy (or a point), letterbox bars, shaking
  const cine = frame.beat.cine || null;
  const zoom = cine?.zoom || 1;
  const focus = Array.isArray(cine?.focus) ? cine.focus : null;
  const camStyle = {
    scale: String(zoom),
    transformOrigin: focus ? `${focus[0]}% ${focus[1]}%` : `${rover.x ?? 50}% calc(100% - var(--ground) - var(--rw) * 0.4)`,
  };

  return (
    <div className={`stage scene-${frame.scene}${set.deepGround ? ' deep-ground' : ''}`}>
      <div className={`camera${cine?.shake ? ' is-shaking' : ''}`} style={camStyle}>
      <Scene set={set} revealed={revealed} />

      {objects.map((o) => {
        if (o.type === 'mapRover') return <MapRover key={o.id} at={set.at} mood={rover.mood} />;
        const isTarget = revealed && tapTarget === o.id;
        const cls = `obj obj-${o.type}${o.center ? ' is-center' : ''}${o.anchorLeft ? ' is-left' : ''}${isTarget ? ' is-target' : ''}`;
        if (isTarget) {
          return (
            <button key={o.id} type="button" className={cls} style={objectStyle(o)} onClick={() => onTap(o.id)} aria-label={gate.hint?.en || `Tap ${o.id}`}>
              <ObjectArt obj={o} frame={frame} />
              <span className="tap-hint">👆 Tap!</span>
            </button>
          );
        }
        return (
          <div key={o.id} className={cls} style={objectStyle(o)}>
            <ObjectArt obj={o} frame={frame} />
          </div>
        );
      })}
      {/* the near rim of a round crater is drawn in front of Oppy (hides the wheels inside) */}
      {objects
        .filter((o) => o.type === 'pit')
        .map((o) => (
          <div key={`${o.id}-front`} className="obj obj-pit-front" style={objectStyle(o)} aria-hidden="true">
            <Art.PitFront />
          </div>
        ))}

      <div className="drive-fx" ref={fxRef} aria-hidden="true" />

      {!rover.hidden && (
        <div
          key={`rover-${frame.ci}`}
          ref={wrapRef}
          className={`rover-wrap${moving ? ' is-driving' : ''}${faceLeft ? ' face-left' : ''}${set.glitch ? ' is-glitch' : ''}${roverIsTarget ? ' is-target' : ''}${rover.x > 72 ? ' near-right' : ''}`}
        >
          <button type="button" className="rover-hit" onClick={onRoverClick} aria-label={roverIsTarget ? gate.hint?.en : 'Oppy'}>
            <Rover
              mood={mood}
              arm={(rover.arm && !moving) || active === 'arm'}
              driving={active === 'wheels' || stuck}
              dusty={rover.dusty}
              look={active === 'mast' ? 'up' : rover.look}
              power={frame.hud.power}
              highlight={active}
              talking={talking && revealed}
              fidget={fidget}
            />
          </button>
          {stuck && (
            <div className="sand-spray" aria-hidden="true">
              {SPRAY.map((i) => (
                <i key={i} style={{ left: `${[12, 40, 68][i % 3]}%`, animationDelay: `${(i * 0.13) % 0.8}s`, '--dx': `${-30 - (i % 4) * 14}px`, '--dy': `${-26 - (i % 5) * 9}px` }} />
              ))}
            </div>
          )}

          {revealed &&
            exploreItems?.map((item) => {
              const spot = SPOTS[item.id];
              const done = explored.includes(item.id);
              return (
                <button
                  key={item.id}
                  type="button"
                  className={`spot${done ? ' is-done' : ''}${active === item.id ? ' is-active' : ''}`}
                  style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onExplore(item);
                  }}
                  aria-label={spot.label}
                >
                  <span className="spot-label">{spot.label}</span>
                </button>
              );
            })}

          {roverIsTarget && <span className="tap-hint rover-hint">👆 Tap me!</span>}
          {bubble && <span className="bubble" key={bubble.id}>{bubble.text}</span>}
          {set.beam && (
            <div className="beam" aria-hidden="true">
              <i />
              <i />
              <i />
            </div>
          )}
          {set.signal === 'broken' && (
            <div className="signal-broken" aria-hidden="true">
              <i />
              <i />
              <b>✕</b>
            </div>
          )}
          {showArrow && (
            <button type="button" className="next-arrow" onClick={onAdvance} aria-label="Next">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M5 12h12M12 5l7 7-7 7" />
              </svg>
            </button>
          )}
        </div>
      )}
      </div>

      {set.storm && frame.scene === 'mars' && <div className="storm-front" aria-hidden="true" />}
      {frame.beat.pov && revealed && <PovView key={`pov-${frame.key}`} mode={frame.beat.pov === 'wake' ? 'wake' : 'sleep'} />}
      <div className={`cine-bars${cine?.bars ? ' on' : ''}`} aria-hidden="true" />
      {frame.beat.enter === 'drive' && <div key={`cut-${frame.key}`} className="scene-cut" aria-hidden="true" />}
      {set.minimap && <MiniMap at={set.at} many={set.many} />}

      {gate?.game === 'cruise' && revealed && <CruiseGame key={frame.key} auto={auto} onDone={onGameDone} onAdvance={onAdvance} />}
      {gate?.game === 'landing' && revealed && <LandingGame key={frame.key} auto={auto} onDone={onGameDone} onAdvance={onAdvance} />}

      {rover.hidden && showArrow && !gate?.game && (
        <button type="button" className="next-arrow is-floating" onClick={onAdvance} aria-label="Next">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M5 12h12M12 5l7 7-7 7" />
          </svg>
        </button>
      )}

      {countdown != null && (
        <div key={`count-${countdown}`} className={`countdown${countdown === 0 ? ' is-go' : ''}`} aria-hidden="true">
          {countdown > 0 ? countdown : 'LIFTOFF!'}
        </div>
      )}

      {set.calls && (
        <div className="calls" aria-hidden="true">
          {CALLS.map((i) => (
            <i key={i} style={{ left: `${18 + i * 4}%`, animationDelay: `${i * 0.7}s` }} />
          ))}
          {/* messages from Earth: 6 places around Oppy, 2 messages take turns in each (16 s loop) */}
          {CALL_MESSAGES.map((m, i) => (
            <p key={m.en} className={`call-msg s${i % 6}`} style={{ animationDelay: `${(i % 6) * 1.3 + (i >= 6 ? 8 : 0)}s` }}>
              <span className="call-from">📡 Earth · Trái Đất</span>
              <b>{m.en}</b>
              <small>{m.vi}</small>
            </p>
          ))}
        </div>
      )}

      {set.confetti && (
        <div className="confetti" aria-hidden="true">
          {CONFETTI.map((i) => (
            <i key={i} style={{ left: `${(i * 37) % 100}%`, animationDelay: `${(i % 9) * 0.18}s`, '--hue': `${(i * 47) % 360}` }} />
          ))}
        </div>
      )}

      {frame.scene === 'finale' && set.stats && <StatsPanel kind={set.stats} />}

      {photo && revealed && (
        <button type="button" key={photoKey} className="polaroid" onClick={() => onOpenPhoto(photoKey)}>
          <img src={photo.src} alt={photo.title.en} loading="lazy" />
          <span className="polaroid-title">{photo.title.en}</span>
          <em>📷 Real NASA photo · tap to enlarge</em>
        </button>
      )}
    </div>
  );
}
