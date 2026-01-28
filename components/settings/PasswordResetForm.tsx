'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Shield } from 'lucide-react';

const passwordResetSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type PasswordResetFormData = z.infer<typeof passwordResetSchema>;

export const PasswordResetForm: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<PasswordResetFormData>({
    resolver: zodResolver(passwordResetSchema),
  });

  const onSubmit = async (data: PasswordResetFormData) => {
    setIsLoading(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update password');
      }

      setSuccessMessage('Password updated successfully!');
      reset();
    } catch (error) {
      console.error('Error updating password:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to update password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Shield className="w-5 h-5 text-wine-600" />
        <h3 className="text-lg font-semibold text-gray-900">Change Password</h3>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
          {successMessage}
        </div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
          {errorMessage}
        </div>
      )}

      <div className="space-y-4">
        <Input
          label="Current Password"
          type="password"
          placeholder="Enter your current password"
          error={errors.currentPassword?.message}
          required
          {...register('currentPassword')}
        />

        <Input
          label="New Password"
          type="password"
          placeholder="Enter your new password"
          error={errors.newPassword?.message}
          helperText="Must be at least 8 characters with uppercase, lowercase, and number"
          required
          {...register('newPassword')}
        />

        <Input
          label="Confirm New Password"
          type="password"
          placeholder="Confirm your new password"
          error={errors.confirmPassword?.message}
          required
          {...register('confirmPassword')}
        />
      </div>

      <div className="flex justify-end pt-4">
        <Button
          type="submit"
          variant="primary"
          isLoading={isLoading}
          className="min-w-[150px]"
        >
          Update Password
        </Button>
      </div>
    </form>
  );
};
