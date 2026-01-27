'use client';

import { useState, useEffect } from 'react';
import ClubsGrid from '@/components/dashboard/ClubsGrid';
import { NearbyClub } from '@/types/member.types';
import { MapPin, Loader2 } from 'lucide-react';

export default function ClubsPage() {
  const [clubs, setClubs] = useState<NearbyClub[]>([]);
  const [joinedClubIds, setJoinedClubIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [radius, setRadius] = useState(50);

  useEffect(() => {
    loadData();
  }, [radius]);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Fetch nearby clubs
      const clubsResponse = await fetch(`/api/member/clubs?radius=${radius}`);
      if (clubsResponse.ok) {
        const { clubs: fetchedClubs } = await clubsResponse.json();
        setClubs(fetchedClubs || []);
      } else {
        const errorData = await clubsResponse.json();
        setError(errorData.error || 'Failed to load clubs');
      }

      // Fetch memberships
      const membershipsResponse = await fetch('/api/member/memberships');
      if (membershipsResponse.ok) {
        const { memberships } = await membershipsResponse.json();
        const ids = memberships?.map((m: any) => m.host_id) || [];
        setJoinedClubIds(ids);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

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
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Browse Clubs</h1>
        <p className="text-gray-600 mt-2">Find and join wine clubs near you.</p>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-gray-600" />
          <label htmlFor="radius" className="text-sm font-medium text-gray-700">
            Search Radius:
          </label>
        </div>
        <select
          id="radius"
          value={radius}
          onChange={(e) => setRadius(parseInt(e.target.value, 10))}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value={10}>10 miles</option>
          <option value={25}>25 miles</option>
          <option value={50}>50 miles</option>
          <option value={100}>100 miles</option>
          <option value={200}>200 miles</option>
        </select>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <p className="text-red-800">{error}</p>
          {error.includes('location') && (
            <p className="text-sm text-red-700 mt-2">
              Please update your profile with your address to find nearby clubs.
            </p>
          )}
        </div>
      ) : (
        <ClubsGrid
          initialClubs={clubs}
          joinedClubIds={joinedClubIds}
          onJoin={handleJoin}
          onLeave={handleLeave}
        />
      )}
    </div>
  );
}
