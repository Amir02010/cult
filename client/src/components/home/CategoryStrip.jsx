import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../ui/Icon';
import useTilt from '../../hooks/useTilt';
import { useApp } from '../../context/AppContext';
import './CategoryStrip.css';

export function CategoryCard({ category, index = 0 }) {
  const { p } = useApp();
  const tiltRef = useTilt({ max: 11, scale: 1.04 });
  /* `rise` lives on the wrapper: an animation with fill-mode would otherwise
     overwrite the transform the tilt writes on the card itself. */
  return (
    <span
      className="cat-card-wrap rise"
      style={{ animationDelay: `${0.35 + index * 0.07}s` }}
    >
    <Link
      ref={tiltRef}
      to={`/menu/${category.slug}`}
      className="cat-card tilt"
      aria-label={p(category.name)}
    >
      <span className="cat-card__frame">
        <span
          className="cat-card__photo"
          style={category.image ? { backgroundImage: `url(${category.image})` } : undefined}
          role="img"
          aria-label={p(category.name)}
        />
        <span className="cat-card__veil" />
        <span className="cat-card__body">
          <span className="cat-card__icon">
            <Icon name={category.icon} size={22} strokeWidth={1.1} />
          </span>
          <span className="cat-card__name">{p(category.name)}</span>
          <span className="cat-card__arrow">
            <Icon name="arrowRight" size={17} strokeWidth={1.1} />
          </span>
        </span>
        <span className="cat-card__sheen" />
      </span>
    </Link>
    </span>
  );
}

const TYPES = ['kitchen', 'bar'];
const typeOf = (c) => c.menuType || 'kitchen';

/* Сколько карточек помещается в ряд без прокрутки — под это число
   рассчитан макет. Больше — карточки получают фиксированную ширину,
   а полоса начинает прокручиваться, вместо того чтобы сжиматься в точки. */
const FIT = 7;

/**
 * Полоса категорий.
 *
 * Если в меню есть и кухня, и бар, сверху появляются вкладки «Кухня / Бар».
 * Вкладка может управляться снаружи (type + onTypeChange — так делает
 * страница меню, чтобы показывать только разделы выбранной вкладки) или
 * жить внутри полосы (главная страница).
 */
export default function CategoryStrip({ categories, type, onTypeChange }) {
  const { t } = useApp();
  const trackRef = useRef(null);
  const [ownType, setOwnType] = useState('kitchen');
  const [edges, setEdges] = useState({ prev: false, next: false });

  const types = useMemo(
    () => TYPES.filter((tp) => (categories || []).some((c) => typeOf(c) === tp)),
    [categories]
  );
  const tabbed = types.length > 1;
  const current = type || ownType;

  const shown = useMemo(
    () => (tabbed ? (categories || []).filter((c) => typeOf(c) === current) : categories || []),
    [categories, tabbed, current]
  );
  const many = shown.length > FIT;

  const selectType = (next) => {
    setOwnType(next);
    if (onTypeChange) onTypeChange(next);
    if (trackRef.current) trackRef.current.scrollTo({ left: 0 });
  };

  /* Стрелки видны только когда есть куда листать. */
  const measure = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setEdges({ prev: el.scrollLeft > 4, next: el.scrollLeft < max - 4 });
  }, []);

  useEffect(() => {
    measure();
    const el = trackRef.current;
    if (!el) return undefined;
    el.addEventListener('scroll', measure, { passive: true });
    window.addEventListener('resize', measure);
    return () => {
      el.removeEventListener('scroll', measure);
      window.removeEventListener('resize', measure);
    };
  }, [measure, shown]);

  const scrollBy = (dir) => {
    const el = trackRef.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: 'smooth' });
  };

  if (!categories || categories.length === 0) return null;

  return (
    <div
      className={`cat-strip${many ? ' cat-strip--many' : ''}`}
      data-prev={edges.prev || undefined}
      data-next={edges.next || undefined}
    >
      {(tabbed || many) && (
        <div className="cat-strip__bar">
          {tabbed ? (
            <div className="cat-strip__types" role="tablist" aria-label={t('menu.title')}>
              {types.map((tp) => (
                <button
                  key={tp}
                  type="button"
                  role="tab"
                  aria-selected={current === tp}
                  className={`cat-strip__type label${current === tp ? ' is-active' : ''}`}
                  onClick={() => selectType(tp)}
                >
                  <Icon name={tp === 'bar' ? 'cocktail' : 'steak'} size={15} />
                  {t(`menu.${tp}`)}
                  <em>{(categories || []).filter((c) => typeOf(c) === tp).length}</em>
                </button>
              ))}
            </div>
          ) : (
            <span />
          )}

          {many && (
            <div className="cat-strip__arrows">
              <button
                type="button"
                className="cat-strip__arrow"
                onClick={() => scrollBy(-1)}
                disabled={!edges.prev}
                aria-label={t('menu.prev')}
              >
                <Icon name="arrowLeft" size={18} strokeWidth={1.1} />
              </button>
              <button
                type="button"
                className="cat-strip__arrow"
                onClick={() => scrollBy(1)}
                disabled={!edges.next}
                aria-label={t('menu.next')}
              >
                <Icon name="arrowRight" size={18} strokeWidth={1.1} />
              </button>
            </div>
          )}
        </div>
      )}

      {/* key по вкладке — карточки новой вкладки входят заново, с анимацией */}
      <div className="cat-strip__viewport">
        <div className="cat-strip__track" ref={trackRef} key={current}>
          {shown.map((category, i) => (
            <CategoryCard key={category.id} category={category} index={Math.min(i, 8)} />
          ))}
        </div>
      </div>
    </div>
  );
}
