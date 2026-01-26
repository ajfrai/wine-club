'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SignupContainer } from '@/components/signup/SignupContainer';
import { PaymentSetupStep } from '@/components/signup/PaymentSetupStep';
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
    setIsLoading(true);
    setError(null);

    try {
      const response = await signupHost(data);

      if (!response.success) {
        setError(response.error || 'Failed to create host account');
        return;
      }

      if (response.user) {
        setCurrentUser(response.user);
        setStep('payment');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMemberSignup = async (data: MemberSignupData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await signupMember(data);

      if (!response.success) {
        setError(response.error || 'Failed to create member account');
        return;
      }

      if (response.user) {
        setCurrentUser(response.user);
        setStep('payment');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
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
