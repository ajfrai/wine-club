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

    // Get all active members for this host
    const { data: memberships, error: membershipsError } = await supabase
      .from('memberships')
      .select(`
        member_id,
        users:member_id (
          full_name,
          email
        )
      `)
      .eq('host_id', user.id)
      .eq('status', 'active');

    if (membershipsError) {
      console.error('Error fetching members:', membershipsError);
      return NextResponse.json(
        { error: 'Failed to fetch members' },
        { status: 500 }
      );
    }

    // Format the response
    const members = (memberships || []).map((membership) => {
      const userData = Array.isArray(membership.users) ? membership.users[0] : membership.users;
      return {
        user_id: membership.member_id,
        full_name: userData?.full_name || 'Unknown',
        email: userData?.email || '',
      };
    });

    return NextResponse.json({ members });
  } catch (error) {
    console.error('Members fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
