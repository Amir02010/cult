import React from 'react';
import { Link } from 'react-router-dom';
import Logo from '../ui/Logo';
import Icon from '../ui/Icon';
import { useApp } from '../../context/AppContext';
import './Footer.css';

export default function Footer() {
  const { t, p, categories, settings } = useApp();
  const year = new Date().getFullYear();

  const phone = settings && settings.phone ? settings.phone : '';

  return (
    <footer className="site-footer">
      <div className="site-footer__inner shell">
        {/* Слева — кто мы, справа — как нас найти. Разделы меню идут строкой
            между ними: список в столбик занимал половину экрана ради семи
            слов. */}
        <div className="site-footer__brand">
          <Link to="/" className="brand brand--footer" aria-label="CULT Restaurant">
            <Logo size={30} className="brand__mark" />
            <span className="brand__text">
              <span className="brand__name">CULT</span>
              <span className="brand__sub">Restaurant</span>
            </span>
          </Link>
          {settings && <p className="site-footer__tagline">{p(settings.tagline)}</p>}
        </div>

        <div className="site-footer__contacts">
          {settings && (
            <span className="site-footer__line">
              <Icon name="pin" size={14} strokeWidth={1.3} />
              {p(settings.address)}
            </span>
          )}
          {settings && settings.workingHours && (
            <span className="site-footer__line">
              <Icon name="clock" size={14} strokeWidth={1.3} />
              {settings.workingHours}
            </span>
          )}
          {phone && (
            <a className="site-footer__line site-footer__line--link" href={`tel:${phone.replace(/[^+\d]/g, '')}`}>
              <Icon name="phone" size={14} strokeWidth={1.3} />
              {phone}
            </a>
          )}
        </div>
      </div>

      <nav className="site-footer__cats shell" aria-label={t('menu.title')}>
        {categories.slice(0, 7).map((c) => (
          <Link key={c.id} to={`/menu/${c.slug}`} className="site-footer__cat">
            {p(c.name)}
          </Link>
        ))}
      </nav>

      <div className="site-footer__bar shell">
        <span className="site-footer__copy">© {year} CULT Restaurant</span>
        <span className="site-footer__by">
          powered by <strong>TEAM-WORK</strong>
        </span>
      </div>
    </footer>
  );
}
