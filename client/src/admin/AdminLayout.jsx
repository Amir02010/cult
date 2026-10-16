import React, { useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import Logo from '../components/ui/Logo';
import Icon from '../components/ui/Icon';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';

const NAV = [
  { to: '/admin', end: true, icon: 'chart', label: 'Дашборд', role: 'any' },
  { to: '/admin/orders', icon: 'receipt', label: 'Заказы', role: 'any' },
  { to: '/admin/menu', icon: 'grid', label: 'Меню', role: 'admin' },
  { to: '/admin/tables', icon: 'tableIcon', label: 'Столы и QR', role: 'any' },
  { to: '/admin/settings', icon: 'settings', label: 'Настройки', role: 'admin' },
];

export default function AdminLayout({ children }) {
  const { user, logout, isAdmin } = useAuth();
  const { settings } = useApp();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  const links = NAV.filter((n) => n.role === 'any' || isAdmin);

  return (
    <div className={`admin${open ? ' is-nav-open' : ''}`}>
      <aside className="admin__aside">
        <Link to="/" className="admin__brand" aria-label="CULT Restaurant">
          <Logo size={30} />
          <span>
            <strong>CULT</strong>
            <em>admin</em>
          </span>
        </Link>

        <nav className="admin__nav">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) => `admin__link${isActive ? ' is-active' : ''}`}
              onClick={() => setOpen(false)}
            >
              <Icon name={link.icon} size={18} />
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="admin__user">
          <span className="admin__avatar">{(user && user.name ? user.name : 'U').slice(0, 1)}</span>
          <span className="admin__user-body">
            <strong>{user ? user.name || user.username : ''}</strong>
            <em>{user && user.role === 'admin' ? 'администратор' : 'официант'}</em>
          </span>
          <button type="button" className="icon-btn" onClick={logout} aria-label="Выйти">
            <Icon name="logout" size={18} />
          </button>
        </div>
      </aside>

      <button
        type="button"
        className="admin__scrim"
        onClick={() => setOpen(false)}
        tabIndex={-1}
        aria-label="Закрыть меню"
      />

      <div className="admin__main">
        <header className="admin__topbar">
          <button
            type="button"
            className="icon-btn admin__burger"
            onClick={() => setOpen((v) => !v)}
            aria-label="Меню"
          >
            <Icon name={open ? 'close' : 'burger'} size={20} />
          </button>
          <Link to="/" className="label admin__site-link">
            <Icon name="globe" size={15} />
            На сайт
          </Link>
        </header>

        {settings && settings.geoConfigured === false && (
          <Link to="/admin/settings" className="a-banner">
            <Icon name="pin" size={17} />
            <span>
              <strong>Зона ресторана не настроена.</strong> Пока координаты не заданы, заказ
              примут с любого адреса. Откройте настройки и нажмите «Взять мои координаты».
            </span>
            <Icon name="arrowRight" size={16} />
          </Link>
        )}

        {settings && settings.geoConfigured !== false && settings.geoRequired === false && (
          <Link to="/admin/settings" className="a-banner">
            <Icon name="shield" size={17} />
            <span>
              <strong>Проверка геопозиции выключена.</strong> Заказ сейчас может оформить кто
              угодно и откуда угодно. Координаты ресторана уже сохранены — включите
              «Требовать геопозицию для заказа», когда закончите проверять меню.
            </span>
            <Icon name="arrowRight" size={16} />
          </Link>
        )}

        <div className="admin__content">{children}</div>
      </div>
    </div>
  );
}
