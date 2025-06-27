// components/HomePage/CallToAction.jsx
// Final CTA section with gradient background
// Implements the CTA section from the fourth screenshot

import React from 'react';
import Link from 'next/link';

export default function CallToAction() {
  return (
    <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-teal-600 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-transparent"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        <div className="text-center">
          {/* Main Heading */}
          <h2 className="text-3xl lg:text-5xl font-bold text-white mb-6">
            Start Winning Smarter – It's Free to Try
          </h2>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-50 transform hover:scale-105 transition-all duration-200 shadow-lg"
            >
              Start Now
            </Link>
            
            <button className="inline-flex items-center justify-center border-2 border-white/30 text-white px-8 py-4 rounded-lg font-semibold hover:bg-white/10 transform hover:scale-105 transition-all duration-200">
              See How It Works
            </button>
          </div>

          {/* Small text below buttons */}
          <div className="text-blue-100">
            No credit card needed · Takes 2 minutes to onboard
          </div>
        </div>
      </div>
    </section>
  );
}