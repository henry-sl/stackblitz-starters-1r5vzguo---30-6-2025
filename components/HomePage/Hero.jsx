// components/HomePage/Hero.jsx
// Hero section with main value proposition and tender opportunities showcase
// Implements the hero layout from the first screenshot

import React from 'react';
import Link from 'next/link';

export default function Hero() {
  return (
    <section className="relative bg-gradient-to-br from-gray-50 to-blue-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Content */}
          <div className="space-y-8 animate-fade-in">
            {/* Main Heading */}
            <div className="space-y-4">
              <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Discover. Bid. Win.
                <br />
                <span className="text-blue-600">Tenderly makes public tenders smarter and fairer with AI.</span>
              </h1>
              
              <p className="text-xl text-gray-600 leading-relaxed max-w-lg">
                Tenderly empowers businesses of all sizes to access and win government tenders with the help of AI – no connections or insider access required.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/tenders"
                className="inline-flex items-center justify-center bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-blue-700 transform hover:scale-105 transition-all duration-200 shadow-lg"
              >
                🔵 Explore Live Tenders
              </Link>
              
              <button className="inline-flex items-center justify-center border border-gray-300 text-gray-700 px-8 py-4 rounded-lg font-semibold hover:bg-gray-50 transform hover:scale-105 transition-all duration-200">
                ⚡ Generate Smart Proposal
              </button>
            </div>

            {/* Small text below CTA */}
            <div className="text-sm text-gray-600">
              No registration required · Built for ASEAN SMEs
            </div>
          </div>

          {/* Right Column - Visual Element */}
          <div className="relative animate-fade-in-delay">
            <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-6 shadow-2xl">
              {/* Dashboard Header */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-white text-lg font-semibold">AI-Powered Tender Matching</h3>
                <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                  Live
                </span>
              </div>

              {/* Feature Cards */}
              <div className="space-y-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 hover:bg-white/20 transition-all duration-200">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-white font-medium text-sm">Smart Document Analysis</h4>
                    <span className="text-blue-200 text-sm">95% Accuracy</span>
                  </div>
                  <div className="text-blue-100 text-sm">
                    Extract key requirements and deadlines automatically
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 hover:bg-white/20 transition-all duration-200">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-white font-medium text-sm">Compliance Checking</h4>
                    <span className="text-blue-200 text-sm">Real-time</span>
                  </div>
                  <div className="text-blue-100 text-sm">
                    Verify your bid meets all submission requirements
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 hover:bg-white/20 transition-all duration-200">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-white font-medium text-sm">Win Probability</h4>
                    <span className="text-blue-200 text-sm">AI-Powered</span>
                  </div>
                  <div className="text-blue-100 text-sm">
                    Estimate your chances based on historical data
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}