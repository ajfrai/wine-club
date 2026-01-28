'use client';

import { MapPin, Users } from 'lucide-react';
import Link from 'next/link';
import { NearbyClub } from '@/types/member.types';

interface ClubCardProps {
  club: NearbyClub;
  isJoined?: boolean;
  onJoin?: (hostId: string) => void;
  onLeave?: (hostId: string) => void;
  isLoading?: boolean;
}

export default function ClubCard({ club, isJoined = false, onJoin, onLeave, isLoading = false }: ClubCardProps) {
  const handleAction = () => {
    if (isJoined && onLeave) {
      onLeave(club.host_id);
    } else if (!isJoined && onJoin) {
      onJoin(club.host_id);
    }
  };

  // Parse wine preferences from comma-separated string
  const winePreferences = club.wine_preferences
    ? club.wine_preferences.split(',').map(pref => pref.trim()).filter(Boolean).slice(0, 3)
    : [];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{club.host_name}</h3>
          <p className="text-sm text-gray-600 mt-1">Code: {club.host_code}</p>
        </div>
        <div className="flex items-center gap-1 text-sm text-gray-600">
          <MapPin className="w-4 h-4" />
          <span>{club.distance.toFixed(1)} mi</span>
        </div>
      </div>

      <div className="flex items-center gap-1 mb-2 text-sm text-gray-700">
        <Users className="w-4 h-4 flex-shrink-0" />
        <span>{club.member_count} {club.member_count === 1 ? 'member' : 'members'}</span>
      </div>

      {winePreferences.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {winePreferences.map((pref, index) => (
            <span
              key={index}
              className="inline-block px-3 py-1 bg-wine-light text-wine-dark text-xs font-medium rounded-full"
            >
              {pref}
            </span>
          ))}
        </div>
      )}

      <div className="space-y-2 mb-4">
        <div className="flex items-start gap-2 text-sm text-gray-700">
          <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>{club.club_address}</span>
        </div>
        {club.about_club && (
          <p className="text-sm text-gray-600 line-clamp-2">{club.about_club}</p>
        )}
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleAction}
          disabled={isLoading}
          className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors disabled:bg-gray-400 ${
            isJoined
              ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              : 'bg-wine text-white hover:bg-wine-dark'
          }`}
        >
          {isLoading ? 'Loading...' : isJoined ? 'Leave Club' : 'Join Club'}
        </button>
        <Link
          href={`/dashboard/member/clubs/${club.host_id}`}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-center"
        >
          View Details
        </Link>
      </div>
    </div>
  );
}
