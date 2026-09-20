import React from 'react';
import { Link } from 'react-router-dom';
import Icon from '../ui/Icon';
import Logo from '../ui/Logo';
import CategoryStrip from './CategoryStrip';
import { useApp } from '../../context/AppContext';
import './Hero.css';

export default function Hero() {
  const { t, p, categories, settings } = useApp();

  return (
    <section className="hero">
      <div
        className="hero__bg"
        role="img"
        aria-label="CULT Restaurant"
        style={{ backgroundImage: `url(${process.env.PUBLIC_URL}/images/hero.jpg)` }}
      />
      <div className="hero__vignette" aria-hidden="true" />

      <div className="hero__inner shell">
        <div className="hero__main">
          <div className="hero__text">
            <span className="rule rise" style={{ animationDelay: '0.05s' }} />
            <p className="hero__welcome eyebrow rise" style={{ animationDelay: '0.1s' }}>
              {t('hero.welcome')}
            </p>
            <h1 className="hero__title">
              <span className="hero__cult display rise" style={{ animationDelay: '0.16s' }}>
                CULT
              </span>
              <span className="hero__word display rise" style={{ animationDelay: '0.24s' }}>
                Restaurant
              </span>
            </h1>
            <span className="rule rise" style={{ animationDelay: '0.3s' }} />
            <p className="hero__tagline label rise" style={{ animationDelay: '0.34s' }}>
              {settings ? p(settings.tagline) : 'Taste · Culture · Experience'}
            </p>
          </div>

          <Link to="/menu" className="hero__explore rise" style={{ animationDelay: '0.42s' }}>
            <span className="label">{t('hero.explore')}</span>
            <Icon name="arrowRight" size={20} strokeWidth={1.1} />
          </Link>
        </div>

        <CategoryStrip categories={categories} />

        <div className="hero__bar">
          <p className="hero__place label">
            <Icon name="pin" size={15} strokeWidth={1.2} />
            {settings ? p(settings.address) : ''}
          </p>
          <div className="hero__claim">
            <span className="hero__claim-rule" aria-hidden="true" />
            <span className="label">{t('hero.moreThanFood')}</span>
            <span className="hero__claim-rule hero__claim-rule--short" aria-hidden="true" />
            <span className="label">{t('hero.itsCult')}</span>
            <Logo size={22} className="hero__claim-mark" />
          </div>
        </div>
      </div>
    </section>
  );
}
