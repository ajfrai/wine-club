'use client';

import React, { useEffect, useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { CreditCard, Check } from 'lucide-react';

interface PaymentHandles {
  venmo_username: string | null;
  paypal_username: string | null;
  zelle_handle: string | null;
  accepts_cash: boolean;
}

export const PaymentHandlesForm: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const [venmoUsername, setVenmoUsername] = useState('');
  const [paypalUsername, setPaypalUsername] = useState('');
  const [zelleHandle, setZelleHandle] = useState('');
  const [acceptsCash, setAcceptsCash] = useState(false);

  useEffect(() => {
    const fetchPaymentHandles = async () => {
      try {
        const response = await fetch('/api/host/settings');
        if (!response.ok) {
          if (response.status === 404) {
            // No host profile yet, that's okay
            setIsFetching(false);
            return;
          }
          throw new Error('Failed to fetch payment settings');
        }
        const data = await response.json();
        const host = data.host;

        if (host) {
          setVenmoUsername(host.venmo_username || '');
          setPaypalUsername(host.paypal_username || '');
          setZelleHandle(host.zelle_handle || '');
          setAcceptsCash(host.accepts_cash || false);
        }
      } catch (error) {
        console.error('Error fetching payment handles:', error);
        setErrorMessage('Failed to load payment settings');
      } finally {
        setIsFetching(false);
      }
    };

    fetchPaymentHandles();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      const response = await fetch('/api/host/settings', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          venmo_username: venmoUsername || null,
          paypal_username: paypalUsername || null,
          zelle_handle: zelleHandle || null,
          accepts_cash: acceptsCash,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update payment settings');
      }

      setSuccessMessage('Payment settings updated successfully!');
    } catch (error) {
      console.error('Error updating payment handles:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to update payment settings');
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-wine-600"></div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
          {successMessage}
        </div>
      )}

      {errorMessage && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
          {errorMessage}
        </div>
      )}

      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <CreditCard className="w-5 h-5 text-wine-600" />
          <h3 className="text-lg font-semibold text-gray-900">Payment Methods</h3>
        </div>
        <p className="text-sm text-gray-600 mb-6">
          Members will see these options when viewing your club. Payment tracking happens outside the app.
        </p>

        <Input
          label="Venmo Username"
          type="text"
          placeholder="johnsmith"
          value={venmoUsername}
          onChange={(e) => setVenmoUsername(e.target.value)}
          helperText="Without the @ symbol"
        />

        <Input
          label="PayPal.me Username"
          type="text"
          placeholder="johnsmith"
          value={paypalUsername}
          onChange={(e) => setPaypalUsername(e.target.value)}
          helperText="From paypal.me/johnsmith"
        />

        <Input
          label="Zelle"
          type="text"
          placeholder="john@email.com or 5551234567"
          value={zelleHandle}
          onChange={(e) => setZelleHandle(e.target.value)}
          helperText="Email or phone number"
        />

        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => setAcceptsCash(!acceptsCash)}
            className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
              acceptsCash
                ? 'bg-wine border-wine text-white'
                : 'border-gray-300 bg-white'
            }`}
          >
            {acceptsCash && <Check className="w-4 h-4" />}
          </button>
          <label
            className="text-sm font-medium text-gray-700 cursor-pointer"
            onClick={() => setAcceptsCash(!acceptsCash)}
          >
            Accept cash at meetings
          </label>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <Button
          type="submit"
          variant="primary"
          isLoading={isLoading}
          className="min-w-[150px]"
        >
          Save Changes
        </Button>
      </div>
    </form>
  );
};
