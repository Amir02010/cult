import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { useApp } from '../context/AppContext';

export default function NotFoundPage() {
  const { t } = useApp();
  return (
    <div className="page">
      <Header />
      <main className="page-body shell cat-missing">
        <h1 className="display">404</h1>
        <Link to="/" className="btn btn--sm">
          {t('menu.back')}
        </Link>
      </main>
      <Footer />
    </div>
  );
}
