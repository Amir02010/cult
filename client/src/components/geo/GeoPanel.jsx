import React, { useEffect } from 'react';
import Icon from '../ui/Icon';
import { useApp } from '../../context/AppContext';
import { useGeo } from '../../context/GeoContext';
import './GeoPanel.css';

const COPY = {
  idle: { icon: 'pin', title: 'geo.required', text: 'geo.outsideHint', tone: 'idle' },
  checking: { icon: 'refresh', title: 'geo.checking', text: null, tone: 'idle' },
  inside: { icon: 'shield', title: 'geo.inside', text: 'geo.insideHint', tone: 'ok' },
  outside: { icon: 'pin', title: 'geo.outside', text: 'geo.outsideHint', tone: 'bad' },
  denied: { icon: 'eyeOff', title: 'geo.denied', text: 'geo.deniedHint', tone: 'bad' },
  accuracy: { icon: 'pin', title: 'geo.accuracy', text: 'geo.accuracyHint', tone: 'bad' },
  unsupported: { icon: 'eyeOff', title: 'geo.unsupported', text: 'geo.deniedHint', tone: 'bad' },
  error: { icon: 'pin', title: 'err.generic', text: 'geo.deniedHint', tone: 'bad' },
};

function distanceLabel(meters) {
  if (meters == null) return null;
  if (meters < 1000) return `${meters} м`;
  return `${(meters / 1000).toFixed(1)} км`;
}

export default function GeoPanel({ auto = true, compact = false }) {
  const { t } = useApp();
  const { status, info, check, geoRequired } = useGeo();

  useEffect(() => {
    if (auto && status === 'idle') check();
  }, [auto, status, check]);

  if (!geoRequired) return null;

  const copy = COPY[status] || COPY.idle;
  const busy = status === 'checking';

  return (
    <div className={`geo-panel geo-panel--${copy.tone}${compact ? ' geo-panel--compact' : ''}`}>
      <span className={`geo-panel__icon${busy ? ' is-busy' : ''}`}>
        <Icon name={copy.icon} size={compact ? 17 : 20} strokeWidth={1.2} />
      </span>

      <div className="geo-panel__body">
        <p className="geo-panel__title">{t(copy.title)}</p>
        {copy.text && !compact && <p className="geo-panel__text">{t(copy.text)}</p>}

        {status === 'outside' && info.distance != null && (
          <p className="geo-panel__meta label">
            {t('geo.distance')}: {distanceLabel(info.distance)}
            {info.radius ? ` · ${t('geo.radius')} ${info.radius} м` : ''}
          </p>
        )}
        {status === 'inside' && info.distance != null && (
          <p className="geo-panel__meta label">
            {distanceLabel(info.distance)} {info.accuracy ? `· ±${info.accuracy} м` : ''}
          </p>
        )}
      </div>

      {status !== 'inside' && (
        <button type="button" className="btn btn--sm geo-panel__retry" onClick={check} disabled={busy}>
          {busy ? t('common.loading') : t('geo.retry')}
        </button>
      )}
    </div>
  );
}
