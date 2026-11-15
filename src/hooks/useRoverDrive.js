import { useEffect, useLayoutEffect, useRef, useState } from 'react';

// Smooth rover driving: accelerate → cruise → brake, wheels that roll exactly as far
// as the rover travels, a springy body that leans when speeding up / braking,
// bumpy rocker-bogie wheels, plus dust puffs and wheel tracks on Mars.

export const REACH = 0.44; // arm tip offset from the rover's center, in rover widths
export const DRIVE_MIN_MS = 1500; // shortest drive (small moves)
export const DRIVE_MAX_MS = 2000; // longest drive (crossing the whole screen)
export const TURN_MS = 340; // time to turn around on the spot
export const ENTRY = { x: 0, r: -0.8, lift: 0 }; // parked just past the left edge
const RW_PCT = 27; // rough rover width in % of the stage (only used for timing)
const REVERSE_MAX = 14; // short moves to the left: back up instead of turning around
const DEG = 180 / Math.PI;
// Measurements from the Rover.jsx drawing (viewBox 320 × 262), in rover widths:
const WHEEL_R = 26 / 320;
const CONTACT_Y = 258 / 320;
const REAR_EDGE = (36 - 160) / 320; // back of the rear tire
const FRONT_EDGE = (264 - 160) / 320; // front of the front tire
const REAR_HUB = (62 - 160) / 320;
const FRONT_HUB = (238 - 160) / 320;
const ZERO = [0, 0, 0];

