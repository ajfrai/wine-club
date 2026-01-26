'use client';

import React, { useRef, useEffect, useState } from 'react';
import { useLoadScript } from '@react-google-maps/api';
import { Textarea } from './Textarea';

const libraries: ("places")[] = ['places'];

interface AddressAutocompleteProps {
  label: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: string;
  helperText?: string;
  required?: boolean;
  rows?: number;
  disabled?: boolean;
}

export const AddressAutocomplete: React.FC<AddressAutocompleteProps> = ({
  label,
  placeholder,
  value,
  onChange,
  onBlur,
  error,
  helperText,
  required,
  rows = 3,
  disabled,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const [manualEdit, setManualEdit] = useState(false);

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries,
  });

  useEffect(() => {
    if (!isLoaded || !textareaRef.current || disabled) return;

    // Initialize Google Places Autocomplete
    try {
      autocompleteRef.current = new google.maps.places.Autocomplete(
        textareaRef.current as any,
        {
          types: ['address'],
          componentRestrictions: { country: 'us' }, // Restrict to US for MVP
        }
      );

      // Listen for place selection
      autocompleteRef.current.addListener('place_changed', () => {
        const place = autocompleteRef.current?.getPlace();

        if (!place || !place.address_components) {
          return;
        }

        // Format the address
        const addressComponents = place.address_components;
        const streetNumber = addressComponents.find(c => c.types.includes('street_number'))?.long_name || '';
        const route = addressComponents.find(c => c.types.includes('route'))?.long_name || '';
        const city = addressComponents.find(c => c.types.includes('locality'))?.long_name || '';
        const state = addressComponents.find(c => c.types.includes('administrative_area_level_1'))?.short_name || '';
        const zipCode = addressComponents.find(c => c.types.includes('postal_code'))?.long_name || '';

        const formattedAddress = [
          `${streetNumber} ${route}`.trim(),
          `${city}, ${state} ${zipCode}`,
        ].join('\n');

        onChange(formattedAddress);
        setManualEdit(false);
      });
    } catch (error) {
      console.error('Error initializing Google Places:', error);
    }

    return () => {
      if (autocompleteRef.current) {
        google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, [isLoaded, onChange, disabled]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setManualEdit(true);
    onChange(e.target.value);
  };

  if (loadError) {
    console.error('Google Maps loading error:', loadError);
    // Fallback to regular textarea if Google Maps fails to load
    return (
      <Textarea
        label={label}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        error={error}
        helperText={helperText}
        required={required}
        rows={rows}
        disabled={disabled}
      />
    );
  }

  if (!isLoaded) {
    return (
      <Textarea
        label={label}
        placeholder="Loading address lookup..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={true}
        rows={rows}
      />
    );
  }

  return (
    <div>
      <Textarea
        ref={textareaRef}
        label={label}
        placeholder={placeholder || "Start typing your address..."}
        value={value}
        onChange={handleChange}
        onBlur={onBlur}
        error={error}
        helperText={helperText || "Start typing and select from suggestions"}
        required={required}
        rows={rows}
        disabled={disabled}
      />
      {manualEdit && value && (
        <p className="text-xs text-amber-600 mt-1">
          💡 Tip: Select an address from the dropdown for automatic validation
        </p>
      )}
    </div>
  );
};
