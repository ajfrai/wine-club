'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Users, Wine, Loader2, LogIn, Settings, Calendar, Info } from 'lucide-react';
import { PaymentOptions } from '@/components/member/PaymentOptions';
import { Tabs } from '@/components/ui/Tabs';
import { PublicAboutTab } from '@/components/club/tabs/PublicAboutTab';
import { PublicEventsTab } from '@/components/club/tabs/PublicEventsTab';
import { PublicWinesTab } from '@/components/club/tabs/PublicWinesTab';

interface ClubData {
  host_id: string;
  host_code: string;
  host_name: string;
  club_address: string;
  about_club: string | null;
  wine_preferences: string | null;
  member_count: number;
  is_member: boolean;
  is_pending: boolean;
  is_host: boolean;
  is_logged_in: boolean;
  venmo_username: string | null;
  paypal_username: string | null;
  zelle_handle: string | null;
  accepts_cash: boolean;
}

export default function PublicClubPage() {
  const params = useParams();
  const hostCode = params.hostCode as string;

  const [club, setClub] = useState<ClubData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadClub();
  }, [hostCode]);

  const loadClub = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/clubs/${hostCode}`);
      if (response.ok) {
        const { club: fetchedClub } = await response.json();
        setClub(fetchedClub);
      } else if (response.status === 404) {
        setError('Club not found. Please check the host code and try again.');
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to load club');
      }
    } catch (error) {
      console.error('Error loading club:', error);
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
        body: JSON.stringify({ host_id: club.host_id }),
      });

      if (response.ok) {
        await loadClub();
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
      const response = await fetch(`/api/member/memberships?host_id=${club.host_id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await loadClub();
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
      <div className="min-h-screen bg-gradient-to-br from-sunburst-50 to-wine-light flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-wine animate-spin" />
      </div>
    );
  }

  if (error || !club) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sunburst-50 to-wine-light">
        <div className="max-w-2xl mx-auto px-4 py-16">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <Wine className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Club Not Found</h1>
            <p className="text-gray-600 mb-6">{error || 'This club does not exist.'}</p>
            <Link
              href="/"
              className="inline-block px-6 py-2 bg-wine text-white rounded-lg hover:bg-wine-dark transition-colors"
            >
              Go Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const clubName = `${club.host_name}'s Wine Club`;

  const tabs = [
    {
      id: 'about',
      label: 'About',
      icon: <Info className="w-5 h-5" />,
      content: (
        <PublicAboutTab
          aboutClub={club.about_club}
          clubAddress={club.club_address}
          winePreferences={club.wine_preferences}
        />
      ),
    },
    {
      id: 'events',
      label: 'Events',
      icon: <Calendar className="w-5 h-5" />,
      content: <PublicEventsTab hostCode={hostCode} />,
    },
    {
      id: 'wines',
      label: 'Wines',
      icon: <Wine className="w-5 h-5" />,
      content: <PublicWinesTab />,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-sunburst-50 to-wine-light">
      {/* Header */}
      <header className="bg-white border-b border-wine-light">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-wine hover:text-wine-dark">
            <Wine className="w-6 h-6" />
            <span className="font-semibold">Home</span>
          </Link>
          {club.is_host ? (
            <Link
              href="/dashboard/host/club"
              className="flex items-center gap-2 text-sm text-wine hover:text-wine-dark"
            >
              <Settings className="w-4 h-4" />
              Manage Club
            </Link>
          ) : !club.is_logged_in ? (
            <Link
              href="/login"
              className="flex items-center gap-2 text-sm text-wine hover:text-wine-dark"
            >
              <LogIn className="w-4 h-4" />
              Log in
            </Link>
          ) : null}
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Hero Card */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="flex items-start justify-between flex-wrap gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">{clubName}</h1>
                  <p className="text-gray-500 mt-1">Code: <span className="font-mono font-semibold">{club.host_code}</span></p>
                </div>
                <div className="flex items-center gap-2 text-gray-600 bg-gray-50 px-4 py-2 rounded-lg">
                  <Users className="w-5 h-5" />
                  <span className="font-semibold">{club.member_count}</span>
                  <span>members</span>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <Tabs tabs={tabs} defaultTab="about" />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Action Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              {club.is_host ? (
                <div className="text-center">
                  <p className="text-gray-600 mb-4">You are the host of this club</p>
                  <Link
                    href="/dashboard/host/club"
                    className="block w-full px-6 py-3 bg-wine text-white rounded-lg hover:bg-wine-dark transition-colors font-semibold text-center"
                  >
                    Manage Club
                  </Link>
                </div>
              ) : club.is_member ? (
                <div>
                  <p className="text-green-700 font-medium text-center mb-4">
                    You are a member of this club
                  </p>
                  <button
                    onClick={handleLeave}
                    disabled={isActionLoading}
                    className="w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-semibold disabled:opacity-50"
                  >
                    {isActionLoading ? 'Loading...' : 'Leave Club'}
                  </button>
                </div>
              ) : club.is_pending ? (
                <div>
                  <p className="text-sunburst-600 font-medium text-center mb-4">
                    Your request to join is pending
                  </p>
                  <button
                    onClick={handleLeave}
                    disabled={isActionLoading}
                    className="w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-semibold disabled:opacity-50 border border-gray-300"
                  >
                    {isActionLoading ? 'Loading...' : 'Cancel Request'}
                  </button>
                </div>
              ) : club.is_logged_in ? (
                <button
                  onClick={handleJoin}
                  disabled={isActionLoading}
                  className="w-full px-6 py-3 bg-wine text-white rounded-lg hover:bg-wine-dark transition-colors font-semibold disabled:opacity-50"
                >
                  {isActionLoading ? 'Loading...' : 'Join Club'}
                </button>
              ) : (
                <div className="text-center">
                  <p className="text-gray-600 mb-4">Log in to join this club</p>
                  <Link
                    href={`/login?redirect=/clubs/${club.host_code}`}
                    className="block w-full px-6 py-3 bg-wine text-white rounded-lg hover:bg-wine-dark transition-colors font-semibold text-center"
                  >
                    Log in to Join
                  </Link>
                  <p className="text-sm text-gray-500 mt-3">
                    Don't have an account?{' '}
                    <Link href="/signup" className="text-wine hover:text-wine-dark">
                      Sign up
                    </Link>
                  </p>
                </div>
              )}
            </div>

            {/* Payment Options */}
            <PaymentOptions
              venmoUsername={club.venmo_username}
              paypalUsername={club.paypal_username}
              zelleHandle={club.zelle_handle}
              acceptsCash={club.accepts_cash}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
