'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Header } from '@/components/layout/Header';
import type { User } from '@/types/auth.types';

export default function MemberDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      router.push('/login');
      return;
    }

    const { data: userData } = await supabase
      .from('users')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (userData?.role !== 'member') {
      router.push('/dashboard/host');
      return;
    }

    setUser(userData);
    setIsLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sunburst-50 to-wine-light">
        <div className="text-wine-dark">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sunburst-50 to-wine-light">
      <Header showLogin={false} onLogout={handleLogout} />

      <main className="max-w-4xl mx-auto px-4 py-24">
        <h1 className="text-4xl font-bold text-wine-dark mb-2">Member Dashboard</h1>
        <p className="text-gray-600 mb-8">Welcome back, {user?.full_name}!</p>

        {/* User Info Card */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold text-gray-900">Your Profile</h2>
            <span className="px-3 py-1 bg-wine-dark text-white rounded-full text-sm font-medium">
              Member
            </span>
          </div>

          <div className="space-y-3">
            <div>
              <span className="text-sm text-gray-500">Name</span>
              <p className="text-gray-900 font-medium">{user?.full_name}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Email</span>
              <p className="text-gray-900 font-medium">{user?.email}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Member Since</span>
              <p className="text-gray-900 font-medium">
                {new Date(user?.created_at || '').toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* Placeholder Content */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Coming Soon</h2>
          <p className="text-gray-600">
            Your member dashboard with club connections, event RSVPs, and wine preferences will be available here soon.
          </p>
        </div>
      </main>
    </div>
  );
}
