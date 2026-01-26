import { NextResponse } from 'next/server';
import { validateAddress, type AddressInput } from '@/lib/usps-address-validation';

export async function GET() {
  // Test with a known valid address
  const testAddress: AddressInput = {
    streetAddress: '1600 Pennsylvania Avenue NW',
    city: 'Washington',
    state: 'DC',
    ZIPCode: '20500',
  };

  try {
    const result = await validateAddress(testAddress);
    return NextResponse.json({
      success: true,
      result,
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
