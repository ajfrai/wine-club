/**
 * USPS Address Validation API Integration (OAuth 2.0)
 * Documentation: https://developers.usps.com/
 * API Version: 3
 */

export interface AddressInput {
  streetAddress: string;
  secondaryAddress?: string; // Apartment, suite, etc.
  city: string;
  state: string;
  ZIPCode: string;
  ZIPPlus4?: string;
}

export interface ValidatedAddress {
  streetAddress: string;
  secondaryAddress?: string;
  city: string;
  state: string;
  ZIPCode: string;
  ZIPPlus4?: string;
  deliveryPoint?: string;
  carrierRoute?: string;
}

export interface AddressValidationResult {
  success: boolean;
  validatedAddress?: ValidatedAddress;
  originalAddress: AddressInput;
  error?: string;
  errorDescription?: string;
}

const USPS_OAUTH_URL = 'https://apis.usps.com/oauth2/v3/token';
const USPS_API_BASE_URL = 'https://apis.usps.com';

// Cache for OAuth token
let cachedToken: { token: string; expiresAt: number } | null = null;

/**
 * Get OAuth 2.0 access token for USPS API
 */
async function getAccessToken(): Promise<string> {
  const consumerKey = process.env.USPS_CONSUMER_KEY;
  const consumerSecret = process.env.USPS_CONSUMER_SECRET;

  if (!consumerKey || !consumerSecret) {
    throw new Error('USPS_CONSUMER_KEY and USPS_CONSUMER_SECRET environment variables are required');
  }

  // Return cached token if still valid (with 5 minute buffer)
  if (cachedToken && cachedToken.expiresAt > Date.now() + 5 * 60 * 1000) {
    return cachedToken.token;
  }

  try {
    const credentials = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');

    const response = await fetch(USPS_OAUTH_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OAuth token request failed: ${response.status} ${errorText}`);
    }

    const data = await response.json();

    // Cache the token (USPS tokens typically expire in 3600 seconds)
    cachedToken = {
      token: data.access_token,
      expiresAt: Date.now() + (data.expires_in || 3600) * 1000,
    };

    return data.access_token;
  } catch (error) {
    throw new Error(`Failed to get USPS OAuth token: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Parse a free-form address string into structured components
 */
export function parseAddressString(addressString: string): Partial<AddressInput> {
  const lines = addressString.trim().split('\n').map(line => line.trim()).filter(Boolean);

  if (lines.length === 0) {
    return {};
  }

  // Last line should be: City, State ZIP
  const lastLine = lines[lines.length - 1];
  const cityStateZipMatch = lastLine.match(/^(.+),\s*([A-Z]{2})\s+(\d{5})(-\d{4})?$/);

  if (!cityStateZipMatch) {
    // Try to extract at least the parts we can
    return {
      streetAddress: lines[0] || '',
    };
  }

  const city = cityStateZipMatch[1].trim();
  const state = cityStateZipMatch[2];
  const ZIPCode = cityStateZipMatch[3];
  const ZIPPlus4 = cityStateZipMatch[4]?.substring(1); // Remove the dash

  // First line(s) are the street address
  const addressLines = lines.slice(0, -1);

  return {
    secondaryAddress: addressLines.length > 1 ? addressLines[0] : undefined,
    streetAddress: addressLines.length > 1 ? addressLines.slice(1).join(' ') : addressLines[0] || '',
    city,
    state,
    ZIPCode,
    ZIPPlus4,
  };
}

/**
 * Validate an address using USPS Address Validation API v3
 */
export async function validateAddress(
  address: AddressInput
): Promise<AddressValidationResult> {
  try {
    const accessToken = await getAccessToken();

    // Build request body
    const requestBody = {
      streetAddress: address.streetAddress,
      city: address.city,
      state: address.state,
      ZIPCode: address.ZIPCode,
    };

    // Add optional fields if present
    if (address.secondaryAddress) {
      Object.assign(requestBody, { secondaryAddress: address.secondaryAddress });
    }
    if (address.ZIPPlus4) {
      Object.assign(requestBody, { ZIPPlus4: address.ZIPPlus4 });
    }

    // Make request to USPS API
    const response = await fetch(`${USPS_API_BASE_URL}/addresses/v3/address`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      return {
        success: false,
        originalAddress: address,
        error: `API_ERROR_${response.status}`,
        errorDescription: errorData?.error?.message || `API request failed with status ${response.status}`,
      };
    }

    const data = await response.json();

    // Extract validated address from response
    const validated = data.address || data;

    return {
      success: true,
      originalAddress: address,
      validatedAddress: {
        streetAddress: validated.streetAddress || address.streetAddress,
        secondaryAddress: validated.secondaryAddress,
        city: validated.city || address.city,
        state: validated.state || address.state,
        ZIPCode: validated.ZIPCode || validated.zip5 || address.ZIPCode,
        ZIPPlus4: validated.ZIPPlus4 || validated.zip4,
        deliveryPoint: validated.deliveryPoint,
        carrierRoute: validated.carrierRoute,
      },
    };
  } catch (error) {
    return {
      success: false,
      originalAddress: address,
      error: 'VALIDATION_ERROR',
      errorDescription: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Format a validated address as a display string
 */
export function formatValidatedAddress(address: ValidatedAddress): string {
  const parts: string[] = [];

  if (address.secondaryAddress) {
    parts.push(address.secondaryAddress);
  }

  parts.push(address.streetAddress);

  const zip = address.ZIPPlus4 ? `${address.ZIPCode}-${address.ZIPPlus4}` : address.ZIPCode;
  parts.push(`${address.city}, ${address.state} ${zip}`);

  return parts.join('\n');
}
