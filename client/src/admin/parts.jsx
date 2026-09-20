import React, { useEffect, useRef, useState } from 'react';
import Icon from '../components/ui/Icon';
import api, { getToken } from '../api/api';

/* ------------------------------------------------------------------ modal */

export function AdminModal({ title, onClose, children, footer, wide }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div className="a-modal" role="dialog" aria-modal="true" aria-label={title}>
      <button type="button" className="a-modal__scrim" onClick={onClose} aria-label="Закрыть" />
      <div className={`a-modal__card${wide ? ' a-modal__card--wide' : ''}`}>
        <header className="a-modal__head">
          <h2>{title}</h2>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Закрыть">
            <Icon name="close" size={19} />
          </button>
        </header>
        <div className="a-modal__body">{children}</div>
        {footer && <footer className="a-modal__foot">{footer}</footer>}
      </div>
    </div>
  );
}

/* ------------------------------------------------- localized text fields */

const LANG_TABS = [
  { code: 'ru', label: 'RU' },
  { code: 'en', label: 'EN' },
  { code: 'uz', label: 'UZ' },
];

export function LocalizedField({ label, value, onChange, multiline, required }) {
  const [tab, setTab] = useState('ru');
  const safe = value || { ru: '', en: '', uz: '' };

  return (
    <div className="field">
      <span className="a-loc__head">
        {label}
        <span className="a-loc__tabs">
          {LANG_TABS.map((l) => (
            <button
              key={l.code}
              type="button"
              className={`a-loc__tab${tab === l.code ? ' is-active' : ''}`}
              onClick={() => setTab(l.code)}
            >
              {l.label}
              {safe[l.code] ? '' : ' •'}
            </button>
          ))}
        </span>
      </span>
      {multiline ? (
        <textarea
          className="textarea"
          value={safe[tab] || ''}
          onChange={(e) => onChange({ ...safe, [tab]: e.target.value })}
          required={required && tab === 'ru'}
        />
      ) : (
        <input
          className="input"
          value={safe[tab] || ''}
          onChange={(e) => onChange({ ...safe, [tab]: e.target.value })}
          required={required && tab === 'ru'}
        />
      )}
    </div>
  );
}

/* ----------------------------------------------------------- image picker */

export function ImagePicker({ value, onChange }) {
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function upload(file) {
    if (!file) return;
    setBusy(true);
    setError('');
    try {
      const form = new FormData();
      form.append('file', file);
      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${getToken()}` },
        body: form,
      });
      if (!response.ok) throw new Error('upload_failed');
      const payload = await response.json();
      onChange(payload.url);
    } catch (err) {
      setError('Не удалось загрузить изображение');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="field">
      <span>Изображение</span>
      <div className="a-image">
        <span
          className="a-image__preview"
          style={value ? { backgroundImage: `url(${value})` } : undefined}
        >
          {!value && <Icon name="image" size={22} />}
        </span>
        <div className="a-image__side">
          <input
            className="input"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder="/images/cat-pizza.jpg или https://…"
          />
          <div className="a-row">
            <button
              type="button"
              className="btn btn--sm"
              onClick={() => inputRef.current && inputRef.current.click()}
              disabled={busy}
            >
              <Icon name="image" size={14} />
              {busy ? 'Загрузка…' : 'Загрузить файл'}
            </button>
            {value && (
              <button type="button" className="btn btn--sm btn--ghost" onClick={() => onChange('')}>
                Убрать
              </button>
            )}
          </div>
          {error && <p className="a-error">{error}</p>}
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => upload(e.target.files && e.target.files[0])}
      />
    </div>
  );
}

/* --------------------------------------------------------------- helpers */

export async function safeCall(fn, onError) {
  try {
    return await fn();
  } catch (err) {
    if (onError) onError(err);
    return null;
  }
}

export { api };
