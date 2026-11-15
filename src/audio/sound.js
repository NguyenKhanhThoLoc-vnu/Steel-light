// ─────────────────────────────────────────────────────────────────────────────
//  Sound for "I Am Oppy": background music + sound effects, all generated in the
//  browser with the Web Audio API. There are NO audio files: the music is composed
//  right here in code (a few gentle chord loops, one per mood), so it is original
//  and free of any copyright.
//
//  • Music is used sparingly: only at the big moments (story.js: `music` on a beat),
//    each cue fades out by itself after CUE_MAX seconds, and it ducks under the narrator.
//  • Moods: wonder, space, adventure, triumph, sad, tense, lullaby, game.
//  • Sound effects (motors, beeps, launch…) are the important cues and are louder.
//  • Browsers only allow sound after a click/tap: call sound.unlock() from one.
// ─────────────────────────────────────────────────────────────────────────────

// While developing: if older copies of this file (from before they could shut themselves
// down) are still playing in this tab, reload the page once to silence them for good.
if (import.meta.hot && typeof window !== 'undefined') {
  if (window.__oppySound && !window.__oppyCleanStart) window.location.reload();
  window.__oppyCleanStart = true;
}

const MUSIC_LEVEL = 0.3; // music bus at 100% volume (kept low under the narration)
const DUCK = 0.42; // music level while the narrator is speaking
const SFX_LEVEL = 0.95; // sound effects are the important cues: clearly audible
const FADE = 2.4; // seconds to crossfade between moods
const CUE_MAX = 35; // a music cue fades out by itself after this many seconds

let ctx = null;
let out;
let musicBus;
let duck;
let sfxBus;
let reverbIn;
let noiseBuf;
const opts = { music: true, sfx: true, musicVol: 0.6, sfxVol: 0.8 };
let speaking = false;
let wantedMood = null;
let dead = false; // set when a newer copy of this file took over (hot reload while developing)

// start with the viewer's saved choices (music / sfx on or off, volumes)
try {
  const saved = JSON.parse(window.localStorage.getItem('oppy-settings') || '{}');
  ['music', 'sfx', 'musicVol', 'sfxVol'].forEach((k) => {
    if (saved[k] !== undefined) opts[k] = saved[k];
  });
} catch {
  /* storage blocked */
}

const hz = (midi) => 440 * 2 ** ((midi - 69) / 12);
const rnd = (a, b) => a + Math.random() * (b - a);
const pick = (list) => list[Math.floor(Math.random() * list.length)];

// ── setup ─────────────────────────────────────────────────────────────────────
function makeNoise(seconds) {
  const buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * seconds), ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i += 1) d[i] = Math.random() * 2 - 1;
  return buf;
}

function makeImpulse(seconds, decay) {
  const len = Math.floor(ctx.sampleRate * seconds);
  const buf = ctx.createBuffer(2, len, ctx.sampleRate);
  for (let c = 0; c < 2; c += 1) {
    const d = buf.getChannelData(c);
    for (let i = 0; i < len; i += 1) d[i] = (Math.random() * 2 - 1) * (1 - i / len) ** decay;
  }
  return buf;
}

function init() {
  if (ctx) return true;
  if (dead) return false;
  const AC = typeof window !== 'undefined' && (window.AudioContext || window.webkitAudioContext);
  if (!AC) return false;
  try {
    ctx = new AC();
  } catch {
    return false;
  }
  const comp = ctx.createDynamicsCompressor();
  comp.threshold.value = -16;
  comp.ratio.value = 4;
  out = ctx.createGain();
  out.gain.value = 0.9;
  out.connect(comp);
  comp.connect(ctx.destination);

  musicBus = ctx.createGain();
  duck = ctx.createGain();
  musicBus.connect(duck);
  duck.connect(out);
  const rev = ctx.createConvolver();
  rev.buffer = makeImpulse(2.8, 2.6);
  reverbIn = ctx.createGain();
  reverbIn.gain.value = 0.45;
  const revOut = ctx.createGain();
  revOut.gain.value = 0.7;
  reverbIn.connect(rev);
  rev.connect(revOut);
  revOut.connect(musicBus);

  sfxBus = ctx.createGain();
  sfxBus.connect(out);
  noiseBuf = makeNoise(2);
  applyLevels(true);

  document.addEventListener('visibilitychange', () => {
    if (!ctx) return;
    if (document.hidden) ctx.suspend();
    else ctx.resume();
  });
  if (wantedMood) setMood(wantedMood, true);
  // ambiences asked for before sound was allowed (e.g. a storm on the first screen)
  Object.entries(wantedLoops).forEach(([name, level]) => level > 0 && loop(name, level));
  return true;
}

