'use client';

import React from 'react';
import Link from 'next/link';
import { Wine } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="absolute top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14">
          <Link href="/" className="flex items-center space-x-2 hover:opacity-70 transition-opacity">
            <Wine className="w-6 h-6 text-wine-dark" />
            <span className="text-lg font-semibold text-wine-dark">Wine Club</span>
          </Link>
        </div>
      </div>
    </header>
  );
};
