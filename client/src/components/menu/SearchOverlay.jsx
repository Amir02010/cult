import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../ui/Icon';
import { useApp } from '../../context/AppContext';
import './SearchOverlay.css';

export default function SearchOverlay({ open, onClose }) {
  const { t, p, money, items, categories } = useApp();
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!open) {
      setQuery('');
      return undefined;
    }
    const timer = setTimeout(() => inputRef.current && inputRef.current.focus(), 120);
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      clearTimeout(timer);
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return [];
    return items
      .filter((item) => {
        const haystack = [
          p(item.name),
          p(item.description),
        ]
          .join(' ')
          .toLowerCase();
        return haystack.includes(q);
      })
      .slice(0, 12);
  }, [query, items, p]);

  const categoryOf = (id) => categories.find((c) => c.id === id);

  const goto = (item) => {
    const cat = categoryOf(item.categoryId);
    onClose();
    navigate(cat ? `/menu/${cat.slug}?dish=${item.id}` : '/menu');
  };

  return (
    <div className={`search-overlay${open ? ' is-open' : ''}`} aria-hidden={!open}>
      <button type="button" className="search-overlay__scrim" onClick={onClose} tabIndex={-1} aria-label={t('nav.close')} />

      <div className="search-overlay__panel" role="dialog" aria-modal="true" aria-label={t('nav.search')}>
        <div className="search-overlay__bar shell">
          <Icon name="search" size={22} />
          <input
            ref={inputRef}
            className="search-overlay__input"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('menu.searchPlaceholder')}
            aria-label={t('nav.search')}
          />
          <button type="button" className="icon-btn" onClick={onClose} aria-label={t('nav.close')}>
            <Icon name="close" size={20} />
          </button>
        </div>

        <div className="search-overlay__results shell">
          {query.trim().length >= 2 && results.length === 0 && (
            <p className="search-overlay__empty">{t('menu.nothingFound')}</p>
          )}
          <ul>
            {results.map((item) => {
              const cat = categoryOf(item.categoryId);
              return (
                <li key={item.id}>
                  <button type="button" className="search-result" onClick={() => goto(item)}>
                    <span
                      className="search-result__thumb"
                      style={item.image ? { backgroundImage: `url(${item.image})` } : undefined}
                    />
                    <span className="search-result__body">
                      <span className="search-result__name">{p(item.name)}</span>
                      {cat && <span className="search-result__cat label">{p(cat.name)}</span>}
                    </span>
                    <span className="search-result__price">{money(item.price)}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}