function ramp(param, value, seconds = 0.4) {
  const now = ctx.currentTime;
  param.cancelScheduledValues(now);
  param.setValueAtTime(param.value, now);
  param.linearRampToValueAtTime(value, now + seconds);
}

function applyLevels(instant) {
  if (!ctx) return;
  const m = opts.music ? MUSIC_LEVEL * opts.musicVol * 1.6 : 0;
  const s = opts.sfx ? SFX_LEVEL * opts.sfxVol * 1.25 : 0;
  ramp(musicBus.gain, m, instant ? 0.01 : 0.5);
  ramp(sfxBus.gain, s, instant ? 0.01 : 0.2);
  ramp(duck.gain, speaking ? DUCK : 1, instant ? 0.01 : 0.5);
}

// ── tiny synth ────────────────────────────────────────────────────────────────
// a note: oscillator (+ optional low-pass) with an attack / hold / release envelope
function note(dest, { type = 'sine', f, f2, t, dur, vol, a = 0.01, r = null, detune = 0, cutoff = null }) {
  const o = ctx.createOscillator();
  o.type = type;
  o.frequency.setValueAtTime(f, t);
  if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + dur);
  o.detune.value = detune;
  const g = ctx.createGain();
  const rel = r ?? dur * 0.8;
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + a);
  g.gain.setValueAtTime(vol, t + Math.max(a, dur - rel));
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  let node = o;
  if (cutoff) {
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = cutoff;
    o.connect(lp);
    node = lp;
  }
  node.connect(g);
  g.connect(dest);
  o.start(t);
  o.stop(t + dur + 0.05);
  return o;
}

// filtered noise burst
function hiss(dest, { t, dur, vol, type = 'bandpass', f = 1000, f2 = null, q = 1, a = 0.01, hold = 0 }) {
  const src = ctx.createBufferSource();
  src.buffer = noiseBuf;
  src.loop = true;
  const fl = ctx.createBiquadFilter();
  fl.type = type;
  fl.Q.value = q;
  fl.frequency.setValueAtTime(f, t);
  if (f2) fl.frequency.exponentialRampToValueAtTime(f2, t + dur);
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + a);
  g.gain.setValueAtTime(vol, t + a + hold);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(fl);
  fl.connect(g);
  g.connect(dest);
  src.start(t, Math.random());
  src.stop(t + dur + 0.05);
}

// ── instruments for the music ─────────────────────────────────────────────────
const INST = {
  bell: (d, m, t, v) => {
    note(d, { f: hz(m), t, dur: 1.6, vol: v, a: 0.005, r: 1.55 });
    note(d, { f: hz(m) * 2, t, dur: 0.9, vol: v * 0.25, a: 0.005, r: 0.85 });
  },
  pluck: (d, m, t, v) => note(d, { type: 'triangle', f: hz(m), t, dur: 0.45, vol: v, a: 0.004, r: 0.43, cutoff: 2600 }),
  piano: (d, m, t, v) => {
    note(d, { type: 'triangle', f: hz(m), t, dur: 2.2, vol: v, a: 0.006, r: 2.1, cutoff: 1800 });
    note(d, { f: hz(m) * 2, t, dur: 1.2, vol: v * 0.18, a: 0.006, r: 1.1 });
  },
  box: (d, m, t, v) => {
    note(d, { f: hz(m), t, dur: 1.3, vol: v, a: 0.004, r: 1.25 });
    note(d, { f: hz(m) * 3, t, dur: 0.5, vol: v * 0.12, a: 0.004, r: 0.45 });
  },
};

function pad(dest, chord, t, dur, cutoff, vol = 0.028) {
  const lp = ctx.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.value = cutoff;
  lp.connect(dest);
  chord.forEach((m) => {
    [-7, 7].forEach((det) => note(lp, { type: 'triangle', f: hz(m), t, dur, vol, a: Math.min(1.2, dur / 3), r: 1.3, detune: det }));
  });
}

