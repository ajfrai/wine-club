'use client';

import { useState } from 'react';
import { CreditCard, Copy, Check, Banknote, ExternalLink } from 'lucide-react';

interface PaymentOptionsProps {
  venmoUsername: string | null;
  paypalUsername: string | null;
  zelleHandle: string | null;
  acceptsCash: boolean;
}

export function PaymentOptions({
  venmoUsername,
  paypalUsername,
  zelleHandle,
  acceptsCash,
}: PaymentOptionsProps) {
  const [copiedZelle, setCopiedZelle] = useState(false);

  const hasPaymentMethods = venmoUsername || paypalUsername || zelleHandle || acceptsCash;

  const handleCopyZelle = async () => {
    if (zelleHandle) {
      await navigator.clipboard.writeText(zelleHandle);
      setCopiedZelle(true);
      setTimeout(() => setCopiedZelle(false), 2000);
    }
  };

  const handleVenmoClick = () => {
    if (venmoUsername) {
      // Try deep link first, fallback to web
      const deepLink = `venmo://paycharge?txn=pay&recipients=${venmoUsername}`;
      const webFallback = `https://venmo.com/${venmoUsername}`;

      // Try to open the app, fallback to web after a short delay
      window.location.href = deepLink;
      setTimeout(() => {
        window.open(webFallback, '_blank');
      }, 500);
    }
  };

  const handlePaypalClick = () => {
    if (paypalUsername) {
      window.open(`https://paypal.me/${paypalUsername}`, '_blank');
    }
  };

  if (!hasPaymentMethods) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <CreditCard className="w-5 h-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">Payment Options</h2>
        </div>
        <p className="text-gray-500 text-sm">
          Contact your host for payment details.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-4">
        <CreditCard className="w-5 h-5 text-gray-600" />
        <h2 className="text-lg font-semibold text-gray-900">Payment Options</h2>
      </div>

      <div className="space-y-3">
        {venmoUsername && (
          <button
            onClick={handleVenmoClick}
            className="w-full flex items-center justify-between px-4 py-3 bg-[#008CFF] text-white rounded-lg hover:bg-[#0074D9] transition-colors"
          >
            <span className="font-medium">Pay with Venmo</span>
            <ExternalLink className="w-4 h-4" />
          </button>
        )}

        {paypalUsername && (
          <button
            onClick={handlePaypalClick}
            className="w-full flex items-center justify-between px-4 py-3 bg-[#003087] text-white rounded-lg hover:bg-[#002670] transition-colors"
          >
            <span className="font-medium">Pay with PayPal</span>
            <ExternalLink className="w-4 h-4" />
          </button>
        )}

        {zelleHandle && (
          <div className="flex items-center justify-between px-4 py-3 bg-gray-100 rounded-lg">
            <div>
              <p className="text-sm text-gray-600">Zelle</p>
              <p className="font-medium text-gray-900">{zelleHandle}</p>
            </div>
            <button
              onClick={handleCopyZelle}
              className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              aria-label="Copy Zelle handle"
            >
              {copiedZelle ? (
                <>
                  <Check className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-green-600">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-gray-600" />
                  <span className="text-sm text-gray-600">Copy</span>
                </>
              )}
            </button>
          </div>
        )}

        {acceptsCash && (
          <div className="flex items-center gap-3 px-4 py-3 bg-green-50 rounded-lg">
            <Banknote className="w-5 h-5 text-green-600" />
            <span className="text-green-800 font-medium">Cash accepted at meetings</span>
          </div>
        )}
      </div>
    </div>
  );
}
