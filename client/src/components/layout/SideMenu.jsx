import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../ui/Icon';
import Logo from '../ui/Logo';
import useSoundSetting from '../../hooks/useSound';
import { useApp } from '../../context/AppContext';
import './SideMenu.css';

export default function SideMenu({ open, onClose }) {
  const { t, p, categories, settings } = useApp();
  const { muted, toggle } = useSoundSetting();

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  return (
    <div className={`side-menu${open ? ' is-open' : ''}`} aria-hidden={!open}>
      <button
        type="button"
        className="side-menu__scrim"
        onClick={onClose}
        tabIndex={-1}
        aria-label={t('nav.close')}
      />

      <aside className="side-menu__panel" role="dialog" aria-modal="true">
        <div className="side-menu__top">
          <Logo size={30} className="side-menu__mark" />
          <button type="button" className="icon-btn" onClick={onClose} aria-label={t('nav.close')}>
            <Icon name="close" size={20} />
          </button>
        </div>

        <nav className="side-menu__nav">
          <Link to="/" className="side-menu__link">
            <span className="side-menu__index">01</span>
            {t('hero.welcome')} CULT
          </Link>
          <Link to="/menu" className="side-menu__link">
            <span className="side-menu__index">02</span>
            {t('menu.all')}
          </Link>
        </nav>

        <div className="side-menu__section">
          <span className="eyebrow">{t('menu.title')}</span>
          <ul className="side-menu__cats">
            {categories.map((c) => (
              <li key={c.id}>
                <Link to={`/menu/${c.slug}`} className="side-menu__cat">
                  <Icon name={c.icon} size={17} />
                  {p(c.name)}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {settings && (
          <div className="side-menu__foot">
            <p className="side-menu__addr">
              <Icon name="pin" size={15} />
              {p(settings.address)}
            </p>
            {settings.workingHours && (
              <p className="side-menu__addr">
                <Icon name="clock" size={15} />
                {settings.workingHours}
              </p>
            )}
            {settings.phone && (
              <a className="side-menu__addr" href={`tel:${settings.phone.replace(/[^+\d]/g, '')}`}>
                <Icon name="phone" size={15} />
                {settings.phone}
              </a>
            )}
            <button type="button" className="side-menu__sound" onClick={toggle} aria-pressed={!muted}>
              <Icon name={muted ? 'soundOff' : 'soundOn'} size={15} />
              {muted ? t('sound.off') : t('sound.on')}
            </button>

            <Link to="/admin" className="side-menu__admin label">
              <Icon name="shield" size={14} />
              {t('nav.admin')}
            </Link>
          </div>
        )}
      </aside>
    </div>
  );
}
