'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { clubCreationSchema, type ClubCreationFormData } from '@/lib/validations/club-creation.schema';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { AddressAutocomplete, type AddressComponents } from '@/components/ui/AddressAutocomplete';
import type { ClubType } from '@/types/auth.types';

interface ClubCreationFormProps {
  clubType: ClubType;
  onSubmit: (data: ClubCreationFormData) => Promise<void>;
  isLoading?: boolean;
}

export const ClubCreationForm: React.FC<ClubCreationFormProps> = ({
  clubType,
  onSubmit,
  isLoading = false,
}) => {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ClubCreationFormData>({
    resolver: zodResolver(clubCreationSchema),
    defaultValues: {
      clubName: '',
      clubType: clubType,
      clubAddress: '',
      aboutClub: '',
      winePreferences: '',
      latitude: null,
      longitude: null,
    },
  });

  const clubAddress = watch('clubAddress');

  const handleClubAddressSelect = (addressComponents: AddressComponents) => {
    setValue('clubAddress', addressComponents.formattedAddress, { shouldValidate: true });
    setValue('latitude', addressComponents.lat || null);
    setValue('longitude', addressComponents.lng || null);
  };

  const handleFormSubmit = async (data: ClubCreationFormData) => {
    console.log('[ClubCreationForm] Form submitted');
    console.log('[ClubCreationForm] Club type:', data.clubType);
    console.log('[ClubCreationForm] Club name:', data.clubName);
    console.log('[ClubCreationForm] Has address:', !!data.clubAddress);
    console.log('[ClubCreationForm] Has coordinates:', !!(data.latitude && data.longitude));
    console.log('[ClubCreationForm] Calling onSubmit callback');

    try {
      await onSubmit(data);
      console.log('[ClubCreationForm] onSubmit callback completed successfully');
    } catch (error) {
      console.error('[ClubCreationForm] Error in onSubmit callback:', error);
      throw error;
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-4 sm:px-8 w-full">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-light text-gray-900 mb-3">
            {clubType === 'multi_host' ? 'Create Your Friend-Group Club' : 'Create Your Wine Club'}
          </h2>
          <p className="text-gray-600">
            {clubType === 'multi_host'
              ? 'Set up your club details. Any member can host events at their location.'
              : 'Set up your club details and hosting location.'}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
            {/* Club Name */}
            <Input
              label="Club Name"
              type="text"
              placeholder="e.g., Downtown Wine Enthusiasts"
              error={errors.clubName?.message}
              required
              {...register('clubName')}
            />

            {/* Conditional Address Field - only for fixed clubs */}
            {clubType === 'fixed' && (
              <AddressAutocomplete
                label="Club Address"
                placeholder="Start typing your club address..."
                error={errors.clubAddress?.message}
                required
                value={clubAddress || ''}
                onChange={(value) => setValue('clubAddress', value, { shouldValidate: true })}
                onSelect={handleClubAddressSelect}
                helperText="Members will come to this location for tastings"
              />
            )}

            {/* About Club */}
            <Textarea
              label="About This Club"
              placeholder="Tell members about your wine club (optional)"
              rows={4}
              maxLength={500}
              showCharCount
              error={errors.aboutClub?.message}
              {...register('aboutClub')}
            />

            {/* Wine Preferences */}
            <Textarea
              label="Wine Preferences"
              placeholder="e.g., Regions: Burgundy, Tuscany; Bottles: Châteauneuf-du-Pape 2019; Grapes: Pinot Noir, Nebbiolo"
              rows={4}
              maxLength={500}
              showCharCount
              error={errors.winePreferences?.message}
              helperText="Share your wine preferences to help members understand your selection style"
              {...register('winePreferences')}
            />

            <Button
              type="submit"
              isLoading={isLoading}
              className="w-full"
              onClick={() => {
                console.log('[ClubCreationForm] Create Club button clicked');
                console.log('[ClubCreationForm] isLoading:', isLoading);
                console.log('[ClubCreationForm] Form errors:', errors);
              }}
            >
              Create Club
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};
