// components/HomePage/HeroSection.jsx
// Hero section component matching the provided screenshot design
// Features AI-powered tender management with interactive dashboard

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  CheckCircleIcon, 
  PlayIcon,
  BoltIcon,
  TrendingUpIcon
} from '@heroicons/react/24/outline';

export default function HeroSection() {
  const [currentTender, setCurrentTender] = useState(0);

  // Mock tender opportunities data matching the screenshot
  const tenderOpportunities = [
    {
      title: "Infrastructure Development Project",
      value: "$2.4M",
      match: "95%",
      status: "Live"
    },
    {
      title: "IT Services Modernization",
      value: "$890K",
      match: "87%",
      status: "Live"
    },
    {
      title: "Renewable Energy Installation",
      value: "$1.8M",
      match: "92%",
      status: "Live"
    }
  ];

  // Auto-rotate tender opportunities
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTender((prev) => (prev + 1) % tenderOpportunities.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="min-h-screen bg-gradient-to-br from-gray-100 via-gray-50 to-blue-50 flex items-center">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left Column - Content */}
          <div className="space-y-8">
            {/* AI Badge */}
            <div className="inline-flex items-center space-x-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-full text-sm font-medium border border-blue-200">
              <BoltIcon className="h-4 w-4" />
              <span>AI-Powered Tender Management</span>
            </div>

            {/* Main Heading */}
            <div className="space-y-6">
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Win More Tenders
                <br />
                with{' '}
                <span className="text-blue-600">AI Intelligence</span>
              </h1>
              
              <p className="text-xl text-gray-600 leading-relaxed max-w-2xl">
                Transform your tendering process with AI that discovers 
                opportunities, analyzes requirements, ensures compliance, and 
                helps you craft winning proposals.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link 
                href="/signup"
                className="group inline-flex items-center justify-center px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Start Free Trial
                <svg className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              
              <button className="inline-flex items-center justify-center px-8 py-4 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transform hover:scale-105 transition-all duration-200">
                <PlayIcon className="h-5 w-5 mr-2" />
                Watch Demo
              </button>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-col sm:flex-row gap-6 pt-4">
              <div className="flex items-center space-x-2 text-green-600">
                <CheckCircleIcon className="h-5 w-5" />
                <span className="text-sm font-medium">Free 14-day trial</span>
              </div>
              <div className="flex items-center space-x-2 text-green-600">
                <CheckCircleIcon className="h-5 w-5" />
                <span className="text-sm font-medium">No credit card required</span>
              </div>
            </div>
          </div>

          {/* Right Column - Tender Opportunities Dashboard */}
          <div className="relative">
            <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 rounded-2xl p-6 shadow-2xl transform rotate-1 hover:rotate-0 transition-transform duration-300">
              {/* Dashboard Header */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-white font-semibold text-lg">Tender Opportunities</h3>
                <span className="bg-green-400 text-green-900 px-3 py-1 rounded-full text-xs font-bold">
                  Live
                </span>
              </div>

              {/* Tender Cards */}
              <div className="space-y-4">
                {tenderOpportunities.map((tender, index) => (
                  <div
                    key={index}
                    className={`bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20 transition-all duration-500 ${
                      index === currentTender ? 'bg-white/20 scale-105' : 'hover:bg-white/15'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-white font-medium text-sm">{tender.title}</h4>
                      <span className="text-cyan-200 text-xs font-medium">{tender.match} match</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-white/80 text-sm">Value: {tender.value}</span>
                      <button className="bg-white/20 hover:bg-white/30 text-white px-3 py-1 rounded text-xs font-medium transition-colors">
                        Analyze
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Win Rate Badge */}
              <div className="absolute -bottom-4 -right-4 bg-orange-500 text-white p-4 rounded-xl shadow-lg transform rotate-12 hover:rotate-6 transition-transform">
                <div className="flex items-center space-x-2">
                  <TrendingUpIcon className="h-5 w-5" />
                  <div>
                    <div className="text-xs font-medium">Win Rate</div>
                    <div className="text-lg font-bold">+45%</div>
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