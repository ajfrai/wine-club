'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import ClubsGrid from '@/components/dashboard/ClubsGrid';
import ClubCardSkeleton from '@/components/dashboard/ClubCardSkeleton';
import { NearbyClub, Membership } from '@/types/member.types';
import { MapPin, Wine, Search } from 'lucide-react';

type SortOption = 'distance' | 'members' | 'name';

export default function ClubsPage() {
  const [clubs, setClubs] = useState<NearbyClub[]>([]);
  const [joinedClubIds, setJoinedClubIds] = useState<string[]>([]);
  const [pendingClubIds, setPendingClubIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [radius, setRadius] = useState<number | null>(5);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<SortOption>('distance');
  const [joinCode, setJoinCode] = useState('');
  const [isJoiningWithCode, setIsJoiningWithCode] = useState(false);

  // Load radius from localStorage on mount
  useEffect(() => {
    const savedRadius = localStorage.getItem('wine-club-radius-filter');
    if (savedRadius) {
      const parsedRadius = savedRadius === 'all' ? null : parseInt(savedRadius, 10);
      setRadius(parsedRadius);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [radius]);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Fetch nearby clubs
      const queryParam = radius === null ? 'radius=all' : `radius=${radius}`;
      const clubsResponse = await fetch(`/api/member/clubs?${queryParam}`);
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
        const activeIds = memberships?.filter((m: Membership) => m.status === 'active').map((m: Membership) => m.host_id) || [];
        const pendingIds = memberships?.filter((m: Membership) => m.status === 'pending').map((m: Membership) => m.host_id) || [];
        setJoinedClubIds(activeIds);
        setPendingClubIds(pendingIds);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinWithCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode.trim()) return;

    setIsJoiningWithCode(true);
    try {
      const response = await fetch('/api/member/join-with-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ host_code: joinCode.trim().toUpperCase() }),
      });

      if (response.ok) {
        const { membership } = await response.json();
        setJoinedClubIds([...joinedClubIds, membership.host_id]);
        setJoinCode('');
        alert('Successfully joined club!');
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to join club');
      }
    } catch (error) {
      console.error('Error joining with code:', error);
      alert('An unexpected error occurred');
    } finally {
      setIsJoiningWithCode(false);
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
        const { membership } = await response.json();
        if (membership.status === 'active') {
          setJoinedClubIds([...joinedClubIds, hostId]);
        } else if (membership.status === 'pending') {
          setPendingClubIds([...pendingClubIds, hostId]);
        }
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
        setPendingClubIds(pendingClubIds.filter((id) => id !== hostId));
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to leave club');
      }
    } catch (error) {
      console.error('Error leaving club:', error);
      alert('An unexpected error occurred');
    }
  };

  // Check if error indicates no location is set
  const isNoLocationError = error?.includes('location');

  // Filter clubs based on search query
  const filteredClubs = useMemo(() => {
    if (!searchQuery.trim()) {
      return clubs;
    }

    const query = searchQuery.toLowerCase();
    return clubs.filter((club) => {
      const name = club.host_name.toLowerCase();
      const code = club.host_code.toLowerCase();
      const description = (club.about_club || '').toLowerCase();
      const preferences = (club.wine_preferences || '').toLowerCase();

      return name.includes(query) || code.includes(query) || description.includes(query) || preferences.includes(query);
    });
  }, [clubs, searchQuery]);

  // Sort filtered clubs
  const sortedAndFilteredClubs = useMemo(() => {
    const clubsToSort = [...filteredClubs];

    switch (sortBy) {
      case 'members':
        return clubsToSort.sort((a, b) => b.member_count - a.member_count);
      case 'name':
        return clubsToSort.sort((a, b) => a.host_name.localeCompare(b.host_name));
      case 'distance':
      default:
        return clubsToSort.sort((a, b) => a.distance - b.distance);
    }
  }, [filteredClubs, sortBy]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Browse Clubs</h1>
        <p className="text-gray-600 mt-2">Find and join wine clubs near you.</p>
      </div>

      {/* Join with Code */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <form onSubmit={handleJoinWithCode}>
          <label htmlFor="join-code" className="text-sm font-medium text-gray-700">
            Join a Private Club
          </label>
          <div className="flex gap-2 mt-2">
            <input
              id="join-code"
              type="text"
              placeholder="Enter club code"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value)}
              maxLength={8}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-wine"
            />
            <button
              type="submit"
              disabled={isJoiningWithCode || !joinCode.trim()}
              className="px-6 py-2 bg-wine text-white rounded-lg hover:bg-wine-dark disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {isJoiningWithCode ? 'Joining...' : 'Join'}
            </button>
          </div>
        </form>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search clubs..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-wine"
        />
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-gray-600" />
          <label htmlFor="radius" className="text-sm font-medium text-gray-700">
            Radius:
          </label>
          <select
            id="radius"
            value={radius === null ? 'all' : radius}
            onChange={(e) => {
              const value = e.target.value;
              const newRadius = value === 'all' ? null : parseInt(value, 10);
              setRadius(newRadius);
              // Save to localStorage
              localStorage.setItem('wine-club-radius-filter', value);
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-wine"
          >
            <option value="all">All Clubs</option>
            <option value={5}>5 miles</option>
            <option value={10}>10 miles</option>
            <option value={25}>25 miles</option>
            <option value={50}>50 miles</option>
            <option value={100}>100 miles</option>
            <option value={200}>200 miles</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="sort" className="text-sm font-medium text-gray-700">
            Sort by:
          </label>
          <select
            id="sort"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-wine"
          >
            <option value="distance">Nearest First</option>
            <option value="members">Most Members</option>
            <option value="name">A-Z</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <>
          <p className="text-sm text-gray-600 mb-4" aria-live="polite" aria-label="Loading clubs">
            Loading clubs...
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <ClubCardSkeleton key={index} />
            ))}
          </div>
        </>
      ) : isNoLocationError ? (
        // No Location Set Empty State
        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
          <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Location Not Set</h2>
          <p className="text-gray-600 mb-6">Set your address to discover wine clubs near you</p>
          <Link
            href="/dashboard/member/profile"
            className="inline-block px-6 py-2 bg-wine text-white rounded-lg hover:bg-wine-dark transition-colors"
          >
            Update Profile
          </Link>
        </div>
      ) : error ? (
        // Generic error state
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <p className="text-red-800">{error}</p>
        </div>
      ) : sortedAndFilteredClubs.length === 0 && searchQuery ? (
        // No Search Results Empty State
        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
          <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">No Results Found</h2>
          <p className="text-gray-600 mb-6">No clubs match "{searchQuery}"</p>
          <button
            onClick={() => setSearchQuery('')}
            className="inline-block px-6 py-2 bg-wine text-white rounded-lg hover:bg-wine-dark transition-colors"
          >
            Clear Search
          </button>
        </div>
      ) : clubs.length === 0 ? (
        // No Clubs Found Empty State
        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
          <Wine className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">No Clubs Found</h2>
          <p className="text-gray-600 mb-6">Try expanding your search radius</p>
          <button
            onClick={() => setRadius(200)}
            disabled={radius === 200}
            className="inline-block px-6 py-2 bg-wine text-white rounded-lg hover:bg-wine-dark disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            Increase to 200 miles
          </button>
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-600 mb-4" aria-live="polite" aria-label={`Showing ${sortedAndFilteredClubs.length} clubs`}>
            Showing {sortedAndFilteredClubs.length} {sortedAndFilteredClubs.length === 1 ? 'club' : 'clubs'}
          </p>
          <ClubsGrid
            initialClubs={sortedAndFilteredClubs}
            joinedClubIds={joinedClubIds}
            pendingClubIds={pendingClubIds}
            onJoin={handleJoin}
            onLeave={handleLeave}
          />
        </>
      )}
    </div>
  );
}
