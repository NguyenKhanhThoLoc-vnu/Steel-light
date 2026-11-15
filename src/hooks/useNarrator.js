import { useCallback, useEffect, useRef, useState } from 'react';

// Built-in browser text-to-speech (Web Speech API). Free, no API key, works offline
// with the voices installed on the computer. Edge has the most natural voices
// ("Microsoft Aria/Jenny Online (Natural)").
const PREFERRED = [/aria/i, /jenny/i, /ana\b/i, /natural/i, /google us english/i, /samantha/i, /zira/i, /guy/i, /david/i];

// Split into sentences without breaking decimals like "42.195".
export function splitSentences(text) {
  const out = [];
  const re = /[.!?…]+["'”’)]*(\s+|$)/g;
  let last = 0;
  let m;
  while ((m = re.exec(text))) {
    const end = m.index + m[0].length;
    if (end === last) {
      re.lastIndex++;
      continue;
    }
    out.push(text.slice(last, end));
    last = end;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

export function useNarrator() {
  const synth = typeof window !== 'undefined' ? window.speechSynthesis : undefined;
  const supported = !!synth && typeof window.SpeechSynthesisUtterance !== 'undefined';
  const [voices, setVoices] = useState([]);
  const [speaking, setSpeaking] = useState(false);
  const [progress, setProgress] = useState(-1); // characters already spoken; -1 = idle
  const token = useRef(0);
  const timer = useRef(null);

  useEffect(() => {
    if (!supported) return undefined;
    const load = () => setVoices(synth.getVoices().filter((v) => /^en([-_]|$)/i.test(v.lang)));
    load();
    synth.addEventListener?.('voiceschanged', load);
    return () => synth.removeEventListener?.('voiceschanged', load);
  }, [supported, synth]);

  const pickVoice = useCallback(
    (uri) => {
      if (uri) {
        const chosen = voices.find((v) => v.voiceURI === uri);
        if (chosen) return chosen;
      }
      const us = voices.filter((v) => /en[-_]US/i.test(v.lang));
      for (const re of PREFERRED) {
        const v = us.find((x) => re.test(x.name)) || voices.find((x) => re.test(x.name));
        if (v) return v;
      }
      return us[0] || voices[0] || null;
    },
    [voices],
  );

  const stop = useCallback(() => {
    token.current += 1;
    clearTimeout(timer.current);
    if (supported) synth.cancel();
    setSpeaking(false);
    setProgress(-1);
  }, [supported, synth]);

  const speak = useCallback(
    (text, { rate = 1, voiceURI, onEnd } = {}) => {
      token.current += 1;
      const my = token.current;
      clearTimeout(timer.current);
      if (!supported || !text) {
        onEnd?.();
        return;
      }
      synth.cancel();
      const parts = splitSentences(text);
      const voice = pickVoice(voiceURI);
      setSpeaking(true);
      setProgress(0);
      // Chrome sometimes drops an utterance queued right after cancel(); wait a beat.
      timer.current = setTimeout(() => {
        if (my !== token.current) return;
        let offset = 0;
        const lastIndex = parts.length - 1;
        parts.forEach((part, i) => {
          const start = offset;
          offset += part.length;
          const finish = () => {
            if (my !== token.current) return;
            setProgress((p) => Math.max(p, start + part.length));
            if (i === lastIndex) {
              setSpeaking(false);
              onEnd?.();
            }
          };
          if (!part.trim()) {
            if (i === lastIndex) setTimeout(finish, 0);
            return;
          }
          const u = new SpeechSynthesisUtterance(part.trim());
          if (voice) {
            u.voice = voice;
            u.lang = voice.lang;
          } else {
            u.lang = 'en-US';
          }
          u.rate = rate;
          u.pitch = 1.08;
          u.onstart = () => {
            if (my === token.current) setProgress((p) => Math.max(p, start));
          };
          u.onboundary = (e) => {
            if (my !== token.current || e.name === 'sentence') return;
            setProgress((p) => Math.max(p, start + e.charIndex + (e.charLength || 0)));
          };
          u.onend = finish;
          u.onerror = finish;
          synth.speak(u);
        });
      }, 90);
    },
    [supported, synth, pickVoice],
  );

  useEffect(() => () => supported && synth.cancel(), [supported, synth]);

  return { supported, voices, speaking, progress, speak, stop, pickVoice };
}
