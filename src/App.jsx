import { useEffect, useMemo, useRef, useState } from 'react';
import { buildTimeline, chapters } from './data/story.js';
import Stage from './components/Stage.jsx';
import { ChapterCard, ChapterMenu, Hud, Lightbox, SettingsPanel, SubtitleBox } from './components/Panels.jsx';
import { EndScreen, TitleScreen } from './components/Screens.jsx';
import { useNarrator } from './hooks/useNarrator.js';
import { ENTRY, planDrive, roverPos } from './hooks/useRoverDrive.js';
import { sound } from './audio/sound.js';

const CHAPTER_MS = 2400;
const ENTER_LEAD = 800; // chapter entrance: Oppy starts rolling in this long before the card is gone
const BEAT_ENTER_MS = 600; // beat entrance: scene cut, then Oppy rolls in
const COUNT_MS = 1000; // one countdown number per second
const COUNT_WORDS = {
  en: ['Liftoff!', 'One...', 'Two...', 'Three...', 'Four...', 'Five...'],
  vi: ['Phóng!', 'Một...', 'Hai...', 'Ba...', 'Bốn...', 'Năm...'],
};
const SUBS_ORDER = ['both', 'en', 'vi', 'off'];
// music / sfx: background music and sound effects (generated in the browser, src/audio/sound.js)
const DEFAULTS = { narrate: true, subs: 'both', auto: false, rate: 0.95, voiceURI: '', music: true, sfx: true, musicVol: 0.6, sfxVol: 0.8 };
const BEEPS = ['Beep!', 'Boop!', 'Hi there!', 'Hehe!', 'Bzzt!', '♪ Beep-boop ♪'];

function loadSettings() {
  let s = DEFAULTS;
  try {
    const raw = window.localStorage.getItem('oppy-settings');
    if (raw) s = { ...DEFAULTS, ...JSON.parse(raw) };
  } catch {
    /* storage blocked */
  }
  // ?auto=1 → hands-free mode (presentations / kiosks)
  if (new URLSearchParams(window.location.search).get('auto') === '1') s = { ...s, auto: true };
  return s;
}

const readingMs = (text = '') => Math.min(12000, Math.max(2600, text.split(/\s+/).length * 330));

// Deep link for editing/testing: ?ch=4&b=2 opens chapter 4, beat 2 directly.
function frameFromUrl(timeline) {
  try {
    const q = new URLSearchParams(window.location.search);
    const ch = parseInt(q.get('ch') || '', 10);
    if (!ch) return -1;
    const b = parseInt(q.get('b') || '1', 10);
    return timeline.findIndex((f) => f.ci === ch - 1 && f.bi === b - 1);
  } catch {
    return -1;
  }
}

