import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

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

    const { host_code } = await request.json();

    if (!host_code || typeof host_code !== 'string') {
      return NextResponse.json(
        { error: 'Host code is required' },
        { status: 400 }
      );
    }

    // Look up host by code
    const { data: host, error: hostError } = await supabase
      .from('hosts')
      .select('user_id, join_mode')
      .eq('host_code', host_code.toUpperCase())
      .single();

    if (hostError || !host) {
      return NextResponse.json(
        { error: 'Invalid club code' },
        { status: 404 }
      );
    }

    // Check if already a member
    const { data: existingMembership } = await supabase
      .from('memberships')
      .select('id, status')
      .eq('member_id', user.id)
      .eq('host_id', host.user_id)
      .maybeSingle();

    if (existingMembership) {
      if (existingMembership.status === 'active') {
        return NextResponse.json(
          { error: 'Already a member of this club' },
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
      const { data: membership, error: updateError } = await supabase
        .from('memberships')
        .update({
          status: 'active',
          updated_at: new Date().toISOString()
        })
        .eq('id', existingMembership.id)
        .select()
        .single();

      if (updateError) {
        console.error('Error reactivating membership:', updateError);
        return NextResponse.json(
          { error: 'Failed to join club' },
          { status: 500 }
        );
      }

      return NextResponse.json({ membership });
    }

    // Create new active membership
    const { data: membership, error } = await supabase
      .from('memberships')
      .insert({
        member_id: user.id,
        host_id: host.user_id,
        status: 'active',
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
    console.error('Join with code error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
