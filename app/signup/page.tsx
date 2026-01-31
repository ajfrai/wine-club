'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SignupContainer } from '@/components/signup/SignupContainer';
import { GoogleMapsProvider } from '@/components/providers/GoogleMapsProvider';
import { signupHost, signupMember } from '@/lib/auth';
import { createClient } from '@/lib/supabase/client';
import type { HostSignupData, MemberSignupData } from '@/types/auth.types';

export default function SignupPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleHostSignup = async (data: HostSignupData) => {
    console.log('[SignupPage] handleHostSignup called');
    console.log('[SignupPage] Form data:', {
      email: data.email,
      fullName: data.fullName,
      clubAddress: data.clubAddress,
      hasAboutClub: !!data.aboutClub,
      hasWinePreferences: !!data.winePreferences,
    });

    setIsLoading(true);
    setError(null);

    try {
      console.log('[SignupPage] Calling signupHost function');
      const supabase = createClient();
      const response = await signupHost(data, supabase);

      console.log('[SignupPage] signupHost response:', {
        success: response.success,
        hasUser: !!response.user,
        hasHost: !!response.host,
        error: response.error,
      });

      if (!response.success) {
        console.error('[SignupPage] Signup failed:', response.error);
        setError(response.error || 'Failed to create host account');
        return;
      }

      if (response.user) {
        console.log('[SignupPage] Signup successful, redirecting to dashboard');
        // Redirect directly to dashboard based on role
        router.push(`/dashboard/${response.user.role}`);
      }
    } catch (err) {
      console.error('[SignupPage] Exception during signup:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
      console.log('[SignupPage] handleHostSignup complete');
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
        console.log('[SignupPage] Signup successful, redirecting to dashboard');
        // Redirect directly to dashboard based on role
        router.push(`/dashboard/${response.user.role}`);
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
          onHostSignup={handleHostSignup}
          onMemberSignup={handleMemberSignup}
          isLoading={isLoading}
        />
      </GoogleMapsProvider>
    </div>
  );
}
