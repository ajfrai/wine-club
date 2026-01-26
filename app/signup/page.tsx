'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SignupContainer } from '@/components/signup/SignupContainer';
import { PaymentSetupStep } from '@/components/signup/PaymentSetupStep';
import { DebugPanel } from '@/components/signup/DebugPanel';
import { signupHost, signupMember } from '@/lib/auth';
import type { HostSignupData, MemberSignupData, User } from '@/types/auth.types';

type SignupStep = 'account' | 'payment';

export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState<SignupStep>('account');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const handleHostSignup = async (data: HostSignupData) => {
    console.log('[SignupPage] handleHostSignup called');
    console.log('[SignupPage] Form data:', {
      email: data.email,
      fullName: data.fullName,
      clubAddress: data.clubAddress,
      sameAsClubAddress: data.sameAsClubAddress,
      hasDeliveryAddress: !!data.deliveryAddress,
      hasAboutClub: !!data.aboutClub,
      hasWinePreferences: !!data.winePreferences,
    });

    setIsLoading(true);
    setError(null);

    try {
      console.log('[SignupPage] Calling signupHost function');
      const response = await signupHost(data);

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
        console.log('[SignupPage] Signup successful, moving to payment step');
        setCurrentUser(response.user);
        setStep('payment');
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
      const response = await signupMember(data);

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
        console.log('[SignupPage] Signup successful, moving to payment step');
        setCurrentUser(response.user);
        setStep('payment');
      }
    } catch (err) {
      console.error('[SignupPage] Exception during signup:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
      console.log('[SignupPage] handleMemberSignup complete');
    }
  };

  const handlePaymentComplete = () => {
    // Redirect to appropriate dashboard based on role
    if (currentUser?.role === 'host') {
      router.push('/dashboard/host');
    } else {
      router.push('/dashboard/member');
    }
  };

  const handleSkipPayment = () => {
    // Redirect to appropriate dashboard based on role
    if (currentUser?.role === 'host') {
      router.push('/dashboard/host');
    } else {
      router.push('/dashboard/member');
    }
  };

  const isTestMode = process.env.NEXT_PUBLIC_TEST_MODE === 'true';

  return (
    <div className="min-h-screen">
      {/* Test Mode Banner */}
      {isTestMode && (
        <div className="fixed top-0 left-0 right-0 bg-yellow-500 text-black text-center py-2 px-4 z-50 font-semibold">
          🧪 TEST MODE - Forms are pre-filled for testing
        </div>
      )}

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

      {/* Step 1: Account Creation */}
      {step === 'account' && (
        <SignupContainer
          onHostSignup={handleHostSignup}
          onMemberSignup={handleMemberSignup}
          isLoading={isLoading}
        />
      )}

      {/* Step 2: Payment Setup */}
      {step === 'payment' && currentUser && (
        <div className="min-h-screen bg-gradient-to-br from-sunburst-50 to-wine-light py-12">
          <PaymentSetupStep
            userId={currentUser.id}
            userRole={currentUser.role}
            onComplete={handlePaymentComplete}
            onSkip={handleSkipPayment}
          />
        </div>
      )}
    </div>
  );
}
