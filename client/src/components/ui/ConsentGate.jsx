import React, { useEffect, useState } from 'react';
import Logo from './Logo';
import Icon from './Icon';
import { useApp } from '../../context/AppContext';
import './ConsentGate.css';

const STORE_KEY = 'cult.consent.v1';

/** Пункты правил. Текст живёт в словаре — экран остаётся трёхъязычным. */
const POINTS = [
  { icon: 'receipt', title: 'consent.p1.title', text: 'consent.p1.text' },
  { icon: 'shield', title: 'consent.p2.title', text: 'consent.p2.text' },
  { icon: 'leaf', title: 'consent.p3.title', text: 'consent.p3.text' },
  { icon: 'pin', title: 'consent.p4.title', text: 'consent.p4.text' },
];

/** Согласие уже дано? Читается и из App, поэтому вынесено наружу. */
export function hasConsent() {
  try {
    return localStorage.getItem(STORE_KEY) === '1';
  } catch (err) {
    /* приватный режим — спросим ещё раз, это не страшно */
    return false;
  }
}

/**
 * Экран условий заказа перед входом в меню.
 *
 * Показывается один раз на устройство. Смысл — не юридическая защита, а
 * честное предупреждение: гость видит, что состав заказа на нём, а отмена
 * после подтверждения идёт через администратора зала.
 */
export default function ConsentGate({ onAccept }) {
  const { t, languages, lang, setLang } = useApp();
  const [agreed, setAgreed] = useState(false);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const accept = () => {
    if (!agreed || leaving) return;
    try {
      localStorage.setItem(STORE_KEY, '1');
    } catch (err) {
      /* не сохранилось — спросим в следующий раз */
    }
    setLeaving(true);
    setTimeout(onAccept, 520);
  };

  return (
    <div className={`consent${leaving ? ' consent--out' : ''}`} role="dialog" aria-modal="true">
      <div className="consent__sky" aria-hidden="true" />

      <div className="consent__card">
        <div className="consent__langs">
          {languages.map((l) => (
            <button
              key={l.code}
              type="button"
              className={`consent__lang label${l.code === lang ? ' is-active' : ''}`}
              onClick={() => setLang(l.code)}
            >
              {l.label}
            </button>
          ))}
        </div>

        <header className="consent__head">
          <Logo size={40} />
          <h1 className="display consent__title">{t('consent.title')}</h1>
          <p className="consent__lead">{t('consent.lead')}</p>
        </header>

        <ul className="consent__points">
          {POINTS.map((point, i) => (
            <li key={point.title} className="consent__point" style={{ '--i': i }}>
              <span className="consent__point-icon">
                <Icon name={point.icon} size={17} strokeWidth={1.25} />
              </span>
              <span className="consent__point-body">
                <strong>{t(point.title)}</strong>
                <span>{t(point.text)}</span>
              </span>
            </li>
          ))}
        </ul>

        <label className="consent__check">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
          />
          <span className="consent__box" aria-hidden="true">
            <Icon name="check" size={13} strokeWidth={2} />
          </span>
          <span>{t('consent.check')}</span>
        </label>

        <button
          type="button"
          className="btn consent__accept shine"
          onClick={accept}
          disabled={!agreed}
        >
          {t('consent.accept')}
          <Icon name="arrowRight" size={16} />
        </button>

        <p className="consent__foot">{t('consent.foot')}</p>
      </div>
    </div>
  );
}
