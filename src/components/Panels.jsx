import { useEffect, useRef } from 'react';
import { photos } from '../data/photos.js';

const SUBS_LABEL = { both: 'EN+VI', en: 'EN', vi: 'VI', off: 'Off' };

function fmtKm(km) {
  if (km == null) return '—';
  return `${km} km`;
}

// Publishes the subtitle box size for the layout:
//   --subs-h      how much of the bottom the box covers across the whole width, so the ground
//                 (and Oppy) always sit above it. 0 when the box is a small side bubble.
//   --subs-box-h  the real height of the box (buttons that share its corner stay above it)
function useSubsHeight() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof ResizeObserver === 'undefined') return undefined;
    const root = document.documentElement;
    const publish = () => {
      const h = Math.round(el.offsetHeight);
      const parentW = el.offsetParent?.clientWidth || window.innerWidth;
      const side = el.offsetWidth < parentW * 0.6;
      root.style.setProperty('--subs-box-h', `${h}px`);
      root.style.setProperty('--subs-h', `${side ? 0 : h}px`);
    };
    const ro = new ResizeObserver(publish);
    ro.observe(el);
    window.addEventListener('resize', publish);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', publish);
    };
  }, []);
  return ref;
}

export function Hud({ frame, index, total, settings, onToggle, onMenu, onSettings }) {
  const { hud, chapter, ci } = frame;
  const km = hud.km == null ? '—' : hud.kmMin ? `${hud.km}+ km` : fmtKm(hud.km);
  const p = Math.max(0, Math.min(100, hud.power ?? 100));
  const level = p > 60 ? 'good' : p > 25 ? 'mid' : 'low';
  return (
    <header className="hud">
      <div className="progress" aria-hidden="true">
        <i style={{ width: `${((index + 1) / total) * 100}%` }} />
      </div>
      <button type="button" className="chapter-pill" onClick={onMenu} aria-label="Chapters">
        <span className="ch-num">{ci + 1}</span>
        <span className="ch-text">
          <b>{chapter.title.en}</b>
          <small>{chapter.title.vi}</small>
        </span>
        <span className="ch-menu" aria-hidden="true">☰</span>
      </button>
      <div className="hud-stats">
        <span className="stat-chip" title="Date · Thời gian">
          📅 <b>{hud.date}</b>
        </span>
        <span className="stat-chip" title="Distance driven · Quãng đường">
          🛣️ <b>{km}</b>
        </span>
        <span className={`stat-chip power is-${level}`} title={`Power · Năng lượng: ${p}%`}>
          🔋
          <span className="power-bar">
            <i style={{ width: `${p}%` }} />
          </span>
        </span>
      </div>
      <div className="hud-controls">
        <button type="button" className={`ctl${settings.narrate ? ' is-on' : ''}`} onClick={() => onToggle('narrate')} title="Narration · Giọng kể">
          {settings.narrate ? '🔊' : '🔇'}
        </button>
        <button type="button" className={`ctl${settings.music ? ' is-on' : ''}`} onClick={() => onToggle('music')} title="Music · Nhạc nền">
          ♪{!settings.music && <small>off</small>}
        </button>
        <button type="button" className="ctl" onClick={() => onToggle('subs')} title="Subtitles · Phụ đề">
          CC <small>{SUBS_LABEL[settings.subs]}</small>
        </button>
        <button type="button" className={`ctl${settings.auto ? ' is-on' : ''}`} onClick={() => onToggle('auto')} title="Auto-play · Tự động chạy">
          {settings.auto ? '⏸' : '⏵'} <small>Auto</small>
        </button>
        <button type="button" className="ctl" onClick={onSettings} title="Voice & sound settings · Cài đặt giọng và âm thanh">
          ⚙
        </button>
      </div>
    </header>
  );
}

