'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, MapPin, Users, Wine, Loader2 } from 'lucide-react';
import { NearbyClub } from '@/types/member.types';
import { PaymentOptions } from '@/components/member/PaymentOptions';

interface ClubDetails extends NearbyClub {
  is_joined: boolean;
  venmo_username: string | null;
  paypal_username: string | null;
  zelle_handle: string | null;
  accepts_cash: boolean;
}

export default function ClubDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const hostId = params.hostId as string;

  const [club, setClub] = useState<ClubDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadClubDetails();
  }, [hostId]);

  const loadClubDetails = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/member/clubs/${hostId}`);
      if (response.ok) {
        const { club: fetchedClub } = await response.json();
        setClub(fetchedClub);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to load club details');
      }
    } catch (error) {
      console.error('Error loading club details:', error);
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoin = async () => {
    if (!club) return;

    setIsActionLoading(true);
    try {
      const response = await fetch('/api/member/memberships', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ host_id: hostId }),
      });

      if (response.ok) {
        setClub({ ...club, is_joined: true, member_count: club.member_count + 1 });
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to join club');
      }
    } catch (error) {
      console.error('Error joining club:', error);
      alert('An unexpected error occurred');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleLeave = async () => {
    if (!club) return;

    setIsActionLoading(true);
    try {
      const response = await fetch(`/api/member/memberships?host_id=${hostId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setClub({ ...club, is_joined: false, member_count: Math.max(0, club.member_count - 1) });
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to leave club');
      }
    } catch (error) {
      console.error('Error leaving club:', error);
      alert('An unexpected error occurred');
    } finally {
      setIsActionLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-wine animate-spin" />
      </div>
    );
  }

  if (error || !club) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => router.push('/dashboard/member/clubs')}
          className="flex items-center gap-2 text-wine hover:text-wine-dark transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Clubs</span>
        </button>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <p className="text-red-800">{error || 'Club not found'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={() => router.push('/dashboard/member/clubs')}
        className="flex items-center gap-2 text-wine hover:text-wine-dark transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Back to Clubs</span>
      </button>

      {/* Hero Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{club.host_name}</h1>
            <p className="text-lg text-gray-600 mt-2">Code: {club.host_code}</p>
          </div>
          <div className="flex items-center gap-2 text-lg text-gray-600 bg-gray-50 px-4 py-2 rounded-lg">
            <MapPin className="w-5 h-5" />
            <span>{club.distance.toFixed(1)} mi away</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* About Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">About This Club</h2>
            {club.about_club ? (
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{club.about_club}</p>
            ) : (
              <p className="text-gray-500 italic">No description available.</p>
            )}
          </div>

          {/* Address Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Location</h2>
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
              <span className="text-gray-700">{club.club_address}</span>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Info */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Info</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Users className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-600">Members</p>
                  <p className="text-lg font-semibold text-gray-900">{club.member_count}</p>
                </div>
              </div>
              {club.wine_preferences && (
                <div className="flex items-start gap-3">
                  <Wine className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-600">Wine Preferences</p>
                    <p className="text-gray-700">{club.wine_preferences}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <button
              onClick={club.is_joined ? handleLeave : handleJoin}
              disabled={isActionLoading}
              className={`w-full px-6 py-3 rounded-lg font-semibold transition-colors disabled:bg-gray-400 ${
                club.is_joined
                  ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  : 'bg-wine text-white hover:bg-wine-dark'
              }`}
            >
              {isActionLoading ? 'Loading...' : club.is_joined ? 'Leave Club' : 'Join Club'}
            </button>
            {club.is_joined && (
              <p className="text-sm text-gray-600 mt-3 text-center">
                You are a member of this club
              </p>
            )}
          </div>

          {/* Payment Options - Only shown for joined members */}
          {club.is_joined && (
            <PaymentOptions
              venmoUsername={club.venmo_username}
              paypalUsername={club.paypal_username}
              zelleHandle={club.zelle_handle}
              acceptsCash={club.accepts_cash}
            />
          )}
        </div>
      </div>
    </div>
  );
}
