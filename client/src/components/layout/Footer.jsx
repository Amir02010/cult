import React from 'react';
import { Link } from 'react-router-dom';
import Logo from '../ui/Logo';
import Icon from '../ui/Icon';
import { useApp } from '../../context/AppContext';
import './Footer.css';

export default function Footer() {
  const { t, p, categories, settings } = useApp();
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="site-footer__inner shell">
        <div className="site-footer__brand">
          <Link to="/" className="brand" aria-label="CULT Restaurant">
            <Logo size={34} className="brand__mark" />
            <span className="brand__text">
              <span className="brand__name">CULT</span>
              <span className="brand__sub">Restaurant</span>
            </span>
          </Link>
          {settings && <p className="site-footer__tagline label">{p(settings.tagline)}</p>}
        </div>

        <nav className="site-footer__col" aria-label={t('menu.title')}>
          <span className="eyebrow">{t('menu.title')}</span>
          <ul>
            {categories.slice(0, 7).map((c) => (
              <li key={c.id}>
                <Link to={`/menu/${c.slug}`}>{p(c.name)}</Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="site-footer__col">
          <span className="eyebrow">{t('nav.contacts')}</span>
          <ul>
            {settings && (
              <li className="site-footer__line">
                <Icon name="pin" size={15} />
                {p(settings.address)}
              </li>
            )}
            {settings && settings.workingHours && (
              <li className="site-footer__line">
                <Icon name="clock" size={15} />
                {settings.workingHours}
              </li>
            )}
            {settings && settings.phone && (
              <li className="site-footer__line">
                <Icon name="phone" size={15} />
                <a href={`tel:${settings.phone.replace(/[^+\d]/g, '')}`}>{settings.phone}</a>
              </li>
            )}
          </ul>
        </div>
      </div>

      <div className="site-footer__bar shell">
        <span className="label muted">© {year} CULT Restaurant</span>
        <span className="site-footer__claim">
          <span className="label">{t('hero.moreThanFood')}</span>
          <span className="hero__claim-rule" aria-hidden="true" />
          <span className="label">{t('hero.itsCult')}</span>
        </span>
      </div>
    </footer>
  );
}