export function reducedMotion() {
  try {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch {
    return false;
  }
}

/**
 * Logical rover position: x in % of the stage, r in rover widths, lift in rover widths.
 * slope: [x1, x2] = the height change happens while Oppy's center is between x1 and x2
 * (e.g. driving down a crater wall); otherwise it happens early in the trip (a ramp).
 */
export function roverPos(rover) {
  return { x: rover.x ?? 50, r: rover.reach ? -REACH : 0, lift: rover.lift || 0, slope: rover.slope || null };
}

// lift as a function of (progress s, current x)
function liftPath(from, goal) {
  const sl = goal.slope || from.slope;
  const ramp = (s) => lerp(from.lift, goal.lift, liftCurve(s));
  if (!sl) return ramp;
  const [x1, x2] = sl;
  const f = (x) => smooth(Math.min(1, Math.max(0, (x - x1) / (x2 - x1))));
  const a = f(from.x);
  const b = f(goal.x);
  if (Math.abs(b - a) < 1e-6) return ramp;
  return (s, x) => from.lift + (goal.lift - from.lift) * ((f(x) - a) / (b - a));
}

/**
 * How a move from → to will be driven, and how long it takes (ms). null = no drive.
 * Driving is part of the story, so it also runs with "reduce motion" turned on
 * (only the decorative extras — dust, bumps, leaning — are dropped then).
 */
export function planDrive(from, to) {
  if (!from || !to) return null;
  const d = to.x + to.r * RW_PCT - (from.x + from.r * RW_PCT);
  const dist = Math.abs(d) + Math.abs(to.lift - from.lift) * 100;
  if (dist < 0.3) return null;
  const mode = d < -REVERSE_MAX ? 'turn' : d < 0 ? 'reverse' : 'forward';
  // distance is in % of the screen width: ~15% → 1.5 s, ~50% or more → 2 s
  const drive = Math.round(Math.min(DRIVE_MAX_MS, Math.max(DRIVE_MIN_MS, 1300 + dist * 14)));
  const turn = mode === 'turn' ? TURN_MS : 0;
  return { mode, drive, turn, total: drive + turn * 2 };
}

// Trapezoid speed profile: s = distance done (0..1), v = speed (0..1), acc = +1/0/-1.
function profile(u) {
  const A = 0.28;
  const D = 0.32;
  const vmax = 1 / (1 - A / 2 - D / 2);
  if (u <= 0) return { s: 0, v: 0, acc: 1 };
  if (u < A) return { s: (vmax * u * u) / (2 * A), v: u / A, acc: 1 };
  if (u <= 1 - D) return { s: vmax * (A / 2 + (u - A)), v: 1, acc: 0 };
  if (u >= 1) return { s: 1, v: 0, acc: 0 };
  const w = 1 - u;
  return { s: 1 - (vmax * w * w) / (2 * D), v: w / D, acc: -1 };
}

const lerp = (a, b, t) => a + (b - a) * t;
const smooth = (t) => t * t * (3 - 2 * t);
// Rolling down a ramp (the lander): drop in the first 60% of the trip.
const liftCurve = (s) => smooth(Math.min(1, Math.max(0, s / 0.6)));
const same = (a, b) => a.x === b.x && a.r === b.r && a.lift === b.lift && !!a.snap === !!b.snap;

function paint(el, s, bumps) {
  const { x, r, lift } = s.pos;
  el.style.left = `calc(${x.toFixed(3)}% + var(--rw) * ${r.toFixed(4)})`;
  el.style.bottom = `calc(var(--ground) + var(--rw) * ${lift.toFixed(4)})`;
  el.style.setProperty('--wheel', `${(s.angle % 360).toFixed(2)}deg`);
  el.style.setProperty('--pitch', `${s.pitch.toFixed(3)}deg`);
  el.style.setProperty('--bob', `${(((bumps[0] + bumps[1] + bumps[2]) / 3) * 0.75).toFixed(2)}px`);
  bumps.forEach((b, i) => el.style.setProperty(`--b${i}`, `${b.toFixed(2)}px`));
}

// y is relative to the ground line, so dust and tracks move with the ground
// if it shifts (the ground sits above the subtitle box, whose height changes).
function spawn(fx, cls, x, y, vars) {
  if (fx.childElementCount > 140) return;
  const n = document.createElement('i');
  n.className = cls;
  n.style.left = `${x.toFixed(1)}px`;
  n.style.top = `calc(100% - var(--ground) + ${y.toFixed(1)}px)`;
  Object.entries(vars).forEach(([k, v]) => n.style.setProperty(k, v));
  n.addEventListener('animationend', () => n.remove(), { once: true });
  fx.appendChild(n);
}

function stop(s) {
  if (s.raf) cancelAnimationFrame(s.raf);
  s.raf = 0;
}

/**
 * Drives the rover element (wrapRef) to `target` whenever it changes.
 * `mountKey` changes when the rover element is re-created (new chapter) → snap, no drive.
 * Returns { moving, faceLeft } for class names / hiding the Next arrow.
 */
export function useRoverDrive({ wrapRef, fxRef, target, mountKey, present, dusty, onDrive }) {
  const [moving, setMoving] = useState(false);
  const [faceLeft, setFaceLeft] = useState(false);
  const st = useRef({ el: null, key: null, pos: null, goal: null, angle: 0, dist: 0, pitch: 0, pitchV: 0, raf: 0 });
  const dustRef = useRef(dusty);
  dustRef.current = dusty;
  const onDriveRef = useRef(onDrive);
  onDriveRef.current = onDrive; // called with the plan when a drive starts (motor sound)
  const { x, r, lift, snap = false } = target;
  const slope0 = target.slope?.[0] ?? null;
  const slope1 = target.slope?.[1] ?? null;

  useLayoutEffect(() => {
    const s = st.current;
    const el = wrapRef.current;
    if (!present || !el) {
      stop(s);
      s.el = null;
      setMoving(false);
      setFaceLeft(false);
      return;
    }
    const goal = { x, r, lift, snap, slope: slope0 != null ? [slope0, slope1] : null };
    const fresh = s.el !== el || s.key !== mountKey || !s.pos;
    if (!fresh && s.goal && same(s.goal, goal)) return;
    s.goal = goal;
    // snap = jump there at once (e.g. parking off-screen before rolling into a new scene)
    const plan = fresh || snap ? null : planDrive(s.pos, goal);

    if (!plan) {
      stop(s);
      s.el = el;
      s.key = mountKey;
      s.pos = goal;
      s.pitch = 0;
      s.pitchV = 0;
      paint(el, s, ZERO);
      setMoving(false);
      setFaceLeft(false);
      return;
    }

    // ── drive ────────────────────────────────────────────────────────────────
    stop(s);
    const from = { ...s.pos };
    const stage = el.parentElement; // the camera layer (same size as the stage)
    const W = stage?.clientWidth || window.innerWidth;
    const RW = el.offsetWidth || 200;
    const px = (p) => (p.x / 100) * W + p.r * RW;
    const dPx = px(goal) - px(from);
    const dir = dPx < 0 ? -1 : 1; // direction of travel on screen
    const span = Math.abs(dPx);
    const face = plan.mode === 'turn' ? -1 : 1; // which way the rover looks on screen
    const local = dir * face; // +1 = driving forward, -1 = backing up
    const calm = reducedMotion(); // OS "reduce motion": no dust, bumps or leaning
    const liftAt = liftPath(from, goal);
    let slopeTilt = 0;
    const wheelR = RW * WHEEL_R;
    const puffGap = RW * 0.05;
    const trackGap = RW * 0.045;
    const t0 = performance.now();
    let last = t0;
    let lastS = 0;
    let puffAcc = 0;
    let trackAcc = 0;
    let phase = 0; // 0 turning · 1 driving · 2 turning back · 3 settling

    setMoving(true);
    onDriveRef.current?.(plan);
    setFaceLeft(face === -1);

    const emit = (speed) => {
      const fx = fxRef.current;
      // no dust/tracks in the air (lander ramp) or down inside a crater (they'd float on its far wall)
      if (!fx || calm || !dustRef.current || s.pos.lift > 0.02 || s.pos.lift < -0.08) return;
      // the stage may be zoomed by the movie camera (CSS scale): convert screen px → stage px
      const sr = stage.getBoundingClientRect();
      const k = sr.width / (stage.clientWidth || sr.width) || 1;
      const wr = el.getBoundingClientRect();
      const cx = (wr.left + wr.width / 2 - sr.left) / k;
      // ground line (y in stage px) = rover bottom shifted back by its lift
      const groundY = (wr.bottom - sr.top) / k + s.pos.lift * RW;
      const gy = (wr.top - sr.top) / k + RW * CONTACT_Y - groundY;
      // the trailing side is opposite to the direction of travel
      const backIsRear = local === 1;
      const edge = (backIsRear ? REAR_EDGE : FRONT_EDGE) * face;
      const hub = (backIsRear ? REAR_HUB : FRONT_HUB) * face;
      while (puffAcc > puffGap) {
        puffAcc -= puffGap;
        if (speed > 0.15) {
          spawn(fx, 'puff', cx + edge * RW + (Math.random() - 0.5) * RW * 0.03, gy - RW * 0.012, {
            '--dx': `${(-dir * RW * (0.08 + Math.random() * 0.1)).toFixed(1)}px`,
            '--dy': `${(-RW * (0.05 + Math.random() * 0.08)).toFixed(1)}px`,
            '--s': (1 + speed * 0.9 + Math.random() * 0.5).toFixed(2),
          });
        }
      }
      while (trackAcc > trackGap) {
        trackAcc -= trackGap;
        spawn(fx, 'track', cx + hub * RW, gy, {});
      }
    };

    const tick = (now) => {
      const dt = Math.min(0.034, Math.max(0, (now - last) / 1000));
      last = now;
      const t = now - t0;
      let lean = 0;
      let speed = 0;

      if (t >= plan.turn && t < plan.turn + plan.drive) {
        phase = 1;
        const m = profile((t - plan.turn) / plan.drive);
        const prevLift = s.pos.lift;
        const nx = lerp(from.x, goal.x, m.s);
        s.pos = { x: nx, r: lerp(from.r, goal.r, m.s), lift: liftAt(m.s, nx) };
        const ds = Math.max(0, m.s - lastS) * span;
        lastS = m.s;
        // follow the slope: nose down going downhill, nose up going uphill (rover's own frame)
        if (ds > 0.3) {
          const climb = (s.pos.lift - prevLift) * RW;
          slopeTilt = Math.max(-28, Math.min(28, -Math.atan2(climb, ds) * DEG * local));
        }
        s.angle += (ds / wheelR) * DEG * local;
        s.dist += ds;
        puffAcc += ds;
        trackAcc += ds;
        speed = m.v;
        // inertia: nose up when speeding up, nose down when braking (in the rover's own frame)
        if (calm) lean = 0;
        else if (m.acc > 0) lean = -2.6 * local;
        else if (m.acc < 0) lean = 3.4 * local;
        lean += slopeTilt;
        emit(speed);
      } else if (t >= plan.turn + plan.drive && phase < 2) {
        phase = 2;
        s.pos = goal;
        if (face === -1) setFaceLeft(false);
      }
      if (t >= plan.total && phase < 3) {
        phase = 3;
        s.pos = goal;
        setMoving(false);
      }

      // springy body
      const w = 15;
      const z = 0.42;
      s.pitchV += (-w * w * (s.pitch - lean) - 2 * z * w * s.pitchV) * dt;
      s.pitch += s.pitchV * dt;

      // bumpy ground: each wheel rides up over little rocks, out of step with the others
      const ph = s.dist / (RW * 0.045);
      const amp = calm ? 0 : 2.6 * speed;
      const bumps = [0, 1, 2].map((i) => -amp * (0.5 + 0.5 * (0.62 * Math.sin(ph + i * 2.2) + 0.38 * Math.sin(ph * 1.73 + i * 1.1))));

      if (phase === 3 && Math.abs(s.pitch) < 0.02 && Math.abs(s.pitchV) < 0.05) {
        s.pitch = 0;
        s.pitchV = 0;
        paint(el, s, ZERO);
        s.raf = 0;
        return;
      }
      paint(el, s, bumps);
      s.raf = requestAnimationFrame(tick);
    };
    s.raf = requestAnimationFrame(tick);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [x, r, lift, snap, slope0, slope1, mountKey, present]);

  useEffect(() => () => stop(st.current), []);

  return { moving, faceLeft };
}
