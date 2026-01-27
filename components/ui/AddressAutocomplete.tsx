'use client';

import React, { useRef, useEffect } from 'react';
import usePlacesAutocomplete, {
  getGeocode,
  getLatLng,
} from 'use-places-autocomplete';
import { useGoogleMaps } from '@/components/providers/GoogleMapsProvider';

export interface AddressComponents {
  streetNumber: string;
  route: string;
  city: string;
  state: string;
  stateCode: string;
  postalCode: string;
  country: string;
  countryCode: string;
  formattedAddress: string;
  lat?: number;
  lng?: number;
}

interface AddressAutocompleteProps {
  label?: string;
  placeholder?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  value?: string;
  onChange?: (value: string) => void;
  onSelect?: (address: AddressComponents) => void;
  disabled?: boolean;
  className?: string;
}

export const AddressAutocomplete: React.FC<AddressAutocompleteProps> = ({
  label,
  placeholder = 'Start typing an address...',
  error,
  helperText,
  required,
  value: externalValue,
  onChange,
  onSelect,
  disabled,
  className = '',
}) => {
  const { isLoaded, loadError } = useGoogleMaps();
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    ready,
    value,
    suggestions: { status, data },
    setValue,
    clearSuggestions,
    init,
  } = usePlacesAutocomplete({
    requestOptions: {
      componentRestrictions: { country: 'us' },
      types: ['address'],
    },
    debounce: 300,
    initOnMount: false,
  });

  // Initialize the autocomplete when Google Maps is loaded
  useEffect(() => {
    if (isLoaded && !ready) {
      init();
    }
  }, [isLoaded, ready, init]);

  // Sync external value when ready
  useEffect(() => {
    if (ready && externalValue) {
      setValue(externalValue, false);
    }
  }, [ready, externalValue, setValue]);

  // Sync external value
  useEffect(() => {
    if (externalValue !== undefined && externalValue !== value) {
      setValue(externalValue, false);
    }
  }, [externalValue, setValue, value]);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue(newValue);
    onChange?.(newValue);
  };

  const handleSelect = async (description: string) => {
    setValue(description, false);
    clearSuggestions();
    onChange?.(description);

    try {
      const results = await getGeocode({ address: description });
      const { lat, lng } = await getLatLng(results[0]);

      const addressComponents = parseAddressComponents(results[0], lat, lng);
      onSelect?.(addressComponents);
    } catch (error) {
      console.error('Error getting address details:', error);
    }
  };

  const parseAddressComponents = (
    result: google.maps.GeocoderResult,
    lat: number,
    lng: number
  ): AddressComponents => {
    const components: AddressComponents = {
      streetNumber: '',
      route: '',
      city: '',
      state: '',
      stateCode: '',
      postalCode: '',
      country: '',
      countryCode: '',
      formattedAddress: result.formatted_address,
      lat,
      lng,
    };

    for (const component of result.address_components) {
      const types = component.types;

      if (types.includes('street_number')) {
        components.streetNumber = component.long_name;
      } else if (types.includes('route')) {
        components.route = component.long_name;
      } else if (types.includes('locality')) {
        components.city = component.long_name;
      } else if (types.includes('administrative_area_level_1')) {
        components.state = component.long_name;
        components.stateCode = component.short_name;
      } else if (types.includes('postal_code')) {
        components.postalCode = component.long_name;
      } else if (types.includes('country')) {
        components.country = component.long_name;
        components.countryCode = component.short_name;
      }
    }

    return components;
  };

  const isDisabled = disabled || !ready || !!loadError;
  const showSuggestions = status === 'OK' && data.length > 0;

  // Fallback to regular input if Google Maps isn't available
  if (loadError || (!isLoaded && !process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY)) {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {label}
            {required && <span className="text-sunburst-600 ml-1">*</span>}
          </label>
        )}
        <input
          type="text"
          value={externalValue || ''}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className={`
            w-full px-4 py-3 rounded-lg border
            transition-colors duration-200
            ${error
              ? 'border-sunburst-500 focus:border-sunburst-600 focus:ring-sunburst-500'
              : 'border-gray-300 focus:border-sunburst-500 focus:ring-sunburst-500'
            }
            focus:outline-none focus:ring-2 focus:ring-opacity-50
            disabled:bg-gray-100 disabled:cursor-not-allowed
            ${className}
          `}
        />
        {error && <p className="mt-1 text-sm text-sunburst-600">{error}</p>}
        {helperText && !error && <p className="mt-1 text-sm text-gray-500">{helperText}</p>}
      </div>
    );
  }

  return (
    <div className="w-full relative">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-sunburst-600 ml-1">*</span>}
        </label>
      )}
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={handleInput}
        disabled={isDisabled}
        placeholder={ready ? placeholder : 'Loading...'}
        autoComplete="off"
        className={`
          w-full px-4 py-3 rounded-lg border
          transition-colors duration-200
          ${error
            ? 'border-sunburst-500 focus:border-sunburst-600 focus:ring-sunburst-500'
            : 'border-gray-300 focus:border-sunburst-500 focus:ring-sunburst-500'
          }
          focus:outline-none focus:ring-2 focus:ring-opacity-50
          disabled:bg-gray-100 disabled:cursor-not-allowed
          ${className}
        `}
      />

      {/* Suggestions Dropdown */}
      {showSuggestions && (
        <ul className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
          {data.map((suggestion) => {
            const {
              place_id,
              structured_formatting: { main_text, secondary_text },
            } = suggestion;

            return (
              <li
                key={place_id}
                onClick={() => handleSelect(suggestion.description)}
                className="px-4 py-3 cursor-pointer hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
              >
                <span className="font-medium text-gray-900">{main_text}</span>
                <span className="text-gray-500 text-sm ml-1">{secondary_text}</span>
              </li>
            );
          })}
        </ul>
      )}

      {error && <p className="mt-1 text-sm text-sunburst-600">{error}</p>}
      {helperText && !error && <p className="mt-1 text-sm text-gray-500">{helperText}</p>}
    </div>
  );
};
