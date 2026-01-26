'use client';

import { useLoadScript } from '@react-google-maps/api';

const libraries: ("places")[] = ['places'];

export default function TestGooglePage() {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries,
  });

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Google Maps API Test</h1>

      <div className="space-y-4">
        <div>
          <strong>API Key:</strong> {process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ? 'Set ✓' : 'Missing ✗'}
        </div>

        <div>
          <strong>Script Loading Status:</strong>
          {loadError ? (
            <span className="text-red-600"> Error: {loadError.message}</span>
          ) : isLoaded ? (
            <span className="text-green-600"> Loaded ✓</span>
          ) : (
            <span className="text-yellow-600"> Loading...</span>
          )}
        </div>

        {loadError && (
          <div className="bg-red-50 border border-red-200 p-4 rounded">
            <strong>Error Details:</strong>
            <pre className="mt-2 text-sm">{JSON.stringify(loadError, null, 2)}</pre>
            <div className="mt-4">
              <strong>Common Fixes:</strong>
              <ul className="list-disc list-inside mt-2 text-sm">
                <li>Enable "Maps JavaScript API" in Google Cloud Console</li>
                <li>Add vercel.app domain to API key restrictions</li>
                <li>Check API key is valid</li>
              </ul>
            </div>
          </div>
        )}

        {isLoaded && (
          <div className="bg-green-50 border border-green-200 p-4 rounded">
            <strong>✓ Google Maps API loaded successfully!</strong>
            <p className="mt-2 text-sm">The AddressAutocomplete component should work.</p>
          </div>
        )}
      </div>
    </div>
  );
}
