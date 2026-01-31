'use client';

import React, { useState } from 'react';
import { ChevronRight } from 'lucide-react';

interface MemberOnboardingProps {
  onComplete: () => void;
}

export const MemberOnboarding: React.FC<MemberOnboardingProps> = ({ onComplete }) => {
  const [isExiting, setIsExiting] = useState(false);

  const handleContinue = () => {
    setIsExiting(true);
    setTimeout(onComplete, 400);
  };

  return (
    <div
      className={`fixed inset-0 z-50 bg-gradient-to-br from-sunburst-50 to-wine-light transition-opacity duration-400 ${
        isExiting ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {/* Content */}
      <div className="h-full flex items-center justify-center px-8">
        <div className="text-center max-w-2xl">
          <h1 className="text-5xl md:text-7xl font-light text-wine-dark mb-8 tracking-tight">
            Find your table
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 leading-relaxed mb-6">
            Find wine tastings in your community where people gather to discover and enjoy wine together.
          </p>
          <p className="text-lg text-gray-500">
            You bring yourself. We handle the rest.
          </p>
        </div>
      </div>

      {/* Navigation */}
      <div className="absolute bottom-0 left-0 right-0 p-8">
        <div className="max-w-2xl mx-auto flex justify-center">
          <button
            onClick={handleContinue}
            className="flex items-center gap-3 px-8 py-4 rounded-full font-medium bg-wine text-white hover:bg-wine-dark transition-all duration-300"
          >
            Get started
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
