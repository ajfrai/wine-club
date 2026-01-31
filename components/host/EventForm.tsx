'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { eventFormSchema, type EventFormData } from '@/lib/validations/event-form.schema';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import type { ClubType } from '@/types/auth.types';

interface ClubMember {
  user_id: string;
  full_name: string;
}

interface EventFormProps {
  onSubmit: (data: EventFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  defaultValues?: Partial<EventFormData>;
  defaultLocation?: string;
  clubType?: ClubType;
  clubMembers?: ClubMember[];
}

export const EventForm: React.FC<EventFormProps> = ({
  onSubmit,
  onCancel,
  isLoading = false,
  defaultValues,
  defaultLocation,
  clubType = 'fixed',
  clubMembers = [],
}) => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<EventFormData>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      title: defaultValues?.title || '',
      description: defaultValues?.description || '',
      event_date: defaultValues?.event_date || '',
      end_date: defaultValues?.end_date || '',
      location: defaultValues?.location || defaultLocation || '',
      wines_theme: defaultValues?.wines_theme || '',
      price: defaultValues?.price ?? null,
      max_attendees: defaultValues?.max_attendees ?? null,
      is_recurring: defaultValues?.is_recurring ?? false,
      recurrence_count: defaultValues?.recurrence_count ?? 12,
      event_host_id: defaultValues?.event_host_id || '',
      event_location: defaultValues?.event_location || '',
    },
  });

  // Format datetime-local value for input
  const formatDateTimeLocal = (dateString: string | undefined): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Event Title */}
      <Input
        label="Event Title"
        type="text"
        placeholder="Summer Wine Tasting"
        error={errors.title?.message}
        required
        {...register('title')}
      />

      {/* Date and Time */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Start Date & Time"
          type="datetime-local"
          error={errors.event_date?.message}
          required
          {...register('event_date')}
        />

        <Input
          label="End Date & Time (Optional)"
          type="datetime-local"
          error={errors.end_date?.message}
          helperText="Leave empty for single-day event"
          {...register('end_date')}
        />
      </div>

      {/* Description */}
      <Textarea
        label="Description"
        placeholder="Join us for an unforgettable evening of wine tasting..."
        rows={4}
        maxLength={2000}
        showCharCount
        error={errors.description?.message}
        {...register('description')}
      />

      {/* Wines/Theme/Surprise */}
      <Textarea
        label="Wines, Theme, or Surprise"
        placeholder="Featuring: Bordeaux reds, Chardonnays from Sonoma, or 'It's a surprise!'"
        rows={3}
        maxLength={500}
        showCharCount
        error={errors.wines_theme?.message}
        helperText="What wines will be featured, or describe the theme"
        {...register('wines_theme')}
      />

      {/* Multi-Host Club: Host Selection */}
      {clubType === 'multi_host' && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Event Host <span className="text-red-500">*</span>
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-wine focus:border-wine"
              {...register('event_host_id')}
            >
              <option value="">Select a host...</option>
              {clubMembers.map((member) => (
                <option key={member.user_id} value={member.user_id}>
                  {member.full_name}
                </option>
              ))}
            </select>
            {errors.event_host_id && (
              <p className="text-xs text-red-500 mt-1">{errors.event_host_id.message}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">Who will host this event?</p>
          </div>

          <Input
            label="Event Location"
            type="text"
            placeholder="Enter the address for this event"
            error={errors.event_location?.message}
            required
            helperText="Where will this event take place?"
            {...register('event_location')}
          />
        </>
      )}

      {/* Fixed Club: Location (optional, defaults to club address) */}
      {clubType === 'fixed' && (
        <Input
          label="Location"
          type="text"
          placeholder="Club address"
          error={errors.location?.message}
          helperText="Defaults to your club address"
          {...register('location')}
        />
      )}

      {/* Price and Max Attendees */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Input
            label="Price"
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            error={errors.price?.message}
            helperText="Leave empty or 0 for free event"
            {...register('price', {
              setValueAs: (v) => {
                if (v === '' || v === null || v === undefined) return null;
                const num = parseFloat(v);
                return isNaN(num) || num === 0 ? null : num;
              },
            })}
          />
        </div>

        <div>
          <Input
            label="Max Attendees"
            type="number"
            min="1"
            placeholder="Unlimited"
            error={errors.max_attendees?.message}
            helperText="Leave empty for unlimited"
            {...register('max_attendees', {
              setValueAs: (v) => {
                if (v === '' || v === null || v === undefined) return null;
                const num = parseInt(v);
                return isNaN(num) ? null : num;
              },
            })}
          />
        </div>
      </div>

      {/* Recurring Event */}
      <div className="bg-wine-light/30 border border-wine-light rounded-lg p-4">
        <label className="flex items-start gap-3 cursor-pointer mb-3">
          <input
            type="checkbox"
            className="mt-1 h-4 w-4 rounded border-gray-300 text-wine focus:ring-wine"
            {...register('is_recurring')}
          />
          <div className="flex-1">
            <span className="font-medium text-gray-900">Repeat weekly</span>
            <p className="text-sm text-gray-600 mt-1">
              Create multiple events repeating every week
            </p>
          </div>
        </label>

        {watch('is_recurring') && (
          <div className="ml-7">
            <Input
              label="Number of occurrences"
              type="number"
              min="2"
              max="104"
              placeholder="12"
              error={errors.recurrence_count?.message}
              helperText="How many weekly events to create (2-104)"
              {...register('recurrence_count', {
                setValueAs: (v) => {
                  if (v === '' || v === null || v === undefined) return 12;
                  const num = parseInt(v);
                  return isNaN(num) ? 12 : num;
                },
              })}
            />
          </div>
        )}
      </div>

      {/* Form Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          isLoading={isLoading}
        >
          {defaultValues ? 'Update Event' : 'Create Event'}
        </Button>
      </div>
    </form>
  );
};
