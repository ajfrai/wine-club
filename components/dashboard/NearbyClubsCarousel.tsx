'use client';

import { useState } from 'react';
import ClubsGrid from './ClubsGrid';
import { NearbyClub } from '@/types/member.types';

interface NearbyClubsCarouselProps {
  initialClubs: NearbyClub[];
  initialJoinedClubIds: string[];
}

export default function NearbyClubsCarousel({ initialClubs, initialJoinedClubIds }: NearbyClubsCarouselProps) {
  const [joinedClubIds, setJoinedClubIds] = useState<string[]>(initialJoinedClubIds);

  const handleJoin = async (hostId: string) => {
    try {
      const response = await fetch('/api/member/memberships', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ host_id: hostId }),
      });

      if (response.ok) {
        setJoinedClubIds([...joinedClubIds, hostId]);
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to join club');
      }
    } catch (error) {
      console.error('Error joining club:', error);
      alert('An unexpected error occurred');
    }
  };

  const handleLeave = async (hostId: string) => {
    try {
      const response = await fetch(`/api/member/memberships?host_id=${hostId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setJoinedClubIds(joinedClubIds.filter((id) => id !== hostId));
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to leave club');
      }
    } catch (error) {
      console.error('Error leaving club:', error);
      alert('An unexpected error occurred');
    }
  };

  return (
    <ClubsGrid
      initialClubs={initialClubs}
      joinedClubIds={joinedClubIds}
      onJoin={handleJoin}
      onLeave={handleLeave}
    />
  );
}
