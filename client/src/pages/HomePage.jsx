import React from 'react';
import Header from '../components/layout/Header';
import Hero from '../components/home/Hero';

export default function HomePage() {
  return (
    <div className="page">
      <Header />
      <main>
        <Hero />
      </main>
    </div>
  );
}
