'use client';

import { useState } from 'react';
import { CreditCard, Plus } from 'lucide-react';

interface PaymentCardProps {
  hasPaymentMethod: boolean;
}

export default function PaymentCard({ hasPaymentMethod }: PaymentCardProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleAddPayment = async () => {
    setIsLoading(true);
    try {
      // TODO: Integrate with Stripe setup intent
      // This will be wired up in Phase 7
      console.log('Add payment method');
    } catch (error) {
      console.error('Error adding payment method:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-wine-light rounded-lg">
            <CreditCard className="w-6 h-6 text-wine-dark" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Payment Method</h3>
            <p className="text-sm text-gray-600 mt-1">
              {hasPaymentMethod
                ? 'Payment method on file'
                : 'No payment method added'}
            </p>
          </div>
        </div>

        <button
          onClick={handleAddPayment}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 bg-wine text-white rounded-lg hover:bg-wine-dark transition-colors disabled:bg-gray-400"
        >
          <Plus className="w-4 h-4" />
          {hasPaymentMethod ? 'Update' : 'Add Payment'}
        </button>
      </div>

      {!hasPaymentMethod && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            Add a payment method to complete your club memberships and event registrations.
          </p>
        </div>
      )}
    </div>
  );
}
