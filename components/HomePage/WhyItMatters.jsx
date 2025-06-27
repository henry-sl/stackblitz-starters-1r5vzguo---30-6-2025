// components/HomePage/WhyItMatters.jsx
// Trust-building section explaining the mission and impact
// Addresses corruption and fairness in public procurement

import React from 'react';

export default function WhyItMatters() {
  return (
    <section className="py-20 lg:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          {/* Headline */}
          <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-8">
            Level the Playing Field for Public Procurement.
          </h2>
          
          {/* Body Text */}
          <p className="text-xl text-gray-600 leading-relaxed">
            In many countries, access to tenders depends on who you know – not what you can do. 
            Tenderly removes those barriers by giving every business an equal shot, powered by open data, 
            smart matching, and transparent evaluation.
          </p>
        </div>
      </div>
    </section>
  );
}