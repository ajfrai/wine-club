import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ hostCode: string }> }
) {
  try {
    const supabase = await createClient();
    const { hostCode } = await params;

    // Get host details by host_code
    const { data: hostData, error: hostError } = await supabase
      .from('hosts')
      .select(`
        id,
        user_id,
        host_code,
        club_address,
        about_club,
        wine_preferences,
        venmo_username,
        paypal_username,
        zelle_handle,
        accepts_cash,
        users!inner(full_name)
      `)
      .eq('host_code', hostCode)
      .single();

    if (hostError || !hostData) {
      return NextResponse.json(
        { error: 'Club not found' },
        { status: 404 }
      );
    }

    // Get member count
    const { count: memberCount } = await supabase
      .from('memberships')
      .select('*', { count: 'exact', head: true })
      .eq('host_id', hostData.user_id)
      .eq('status', 'active');

    // Check if current user is logged in and is a member
    const { data: { user } } = await supabase.auth.getUser();
    let isMember = false;
    let isHost = false;

    if (user) {
      // Check if user is the host
      isHost = user.id === hostData.user_id;

      // Check if user is a member of this club
      const { data: membership } = await supabase
        .from('memberships')
        .select('status')
        .eq('host_id', hostData.user_id)
        .eq('member_id', user.id)
        .eq('status', 'active')
        .maybeSingle();

      isMember = !!membership;
    }

    const club = {
      host_id: hostData.user_id,
      host_code: hostData.host_code,
      host_name: (hostData.users as any).full_name,
      club_address: hostData.club_address,
      about_club: hostData.about_club,
      wine_preferences: hostData.wine_preferences,
      member_count: memberCount || 0,
      is_member: isMember,
      is_host: isHost,
      is_logged_in: !!user,
      // Only include payment info for members
      venmo_username: isMember ? hostData.venmo_username : null,
      paypal_username: isMember ? hostData.paypal_username : null,
      zelle_handle: isMember ? hostData.zelle_handle : null,
      accepts_cash: isMember ? hostData.accepts_cash : false,
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
