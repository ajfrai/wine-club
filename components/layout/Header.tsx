'use client';

import React from 'react';
import Link from 'next/link';
import { Wine } from 'lucide-react';

interface HeaderProps {
  showLogin?: boolean;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ showLogin = true, onLogout }) => {
  return (
    <header className="absolute top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-2 hover:opacity-70 transition-opacity">
            <Wine className="w-6 h-6 text-wine-dark" />
            <span className="text-lg font-semibold text-wine-dark">Home</span>
          </Link>

          <div className="flex items-center space-x-4">
            {showLogin && !onLogout && (
              <Link
                href="/login"
                className="px-4 py-2 text-wine-dark hover:text-wine font-medium transition-colors"
              >
                Log In
              </Link>
            )}

            {onLogout && (
              <button
                onClick={onLogout}
                className="px-4 py-2 bg-wine-dark hover:bg-wine text-white rounded-lg transition-colors"
              >
                Log Out
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
