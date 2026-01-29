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
      .select('id, host_id')
      .eq('id', membership_id)
      .eq('host_id', user.id)
      .single();

    if (membershipError || !membership) {
      return NextResponse.json(
        { error: 'Membership not found or unauthorized' },
        { status: 404 }
      );
    }

    // Delete the pending membership
    const { error: deleteError } = await supabase
      .from('memberships')
      .delete()
      .eq('id', membership_id);

    if (deleteError) {
      console.error('Error denying membership:', deleteError);
      return NextResponse.json(
        { error: 'Failed to deny membership' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Membership denial error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
