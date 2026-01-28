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

    // Fetch user data
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, email, full_name, phone')
      .eq('id', user.id)
      .single();

    if (userError) {
      console.error('Error fetching user data:', userError);
      return NextResponse.json(
        { error: 'Failed to fetch user data' },
        { status: 500 }
      );
    }

    // Fetch member data (address info)
    const { data: memberData, error: memberError } = await supabase
      .from('members')
      .select('address, city, state, zip_code, latitude, longitude')
      .eq('user_id', user.id)
      .single();

    // If member doesn't exist yet, that's okay - return null for member data
    const member = memberError && memberError.code === 'PGRST116' ? null : memberData;

    return NextResponse.json({
      personalInfo: {
        ...userData,
        address: member?.address || null,
        city: member?.city || null,
        state: member?.state || null,
        zip_code: member?.zip_code || null,
        latitude: member?.latitude || null,
        longitude: member?.longitude || null,
      }
    });
  } catch (error) {
    console.error('Personal info fetch error:', error);
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
    const {
      full_name,
      phone,
      address,
      city,
      state,
      zip_code,
      latitude,
      longitude
    } = body;

    // Update user table (personal info)
    const { error: userUpdateError } = await supabase
      .from('users')
      .update({
        full_name,
        phone,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    if (userUpdateError) {
      console.error('Error updating user data:', userUpdateError);
      return NextResponse.json(
        { error: 'Failed to update personal information' },
        { status: 500 }
      );
    }

    // Update or create member record (address info)
    if (address || city || state || zip_code || latitude || longitude) {
      const { data: existingMember } = await supabase
        .from('members')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (existingMember) {
        // Update existing member record
        const { error: memberUpdateError } = await supabase
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
          .eq('user_id', user.id);

        if (memberUpdateError) {
          console.error('Error updating member address:', memberUpdateError);
          return NextResponse.json(
            { error: 'Failed to update address' },
            { status: 500 }
          );
        }
      } else {
        // Create new member record
        const { error: memberInsertError } = await supabase
          .from('members')
          .insert({
            user_id: user.id,
            address,
            city,
            state,
            zip_code,
            latitude,
            longitude,
          });

        if (memberInsertError) {
          console.error('Error creating member record:', memberInsertError);
          return NextResponse.json(
            { error: 'Failed to save address' },
            { status: 500 }
          );
        }
      }
    }

    // Fetch updated data to return
    const { data: updatedUser } = await supabase
      .from('users')
      .select('id, email, full_name, phone')
      .eq('id', user.id)
      .single();

    const { data: updatedMember } = await supabase
      .from('members')
      .select('address, city, state, zip_code, latitude, longitude')
      .eq('user_id', user.id)
      .single();

    return NextResponse.json({
      personalInfo: {
        ...updatedUser,
        address: updatedMember?.address || null,
        city: updatedMember?.city || null,
        state: updatedMember?.state || null,
        zip_code: updatedMember?.zip_code || null,
        latitude: updatedMember?.latitude || null,
        longitude: updatedMember?.longitude || null,
      }
    });
  } catch (error) {
    console.error('Personal info update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
