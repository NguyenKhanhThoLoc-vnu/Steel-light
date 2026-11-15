import { useEffect, useRef, useState } from 'react';
import { Stars } from '../art/Scenes.jsx';
import { useAutoTimer } from '../hooks/useAutoTimer.js';
import { sound } from '../audio/sound.js';

// Mini-game for the landing ("six minutes of terror"):
//   step 1: open the parachute while the altimeter is in the green zone (around 9 km up)
//   step 2: fire the rockets + inflate the airbags in the second zone, just above the ground
// Too early or too late → crash (cartoon "CRUNCH!") → try again. Only a good landing
// (or Skip) unlocks the Next button. Click / tap anywhere, or press Space.

const ALT0 = 26000; // m, where the game starts
const CHUTE_ZONE = [7000, 11000];
const BAGS_ZONE = [100, 400];
const FORGOT_ALT = 1500; // no parachute by now → too late
const CUT_ALT = 12; // bridle cut: the airbag ball drops the last few meters

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
// altimeter scale (square root: room for both zones on one bar)
const meter = (alt) => Math.sqrt(clamp(alt, 0, ALT0) / ALT0);
// how far below us the ground is drawn (log scale)
const near = (alt) => clamp((Math.log10(alt + 30) - Math.log10(30)) / (Math.log10(ALT0 + 30) - Math.log10(30)), 0, 1);
const fmtAlt = (alt) => (alt >= 1000 ? `${(alt / 1000).toFixed(1)} km` : `${Math.max(0, Math.round(alt))} m`);
// 0 = perfect middle of the zone, 1 = at its edge
const offCenter = (alt, [lo, hi]) => Math.abs(alt - (lo + hi) / 2) / ((hi - lo) / 2);

const FAILS = {
  early: {
    en: 'Too early! I was still falling too fast, and the parachute ripped.',
    vi: 'Sớm quá! Tôi còn rơi quá nhanh nên chiếc dù bị rách.',
  },
  late: {
    en: 'Too late! The parachute opened too close to the ground. No time to slow down.',
    vi: 'Muộn quá! Dù bung khi đã quá gần mặt đất, không kịp giảm tốc.',
  },
  forgot: {
    en: 'Oh no! The parachute never opened!',
    vi: 'Ôi không! Chiếc dù chưa bung!',
  },
  bagsEarly: {
    en: 'Too early! The rockets burned out high up, and I fell the rest of the way.',
    vi: 'Sớm quá! Tên lửa hãm cháy hết khi còn trên cao, và tôi rơi tự do phần còn lại.',
  },
  bagsLate: {
    en: 'Too late! No airbags to cushion me.',
    vi: 'Muộn quá! Chưa có túi khí đỡ cho tôi.',
  },
};

const STREAKS = Array.from({ length: 18 }, (_, i) => ({ x: (i * 53) % 100, d: (i * 0.37) % 1.2, w: 1 + (i % 3) }));
const CRATERS = [
  [18, 30, 9],
  [36, 62, 5],
  [62, 40, 12],
  [80, 70, 6],
  [50, 82, 4],
  [8, 76, 6],
  [92, 34, 7],
];

