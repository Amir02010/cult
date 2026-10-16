import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import api, { setGeoToken } from '../api/api';
import { useApp } from './AppContext';

const GeoContext = createContext(null);

const DEVICE_KEY = 'cult.device';

/**
 * A stable per-device id. It is not a security boundary on its own — it simply
 * binds a verified position to the device that reported it, so a token cannot
 * be copied to another phone.
 */
function deviceId() {
  try {
    let id = localStorage.getItem(DEVICE_KEY);
    if (!id) {
      id = 'dev_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
      localStorage.setItem(DEVICE_KEY, id);
    }
    return id;
  } catch (err) {
    return 'dev_anon';
  }
}

/* status: idle | checking | inside | outside | denied | unsupported | accuracy | error */

export function GeoProvider({ children }) {
  const { settings, reload, locked } = useApp();
  const [status, setStatus] = useState('idle');
  const [info, setInfo] = useState({ distance: null, accuracy: null, radius: null });
  const [token, setToken] = useState(null);
  const [expiresAt, setExpiresAt] = useState(0);
  const watchRef = useRef(null);
  const busyRef = useRef(false);

  const geoRequired = settings ? settings.geoRequired !== false : true;

  const readPosition = useCallback(
    () =>
      new Promise((resolve, reject) => {
        if (!('geolocation' in navigator)) {
          reject(new Error('unsupported'));
          return;
        }

        /* Свой таймер обязателен. Штатный `timeout` браузера не срабатывает,
           если гость просто закрыл окно запроса разрешения, не ответив, —
           тогда не вызывается ни один из колбэков, и ожидание длится вечно. */
        let settled = false;
        const guard = setTimeout(() => {
          if (settled) return;
          settled = true;
          reject(new Error('timeout'));
        }, 12000);

        navigator.geolocation.getCurrentPosition(
          (pos) => {
            if (settled) return;
            settled = true;
            clearTimeout(guard);
            resolve(pos);
          },
          (err) => {
            if (settled) return;
            settled = true;
            clearTimeout(guard);
            reject(err);
          },
          { enableHighAccuracy: true, timeout: 11000, maximumAge: 0 }
        );
      }),
    []
  );

  const check = useCallback(async () => {
    if (busyRef.current) return;
    busyRef.current = true;
    setStatus('checking');

    try {
      const pos = await readPosition();
      const payload = {
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
        accuracy: pos.coords.accuracy,
        deviceId: deviceId(),
      };
      const result = await api.verifyGeo(payload);
      setGeoToken(result.token);
      setToken(result.token);
      setExpiresAt(Date.now() + (result.expiresIn || 600) * 1000);
      setInfo({
        distance: result.distance ?? null,
        accuracy: result.accuracy ?? Math.round(pos.coords.accuracy),
        radius: result.radius ?? null,
      });
      setStatus('inside');
    } catch (err) {
      if (err && err.code === 1) {
        setStatus('denied');
      } else if (err && (err.code === 2 || err.code === 3)) {
        setStatus('error');
      } else if (err && err.message === 'unsupported') {
        setStatus('unsupported');
      } else if (err && err.message === 'timeout') {
        setStatus('error');
      } else if (err && err.status === 403) {
        const payload = err.payload || {};
        setInfo({
          distance: payload.distance ?? null,
          accuracy: payload.accuracy ?? null,
          radius: payload.radius ?? null,
        });
        setStatus(payload.reason === 'accuracy' ? 'accuracy' : 'outside');
        setGeoToken(null);
        setToken(null);
      } else {
        setStatus('error');
      }
    } finally {
      busyRef.current = false;
    }
  }, [readPosition]);

  /* In `onsite` mode the server withholds the menu until presence is proven,
     so the moment we hold a token we ask for the menu again. Guarded by the
     token itself: a token the server keeps rejecting must not spin a loop. */
  const retriedFor = useRef(null);
  useEffect(() => {
    if (!locked || status !== 'inside' || !token) return;
    if (retriedFor.current === token) return;
    retriedFor.current = token;
    reload();
  }, [locked, status, token, reload]);

  /* Re-verify shortly before the token expires so a long dinner does not
     suddenly fail at checkout. */
  useEffect(() => {
    if (status !== 'inside' || !expiresAt) return undefined;
    const delay = Math.max(30000, expiresAt - Date.now() - 60000);
    const timer = setTimeout(() => check(), delay);
    return () => clearTimeout(timer);
  }, [status, expiresAt, check]);

  useEffect(() => () => {
    if (watchRef.current != null && 'geolocation' in navigator) {
      navigator.geolocation.clearWatch(watchRef.current);
    }
  }, []);

  const canOrder = !geoRequired || status === 'inside';

  const value = useMemo(
    () => ({
      status,
      info,
      token,
      check,
      canOrder,
      geoRequired,
      deviceId: deviceId(),
      reset: () => {
        setStatus('idle');
        setGeoToken(null);
        setToken(null);
      },
    }),
    [status, info, token, check, canOrder, geoRequired]
  );

  return <GeoContext.Provider value={value}>{children}</GeoContext.Provider>;
}

export function useGeo() {
  const ctx = useContext(GeoContext);
  if (!ctx) throw new Error('useGeo must be used inside <GeoProvider>');
  return ctx;
}

export default GeoContext;
