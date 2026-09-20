import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Icon from '../components/ui/Icon';
import api from '../api/api';
import { useApp } from '../context/AppContext';
import { AdminModal, LocalizedField, ImagePicker } from './parts';
import { ICON_CHOICES, emptyLocalized } from './constants';

function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9а-яё]+/gi, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);
}

export default function MenuManagerPage() {
  const { money, toast, reload } = useApp();
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState(null);
  const [catDraft, setCatDraft] = useState(null);
  const [itemDraft, setItemDraft] = useState(null);

  const load = useCallback(async () => {
    try {
      const [cats, list] = await Promise.all([
        api.get('/api/admin/categories'),
        api.get('/api/admin/items'),
      ]);
      setCategories(cats);
      setItems(list);
      setSelected((prev) => (prev && cats.some((c) => c.id === prev) ? prev : cats[0] ? cats[0].id : null));
    } catch (err) {
      toast('Не удалось загрузить меню', 'error');
    }
  }, [toast]);

  useEffect(() => {
    load();
  }, [load]);

  const visibleItems = useMemo(
    () => items.filter((i) => i.categoryId === selected).sort((a, b) => a.order - b.order),
    [items, selected]
  );

  const refresh = async () => {
    await load();
    reload();
  };

  /* ------------------------------------------------------------ categories */

  function newCategory() {
    setCatDraft({
      name: emptyLocalized(),
      description: emptyLocalized(),
      icon: 'bowl',
      image: '',
      slug: '',
      visible: true,
    });
  }

  async function saveCategory(e) {
    e.preventDefault();
    const payload = { ...catDraft, slug: catDraft.slug || slugify(catDraft.name.en || catDraft.name.ru) };
    try {
      if (catDraft.id) await api.put(`/api/admin/categories/${catDraft.id}`, payload);
      else await api.post('/api/admin/categories', payload);
      setCatDraft(null);
      toast('Категория сохранена', 'success');
      refresh();
    } catch (err) {
      toast('Не удалось сохранить категорию', 'error');
    }
  }

  async function removeCategory(category) {
    // eslint-disable-next-line no-alert
    if (!window.confirm('Удалить категорию вместе со всеми блюдами?')) return;
    try {
      await api.del(`/api/admin/categories/${category.id}`);
      toast('Категория удалена', 'success');
      refresh();
    } catch (err) {
      toast('Не удалось удалить категорию', 'error');
    }
  }

  async function moveCategory(index, delta) {
    const next = categories.slice();
    const target = index + delta;
    if (target < 0 || target >= next.length) return;
    const [moved] = next.splice(index, 1);
    next.splice(target, 0, moved);
    setCategories(next);
    await api.post('/api/admin/categories/reorder', { ids: next.map((c) => c.id) });
    refresh();
  }

  /* ----------------------------------------------------------------- items */

  function newItem() {
    if (!selected) return;
    setItemDraft({
      categoryId: selected,
      name: emptyLocalized(),
      description: emptyLocalized(),
      price: '',
      weight: '',
      image: '',
      visible: true,
      popular: false,
    });
  }

  async function saveItem(e) {
    e.preventDefault();
    try {
      const payload = {
        ...itemDraft,
        price: Number(itemDraft.price) || 0,
        weight: Number(itemDraft.weight) || 0,
      };
      if (itemDraft.id) await api.put(`/api/admin/items/${itemDraft.id}`, payload);
      else await api.post('/api/admin/items', payload);
      setItemDraft(null);
      toast('Блюдо сохранено', 'success');
      refresh();
    } catch (err) {
      toast('Не удалось сохранить блюдо', 'error');
    }
  }

  async function removeItem(item) {
    // eslint-disable-next-line no-alert
    if (!window.confirm('Удалить блюдо?')) return;
    try {
      await api.del(`/api/admin/items/${item.id}`);
      refresh();
    } catch (err) {
      toast('Не удалось удалить блюдо', 'error');
    }
  }

  async function toggleItem(item, field) {
    try {
      await api.put(`/api/admin/items/${item.id}`, { [field]: !item[field] });
      refresh();
    } catch (err) {
      toast('Не удалось обновить блюдо', 'error');
    }
  }

  const current = categories.find((c) => c.id === selected);

  return (
    <>
      <div className="a-head">
        <div>
          <h1 className="a-head__title">Меню</h1>
          <p className="a-head__sub">
            {categories.length} категорий · {items.length} блюд
          </p>
        </div>
        <div className="a-actions">
          <button type="button" className="btn btn--sm" onClick={newCategory}>
            <Icon name="plus" size={14} />
            Категория
          </button>
          <button type="button" className="btn btn--sm btn--solid" onClick={newItem} disabled={!selected}>
            <Icon name="plus" size={14} />
            Блюдо
          </button>
        </div>
      </div>

      <div className="a-menu">
        <aside className="a-menu__side">
          <h2 className="a-section__title">Категории</h2>
          <ul className="a-cats">
            {categories.map((category, index) => (
              <li key={category.id} className={selected === category.id ? 'is-active' : ''}>
                <button type="button" className="a-cats__pick" onClick={() => setSelected(category.id)}>
                  <Icon name={category.icon} size={17} />
                  <span>
                    {category.name.ru || category.name.en || category.slug}
                    <em>{items.filter((i) => i.categoryId === category.id).length} поз.</em>
                  </span>
                  {category.visible === false && <Icon name="eyeOff" size={15} />}
                </button>
                <span className="a-cats__tools">
                  <button type="button" onClick={() => moveCategory(index, -1)} aria-label="Выше">
                    ↑
                  </button>
                  <button type="button" onClick={() => moveCategory(index, 1)} aria-label="Ниже">
                    ↓
                  </button>
                  <button type="button" onClick={() => setCatDraft(category)} aria-label="Изменить">
                    <Icon name="edit" size={14} />
                  </button>
                  <button type="button" onClick={() => removeCategory(category)} aria-label="Удалить">
                    <Icon name="trash" size={14} />
                  </button>
                </span>
              </li>
            ))}
          </ul>
        </aside>

        <section className="a-menu__main a-card" style={{ padding: 0 }}>
          {!current ? (
            <p className="a-empty">Создайте первую категорию</p>
          ) : visibleItems.length === 0 ? (
            <p className="a-empty">В категории пока нет блюд</p>
          ) : (
            <div className="a-scroll">
              <table className="a-table">
                <thead>
                  <tr>
                    <th style={{ width: 62 }}>Фото</th>
                    <th>Название</th>
                    <th>Цена</th>
                    <th>Грамм</th>
                    <th>Хит</th>
                    <th>Видно</th>
                    <th style={{ textAlign: 'right' }}>Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleItems.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <span
                          className="a-thumb"
                          style={item.image ? { backgroundImage: `url(${item.image})` } : undefined}
                        />
                      </td>
                      <td>
                        <strong style={{ color: 'var(--ink)', fontWeight: 400 }}>
                          {item.name.ru || item.name.en}
                        </strong>
                        <p className="muted" style={{ fontSize: 12, marginTop: 3 }}>
                          {(item.description.ru || '').slice(0, 70)}
                        </p>
                      </td>
                      <td style={{ color: 'var(--gold)', whiteSpace: 'nowrap' }}>{money(item.price)}</td>
                      <td>{item.weight || '—'}</td>
                      <td>
                        <button
                          type="button"
                          className="icon-btn"
                          onClick={() => toggleItem(item, 'popular')}
                          aria-label="Хит"
                          style={{ color: item.popular ? 'var(--gold)' : 'var(--ink-faint)' }}
                        >
                          <Icon name="check" size={16} />
                        </button>
                      </td>
                      <td>
                        <button
                          type="button"
                          className="icon-btn"
                          onClick={() => toggleItem(item, 'visible')}
                          aria-label="Видимость"
                          style={{ color: item.visible ? 'var(--ok)' : 'var(--ink-faint)' }}
                        >
                          <Icon name={item.visible ? 'eye' : 'eyeOff'} size={16} />
                        </button>
                      </td>
                      <td>
                        <div className="a-row" style={{ justifyContent: 'flex-end', flexWrap: 'nowrap' }}>
                          <button type="button" className="btn btn--sm" onClick={() => setItemDraft(item)}>
                            <Icon name="edit" size={13} />
                            Изменить
                          </button>
                          <button type="button" className="icon-btn" onClick={() => removeItem(item)} aria-label="Удалить">
                            <Icon name="trash" size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      {/* --------------------------------------------------- category editor */}
      {catDraft && (
        <AdminModal
          title={catDraft.id ? 'Категория' : 'Новая категория'}
          onClose={() => setCatDraft(null)}
          footer={
            <>
              <button type="button" className="btn btn--sm btn--ghost" onClick={() => setCatDraft(null)}>
                Отмена
              </button>
              <button type="submit" form="cat-form" className="btn btn--sm btn--solid">
                Сохранить
              </button>
            </>
          }
        >
          <form id="cat-form" onSubmit={saveCategory}>
            <LocalizedField
              label="Название"
              value={catDraft.name}
              onChange={(name) => setCatDraft({ ...catDraft, name })}
              required
            />
            <LocalizedField
              label="Описание"
              value={catDraft.description}
              onChange={(description) => setCatDraft({ ...catDraft, description })}
              multiline
            />
            <div className="a-form-grid">
              <label className="field">
                <span>Адрес (slug)</span>
                <input
                  className="input"
                  value={catDraft.slug}
                  onChange={(e) => setCatDraft({ ...catDraft, slug: slugify(e.target.value) })}
                  placeholder="pizza"
                />
              </label>
              <label className="field">
                <span>Иконка</span>
                <select
                  className="select"
                  value={catDraft.icon}
                  onChange={(e) => setCatDraft({ ...catDraft, icon: e.target.value })}
                >
                  {ICON_CHOICES.map((icon) => (
                    <option key={icon} value={icon}>
                      {icon}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <ImagePicker value={catDraft.image} onChange={(image) => setCatDraft({ ...catDraft, image })} />
            <label className="switch">
              <input
                type="checkbox"
                checked={catDraft.visible !== false}
                onChange={(e) => setCatDraft({ ...catDraft, visible: e.target.checked })}
              />
              <i />
              <span>Показывать на сайте</span>
            </label>
          </form>
        </AdminModal>
      )}

      {/* ------------------------------------------------------- item editor */}
      {itemDraft && (
        <AdminModal
          title={itemDraft.id ? 'Блюдо' : 'Новое блюдо'}
          onClose={() => setItemDraft(null)}
          wide
          footer={
            <>
              <button type="button" className="btn btn--sm btn--ghost" onClick={() => setItemDraft(null)}>
                Отмена
              </button>
              <button type="submit" form="item-form" className="btn btn--sm btn--solid">
                Сохранить
              </button>
            </>
          }
        >
          <form id="item-form" onSubmit={saveItem}>
            <LocalizedField
              label="Название"
              value={itemDraft.name}
              onChange={(name) => setItemDraft({ ...itemDraft, name })}
              required
            />
            <LocalizedField
              label="Описание"
              value={itemDraft.description}
              onChange={(description) => setItemDraft({ ...itemDraft, description })}
              multiline
            />
            <div className="a-form-grid">
              <label className="field">
                <span>Категория</span>
                <select
                  className="select"
                  value={itemDraft.categoryId}
                  onChange={(e) => setItemDraft({ ...itemDraft, categoryId: e.target.value })}
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name.ru || c.name.en}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span>Цена</span>
                <input
                  className="input"
                  type="number"
                  min="0"
                  step="1000"
                  value={itemDraft.price}
                  onChange={(e) => setItemDraft({ ...itemDraft, price: e.target.value })}
                  required
                />
              </label>
              <label className="field">
                <span>Вес / объём</span>
                <input
                  className="input"
                  type="number"
                  min="0"
                  value={itemDraft.weight}
                  onChange={(e) => setItemDraft({ ...itemDraft, weight: e.target.value })}
                />
              </label>
            </div>
            <ImagePicker value={itemDraft.image} onChange={(image) => setItemDraft({ ...itemDraft, image })} />
            <div className="a-row" style={{ gap: 22 }}>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={itemDraft.visible !== false}
                  onChange={(e) => setItemDraft({ ...itemDraft, visible: e.target.checked })}
                />
                <i />
                <span>Показывать</span>
              </label>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={!!itemDraft.popular}
                  onChange={(e) => setItemDraft({ ...itemDraft, popular: e.target.checked })}
                />
                <i />
                <span>Отметить как хит</span>
              </label>
            </div>
          </form>
        </AdminModal>
      )}
    </>
  );
}
