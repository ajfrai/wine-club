'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { memberSignupSchema, type MemberSignupFormData } from '@/lib/validations/member-signup.schema';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import { MemberOnboarding } from './MemberOnboarding';

interface MemberFormProps {
  onSubmit: (data: MemberSignupFormData) => Promise<void>;
  isLoading?: boolean;
}

type MemberFormInputs = MemberSignupFormData;

export const MemberForm: React.FC<MemberFormProps> = ({ onSubmit, isLoading = false }) => {
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [useFindNearby, setUseFindNearby] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    clearErrors,
  } = useForm<MemberFormInputs>({
    resolver: zodResolver(memberSignupSchema),
    defaultValues: {
      findNearbyHosts: false,
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
      hostCode: '',
    },
  });

  const handleFindNearbyChange = (checked: boolean) => {
    setUseFindNearby(checked);
    clearErrors('hostCode');
  };

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
        <MemberOnboarding onComplete={handleOnboardingComplete} />
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
          placeholder="Jane Smith"
          error={errors.fullName?.message}
          required
          {...register('fullName')}
        />

        <Input
          label="Email"
          type="email"
          placeholder="jane@example.com"
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

      {/* Host Connection */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Find Your Wine Club</h3>

        <div className="bg-wine-light bg-opacity-30 border border-wine p-4 rounded-lg">
          <p className="text-sm text-gray-700 mb-3">
            To join a wine club, you can either enter a host code or search for nearby hosts.
          </p>

          {!useFindNearby ? (
            <Input
              label="Host Code"
              type="text"
              placeholder="ABC12345"
              maxLength={8}
              error={errors.hostCode?.message}
              helperText="Enter the 8-character code provided by your host"
              {...register('hostCode', {
                onChange: (e) => {
                  e.target.value = e.target.value.toUpperCase();
                },
              })}
            />
          ) : (
            <div className="text-sm text-gray-600 bg-white p-3 rounded border border-gray-200">
              We'll show you nearby wine clubs after you create your account.
            </div>
          )}

          <div className="mt-4 pt-4 border-t border-wine border-opacity-30">
            <Checkbox
              label="I don't have a host code - find nearby hosts for me"
              checked={useFindNearby}
              {...register('findNearbyHosts', {
                onChange: (e) => handleFindNearbyChange(e.target.checked),
              })}
            />
          </div>
        </div>
      </div>

      <Button type="submit" isLoading={isLoading} className="w-full">
        Create Member Account
      </Button>
    </form>
  );
};
