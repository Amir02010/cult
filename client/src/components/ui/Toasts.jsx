import React from 'react';
import Icon from './Icon';
import { useApp } from '../../context/AppContext';
import './Toasts.css';

export default function Toasts() {
  const { toasts, dismissToast } = useApp();
  if (!toasts.length) return null;

  return (
    <div className="toasts" role="status" aria-live="polite">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast toast--${toast.kind}`}>
          <Icon name={toast.kind === 'error' ? 'close' : 'check'} size={16} />
          <span>{toast.message}</span>
          <button type="button" onClick={() => dismissToast(toast.id)} aria-label="ok">
            <Icon name="close" size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
