'use client';

import React, { useState } from 'react';
import { ChevronDown, Users, Calendar, Settings } from 'lucide-react';

interface HostOnboardingProps {
  onComplete: () => void;
}

export const HostOnboarding: React.FC<HostOnboardingProps> = ({ onComplete }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isExiting, setIsExiting] = useState(false);

  const totalSlides = 3;

  const goToNext = () => {
    console.log('[HostOnboarding] goToNext called, currentSlide:', currentSlide);
    if (currentSlide < totalSlides - 1) {
      console.log('[HostOnboarding] Moving to next slide:', currentSlide + 1);
      setCurrentSlide(currentSlide + 1);
    } else {
      console.log('[HostOnboarding] Last slide - completing onboarding');
      setIsExiting(true);
      setTimeout(onComplete, 400);
    }
  };

  const isLastSlide = currentSlide === totalSlides - 1;

  return (
    <div
      className={`fixed inset-0 z-50 bg-gradient-to-br from-wine-dark to-wine transition-opacity duration-400 ${
        isExiting ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {/* Progress bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-white/10">
        <div
          className="h-full bg-sunburst-400 transition-all duration-500 ease-out"
          style={{ width: `${((currentSlide + 1) / totalSlides) * 100}%` }}
        />
      </div>

      {/* Slides */}
      <div className="h-full flex flex-col">
        {/* Slide 0: Welcome */}
        <div
          className={`absolute inset-0 flex items-center justify-center px-8 transition-all duration-500 ${
            currentSlide === 0
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 -translate-y-8 pointer-events-none'
          }`}
        >
          <div className="text-center max-w-2xl">
            <h1 className="text-5xl md:text-7xl font-light text-white mb-8 tracking-tight">
              Become a Host
            </h1>
            <p className="text-xl md:text-2xl text-white/70 leading-relaxed mb-6">
              Our mission is to strengthen the social fabric by giving people reasons to come together.
            </p>
            <p className="text-lg text-white/50">
              As a host, you'll bring people together and build a community around something timeless.
            </p>
          </div>
        </div>

        {/* Slide 1: How it works */}
        <div
          className={`absolute inset-0 flex items-center justify-center px-8 transition-all duration-500 ${
            currentSlide === 1
              ? 'opacity-100 translate-y-0'
              : currentSlide < 1
              ? 'opacity-0 translate-y-8 pointer-events-none'
              : 'opacity-0 -translate-y-8 pointer-events-none'
          }`}
        >
          <div className="text-center max-w-2xl">
            <h2 className="text-4xl md:text-6xl font-light text-white mb-16 tracking-tight">
              How it works
            </h2>
            <div className="space-y-12">
              <div className="flex items-center gap-6 text-left">
                <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                  <Users className="w-7 h-7 text-white/80" />
                </div>
                <div>
                  <h3 className="text-xl font-medium text-white">Members join your club</h3>
                  <p className="text-white/50 mt-1">They sign up, set preferences, and subscribe.</p>
                </div>
              </div>
              <div className="flex items-center gap-6 text-left">
                <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-7 h-7 text-white/80" />
                </div>
                <div>
                  <h3 className="text-xl font-medium text-white">Select Wines for Your Events</h3>
                  <p className="text-white/50 mt-1">Curated selections tailored to your club's preferences.</p>
                </div>
              </div>
              <div className="flex items-center gap-6 text-left">
                <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">🍷</span>
                </div>
                <div>
                  <h3 className="text-xl font-medium text-white">You host the tasting</h3>
                  <p className="text-white/50 mt-1">Gather your members, open the bottles, enjoy the evening.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Slide 2: Your role */}
        <div
          className={`absolute inset-0 flex items-center justify-center px-8 transition-all duration-500 ${
            currentSlide === 2
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-8 pointer-events-none'
          }`}
        >
          <div className="text-center max-w-2xl">
            <h2 className="text-4xl md:text-6xl font-light text-white mb-16 tracking-tight">
              Your role
            </h2>
            <div className="space-y-8 text-left">
              <div className="flex items-start gap-5">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-white text-sm">✓</span>
                </div>
                <div>
                  <h3 className="text-xl font-medium text-white">Host Wine Tastings</h3>
                  <p className="text-white/50 mt-1">Provide a space and set the vibe.</p>
                </div>
              </div>
              <div className="flex items-start gap-5">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-white text-sm">✓</span>
                </div>
                <div>
                  <h3 className="text-xl font-medium text-white">Manage your club</h3>
                  <p className="text-white/50 mt-1">Configure pricing, approve members, set the schedule.</p>
                </div>
              </div>
              <div className="flex items-start gap-5">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-white text-sm">✓</span>
                </div>
                <div>
                  <h3 className="text-xl font-medium text-white">Pick and Pick Up Your Wine</h3>
                  <p className="text-white/50 mt-1">Manage inventory for your events.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="max-w-2xl mx-auto flex justify-between items-center">
            {/* Dots */}
            <div className="flex gap-2">
              {[0, 1, 2].map((i) => (
                <button
                  key={i}
                  onClick={() => setCurrentSlide(i)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    i === currentSlide ? 'w-8 bg-white' : 'w-2 bg-white/30 hover:bg-white/50'
                  }`}
                />
              ))}
            </div>

            {/* Continue button */}
            <button
              onClick={() => {
                console.log('[HostOnboarding] Continue/Ready button clicked');
                goToNext();
              }}
              className={`flex items-center gap-3 px-8 py-4 rounded-full font-medium transition-all duration-300 ${
                isLastSlide
                  ? 'bg-wine text-white hover:bg-wine-dark'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              {isLastSlide ? "I'm ready" : 'Continue'}
              <ChevronDown className={`w-5 h-5 transition-transform ${isLastSlide ? 'rotate-[-90deg]' : ''}`} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
