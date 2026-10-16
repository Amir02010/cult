import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { fetchMenu } from '../supabase/menuApi';
import {
  DEFAULT_LANG,
  LANGUAGES,
  formatPrice,
  pick,
  translate,
} from '../i18n';

const AppContext = createContext(null);

/* Xato sababini ekranda ko'rsatish uchun qisqa izoh. */
function describeError(err) {
  const msg = (err && err.message) || String(err || '');
  if (msg === 'supabase_not_configured') {
    return 'Supabase kaliti berilmagan: client/.env.development → REACT_APP_SUPABASE_ANON_KEY. Keyin npm start ni qayta ishga tushiring.';
  }
  if (/failed to fetch|networkerror|load failed/i.test(msg)) {
    return 'Supabase serveriga ulanib bo\'lmadi: internet / VPN yoki REACT_APP_SUPABASE_URL ni tekshiring.';
  }
  if (/invalid api key|jwt|apikey/i.test(msg)) {
    return 'API kalit noto\'g\'ri: Supabase → Settings → API Keys dan qayta nusxalang.';
  }
  if (/does not exist|could not find the table|schema cache/i.test(msg)) {
    return 'Supabase\'da kerakli jadval topilmadi (categories / products / restaurants): ' + msg;
  }
  if (/permission denied|row-level security/i.test(msg)) {
    return 'Ruxsat yo\'q: supabase/public-read-policies.sql ni SQL Editor da ishga tushiring.';
  }
  return msg;
}

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
  const [error, setError] = useState(null);
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
      /* Menyu to'g'ridan-to'g'ri Supabase'dan olinadi:
         categories + products + restaurants (src/supabase/menuApi.js). */
      const payload = await fetchMenu();
      setData(payload);
      setError(null);
      setStatus('ready');
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('[supabase] menyuni yuklab bo\'lmadi:', err);
      setError(describeError(err));
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
      error,
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
      toast, toasts, dismissToast, error,
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
