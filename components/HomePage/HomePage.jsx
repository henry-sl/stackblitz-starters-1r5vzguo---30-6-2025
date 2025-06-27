// components/HomePage/HomePage.jsx
// Main homepage container component with full-width layout
// Orchestrates all homepage sections with proper structure for landing page

import React from 'react';
import Navigation from './Navigation';
import Hero from './Hero';
import Features from './Features';
import HowItWorks from './HowItWorks';
import WhyItMatters from './WhyItMatters';
import CallToAction from './CallToAction';
import Footer from './Footer';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <main>
        <Hero />
        <Features />
        <HowItWorks />
        <WhyItMatters />
        <CallToAction />
      </main>
      <Footer />
    </div>
  );
}