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

export default function CategoryPage() {
  const { slug } = useParams();
  const { t, p, categories, itemsByCategory, status } = useApp();
  const [active, setActive] = useState(null);
  const [params, setParams] = useSearchParams();

  const category = categories.find((c) => c.slug === slug);
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

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [slug]);

  if (status === 'ready' && !category) {
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

            <div className="cat-hero__row">
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
            <div className="dish-grid">
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
