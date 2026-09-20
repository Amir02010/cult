import React, { useEffect, useState } from 'react';
import Icon from '../ui/Icon';
import { playSound, preloadSound } from '../../hooks/useSound';
import { useApp } from '../../context/AppContext';
import './OrderAccepted.css';

const FLY_SOUND = `${process.env.PUBLIC_URL}/sounds/dragon-fly.mp3`;

/**
 * Окно «Заказ принят».
 *
 * Дракон влетает слева, делает взмах и складывается в точку, из которой
 * вырастает галочка. Вся раскадровка живёт в CSS на задержках: один класс
 * запускает её целиком, поэтому фазы не расходятся между собой, даже если
 * вкладка на секунду ушла в фон.
 */
export default function OrderAccepted({ order, onClose }) {
  const { t } = useApp();
  const [run, setRun] = useState(false);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    preloadSound(FLY_SOUND);
    /* Гость уже нажимал кнопки на этой странице, значит браузер разрешит
       звук. Если нет — playSound тихо проглотит отказ. */
    playSound(FLY_SOUND, 0.42);

    const id = requestAnimationFrame(() => setRun(true));
    document.body.style.overflow = 'hidden';
    return () => {
      cancelAnimationFrame(id);
      document.body.style.overflow = '';
    };
  }, []);

  const close = () => {
    if (leaving) return;
    setLeaving(true);
    setTimeout(onClose, 420);
  };

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && close();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      className={`ok${run ? ' ok--run' : ''}${leaving ? ' ok--out' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-label={t('accepted.title')}
    >
      <button type="button" className="ok__scrim" onClick={close} tabIndex={-1} aria-label="" />

      <div className="ok__card">
        <div className="ok__stage" aria-hidden="true">
          {/* дракон: те же слои, что и в заставке, поэтому узнаётся сразу */}
          <span className="ok__flight">
            <span className="ok__dragon">
              <img src={`${process.env.PUBLIC_URL}/images/dragon-tail.png`} alt="" className="ok__l ok__tail" />
              <img src={`${process.env.PUBLIC_URL}/images/dragon-body.png`} alt="" className="ok__l ok__body" />
              <img src={`${process.env.PUBLIC_URL}/images/dragon-wing.png`} alt="" className="ok__l ok__wing" />
              <img src={`${process.env.PUBLIC_URL}/images/dragon-head.png`} alt="" className="ok__l ok__head" />
            </span>
          </span>

          {/* вспышка в точке, где дракон сложился и откуда пойдёт галочка */}
          <span className="ok__spark" />

          <svg className="ok__mark" viewBox="0 0 100 100" aria-hidden="true">
            <circle className="ok__ring" cx="50" cy="50" r="44" />
            <path className="ok__tick" d="M30 52 L44 66 L71 36" />
          </svg>

          {[0, 1, 2, 3, 4, 5].map((i) => (
            <span key={i} className="ok__ember" style={{ '--i': i }} />
          ))}
        </div>

        <h2 className="display ok__title">{t('accepted.title')}</h2>
        {order && (
          <p className="ok__num label">
            {t('order.number')} · <strong>#{order.publicId}</strong>
          </p>
        )}
        <p className="ok__text">{t('accepted.text')}</p>

        <button type="button" className="btn ok__btn shine" onClick={close}>
          {t('accepted.close')}
          <Icon name="check" size={16} />
        </button>
      </div>
    </div>
  );
}
