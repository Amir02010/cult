import React, { useEffect, useMemo, useState } from 'react';
import { Link, NavLink, useParams, useSearchParams } from 'react-router-dom';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import DishCard from '../components/menu/DishCard';
import DishModal from '../components/menu/DishModal';
import GeoPanel from '../components/geo/GeoPanel';
import Icon from '../components/ui/Icon';
import { useApp } from '../context/AppContext';
import './CategoryPage.css';

/* Сколько старые карточки уходят вверх, прежде чем встанут новые. Держать
   в одном месте с CSS: длительность здесь и в анимации swapOut совпадают. */
const SWAP_OUT = 320;

export default function CategoryPage() {
  const { slug } = useParams();
  const { t, p, categories, itemsByCategory, status } = useApp();
  const [active, setActive] = useState(null);
  const [params, setParams] = useSearchParams();

  /* Показанная категория отстаёт от адреса на время проводов: вкладка
     подсвечивается сразу, а карточки успевают уйти вверх и только потом
     сменятся. shownSlug — то, что на экране, slug — то, что выбрано. */
  const [shownSlug, setShownSlug] = useState(slug);
  const [phase, setPhase] = useState('in');

  useEffect(() => {
    if (slug === shownSlug) return undefined;
    setPhase('out');
    const timer = setTimeout(() => {
      setShownSlug(slug);
      setPhase('in');
    }, SWAP_OUT);
    return () => clearTimeout(timer);
  }, [slug, shownSlug]);

  const category = categories.find((c) => c.slug === shownSlug);
  const dishes = useMemo(
    () => (category ? itemsByCategory[category.id] || [] : []),
    [category, itemsByCategory]
  );

  /* Deep link from search: /menu/pizza?dish=item_012 */
  useEffect(() => {
    const dishId = params.get('dish');
    if (!dishId) return;
    const found = dishes.find((d) => d.id === dishId);
    if (found) {
      setActive(found);
      params.delete('dish');
      setParams(params, { replace: true });
    }
  }, [params, dishes, setParams]);

  /* Прокрутки наверх при смене категории нет намеренно: гость остаётся там
     же, где читал, и просто видит, как карточки сменились. */

  if (status === 'ready' && !categories.find((c) => c.slug === slug)) {
    return (
      <div className="page">
        <Header />
        <main className="page-body shell cat-missing">
          <h1 className="display">404</h1>
          <Link to="/menu" className="btn btn--sm">
            {t('menu.back')}
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="page">
      <Header />

      <main className="page-body">
        <section
          className="cat-hero"
          style={{ backgroundImage: `url(${process.env.PUBLIC_URL}/images/hero.jpg)` }}
        >
          <div className="cat-hero__veil" />
          <div className="cat-hero__inner shell">
            <Link to="/menu" className="back-btn shine">
              <span className="back-btn__icon">
                <Icon name="arrowLeft" size={17} strokeWidth={1.4} />
              </span>
              <span className="label">{t('menu.back')}</span>
            </Link>

            <div className={`cat-hero__row swap swap--${phase}`}>
              {category && category.image && (
                <span
                  className="cat-hero__thumb"
                  style={{ backgroundImage: `url(${category.image})` }}
                  aria-hidden="true"
                />
              )}
              <div className="cat-hero__copy">
                <h1 className="cat-hero__title display">{category ? p(category.name) : ''}</h1>
                <p className="cat-hero__desc">{category ? p(category.description) : ''}</p>
                <p className="label muted">
                  {dishes.length} {t('menu.positions')}
                </p>
              </div>
            </div>
          </div>
        </section>

        <nav className="cat-tabs shell" aria-label={t('menu.title')}>
          <div className="cat-tabs__track">
            {categories.map((c) => (
              <NavLink
                key={c.id}
                to={`/menu/${c.slug}`}
                className={({ isActive }) => `cat-tab label${isActive ? ' is-active' : ''}`}
              >
                <Icon name={c.icon} size={16} />
                {p(c.name)}
              </NavLink>
            ))}
          </div>
        </nav>

        <section className="shell cat-geo">
          <GeoPanel compact />
        </section>

        <section className="shell cat-list">
          {dishes.length === 0 ? (
            <p className="cat-empty">{t('menu.empty')}</p>
          ) : (
            /* key по категории перезапускает вход: иначе React переиспользует
               карточки и анимация появления не играет */
            <div key={shownSlug} className={`dish-grid swap swap--${phase}`}>
              {dishes.map((item, i) => (
                <DishCard key={item.id} item={item} index={i} onOpen={setActive} />
              ))}
            </div>
          )}
        </section>
      </main>

      <Footer />
      <DishModal item={active} onClose={() => setActive(null)} />
    </div>
  );
}
