'use client';

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { hostSignupSchema, type HostSignupFormData } from '@/lib/validations/host-signup.schema';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import { Textarea } from '@/components/ui/Textarea';
import { AddressAutocomplete, type AddressComponents } from '@/components/ui/AddressAutocomplete';
import { HostOnboarding } from './HostOnboarding';

interface HostFormProps {
  onSubmit: (data: HostSignupFormData) => Promise<void>;
  isLoading?: boolean;
}

type HostFormInputs = HostSignupFormData;

export const HostForm: React.FC<HostFormProps> = ({ onSubmit, isLoading = false }) => {
  console.log('[HostForm] Component rendered, isLoading:', isLoading);
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<HostFormInputs>({
    resolver: zodResolver(hostSignupSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
      clubType: 'fixed',
      clubAddress: '',
      aboutClub: '',
      winePreferences: '',
      latitude: null,
      longitude: null,
    },
  });

  const clubAddress = watch('clubAddress');
  const clubType = watch('clubType');

  const handleClubAddressSelect = (addressComponents: AddressComponents) => {
    setValue('clubAddress', addressComponents.formattedAddress, { shouldValidate: true });
    setValue('latitude', addressComponents.lat || null);
    setValue('longitude', addressComponents.lng || null);
  };

  const handleOnboardingComplete = () => {
    console.log('[HostForm] Onboarding completed - transitioning to form');
    setIsTransitioning(true);
    setTimeout(() => {
      setShowOnboarding(false);
      setIsTransitioning(false);
    }, 200);
  };

  if (showOnboarding) {
    console.log('[HostForm] Showing onboarding screen');
    return (
      <div className={`transition-opacity duration-200 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
        <HostOnboarding onComplete={handleOnboardingComplete} />
      </div>
    );
  }

  const handleFormSubmit = async (data: HostFormInputs) => {
    console.log('[HostForm] Form submitted');
    console.log('[HostForm] Form data:', {
      email: data.email,
      fullName: data.fullName,
      clubType: data.clubType,
      clubAddress: data.clubAddress,
      hasCoordinates: !!(data.latitude && data.longitude),
    });
    await onSubmit(data);
  };

  console.log('[HostForm] Rendering main form');
  return (
    <form
      onSubmit={handleSubmit(handleFormSubmit)}
      className={`space-y-6 transition-opacity duration-200 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}
    >
      {/* Personal Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>

        <Input
          label="Full Name"
          type="text"
          placeholder="John Doe"
          error={errors.fullName?.message}
          required
          {...register('fullName')}
        />

        <Input
          label="Email"
          type="email"
          placeholder="john@example.com"
          error={errors.email?.message}
          required
          {...register('email')}
        />

        <Input
          label="Password"
          type="password"
          placeholder="••••••••"
          error={errors.password?.message}
          helperText="At least 8 characters with uppercase, lowercase, and number"
          required
          {...register('password')}
        />

        <Input
          label="Confirm Password"
          type="password"
          placeholder="••••••••"
          error={errors.confirmPassword?.message}
          required
          {...register('confirmPassword')}
        />
      </div>

      {/* Club Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Club Information</h3>

        {/* Club Type Selection */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            Club Type <span className="text-red-500">*</span>
          </label>

          <div className="space-y-2">
            <label className="flex items-start p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
              <input
                type="radio"
                value="fixed"
                {...register('clubType')}
                className="mt-1 h-4 w-4 text-wine-600 focus:ring-wine-500"
              />
              <div className="ml-3 flex-1">
                <div className="text-sm font-medium text-gray-900">Fixed Location & Host</div>
                <div className="text-xs text-gray-500 mt-1">
                  Traditional club - events happen at your location with you as the host
                </div>
              </div>
            </label>

            <label className="flex items-start p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
              <input
                type="radio"
                value="multi_host"
                {...register('clubType')}
                className="mt-1 h-4 w-4 text-wine-600 focus:ring-wine-500"
              />
              <div className="ml-3 flex-1">
                <div className="text-sm font-medium text-gray-900">Multi-Host (Friend Group)</div>
                <div className="text-xs text-gray-500 mt-1">
                  Rotating club - any member can host events at their location
                </div>
              </div>
            </label>
          </div>

          {errors.clubType && (
            <p className="text-xs text-red-500 mt-1">{errors.clubType.message}</p>
          )}
        </div>

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
          />
        )}

        <Textarea
          label="About This Club"
          placeholder="Tell members about your wine club (optional)"
          rows={4}
          maxLength={500}
          showCharCount
          error={errors.aboutClub?.message}
          {...register('aboutClub')}
        />

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
      </div>

      <Button
        type="submit"
        isLoading={isLoading}
        className="w-full"
        onClick={() => console.log('[HostForm] Create Club Account button clicked')}
      >
        Create Club Account
      </Button>
    </form>
  );
};