// One loop per mood: 4 bars of [bass note, chord], 8 steps (eighth notes) per bar.
const TRACKS = {
  wonder: {
    bpm: 72,
    bars: [
      [36, [60, 64, 67, 71]],
      [45, [57, 60, 64, 67]],
      [41, [53, 57, 60, 64]],
      [43, [55, 59, 62, 64]],
    ],
    pad: 1100,
    arp: 'bell',
    pattern: [0, 2, 1, 3, 2, 1, 3, 2],
    oct: 12,
    arpVol: 0.035,
    bassVol: 0.05,
    melody: { 0: 79, 6: 76, 8: 81, 14: 79, 16: 77, 22: 76, 24: 74, 28: 72 },
    melodyInst: 'bell',
    melodyVol: 0.05,
  },
  space: {
    bpm: 60,
    bars: [
      [38, [57, 60, 64, 65]],
      [34, [53, 57, 60, 62]],
      [41, [57, 60, 64, 67]],
      [36, [55, 60, 62, 64]],
    ],
    pad: 850,
    arp: 'bell',
    chance: 0.4,
    oct: 24,
    arpVol: 0.03,
    bassVol: 0.045,
  },
  adventure: {
    bpm: 100,
    bars: [
      [41, [53, 57, 60]],
      [36, [52, 55, 60]],
      [38, [53, 57, 62]],
      [34, [50, 53, 58]],
    ],
    pad: 1400,
    arp: 'pluck',
    pattern: [0, 1, 2, 1, 0, 2, 1, 2],
    oct: 12,
    arpVol: 0.045,
    bassBeats: [0, 4],
    bassVol: 0.06,
    hat: true,
  },
  triumph: {
    bpm: 92,
    bars: [
      [36, [55, 60, 64]],
      [43, [55, 59, 62]],
      [45, [57, 60, 64]],
      [41, [57, 60, 65]],
    ],
    pad: 1800,
    arp: 'bell',
    pattern: [0, 1, 2, 1, 2, 0, 1, 2],
    oct: 12,
    arpVol: 0.04,
    bassBeats: [0, 4],
    bassVol: 0.06,
    melody: { 0: 72, 2: 76, 4: 79, 6: 84, 12: 83, 14: 79, 16: 81, 20: 77, 24: 79, 26: 76, 28: 74 },
    melodyInst: 'pluck',
    melodyVol: 0.07,
  },
  sad: {
    bpm: 58,
    bars: [
      [45, [57, 60, 64]],
      [41, [53, 57, 60]],
      [48, [55, 60, 64]],
      [43, [55, 59, 62]],
    ],
    pad: 700,
    arp: 'piano',
    pattern: [0, 1, 2, 1, 0, 1, 2, 1],
    every: 2,
    oct: 0,
    arpVol: 0.04,
    bassVol: 0.045,
    // a slow, simple tune over the 4 bars (step: note)
    melody: { 0: 76, 6: 74, 8: 72, 14: 71, 16: 72, 22: 69, 24: 67, 28: 69 },
    melodyInst: 'piano',
    melodyVol: 0.05,
  },
  tense: {
    bpm: 84,
    bars: [
      [38, [50, 53, 57]],
      [34, [46, 50, 53]],
      [31, [43, 46, 50]],
      [33, [45, 49, 52]],
    ],
    pad: 480,
    arp: 'bell',
    chance: 0.18,
    oct: 24,
    arpVol: 0.022,
    bassVol: 0.05,
    thump: true,
  },
  lullaby: {
    bpm: 54,
    bars: [
      [41, [53, 57, 60, 64]],
      [38, [50, 53, 57, 60]],
      [34, [46, 50, 53, 57]],
      [36, [48, 52, 55, 58]],
    ],
    pad: 650,
    arp: 'box',
    pattern: [0, 2, 3, 1, 2, 0, 3, 2],
    oct: 24,
    arpVol: 0.035,
    bassVol: 0.035,
  },
  game: {
    bpm: 120,
    bars: [
      [45, [57, 60, 64]],
      [41, [53, 57, 60]],
      [43, [55, 59, 62]],
      [40, [52, 55, 59]],
    ],
    pad: 1300,
    arp: 'pluck',
    pattern: [0, 1, 2, 1, 0, 2, 1, 2],
    oct: 12,
    arpVol: 0.04,
    bassBeats: [0, 2, 4, 6],
    bassVol: 0.05,
    hat: true,
  },
};

const music = { mood: null, track: null, gain: null, step: 0, next: 0, until: 0, timer: 0 };

function playStep(tr, step, t, sd, dest) {
  const [root, chord] = tr.bars[Math.floor(step / 8) % tr.bars.length];
  const s = step % 8;
  if (s === 0) pad(dest, chord, t, sd * 8 + 1.3, tr.pad);
  if (tr.bassVol && (tr.bassBeats || [0]).includes(s)) {
    note(dest, { f: hz(root), t, dur: tr.bassBeats ? sd * 2 : sd * 8, vol: tr.bassVol, a: 0.04, r: 0.4 });
  }
  if (tr.arp && s % (tr.every || 1) === 0) {
    const play = INST[tr.arp];
    if (tr.chance != null) {
      if (Math.random() < tr.chance) play(dest, pick(chord) + tr.oct, t, tr.arpVol);
    } else {
      play(dest, chord[tr.pattern[s] % chord.length] + tr.oct, t, tr.arpVol);
    }
  }
  if (tr.melody) {
    const m = tr.melody[step % 32];
    if (m) INST[tr.melodyInst](dest, m, t, tr.melodyVol);
  }
  if (tr.thump && (s === 0 || s === 4)) {
    note(dest, { f: 75, f2: 40, t, dur: 0.2, vol: 0.12, a: 0.004, r: 0.18 });
    note(dest, { f: 70, f2: 38, t: t + 0.2, dur: 0.18, vol: 0.07, a: 0.004, r: 0.16 });
    hiss(dest, { t, dur: 0.1, vol: 0.03, f: 300, q: 1 });
  }
  if (tr.hat && s % 2 === 1) hiss(dest, { t, dur: 0.05, vol: 0.012, type: 'highpass', f: 7000 });
}

