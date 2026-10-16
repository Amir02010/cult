import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Logo from '../ui/Logo';
import Icon from '../ui/Icon';
import { useApp } from '../../context/AppContext';
import { useGeo } from '../../context/GeoContext';
import './SiteGate.css';

const COPY = {
  idle: { icon: 'pin', title: 'gate.checking', text: null },
  checking: { icon: 'refresh', title: 'gate.checking', text: null },
  inside: { icon: 'shield', title: 'gate.welcome', text: null },
  outside: { icon: 'pin', title: 'gate.outside', text: 'gate.outsideHint' },
  denied: { icon: 'eyeOff', title: 'geo.denied', text: 'gate.deniedHint' },
  accuracy: { icon: 'pin', title: 'geo.accuracy', text: 'geo.accuracyHint' },
  unsupported: { icon: 'eyeOff', title: 'geo.unsupported', text: 'gate.deniedHint' },
  error: { icon: 'pin', title: 'gate.error', text: 'gate.deniedHint' },
};

function distanceLabel(meters) {
  if (meters == null) return null;
  return meters < 1000 ? `${meters} м` : `${(meters / 1000).toFixed(1)} км`;
}

/**
 * Full-screen gate used when the restaurant runs in `onsite` mode: the menu
 * itself is withheld by the server, so this is what a guest outside the
 * dining room sees instead of the site.
 */
export default function SiteGate() {
  const { t, p, settings, languages, lang, setLang } = useApp();
  const { status, info, check } = useGeo();

  useEffect(() => {
    if (status === 'idle') check();
  }, [status, check]);

  const copy = COPY[status] || COPY.idle;
  const busy = status === 'checking' || status === 'idle' || status === 'inside';

  return (
    <div className="gate">
      <div
        className="gate__bg"
        aria-hidden="true"
        style={{ backgroundImage: `url(${process.env.PUBLIC_URL}/images/hero.jpg)` }}
      />
      <div className="gate__veil" aria-hidden="true" />

      <div className="gate__lang">
        {languages.map((l) => (
          <button
            key={l.code}
            type="button"
            className={`lang__btn${l.code === lang ? ' is-active' : ''}`}
            onClick={() => setLang(l.code)}
          >
            {l.label}
          </button>
        ))}
      </div>

      <main className="gate__card">
        <Logo size={58} />
        <p className="brand__name gate__name">CULT</p>
        <span className="rule gate__rule" />

        <span className={`gate__icon${busy ? ' is-busy' : ''}`}>
          <Icon name={copy.icon} size={22} strokeWidth={1.2} />
        </span>

        <h1 className="gate__title display">{t(copy.title)}</h1>
        {copy.text && <p className="gate__text">{t(copy.text)}</p>}

        {info.distance != null && (
          <p className="label gate__meta">
            {t('geo.distance')}: {distanceLabel(info.distance)}
            {info.radius ? ` · ${t('geo.radius')} ${info.radius} м` : ''}
          </p>
        )}

        {status !== 'inside' && (
          <button type="button" className="btn btn--solid gate__retry" onClick={check} disabled={busy}>
            {busy ? t('common.loading') : t('geo.retry')}
          </button>
        )}

        {settings && (
          <div className="gate__contacts">
            <p className="gate__contact">
              <Icon name="pin" size={15} />
              {p(settings.address)}
            </p>
            {settings.workingHours && (
              <p className="gate__contact">
                <Icon name="clock" size={15} />
                {settings.workingHours}
              </p>
            )}
            {settings.phone && (
              <a className="gate__contact" href={`tel:${settings.phone.replace(/[^+\d]/g, '')}`}>
                <Icon name="phone" size={15} />
                {settings.phone}
              </a>
            )}
          </div>
        )}
      </main>

      <Link to="/admin" className="gate__admin label">
        {t('nav.admin')}
      </Link>
    </div>
  );
}
