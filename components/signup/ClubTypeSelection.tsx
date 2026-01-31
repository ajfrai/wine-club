'use client';

import React from 'react';
import { Home, Users } from 'lucide-react';
import type { ClubType } from '@/types/auth.types';

interface ClubTypeSelectionProps {
  onSelect: (clubType: ClubType) => void;
}

export const ClubTypeSelection: React.FC<ClubTypeSelectionProps> = ({ onSelect }) => {
  return (
    <div className="flex items-center justify-center min-h-screen px-8">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-light text-gray-900 mb-4 tracking-tight">
            What type of club do you want to create?
          </h1>
          <p className="text-lg text-gray-600">
            Choose the hosting model that works best for your wine club
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Fixed Location Club */}
          <button
            onClick={() => onSelect('fixed')}
            className="group relative bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 p-8 text-left border-2 border-transparent hover:border-wine-dark"
          >
            <div className="w-16 h-16 rounded-full bg-wine-dark bg-opacity-10 flex items-center justify-center mb-6 group-hover:bg-opacity-20 transition-colors">
              <Home className="w-8 h-8 text-wine-dark" />
            </div>

            <h2 className="text-2xl font-semibold text-gray-900 mb-3">
              Fixed Location Club
            </h2>

            <p className="text-gray-600 mb-4">
              I'll host events at my place
            </p>

            <ul className="space-y-2 text-sm text-gray-500">
              <li className="flex items-start">
                <span className="text-wine-dark mr-2">✓</span>
                <span>Traditional wine club model</span>
              </li>
              <li className="flex items-start">
                <span className="text-wine-dark mr-2">✓</span>
                <span>You host all events at your location</span>
              </li>
              <li className="flex items-start">
                <span className="text-wine-dark mr-2">✓</span>
                <span>Members can discover your club by location</span>
              </li>
            </ul>

            <div className="mt-6 text-wine-dark font-medium group-hover:translate-x-2 transition-transform inline-flex items-center">
              Choose Fixed Location
              <span className="ml-2">→</span>
            </div>
          </button>

          {/* Multi-Host Club */}
          <button
            onClick={() => onSelect('multi_host')}
            className="group relative bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 p-8 text-left border-2 border-transparent hover:border-wine-dark"
          >
            <div className="w-16 h-16 rounded-full bg-wine-dark bg-opacity-10 flex items-center justify-center mb-6 group-hover:bg-opacity-20 transition-colors">
              <Users className="w-8 h-8 text-wine-dark" />
            </div>

            <h2 className="text-2xl font-semibold text-gray-900 mb-3">
              Multi-Host Club
            </h2>

            <p className="text-gray-600 mb-4">
              Friend group taking turns hosting
            </p>

            <ul className="space-y-2 text-sm text-gray-500">
              <li className="flex items-start">
                <span className="text-wine-dark mr-2">✓</span>
                <span>Flexible hosting arrangement</span>
              </li>
              <li className="flex items-start">
                <span className="text-wine-dark mr-2">✓</span>
                <span>Any member can host events at their location</span>
              </li>
              <li className="flex items-start">
                <span className="text-wine-dark mr-2">✓</span>
                <span>Perfect for groups of friends</span>
              </li>
            </ul>

            <div className="mt-6 text-wine-dark font-medium group-hover:translate-x-2 transition-transform inline-flex items-center">
              Choose Multi-Host
              <span className="ml-2">→</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