function schedule() {
  if (!ctx || !music.track || ctx.state !== 'running' || !opts.music) return;
  if (ctx.currentTime > music.until) {
    // a cue never plays forever: fade it out and wait for the next one
    ramp(music.gain.gain, 0, 4);
    music.track = null;
    return;
  }
  const tr = music.track;
  const sd = 60 / tr.bpm / 2;
  if (music.next < ctx.currentTime - 0.5) music.next = ctx.currentTime + 0.05; // after a pause: no burst of notes
  while (music.next < ctx.currentTime + 0.3) {
    playStep(tr, music.step, music.next, sd, music.gain);
    music.next += sd;
    music.step += 1;
  }
}

function setMood(mood, force = false) {
  wantedMood = mood;
  if (!ctx) return;
  if (mood === music.mood && !force) return;
  const now = ctx.currentTime;
  if (music.gain) {
    const old = music.gain;
    ramp(old.gain, 0, FADE);
    setTimeout(() => old.disconnect(), FADE * 1000 + 2500);
  }
  music.mood = mood;
  music.track = TRACKS[mood] || null;
  music.gain = null;
  if (!music.track) return;
  const g = ctx.createGain();
  g.gain.setValueAtTime(0, now);
  g.gain.linearRampToValueAtTime(1, now + FADE);
  g.connect(musicBus);
  g.connect(reverbIn);
  music.gain = g;
  music.step = 0;
  music.next = now + 0.15;
  music.until = now + CUE_MAX;
  if (!music.timer) music.timer = setInterval(schedule, 60);
}

// ── looping ambiences (wind, falling rush, stuck wheels, radio calls) ─────────
const loops = {};
const wantedLoops = {};

function startLoop(name) {
  const g = ctx.createGain();
  g.gain.value = 0;
  g.connect(sfxBus);
  const parts = [];
  const add = (n) => {
    parts.push(n);
    return n;
  };
  if (name === 'wind' || name === 'rush') {
    const src = add(ctx.createBufferSource());
    src.buffer = noiseBuf;
    src.loop = true;
    const fl = ctx.createBiquadFilter();
    fl.type = name === 'wind' ? 'bandpass' : 'lowpass';
    fl.frequency.value = name === 'wind' ? 420 : 520;
    fl.Q.value = name === 'wind' ? 0.7 : 0.5;
    const lfo = add(ctx.createOscillator());
    lfo.frequency.value = name === 'wind' ? 0.17 : 3.5;
    const depth = ctx.createGain();
    depth.gain.value = name === 'wind' ? 240 : 120;
    lfo.connect(depth);
    depth.connect(fl.frequency);
    src.connect(fl);
    fl.connect(g);
    src.start();
    lfo.start();
  } else if (name === 'stuck') {
    // wheels spinning in sand: straining motor + sand hiss
    const o = add(ctx.createOscillator());
    o.type = 'sawtooth';
    o.frequency.value = 118;
    const vib = add(ctx.createOscillator());
    vib.frequency.value = 7;
    const vd = ctx.createGain();
    vd.gain.value = 9;
    vib.connect(vd);
    vd.connect(o.frequency);
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 600;
    const og = ctx.createGain();
    og.gain.value = 0.5;
    o.connect(lp);
    lp.connect(og);
    og.connect(g);
    const src = add(ctx.createBufferSource());
    src.buffer = noiseBuf;
    src.loop = true;
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 1800;
    bp.Q.value = 0.8;
    const ng = ctx.createGain();
    ng.gain.value = 0.7;
    src.connect(bp);
    bp.connect(ng);
    ng.connect(g);
    o.start();
    vib.start();
    src.start();
  } else if (name === 'radio') {
    // "Opportunity, can you hear us?": a static crackle and a ping every few seconds
    const ping = () => {
      const t = ctx.currentTime + 0.05;
      hiss(g, { t, dur: 0.5, vol: 0.5, f: 1800, q: 0.8 });
      note(g, { f: 1046, t: t + 0.25, dur: 0.7, vol: 0.5, a: 0.005, r: 0.65 });
    };
    ping();
    const id = setInterval(ping, 2800);
    parts.push({ stop: () => clearInterval(id) });
  }
  loops[name] = { g, parts };
  return loops[name];
}

