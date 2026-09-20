import React from 'react';
import { Link } from 'react-router-dom';
import Icon from '../ui/Icon';
import useTilt from '../../hooks/useTilt';
import { useApp } from '../../context/AppContext';
import './CategoryStrip.css';

export function CategoryCard({ category, index = 0 }) {
  const { p } = useApp();
  const tiltRef = useTilt({ max: 11, scale: 1.04 });
  /* `rise` lives on the wrapper: an animation with fill-mode would otherwise
     overwrite the transform the tilt writes on the card itself. */
  return (
    <span
      className="cat-card-wrap rise"
      style={{ animationDelay: `${0.35 + index * 0.07}s` }}
    >
    <Link
      ref={tiltRef}
      to={`/menu/${category.slug}`}
      className="cat-card tilt"
      aria-label={p(category.name)}
    >
      <span className="cat-card__frame">
        <span
          className="cat-card__photo"
          style={category.image ? { backgroundImage: `url(${category.image})` } : undefined}
          role="img"
          aria-label={p(category.name)}
        />
        <span className="cat-card__veil" />
        <span className="cat-card__body">
          <span className="cat-card__icon">
            <Icon name={category.icon} size={22} strokeWidth={1.1} />
          </span>
          <span className="cat-card__name">{p(category.name)}</span>
          <span className="cat-card__arrow">
            <Icon name="arrowRight" size={17} strokeWidth={1.1} />
          </span>
        </span>
        <span className="cat-card__sheen" />
      </span>
    </Link>
    </span>
  );
}

export default function CategoryStrip({ categories }) {
  if (!categories || categories.length === 0) return null;
  return (
    <div className="cat-strip">
      <div className="cat-strip__track">
        {categories.map((category, i) => (
          <CategoryCard key={category.id} category={category} index={i} />
        ))}
      </div>
    </div>
  );
}
