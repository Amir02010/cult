import React from 'react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import Hero from '../components/home/Hero';

export default function HomePage() {
  return (
    <div className="page">
      <Header />
      <main>
        <Hero />
      </main>
      <Footer />
    </div>
  );
}