function loop(name, level) {
  wantedLoops[name] = level;
  if (!ctx) return;
  const l = loops[name];
  if (level > 0) {
    ramp((l || startLoop(name)).g.gain, level, 0.8);
  } else if (l) {
    ramp(l.g.gain, 0, 0.8);
    delete loops[name];
    setTimeout(() => {
      l.parts.forEach((p) => {
        try {
          p.stop();
        } catch {
          /* already stopped */
        }
      });
      l.g.disconnect();
    }, 1000);
  }
}

// ── sound effects ─────────────────────────────────────────────────────────────
const now = () => ctx.currentTime + 0.01;
const on = () => !!ctx && opts.sfx && ctx.state !== 'closed' && !document.hidden;

const sfx = {
  click() {
    if (!on()) return;
    note(sfxBus, { type: 'triangle', f: 1500, f2: 1000, t: now(), dur: 0.06, vol: 0.12, a: 0.003 });
  },
  blip() {
    if (!on()) return;
    const t = now();
    note(sfxBus, { f: 1320, t, dur: 0.11, vol: 0.2, a: 0.004 });
    note(sfxBus, { type: 'triangle', f: 2640, t, dur: 0.06, vol: 0.05, a: 0.004 });
  },
  // "bi-bip": Oppy starts its motors
  chirp() {
    if (!on()) return;
    const t = now();
    note(sfxBus, { f: 1200, t, dur: 0.07, vol: 0.2, a: 0.003, r: 0.03 });
    note(sfxBus, { f: 1650, t: t + 0.09, dur: 0.08, vol: 0.2, a: 0.003, r: 0.04 });
  },
  // "bip bip": Oppy arrives at a rock / object (two clear robot beeps)
  beepBeep() {
    if (!on()) return;
    const t = now();
    [
      [1480, 0],
      [1980, 0.17],
    ].forEach(([f, x]) => {
      note(sfxBus, { f, t: t + x, dur: 0.13, vol: 0.32, a: 0.004, r: 0.05 });
      note(sfxBus, { type: 'triangle', f: f * 2, t: t + x, dur: 0.08, vol: 0.06, a: 0.004 });
    });
  },
  // Oppy's own little robot voice (tapping Oppy)
  robot() {
    if (!on()) return;
    let t = now();
    for (let i = 0; i < 3; i += 1) {
      const f = pick([698, 880, 1047, 1175, 1568]);
      note(sfxBus, { f, t, dur: 0.09, vol: 0.18, a: 0.004 });
      note(sfxBus, { type: 'triangle', f: f * 2, t, dur: 0.06, vol: 0.04, a: 0.004 });
      t += rnd(0.08, 0.12);
    }
  },
  // a discovery (tapping the right object)
  chime() {
    if (!on()) return;
    const t = now();
    [84, 88, 91, 96].forEach((m, i) => INST.bell(sfxBus, m, t + i * 0.07, 0.13));
  },
  // the robotic arm moving: a motor whirr, then a little click when it locks in place
  servo(delay = 0) {
    if (!on()) return;
    const t = now() + delay;
    note(sfxBus, { type: 'sawtooth', f: 260, f2: 560, t, dur: 0.8, vol: 0.1, a: 0.05, r: 0.2, cutoff: 1800 });
    note(sfxBus, { type: 'triangle', f: 700, f2: 1100, t, dur: 0.8, vol: 0.05, a: 0.05, r: 0.2 });
    hiss(sfxBus, { t: t + 0.82, dur: 0.05, vol: 0.12, type: 'highpass', f: 2500 });
  },
  // driving: "bi-bip", then the motors whirr up with speed and settle when braking (+ gravel on Mars).
  // arrive = Oppy is driving up to a rock to study it: "bip bip" while it pulls up, before the narrator talks
  drive(plan, gravel = true, arrive = false) {
    if (!on() || !plan) return;
    sfx.chirp();
    const t0 = now() + 0.12;
    const total = plan.total / 1000;
    const turn = plan.turn / 1000;
    const drive = plan.drive / 1000;
    const tAcc = t0 + turn + drive * 0.28;
    const tBrake = t0 + turn + drive * 0.68;
    const tEnd = t0 + turn + drive;
    const env = (g, vol) => {
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(vol, t0 + 0.18);
      g.gain.setValueAtTime(vol, t0 + total - 0.3);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + total + 0.1);
    };
    // motor body (low hum, with harmonics so small speakers play it)
    const o = ctx.createOscillator();
    o.type = 'sawtooth';
    o.frequency.setValueAtTime(80, t0);
    o.frequency.linearRampToValueAtTime(100, t0 + turn);
    o.frequency.linearRampToValueAtTime(150, tAcc);
    o.frequency.setValueAtTime(150, tBrake);
    o.frequency.linearRampToValueAtTime(80, tEnd);
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 1100;
    const g = ctx.createGain();
    env(g, 0.12);
    o.connect(lp);
    lp.connect(g);
    g.connect(sfxBus);
    o.start(t0);
    o.stop(t0 + total + 0.2);
    // electric whine: the "vrrrr" of the wheel motors, rising with speed
    const w = ctx.createOscillator();
    w.type = 'triangle';
    w.frequency.setValueAtTime(480, t0);
    w.frequency.linearRampToValueAtTime(560, t0 + turn);
    w.frequency.linearRampToValueAtTime(920, tAcc);
    w.frequency.setValueAtTime(920, tBrake);
    w.frequency.linearRampToValueAtTime(480, tEnd);
    const wg = ctx.createGain();
    env(wg, 0.045);
    w.connect(wg);
    wg.connect(sfxBus);
    w.start(t0);
    w.stop(t0 + total + 0.2);
    if (gravel) hiss(sfxBus, { t: t0 + turn, dur: drive, vol: 0.04, f: 2600, q: 0.6, a: 0.25, hold: drive * 0.5 });
    if (arrive) {
      const tb = t0 + total - 0.55;
      [
        [1480, 0],
        [1980, 0.17],
      ].forEach(([f, x]) => {
        note(sfxBus, { f, t: tb + x, dur: 0.13, vol: 0.32, a: 0.004, r: 0.05 });
        note(sfxBus, { type: 'triangle', f: f * 2, t: tb + x, dur: 0.08, vol: 0.06, a: 0.004 });
      });
    }
    // backing up: "bip … bip … bip"
    if (plan.mode === 'reverse') {
      for (let x = 0.1; x < drive - 0.1; x += 0.45) note(sfxBus, { f: 1100, t: t0 + x, dur: 0.12, vol: 0.2, a: 0.005 });
    }
  },
  // countdown + launch
  // countdown: the engines ignite, a growing roar with crackle (mid/high sounds too,
  // so it is heard on small laptop speakers that cannot play deep bass)
  ignite(seconds = 3) {
    if (!on()) return;
    const t = now();
    hiss(sfxBus, { t, dur: seconds + 0.4, vol: 0.24, f: 260, f2: 720, q: 0.7, a: seconds * 0.9, hold: 0.2 });
    hiss(sfxBus, { t, dur: seconds + 0.4, vol: 0.18, type: 'lowpass', f: 90, f2: 320, a: seconds * 0.9, hold: 0.2 });
    for (let i = 0; i < 18; i += 1) hiss(sfxBus, { t: t + rnd(0.5, seconds), dur: rnd(0.03, 0.07), vol: rnd(0.05, 0.12), f: rnd(1200, 3200), q: 1.2 });
  },
  count(k) {
    if (!on()) return;
    if (k > 0) note(sfxBus, { f: 880, t: now(), dur: 0.18, vol: 0.14, a: 0.004 });
    else note(sfxBus, { f: 1320, t: now(), dur: 0.55, vol: 0.16, a: 0.004 });
  },
  // liftoff: a big boom, a roaring midrange rumble with crackle and hiss that fades as the rocket climbs
  launch() {
    if (!on()) return;
    const t = now();
    note(sfxBus, { type: 'triangle', f: 170, f2: 60, t, dur: 0.9, vol: 0.32, a: 0.01 });
    hiss(sfxBus, { t, dur: 6.5, vol: 0.62, f: 420, f2: 950, q: 0.45, a: 0.15, hold: 2 });
    hiss(sfxBus, { t, dur: 5.5, vol: 0.42, type: 'lowpass', f: 320, f2: 1500, a: 0.2, hold: 1.6, q: 0.6 });
    hiss(sfxBus, { t, dur: 4.5, vol: 0.15, type: 'highpass', f: 2500, a: 0.1, hold: 1 });
    for (let i = 0; i < 40; i += 1) {
      const x = rnd(0.05, 3.6);
      hiss(sfxBus, { t: t + x, dur: rnd(0.02, 0.06), vol: rnd(0.07, 0.17) * (1 - x / 5), f: rnd(900, 3500), q: 1.5 });
    }
    note(sfxBus, { f: 50, f2: 34, t, dur: 6, vol: 0.32, a: 0.2, r: 4.5 }); // deep rumble (headphones / big speakers)
  },
  whoosh(vol = 0.1) {
    if (!on()) return;
    hiss(sfxBus, { t: now(), dur: 0.7, vol, f: 300, f2: 1900, q: 0.9, a: 0.25 });
  },
  // landing game
  chutePop() {
    if (!on()) return;
    const t = now();
    hiss(sfxBus, { t, dur: 0.1, vol: 0.32, type: 'highpass', f: 900 });
    note(sfxBus, { f: 150, f2: 70, t, dur: 0.18, vol: 0.25, a: 0.004 });
    hiss(sfxBus, { t: t + 0.05, dur: 0.6, vol: 0.06, f: 600, q: 1.5, a: 0.05 });
  },
  rip() {
    if (!on()) return;
    hiss(sfxBus, { t: now() + 0.15, dur: 0.4, vol: 0.18, type: 'highpass', f: 2200, f2: 900 });
  },
  clunk(vol = 0.28) {
    if (!on()) return;
    const t = now();
    note(sfxBus, { f: 115, f2: 55, t, dur: 0.24, vol, a: 0.004 });
    hiss(sfxBus, { t, dur: 0.14, vol: vol * 0.6, f: 450, q: 1 });
    hiss(sfxBus, { t, dur: 0.12, vol: vol * 0.5, type: 'lowpass', f: 320 });
  },
  inflate() {
    if (!on()) return;
    hiss(sfxBus, { t: now(), dur: 0.5, vol: 0.18, f: 250, f2: 1500, q: 0.8, a: 0.1 });
  },
  retro() {
    if (!on()) return;
    hiss(sfxBus, { t: now(), dur: 0.9, vol: 0.28, type: 'lowpass', f: 700, a: 0.05, hold: 0.4 });
  },
  bounce(times = 4) {
    if (!on()) return;
    const t = now();
    let x = 0;
    for (let i = 0; i < times; i += 1) {
      note(sfxBus, { f: 125, f2: 45, t: t + x, dur: 0.24, vol: 0.28 * 0.65 ** i, a: 0.004 });
      hiss(sfxBus, { t: t + x, dur: 0.16, vol: 0.18 * 0.65 ** i, f: 420, q: 0.9 });
      hiss(sfxBus, { t: t + x, dur: 0.1, vol: 0.08 * 0.65 ** i, type: 'lowpass', f: 260 });
      x += 0.55 - i * 0.1;
    }
  },
  crash() {
    if (!on()) return;
    const t = now();
    hiss(sfxBus, { t, dur: 0.8, vol: 0.45, type: 'lowpass', f: 2000, f2: 260 });
    note(sfxBus, { f: 72, f2: 30, t, dur: 0.6, vol: 0.38, a: 0.004 });
    note(sfxBus, { type: 'square', f: 420, t: t + 0.03, dur: 0.12, vol: 0.04, a: 0.002, cutoff: 2500 });
    note(sfxBus, { type: 'square', f: 610, t: t + 0.09, dur: 0.1, vol: 0.035, a: 0.002, cutoff: 2500 });
  },
  win() {
    if (!on()) return;
    const t = now();
    [72, 76, 79, 84].forEach((m, i) => INST.pluck(sfxBus, m, t + i * 0.1, 0.1));
    INST.bell(sfxBus, 88, t + 0.42, 0.06);
  },
  lose() {
    if (!on()) return;
    const t = now();
    [67, 64, 60].forEach((m, i) => note(sfxBus, { type: 'triangle', f: hz(m), t: t + i * 0.2, dur: 0.3, vol: 0.08, a: 0.005 }));
  },
  bonk() {
    if (!on()) return;
    const t = now();
    note(sfxBus, { f: 330, f2: 110, t, dur: 0.18, vol: 0.18, a: 0.003 });
    hiss(sfxBus, { t, dur: 0.06, vol: 0.08, type: 'highpass', f: 1500 });
  },
  // first-person moments
  boot() {
    if (!on()) return;
    const t = now();
    note(sfxBus, { f: 180, f2: 720, t: t + 0.2, dur: 1.1, vol: 0.06, a: 0.2, r: 0.4 });
    [0.3, 0.9, 1.5, 2.4].forEach((x) => note(sfxBus, { f: 1500, t: t + x, dur: 0.06, vol: 0.06, a: 0.003 }));
    [2.5, 2.85, 3.2].forEach((x) => {
      note(sfxBus, { f: 110, f2: 60, t: t + x, dur: 0.2, vol: 0.16, a: 0.003 });
      hiss(sfxBus, { t: t + x, dur: 0.1, vol: 0.06, type: 'lowpass', f: 400 });
    });
  },
  powerDown(delay = 6) {
    if (!on()) return;
    const t = now() + delay;
    note(sfxBus, { f: 700, f2: 55, t, dur: 2.8, vol: 0.09, a: 0.1, r: 1.2 });
  },
  // the last signal home: a burst of data chirps
  transmit() {
    if (!on()) return;
    const t = now();
    for (let i = 0; i < 24; i += 1) note(sfxBus, { type: 'square', f: rnd(900, 2200), t: t + i * 0.09, dur: 0.05, vol: 0.02, a: 0.002, cutoff: 3500 });
  },
  glitch() {
    if (!on()) return;
    const t = now();
    for (let i = 0; i < 8; i += 1) {
      note(sfxBus, { type: 'square', f: rnd(200, 2000), t: t + i * 0.1, dur: rnd(0.03, 0.06), vol: 0.03, a: 0.002, cutoff: 3000 });
      if (i % 3 === 0) hiss(sfxBus, { t: t + i * 0.1, dur: 0.05, vol: 0.05, type: 'highpass', f: 2500 });
    }
  },
  party() {
    if (!on()) return;
    const t = now();
    for (let i = 0; i < 4; i += 1) hiss(sfxBus, { t: t + i * 0.13, dur: 0.07, vol: 0.12, type: 'highpass', f: 1800 });
    [72, 76, 79, 84, 88].forEach((m, i) => INST.bell(sfxBus, m, t + 0.25 + i * 0.08, 0.05));
  },
  // the wind blowing the solar panels clean
  gust() {
    if (!on()) return;
    hiss(sfxBus, { t: now(), dur: 3, vol: 0.14, f: 220, f2: 900, q: 0.7, a: 1.2, hold: 0.6 });
  },
};

