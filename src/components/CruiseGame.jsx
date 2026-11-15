import { useEffect, useRef, useState } from 'react';
import { Cruiser, MarsPlanet } from '../art/Scenes.jsx';
import { useAutoTimer } from '../hooks/useAutoTimer.js';
import { sound } from '../audio/sound.js';

// Mini-game for the cruise to Mars: steer the spacecraft up/down and dodge space rocks.
// Mouse / finger: the ship follows your pointer's height. Keyboard: ↑ ↓ (or W S).
// No "game over" — bumping a rock just costs a star.
// Auto-play mode never interrupts a game: it only skips the start card if nobody presses
// Start, and continues a few seconds after the result card.

const GAME_S = 20; // seconds of flying
const ROCK_TONES = [
  ['#9a7b64', '#5f4a3c'],
  ['#8d8aa0', '#55526a'],
  ['#b0805a', '#6e4a31'],
];

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const smooth = (t) => t * t * (3 - 2 * t);

function starsFor(hits) {
  if (hits === 0) return 3;
  if (hits <= 2) return 2;
  return 1;
}

export default function CruiseGame({ onDone, onAdvance, auto = false }) {
  const [phase, setPhase] = useState('ready'); // ready → play → result
  const [result, setResult] = useState(null);
  const areaRef = useRef(null);
  const canvasRef = useRef(null);
  const shipRef = useRef(null);
  const marsRef = useRef(null);
  const barRef = useRef(null);
  const hitsRef = useRef(null);
  const bonkRef = useRef(null);
  const startRef = useRef(null);
  const input = useRef({ targetY: null, up: false, down: false });
  const game = useRef({ phase: 'ready', t: 0, rocks: [], sparks: [], trail: [], hits: 0, total: 0, invuln: 0, spawnIn: 0, shipY: null, marsK: 0 });
  const cb = useRef({ onDone, onAdvance });
  cb.current = { onDone, onAdvance };

  function start() {
    const g = game.current;
    Object.assign(g, { phase: 'play', t: 0, rocks: [], sparks: [], hits: 0, total: 0, invuln: 0, spawnIn: 0.7, marsK: 0, ended: false });
    if (hitsRef.current) hitsRef.current.textContent = '0';
    setResult(null);
    sound.sfx.whoosh(0.12);
    setPhase('play');
  }

  function skip() {
    game.current.phase = 'done';
    cb.current.onDone();
    cb.current.onAdvance();
  }

  useEffect(() => {
    startRef.current?.focus({ preventScroll: true });
  }, []);

  // keyboard steering
  useEffect(() => {
    const isUp = (k) => k === 'ArrowUp' || k === 'w' || k === 'W';
    const isDown = (k) => k === 'ArrowDown' || k === 's' || k === 'S';
    const down = (e) => {
      if (isUp(e.key)) input.current.up = true;
      else if (isDown(e.key)) input.current.down = true;
      else return;
      input.current.targetY = null;
      e.preventDefault();
    };
    const up = (e) => {
      if (isUp(e.key)) input.current.up = false;
      if (isDown(e.key)) input.current.down = false;
    };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
    };
  }, []);

  // the game loop (runs the whole time: starfield + ship in every phase, rocks only while playing)
  useEffect(() => {
    const area = areaRef.current;
    const cv = canvasRef.current;
    const ctx = cv.getContext('2d');
    const g = game.current;
    let W = 1;
    let H = 1;
    const resize = () => {
      const r = area.getBoundingClientRect();
      W = Math.max(1, r.width);
      H = Math.max(1, r.height);
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      cv.width = Math.round(W * dpr);
      cv.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (g.shipY == null) g.shipY = H / 2;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(area);

    const stars = Array.from({ length: 110 }, () => ({ x: Math.random(), y: Math.random(), z: 0.15 + Math.random() * 0.85 }));
    let last = performance.now();
    let raf = 0;
    let tilt = 0;

    const drawRock = (r) => {
      ctx.save();
      ctx.translate(r.x, r.y);
      ctx.rotate(r.rot);
      const grad = ctx.createRadialGradient(-r.r * 0.35, -r.r * 0.35, r.r * 0.1, 0, 0, r.r * 1.1);
      grad.addColorStop(0, r.tone[0]);
      grad.addColorStop(1, r.tone[1]);
      ctx.beginPath();
      r.shape.forEach((k, i) => {
        const a = (i / r.shape.length) * Math.PI * 2;
        const px = Math.cos(a) * r.r * k;
        const py = Math.sin(a) * r.r * k;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      });
      ctx.closePath();
      ctx.fillStyle = grad;
      ctx.fill();
      ctx.lineWidth = Math.max(2, r.r * 0.09);
      ctx.strokeStyle = '#231c33';
      ctx.lineJoin = 'round';
      ctx.stroke();
      ctx.fillStyle = 'rgba(35, 28, 51, 0.35)';
      r.craters.forEach(([cx, cy, cr]) => {
        ctx.beginPath();
        ctx.arc(cx * r.r, cy * r.r, cr * r.r, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.restore();
    };

    const tick = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const S = clamp(Math.min(W, H) * 0.15, 46, 92); // ship size
      const shipX = W * 0.16;
      const playing = g.phase === 'play';
      const progress = playing ? clamp(g.t / GAME_S, 0, 1) : g.phase === 'result' ? 1 : 0;
      const speed = playing ? W * (0.32 + 0.16 * progress) : W * 0.1; // how fast space scrolls by

      // ── steer ──
      const prevY = g.shipY;
      const inp = input.current;
      if (inp.up || inp.down) g.shipY += ((inp.down ? 1 : 0) - (inp.up ? 1 : 0)) * H * 0.95 * dt;
      else if (inp.targetY != null) g.shipY += (inp.targetY - g.shipY) * Math.min(1, dt * 9);
      g.shipY = clamp(g.shipY, S * 0.5, H - S * 0.5);
      const vy = (g.shipY - prevY) / Math.max(dt, 0.001);
      tilt += (clamp(vy / H, -1.2, 1.2) * 22 - tilt) * Math.min(1, dt * 8);

      // ── play: spawn, move, collide ──
      if (playing) {
        g.t += dt;
        g.invuln = Math.max(0, g.invuln - dt);
        if (g.t < GAME_S) {
          g.spawnIn -= dt;
          if (g.spawnIn <= 0) {
            const r = S * (0.26 + Math.random() * 0.36);
            g.rocks.push({
              x: W + r * 2,
              y: r + Math.random() * (H - 2 * r),
              r,
              vx: -(W * (0.3 + Math.random() * 0.18) + W * 0.2 * progress),
              vy: 0,
              rot: Math.random() * 6.28,
              vr: (Math.random() - 0.5) * 2.4,
              shape: Array.from({ length: 9 }, () => 0.78 + Math.random() * 0.3),
              craters: [
                [-0.3 + Math.random() * 0.2, -0.25 + Math.random() * 0.2, 0.18],
                [0.25, 0.2, 0.12 + Math.random() * 0.08],
              ],
              tone: ROCK_TONES[Math.floor(Math.random() * ROCK_TONES.length)],
              hit: false,
            });
            g.total += 1;
            g.spawnIn = (0.9 - 0.48 * progress) * (0.75 + Math.random() * 0.5);
          }
        }
        for (const r of g.rocks) {
          r.x += r.vx * dt;
          r.y += r.vy * dt;
          r.rot += r.vr * dt;
          if (!r.hit && g.invuln <= 0 && Math.hypot(r.x - shipX, r.y - g.shipY) < S * 0.36 + r.r * 0.82) {
            r.hit = true;
            r.vx = Math.abs(r.vx) * 0.35;
            r.vy = (r.y - g.shipY) * 4 || 120;
            r.vr *= 4;
            g.hits += 1;
            g.invuln = 1.1;
            sound.sfx.bonk();
            if (hitsRef.current) hitsRef.current.textContent = String(g.hits);
            for (let i = 0; i < 16; i += 1) {
              const a = Math.random() * Math.PI * 2;
              const v = 60 + Math.random() * 220;
              g.sparks.push({ x: (r.x + shipX) / 2, y: (r.y + g.shipY) / 2, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: 0.6 + Math.random() * 0.3 });
            }
            const b = bonkRef.current;
            if (b) {
              b.style.left = `${shipX}px`;
              b.style.top = `${g.shipY - S * 0.7}px`;
              b.classList.remove('show');
              void b.offsetWidth; // restart the animation
              b.classList.add('show');
            }
          }
        }
        g.rocks = g.rocks.filter((r) => !(r.x < -r.r * 2 || r.x > W + r.r * 4 || r.y < -r.r * 3 || r.y > H + r.r * 3));
        const onScreen = g.rocks.some((r) => !r.hit);
        if (!g.ended && g.t >= GAME_S && (!onScreen || g.t > GAME_S + 3)) {
          g.ended = true;
          g.phase = 'result';
          setResult({ hits: g.hits, dodged: g.total - g.hits, total: g.total });
          setPhase('result');
          sound.sfx.win();
          cb.current.onDone();
        }
        g.marsK = smooth(clamp((progress - 0.7) / 0.3, 0, 1));
      } else if (g.phase === 'ready') {
        g.marsK = 0;
      }

      // engine glow behind the ship
      g.trail.push({ x: shipX - S * 0.42, y: g.shipY + (Math.random() - 0.5) * S * 0.2, life: 0.5 });
      for (const p of g.trail) {
        p.x -= speed * 0.6 * dt;
        p.life -= dt;
      }
      g.trail = g.trail.filter((p) => p.life > 0);
      for (const p of g.sparks) {
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vx *= 0.96;
        p.vy *= 0.96;
        p.life -= dt;
      }
      g.sparks = g.sparks.filter((p) => p.life > 0);

      // ── draw ──
      ctx.clearRect(0, 0, W, H);
      for (const s of stars) {
        s.x -= (speed * s.z * dt) / W;
        if (s.x < 0) {
          s.x += 1;
          s.y = Math.random();
        }
        const x = s.x * W;
        const y = s.y * H;
        const len = speed * s.z * 0.035;
        ctx.strokeStyle = `rgba(255,255,255,${0.25 + s.z * 0.6})`;
        ctx.lineWidth = s.z * 2;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + len + 0.5, y);
        ctx.stroke();
      }
      for (const p of g.trail) {
        ctx.fillStyle = `rgba(140, 200, 255, ${p.life * 1.2})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, S * 0.08 * (0.4 + p.life), 0, Math.PI * 2);
        ctx.fill();
      }
      g.rocks.forEach(drawRock);
      for (const p of g.sparks) {
        ctx.fillStyle = `rgba(255, ${170 + Math.round(p.life * 80)}, 60, ${Math.min(1, p.life * 1.6)})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3 + p.life * 3, 0, Math.PI * 2);
        ctx.fill();
      }

      // DOM bits: ship, Mars, progress bar
      const ship = shipRef.current;
      if (ship) {
        ship.style.width = `${S}px`;
        ship.style.transform = `translate(${shipX - S / 2}px, ${g.shipY - S / 2}px) rotate(${tilt.toFixed(1)}deg)`;
        ship.style.opacity = g.invuln > 0 && Math.floor(g.invuln * 10) % 2 ? '0.35' : '1';
      }
      if (marsRef.current) marsRef.current.style.transform = `translate(${((1 - g.marsK) * 130).toFixed(1)}%, -50%)`;
      if (barRef.current) barRef.current.style.width = `${(progress * 100).toFixed(1)}%`;

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  const pointer = (e) => {
    const r = areaRef.current.getBoundingClientRect();
    input.current.targetY = e.clientY - r.top;
  };

  const stars = result ? starsFor(result.hits) : 0;
  const autoReady = useAutoTimer(auto && phase === 'ready', 9, skip);
  const autoDone = useAutoTimer(auto && phase === 'result', 6, () => cb.current.onAdvance());

  return (
    <div className={`cruise-game phase-${phase}`} ref={areaRef} onPointerMove={pointer} onPointerDown={pointer}>
      <canvas ref={canvasRef} className="cg-canvas" aria-hidden="true" />
      <div className="cg-mars" ref={marsRef} aria-hidden="true">
        <MarsPlanet />
      </div>
      <div className="cg-ship" ref={shipRef} aria-hidden="true">
        <Cruiser />
      </div>
      <span className="cg-bonk" ref={bonkRef} aria-hidden="true">
        Bonk!
      </span>

      {phase === 'play' && (
        <div className="cg-top" aria-live="off">
          <span title="Earth">🌍</span>
          <div className="cg-bar">
            <i ref={barRef} />
          </div>
          <span title="Mars">🔴</span>
          <b className="cg-hits">
            💥 <span ref={hitsRef}>0</span>
          </b>
        </div>
      )}

      {phase === 'ready' && (
        <div className="cg-card-wrap">
          <div className="cg-card">
            <h3>Dodge the space rocks!</h3>
            <p className="cg-vi">Né những viên đá vũ trụ!</p>
            <ul className="cg-how">
              <li>
                🖱️ Move your mouse up and down <small>Di chuột lên xuống</small>
              </li>
              <li>
                👆 Or drag your finger <small>Hoặc kéo ngón tay</small>
              </li>
              <li>
                ⌨️ Or use the ↑ ↓ keys <small>Hoặc dùng phím ↑ ↓</small>
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
            <div className="cg-stars" aria-label={`${stars} of 3 stars`}>
              {'★'.repeat(stars)}
              <span>{'★'.repeat(3 - stars)}</span>
            </div>
            <h3>Almost at Mars!</h3>
            <p className="cg-vi">Sắp tới sao Hỏa rồi!</p>
            <p className="cg-score">
              You dodged <b>{result.dodged}</b> of <b>{result.total}</b> space rocks
              {result.hits === 0 ? ' — not a single bump!' : ` · ${result.hits} bump${result.hits > 1 ? 's' : ''}`}
              <small>
                Bạn đã né được {result.dodged}/{result.total} viên đá
                {result.hits === 0 ? ', không va lần nào!' : `, va ${result.hits} lần`}
              </small>
            </p>
            <p className="cg-fact">
              💡 Real fact: space is so empty that Oppy never had to dodge rocks like this. But tiny dust grains called micrometeoroids really do zip
              through space!
              <small>Sự thật: vũ trụ rất trống trải nên Oppy không phải né đá như thế này. Nhưng những hạt bụi siêu nhỏ gọi là vi thiên thạch thì có thật!</small>
            </p>
            <div className="cg-actions">
              <button type="button" className="cg-btn" onClick={start}>
                ⟲ Play again · Chơi lại
              </button>
              <button type="button" className="cg-btn is-primary" onClick={() => cb.current.onAdvance()}>
                Continue · Tiếp ›{autoDone != null ? ` (${autoDone})` : ''}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
