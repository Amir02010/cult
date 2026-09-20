import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useApp } from './AppContext';

const CartContext = createContext(null);

const CART_KEY = 'cult.cart';
const TABLE_KEY = 'cult.table';

function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (err) {
    return fallback;
  }
}

function writeJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    /* private mode — the cart simply will not survive a reload */
  }
}

export function CartProvider({ children }) {
  const { items } = useApp();
  const [lines, setLines] = useState(() => readJSON(CART_KEY, []));
  const [table, setTableState] = useState(() => readJSON(TABLE_KEY, ''));
  const [open, setOpen] = useState(false);

  useEffect(() => writeJSON(CART_KEY, lines), [lines]);
  useEffect(() => writeJSON(TABLE_KEY, table), [table]);

  /* Drop lines whose dish disappeared from the menu. */
  useEffect(() => {
    if (!items.length || !lines.length) return;
    const alive = lines.filter((l) => items.some((i) => i.id === l.id));
    if (alive.length !== lines.length) setLines(alive);
  }, [items]); // eslint-disable-line react-hooks/exhaustive-deps

  const add = useCallback((item, qty = 1) => {
    setLines((list) => {
      const existing = list.find((l) => l.id === item.id);
      if (existing) {
        return list.map((l) =>
          l.id === item.id ? { ...l, qty: Math.min(50, l.qty + qty) } : l
        );
      }
      return [...list, { id: item.id, qty }];
    });
  }, []);

  const setQty = useCallback((id, qty) => {
    setLines((list) =>
      qty <= 0
        ? list.filter((l) => l.id !== id)
        : list.map((l) => (l.id === id ? { ...l, qty: Math.min(50, qty) } : l))
    );
  }, []);

  const remove = useCallback((id) => {
    setLines((list) => list.filter((l) => l.id !== id));
  }, []);

  const clear = useCallback(() => setLines([]), []);

  const setTable = useCallback((code) => setTableState(code || ''), []);

  const detailed = useMemo(
    () =>
      lines
        .map((line) => {
          const item = items.find((i) => i.id === line.id);
          return item ? { ...line, item } : null;
        })
        .filter(Boolean),
    [lines, items]
  );

  const count = useMemo(() => lines.reduce((acc, l) => acc + l.qty, 0), [lines]);
  const total = useMemo(
    () => detailed.reduce((acc, l) => acc + l.item.price * l.qty, 0),
    [detailed]
  );

  const value = useMemo(
    () => ({
      lines, detailed, count, total, table, setTable,
      add, setQty, remove, clear,
      open, setOpen,
      qtyOf: (id) => {
        const line = lines.find((l) => l.id === id);
        return line ? line.qty : 0;
      },
    }),
    [lines, detailed, count, total, table, setTable, add, setQty, remove, clear, open]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside <CartProvider>');
  return ctx;
}

export default CartContext;
