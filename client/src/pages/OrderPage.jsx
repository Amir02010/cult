import React, { useCallback, useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import Icon from '../components/ui/Icon';
import OrderAccepted from '../components/order/OrderAccepted';
import api from '../api/api';
import { useApp } from '../context/AppContext';
import './OrderPage.css';

const FLOW = ['new', 'accepted', 'cooking', 'served'];

export default function OrderPage() {
  const { id } = useParams();
  const { t, p, money } = useApp();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState(false);
  const location = useLocation();
  /* 'sent' — гость только что отправил заказ, 'accepted' — официант его
     подтвердил. Оба момента показывают дракона, текст разный. */
  const [celebrate, setCelebrate] = useState(
    location.state && location.state.justSent ? 'sent' : null
  );

  const load = useCallback(async () => {
    try {
      setOrder(await api.order(id));
    } catch (err) {
      setError(true);
    }
  }, [id]);

  const status = order ? order.status : null;

  useEffect(() => {
    load();
  }, [load]);

  /* Пока заказ ждёт подтверждения, опрашиваем чаще: гость смотрит в экран и
     ждёт ответа официанта. Дальше спешить некуда. */
  useEffect(() => {
    const timer = setInterval(load, status === null || status === 'new' ? 4000 : 10000);
    return () => clearInterval(timer);
  }, [load, status]);

  /* Момент, ради которого всё затевалось: официант нажал «Принять».
     Показываем один раз на заказ — иначе окно всплывало бы при каждом
     возврате на страницу. */
  useEffect(() => {
    if (status !== 'accepted') return;
    const key = `cult.accepted.${id}`;
    try {
      if (localStorage.getItem(key) === '1') return;
      localStorage.setItem(key, '1');
    } catch (err) {
      /* приватный режим — покажем и не запомним, это лучше, чем не показать */
    }
    setCelebrate('accepted');
  }, [status, id]);

  const stepIndex = order ? FLOW.indexOf(order.status) : -1;
  const cancelled = order && order.status === 'cancelled';

  return (
    <div className="page">
      <Header />

      <main className="page-body shell order-page">
        {error && <p className="order-page__error">{t('err.generic')}</p>}

        {order && (
          <>
            <header className="order-head">
              <span className="order-head__icon">
                <Icon name={cancelled ? 'close' : 'check'} size={26} strokeWidth={1.1} />
              </span>
              <h1 className="display order-head__title">
                {cancelled ? t('order.status.cancelled') : t('order.accepted')}
              </h1>
              <p className="order-head__num label">
                {t('order.number')} · <strong>#{order.publicId}</strong>
                {order.tableName ? ` · ${t('cart.table')} ${order.tableName}` : ''}
              </p>
              {!cancelled && <p className="order-head__hint">{t('order.thanks')}</p>}
            </header>

            {!cancelled && (
              <ol className="order-flow">
                {FLOW.map((step, i) => (
                  <li
                    key={step}
                    className={`order-flow__step${i <= stepIndex ? ' is-done' : ''}${
                      i === stepIndex ? ' is-current' : ''
                    }`}
                  >
                    <span className="order-flow__dot" />
                    <span className="label">{t(`order.status.${step}`)}</span>
                  </li>
                ))}
              </ol>
            )}

            <section className="order-card">
              <ul className="order-lines">
                {order.items.map((line) => (
                  <li key={line.itemId}>
                    <span className="order-lines__name">{p(line.name)}</span>
                    <span className="order-lines__qty muted">× {line.qty}</span>
                    <span className="order-lines__sum">{money(line.sum)}</span>
                  </li>
                ))}
              </ul>

              {order.comment && (
                <p className="order-card__comment">
                  <span className="label muted">{t('cart.comment')}</span>
                  {order.comment}
                </p>
              )}

              <div className="order-card__total">
                <span className="label muted">{t('cart.total')}</span>
                <strong>{money(order.total)}</strong>
              </div>
            </section>

            <Link to="/menu" className="btn order-page__again">
              {t('order.newOrder')}
              <Icon name="arrowRight" size={16} />
            </Link>
          </>
        )}
      </main>

      <Footer />

      {celebrate && (
        <OrderAccepted
          key={celebrate}
          mode={celebrate}
          order={order}
          onClose={() => setCelebrate(null)}
        />
      )}
    </div>
  );
}
