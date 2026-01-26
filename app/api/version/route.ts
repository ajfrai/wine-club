import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    version: '2.0-test-branch',
    timestamp: new Date().toISOString(),
    commit: '959c49f - Add detailed error messages and timing fix',
    features: [
      'Test mode auto-fill enabled',
      'Detailed error messages',
      'Database timing fix (500ms delay)',
      'Full error logging',
    ],
  });
}
