import React, { useEffect, useState } from 'react';
import Icon from '../ui/Icon';
import { useApp } from '../../context/AppContext';
import { useCart } from '../../context/CartContext';
import './DishModal.css';

export default function DishModal({ item, onClose }) {
  const { t, p, money } = useApp();
  const cart = useCart();
  const [qty, setQty] = useState(1);

  useEffect(() => {
    setQty(1);
  }, [item]);

  useEffect(() => {
    if (!item) return undefined;
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [item, onClose]);

  if (!item) return null;

  const addToCart = () => {
    cart.add(item, qty);
    onClose();
    cart.setOpen(true);
  };

  return (
    <div className="dish-modal is-open" role="dialog" aria-modal="true" aria-label={p(item.name)}>
      <button type="button" className="dish-modal__scrim" onClick={onClose} aria-label={t('nav.close')} />

      <div className="dish-modal__card">
        <button type="button" className="dish-modal__close icon-btn" onClick={onClose} aria-label={t('nav.close')}>
          <Icon name="close" size={20} />
        </button>

        <div
          className="dish-modal__photo"
          style={item.image ? { backgroundImage: `url(${item.image})` } : undefined}
        />

        <div className="dish-modal__body">
          {item.popular && <span className="label dish-modal__flag">{t('menu.popular')}</span>}
          <h3 className="dish-modal__name display">{p(item.name)}</h3>
          <p className="dish-modal__desc">{p(item.description)}</p>

          <div className="dish-modal__meta">
            <span className="dish-modal__price">{money(item.price)}</span>
            {item.weight ? (
              <span className="label muted">
                {item.weight} {t('common.gram')}
              </span>
            ) : null}
          </div>

          <div className="dish-modal__actions">
            <div className="qty">
              <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="-">
                <Icon name="minus" size={14} />
              </button>
              <span>{qty}</span>
              <button type="button" onClick={() => setQty((q) => Math.min(50, q + 1))} aria-label="+">
                <Icon name="plus" size={14} />
              </button>
            </div>
            <button type="button" className="btn btn--solid dish-modal__add" onClick={addToCart}>
              {t('menu.add')} · {money(item.price * qty)}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
