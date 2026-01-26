'use client';

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { hostSignupSchema, type HostSignupFormData } from '@/lib/validations/host-signup.schema';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import { Textarea } from '@/components/ui/Textarea';
import { HostOnboarding } from './HostOnboarding';

interface HostFormProps {
  onSubmit: (data: HostSignupFormData) => Promise<void>;
  isLoading?: boolean;
}

type HostFormInputs = HostSignupFormData;

export const HostForm: React.FC<HostFormProps> = ({ onSubmit, isLoading = false }) => {
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
      sameAsClubAddress: false,
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
      clubAddress: '',
      deliveryAddress: '',
    },
  });

  const sameAsClubAddress = watch('sameAsClubAddress');
  const clubAddress = watch('clubAddress');

  useEffect(() => {
    if (sameAsClubAddress && clubAddress) {
      setValue('deliveryAddress', clubAddress);
    }
  }, [sameAsClubAddress, clubAddress, setValue]);

  const handleOnboardingComplete = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setShowOnboarding(false);
      setIsTransitioning(false);
    }, 200);
  };

  if (showOnboarding) {
    return (
      <div className={`transition-opacity duration-200 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
        <HostOnboarding onComplete={handleOnboardingComplete} />
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
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

        <Textarea
          label="Club Address"
          placeholder="Enter the address where wine tastings will be held"
          rows={3}
          error={errors.clubAddress?.message}
          required
          {...register('clubAddress')}
        />

        <Checkbox
          label="Delivery address is the same as club address"
          {...register('sameAsClubAddress')}
        />

        {!sameAsClubAddress && (
          <Textarea
            label="Delivery Address"
            placeholder="Enter the address where wine deliveries should be sent"
            rows={3}
            error={errors.deliveryAddress?.message}
            required
            {...register('deliveryAddress')}
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

      <Button type="submit" isLoading={isLoading} className="w-full">
        Create Host Account
      </Button>
    </form>
  );
};
