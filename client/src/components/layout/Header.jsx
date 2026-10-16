import React, { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import Logo from '../ui/Logo';
import Icon from '../ui/Icon';
import { useApp } from '../../context/AppContext';
import { useCart } from '../../context/CartContext';
import SearchOverlay from '../menu/SearchOverlay';
import SideMenu from './SideMenu';
import './Header.css';

export default function Header() {
  const { lang, setLang, languages, t } = useApp();
  const { count, setOpen } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [bump, setBump] = useState(0);
  const prevCount = useRef(count);
  const location = useLocation();

  /* A short pop on the badge is the cheapest way to confirm "it went in". */
  useEffect(() => {
    if (count > prevCount.current) setBump((n) => n + 1);
    prevCount.current = count;
  }, [count]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
  }, [location.pathname]);

  const activeLang = Math.max(0, languages.findIndex((l) => l.code === lang));

  return (
    <>
      <header className={`site-header${scrolled ? ' is-scrolled' : ''}`}>
        <div className="site-header__inner shell">
          <Link to="/" className="brand" aria-label="CULT Restaurant">
            <Logo size={36} className="brand__mark" />
            <span className="brand__text">
              <span className="brand__name">CULT</span>
              <span className="brand__sub">Restaurant</span>
            </span>
          </Link>

          <nav className="site-header__nav" aria-label={t('nav.onlineMenu')}>
            <NavLink
              to="/menu"
              className={({ isActive }) => `navpill${isActive ? ' is-active' : ''}`}
            >
              <span className="navpill__dot" aria-hidden="true" />
              <span className="label">{t('nav.onlineMenu')}</span>
            </NavLink>
          </nav>

          <div className="site-header__right">
            {/* Языки — один переключатель с подвижной подложкой, а не три
                подчёркнутых слова: так видно, что это выбор из набора. */}
            <div
              className="lang"
              role="group"
              aria-label="Language"
              style={{ '--lang-i': activeLang, '--lang-n': languages.length }}
            >
              <span className="lang__thumb" aria-hidden="true" />
              {languages.map((l) => (
                <button
                  key={l.code}
                  type="button"
                  className={`lang__btn${l.code === lang ? ' is-active' : ''}`}
                  onClick={() => setLang(l.code)}
                  aria-pressed={l.code === lang}
                >
                  {l.label}
                </button>
              ))}
            </div>

            <button
              type="button"
              className="icon-btn"
              onClick={() => setSearchOpen(true)}
              aria-label={t('nav.search')}
            >
              <Icon name="search" size={19} />
            </button>

            <button
              type="button"
              className="icon-btn icon-btn--cart"
              onClick={() => setOpen(true)}
              aria-label={t('nav.cart')}
            >
              <Icon name="cart" size={19} />
              {count > 0 && (
                <span key={bump} className="cart-badge pop">
                  {count}
                </span>
              )}
            </button>

            <button
              type="button"
              className="icon-btn"
              onClick={() => setMenuOpen(true)}
              aria-label={t('nav.menu')}
              aria-expanded={menuOpen}
            >
              <Icon name="burger" size={19} />
            </button>
          </div>
        </div>

        <span className="site-header__hair" aria-hidden="true" />
      </header>

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
      <SideMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
