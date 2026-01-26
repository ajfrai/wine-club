'use client';

import React, { useState } from 'react';
import { ChevronRight, Wine, Calendar, Users } from 'lucide-react';

interface MemberOnboardingProps {
  onComplete: () => void;
}

const slides = [
  {
    id: 'welcome',
    content: (
      <div className="text-center">
        <h1 className="text-4xl font-light text-gray-900 mb-6">
          Join a Club
        </h1>
        <p className="text-xl text-gray-600 leading-relaxed max-w-md mx-auto mb-10">
          Great wine is better with company. Join a local club and discover new bottles with new friends.
        </p>
        <div className="space-y-6 max-w-xs mx-auto text-left">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-wine-light/50 flex items-center justify-center flex-shrink-0">
              <Wine className="w-5 h-5 text-wine-dark" />
            </div>
            <p className="text-gray-600">Curated wines delivered monthly</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-wine-light/50 flex items-center justify-center flex-shrink-0">
              <Calendar className="w-5 h-5 text-wine-dark" />
            </div>
            <p className="text-gray-600">Tastings hosted near you</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-wine-light/50 flex items-center justify-center flex-shrink-0">
              <Users className="w-5 h-5 text-wine-dark" />
            </div>
            <p className="text-gray-600">A community of fellow enthusiasts</p>
          </div>
        </div>
      </div>
    ),
  },
];

export const MemberOnboarding: React.FC<MemberOnboardingProps> = ({ onComplete }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const goToNext = () => {
    if (currentSlide < slides.length - 1) {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentSlide(currentSlide + 1);
        setIsTransitioning(false);
      }, 200);
    } else {
      onComplete();
    }
  };

  return (
    <div className="flex flex-col h-full min-h-[500px]">
      {/* Slide content */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div
          className={`transition-all duration-200 ${
            isTransitioning ? 'opacity-0 translate-x-4' : 'opacity-100 translate-x-0'
          }`}
        >
          {slides[currentSlide].content}
        </div>
      </div>

      {/* Navigation */}
      <div className="px-6 pb-8">
        {/* Button */}
        <div className="flex justify-center">
          <button
            onClick={goToNext}
            className="flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all duration-200 bg-sunburst-600 hover:bg-sunburst-700 text-white"
          >
            Get started
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
