import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import CategoryStrip from '../components/home/CategoryStrip';
import DishCard from '../components/menu/DishCard';
import DishModal from '../components/menu/DishModal';
import GeoPanel from '../components/geo/GeoPanel';
import Icon from '../components/ui/Icon';
import useReveal from '../hooks/useReveal';
import { useApp } from '../context/AppContext';
import './MenuPage.css';

function SectionHead({ children }) {
  const ref = useReveal();
  return (
    <header ref={ref} className="menu-section__head reveal reveal--left">
      {children}
    </header>
  );
}

export default function MenuPage() {
  const { t, p, categories, itemsByCategory, status } = useApp();
  const [active, setActive] = useState(null);

  return (
    <div className="page">
      <Header />

      <main className="page-body">
        <section className="menu-head shell">
          <span className="rule" />
          <h1 className="menu-head__title display">{t('menu.all')}</h1>
          <p className="menu-head__sub label muted">CULT RESTAURANT · ONLINE MENU</p>
        </section>

        <section className="shell menu-strip">
          <CategoryStrip categories={categories} />
        </section>

        <section className="shell menu-geo">
          <GeoPanel compact />
        </section>

        {status === 'loading' && (
          <p className="shell menu-loading">{t('common.loading')}</p>
        )}

        {categories.map((category) => {
          const dishes = itemsByCategory[category.id] || [];
          if (!dishes.length) return null;
          return (
            <section className="menu-section shell" key={category.id} id={category.slug}>
              <SectionHead>
                <div>
                  <h2 className="menu-section__title display">{p(category.name)}</h2>
                  <p className="menu-section__desc">{p(category.description)}</p>
                </div>
                <Link to={`/menu/${category.slug}`} className="menu-section__link label">
                  {dishes.length} {t('menu.positions')}
                  <Icon name="arrowRight" size={16} />
                </Link>
              </SectionHead>

              <div className="dish-grid">
                {dishes.map((item, i) => (
                  <DishCard key={item.id} item={item} index={i} onOpen={setActive} />
                ))}
              </div>
            </section>
          );
        })}
      </main>

      <Footer />
      <DishModal item={active} onClose={() => setActive(null)} />
    </div>
  );
}
