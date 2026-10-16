import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Logo from '../components/ui/Logo';
import Icon from '../components/ui/Icon';
import { useAuth } from '../context/AuthContext';

export default function AdminLogin() {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [reveal, setReveal] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await login(username.trim(), password);
    } catch (err) {
      setError(
        err && err.code === 'too_many_attempts'
          ? 'Слишком много попыток. Повторите через 5 минут.'
          : err && err.code === 'network'
          ? 'Нет связи с сервером. Запущен ли он на порту 4000?'
          : 'Неверный логин или пароль'
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="admin-login">
      <div
        className="admin-login__bg"
        aria-hidden="true"
        style={{ backgroundImage: `url(${process.env.PUBLIC_URL}/images/hero.jpg)` }}
      />
      <form className="admin-login__card" onSubmit={submit}>
        <Link to="/" className="admin-login__brand" aria-label="CULT Restaurant">
          <Logo size={40} />
          <span className="brand__name">CULT</span>
        </Link>

        <p className="eyebrow admin-login__eyebrow">Панель управления</p>

        <label className="field">
          <span>Логин</span>
          <input
            className="input"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            autoFocus
            required
          />
        </label>

        <label className="field">
          <span>Пароль</span>
          <span className="admin-login__password">
            <input
              className="input"
              type={reveal ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
            <button
              type="button"
              className="admin-login__reveal"
              onClick={() => setReveal((v) => !v)}
              aria-label={reveal ? 'Скрыть пароль' : 'Показать пароль'}
            >
              <Icon name={reveal ? 'eyeOff' : 'eye'} size={17} />
            </button>
          </span>
        </label>

        {error && <p className="admin-login__error">{error}</p>}

        <button type="submit" className="btn btn--solid btn--block" disabled={busy}>
          {busy ? 'Входим…' : 'Войти'}
        </button>

        <Link to="/" className="admin-login__back label">
          ← На сайт
        </Link>
      </form>
    </div>
  );
}
