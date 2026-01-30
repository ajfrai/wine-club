'use client';

import React from 'react';
import { Wine, Star } from 'lucide-react';

export const PublicWinesTab: React.FC = () => {
  return (
    <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
      <Wine className="w-16 h-16 text-gray-300 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Wine Collection</h3>
      <p className="text-gray-600 mb-4 max-w-md mx-auto">
        The host's wine collection will be displayed here soon.
      </p>
      <div className="inline-flex items-center gap-2 text-sm text-gray-500 bg-gray-100 px-4 py-2 rounded-full">
        <Star className="w-4 h-4" />
        Coming Soon
      </div>
    </div>
  );
};
