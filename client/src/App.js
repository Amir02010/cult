import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Navigate, Route, Routes, useLocation, useParams } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { GeoProvider } from './context/GeoContext';
import { CartProvider, useCart } from './context/CartContext';
import { useGeo } from './context/GeoContext';
import { AuthProvider } from './context/AuthContext';

import HomePage from './pages/HomePage';
import MenuPage from './pages/MenuPage';
import CategoryPage from './pages/CategoryPage';
import OrderPage from './pages/OrderPage';
import NotFoundPage from './pages/NotFoundPage';
import AdminApp from './admin/AdminApp';

import DragonLoader from './components/ui/DragonLoader';
import ConsentGate, { hasConsent } from './components/ui/ConsentGate';
import SiteGate from './components/geo/SiteGate';
import CartDrawer from './components/cart/CartDrawer';
import Toasts from './components/ui/Toasts';

/** QR codes on the tables point here: /t/A5 preselects that table. */
function TableEntry() {
  const { code } = useParams();
  const cart = useCart();
  useEffect(() => {
    if (code) cart.setTable(String(code).toUpperCase());
  }, [code]); // eslint-disable-line react-hooks/exhaustive-deps
  return <Navigate to="/menu" replace />;
}

/* Переход между категориями — не смена страницы, а смена содержимого: шапка,
   обложка и лента вкладок остаются на месте, меняются только карточки.
   Поэтому такие переходы не прокручивают наверх и не перезапускают появление
   страницы. */
const isCategory = (path) => path.startsWith('/menu/');

function ScrollToTop() {
  const { pathname } = useLocation();
  const prev = useRef(pathname);

  useEffect(() => {
    const from = prev.current;
    prev.current = pathname;
    if (isCategory(from) && isCategory(pathname)) return;
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [pathname]);

  return null;
}

/* Geo states from which there is no way into the site without the guest
   doing something — only these are worth showing the gate for. */
const GEO_FAILED = ['outside', 'denied', 'unsupported', 'accuracy', 'error'];

function Shell() {
  const { status, reload, t, locked } = useApp();
  const { status: geoStatus } = useGeo();
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  /* The intro plays once per visit and never in front of the staff panel. */
  const [booted, setBooted] = useState(() => {
    try {
      return sessionStorage.getItem('cult.booted') === '1';
    } catch (err) {
      return false;
    }
  });

  /* Условия заказа принимаются один раз на устройство. */
  const [consented, setConsented] = useState(hasConsent);

  const finishBoot = useCallback(() => {
    setBooted(true);
    try {
      sessionStorage.setItem('cult.booted', '1');
    } catch (err) {
      /* private mode — the intro will simply play again next time */
    }
  }, []);

  if (status === 'error') {
    return (
      <div className="page">
        <main className="page-body shell cat-missing">
          <h1 className="display" style={{ fontSize: 'clamp(28px,4vw,52px)' }}>
            {t('err.network')}
          </h1>
          <button type="button" className="btn btn--sm" onClick={reload}>
            {t('geo.retry')}
          </button>
        </main>
      </div>
    );
  }

  /* `onsite` mode: the server withholds the menu outside the restaurant, so the
     guest gets the gate instead of the site. The admin panel and a guest's own
     order receipt stay reachable — otherwise the owner could lock themselves
     out of their own settings.

     While the position is still being checked the intro keeps playing, so the
     guest never sees the gate flash by on the way in. */
  const gated =
    locked &&
    !isAdmin &&
    !location.pathname.startsWith('/order/') &&
    /* Пока играет интро — только явные отказы. После него экран показывается
       при любом состоянии проверки, в том числе «ещё проверяем»: показать
       пустое меню было бы хуже, чем честно сказать, что происходит. */
    (booted || GEO_FAILED.includes(geoStatus));

  const introReady = (status !== 'loading' && !locked) || gated;

  if (gated) {
    return (
      <>
        {!booted && <DragonLoader ready onDone={finishBoot} />}
        <SiteGate />
        <Toasts />
      </>
    );
  }

  return (
    <>
      {!booted && !isAdmin && <DragonLoader ready={introReady} onDone={finishBoot} />}

      {/* Условия показываются после интро: сначала гость видит ресторан, и
          только потом читает правила — иначе первое, что встречает человек
          за столиком, это стена текста. Персонал в админке не спрашиваем. */}
      {booted && !consented && !isAdmin && (
        <ConsentGate onAccept={() => setConsented(true)} />
      )}

      <ScrollToTop />
      {/* Все категории делят один ключ: React не пересобирает страницу
          заново, и появление страницы не проигрывается при каждом
          переключении вкладки. */}
      <div
        key={isCategory(location.pathname) ? '/menu/*' : location.pathname}
        className={isAdmin ? undefined : 'page-fade'}
      >
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/menu" element={<MenuPage />} />
        <Route path="/menu/:slug" element={<CategoryPage />} />
        <Route path="/order/:id" element={<OrderPage />} />
        <Route path="/t/:code" element={<TableEntry />} />
        <Route path="/admin/*" element={<AdminApp />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      </div>

      {!isAdmin && <CartDrawer />}
      <Toasts />
    </>
  );
}

export default function App() {
  return (
    <AppProvider>
      <GeoProvider>
        <CartProvider>
          <AuthProvider>
            <Shell />
          </AuthProvider>
        </CartProvider>
      </GeoProvider>
    </AppProvider>
  );
}
