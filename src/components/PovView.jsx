import { useEffect } from 'react';
import { Engineer, LabScene } from '../art/Scenes.jsx';
import { sound } from '../audio/sound.js';

// First-person views, seen through Oppy's own camera eyes. CSS: .pov* in styles.css.
//  mode 'wake'  (chapter 1): the eyes open for the very first time in the dark JPL lab:
//               blurry → sharp, the lamps switch on, the team in front waves hello.
//  mode 'sleep' (chapter 10): the dark 2018 dust storm with a dying-battery readout;
//               the eyelids slowly close (with a couple of heavy blinks) and fade to black.

const DUST = Array.from({ length: 26 }, (_, i) => ({
  top: (i * 37) % 92,
  delay: -((i * 0.53) % 4),
  dur: 2.6 + ((i * 0.71) % 2.4),
  w: 6 + ((i * 13) % 26),
}));

function Corners() {
  return (
    <div className="pov-frame">
      <i className="c tl" />
      <i className="c tr" />
      <i className="c bl" />
      <i className="c br" />
    </div>
  );
}

function WakeView() {
  useEffect(() => sound.sfx.boot(), []); // power-on tone, boot blips, lamps clicking on
  return (
    <div className="pov pov-wake" aria-hidden="true">
      <div className="pov-world">
        <LabScene set={{ wake: true }} revealed />
        {/* the team, standing right in front of the camera */}
        <div className="pov-crew">
          <div className="crew c1">
            <Engineer wave visor="#4a6ad8" />
          </div>
          <div className="crew c2">
            <Engineer item="clipboard" visor="#f08a3c" />
            <span className="crew-bubble">
              Hello, Oppy! <small>Chào Oppy!</small>
            </span>
          </div>
          <div className="crew c3">
            <Engineer wave visor="#45b3a7" />
          </div>
        </div>
      </div>
      <div className="pov-noise" />
      <Corners />
      <div className="pov-hud">
        <span className="pov-rec">
          <em className="a">● CAMERAS · BOOTING…</em>
          <em className="b">● CAMERAS · ONLINE</em>
        </span>
        <span className="pov-sol">2003 · JPL, PASADENA</span>
        <span className="pov-batt is-full">
          <b>
            <i />
          </b>
          100%
        </span>
      </div>
      <div className="pov-lid top" />
      <div className="pov-lid bottom" />
    </div>
  );
}

export default function PovView({ mode = 'sleep' }) {
  if (mode === 'wake') return <WakeView />;
  return <SleepView />;
}

function SleepView() {
  useEffect(() => sound.sfx.powerDown(6.2), []); // a falling power-down tone as the eyes close
  return (
    <div className="pov" aria-hidden="true">
      <div className="pov-world">
        <div className="pov-sky" />
        <div className="pov-sun" />
        <svg className="pov-hills" viewBox="0 0 1600 300" preserveAspectRatio="none">
          <path className="far" d="M0 300 L0 120 C200 90 380 150 600 130 S1000 70 1250 110 S1500 140 1600 120 L1600 300 Z" />
          <path className="near" d="M0 300 L0 60 C260 110 520 230 800 250 C1080 230 1340 110 1600 60 L1600 300 Z" />
        </svg>
        <div className="pov-ground">
          <i style={{ left: '14%', top: '30%', width: '9%' }} />
          <i style={{ left: '62%', top: '18%', width: '6%' }} />
          <i style={{ left: '40%', top: '60%', width: '14%' }} />
          <i style={{ left: '80%', top: '54%', width: '10%' }} />
        </div>
        <div className="pov-dust">
          {DUST.map((d, i) => (
            <i key={i} style={{ top: `${d.top}%`, width: `${d.w}vw`, animationDelay: `${d.delay}s`, animationDuration: `${d.dur}s` }} />
          ))}
        </div>
      </div>
      <div className="pov-noise" />
      <Corners />
      <div className="pov-hud">
        <span className="pov-rec">● PANCAM · LEFT EYE</span>
        <span className="pov-sol">SOL 5111 · JUNE 10, 2018</span>
        <span className="pov-batt">
          <b>
            <i />
          </b>
          1%
        </span>
        <span className="pov-warn">⚠ LOW POWER · SKY OPACITY (TAU) ≈ 10.8</span>
      </div>
      <p className="pov-note">
        ★ The famous words "My battery is low and it's getting dark" were a reporter's poetic summary of my last data, not a real message.
        <small>Câu nói nổi tiếng này là lời tóm tắt đầy chất thơ của một phóng viên dựa trên dữ liệu cuối cùng của tôi, không phải tin nhắn thật.</small>
      </p>
      <div className="pov-lid top" />
      <div className="pov-lid bottom" />
      <div className="pov-black">
        <span>z z z</span>
      </div>
    </div>
  );
}
