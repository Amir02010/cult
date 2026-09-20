import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import api from '../api/api';
import {
  DEFAULT_LANG,
  LANGUAGES,
  formatPrice,
  pick,
  translate,
} from '../i18n';

const AppContext = createContext(null);

const LANG_KEY = 'cult.lang';

function readLang() {
  try {
    const saved = localStorage.getItem(LANG_KEY);
    if (saved && LANGUAGES.some((l) => l.code === saved)) return saved;
  } catch (err) {
    /* ignore */
  }
  return DEFAULT_LANG;
}

export function AppProvider({ children }) {
  const [lang, setLangState] = useState(readLang);
  const [data, setData] = useState({
    settings: null,
    categories: [],
    items: [],
    tables: [],
    locked: false,
  });
  const [status, setStatus] = useState('loading');
  const [toasts, setToasts] = useState([]);

  const setLang = useCallback((next) => {
    setLangState(next);
    try {
      localStorage.setItem(LANG_KEY, next);
    } catch (err) {
      /* ignore */
    }
    document.documentElement.setAttribute('lang', next);
  }, []);

  const load = useCallback(async () => {
    setStatus((s) => (s === 'ready' ? 'ready' : 'loading'));
    try {
      const payload = await api.menu();
      setData(payload);
      setStatus('ready');
      return;
    } catch (err) {
      /* Сервера нет — ниже пробуем витрину. Если и её нет, это обычная
         ошибка связи, и гость увидит предложение повторить. */
    }

    /* Витрина: собранный сайт может лежать там, где сервера не существует
       (например на Vercel). Рядом со статикой лежит снимок меню — показываем
       его, чтобы страница не была пустой. Заказ в этом режиме выключен
       самим снимком, а не спрятан на клиенте. */
    try {
      const res = await fetch(`${process.env.PUBLIC_URL}/menu-snapshot.json`);
      if (!res.ok) throw new Error('нет снимка');
      const snapshot = await res.json();
      setData(snapshot);
      setStatus('ready');
    } catch (err) {
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    document.documentElement.setAttribute('lang', lang);
  }, [lang]);

  const toast = useCallback((message, kind = 'info') => {
    const id = Math.random().toString(36).slice(2);
    setToasts((list) => [...list, { id, message, kind }]);
    setTimeout(() => {
      setToasts((list) => list.filter((t) => t.id !== id));
    }, 3600);
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts((list) => list.filter((t) => t.id !== id));
  }, []);

  const t = useCallback((key) => translate(lang, key), [lang]);
  const p = useCallback((value) => pick(value, lang), [lang]);

  const currency = data.settings ? data.settings.currency : null;
  const money = useCallback(
    (value) => formatPrice(value, lang, currency),
    [lang, currency]
  );

  const itemsByCategory = useMemo(() => {
    const map = {};
    data.items.forEach((item) => {
      if (!map[item.categoryId]) map[item.categoryId] = [];
      map[item.categoryId].push(item);
    });
    return map;
  }, [data.items]);

  const value = useMemo(
    () => ({
      lang,
      setLang,
      languages: LANGUAGES,
      t,
      p,
      money,
      status,
      reload: load,
      settings: data.settings,
      locked: !!data.locked,
      /* true — сайт открыт без сервера, как витрина: меню видно, заказ нет */
      demo: !!data.demo,
      categories: data.categories,
      items: data.items,
      tables: data.tables,
      itemsByCategory,
      toast,
      toasts,
      dismissToast,
    }),
    [
      lang, setLang, t, p, money, status, load, data, itemsByCategory,
      toast, toasts, dismissToast,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside <AppProvider>');
  return ctx;
}

export default AppContext;
