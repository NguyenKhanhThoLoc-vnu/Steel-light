import { useEffect, useRef, useState } from 'react';

/**
 * Auto-play helper for the mini-games: while `active`, counts down `seconds`
 * (returns the seconds left, for a label) and then calls `onFire` once.
 * Turning `active` off (e.g. the player pressed Start) cancels it.
 */
export function useAutoTimer(active, seconds, onFire) {
  const [left, setLeft] = useState(seconds);
  const fire = useRef(onFire);
  fire.current = onFire;

  useEffect(() => {
    if (!active) return undefined;
    const end = performance.now() + seconds * 1000;
    setLeft(seconds);
    const id = setInterval(() => {
      const ms = end - performance.now();
      if (ms <= 0) {
        clearInterval(id);
        setLeft(0);
        fire.current();
        return;
      }
      setLeft(Math.ceil(ms / 1000));
    }, 200);
    return () => clearInterval(id);
  }, [active, seconds]);

  return active ? left : null;
}
