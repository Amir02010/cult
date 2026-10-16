import { useCallback, useEffect, useState } from 'react';

const MUTE_KEY = 'cult.muted';

/* Browsers refuse to play audio until the visitor has interacted with the page.
   Safari in particular ties the permission to the element that was started
   during the gesture, so we keep one element per sound and "unlock" that exact
   element on the first tap. Everything here fails silently: a silent visit is
   the correct outcome, never an error. */
const cache = new Map();
let unlocked = false;
/* Set while a real, audible playback is in flight, so the silent unlock does
   not pause it out from under us — that race aborts the sound. */
let playingForReal = false;
const listeners = new Set();

function getAudio(src) {
  let audio = cache.get(src);
  if (!audio) {
    audio = new Audio(src);
    audio.preload = 'auto';
    cache.set(src, audio);
  }
  return audio;
}

export function isMuted() {
  try {
    return localStorage.getItem(MUTE_KEY) === '1';
  } catch (err) {
    return false;
  }
}

export function setMuted(value) {
  try {
    localStorage.setItem(MUTE_KEY, value ? '1' : '0');
  } catch (err) {
    /* private mode — the choice just will not persist */
  }
}

export function isUnlocked() {
  return unlocked;
}

export function onUnlock(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function markUnlocked() {
  if (unlocked) return;
  unlocked = true;
  listeners.forEach((fn) => {
    try {
      fn();
    } catch (err) {
      /* ignore */
    }
  });
}

/**
 * Starts and immediately stops the element inside a user gesture, which is what
 * actually grants permission. Safe to call as often as you like.
 */
export function unlockAudio(src) {
  if (unlocked || playingForReal) return Promise.resolve(true);
  const audio = getAudio(src);
  const previous = audio.volume;
  audio.volume = 0;
  const attempt = audio.play();
  if (attempt && typeof attempt.then === 'function') {
    return attempt
      .then(() => {
        if (!playingForReal) {
          audio.pause();
          audio.currentTime = 0;
          audio.volume = previous;
        }
        markUnlocked();
        return true;
      })
      .catch(() => {
        if (!playingForReal) audio.volume = previous;
        return false;
      });
  }
  markUnlocked();
  return Promise.resolve(true);
}

/**
 * Checks whether audio would be allowed right now, without making a sound:
 * volume is irrelevant to the autoplay rules, so this is blocked in exactly the
 * same cases as the real thing.
 */
export function probeAudio(src) {
  return unlockAudio(src);
}

export function playSound(src, volume = 0.45) {
  if (isMuted()) return Promise.resolve(false);
  try {
    const audio = getAudio(src);
    playingForReal = true;
    audio.currentTime = 0;
    audio.volume = Math.max(0, Math.min(1, volume));
    const attempt = audio.play();
    const settle = (ok) => {
      playingForReal = false;
      if (ok) markUnlocked();
      return ok;
    };
    if (attempt && typeof attempt.then === 'function') {
      return attempt.then(() => settle(true)).catch(() => settle(false));
    }
    return Promise.resolve(settle(true));
  } catch (err) {
    playingForReal = false;
    return Promise.resolve(false);
  }
}

export function preloadSound(src) {
  try {
    getAudio(src).load();
  } catch (err) {
    /* ignore */
  }
}

/** Any tap anywhere on the site unlocks the intro sound for this tab. */
export function listenForGesture(src) {
  if (typeof window === 'undefined') return undefined;
  const handler = () => {
    unlockAudio(src);
  };
  const events = ['pointerdown', 'keydown', 'touchstart'];
  events.forEach((e) => window.addEventListener(e, handler, { passive: true }));
  return () => events.forEach((e) => window.removeEventListener(e, handler));
}

/** React binding for the mute switch. */
export default function useSoundSetting() {
  const [muted, setMutedState] = useState(isMuted);

  const toggle = useCallback(() => {
    setMutedState((prev) => {
      const next = !prev;
      setMuted(next);
      return next;
    });
  }, []);

  useEffect(() => {}, []);

  return { muted, toggle };
}
