'use server';

import { validateAddress, parseAddressString, formatValidatedAddress, type AddressInput, type AddressValidationResult } from '@/lib/usps-address-validation';

export async function validateAddressAction(addressString: string): Promise<AddressValidationResult> {
  try {
    // Parse the free-form address string
    const parsedAddress = parseAddressString(addressString);

    // Validate required fields
    if (!parsedAddress.streetAddress || !parsedAddress.city || !parsedAddress.state || !parsedAddress.ZIPCode) {
      return {
        success: false,
        originalAddress: parsedAddress as AddressInput,
        error: 'INCOMPLETE_ADDRESS',
        errorDescription: 'Please provide a complete address with street, city, state, and ZIP code',
      };
    }

    // Call USPS API
    const result = await validateAddress(parsedAddress as AddressInput);

    return result;
  } catch (error) {
    return {
      success: false,
      originalAddress: {} as AddressInput,
      error: 'VALIDATION_ERROR',
      errorDescription: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

export async function formatValidatedAddressAction(address: AddressInput): Promise<string> {
  return formatValidatedAddress(address);
}
