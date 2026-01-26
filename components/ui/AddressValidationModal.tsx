'use client';

import React from 'react';
import { Button } from './Button';
import type { ValidatedAddress } from '@/lib/usps-address-validation';

interface AddressValidationModalProps {
  isOpen: boolean;
  onClose: () => void;
  originalAddress: string;
  validatedAddress: ValidatedAddress;
  onAccept: (formattedAddress: string) => void;
  onReject: () => void;
}

export const AddressValidationModal: React.FC<AddressValidationModalProps> = ({
  isOpen,
  onClose,
  originalAddress,
  validatedAddress,
  onAccept,
  onReject,
}) => {
  if (!isOpen) return null;

  const formattedValidated = [
    validatedAddress.secondaryAddress,
    validatedAddress.streetAddress,
    `${validatedAddress.city}, ${validatedAddress.state} ${validatedAddress.ZIPCode}${validatedAddress.ZIPPlus4 ? `-${validatedAddress.ZIPPlus4}` : ''}`,
  ]
    .filter(Boolean)
    .join('\n');

  const handleAccept = () => {
    onAccept(formattedValidated);
    onClose();
  };

  const handleReject = () => {
    onReject();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Verify Your Address</h2>

        <p className="text-sm text-gray-600 mb-6">
          We found a standardized version of your address. Please confirm which version you'd like to use.
        </p>

        <div className="space-y-4 mb-6">
          {/* Original Address */}
          <div className="border border-gray-300 rounded-lg p-4">
            <div className="flex items-start justify-between mb-2">
              <span className="text-sm font-semibold text-gray-700">Your Entry</span>
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">Original</span>
            </div>
            <p className="text-sm text-gray-900 whitespace-pre-line">{originalAddress}</p>
          </div>

          {/* Validated Address */}
          <div className="border-2 border-green-500 rounded-lg p-4 bg-green-50">
            <div className="flex items-start justify-between mb-2">
              <span className="text-sm font-semibold text-green-800">USPS Verified</span>
              <span className="text-xs bg-green-600 text-white px-2 py-1 rounded">Recommended</span>
            </div>
            <p className="text-sm text-gray-900 whitespace-pre-line font-medium">{formattedValidated}</p>
            {validatedAddress.ZIPPlus4 && (
              <p className="text-xs text-green-700 mt-2">✓ Includes ZIP+4 for faster delivery</p>
            )}
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            type="button"
            onClick={handleAccept}
            className="flex-1 bg-green-600 hover:bg-green-700"
          >
            Use USPS Address
          </Button>
          <Button
            type="button"
            onClick={handleReject}
            variant="outline"
            className="flex-1"
          >
            Keep Original
          </Button>
        </div>

        <p className="text-xs text-gray-500 mt-4 text-center">
          Using the USPS verified address helps ensure accurate wine deliveries
        </p>
      </div>
    </div>
  );
};
