/**
 * Адрес API.
 *
 * В production пусто: собранный сайт отдаёт тот же сервер, что и API.
 * В разработке значение приходит из client/.env.development и указывает на
 * localhost:4000. Но если страницу открыли по сетевому адресу (например с
 * телефона по http://192.168.1.110:3000), «localhost» для этого устройства —
 * оно само, и запросы уходят в никуда. Поэтому хост берём тот же, с которого
 * открыта страница, и меняем только порт.
 */
function resolveApiBase() {
  const configured = (process.env.REACT_APP_API_URL || '').replace(/\/+$/, '');
  if (!configured || typeof window === 'undefined') return configured;

  const local = ['localhost', '127.0.0.1', '[::1]'];
  try {
    const target = new URL(configured);
    const pageHost = window.location.hostname;
    if (local.includes(target.hostname) && !local.includes(pageHost)) {
      target.hostname = pageHost;
      return target.origin;
    }
  } catch (err) {
    /* некорректный адрес — используем как есть */
  }
  return configured;
}

const BASE = resolveApiBase();

const TOKEN_KEY = 'cult.staff.token';

/* The current proof-of-presence token. Held in memory only: it is short-lived
   and must never outlive the visit. */
let geoToken = null;

export function setGeoToken(token) {
  geoToken = token || null;
}

export function getGeoToken() {
  return geoToken;
}

export function getToken() {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch (err) {
    return null;
  }
}

export function setToken(token) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch (err) {
    /* storage unavailable — session stays in memory only */
  }
}

export class ApiError extends Error {
  constructor(code, status, payload) {
    super(code);
    this.code = code;
    this.status = status;
    this.payload = payload || {};
  }
}

async function request(method, path, body, options = {}) {
  const headers = {};
  if (body !== undefined && !(body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }
  if (options.auth !== false) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }
  if (geoToken) headers['X-Geo-Token'] = geoToken;

  let response;
  try {
    response = await fetch(BASE + path, {
      method,
      headers,
      body:
        body === undefined
          ? undefined
          : body instanceof FormData
          ? body
          : JSON.stringify(body),
    });
  } catch (err) {
    throw new ApiError('network', 0, {});
  }

  let payload = null;
  const text = await response.text();
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch (err) {
      payload = { raw: text };
    }
  }

  if (!response.ok) {
    const code = (payload && (payload.error || payload.reason)) || 'generic';
    throw new ApiError(code, response.status, payload);
  }
  return payload;
}

export const api = {
  get: (path, options) => request('GET', path, undefined, options),
  post: (path, body, options) => request('POST', path, body, options),
  put: (path, body, options) => request('PUT', path, body, options),
  patch: (path, body, options) => request('PATCH', path, body, options),
  del: (path, options) => request('DELETE', path, undefined, options),

  // --- guest ---------------------------------------------------------------
  menu: () => request('GET', '/api/menu', undefined, { auth: false }),
  verifyGeo: (payload) => request('POST', '/api/geo/verify', payload, { auth: false }),
  createOrder: (payload) => request('POST', '/api/orders', payload, { auth: false }),
  order: (id) => request('GET', `/api/orders/${id}`, undefined, { auth: false }),

  // --- staff ---------------------------------------------------------------
  login: (username, password) =>
    request('POST', '/api/auth/login', { username, password }, { auth: false }),
  me: () => request('GET', '/api/auth/me'),
};

export default api;
