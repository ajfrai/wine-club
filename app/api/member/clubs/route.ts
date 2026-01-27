import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const radius = parseInt(searchParams.get('radius') || '50', 10);

    // Get member's location
    const { data: member, error: memberError } = await supabase
      .from('members')
      .select('latitude, longitude')
      .eq('user_id', user.id)
      .single();

    if (memberError || !member || !member.latitude || !member.longitude) {
      return NextResponse.json(
        { error: 'Member location not found. Please update your profile with your address.' },
        { status: 400 }
      );
    }

    // Call RPC function to get nearby clubs
    const { data: clubs, error } = await supabase
      .rpc('get_nearby_clubs', {
        member_lat: member.latitude,
        member_lon: member.longitude,
        radius_miles: radius,
      });

    if (error) {
      console.error('Error fetching nearby clubs:', error);
      return NextResponse.json(
        { error: 'Failed to fetch nearby clubs' },
        { status: 500 }
      );
    }

    return NextResponse.json({ clubs: clubs || [] });
  } catch (error) {
    console.error('Nearby clubs fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
