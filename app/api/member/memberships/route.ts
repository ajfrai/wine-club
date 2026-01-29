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

    // Fetch memberships for this user (active and pending)
    const { data: memberships, error } = await supabase
      .from('memberships')
      .select('*')
      .eq('member_id', user.id)
      .in('status', ['active', 'pending'])
      .order('joined_at', { ascending: false });

    if (error) {
      console.error('Error fetching memberships:', error);
      return NextResponse.json(
        { error: 'Failed to fetch memberships' },
        { status: 500 }
      );
    }

    if (!memberships || memberships.length === 0) {
      return NextResponse.json({ memberships: [] });
    }

    // Get the host_ids (which are user_ids in the memberships table)
    const hostUserIds = memberships.map(m => m.host_id);

    // Fetch hosts where user_id matches the membership host_ids
    const { data: hosts, error: hostsError } = await supabase
      .from('hosts')
      .select('user_id, host_code, club_address, about_club, latitude, longitude, join_mode')
      .in('user_id', hostUserIds);

    if (hostsError) {
      console.error('Error fetching hosts:', hostsError);
      return NextResponse.json(
        { error: 'Failed to fetch host data' },
        { status: 500 }
      );
    }

    // Fetch user names for hosts
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, full_name')
      .in('id', hostUserIds);

    if (usersError) {
      console.error('Error fetching users:', usersError);
    }

    // Create maps for quick lookup
    const hostMap = new Map(hosts?.map(h => [h.user_id, h]) || []);
    const userMap = new Map(users?.map(u => [u.id, u]) || []);

    // Combine memberships with host data
    const membershipsWithHosts = memberships
      .map(m => {
        const host = hostMap.get(m.host_id);
        const user = userMap.get(m.host_id);
        return {
          ...m,
          host: host || null,
          host_name: user?.full_name || 'Unknown Host',
        };
      })
      .filter(m => m.host !== null);

    return NextResponse.json({ memberships: membershipsWithHosts });
  } catch (error) {
    console.error('Memberships fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { host_id, request_message } = await request.json();

    if (!host_id) {
      return NextResponse.json(
        { error: 'Host ID is required' },
        { status: 400 }
      );
    }

    // Verify host exists and get join_mode
    const { data: host, error: hostError } = await supabase
      .from('hosts')
      .select('user_id, join_mode')
      .eq('user_id', host_id)
      .single();

    if (hostError || !host) {
      return NextResponse.json(
        { error: 'Host not found' },
        { status: 404 }
      );
    }

    // Block direct join for private clubs
    if (host.join_mode === 'private') {
      return NextResponse.json(
        { error: 'This is a private club. Use the club code to join.' },
        { status: 403 }
      );
    }

    // Check if membership already exists
    const { data: existingMembership } = await supabase
      .from('memberships')
      .select('id, status')
      .eq('member_id', user.id)
      .eq('host_id', host_id)
      .maybeSingle();

    if (existingMembership) {
      if (existingMembership.status === 'active') {
        return NextResponse.json(
          { error: 'You are already a member of this club' },
          { status: 400 }
        );
      }
      if (existingMembership.status === 'pending') {
        return NextResponse.json(
          { error: 'You already have a pending request for this club' },
          { status: 400 }
        );
      }

      // Reactivate inactive membership
      // Determine status based on join_mode
      const newStatus = host.join_mode === 'public' ? 'active' : 'pending';

      const { data: membership, error: updateError } = await supabase
        .from('memberships')
        .update({
          status: newStatus,
          request_message: host.join_mode === 'request' ? request_message : null,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingMembership.id)
        .select()
        .single();

      if (updateError) {
        console.error('Error reactivating membership:', updateError);
        return NextResponse.json(
          { error: 'Failed to rejoin club' },
          { status: 500 }
        );
      }

      return NextResponse.json({ membership });
    }

    // Determine status based on join_mode
    const status = host.join_mode === 'public' ? 'active' : 'pending';

    // Create new membership
    const { data: membership, error } = await supabase
      .from('memberships')
      .insert({
        member_id: user.id,
        host_id: host_id,
        status: status,
        request_message: host.join_mode === 'request' ? request_message : null,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating membership:', error);
      return NextResponse.json(
        { error: 'Failed to join club' },
        { status: 500 }
      );
    }

    return NextResponse.json({ membership });
  } catch (error) {
    console.error('Membership creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const host_id = searchParams.get('host_id');

    if (!host_id) {
      return NextResponse.json(
        { error: 'Host ID is required' },
        { status: 400 }
      );
    }

    // Update membership status to inactive
    const { error } = await supabase
      .from('memberships')
      .update({ status: 'inactive', updated_at: new Date().toISOString() })
      .eq('member_id', user.id)
      .eq('host_id', host_id);

    if (error) {
      console.error('Error leaving club:', error);
      return NextResponse.json(
        { error: 'Failed to leave club' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Membership deletion error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
