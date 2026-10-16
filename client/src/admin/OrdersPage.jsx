import React, { useCallback, useEffect, useState } from 'react';
import Icon from '../components/ui/Icon';
import api from '../api/api';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { STATUSES, STATUS_LABEL, formatTime } from './constants';

const FILTERS = [
  { key: 'all', label: 'Все' },
  { key: 'new', label: 'Новые' },
  { key: 'accepted', label: 'Приняты' },
  { key: 'cooking', label: 'Готовятся' },
  { key: 'served', label: 'Поданы' },
  { key: 'cancelled', label: 'Отменены' },
];

const NEXT = { new: 'accepted', accepted: 'cooking', cooking: 'served' };
const NEXT_LABEL = { new: 'Принять', accepted: 'На кухню', cooking: 'Подан' };

export default function OrdersPage() {
  const { money, p, toast } = useApp();
  const { isAdmin } = useAuth();
  const [filter, setFilter] = useState('all');
  const [data, setData] = useState({ orders: [], counts: {} });
  const [expanded, setExpanded] = useState(null);
  const [live, setLive] = useState(true);

  const load = useCallback(async () => {
    try {
      setData(await api.get(`/api/admin/orders?status=${filter}`));
    } catch (err) {
      /* keep the last snapshot on a transient failure */
    }
  }, [filter]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!live) return undefined;
    const timer = setInterval(load, 6000);
    return () => clearInterval(timer);
  }, [live, load]);

  async function setStatus(order, status) {
    try {
      await api.patch(`/api/admin/orders/${order.id}`, { status });
      toast(`Заказ #${order.publicId} — ${STATUS_LABEL[status].toLowerCase()}`, 'success');
      load();
    } catch (err) {
      toast('Не удалось обновить заказ', 'error');
    }
  }

  async function remove(order) {
    // eslint-disable-next-line no-alert
    if (!window.confirm(`Удалить заказ #${order.publicId}?`)) return;
    try {
      await api.del(`/api/admin/orders/${order.id}`);
      load();
    } catch (err) {
      toast('Не удалось удалить заказ', 'error');
    }
  }

  return (
    <>
      <div className="a-head">
        <div>
          <h1 className="a-head__title">Заказы</h1>
          <p className="a-head__sub">
            Обновление в реальном времени. Всего: {data.counts.all || 0}
          </p>
        </div>
        <div className="a-actions">
          <label className="switch">
            <input type="checkbox" checked={live} onChange={(e) => setLive(e.target.checked)} />
            <i />
            <span>Автообновление</span>
          </label>
          <button type="button" className="btn btn--sm" onClick={load}>
            <Icon name="refresh" size={14} />
            Обновить
          </button>
        </div>
      </div>

      <div className="a-row" style={{ marginBottom: 20 }}>
        {FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            className={`a-badge${filter === f.key ? ' a-badge--accepted' : ''}`}
            onClick={() => setFilter(f.key)}
            style={{ cursor: 'pointer' }}
          >
            {f.label}
            {data.counts[f.key] != null && <b style={{ fontWeight: 400 }}>{data.counts[f.key]}</b>}
          </button>
        ))}
      </div>

      {data.orders.length === 0 ? (
        <p className="a-empty">Заказов нет</p>
      ) : (
        <div className="a-card a-scroll" style={{ padding: 0 }}>
          <table className="a-table">
            <thead>
              <tr>
                <th>№</th>
                <th>Время</th>
                <th>Стол</th>
                <th>Позиции</th>
                <th>Сумма</th>
                <th>Гео</th>
                <th>Статус</th>
                <th style={{ textAlign: 'right' }}>Действия</th>
              </tr>
            </thead>
            <tbody>
              {data.orders.map((order) => (
                <React.Fragment key={order.id}>
                  <tr>
                    <td style={{ color: 'var(--gold)' }}>#{order.publicId}</td>
                    <td>{formatTime(order.createdAt)}</td>
                    <td>{order.tableName || '—'}</td>
                    <td>
                      <button
                        type="button"
                        className="label"
                        style={{ color: 'var(--ink-soft)' }}
                        onClick={() => setExpanded(expanded === order.id ? null : order.id)}
                      >
                        {order.items.length} поз.
                        <Icon name="chevronDown" size={13} />
                      </button>
                    </td>
                    <td>{money(order.total)}</td>
                    <td>
                      {order.geo ? (
                        <span className="a-badge a-badge--served">
                          <i className="a-dot" />
                          {order.geo.distance} м
                        </span>
                      ) : (
                        <span className="muted">—</span>
                      )}
                    </td>
                    <td>
                      <span className={`a-badge a-badge--${order.status}`}>
                        <i className="a-dot" />
                        {STATUS_LABEL[order.status]}
                      </span>
                    </td>
                    <td>
                      <div className="a-row" style={{ justifyContent: 'flex-end', flexWrap: 'nowrap' }}>
                        {NEXT[order.status] && (
                          <button
                            type="button"
                            className="btn btn--sm btn--solid"
                            onClick={() => setStatus(order, NEXT[order.status])}
                          >
                            {NEXT_LABEL[order.status]}
                          </button>
                        )}
                        {order.status !== 'cancelled' && order.status !== 'served' && (
                          <button
                            type="button"
                            className="btn btn--sm btn--danger"
                            onClick={() => setStatus(order, 'cancelled')}
                          >
                            Отменить
                          </button>
                        )}
                        {isAdmin && (
                          <button
                            type="button"
                            className="icon-btn"
                            onClick={() => remove(order)}
                            aria-label="Удалить"
                          >
                            <Icon name="trash" size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>

                  {expanded === order.id && (
                    <tr>
                      <td colSpan={8} style={{ background: 'rgba(255,255,255,.02)' }}>
                        <ul style={{ display: 'grid', gap: 8, padding: '4px 0' }}>
                          {order.items.map((line) => (
                            <li
                              key={line.itemId}
                              style={{ display: 'flex', justifyContent: 'space-between', gap: 16 }}
                            >
                              <span style={{ color: 'var(--ink)' }}>
                                {p(line.name)} × {line.qty}
                              </span>
                              <span style={{ color: 'var(--gold)' }}>{money(line.sum)}</span>
                            </li>
                          ))}
                        </ul>
                        {order.guestName && (
                          <p style={{ marginTop: 10 }}>Гость: {order.guestName}</p>
                        )}
                        {order.comment && (
                          <p style={{ marginTop: 6, color: 'var(--ink-soft)' }}>
                            Комментарий: {order.comment}
                          </p>
                        )}
                        <div className="a-row" style={{ marginTop: 12 }}>
                          {STATUSES.map((s) => (
                            <button
                              key={s}
                              type="button"
                              className="btn btn--sm"
                              disabled={s === order.status}
                              onClick={() => setStatus(order, s)}
                            >
                              {STATUS_LABEL[s]}
                            </button>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
