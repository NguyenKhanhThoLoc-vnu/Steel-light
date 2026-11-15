import Rover from '../art/Rover.jsx';
import { MarsPlanet, Stars } from '../art/Scenes.jsx';
import { photos } from '../data/photos.js';

const SUBS_LABEL = { both: 'EN + VI', en: 'English', vi: 'Tiếng Việt', off: 'Off' };

export function TitleScreen({ onStart, settings, onToggle, narratorSupported }) {
  return (
    <div className="title-screen">
      <Stars count={160} seed={31} />
      <div className="title-mars">
        <MarsPlanet />
      </div>
      <div className="title-ground" />
      <div className="title-rover">
        <Rover mood="happy" />
      </div>

      <div className="title-card">
        <p className="kicker">A true story from Mars · Câu chuyện có thật từ sao Hỏa</p>
        <h1>
          I Am <span>Oppy</span>
        </h1>
        <p className="tagline">The little rover that would not quit</p>
        <p className="tagline-vi">Chú robot nhỏ không bao giờ bỏ cuộc</p>

        <button type="button" className="start-btn" onClick={onStart} autoFocus>
          ▶ Wake Oppy up <small>Đánh thức Oppy</small>
        </button>

        <div className="title-options">
          <button type="button" className={`opt${settings.narrate ? ' is-on' : ''}`} onClick={() => onToggle('narrate')}>
            {settings.narrate ? '🔊' : '🔇'} Narration: <b>{settings.narrate ? 'On' : 'Off'}</b>
          </button>
          <button type="button" className="opt" onClick={() => onToggle('subs')}>
            CC Subtitles: <b>{SUBS_LABEL[settings.subs]}</b>
          </button>
          <button type="button" className={`opt${settings.auto ? ' is-on' : ''}`} onClick={() => onToggle('auto')}>
            ⏵ Auto-play: <b>{settings.auto ? 'On' : 'Off'}</b>
          </button>
          <button type="button" className={`opt${settings.music ? ' is-on' : ''}`} onClick={() => onToggle('music')}>
            ♪ Music: <b>{settings.music ? 'On' : 'Off'}</b>
          </button>
          <button type="button" className={`opt${settings.sfx ? ' is-on' : ''}`} onClick={() => onToggle('sfx')}>
            💥 Sound effects: <b>{settings.sfx ? 'On' : 'Off'}</b>
          </button>
        </div>
        {!narratorSupported && <p className="warn">This browser cannot read aloud. Try Edge or Chrome. · Trình duyệt không hỗ trợ đọc.</p>}

        <ul className="how">
          <li>
            <b>➜</b> Tap the arrow next to Oppy (or Oppy itself) to move on · Nhấn mũi tên cạnh Oppy để đi tiếp
          </li>
          <li>
            <b>👆</b> Tap glowing things to explore · Nhấn vào vật phát sáng để khám phá
          </li>
          <li>
            <b>📷</b> Open the polaroids to see real NASA photos · Mở ảnh để xem ảnh thật của NASA
          </li>
        </ul>
      </div>
    </div>
  );
}

export function EndScreen({ onReplay, onChapters }) {
  const selfie = photos['dusty-selfie'];
  return (
    <div className="end-screen">
      <Stars count={200} seed={77} />
      <div className="end-card">
        <p className="kicker">Opportunity · 2004 – 2018</p>
        <h1>Thank you, Oppy</h1>
        <p className="tagline-vi">Cảm ơn Oppy</p>
        <div className="end-grid">
          <figure className="end-photo">
            <img src={selfie.src} alt={selfie.title.en} />
            <figcaption>
              {selfie.caption.en} <span>{selfie.credit}</span>
            </figcaption>
          </figure>
          <ul className="end-stats">
            <li>
              <b>~15 years</b>
              <span>instead of 90 days · thay vì 90 ngày</span>
            </li>
            <li>
              <b>45.16 km</b>
              <span>instead of 1 km · thay vì 1 km</span>
            </li>
            <li>
              <b>100+ craters</b>
              <span>studied · miệng hố đã nghiên cứu</span>
            </li>
            <li>
              <b>Water clues</b>
              <span>blueberries, gypsum, clays · việt quất, thạch cao, đất sét</span>
            </li>
          </ul>
        </div>
        <div className="end-actions">
          <button type="button" className="start-btn" onClick={onReplay}>
            ↺ Play again <small>Xem lại từ đầu</small>
          </button>
          <button type="button" className="opt" onClick={onChapters}>
            ☰ Choose a chapter · Chọn chương
          </button>
        </div>
        <p className="credits">
          Story told from Oppy&apos;s point of view, based on facts from NASA/JPL. Photos: NASA/JPL-Caltech, Cornell, USGS, ASU,
          Univ. of Arizona, MSSS, TAMU, KSC.
        </p>
      </div>
    </div>
  );
}
