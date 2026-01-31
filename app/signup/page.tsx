'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SignupContainer } from '@/components/signup/SignupContainer';
import { GoogleMapsProvider } from '@/components/providers/GoogleMapsProvider';
import { signupMember, login } from '@/lib/auth';
import { createClub } from '@/lib/clubs';
import { createClient } from '@/lib/supabase/client';
import type { MemberSignupData } from '@/types/auth.types';
import type { ClubCreationFormData } from '@/lib/validations/club-creation.schema';

export default function SignupPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  // Check if user is already authenticated
  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        setIsAuthenticated(true);
        setUserId(user.id);
      }
    };

    checkAuth();
  }, []);

  const handleAuth = async (data: { fullName: string; email: string; password: string }) => {
    console.log('[SignupPage] handleAuth called');
    console.log('[SignupPage] Email:', data.email);

    setIsLoading(true);
    setError(null);

    try {
      const supabase = createClient();

      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            role: 'member',
            full_name: data.fullName,
          },
        },
      });

      if (authError) {
        setError(authError.message);
        setIsLoading(false);
        return;
      }

      if (!authData.user) {
        setError('Failed to create user account');
        setIsLoading(false);
        return;
      }

      // Create user profile
      const { error: profileError } = await supabase
        .rpc('create_user_profile', {
          user_id: authData.user.id,
          user_email: data.email,
          user_role: 'member',
          user_full_name: data.fullName,
        });

      if (profileError) {
        setError('Failed to create user profile');
        setIsLoading(false);
        return;
      }

      setIsAuthenticated(true);
      setUserId(authData.user.id);
      setIsLoading(false);
    } catch (err) {
      console.error('[SignupPage] Exception during auth:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      setIsLoading(false);
    }
  };

  const handleLogin = async (data: { email: string; password: string }) => {
    console.log('[SignupPage] handleLogin called');

    setIsLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const response = await login(data, supabase);

      if (!response.success) {
        setError(response.error || 'Login failed');
        setIsLoading(false);
        return;
      }

      if (response.user) {
        setIsAuthenticated(true);
        setUserId(response.user.id);
      }

      setIsLoading(false);
    } catch (err) {
      console.error('[SignupPage] Exception during login:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      setIsLoading(false);
    }
  };

  const handleClubCreation = async (data: ClubCreationFormData) => {
    console.log('[SignupPage] handleClubCreation called');

    if (!userId) {
      setError('You must be logged in to create a club');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const response = await createClub(userId, data, supabase);

      if (!response.success) {
        setError(response.error || 'Failed to create club');
        setIsLoading(false);
        return;
      }

      console.log('[SignupPage] Club creation successful, redirecting to dashboard');
      router.push('/dashboard/host');
    } catch (err) {
      console.error('[SignupPage] Exception during club creation:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      setIsLoading(false);
    }
  };

  const handleMemberSignup = async (data: MemberSignupData) => {
    console.log('[SignupPage] handleMemberSignup called');
    console.log('[SignupPage] Form data:', {
      email: data.email,
      fullName: data.fullName,
      hostCode: data.hostCode || 'None',
      findNearbyHosts: data.findNearbyHosts,
    });

    setIsLoading(true);
    setError(null);

    try {
      console.log('[SignupPage] Calling signupMember function');
      const supabase = createClient();
      const response = await signupMember(data, supabase);

      console.log('[SignupPage] signupMember response:', {
        success: response.success,
        hasUser: !!response.user,
        error: response.error,
      });

      if (!response.success) {
        console.error('[SignupPage] Signup failed:', response.error);
        setError(response.error || 'Failed to create member account');
        return;
      }

      if (response.user) {
        console.log('[SignupPage] Signup successful, redirecting to member dashboard');
        // Member signup creates member profile, so route to member dashboard
        router.push('/dashboard/member');
      }
    } catch (err) {
      console.error('[SignupPage] Exception during signup:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
      console.log('[SignupPage] handleMemberSignup complete');
    }
  };

  return (
    <div className="min-h-screen">
      {/* Error Toast */}
      {error && (
        <div className="fixed top-4 right-4 z-50 max-w-md bg-sunburst-50 border border-sunburst-500 rounded-lg shadow-lg p-4">
          <div className="flex items-start">
            <div className="flex-1">
              <p className="text-sm font-medium text-sunburst-900">Error</p>
              <p className="text-sm text-sunburst-700 mt-1">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="ml-4 text-sunburst-600 hover:text-sunburst-800"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Account Creation */}
      <GoogleMapsProvider>
        <SignupContainer
          onAuth={handleAuth}
          onLogin={handleLogin}
          onClubCreation={handleClubCreation}
          onMemberSignup={handleMemberSignup}
          isLoading={isLoading}
          isAuthenticated={isAuthenticated}
        />
      </GoogleMapsProvider>
    </div>
  );
}
