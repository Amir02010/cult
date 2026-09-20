import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../ui/Icon';
import GeoPanel from '../geo/GeoPanel';
import api from '../../api/api';
import { useApp } from '../../context/AppContext';
import { useCart } from '../../context/CartContext';
import { useGeo } from '../../context/GeoContext';
import './CartDrawer.css';

export default function CartDrawer() {
  const { t, p, money, tables, settings, toast } = useApp();
  const cart = useCart();
  const geo = useGeo();
  const navigate = useNavigate();
  const [sending, setSending] = useState(false);
  const [guestName, setGuestName] = useState('');
  const [comment, setComment] = useState('');

  const open = cart.open;
  const close = () => cart.setOpen(false);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && close();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const requireTable = settings ? settings.requireTable !== false : true;
  const orderingEnabled = settings ? settings.orderingEnabled !== false : true;
  const tableMissing = requireTable && !cart.table;
  const canSubmit =
    cart.detailed.length > 0 && geo.canOrder && !tableMissing && orderingEnabled && !sending;

  async function submit(e) {
    e.preventDefault();
    if (!canSubmit) return;
    setSending(true);
    try {
      const result = await api.createOrder({
        items: cart.lines,
        tableCode: cart.table,
        comment,
        guestName,
        geoToken: geo.token,
        deviceId: geo.deviceId,
      });
      cart.clear();
      setComment('');
      close();
      navigate(`/order/${result.id}`);
    } catch (err) {
      const code = err && err.code ? err.code : 'generic';
      const known = [
        'geo_required', 'geo_out_of_range', 'table_required',
        'empty_cart', 'ordering_disabled', 'network',
      ];
      toast(t(known.includes(code) ? `err.${code}` : 'err.generic'), 'error');
      if (code === 'geo_required' || code === 'geo_out_of_range') geo.check();
    } finally {
      setSending(false);
    }
  }

  return (
    <div className={`cart-drawer${open ? ' is-open' : ''}`} aria-hidden={!open}>
      <button type="button" className="cart-drawer__scrim" onClick={close} tabIndex={-1} aria-label={t('nav.close')} />

      <aside className="cart-drawer__panel" role="dialog" aria-modal="true" aria-label={t('cart.title')}>
        <header className="cart-drawer__head">
          <h2 className="cart-drawer__title display">{t('cart.title')}</h2>
          <button type="button" className="icon-btn" onClick={close} aria-label={t('nav.close')}>
            <Icon name="close" size={20} />
          </button>
        </header>

        {cart.detailed.length === 0 ? (
          <div className="cart-drawer__empty">
            <Icon name="cart" size={34} strokeWidth={0.9} />
            <p>{t('cart.empty')}</p>
            <span className="label muted">{t('cart.emptyHint')}</span>
          </div>
        ) : (
          <form className="cart-drawer__form" onSubmit={submit}>
            <ul className="cart-lines">
              {cart.detailed.map((line) => (
                <li key={line.id} className="cart-line">
                  <span
                    className="cart-line__thumb"
                    style={line.item.image ? { backgroundImage: `url(${line.item.image})` } : undefined}
                  />
                  <div className="cart-line__body">
                    <p className="cart-line__name">{p(line.item.name)}</p>
                    <p className="cart-line__price">{money(line.item.price)}</p>
                  </div>
                  <div className="qty">
                    <button type="button" onClick={() => cart.setQty(line.id, line.qty - 1)} aria-label="-">
                      <Icon name="minus" size={14} />
                    </button>
                    <span>{line.qty}</span>
                    <button type="button" onClick={() => cart.setQty(line.id, line.qty + 1)} aria-label="+">
                      <Icon name="plus" size={14} />
                    </button>
                  </div>
                  <button
                    type="button"
                    className="cart-line__remove"
                    onClick={() => cart.remove(line.id)}
                    aria-label={t('cart.clear')}
                  >
                    <Icon name="trash" size={16} />
                  </button>
                </li>
              ))}
            </ul>

            <div className="cart-drawer__fields">
              <GeoPanel />

              {requireTable && (
                <label className="field">
                  <span>{t('cart.table')}</span>
                  <select
                    className="select"
                    value={cart.table}
                    onChange={(e) => cart.setTable(e.target.value)}
                    required
                  >
                    <option value="">{t('cart.tablePick')}</option>
                    {tables.map((tbl) => (
                      <option key={tbl.code} value={tbl.code}>
                        {tbl.name}
                        {tbl.zone ? ` — ${tbl.zone}` : ''}
                      </option>
                    ))}
                  </select>
                </label>
              )}

              <label className="field">
                <span>{t('cart.name')}</span>
                <input
                  className="input"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  maxLength={80}
                />
              </label>

              <label className="field">
                <span>{t('cart.comment')}</span>
                <textarea
                  className="textarea"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder={t('cart.commentHint')}
                  maxLength={500}
                />
              </label>
            </div>

            <footer className="cart-drawer__foot">
              <div className="cart-drawer__total">
                <span className="label muted">{t('cart.total')}</span>
                <strong>{money(cart.total)}</strong>
              </div>
              <button type="submit" className="btn btn--solid btn--block" disabled={!canSubmit}>
                {sending ? t('cart.sending') : t('cart.checkout')}
              </button>
              <button type="button" className="cart-drawer__clear label" onClick={cart.clear}>
                {t('cart.clear')}
              </button>
            </footer>
          </form>
        )}
      </aside>
    </div>
  );
}
