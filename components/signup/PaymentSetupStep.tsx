'use client';

import React, { useState, useEffect } from 'react';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { getStripe } from '@/lib/stripe-client';
import { Button } from '@/components/ui/Button';

interface PaymentSetupStepProps {
  userId: string;
  userRole: 'host' | 'member';
  onComplete: () => void;
  onSkip: () => void;
}

const PaymentForm: React.FC<{
  userId: string;
  onComplete: () => void;
  onSkip: () => void;
}> = ({ userId, onComplete, onSkip }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Confirm the setup
      const { error: confirmError, setupIntent } = await stripe.confirmSetup({
        elements,
        redirect: 'if_required',
      });

      if (confirmError) {
        setError(confirmError.message || 'Failed to setup payment method');
        setIsLoading(false);
        return;
      }

      if (setupIntent?.payment_method) {
        // Save payment method to database
        const response = await fetch('/api/stripe/save-payment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId,
            paymentMethodId: setupIntent.payment_method,
          }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to save payment method');
        }

        onComplete();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />

      {error && (
        <div className="p-4 bg-sunburst-50 border border-sunburst-500 rounded-lg">
          <p className="text-sm text-sunburst-700">{error}</p>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4">
        <Button
          type="submit"
          isLoading={isLoading}
          disabled={!stripe || isLoading}
          className="flex-1"
        >
          Save Payment Method
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onSkip}
          disabled={isLoading}
          className="flex-1"
        >
          Skip for Now
        </Button>
      </div>
    </form>
  );
};

export const PaymentSetupStep: React.FC<PaymentSetupStepProps> = ({
  userId,
  userRole,
  onComplete,
  onSkip,
}) => {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isLoadingIntent, setIsLoadingIntent] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const createSetupIntent = async () => {
      try {
        const response = await fetch('/api/stripe/setup-intent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to initialize payment setup');
        }

        const data = await response.json();
        setClientSecret(data.clientSecret);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to initialize payment setup');
      } finally {
        setIsLoadingIntent(false);
      }
    };

    createSetupIntent();
  }, [userId]);

  const stripePromise = getStripe();

  if (isLoadingIntent) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sunburst-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Setting up payment...</p>
        </div>
      </div>
    );
  }

  if (error || !clientSecret || !stripePromise) {
    return (
      <div className="max-w-2xl mx-auto p-8">
        <div className="bg-sunburst-50 border border-sunburst-500 rounded-lg p-6 mb-6">
          <p className="text-sunburst-700">
            {error || 'Failed to initialize payment setup'}
          </p>
        </div>
        <Button onClick={onSkip} className="w-full">
          Continue Without Payment Setup
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Payment Setup
        </h2>
        <p className="text-gray-600 mb-2">
          {userRole === 'host'
            ? 'Add a payment method to receive payments from your members.'
            : 'Add a payment method to pay for your wine club membership.'}
        </p>
        <p className="text-sm text-gray-500">
          You can skip this step and add your payment method later in your account settings.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-gray-200">
        <Elements
          stripe={stripePromise}
          options={{
            clientSecret,
            appearance: {
              theme: 'stripe',
              variables: {
                colorPrimary: '#DC2626',
                colorBackground: '#ffffff',
                colorText: '#1f2937',
                colorDanger: '#DC2626',
                fontFamily: 'system-ui, sans-serif',
                spacingUnit: '4px',
                borderRadius: '8px',
              },
            },
          }}
        >
          <PaymentForm userId={userId} onComplete={onComplete} onSkip={onSkip} />
        </Elements>
      </div>
    </div>
  );
};
