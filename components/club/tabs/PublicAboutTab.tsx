'use client';

import React from 'react';
import { MapPin, Wine } from 'lucide-react';

interface PublicAboutTabProps {
  aboutClub: string | null;
  clubAddress: string | null;
  winePreferences: string | null;
}

export const PublicAboutTab: React.FC<PublicAboutTabProps> = ({
  aboutClub,
  clubAddress,
  winePreferences,
}) => {
  return (
    <div className="space-y-6">
      {/* About */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">About This Club</h2>
        {aboutClub ? (
          <p className="text-gray-700 whitespace-pre-wrap">{aboutClub}</p>
        ) : (
          <p className="text-gray-500 italic">No description yet.</p>
        )}
      </div>

      {/* Location */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Location</h2>
        <div className="flex items-start gap-3">
          <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
          {clubAddress ? (
            <span className="text-gray-700">{clubAddress}</span>
          ) : (
            <span className="text-gray-500 italic">No location specified</span>
          )}
        </div>
      </div>

      {/* Wine Preferences */}
      {winePreferences && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Wine Preferences</h2>
          <div className="flex items-start gap-3">
            <Wine className="w-5 h-5 text-gray-400 mt-0.5" />
            <span className="text-gray-700">{winePreferences}</span>
          </div>
        </div>
      )}
    </div>
  );
};
