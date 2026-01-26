'use client';

import React from 'react';
import Link from 'next/link';
import { Wine } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <Wine className="w-8 h-8 text-wine-dark" />
            <span className="text-xl font-bold text-wine-dark">Wine Club</span>
          </Link>

          {/* Navigation */}
          <nav className="flex items-center space-x-8">
            <Link
              href="/"
              className="text-gray-700 hover:text-wine-dark transition-colors font-medium"
            >
              Home
            </Link>
            <Link
              href="/signup"
              className="px-4 py-2 bg-sunburst-600 hover:bg-sunburst-700 text-white rounded-lg transition-colors font-medium"
            >
              Get Started
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
};
