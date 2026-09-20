import React from 'react';
import Icon from '../ui/Icon';
import useTilt from '../../hooks/useTilt';
import useReveal from '../../hooks/useReveal';
import { useApp } from '../../context/AppContext';
import { useCart } from '../../context/CartContext';
import './DishCard.css';

/* Several dishes can share one photo until the owner uploads their own.
   A deterministic offset keeps a category from looking like the same tile
   repeated four times. */
const FRAMES = ['50% 42%', '38% 55%', '62% 48%', '46% 62%', '55% 35%'];

function frameOf(id) {
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) hash = (hash * 31 + id.charCodeAt(i)) % 997;
  return FRAMES[hash % FRAMES.length];
}

export default function DishCard({ item, onOpen, index = 0 }) {
  const { t, p, money } = useApp();
  const cart = useCart();
  const qty = cart.qtyOf(item.id);
  const tiltRef = useTilt({ max: 8.5, scale: 1.025 });
  const revealRef = useReveal();

  return (
    <div
      ref={revealRef}
      className="dish-wrap reveal reveal--scale"
      style={{ '--reveal-delay': `${Math.min(index, 7) * 0.07}s` }}
    >
      <article ref={tiltRef} className="dish tilt">
        <button
          type="button"
          className="dish__media"
          onClick={() => onOpen(item)}
          aria-label={p(item.name)}
        >
          <span
            className="dish__photo"
            style={
              item.image
                ? { backgroundImage: `url(${item.image})`, backgroundPosition: frameOf(item.id) }
                : undefined
            }
          />
          <span className="dish__shade" />
          <span className="dish__sheen" />
          {item.popular && <span className="dish__flag label">{t('menu.popular')}</span>}
          <span className="dish__zoom">
            <Icon name="search" size={17} strokeWidth={1.2} />
          </span>
        </button>

        <div className="dish__body">
          <button type="button" className="dish__name" onClick={() => onOpen(item)}>
            {p(item.name)}
          </button>
          <p className="dish__desc">{p(item.description)}</p>

          <div className="dish__foot">
            <span className="dish__price">
              {money(item.price)}
              {item.weight ? <em>{item.weight} {t('common.gram')}</em> : null}
            </span>

            {qty > 0 ? (
              <div className="qty">
                <button type="button" onClick={() => cart.setQty(item.id, qty - 1)} aria-label="-">
                  <Icon name="minus" size={14} />
                </button>
                <span key={qty} className="pop">{qty}</span>
                <button type="button" onClick={() => cart.setQty(item.id, qty + 1)} aria-label="+">
                  <Icon name="plus" size={14} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                className="btn btn--sm dish__add shine"
                onClick={() => cart.add(item)}
              >
                <Icon name="plus" size={14} />
                {t('menu.add')}
              </button>
            )}
          </div>
        </div>

        <span className="tilt__glare" aria-hidden="true" />
      </article>
    </div>
  );
}