function Craft() {
  return (
    <svg viewBox="0 0 200 320" aria-hidden="true">
      <defs>
        <radialGradient id="lg-heat" cx="50%" cy="30%" r="70%">
          <stop offset="0" stopColor="#fff3a8" />
          <stop offset="0.4" stopColor="#ff9a3c" stopOpacity="0.9" />
          <stop offset="1" stopColor="#ff5a3c" stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* top part: parachute + backshell (flies away after the bridle is cut) */}
      <g className="lg-top">
        <g className="lg-chute">
          <g className="lg-canopy left">
            <path d="M14 70 Q100 -26 100 10 L100 62 Q76 54 58 62 Q38 54 14 70Z" fill="#fff" stroke="#c9bfa8" strokeWidth="3" />
            <path d="M58 62 Q76 54 100 62 L100 14 Q76 10 66 30Z" fill="#f08a3c" />
          </g>
          <g className="lg-canopy right">
            <path d="M186 70 Q100 -26 100 10 L100 62 Q124 54 142 62 Q162 54 186 70Z" fill="#fff" stroke="#c9bfa8" strokeWidth="3" />
            <path d="M142 62 Q124 54 100 62 L100 14 Q124 10 134 30Z" fill="#f08a3c" />
          </g>
          <path className="lg-lines" d="M14 70 L86 150 M186 70 L114 150 M58 62 L92 150 M142 62 L108 150" stroke="#cfd3e6" strokeWidth="2" fill="none" />
        </g>
        <g className="lg-flames">
          <path d="M66 196 q6 26 12 0z" fill="#ffb347" />
          <path d="M94 198 q6 30 12 0z" fill="#ffd36b" />
          <path d="M122 196 q6 26 12 0z" fill="#ffb347" />
        </g>
        <path d="M60 196 L80 150 Q100 140 120 150 L140 196 Z" fill="#eef0fa" stroke="#8a91b8" strokeWidth="3.5" />
        <g className="lg-face face-ok">
          <circle cx="91" cy="172" r="3.6" fill="#1d2147" />
          <circle cx="109" cy="172" r="3.6" fill="#1d2147" />
          <path d="M93 182 q7 5 14 0" stroke="#1d2147" strokeWidth="2.6" fill="none" strokeLinecap="round" />
        </g>
        <g className="lg-face face-scared">
          <circle cx="91" cy="171" r="4.4" fill="#1d2147" />
          <circle cx="109" cy="171" r="4.4" fill="#1d2147" />
          <ellipse cx="100" cy="184" rx="4" ry="5" fill="#1d2147" />
        </g>
        <g className="lg-face face-dizzy">
          <path d="M87 168 l8 8 M95 168 l-8 8 M105 168 l8 8 M113 168 l-8 8" stroke="#1d2147" strokeWidth="2.6" strokeLinecap="round" />
          <path d="M92 185 q4 -4 8 0 q4 4 8 0" stroke="#1d2147" strokeWidth="2.4" fill="none" strokeLinecap="round" />
        </g>
      </g>
      {/* heat shield (dropped after the parachute opens) + the glow of entry heating */}
      <g className="lg-shield">
        <ellipse className="lg-heat" cx="100" cy="222" rx="80" ry="46" fill="url(#lg-heat)" />
        <path d="M52 196 Q100 232 148 196 Z" fill="#c9773f" stroke="#8e4a22" strokeWidth="3.5" />
      </g>
      {/* the lander inside its airbags, hanging on the bridle */}
      <g className="lg-ball">
        <line x1="100" y1="196" x2="100" y2="244" stroke="#cfd3e6" strokeWidth="2.5" className="lg-bridle" />
        <g className="lg-bags">
          {[
            [100, 262],
            [76, 280],
            [124, 280],
            [86, 300],
            [114, 300],
            [100, 282],
          ].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r="22" fill="#f6f1e8" stroke="#c9bfa8" strokeWidth="2.5" />
          ))}
          <circle cx="94" cy="280" r="3" fill="#1d2147" />
          <circle cx="106" cy="280" r="3" fill="#1d2147" />
          <path d="M95 288 q5 4 10 0" stroke="#1d2147" strokeWidth="2.2" fill="none" strokeLinecap="round" />
        </g>
      </g>
    </svg>
  );
}