export function SubtitleBox({
  line,
  revealed,
  subs,
  progress,
  speaking,
  gate,
  exploreLeft,
  canAdvance,
  canBack,
  onAdvance,
  onBack,
  onReplay,
  side = false,
}) {
  const showEn = subs === 'both' || subs === 'en';
  const showVi = subs === 'both' || subs === 'vi';
  const text = line?.en || '';
  const karaoke = speaking && !line?.say && progress > 0;
  const boxRef = useSubsHeight();
  return (
    // side: a small chat bubble in the bottom-left corner (beat field subsBox: 'side')
    <section ref={boxRef} className={`subs subs-${subs}${side ? ' is-side' : ''}`} aria-live="polite">
      <span className="nameplate">
        <svg viewBox="0 0 40 24" aria-hidden="true">
          <rect x="2" y="2" width="36" height="20" rx="8" fill="#eef0fa" />
          <circle cx="13" cy="12" r="5" fill="#2b2f45" />
          <circle cx="27" cy="12" r="5" fill="#2b2f45" />
          <circle cx="11.5" cy="10.5" r="1.6" fill="#fff" />
          <circle cx="25.5" cy="10.5" r="1.6" fill="#fff" />
        </svg>
        OPPY
      </span>
      <div className="subs-body">
        {!revealed ? (
          <div className="typing" aria-label="Oppy is moving">
            <i />
            <i />
            <i />
          </div>
        ) : (
          <>
            {showEn && (
              <p className="subs-en" lang="en">
                {karaoke ? (
                  <>
                    <span className="spoken">{text.slice(0, progress)}</span>
                    <span className="unspoken">{text.slice(progress)}</span>
                  </>
                ) : (
                  text
                )}
              </p>
            )}
            {showVi && (
              <p className="subs-vi" lang="vi">
                {line?.vi}
              </p>
            )}
            {subs === 'off' && <p className="subs-off">🎧 Subtitles off · Đã tắt phụ đề</p>}
          </>
        )}
      </div>
      <div className="subs-bar">
        <div className="subs-hints">
          {revealed && gate?.tap && (
            <span className="hint-chip">
              👆 {gate.hint?.en} <small>{gate.hint?.vi}</small>
            </span>
          )}
          {revealed && gate?.game && !canAdvance && (
            <span className="hint-chip">
              🎮 {gate.hint?.en} <small>{gate.hint?.vi}</small>
            </span>
          )}
          {revealed && gate?.explore && exploreLeft > 0 && (
            <span className="hint-chip">
              ✨ Tap the glowing spots on Oppy ({exploreLeft} left) <small>Nhấn vào các điểm sáng trên Oppy (còn {exploreLeft})</small>
            </span>
          )}
        </div>
        <div className="subs-actions">
          <button type="button" className="icon-btn" onClick={onBack} disabled={!canBack} aria-label="Previous line" title="Previous · Lùi lại">
            ‹
          </button>
          <button type="button" className="icon-btn" onClick={onReplay} disabled={!revealed} aria-label="Replay line" title="Replay · Nghe lại">
            ⟲
          </button>
          <button type="button" className="next-btn" onClick={onAdvance} disabled={!revealed || !canAdvance} title="Next · Tiếp">
            Next <span aria-hidden="true">›</span>
          </button>
        </div>
      </div>
    </section>
  );
}

export function ChapterCard({ chapter, number, onSkip }) {
  return (
    <button type="button" className="chapter-card" onClick={onSkip} aria-label="Skip">
      <span className="cc-num">Chapter {number}</span>
      <span className="cc-title">{chapter.title.en}</span>
      <span className="cc-vi">
        Chương {number}: {chapter.title.vi}
      </span>
    </button>
  );
}

export function ChapterMenu({ chapters, current, onJump, onClose }) {
  return (
    <div className="drawer-backdrop" onClick={onClose} role="presentation">
      <nav className="drawer" onClick={(e) => e.stopPropagation()} aria-label="Chapters">
        <div className="drawer-head">
          <b>Chapters</b> <small>· Các chương</small>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>
        <ol>
          {chapters.map((ch, i) => (
            <li key={ch.id}>
              <button type="button" className={i === current ? 'is-current' : ''} onClick={() => onJump(i)}>
                <span className="ch-num">{i + 1}</span>
                <span>
                  <b>{ch.title.en}</b>
                  <small>{ch.title.vi}</small>
                </span>
              </button>
            </li>
          ))}
        </ol>
        <p className="drawer-help">
          ⌨ → / Space: next · ←: back · Esc: close
          <br />
          Nhấn mũi tên cạnh Oppy hoặc chạm vào Oppy để đi tiếp.
        </p>
      </nav>
    </div>
  );
}

