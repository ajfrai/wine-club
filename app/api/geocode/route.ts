import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { address } = await request.json();

    if (!address) {
      return NextResponse.json(
        { error: 'Address is required' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Google Maps API key not configured' },
        { status: 500 }
      );
    }

    const encodedAddress = encodeURIComponent(address);
    const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${apiKey}`;

    const response = await fetch(geocodeUrl);
    const data = await response.json();

    if (data.status !== 'OK' || !data.results || data.results.length === 0) {
      return NextResponse.json(
        { error: 'Unable to geocode address' },
        { status: 400 }
      );
    }

    const result = data.results[0];
    const { lat, lng } = result.geometry.location;

    return NextResponse.json({
      latitude: lat,
      longitude: lng,
      formatted_address: result.formatted_address,
    });
  } catch (error) {
    console.error('Geocoding error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
