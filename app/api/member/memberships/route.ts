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

    // Fetch memberships with joined host data
    const { data: memberships, error } = await supabase
      .from('memberships')
      .select(`
        *,
        host:hosts!memberships_host_id_fkey(
          user_id,
          host_code,
          club_address,
          about_club,
          latitude,
          longitude
        )
      `)
      .eq('member_id', user.id)
      .eq('status', 'active')
      .order('joined_at', { ascending: false });

    if (error) {
      console.error('Error fetching memberships:', error);
      return NextResponse.json(
        { error: 'Failed to fetch memberships' },
        { status: 500 }
      );
    }

    return NextResponse.json({ memberships: memberships || [] });
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

    const { host_id } = await request.json();

    if (!host_id) {
      return NextResponse.json(
        { error: 'Host ID is required' },
        { status: 400 }
      );
    }

    // Verify host exists
    const { data: host, error: hostError } = await supabase
      .from('hosts')
      .select('user_id')
      .eq('user_id', host_id)
      .single();

    if (hostError || !host) {
      return NextResponse.json(
        { error: 'Host not found' },
        { status: 404 }
      );
    }

    // Create membership
    const { data: membership, error } = await supabase
      .from('memberships')
      .insert({
        member_id: user.id,
        host_id: host_id,
        status: 'active',
      })
      .select()
      .single();

    if (error) {
      // Check for unique constraint violation
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'You are already a member of this club' },
          { status: 400 }
        );
      }
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
