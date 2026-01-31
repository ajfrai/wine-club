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

    const body = await request.json();
    const {
      charge_type,
      title,
      description,
      amount,
      due_date,
      member_id,
    } = body;

    if (!charge_type || !title || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields: charge_type, title, amount' },
        { status: 400 }
      );
    }

    // If member_id is null, create a charge for all active members
    if (member_id === null) {
      // Get all active members for this host
      const { data: memberships, error: membershipsError } = await supabase
        .from('memberships')
        .select('member_id')
        .eq('host_id', user.id)
        .eq('status', 'active');

      if (membershipsError) {
        console.error('Error fetching memberships:', membershipsError);
        return NextResponse.json(
          { error: 'Failed to fetch members' },
          { status: 500 }
        );
      }

      // Create a charge for each member
      const chargePromises = (memberships || []).map((membership) =>
        supabase.from('charges').insert({
          host_id: user.id,
          member_id: membership.member_id,
          charge_type,
          title,
          description,
          amount,
          due_date: due_date || null,
          payment_status: 'pending',
        })
      );

      await Promise.all(chargePromises);

      return NextResponse.json({
        message: `Created ${memberships?.length || 0} charges for all members`,
        count: memberships?.length || 0,
      });
    } else {
      // Create a charge for a specific member
      const { data: charge, error: chargeError } = await supabase
        .from('charges')
        .insert({
          host_id: user.id,
          member_id,
          charge_type,
          title,
          description,
          amount,
          due_date: due_date || null,
          payment_status: 'pending',
        })
        .select()
        .single();

      if (chargeError) {
        console.error('Error creating charge:', chargeError);
        return NextResponse.json(
          { error: 'Failed to create charge' },
          { status: 500 }
        );
      }

      return NextResponse.json({ charge });
    }
  } catch (error) {
    console.error('Charge creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
