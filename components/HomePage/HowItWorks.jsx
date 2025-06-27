// components/HomePage/HowItWorks.jsx
// Process flow section showing the 4-step workflow
// Implements the process timeline from the third screenshot

import React from 'react';

export default function HowItWorks() {
  const steps = [
    {
      number: '01',
      title: 'Connect',
      description: 'Build your profile and sync past work'
    },
    {
      number: '02',
      title: 'Match',
      description: 'See curated tenders with scores'
    },
    {
      number: '03',
      title: 'Generate',
      description: 'Use AI to draft and verify'
    },
    {
      number: '04',
      title: 'Submit & Track',
      description: 'Export or submit with blockchain record'
    }
  ];

  return (
    <section id="how-it-works" className="py-20 lg:py-32 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-6">
            How Tenderly Works
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Simple. Smart. Seamless.
          </p>
        </div>

        {/* Process Steps */}
        <div className="relative">
          {/* Desktop Layout */}
          <div className="hidden lg:block">
            {/* Connection Lines */}
            <div className="absolute top-16 left-0 right-0 h-0.5 bg-blue-200">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-blue-500 to-blue-400"></div>
            </div>

            {/* Steps Grid */}
            <div className="grid grid-cols-4 gap-8">
              {steps.map((step, index) => (
                <div key={index} className="text-center">
                  {/* Step Number Circle */}
                  <div className="relative mb-8">
                    <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto shadow-lg">
                      <span className="text-white font-bold text-lg">{step.number}</span>
                    </div>
                  </div>

                  {/* Step Content */}
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-gray-900">
                      {step.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Mobile Layout */}
          <div className="lg:hidden space-y-8">
            {steps.map((step, index) => (
              <div key={index} className="flex items-start space-x-4">
                {/* Step Number */}
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">{step.number}</span>
                  </div>
                </div>

                {/* Step Content */}
                <div className="flex-1 pt-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-gray-600">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}