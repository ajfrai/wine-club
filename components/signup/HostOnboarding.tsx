'use client';

import React, { useState } from 'react';
import { ChevronRight, Users, Calendar, Settings } from 'lucide-react';

interface HostOnboardingProps {
  onComplete: () => void;
}

const slides = [
  {
    id: 'welcome',
    content: (
      <div className="text-center">
        <h1 className="text-4xl font-light text-gray-900 mb-6">
          Become a Host
        </h1>
        <p className="text-xl text-gray-600 leading-relaxed max-w-md mx-auto">
          Our mission is simple: strengthen the social fabric by giving people reasons to come together.
        </p>
        <p className="text-lg text-gray-500 mt-8 max-w-sm mx-auto">
          As a host, you'll bring people together and build a community around something timeless.
        </p>
      </div>
    ),
  },
  {
    id: 'how-it-works',
    content: (
      <div className="text-center">
        <h2 className="text-3xl font-light text-gray-900 mb-12">
          How it works
        </h2>
        <div className="space-y-8 max-w-sm mx-auto">
          <div className="flex items-start gap-4 text-left">
            <div className="w-10 h-10 rounded-full bg-sunburst-100 flex items-center justify-center flex-shrink-0">
              <Users className="w-5 h-5 text-sunburst-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Members join your club</h3>
              <p className="text-gray-500 text-sm mt-1">They sign up, set preferences, and subscribe.</p>
            </div>
          </div>
          <div className="flex items-start gap-4 text-left">
            <div className="w-10 h-10 rounded-full bg-sunburst-100 flex items-center justify-center flex-shrink-0">
              <Calendar className="w-5 h-5 text-sunburst-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Wine arrives monthly</h3>
              <p className="text-gray-500 text-sm mt-1">Selections are made automatically based on your club's taste.</p>
            </div>
          </div>
          <div className="flex items-start gap-4 text-left">
            <div className="w-10 h-10 rounded-full bg-wine-light/30 flex items-center justify-center flex-shrink-0">
              <span className="text-wine-dark text-lg">🍷</span>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">You host the tasting</h3>
              <p className="text-gray-500 text-sm mt-1">Gather your members, open the bottles, enjoy the evening.</p>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'responsibilities',
    content: (
      <div className="text-center">
        <h2 className="text-3xl font-light text-gray-900 mb-12">
          Your role
        </h2>
        <div className="space-y-6 max-w-sm mx-auto text-left">
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-green-600 text-sm">✓</span>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Host monthly tastings</h3>
              <p className="text-gray-500 text-sm mt-1">Provide a space and set the vibe.</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-green-600 text-sm">✓</span>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Manage your club</h3>
              <p className="text-gray-500 text-sm mt-1">Configure pricing, approve members, set the schedule.</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-green-600 text-sm">✓</span>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Receive deliveries</h3>
              <p className="text-gray-500 text-sm mt-1">Wine ships to you before each tasting.</p>
            </div>
          </div>
        </div>
      </div>
    ),
  },
];

export const HostOnboarding: React.FC<HostOnboardingProps> = ({ onComplete }) => {
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

  const goToPrev = () => {
    if (currentSlide > 0) {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentSlide(currentSlide - 1);
        setIsTransitioning(false);
      }, 200);
    }
  };

  const isLastSlide = currentSlide === slides.length - 1;

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
        {/* Progress dots */}
        <div className="flex justify-center gap-2 mb-8">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setIsTransitioning(true);
                setTimeout(() => {
                  setCurrentSlide(index);
                  setIsTransitioning(false);
                }, 200);
              }}
              className={`w-2 h-2 rounded-full transition-all duration-200 ${
                index === currentSlide
                  ? 'bg-wine-dark w-6'
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        {/* Buttons */}
        <div className="flex justify-between items-center">
          <button
            onClick={goToPrev}
            className={`text-gray-500 hover:text-gray-700 transition-colors ${
              currentSlide === 0 ? 'invisible' : ''
            }`}
          >
            Back
          </button>

          <button
            onClick={goToNext}
            className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all duration-200 ${
              isLastSlide
                ? 'bg-sunburst-600 hover:bg-sunburst-700 text-white'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            {isLastSlide ? "I'm ready" : 'Continue'}
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
