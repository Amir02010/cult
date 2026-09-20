import React, { useCallback, useEffect, useRef, useState } from 'react';
import Icon from './Icon';
import useSoundSetting, {
  isMuted,
  listenForGesture,
  playSound,
  preloadSound,
  probeAudio,
  unlockAudio,
} from '../../hooks/useSound';
import './DragonLoader.css';

const FLY_SOUND = `${process.env.PUBLIC_URL}/sounds/dragon-fly.mp3`;

/* Minimum time the intro stays on screen: a loader that blinks for 80 ms reads
   as a glitch rather than as part of the brand. */
const MIN_VISIBLE = 1500;
/* When sound is blocked we hold the intro a little longer so the guest has a
   real chance to tap for it. Tapping ends the intro immediately, so the wait
   only ever applies to people who ignore the hint. */
const MIN_VISIBLE_WITH_HINT = 2600;
const EXIT_DURATION = 1100;
/* Предохранитель: что бы ни случилось с сетью или геолокацией, интро обязано
   уйти и показать то, что под ним, — иначе гость смотрит на дракона вечно. */
const MAX_VISIBLE = 7000;

/**
 * The CULT intro: the dragon from the hero flies in, circles while the menu
 * loads, then flies off to the right with a wingbeat.
 *
 * Sound is best-effort. A browser will not play audio before the visitor has
 * touched the page, so on a cold open the whoosh is usually blocked. When that
 * happens the screen offers a quiet "tap for sound" hint instead of failing —
 * one tap unlocks it and sends the dragon off early.
 */
export default function DragonLoader({ ready, onDone }) {
  const [phase, setPhase] = useState('in'); // in → hold → out
  const [needsTap, setNeedsTap] = useState(false);
  const startedAt = useRef(Date.now());
  const done = useRef(false);
  const leaving = useRef(false);
  const readyRef = useRef(ready);
  const { muted, toggle } = useSoundSetting();

  readyRef.current = ready;

  useEffect(() => {
    preloadSound(FLY_SOUND);
    const stop = listenForGesture(FLY_SOUND);

    /* Ask the browser whether sound would be allowed. The probe is silent. */
    if (!isMuted()) {
      probeAudio(FLY_SOUND).then((ok) => {
        if (!ok) setNeedsTap(true);
      });
    }
    return stop;
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setPhase((p) => (p === 'in' ? 'hold' : p)), 1000);
    return () => clearTimeout(timer);
  }, []);

  const leave = useCallback(() => {
    if (done.current || leaving.current) return;
    leaving.current = true;
    /* Fired straight away, not inside a state updater: when the guest tapped,
       this call has to stay inside their gesture or the browser blocks it. */
    playSound(FLY_SOUND, 0.5);
    setPhase('out');
    setTimeout(() => {
      if (done.current) return;
      done.current = true;
      onDone();
    }, EXIT_DURATION);
  }, [onDone]);

  useEffect(() => {
    if (!ready || done.current) return undefined;
    const elapsed = Date.now() - startedAt.current;
    const floor = needsTap && !muted ? MIN_VISIBLE_WITH_HINT : MIN_VISIBLE;
    const timer = setTimeout(leave, Math.max(0, floor - elapsed));
    return () => clearTimeout(timer);
  }, [ready, leave, needsTap, muted]);

  useEffect(() => {
    const failsafe = setTimeout(leave, MAX_VISIBLE);
    return () => clearTimeout(failsafe);
  }, [leave]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  /* Tapping the intro grants audio permission; if the menu is already loaded
     the dragon takes off right away, so the tap is never a delay. */
  const onTap = () => {
    if (readyRef.current) {
      /* The tap itself is the permission — take off now, with sound. */
      leave();
      return;
    }
    if (needsTap) {
      unlockAudio(FLY_SOUND).then((ok) => ok && setNeedsTap(false));
    }
  };

  return (
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events
    <div
      className={`loader loader--${phase}`}
      role="status"
      aria-label="Загрузка меню"
      onClick={onTap}
    >
      <div className="loader__sky" aria-hidden="true" />

      <div className="loader__stage" aria-hidden="true">
        <span className="loader__ring" />
        <span className="loader__ring loader__ring--wide" />

        {/* Полёт (влёт и вылет) вынесен наружу, круги — внутрь: вложенные
            трансформации складываются сами, поэтому при смене фазы дракон
            нигде не «прыгает». Слои крыла, хвоста и головы анимируются
            независимо, отсюда и взмахи. */}
        <span className="loader__flight">
          <span className="loader__orbit">
            <span className="dragon">
              <img src={`${process.env.PUBLIC_URL}/images/dragon-tail.png`} alt="" className="dragon__l dragon__tail" />
              <img src={`${process.env.PUBLIC_URL}/images/dragon-body.png`} alt="" className="dragon__l dragon__body" />
              <img src={`${process.env.PUBLIC_URL}/images/dragon-wing.png`} alt="" className="dragon__l dragon__wing" />
              <img src={`${process.env.PUBLIC_URL}/images/dragon-head.png`} alt="" className="dragon__l dragon__head" />
            </span>
          </span>
        </span>

        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
          <span key={i} className="loader__ember" style={{ '--i': i }} />
        ))}
      </div>

      <button
        type="button"
        className="loader__sound"
        onClick={(e) => {
          e.stopPropagation();
          toggle();
        }}
        aria-label={muted ? 'Включить звук' : 'Выключить звук'}
        aria-pressed={!muted}
      >
        <Icon name={muted ? 'soundOff' : 'soundOn'} size={18} strokeWidth={1.3} />
        <span className="label">{muted ? 'Звук выкл.' : 'Звук'}</span>
      </button>

      <div className="loader__brand">
        <span className="loader__word">CULT</span>
        <span className="loader__sub">Restaurant</span>
        <span className="loader__bar">
          <i />
        </span>
        {needsTap && !muted && phase !== 'out' && (
          <span className="loader__hint label">Коснитесь экрана — со звуком</span>
        )}
      </div>
    </div>
  );
}
