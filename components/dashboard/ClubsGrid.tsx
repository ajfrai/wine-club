'use client';

import { useState, useEffect } from 'react';
import ClubCard from './ClubCard';
import { NearbyClub } from '@/types/member.types';

interface ClubsGridProps {
  initialClubs?: NearbyClub[];
  joinedClubIds?: string[];
  onJoin?: (hostId: string) => Promise<void>;
  onLeave?: (hostId: string) => Promise<void>;
}

export default function ClubsGrid({ initialClubs = [], joinedClubIds = [], onJoin, onLeave }: ClubsGridProps) {
  const [clubs, setClubs] = useState<NearbyClub[]>(initialClubs);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingClubId, setLoadingClubId] = useState<string | null>(null);

  useEffect(() => {
    setClubs(initialClubs);
  }, [initialClubs]);

  const handleJoin = async (hostId: string) => {
    if (!onJoin) return;
    setLoadingClubId(hostId);
    try {
      await onJoin(hostId);
    } finally {
      setLoadingClubId(null);
    }
  };

  const handleLeave = async (hostId: string) => {
    if (!onLeave) return;
    setLoadingClubId(hostId);
    try {
      await onLeave(hostId);
    } finally {
      setLoadingClubId(null);
    }
  };

  if (clubs.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-gray-600">No clubs found in your area.</p>
        <p className="text-sm text-gray-500 mt-2">Try increasing your search radius or updating your location.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {clubs.map((club) => (
        <ClubCard
          key={club.host_id}
          club={club}
          isJoined={joinedClubIds.includes(club.host_id)}
          onJoin={handleJoin}
          onLeave={handleLeave}
          isLoading={loadingClubId === club.host_id}
        />
      ))}
    </div>
  );
}
