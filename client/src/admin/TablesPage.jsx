import React, { useCallback, useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import Icon from '../components/ui/Icon';
import api from '../api/api';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { AdminModal } from './parts';

/** One code for the whole dining room — the guest picks the table in the menu. */
function menuUrl() {
  return `${window.location.origin}/menu`;
}

function tableUrl(code) {
  return `${window.location.origin}/t/${encodeURIComponent(code)}`;
}

function QrCanvas({ value, size = 190 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    QRCode.toCanvas(canvasRef.current, value, {
      width: size,
      margin: 1,
      errorCorrectionLevel: 'M',
      color: { dark: '#0a0f0c', light: '#f3e7d2' },
    }).catch(() => {});
  }, [value, size]);

  return <canvas ref={canvasRef} className="a-qr__canvas" />;
}

function download(value, filename) {
  QRCode.toDataURL(value, { width: 1200, margin: 2, errorCorrectionLevel: 'M' }).then((url) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
  });
}

export default function TablesPage() {
  const { toast, reload } = useApp();
  const { isAdmin } = useAuth();
  const [tables, setTables] = useState([]);
  const [draft, setDraft] = useState(null);
  const [qrTable, setQrTable] = useState(null);
  const [perTable, setPerTable] = useState(false);

  const load = useCallback(async () => {
    try {
      setTables(await api.get('/api/admin/tables'));
    } catch (err) {
      toast('Не удалось загрузить столы', 'error');
    }
  }, [toast]);

  useEffect(() => {
    load();
  }, [load]);

  async function save(e) {
    e.preventDefault();
    try {
      if (draft.id) await api.put(`/api/admin/tables/${draft.id}`, draft);
      else await api.post('/api/admin/tables', draft);
      setDraft(null);
      toast('Стол сохранён', 'success');
      load();
      reload();
    } catch (err) {
      toast(err && err.code === 'duplicate_code' ? 'Такой код уже есть' : 'Не удалось сохранить', 'error');
    }
  }

  async function remove(table) {
    // eslint-disable-next-line no-alert
    if (!window.confirm(`Удалить стол ${table.name}?`)) return;
    try {
      await api.del(`/api/admin/tables/${table.id}`);
      load();
      reload();
    } catch (err) {
      toast('Не удалось удалить стол', 'error');
    }
  }

  async function toggle(table) {
    await api.put(`/api/admin/tables/${table.id}`, { active: !table.active });
    load();
    reload();
  }

  const activeCount = tables.filter((t) => t.active !== false).length;

  return (
    <>
      <div className="a-head">
        <div>
          <h1 className="a-head__title">QR и столы</h1>
          <p className="a-head__sub">
            Один QR-код на весь зал. Номер столика гость выбирает в корзине при оформлении.
          </p>
        </div>
        {isAdmin && (
          <div className="a-actions">
            <button
              type="button"
              className="btn btn--sm"
              onClick={() => setDraft({ code: '', name: '', zone: '', seats: 4, active: true })}
            >
              <Icon name="plus" size={14} />
              Добавить стол
            </button>
          </div>
        )}
      </div>

      {/* ------------------------------------------------ one code for the room */}
      <section className="a-qr-main">
        <div className="a-qr-main__code">
          <QrCanvas value={menuUrl()} size={230} />
        </div>

        <div className="a-qr-main__body">
          <h2 className="a-qr-main__title">Общий QR-код зала</h2>
          <p className="a-qr-main__text">
            Распечатайте один код и поставьте его на каждый столик — все ведут на одно меню.
            Гость сканирует, выбирает блюда и указывает номер своего столика при оформлении;
            номер уходит официанту вместе с заказом.
          </p>
          <p className="a-qr-main__url">{menuUrl()}</p>

          <div className="a-row">
            <button
              type="button"
              className="btn btn--sm btn--solid"
              onClick={() => download(menuUrl(), 'cult-qr-menu.png')}
            >
              <Icon name="qr" size={14} />
              Скачать PNG для печати
            </button>
            <a className="btn btn--sm" href={menuUrl()} target="_blank" rel="noreferrer">
              Проверить ссылку
              <Icon name="arrowRight" size={14} />
            </a>
          </div>

          <p className="a-hint" style={{ marginTop: 16, marginBottom: 0 }}>
            Код содержит адрес сайта, поэтому печатать его нужно уже после того, как сайт
            будет размещён на домене — иначе в коде останется localhost. Заказ вне радиуса
            ресторана не пройдёт, даже если код сфотографируют.
          </p>
        </div>
      </section>

      {/* -------------------------------------------------------------- tables */}
      <section className="a-section">
        <div className="a-head" style={{ marginBottom: 16 }}>
          <div>
            <h2 className="a-section__title" style={{ marginBottom: 4 }}>
              Столы в зале
            </h2>
            <p className="a-head__sub" style={{ marginTop: 0 }}>
              Из этого списка гость выбирает столик. Активных: {activeCount} из {tables.length}
            </p>
          </div>
          <label className="switch">
            <input
              type="checkbox"
              checked={perTable}
              onChange={(e) => setPerTable(e.target.checked)}
            />
            <i />
            <span>Отдельный QR на каждый стол</span>
          </label>
        </div>

        {tables.length === 0 ? (
          <p className="a-empty">Столов пока нет</p>
        ) : perTable ? (
          <div className="a-tables">
            {tables.map((table) => (
              <article key={table.id} className={`a-table-card${table.active ? '' : ' is-off'}`}>
                <header>
                  <span className="a-table-card__code">{table.name}</span>
                  <span className="label muted">{table.zone}</span>
                </header>
                <p className="label muted">{table.seats} мест</p>
                <div className="a-table-card__qr">
                  <QrCanvas value={tableUrl(table.code)} size={118} />
                </div>
                <div className="a-row">
                  <button type="button" className="btn btn--sm" onClick={() => setQrTable(table)}>
                    <Icon name="qr" size={13} />
                    Открыть
                  </button>
                  <button
                    type="button"
                    className="btn btn--sm btn--ghost"
                    onClick={() => download(tableUrl(table.code), `cult-table-${table.code}.png`)}
                  >
                    PNG
                  </button>
                </div>
                {isAdmin && (
                  <div className="a-row a-table-card__tools">
                    <button type="button" className="icon-btn" onClick={() => setDraft(table)} aria-label="Изменить">
                      <Icon name="edit" size={16} />
                    </button>
                    <button
                      type="button"
                      className="icon-btn"
                      onClick={() => toggle(table)}
                      aria-label="Активность"
                      style={{ color: table.active ? 'var(--ok)' : 'var(--ink-faint)' }}
                    >
                      <Icon name={table.active ? 'eye' : 'eyeOff'} size={16} />
                    </button>
                    <button type="button" className="icon-btn" onClick={() => remove(table)} aria-label="Удалить">
                      <Icon name="trash" size={16} />
                    </button>
                  </div>
                )}
              </article>
            ))}
          </div>
        ) : (
          <div className="a-card a-scroll" style={{ padding: 0 }}>
            <table className="a-table">
              <thead>
                <tr>
                  <th>Стол</th>
                  <th>Зона</th>
                  <th>Мест</th>
                  <th>Виден гостю</th>
                  {isAdmin && <th style={{ textAlign: 'right' }}>Действия</th>}
                </tr>
              </thead>
              <tbody>
                {tables.map((table) => (
                  <tr key={table.id}>
                    <td style={{ color: 'var(--gold)' }}>{table.name}</td>
                    <td>{table.zone || '—'}</td>
                    <td>{table.seats}</td>
                    <td>
                      <button
                        type="button"
                        className="icon-btn"
                        onClick={() => isAdmin && toggle(table)}
                        aria-label="Активность"
                        disabled={!isAdmin}
                        style={{ color: table.active ? 'var(--ok)' : 'var(--ink-faint)' }}
                      >
                        <Icon name={table.active ? 'eye' : 'eyeOff'} size={16} />
                      </button>
                    </td>
                    {isAdmin && (
                      <td>
                        <div className="a-row" style={{ justifyContent: 'flex-end', flexWrap: 'nowrap' }}>
                          <button type="button" className="btn btn--sm" onClick={() => setDraft(table)}>
                            <Icon name="edit" size={13} />
                            Изменить
                          </button>
                          <button type="button" className="icon-btn" onClick={() => remove(table)} aria-label="Удалить">
                            <Icon name="trash" size={16} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {draft && (
        <AdminModal
          title={draft.id ? `Стол ${draft.name}` : 'Новый стол'}
          onClose={() => setDraft(null)}
          footer={
            <>
              <button type="button" className="btn btn--sm btn--ghost" onClick={() => setDraft(null)}>
                Отмена
              </button>
              <button type="submit" form="table-form" className="btn btn--sm btn--solid">
                Сохранить
              </button>
            </>
          }
        >
          <form id="table-form" onSubmit={save}>
            <div className="a-form-grid">
              <label className="field">
                <span>Код</span>
                <input
                  className="input"
                  value={draft.code}
                  onChange={(e) => setDraft({ ...draft, code: e.target.value.toUpperCase() })}
                  disabled={!!draft.id}
                  required
                />
              </label>
              <label className="field">
                <span>Название</span>
                <input
                  className="input"
                  value={draft.name}
                  onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                  required
                />
              </label>
              <label className="field">
                <span>Зона</span>
                <input
                  className="input"
                  value={draft.zone || ''}
                  onChange={(e) => setDraft({ ...draft, zone: e.target.value })}
                  placeholder="Зал / Терраса / VIP"
                />
              </label>
              <label className="field">
                <span>Мест</span>
                <input
                  className="input"
                  type="number"
                  min="1"
                  max="30"
                  value={draft.seats}
                  onChange={(e) => setDraft({ ...draft, seats: Number(e.target.value) })}
                />
              </label>
            </div>
            <label className="switch">
              <input
                type="checkbox"
                checked={draft.active !== false}
                onChange={(e) => setDraft({ ...draft, active: e.target.checked })}
              />
              <i />
              <span>Стол активен</span>
            </label>
          </form>
        </AdminModal>
      )}

      {qrTable && (
        <AdminModal title={`QR — стол ${qrTable.name}`} onClose={() => setQrTable(null)}>
          <div className="a-qr">
            <QrCanvas value={tableUrl(qrTable.code)} size={240} />
            <p className="a-qr__url">{tableUrl(qrTable.code)}</p>
            <button
              type="button"
              className="btn btn--sm btn--solid"
              onClick={() => download(tableUrl(qrTable.code), `cult-table-${qrTable.code}.png`)}
            >
              Скачать PNG
            </button>
            <p className="a-hint" style={{ marginTop: 14 }}>
              Этот код сразу подставляет столик {qrTable.name}, гостю не нужно выбирать его
              вручную. Право на заказ по-прежнему даёт только геопозиция.
            </p>
          </div>
        </AdminModal>
      )}
    </>
  );
}