// Only one copy of the sound engine may play. While developing, Vite hot-reloads this
// file and the old copy would keep its own audio running (music the ♪ button can't stop),
// so every new copy first shuts the previous one down completely.
// Sound also unlocks on the first click / key press anywhere (browsers require a gesture).
if (typeof window !== 'undefined') {
  window.__oppySoundTeardown?.();
  const gesture = () => sound.unlock();
  window.addEventListener('pointerdown', gesture, true);
  window.addEventListener('keydown', gesture, true);
  window.__oppySoundTeardown = () => {
    dead = true;
    window.removeEventListener('pointerdown', gesture, true);
    window.removeEventListener('keydown', gesture, true);
    clearInterval(music.timer);
    music.timer = 0;
    music.track = null;
    Object.values(loops).forEach((l) =>
      l.parts.forEach((p) => {
        try {
          p.stop();
        } catch {
          /* already stopped */
        }
      }),
    );
    if (ctx) ctx.close().catch(() => {});
    ctx = null;
  };
}

// dev-only probe for automated checks (not in the production build)
if (import.meta.env?.DEV && typeof window !== 'undefined') {
  window.__oppySfxLog = [];
  Object.keys(sfx).forEach((name) => {
    const fn = sfx[name];
    sfx[name] = (...args) => {
      if (on()) window.__oppySfxLog.push(name);
      return fn(...args);
    };
  });
  let probe = null;
  let probeMid = null;
  const rms = (an) => {
    const a = new Float32Array(an.fftSize);
    an.getFloatTimeDomainData(a);
    return Math.sqrt(a.reduce((sum, v) => sum + v * v, 0) / a.length);
  };
  window.__oppySound = {
    // like a laptop speaker: ignore everything below 300 Hz
    levelMid: () => {
      if (!ctx) return -1;
      if (!probeMid) {
        const hp = ctx.createBiquadFilter();
        hp.type = 'highpass';
        hp.frequency.value = 300;
        probeMid = ctx.createAnalyser();
        probeMid.fftSize = 2048;
        out.connect(hp);
        hp.connect(probeMid);
      }
      return rms(probeMid);
    },
    state: () => ({ ctx: ctx?.state ?? 'none', mood: music.mood, loops: Object.keys(loops), opts: { ...opts } }),
    level: () => {
      if (!ctx) return -1;
      if (!probe) {
        probe = ctx.createAnalyser();
        probe.fftSize = 2048;
        out.connect(probe);
      }
      const a = new Float32Array(probe.fftSize);
      probe.getFloatTimeDomainData(a);
      return Math.sqrt(a.reduce((sum, v) => sum + v * v, 0) / a.length);
    },
  };
}

// ── public API ────────────────────────────────────────────────────────────────
export const sound = {
  // call from a click/tap/key press (browsers block sound until then)
  unlock() {
    if (!init()) return;
    if (ctx.state === 'suspended') ctx.resume();
  },
  configure(next) {
    Object.assign(opts, next);
    applyLevels();
  },
  setSpeaking(isSpeaking) {
    speaking = !!isSpeaking;
    if (ctx) ramp(duck.gain, speaking ? DUCK : 1, speaking ? 0.35 : 0.9);
  },
  setMood,
  loop,
  sfx,
};
