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

    const { membership_id } = await request.json();

    if (!membership_id) {
      return NextResponse.json(
        { error: 'Membership ID is required' },
        { status: 400 }
      );
    }

    // Verify this membership belongs to the host's club
    const { data: membership, error: membershipError } = await supabase
      .from('memberships')
      .select('id, host_id, status')
      .eq('id', membership_id)
      .eq('host_id', user.id)
      .single();

    if (membershipError || !membership) {
      return NextResponse.json(
        { error: 'Membership not found or unauthorized' },
        { status: 404 }
      );
    }

    // Update status to active (idempotent)
    const { data: updatedMembership, error: updateError } = await supabase
      .from('memberships')
      .update({
        status: 'active',
        updated_at: new Date().toISOString()
      })
      .eq('id', membership_id)
      .select()
      .single();

    if (updateError) {
      console.error('Error approving membership:', updateError);
      return NextResponse.json(
        { error: 'Failed to approve membership' },
        { status: 500 }
      );
    }

    return NextResponse.json({ membership: updatedMembership });
  } catch (error) {
    console.error('Membership approval error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