export default function LandingGame({ onDone, onAdvance, auto = false }) {
  const [phase, setPhase] = useState('ready'); // ready → fall → chute → bags → landed | crash → result
  const [toast, setToast] = useState(null);
  const [result, setResult] = useState(null); // { ok, stars, fail }
  const [shieldOff, setShieldOff] = useState(false);
  const areaRef = useRef(null);
  const craftRef = useRef(null);
  const groundRef = useRef(null);
  const groundTexRef = useRef(null);
  const skyRef = useRef(null);
  const starsRef = useRef(null);
  const markRef = useRef(null);
  const readRef = useRef(null);
  const streakRef = useRef(null);
  const startRef = useRef(null);
  const g = useRef({ phase: 'ready', alt: ALT0, v: 4200, t: 0, fast: 1, fail: null, chuteAt: null, bagsAt: null, endT: 0 });
  const cb = useRef({ onDone, onAdvance });
  cb.current = { onDone, onAdvance };
  const toastTimer = useRef(0);

  const say = (t, ms = 2200) => {
    clearTimeout(toastTimer.current);
    setToast(t);
    toastTimer.current = setTimeout(() => setToast(null), ms);
  };

  function go(p) {
    g.current.phase = p;
    setPhase(p);
  }

  function start() {
    Object.assign(g.current, { alt: ALT0, v: 4200, t: 0, fast: 1, fail: null, chuteAt: null, bagsAt: null, endT: 0, shieldOff: false });
    setResult(null);
    setToast(null);
    setShieldOff(false);
    sound.sfx.whoosh(0.12);
    go('fall');
  }

  function skip() {
    g.current.phase = 'done';
    cb.current.onDone();
    cb.current.onAdvance();
  }

  function fail(reason) {
    const s = g.current;
    if (s.fail) return;
    s.fail = reason;
    s.fast = reason === 'early' || reason === 'forgot' ? 3.2 : 2;
    say(FAILS[reason], 3000);
  }

  // the one button: open the parachute, then fire rockets + airbags
  function act() {
    const s = g.current;
    if (s.fail) return;
    if (s.phase === 'fall') {
      s.chuteAt = s.alt;
      sound.sfx.chutePop();
      if (s.alt > CHUTE_ZONE[1]) {
        sound.sfx.rip();
        go('ripped');
        fail('early');
      } else if (s.alt < CHUTE_ZONE[0]) {
        go('chute');
        fail('late');
      } else {
        go('chute');
        say({ en: '🪂 Parachute open! Great timing!', vi: 'Dù đã bung! Chuẩn lắm!' });
      }
    } else if (s.phase === 'chute') {
      s.bagsAt = s.alt;
      sound.sfx.inflate();
      sound.sfx.retro();
      go('bags');
      if (s.alt > BAGS_ZONE[1]) fail('bagsEarly');
      else if (s.alt < BAGS_ZONE[0]) fail('bagsLate');
      else say({ en: '🎈 Airbags + rockets! Hold on...', vi: 'Túi khí + tên lửa hãm! Bám chắc nhé...' });
    }
  }
  const actRef = useRef(act);
  actRef.current = act;

  useEffect(() => {
    startRef.current?.focus({ preventScroll: true });
    return () => clearTimeout(toastTimer.current);
  }, []);

  // keyboard: Space / Enter / ↓ = the action button
  useEffect(() => {
    const onKey = (e) => {
      const p = g.current.phase;
      if (p !== 'fall' && p !== 'chute') return;
      if (e.key === ' ' || e.key === 'Enter' || e.key === 'ArrowDown') {
        e.preventDefault();
        e.stopPropagation();
        actRef.current();
      }
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, []);

  // simulation + drawing (DOM styles only, no React re-render per frame)
  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    let frameN = 0;
    let subsH = 190;
    const tick = (now) => {
      // the subtitle box covers the bottom of the stage: land just above it
      // (0 when the subtitles are a small side bubble: then the ground can come further down)
      if (frameN++ % 30 === 0) {
        const v = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--subs-h'));
        subsH = Number.isFinite(v) ? v : 190;
      }
      const s = g.current;
      const real = Math.min(0.05, (now - last) / 1000);
      last = now;
      const dt = real * s.fast;
      const H = areaRef.current?.clientHeight || 600;

      if (s.phase === 'fall' || s.phase === 'ripped') {
        // entry: the heat shield slows us down, but we are still very fast
        s.v += -0.35 * (s.v - 1400) * dt;
        s.alt -= s.v * dt;
        if (s.phase === 'fall' && s.alt < FORGOT_ALT) fail('forgot');
      } else if (s.phase === 'chute' || s.phase === 'bags') {
        const rate = s.fail === 'late' ? Math.max(0.45 * s.alt + 45, 700) : s.fail === 'bagsEarly' ? 0.45 * s.alt + 160 : 0.45 * s.alt + 45;
        s.alt -= rate * dt;
        if (!s.shieldOff && s.phase === 'chute' && s.chuteAt - s.alt > 900 && !s.fail) {
          s.shieldOff = true;
          setShieldOff(true);
          sound.sfx.clunk(0.2);
          say({ en: 'Heat shield away! ↓', vi: 'Tách tấm chắn nhiệt! ↓' }, 1600);
        }
        if (s.phase === 'chute' && s.alt < 30 && !s.fail) fail('bagsLate');
        if (s.phase === 'bags' && !s.fail && s.alt <= CUT_ALT) {
          s.alt = CUT_ALT;
          s.endT = now;
          sound.sfx.bounce(4);
          go('landed');
        }
      }
      if (s.alt <= 0 && s.fail && s.phase !== 'crash' && s.phase !== 'result') {
        s.alt = 0;
        s.endT = now;
        sound.sfx.crash();
        go('crash');
      }
      if (s.phase === 'landed' && now - s.endT > 2600) {
        const stars = 1 + (offCenter(s.chuteAt, CHUTE_ZONE) < 0.6 ? 1 : 0) + (offCenter(s.bagsAt, BAGS_ZONE) < 0.6 ? 1 : 0);
        s.phase = 'result';
        setResult({ ok: true, stars });
        setPhase('result');
        sound.sfx.win();
        cb.current.onDone();
      }
      if (s.phase === 'crash' && now - s.endT > 1900) {
        s.phase = 'result';
        setResult({ ok: false, fail: s.fail });
        setPhase('result');
        sound.sfx.lose();
      }

      // ── draw ──
      const alt = s.phase === 'ready' ? ALT0 : s.alt;
      const k = near(alt);
      const floor = Math.max(H * 0.5, Math.min(H * 0.8, H - subsH - 26));
      const groundTop = lerp(floor, H * 0.97, k);
      const gr = groundRef.current;
      if (gr) {
        gr.style.top = `${groundTop.toFixed(1)}px`;
        gr.style.borderRadius = `50% 50% 0 0 / ${(k * 22).toFixed(2)}vmin ${(k * 22).toFixed(2)}vmin 0 0`;
      }
      if (groundTexRef.current) groundTexRef.current.style.transform = `scale(${(0.5 + (1 - k) * 2.2).toFixed(3)})`;
      if (skyRef.current) skyRef.current.style.opacity = clamp(1 - (alt - 2000) / 16000, 0, 1).toFixed(3);
      if (starsRef.current) starsRef.current.style.opacity = clamp((alt - 6000) / 14000, 0, 1).toFixed(3);

      const craft = craftRef.current;
      if (craft) {
        const ch = craft.offsetHeight || 200;
        const bags = s.phase === 'bags' || s.phase === 'landed' || (s.phase === 'crash' && s.bagsAt != null);
        const contact = bags ? 1 : 214 / 320; // ball bottom or heat-shield bottom touches the ground
        const f = Math.pow(clamp(1 - alt / 700, 0, 1), 1.6);
        const restTop = Math.max(H * 0.1, Math.min(floor - ch - 10, floor * 0.56 - ch * 0.5));
        const top = lerp(restTop, groundTop - ch * contact, f);
        const swing = s.phase === 'chute' || s.phase === 'bags' ? Math.sin(now / 520) * 5 : s.phase === 'fall' || s.phase === 'ripped' ? Math.sin(now / 60) * 1.2 : 0;
        craft.style.transform = `translate(-50%, ${top.toFixed(1)}px) rotate(${swing.toFixed(2)}deg)`;
        const heat = s.phase === 'ready' ? 1 : clamp((s.v - 1500) / 1600, 0, 1) * (s.phase === 'fall' || s.phase === 'ripped' ? 1 : 0);
        craft.style.setProperty('--heat', heat.toFixed(3));
      }
      // altimeter
      const m = meter(alt);
      if (markRef.current) {
        markRef.current.style.top = `${((1 - m) * 100).toFixed(2)}%`;
        const inChute = alt <= CHUTE_ZONE[1] && alt >= CHUTE_ZONE[0] && s.phase === 'fall';
        const inBags = alt <= BAGS_ZONE[1] && alt >= BAGS_ZONE[0] && s.phase === 'chute';
        markRef.current.classList.toggle('is-go', (inChute || inBags) && !s.fail);
      }
      if (readRef.current) readRef.current.textContent = fmtAlt(alt);
      if (streakRef.current) {
        const sp = s.phase === 'fall' || s.phase === 'ripped' || s.phase === 'ready' ? 1 : s.phase === 'chute' || s.phase === 'bags' ? 0.35 : 0;
        streakRef.current.style.opacity = (sp * (s.fail ? 1 : 0.9)).toFixed(2);
        streakRef.current.style.setProperty('--spd', `${(s.phase === 'chute' || s.phase === 'bags' ? 1.3 : 0.45).toFixed(2)}s`);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  // auto-play: skip the game if nobody presses Start; continue after a good landing / skip after a crash
  const autoReady = useAutoTimer(auto && phase === 'ready', 9, skip);
  const autoDone = useAutoTimer(auto && phase === 'result', result?.ok ? 5 : 6, () => (result?.ok ? cb.current.onAdvance() : skip()));

  const playing = phase === 'fall' || phase === 'chute';
  const rush = phase === 'fall' || phase === 'ripped' ? 0.16 : phase === 'chute' || phase === 'bags' ? 0.05 : 0;
  useEffect(() => {
    sound.loop('rush', rush);
  }, [rush]);
  useEffect(() => () => sound.loop('rush', 0), []);
  const won = phase === 'landed' || (phase === 'result' && result?.ok);
  const crashed = phase === 'crash' || (phase === 'result' && result && !result.ok);
  const bagsShown = g.current.bagsAt != null && (phase === 'bags' || won || crashed);
  const craftClass = [
    'lg-craft',
    (phase === 'ready' || phase === 'fall') && 'is-falling',
    phase === 'ripped' && 'is-ripped',
    (phase === 'chute' || phase === 'bags' || won || (crashed && g.current.chuteAt != null && g.current.fail !== 'early')) && 'chute-open',
    (shieldOff || won || (crashed && g.current.bagsAt != null)) && 'shield-off',
    bagsShown && 'bags-on',
    phase === 'bags' && g.current.fail !== 'bagsEarly' && 'rockets',
    won && 'is-landed',
    crashed && 'is-crashed',
  ]
    .filter(Boolean)
    .join(' ');
  const step = phase === 'fall' || phase === 'ripped' ? 1 : 2;
  const zoneStyle = ([lo, hi]) => ({ top: `${(1 - meter(hi)) * 100}%`, height: `${(meter(hi) - meter(lo)) * 100}%` });

  return (
    <div
      className={`landing-game phase-${phase}`}
      ref={areaRef}
      onPointerDown={(e) => {
        if (playing && !e.target.closest('button')) actRef.current();
      }}
    >
      <div className="lg-space" />
      <div className="lg-sky" ref={skyRef} />
      <div className="lg-stars" ref={starsRef}>
        <Stars count={80} seed={13} />
      </div>
      <div className="lg-streaks" ref={streakRef} aria-hidden="true">
        {STREAKS.map((st, i) => (
          <i key={i} style={{ left: `${st.x}%`, animationDelay: `${-st.d}s`, width: `${st.w}px` }} />
        ))}
      </div>
      <div className="lg-ground" ref={groundRef} aria-hidden="true">
        <div className="lg-ground-tex" ref={groundTexRef}>
          {CRATERS.map(([x, y, s], i) => (
            <i key={i} style={{ left: `${x}%`, top: `${y}%`, width: `${s}%` }} />
          ))}
        </div>
      </div>

      <div
        className={craftClass}
        ref={craftRef}
      >
        <Craft />
        {crashed && (
          <div className="lg-crunch" aria-hidden="true">
            <b>CRUNCH!</b>
            <span className="lg-dizzy">★ ✦ ★</span>
          </div>
        )}
        {(phase === 'landed' || phase === 'crash') && <div className={`lg-dust${phase === 'crash' ? ' big' : ''}`} aria-hidden="true" />}
      </div>

      {/* altimeter */}
      <div className="lg-alt" aria-hidden="true">
        <span className="lg-alt-title">Altitude · Độ cao</span>
        <div className="lg-alt-bar">
          <i className={`lg-zone chute${step === 1 ? ' is-now' : ''}`} style={zoneStyle(CHUTE_ZONE)}>
            <span>🪂</span>
          </i>
          <i className={`lg-zone bags${step === 2 ? ' is-now' : ''}`} style={zoneStyle(BAGS_ZONE)}>
            <span>🎈</span>
          </i>
          <b className="lg-alt-mark" ref={markRef}>
            <span ref={readRef}>26.0 km</span>
          </b>
        </div>
      </div>

      {(playing || phase === 'ripped' || phase === 'bags') && (
        <div className="lg-step">
          {step === 1 ? (
            <>
              Step 1/2: open the parachute in the green zone <small>Bước 1/2: bung dù khi ở vùng xanh</small>
            </>
          ) : (
            <>
              Step 2/2: airbags + rockets just above the ground <small>Bước 2/2: túi khí + tên lửa hãm sát mặt đất</small>
            </>
          )}
        </div>
      )}

      {toast && (
        <div className="lg-toast" key={toast.en}>
          {toast.en}
          <small>{toast.vi}</small>
        </div>
      )}

      {playing && (
        <button
          type="button"
          className={`lg-action${phase === 'chute' ? ' is-bags' : ''}`}
          onPointerDown={(e) => {
            e.stopPropagation();
            actRef.current();
          }}
          onClick={(e) => e.preventDefault()}
        >
          {phase === 'fall' ? (
            <>
              🪂 Open parachute! <small>Bung dù!</small>
            </>
          ) : (
            <>
              🎈 Airbags + rockets! <small>Túi khí + tên lửa!</small>
            </>
          )}
        </button>
      )}

      {phase === 'ready' && (
        <div className="cg-card-wrap">
          <div className="cg-card">
            <h3>Land me safely!</h3>
            <p className="cg-vi">Giúp tôi hạ cánh an toàn!</p>
            <ul className="cg-how">
              <li>
                🪂 Parachute in the 1st green zone (~9 km up) <small>Bung dù ở vùng xanh thứ 1 (cao ~9 km)</small>
              </li>
              <li>
                🎈 Airbags + rockets in the 2nd zone, near the ground <small>Túi khí + tên lửa ở vùng thứ 2, sát đất</small>
              </li>
              <li>
                👆 Click, tap or press Space <small>Bấm chuột, chạm hoặc phím Space</small>
              </li>
            </ul>
            <div className="cg-actions">
              <button type="button" className="cg-btn" onClick={skip}>
                Skip · Bỏ qua
              </button>
              <button type="button" className="cg-btn is-primary" onClick={start} ref={startRef}>
                ▶ Start · Bắt đầu
              </button>
            </div>
            {autoReady != null && (
              <p className="cg-auto">
                Auto mode: skipping in {autoReady}s · Chế độ tự động: bỏ qua sau {autoReady} giây
              </p>
            )}
          </div>
        </div>
      )}

      {phase === 'result' && result && (
        <div className="cg-card-wrap">
          <div className="cg-card">
            {result.ok ? (
              <>
                <div className="cg-stars" aria-label={`${result.stars} of 3 stars`}>
                  {'★'.repeat(result.stars)}
                  <span>{'★'.repeat(3 - result.stars)}</span>
                </div>
                <h3>Perfect landing!</h3>
                <p className="cg-vi">Hạ cánh thành công!</p>
                <p className="cg-score">
                  Parachute at <b>{fmtAlt(g.current.chuteAt)}</b> · airbags at <b>{fmtAlt(g.current.bagsAt)}</b>
                  <small>
                    Bung dù ở độ cao {fmtAlt(g.current.chuteAt)} · túi khí ở {fmtAlt(g.current.bagsAt)}
                  </small>
                </p>
                <p className="cg-fact">
                  💡 Real fact: on landing day nobody could steer me. My own computer did every step by itself!
                  <small>Sự thật: ngày hạ cánh không ai điều khiển được tôi. Máy tính của chính tôi tự làm mọi bước!</small>
                </p>
                <div className="cg-actions">
                  <button type="button" className="cg-btn" onClick={start}>
                    ⟲ Play again · Chơi lại
                  </button>
                  <button type="button" className="cg-btn is-primary" onClick={() => cb.current.onAdvance()}>
                    Continue · Tiếp ›{autoDone != null ? ` (${autoDone})` : ''}
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="cg-crash-icon">💥</div>
                <h3>Ouch! Crash landing</h3>
                <p className="cg-vi">Ối! Hạ cánh hỏng rồi</p>
                <p className="cg-score">
                  {FAILS[result.fail]?.en}
                  <small>{FAILS[result.fail]?.vi}</small>
                </p>
                <p className="cg-fact">
                  💡 Tip: watch the arrow on the altimeter. Press when it turns green!
                  <small>Mẹo: nhìn mũi tên trên thước đo độ cao. Bấm khi nó chuyển sang màu xanh!</small>
                </p>
                <div className="cg-actions">
                  <button type="button" className="cg-btn" onClick={skip}>
                    Skip · Bỏ qua{autoDone != null ? ` (${autoDone})` : ''}
                  </button>
                  <button type="button" className="cg-btn is-primary" onClick={start}>
                    ⟲ Try again · Thử lại
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