export default function App() {
  const timeline = useMemo(() => buildTimeline(chapters), []);
  const firstOfChapter = useMemo(() => chapters.map((_, ci) => timeline.findIndex((f) => f.ci === ci)), [timeline]);
  const deepLink = useMemo(() => frameFromUrl(timeline), [timeline]);

  const [screen, setScreen] = useState(deepLink >= 0 ? 'story' : 'title');
  const [index, setIndex] = useState(deepLink >= 0 ? deepLink : 0);
  const [nonce, setNonce] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [explored, setExplored] = useState([]);
  const [activeExplore, setActiveExplore] = useState(null);
  const [lightbox, setLightbox] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [chapterCard, setChapterCard] = useState(null);
  const [bubble, setBubble] = useState(null);
  const [settings, setSettings] = useState(loadSettings);
  const [entryReleased, setEntryReleased] = useState(-1);
  const [count, setCount] = useState(null); // countdown number on screen (0 = "LIFTOFF!")
  const [countLine, setCountLine] = useState(null); // subtitle while counting
  const [launchedAt, setLaunchedAt] = useState(-1); // frame index whose countdown has finished
  const [gameDoneAt, setGameDoneAt] = useState(-1); // frame index whose mini-game was played or skipped

  const narrator = useNarrator();
  const narratorRef = useRef(narrator);
  narratorRef.current = narrator;

  const frame = timeline[index];
  const gate = frame.beat.gate;
  const exploreItems = gate?.explore || null;
  const exploreLeft = exploreItems ? exploreItems.filter((i) => !explored.includes(i.id)).length : 0;
  // Beats with `countdown: N` count down first; their `set` (e.g. launched) only applies after "1".
  const countdownPending = screen === 'story' && frame.beat.countdown > 0 && launchedAt !== index;
  const gamePending = !!gate?.game && gameDoneAt !== index;
  const canAdvance = !gate?.tap && exploreLeft === 0 && !countdownPending && !gamePending;
  const line = activeExplore || (countdownPending && countLine) || frame.beat;
  const stageFrame = useMemo(() => {
    if (!frame.beat.countdown) return frame;
    return {
      ...frame,
      beat: countdownPending ? { ...frame.beat, photo: undefined } : frame.beat,
      set: { ...frame.set, launched: !countdownPending, igniting: revealed || !countdownPending },
    };
  }, [frame, countdownPending, revealed]);

  useEffect(() => {
    try {
      window.localStorage.setItem('oppy-settings', JSON.stringify(settings));
    } catch {
      /* private mode etc. */
    }
  }, [settings]);

  // ── timers & tokens ─────────────────────────────────────────────────────────
  const autoTimer = useRef(null);
  const revealTimer = useRef(null);
  const stageTimers = useRef([]);
  const lineToken = useRef(0);
  const shownFrame = useRef(null);
  const clearAuto = () => clearTimeout(autoTimer.current);
  const clearStageTimers = () => {
    stageTimers.current.forEach(clearTimeout);
    stageTimers.current = [];
  };

  // Chapter entrance: arriving at the first beat of a chapter marked `enter: 'drive'`
  // from somewhere else → Oppy waits off-screen, then rolls in as the chapter card fades.
  // (shownFrame still holds the previous frame until this one is revealed.)
  // A beat can also have `enter: 'drive'`: new place in the same chapter → quick scene cut,
  // then Oppy rolls in from the left (used for travelling between craters).
  const prevShown = shownFrame.current;
  const chapterEntrance = frame.bi === 0 && frame.chapter.enter === 'drive' && (!prevShown || prevShown.ci !== frame.ci);
  const beatEntrance = frame.beat.enter === 'drive' && (!prevShown || prevShown.key !== frame.key);
  const isEntrance = screen === 'story' && !frame.rover.hidden && (chapterEntrance || beatEntrance);
  const holdRover = isEntrance && entryReleased !== index;

  // ── actions (re-created every render; async callbacks use actions.current) ──
  function goTo(i) {
    setEntryReleased(-1);
    setLaunchedAt(-1);
    setGameDoneAt(-1);
    setIndex(i);
  }

  function advance() {
    clearAuto();
    setActiveExplore(null);
    if (index >= timeline.length - 1) {
      narratorRef.current.stop();
      setScreen('end');
      return;
    }
    goTo(index + 1);
  }

  function back() {
    clearAuto();
    if (index > 0) goTo(index - 1);
  }

  function onLineEnd() {
    if (!settings.auto || screen !== 'story' || countdownPending) return;
    clearAuto();
    if (exploreItems) {
      const next = exploreItems.find((i) => !explored.includes(i.id));
      if (next) {
        autoTimer.current = setTimeout(() => actions.current.explore(next), 900);
        return;
      }
    }
    // Mini-games run their own auto-play timers (skip the start card / continue after the
    // result), so a game that is being played is never cut off here.
    if (gate?.game) return;
    // (auto-play skips tap gates after a short pause)
    // (and lets the eyes-closing first-person view finish)
    const wait = gate?.tap ? 2200 : frame.beat.pov ? 4000 : 1300;
    autoTimer.current = setTimeout(() => actions.current.advance(), wait);
  }

  function sayLine(l) {
    lineToken.current += 1;
    const token = lineToken.current;
    clearAuto();
    const done = () => {
      if (token === lineToken.current) actions.current.onLineEnd();
    };
    if (settings.narrate && narratorRef.current.supported) {
      // `slow: 0.8` on a beat reads that line more slowly (e.g. Oppy falling asleep)
      narratorRef.current.speak(l.say || l.en, { rate: settings.rate * (l.slow || 1), voiceURI: settings.voiceURI, onEnd: done });
    } else {
      narratorRef.current.stop();
      if (settings.auto) autoTimer.current = setTimeout(done, readingMs(l.en));
    }
  }

  // "Three... Two... One..." — one number per second (on screen + voice), then the beat's
  // `set` applies (the rocket lifts off) and its line is read, starting with "Liftoff!".
  function runCountdown() {
    const n = Math.min(5, frame.beat.countdown);
    const at = index;
    const beat = frame.beat;
    const voice = settings.narrate && narratorRef.current.supported;
    clearAuto();
    lineToken.current += 1;
    narratorRef.current.stop();
    sound.sfx.ignite((n * COUNT_MS) / 1000);
    const step = (k) => {
      sound.sfx.count(k);
      if (k === 0) {
        sound.sfx.launch();
        setCount(0);
        setCountLine(null);
        setLaunchedAt(at);
        stageTimers.current.push(setTimeout(() => setCount(null), 1600));
        actions.current.sayLine(beat);
        return;
      }
      const said = [];
      for (let i = n; i >= k; i -= 1) said.push(i);
      setCount(k);
      setCountLine({
        en: said.map((i) => COUNT_WORDS.en[i]).join(' '),
        vi: said.map((i) => COUNT_WORDS.vi[i]).join(' '),
        say: '…', // no karaoke highlight while counting
      });
      if (voice) narratorRef.current.speak(COUNT_WORDS.en[k].replace('...', ''), { rate: settings.rate, voiceURI: settings.voiceURI });
      stageTimers.current.push(setTimeout(() => step(k - 1), COUNT_MS));
    };
    step(n);
  }

  function explore(item) {
    if (!revealed) return;
    clearAuto();
    sound.sfx.blip();
    setActiveExplore(item);
    setExplored((prev) => (prev.includes(item.id) ? prev : [...prev, item.id]));
    sayLine(item);
  }

  function tap(id) {
    if (!revealed) return;
    if (gate?.tap === id) {
      sound.sfx.chime();
      advance();
    }
  }

  function roverClick() {
    if (!revealed) return;
    if (gate?.tap === 'rover' || (canAdvance && !exploreItems)) {
      advance();
      return;
    }
    sound.sfx.robot();
    setBubble({ id: Date.now(), text: BEEPS[Math.floor(Math.random() * BEEPS.length)] });
  }

  function skipWait() {
    clearTimeout(revealTimer.current);
    clearStageTimers();
    shownFrame.current = frame;
    setEntryReleased(index);
    setChapterCard(null);
    setRevealed(true);
  }

  function keyNext() {
    if (!revealed) skipWait();
    else if (canAdvance) advance();
  }

  function start(ci = 0) {
    sound.unlock();
    narratorRef.current.stop();
    shownFrame.current = null;
    setMenuOpen(false);
    setLightbox(null);
    goTo(firstOfChapter[ci]);
    setScreen('story');
    setNonce((n) => n + 1);
  }

  function toggle(key) {
    setSettings((s) => {
      if (key === 'subs') return { ...s, subs: SUBS_ORDER[(SUBS_ORDER.indexOf(s.subs) + 1) % SUBS_ORDER.length] };
      return { ...s, [key]: !s[key] };
    });
  }

  function closeAll() {
    setLightbox(null);
    setMenuOpen(false);
    setSettingsOpen(false);
  }

  function clickAdvance() {
    sound.sfx.click();
    advance();
  }

  const actions = useRef({});
  actions.current = { advance, back, explore, onLineEnd, sayLine, runCountdown, keyNext, closeAll };

  // ── each new frame: wait for the drive / chapter card, then reveal the line ──
  useEffect(() => {
    if (screen !== 'story') return undefined;
    const prev = shownFrame.current;
    clearAuto();
    lineToken.current += 1;
    narratorRef.current.stop();
    setRevealed(false);
    setExplored([]);
    setActiveExplore(null);
    setLightbox(null);
    setCount(null);
    setCountLine(null);
    clearStageTimers();

    const chapterChanged = !prev || prev.ci !== frame.ci;
    let delay = 450;
    if (chapterChanged) {
      setChapterCard(frame.ci);
      sound.sfx.whoosh(0.07);
      delay = CHAPTER_MS;
      const entry = isEntrance ? planDrive(ENTRY, roverPos(frame.rover)) : null;
      if (entry) {
        const release = CHAPTER_MS - ENTER_LEAD;
        stageTimers.current.push(
          setTimeout(() => setEntryReleased(index), release),
          setTimeout(() => setChapterCard(null), CHAPTER_MS),
        );
        delay = Math.max(CHAPTER_MS, release + entry.total);
      }
    } else {
      const entry = isEntrance ? planDrive(ENTRY, roverPos(frame.rover)) : null;
      // wait until Oppy has finished rolling to the new spot
      const drive = !frame.rover.hidden && !prev.rover.hidden ? planDrive(roverPos(prev.rover), roverPos(frame.rover)) : null;
      if (entry) {
        stageTimers.current.push(setTimeout(() => setEntryReleased(index), BEAT_ENTER_MS));
        delay = BEAT_ENTER_MS + entry.total;
      } else if (drive) delay = drive.total;
      else if (prev.scene !== frame.scene || (frame.set.launched && !frame.beat.countdown) || frame.set.phase === 'bounce') delay = 1100;
    }
    revealTimer.current = setTimeout(() => {
      shownFrame.current = frame;
      setChapterCard(null);
      setRevealed(true);
    }, delay);
    return () => {
      clearTimeout(revealTimer.current);
      clearStageTimers();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, screen, nonce]);

  useEffect(() => {
    if (!revealed || screen !== 'story') return;
    if (countdownPending) actions.current.runCountdown();
    else actions.current.sayLine(frame.beat);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [revealed]);

  // narration / auto-play switched while a line is showing
  useEffect(() => {
    if (screen !== 'story' || !revealed || countdownPending) return;
    if (settings.narrate) actions.current.sayLine(line);
    else narratorRef.current.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.narrate]);

  useEffect(() => {
    if (screen !== 'story' || !revealed) return;
    if (settings.auto) {
      if (!narratorRef.current.speaking) actions.current.onLineEnd();
    } else clearAuto();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.auto]);

  // ── sound: levels, ducking under the narrator, music mood per beat ──────────
  useEffect(() => {
    sound.configure({ music: settings.music, sfx: settings.sfx, musicVol: settings.musicVol, sfxVol: settings.sfxVol });
  }, [settings.music, settings.sfx, settings.musicVol, settings.sfxVol]);

  useEffect(() => {
    sound.setSpeaking(narrator.speaking);
  }, [narrator.speaking]);

  const mood = screen === 'story' ? frame.music : screen === 'title' ? 'wonder' : 'lullaby';
  useEffect(() => {
    sound.setMood(mood);
  }, [mood]);

  // (sound unlocks itself on the first click / key press: see src/audio/sound.js)

  useEffect(() => {
    if (!bubble) return undefined;
    const t = setTimeout(() => setBubble(null), 1300);
    return () => clearTimeout(t);
  }, [bubble]);

  const screenRef = useRef(screen);
  screenRef.current = screen;
  const overlayRef = useRef(false);
  overlayRef.current = !!(lightbox || menuOpen || settingsOpen);

  // keyboard: → / Space / Enter = next, ← = back, Esc = close
  useEffect(() => {
    const onKey = (e) => {
      if (e.target.closest?.('input, select, textarea')) return;
      if (e.key === 'Escape') {
        actions.current.closeAll();
        return;
      }
      if (screenRef.current !== 'story' || overlayRef.current) return;
      const onButton = e.target.closest?.('button');
      if (e.key === 'ArrowRight' || (!onButton && (e.key === ' ' || e.key === 'Enter'))) {
        e.preventDefault();
        actions.current.keyNext();
      } else if (e.key === 'ArrowLeft') {
        actions.current.back();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className={`app screen-${screen}`}>
      {screen === 'title' && (
        <TitleScreen onStart={() => start(0)} settings={settings} onToggle={toggle} narratorSupported={narrator.supported} />
      )}

      {screen === 'story' && (
        <>
          <Stage
            frame={stageFrame}
            countdown={count}
            revealed={revealed}
            canAdvance={canAdvance}
            onAdvance={clickAdvance}
            onTap={tap}
            exploreItems={exploreItems}
            explored={explored}
            activeExplore={activeExplore}
            onExplore={explore}
            onOpenPhoto={setLightbox}
            onRoverClick={roverClick}
            bubble={bubble}
            hold={holdRover}
            onGameDone={() => setGameDoneAt(index)}
            talking={narrator.speaking}
            auto={settings.auto}
          />
          <Hud
            frame={frame}
            index={index}
            total={timeline.length}
            settings={settings}
            onToggle={toggle}
            onMenu={() => setMenuOpen(true)}
            onSettings={() => setSettingsOpen(true)}
          />
          <SubtitleBox
            line={line}
            revealed={revealed}
            subs={settings.subs}
            progress={narrator.progress}
            speaking={narrator.speaking}
            gate={gate}
            exploreLeft={exploreLeft}
            canAdvance={canAdvance}
            canBack={index > 0}
            onAdvance={clickAdvance}
            onBack={back}
            onReplay={() => !countdownPending && sayLine(line)}
            side={frame.beat.subsBox === 'side'}
          />
          {chapterCard != null && <ChapterCard chapter={chapters[chapterCard]} number={chapterCard + 1} onSkip={skipWait} />}
        </>
      )}

      {screen === 'end' && <EndScreen onReplay={() => start(0)} onChapters={() => setMenuOpen(true)} />}

      {menuOpen && (
        <ChapterMenu chapters={chapters} current={screen === 'story' ? frame.ci : -1} onJump={start} onClose={() => setMenuOpen(false)} />
      )}
      {settingsOpen && (
        <SettingsPanel narrator={narrator} settings={settings} setSettings={setSettings} onClose={() => setSettingsOpen(false)} />
      )}
      {lightbox && <Lightbox photoKey={lightbox} onClose={() => setLightbox(null)} />}
    </div>
  );
}
