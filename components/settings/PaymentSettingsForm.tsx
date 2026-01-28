'use client';

import React, { useState, useEffect } from 'react';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { getStripe } from '@/lib/stripe-client';
import { Button } from '@/components/ui/Button';
import { CreditCard, Wallet, Check, AlertCircle } from 'lucide-react';

interface PaymentMethod {
  type: string;
  brand?: string;
  last4?: string;
  expMonth?: number;
  expYear?: number;
  wallet?: string;
  email?: string;
}

interface PaymentSettingsFormProps {
  userId: string;
}

const PaymentMethodDisplay: React.FC<{ paymentMethod: PaymentMethod }> = ({ paymentMethod }) => {
  const getDisplayName = () => {
    if (paymentMethod.wallet) {
      const walletNames: Record<string, string> = {
        apple_pay: 'Apple Pay',
        google_pay: 'Google Pay',
        link: 'Link',
      };
      return walletNames[paymentMethod.wallet] || paymentMethod.wallet;
    }
    if (paymentMethod.type === 'paypal') {
      return 'PayPal';
    }
    if (paymentMethod.type === 'link') {
      return 'Link';
    }
    if (paymentMethod.type === 'card' && paymentMethod.brand) {
      return paymentMethod.brand.charAt(0).toUpperCase() + paymentMethod.brand.slice(1);
    }
    return 'Payment Method';
  };

  const getIcon = () => {
    if (paymentMethod.wallet === 'apple_pay' || paymentMethod.wallet === 'google_pay' ||
        paymentMethod.type === 'paypal' || paymentMethod.type === 'link') {
      return <Wallet className="w-5 h-5 text-wine-600" />;
    }
    return <CreditCard className="w-5 h-5 text-wine-600" />;
  };

  return (
    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
      <div className="p-2 bg-white rounded-lg shadow-sm">
        {getIcon()}
      </div>
      <div className="flex-1">
        <p className="font-medium text-gray-900">{getDisplayName()}</p>
        {paymentMethod.last4 && (
          <p className="text-sm text-gray-600">
            Ending in {paymentMethod.last4}
            {paymentMethod.expMonth && paymentMethod.expYear && (
              <span className="ml-2">
                Expires {paymentMethod.expMonth}/{paymentMethod.expYear}
              </span>
            )}
          </p>
        )}
        {paymentMethod.email && (
          <p className="text-sm text-gray-600">{paymentMethod.email}</p>
        )}
      </div>
      <div className="flex items-center gap-1 text-green-600">
        <Check className="w-4 h-4" />
        <span className="text-sm font-medium">Active</span>
      </div>
    </div>
  );
};

const PaymentForm: React.FC<{
  userId: string;
  onComplete: () => void;
  onCancel: () => void;
}> = ({ userId, onComplete, onCancel }) => {
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
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <p className="text-sm text-gray-600 mb-4">
          Use Apple Pay, Google Pay, or PayPal to add your payment method. Your card will be securely saved for recurring payments.
        </p>
        <PaymentElement />
      </div>

      {error && (
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div className="flex gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          isLoading={isLoading}
          disabled={!stripe || isLoading}
          className="flex-1"
        >
          Save Payment Method
        </Button>
      </div>
    </form>
  );
};

export const PaymentSettingsForm: React.FC<PaymentSettingsFormProps> = ({ userId }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasPaymentMethod, setHasPaymentMethod] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchPaymentMethod = async () => {
    try {
      const response = await fetch('/api/stripe/payment-method');
      if (!response.ok) {
        throw new Error('Failed to fetch payment method');
      }
      const data = await response.json();
      setHasPaymentMethod(data.hasPaymentMethod);
      setPaymentMethod(data.paymentMethod);
    } catch (err) {
      console.error('Error fetching payment method:', err);
      setError('Failed to load payment information');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPaymentMethod();
  }, []);

  const startEditing = async () => {
    setError(null);
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
      setIsEditing(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize payment setup');
    }
  };

  const handleComplete = () => {
    setIsEditing(false);
    setClientSecret(null);
    setIsLoading(true);
    fetchPaymentMethod();
  };

  const handleCancel = () => {
    setIsEditing(false);
    setClientSecret(null);
  };

  const stripePromise = getStripe();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-wine-600"></div>
      </div>
    );
  }

  if (error && !isEditing) {
    return (
      <div className="space-y-4">
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
        <Button onClick={() => { setError(null); setIsLoading(true); fetchPaymentMethod(); }}>
          Try Again
        </Button>
      </div>
    );
  }

  if (isEditing && clientSecret && stripePromise) {
    return (
      <Elements
        stripe={stripePromise}
        options={{
          clientSecret,
          appearance: {
            theme: 'stripe',
            variables: {
              colorPrimary: '#7f1d1d',
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
        <PaymentForm userId={userId} onComplete={handleComplete} onCancel={handleCancel} />
      </Elements>
    );
  }

  return (
    <div className="space-y-6">
      {hasPaymentMethod && paymentMethod ? (
        <>
          <PaymentMethodDisplay paymentMethod={paymentMethod} />
          <Button variant="outline" onClick={startEditing}>
            Update Payment Method
          </Button>
        </>
      ) : (
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-800">No payment method on file</p>
              <p className="text-sm text-amber-700 mt-1">
                Add a payment method to enable automatic billing for your wine club.
              </p>
            </div>
          </div>
          <Button onClick={startEditing}>
            Add Payment Method
          </Button>
        </div>
      )}
    </div>
  );
};