export function SettingsPanel({ narrator, settings, setSettings, onClose }) {
  const current = narrator.pickVoice(settings.voiceURI);
  return (
    <div className="drawer-backdrop" onClick={onClose} role="presentation">
      <div className="settings" onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Voice settings">
        <div className="drawer-head">
          <b>Narrator</b> <small>· Giọng kể</small>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>
        {!narrator.supported ? (
          <p>This browser has no text-to-speech. Try Edge or Chrome. · Trình duyệt này không hỗ trợ đọc. Hãy dùng Edge hoặc Chrome.</p>
        ) : (
          <>
            <label>
              Voice · Giọng đọc
              <select value={current?.voiceURI || ''} onChange={(e) => setSettings((s) => ({ ...s, voiceURI: e.target.value }))}>
                {narrator.voices.length === 0 && <option value="">Default</option>}
                {narrator.voices.map((v) => (
                  <option key={v.voiceURI} value={v.voiceURI}>
                    {v.name} ({v.lang})
                  </option>
                ))}
              </select>
            </label>
            <label>
              Speed · Tốc độ: <b>{settings.rate.toFixed(2)}×</b>
              <input
                type="range"
                min="0.7"
                max="1.3"
                step="0.05"
                value={settings.rate}
                onChange={(e) => setSettings((s) => ({ ...s, rate: Number(e.target.value) }))}
              />
            </label>
            <button
              type="button"
              className="next-btn"
              onClick={() => narrator.speak("Hi! I'm Oppy, the rover who never gave up.", { rate: settings.rate, voiceURI: current?.voiceURI })}
            >
              🔊 Test voice · Nghe thử
            </button>
            <p className="tip">
              Tip: Microsoft Edge has the most natural English voices (e.g. "Aria" or "Jenny Online (Natural)").
              <br />
              Mẹo: Edge có giọng tiếng Anh tự nhiên nhất.
            </p>
          </>
        )}
        <div className="drawer-head sound-head">
          <b>Sound</b> <small>· Âm thanh</small>
        </div>
        <label className="check">
          <input type="checkbox" checked={settings.music} onChange={(e) => setSettings((s) => ({ ...s, music: e.target.checked }))} />
          ♪ Background music · Nhạc nền
        </label>
        <label>
          Music volume · Âm lượng nhạc: <b>{Math.round(settings.musicVol * 100)}%</b>
          <input
            type="range"
            min="0.1"
            max="1"
            step="0.05"
            value={settings.musicVol}
            disabled={!settings.music}
            onChange={(e) => setSettings((s) => ({ ...s, musicVol: Number(e.target.value) }))}
          />
        </label>
        <label className="check">
          <input type="checkbox" checked={settings.sfx} onChange={(e) => setSettings((s) => ({ ...s, sfx: e.target.checked }))} />
          💥 Sound effects · Hiệu ứng âm thanh
        </label>
        <label>
          Effects volume · Âm lượng hiệu ứng: <b>{Math.round(settings.sfxVol * 100)}%</b>
          <input
            type="range"
            min="0.1"
            max="1"
            step="0.05"
            value={settings.sfxVol}
            disabled={!settings.sfx}
            onChange={(e) => setSettings((s) => ({ ...s, sfxVol: Number(e.target.value) }))}
          />
        </label>
        <p className="tip">
          All music and sounds are made by the app itself (no recordings), so there is no copyright. The music gets quieter while Oppy talks.
          <br />
          Nhạc và âm thanh do chính ứng dụng tạo ra (không dùng file ghi âm) nên không có bản quyền. Nhạc tự nhỏ lại khi Oppy nói.
        </p>
      </div>
    </div>
  );
}

export function Lightbox({ photoKey, onClose }) {
  const p = photos[photoKey];
  if (!p) return null;
  return (
    <div className="lightbox" role="dialog" aria-modal="true" aria-label={p.title.en} onClick={onClose}>
      <figure onClick={(e) => e.stopPropagation()}>
        <img src={p.src} alt={p.title.en} />
        <figcaption>
          <h3>{p.title.en}</h3>
          <h4>{p.title.vi}</h4>
          <p lang="en">{p.caption.en}</p>
          <p lang="vi" className="vi">
            {p.caption.vi}
          </p>
          <p className="credit">
            Credit: {p.credit} ·{' '}
            <a href={p.link} target="_blank" rel="noreferrer">
              NASA source ↗
            </a>
          </p>
        </figcaption>
        <button type="button" className="icon-btn close" onClick={onClose} aria-label="Close">
          ✕
        </button>
      </figure>
    </div>
  );
}
