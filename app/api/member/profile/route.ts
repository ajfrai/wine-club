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

    const { data: member, error } = await supabase
      .from('members')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error fetching member profile:', error);
      return NextResponse.json(
        { error: 'Failed to fetch profile' },
        { status: 500 }
      );
    }

    return NextResponse.json({ member: member || null });
  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
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
    const { address, city, state, zip_code, latitude, longitude } = body;

    // Check if member profile exists
    const { data: existingMember } = await supabase
      .from('members')
      .select('id')
      .eq('user_id', user.id)
      .single();

    let result;
    if (existingMember) {
      // Update existing profile
      const { data, error } = await supabase
        .from('members')
        .update({
          address,
          city,
          state,
          zip_code,
          latitude,
          longitude,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating member profile:', error);
        return NextResponse.json(
          { error: 'Failed to update profile' },
          { status: 500 }
        );
      }
      result = data;
    } else {
      // Create new profile
      const { data, error } = await supabase
        .from('members')
        .insert({
          user_id: user.id,
          address,
          city,
          state,
          zip_code,
          latitude,
          longitude,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating member profile:', error);
        return NextResponse.json(
          { error: 'Failed to create profile' },
          { status: 500 }
        );
      }
      result = data;
    }

    return NextResponse.json({ member: result });
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
