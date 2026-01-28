import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ hostId: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { hostId } = await params;

    // Get member's location for distance calculation
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

    // Get host details
    const { data: host, error: hostError } = await supabase
      .from('hosts')
      .select('id, user_id, full_name, host_code, club_address, about_club, wine_preferences, latitude, longitude')
      .eq('id', hostId)
      .single();

    if (hostError || !host) {
      return NextResponse.json(
        { error: 'Club not found' },
        { status: 404 }
      );
    }

    // Get member count
    const { count, error: countError } = await supabase
      .from('memberships')
      .select('*', { count: 'exact', head: true })
      .eq('host_id', hostId)
      .eq('status', 'active');

    if (countError) {
      console.error('Error counting members:', countError);
    }

    // Calculate distance using haversine formula
    const toRad = (value: number) => (value * Math.PI) / 180;
    const R = 3959; // Earth's radius in miles
    const dLat = toRad(host.latitude - member.latitude);
    const dLon = toRad(host.longitude - member.longitude);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(member.latitude)) *
        Math.cos(toRad(host.latitude)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    // Check if member has joined this club
    const { data: membership, error: membershipError } = await supabase
      .from('memberships')
      .select('status')
      .eq('host_id', hostId)
      .eq('member_id', user.id)
      .maybeSingle();

    const club = {
      host_id: host.id,
      host_name: host.full_name,
      host_code: host.host_code,
      club_address: host.club_address,
      about_club: host.about_club,
      wine_preferences: host.wine_preferences,
      member_count: count || 0,
      distance: distance,
      is_joined: membership?.status === 'active',
    };

    return NextResponse.json({ club });
  } catch (error) {
    console.error('Club fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
