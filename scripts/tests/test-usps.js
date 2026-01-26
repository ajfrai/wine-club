// Quick test of USPS API
const USPS_OAUTH_URL = 'https://apis.usps.com/oauth2/v3/token';
const USPS_API_BASE_URL = 'https://apis.usps.com';

const consumerKey = 'da07LcjuCVSM6b9i5ezgVPBhOMBXg91yzs8XPHZZLX63rgnd';
const consumerSecret = 'BWYU8A2ch8NS9Zf6DF40SSp5IkrMJZHDHbTJB3IDfq2wmsIFDNtPgWYAKNOe3AZ0';

async function testUSPS() {
  console.log('Testing USPS OAuth...');

  // Get token
  const tokenResponse = await fetch(USPS_OAUTH_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      client_id: consumerKey,
      client_secret: consumerSecret,
      grant_type: 'client_credentials',
    }),
  });

  console.log('Token response status:', tokenResponse.status);
  const tokenData = await tokenResponse.json();
  console.log('Token data:', JSON.stringify(tokenData, null, 2));

  if (!tokenData.access_token) {
    console.error('Failed to get token');
    return;
  }

  console.log('\nTesting address validation...');

  // Test address with query parameters
  const params = new URLSearchParams({
    streetAddress: '1600 Pennsylvania Avenue NW',
    city: 'Washington',
    state: 'DC',
    ZIPCode: '20500',
  });

  const addressResponse = await fetch(`${USPS_API_BASE_URL}/addresses/v3/address?${params.toString()}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${tokenData.access_token}`,
      'Accept': 'application/json',
    },
  });

  console.log('Address response status:', addressResponse.status);
  const addressData = await addressResponse.json();
  console.log('Address data:', JSON.stringify(addressData, null, 2));
}

testUSPS().catch(console.error);
