import React, { useCallback, useEffect, useState } from 'react';
import Icon from '../components/ui/Icon';
import api from '../api/api';
import { useApp } from '../context/AppContext';
import { LocalizedField } from './parts';

export default function SettingsPage() {
  const { toast, reload } = useApp();
  const [settings, setSettings] = useState(null);
  const [saving, setSaving] = useState(false);
  const [locating, setLocating] = useState(false);
  const [pwd, setPwd] = useState({ current: '', next: '' });

  const load = useCallback(async () => {
    try {
      setSettings(await api.get('/api/admin/settings'));
    } catch (err) {
      toast('Не удалось загрузить настройки', 'error');
    }
  }, [toast]);

  useEffect(() => {
    load();
  }, [load]);

  const patch = (key, value) => setSettings((s) => ({ ...s, [key]: value }));

  async function save(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const saved = await api.put('/api/admin/settings', settings);
      setSettings(saved);
      toast('Настройки сохранены', 'success');
      reload();
    } catch (err) {
      toast('Не удалось сохранить настройки', 'error');
    } finally {
      setSaving(false);
    }
  }

  /** Fills the geofence centre from the device the admin is holding. */
  function useMyPosition() {
    if (!('geolocation' in navigator)) {
      toast('Браузер не поддерживает геолокацию', 'error');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setSettings((s) => ({
          ...s,
          lat: Number(pos.coords.latitude.toFixed(6)),
          lng: Number(pos.coords.longitude.toFixed(6)),
        }));
        setLocating(false);
        toast(
          `Координаты записаны, точность ±${Math.round(pos.coords.accuracy)} м. Не забудьте сохранить.`,
          'success'
        );
      },
      () => {
        setLocating(false);
        toast('Не удалось определить позицию', 'error');
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  }

  async function changePassword(e) {
    e.preventDefault();
    try {
      await api.post('/api/admin/users/password', pwd);
      setPwd({ current: '', next: '' });
      toast('Пароль изменён', 'success');
    } catch (err) {
      toast(
        err && err.code === 'wrong_password'
          ? 'Текущий пароль неверный'
          : err && err.code === 'weak_password'
          ? 'Новый пароль слишком короткий'
          : 'Не удалось изменить пароль',
        'error'
      );
    }
  }

  if (!settings) return <p className="a-empty">Загрузка…</p>;

  return (
    <>
      <div className="a-head">
        <div>
          <h1 className="a-head__title">Настройки</h1>
          <p className="a-head__sub">Геозона заказа, данные заведения и доступ</p>
        </div>
      </div>

      <form onSubmit={save} className="a-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))' }}>
        {/* ------------------------------------------------------ geofence */}
        <section className="a-card">
          <h2 className="a-section__title">Зона заказа</h2>

          {!settings.geoConfigured && (
            <p className="a-warn">
              <Icon name="pin" size={16} />
              <span>
                Зона ресторана ещё не задана, поэтому проверка геопозиции отключена и заказ
                примут откуда угодно. Нажмите «Взять мои координаты», стоя в зале, и сохраните.
              </span>
            </p>
          )}

          <p className="a-hint">
            Заказ принимается, только если устройство гостя находится внутри радиуса вокруг этих
            координат. Проверка выполняется на сервере: подделать её из браузера нельзя.
          </p>

          <div className="a-form-grid">
            <label className="field">
              <span>Широта</span>
              <input
                className="input"
                type="number"
                step="0.000001"
                value={settings.lat}
                onChange={(e) => patch('lat', e.target.value)}
              />
            </label>
            <label className="field">
              <span>Долгота</span>
              <input
                className="input"
                type="number"
                step="0.000001"
                value={settings.lng}
                onChange={(e) => patch('lng', e.target.value)}
              />
            </label>
          </div>

          <button type="button" className="btn btn--sm" onClick={useMyPosition} disabled={locating}>
            <Icon name="pin" size={14} />
            {locating ? 'Определяем…' : 'Взять мои координаты'}
          </button>

          <div className="a-form-grid" style={{ marginTop: 20 }}>
            <label className="field">
              <span>Радиус, м</span>
              <input
                className="input"
                type="number"
                min="10"
                max="2000"
                value={settings.radiusMeters}
                onChange={(e) => patch('radiusMeters', e.target.value)}
              />
            </label>
            <label className="field">
              <span>Макс. погрешность, м</span>
              <input
                className="input"
                type="number"
                min="10"
                max="1000"
                value={settings.maxAccuracyMeters}
                onChange={(e) => patch('maxAccuracyMeters', e.target.value)}
              />
            </label>
          </div>
          <p className="a-hint">
            Погрешность отсекает позиции, определённые по IP или сотовой вышке: такие «попадания
            в радиус» случайны. Рекомендуется 50–100 м.
          </p>

          <h3 className="a-section__title" style={{ marginTop: 26 }}>
            Что видит гость вне ресторана
          </h3>
          <div className="a-modes">
            <button
              type="button"
              className={`a-mode${(settings.siteAccess || 'open') === 'open' ? ' is-active' : ''}`}
              onClick={() => patch('siteAccess', 'open')}
            >
              <strong>Меню открыто всем</strong>
              <em>
                Посмотреть блюда и цены может кто угодно, но оформить заказ — только из зала.
                Сайт индексируется поисковиками, гости могут выбрать блюда по дороге.
              </em>
            </button>
            <button
              type="button"
              className={`a-mode${settings.siteAccess === 'onsite' ? ' is-active' : ''}`}
              onClick={() => patch('siteAccess', 'onsite')}
            >
              <strong>Сайт работает только в зале</strong>
              <em>
                Вне радиуса сайт не открывается вообще: вместо меню — экран «Меню доступно
                только в ресторане». Сервер не отдаёт блюда без подтверждённой геопозиции.
              </em>
            </button>
          </div>

          {settings.siteAccess === 'onsite' && (
            <p className="a-hint" style={{ marginTop: 14 }}>
              Учтите: в этом режиме меню не увидят те, кто ищет вас в интернете, и поисковики
              его не проиндексируют. Гость с выключенным GPS или отказом в доступе к геопозиции
              тоже не увидит ничего — ему придётся спросить меню у официанта. Админ-панель
              остаётся доступной всегда.
            </p>
          )}

          <div style={{ display: 'grid', gap: 14, marginTop: 22 }}>
            <label className="switch">
              <input
                type="checkbox"
                checked={settings.geoRequired !== false}
                onChange={(e) => patch('geoRequired', e.target.checked)}
              />
              <i />
              <span>Требовать геопозицию для заказа</span>
            </label>
            <label className="switch">
              <input
                type="checkbox"
                checked={settings.requireTable !== false}
                onChange={(e) => patch('requireTable', e.target.checked)}
              />
              <i />
              <span>Требовать номер столика</span>
            </label>
            <label className="switch">
              <input
                type="checkbox"
                checked={settings.orderingEnabled !== false}
                onChange={(e) => patch('orderingEnabled', e.target.checked)}
              />
              <i />
              <span>Приём заказов включён</span>
            </label>
          </div>
        </section>

        {/* ----------------------------------------------------- restaurant */}
        <section className="a-card">
          <h2 className="a-section__title">Заведение</h2>
          <label className="field">
            <span>Название</span>
            <input
              className="input"
              value={settings.restaurantName}
              onChange={(e) => patch('restaurantName', e.target.value)}
            />
          </label>
          <LocalizedField
            label="Слоган"
            value={settings.tagline}
            onChange={(tagline) => patch('tagline', tagline)}
          />
          <LocalizedField
            label="Адрес"
            value={settings.address}
            onChange={(address) => patch('address', address)}
          />
          <div className="a-form-grid">
            <label className="field">
              <span>Телефон</span>
              <input className="input" value={settings.phone} onChange={(e) => patch('phone', e.target.value)} />
            </label>
            <label className="field">
              <span>Часы работы</span>
              <input
                className="input"
                value={settings.workingHours}
                onChange={(e) => patch('workingHours', e.target.value)}
              />
            </label>
            <label className="field">
              <span>Валюта</span>
              <input className="input" value={settings.currency} onChange={(e) => patch('currency', e.target.value)} />
            </label>
            <label className="field">
              <span>Instagram</span>
              <input
                className="input"
                value={settings.instagram || ''}
                onChange={(e) => patch('instagram', e.target.value)}
              />
            </label>
          </div>
        </section>

        <div style={{ gridColumn: '1 / -1' }}>
          <button type="submit" className="btn btn--solid" disabled={saving}>
            {saving ? 'Сохраняем…' : 'Сохранить настройки'}
          </button>
        </div>
      </form>

      {/* -------------------------------------------------------- password */}
      <section className="a-card a-section" style={{ maxWidth: 480 }}>
        <h2 className="a-section__title">Смена пароля</h2>
        <form onSubmit={changePassword}>
          <label className="field">
            <span>Текущий пароль</span>
            <input
              className="input"
              type="password"
              value={pwd.current}
              onChange={(e) => setPwd({ ...pwd, current: e.target.value })}
              autoComplete="current-password"
              required
            />
          </label>
          <label className="field">
            <span>Новый пароль (от 6 символов)</span>
            <input
              className="input"
              type="password"
              value={pwd.next}
              onChange={(e) => setPwd({ ...pwd, next: e.target.value })}
              autoComplete="new-password"
              minLength={6}
              required
            />
          </label>
          <button type="submit" className="btn btn--sm">
            Изменить пароль
          </button>
        </form>
      </section>
    </>
  );
}
