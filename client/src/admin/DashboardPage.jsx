import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../components/ui/Icon';
import api from '../api/api';
import { useApp } from '../context/AppContext';
import { STATUS_LABEL } from './constants';

/** Counts a number up when it changes, so refreshed figures catch the eye. */
function CountUp({ value, format }) {
  const [shown, setShown] = useState(0);
  const from = useRef(0);

  useEffect(() => {
    const target = Number(value) || 0;
    const start = from.current;
    const startedAt = performance.now();
    const duration = 700;
    let raf = 0;

    const step = (now) => {
      const t = Math.min(1, (now - startedAt) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setShown(Math.round(start + (target - start) * eased));
      if (t < 1) raf = requestAnimationFrame(step);
      else from.current = target;
    };

    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value]);

  return <>{format ? format(shown) : shown}</>;
}

export default function DashboardPage() {
  const { money } = useApp();
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      setStats(await api.get('/api/admin/stats'));
      setError('');
    } catch (err) {
      setError('Не удалось загрузить статистику');
    }
  }, []);

  useEffect(() => {
    load();
    const timer = setInterval(load, 15000);
    return () => clearInterval(timer);
  }, [load]);

  const cards = stats
    ? [
        { icon: 'receipt', label: 'Заказов сегодня', value: <CountUp value={stats.todayOrders} /> },
        { icon: 'chart', label: 'Выручка за день', value: <CountUp value={stats.todayRevenue} format={money} /> },
        { icon: 'clock', label: 'В работе сейчас', value: <CountUp value={stats.activeOrders} /> },
        { icon: 'grid', label: 'Средний чек', value: <CountUp value={stats.averageCheck} format={money} /> },
      ]
    : [];

  return (
    <>
      <div className="a-head">
        <div>
          <h1 className="a-head__title">Дашборд</h1>
          <p className="a-head__sub">Сводка по заведению, обновляется каждые 15 секунд</p>
        </div>
        <div className="a-actions">
          <button type="button" className="btn btn--sm" onClick={load}>
            <Icon name="refresh" size={14} />
            Обновить
          </button>
        </div>
      </div>

      {error && <p className="a-empty">{error}</p>}

      <div className="a-grid a-grid--stats">
        {cards.map((card) => (
          <div className="a-stat" key={card.label}>
            <span className="a-stat__icon">
              <Icon name={card.icon} size={17} />
            </span>
            <span className="a-stat__value">{card.value}</span>
            <span className="a-stat__label">{card.label}</span>
          </div>
        ))}
      </div>

      {stats && (
        <div className="a-section a-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))' }}>
          <section className="a-card">
            <h2 className="a-section__title">Последние заказы</h2>
            {stats.recent.length === 0 ? (
              <p className="a-empty">Заказов пока нет</p>
            ) : (
              <div className="a-scroll">
                <table className="a-table">
                  <thead>
                    <tr>
                      <th>№</th>
                      <th>Стол</th>
                      <th>Сумма</th>
                      <th>Статус</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recent.map((order) => (
                      <tr key={order.id}>
                        <td>#{order.publicId}</td>
                        <td>{order.tableName || '—'}</td>
                        <td>{money(order.total)}</td>
                        <td>
                          <span className={`a-badge a-badge--${order.status}`}>
                            <i className="a-dot" />
                            {STATUS_LABEL[order.status]}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <Link to="/admin/orders" className="btn btn--sm" style={{ marginTop: 16 }}>
              Все заказы
              <Icon name="arrowRight" size={14} />
            </Link>
          </section>

          <section className="a-card">
            <h2 className="a-section__title">Чаще всего заказывают</h2>
            {stats.top.length === 0 ? (
              <p className="a-empty">Пока нет данных</p>
            ) : (
              <ul style={{ display: 'grid', gap: 12 }}>
                {stats.top.map((row, i) => {
                  const max = stats.top[0].qty || 1;
                  return (
                    <li key={i}>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          gap: 12,
                          fontSize: 13,
                          marginBottom: 6,
                        }}
                      >
                        <span style={{ color: 'var(--ink)' }}>
                          {typeof row.name === 'string' ? row.name : row.name.ru}
                        </span>
                        <span style={{ color: 'var(--gold)' }}>{row.qty}</span>
                      </div>
                      <div
                        style={{
                          height: 3,
                          borderRadius: 3,
                          background: 'rgba(255,255,255,.06)',
                          overflow: 'hidden',
                        }}
                      >
                        <span
                          style={{
                            display: 'block',
                            height: '100%',
                            width: `${Math.round((row.qty / max) * 100)}%`,
                            background: 'linear-gradient(90deg, var(--gold-deep), var(--gold))',
                          }}
                        />
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </div>
      )}
    </>
  );
}
