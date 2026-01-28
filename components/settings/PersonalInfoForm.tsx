'use client';

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { personalInfoSchema, type PersonalInfoFormData } from '@/lib/validations/personal-info.schema';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { AddressAutocomplete, type AddressComponents } from '@/components/ui/AddressAutocomplete';
import { User, Phone, MapPin } from 'lucide-react';

interface PersonalInfoFormProps {
  initialData?: Partial<PersonalInfoFormData>;
  onSuccess?: () => void;
}

export const PersonalInfoForm: React.FC<PersonalInfoFormProps> = ({
  initialData,
  onSuccess,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<PersonalInfoFormData>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: {
      full_name: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      zip_code: '',
      latitude: null,
      longitude: null,
    },
  });

  const addressValue = watch('address');

  // Fetch personal info on mount
  useEffect(() => {
    const fetchPersonalInfo = async () => {
      try {
        const response = await fetch('/api/member/personal-info');
        if (!response.ok) {
          throw new Error('Failed to fetch personal information');
        }
        const data = await response.json();
        const info = data.personalInfo;

        if (info) {
          setValue('full_name', info.full_name || '');
          setValue('email', info.email || '');
          setValue('phone', info.phone || '');
          setValue('address', info.address || '');
          setValue('city', info.city || '');
          setValue('state', info.state || '');
          setValue('zip_code', info.zip_code || '');
          setValue('latitude', info.latitude);
          setValue('longitude', info.longitude);
        }
      } catch (error) {
        console.error('Error fetching personal info:', error);
        setErrorMessage('Failed to load personal information');
      } finally {
        setIsFetching(false);
      }
    };

    fetchPersonalInfo();
  }, [setValue]);

  const handleAddressSelect = (addressComponents: AddressComponents) => {
    const fullAddress = `${addressComponents.streetNumber} ${addressComponents.route}`.trim();
    setValue('address', fullAddress || addressComponents.formattedAddress);
    setValue('city', addressComponents.city);
    setValue('state', addressComponents.stateCode);
    setValue('zip_code', addressComponents.postalCode);
    setValue('latitude', addressComponents.lat || null);
    setValue('longitude', addressComponents.lng || null);
  };

  const onSubmit = async (data: PersonalInfoFormData) => {
    setIsLoading(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      const response = await fetch('/api/member/personal-info', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update personal information');
      }

      setSuccessMessage('Personal information updated successfully!');
      onSuccess?.();
    } catch (error) {
      console.error('Error updating personal info:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to update personal information');
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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

      {/* Personal Information Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <User className="w-5 h-5 text-wine-600" />
          <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
        </div>

        <Input
          label="Full Name"
          type="text"
          placeholder="John Doe"
          error={errors.full_name?.message}
          required
          {...register('full_name')}
        />

        <Input
          label="Email"
          type="email"
          placeholder="john@example.com"
          error={errors.email?.message}
          disabled
          helperText="Email cannot be changed"
          {...register('email')}
        />
      </div>

      {/* Contact Information Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Phone className="w-5 h-5 text-wine-600" />
          <h3 className="text-lg font-semibold text-gray-900">Contact Information</h3>
        </div>

        <Input
          label="Phone Number"
          type="tel"
          placeholder="(555) 123-4567"
          error={errors.phone?.message}
          helperText="Format: (555) 123-4567 or 555-123-4567"
          {...register('phone')}
        />
      </div>

      {/* Address Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <MapPin className="w-5 h-5 text-wine-600" />
          <h3 className="text-lg font-semibold text-gray-900">Address</h3>
        </div>

        <AddressAutocomplete
          label="Street Address"
          placeholder="Start typing your address..."
          value={addressValue || ''}
          onChange={(value) => setValue('address', value)}
          onSelect={handleAddressSelect}
          error={errors.address?.message}
          helperText="Select an address from the dropdown to set your location"
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label="City"
            type="text"
            placeholder="San Francisco"
            error={errors.city?.message}
            readOnly
            className="bg-gray-50"
            {...register('city')}
          />

          <Input
            label="State"
            type="text"
            placeholder="CA"
            error={errors.state?.message}
            readOnly
            className="bg-gray-50"
            {...register('state')}
          />

          <Input
            label="Zip Code"
            type="text"
            placeholder="94102"
            error={errors.zip_code?.message}
            readOnly
            className="bg-gray-50"
            {...register('zip_code')}
          />
        </div>
      </div>

      {/* Submit Button */}
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
