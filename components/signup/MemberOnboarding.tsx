'use client';

import React, { useState } from 'react';
import { ChevronRight, Wine, Calendar, Users } from 'lucide-react';

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
      className={`fixed inset-0 z-50 bg-gradient-to-br from-[#f5e6e0] to-[#e8d4cc] transition-opacity duration-400 ${
        isExiting ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {/* Content */}
      <div className="h-full flex items-center justify-center px-8">
        <div className="text-center max-w-2xl">
          <h1 className="text-5xl md:text-7xl font-light text-gray-900 mb-8 tracking-tight">
            Join a Club
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 leading-relaxed mb-16">
            Great wine is better with company. Join a local club and discover new bottles with new friends.
          </p>

          <div className="space-y-8 max-w-md mx-auto">
            <div className="flex items-center gap-6 text-left">
              <div className="w-14 h-14 rounded-full bg-wine-dark/10 flex items-center justify-center flex-shrink-0">
                <Wine className="w-6 h-6 text-wine-dark" />
              </div>
              <p className="text-lg text-gray-700">Curated wines delivered monthly</p>
            </div>
            <div className="flex items-center gap-6 text-left">
              <div className="w-14 h-14 rounded-full bg-wine-dark/10 flex items-center justify-center flex-shrink-0">
                <Calendar className="w-6 h-6 text-wine-dark" />
              </div>
              <p className="text-lg text-gray-700">Tastings hosted near you</p>
            </div>
            <div className="flex items-center gap-6 text-left">
              <div className="w-14 h-14 rounded-full bg-wine-dark/10 flex items-center justify-center flex-shrink-0">
                <Users className="w-6 h-6 text-wine-dark" />
              </div>
              <p className="text-lg text-gray-700">A community of fellow enthusiasts</p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="absolute bottom-0 left-0 right-0 p-8">
        <div className="max-w-2xl mx-auto flex justify-center">
          <button
            onClick={handleContinue}
            className="flex items-center gap-3 px-8 py-4 rounded-full font-medium bg-wine-dark text-white hover:bg-wine-dark/90 transition-all duration-300"
          >
            Get started
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
