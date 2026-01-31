import type { SupabaseClient } from '@supabase/supabase-js';
import type { ClubType } from '@/types/auth.types';

export interface CreateClubData {
  clubName: string;
  clubType: ClubType;
  clubAddress?: string;
  aboutClub?: string;
  winePreferences?: string;
  latitude?: number | null;
  longitude?: number | null;
}

export interface CreateClubResponse {
  success: boolean;
  error?: string;
  hostId?: string;
}

export async function createClub(
  userId: string,
  data: CreateClubData,
  supabase: SupabaseClient
): Promise<CreateClubResponse> {
  try {
    console.log('[createClub] Starting club creation process for user:', userId);
    console.log('[createClub] Club type:', data.clubType);
    console.log('[createClub] Club name:', data.clubName);

    // Step 1: Generate unique host code
    console.log('[createClub] Step 1: Generating host code');
    const { data: hostCodeData, error: hostCodeError } = await supabase
      .rpc('generate_host_code');

    if (hostCodeError || !hostCodeData) {
      console.error('[createClub] Step 1 failed: Host code error:', hostCodeError);
      return {
        success: false,
        error: 'Failed to generate host code',
      };
    }

    console.log('[createClub] Step 1 success: Host code generated:', hostCodeData);

    // Step 2: Set club coordinates (if provided)
    console.log('[createClub] Step 2: Setting club coordinates');
    const latitude = data.latitude ?? null;
    const longitude = data.longitude ?? null;

    if (latitude && longitude) {
      console.log('[createClub] Step 2 success: Using provided coordinates:', { latitude, longitude });
    } else if (data.clubType === 'fixed') {
      console.log('[createClub] Step 2 warning: No coordinates provided for fixed club');
    } else {
      console.log('[createClub] Step 2 info: Multi-host club - coordinates not required');
    }

    // Step 3: Create host profile
    console.log('[createClub] Step 3: Creating host profile');
    const { data: hostData, error: hostError } = await supabase
      .from('hosts')
      .insert({
        user_id: userId,
        club_type: data.clubType,
        club_address: data.clubAddress || null,
        delivery_address: data.clubAddress || null,
        about_club: data.aboutClub || null,
        wine_preferences: data.winePreferences || null,
        host_code: hostCodeData,
        latitude: latitude,
        longitude: longitude,
      })
      .select()
      .single();

    if (hostError) {
      console.error('[createClub] Step 3 failed: Host profile error:', hostError);
      return {
        success: false,
        error: 'Failed to create club. Please try again.',
      };
    }

    console.log('[createClub] Step 3 success: Host profile created');

    // Step 4: Ensure user has a member profile
    console.log('[createClub] Step 4: Ensuring member profile exists');
    const { data: existingMember } = await supabase
      .from('members')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (!existingMember) {
      console.log('[createClub] Step 4a: Creating member profile');
      const { error: memberError } = await supabase
        .from('members')
        .insert({
          user_id: userId,
          address: data.clubAddress || null,
        });

      if (memberError) {
        console.error('[createClub] Step 4a warning: Member profile creation failed:', memberError);
        // Don't fail the club creation
      } else {
        console.log('[createClub] Step 4a success: Member profile created');
      }
    } else {
      console.log('[createClub] Step 4: Member profile already exists');
    }

    // Step 5: Add host as a member of their own club
    console.log('[createClub] Step 5: Adding host as member of their own club');
    const { error: membershipError } = await supabase
      .from('memberships')
      .insert({
        member_id: userId,
        host_id: userId,
        status: 'active',
      });

    if (membershipError) {
      console.error('[createClub] Step 5 warning: Membership creation failed:', membershipError);
      // Don't fail the club creation
    } else {
      console.log('[createClub] Step 5 success: Host added as member of their own club');
    }

    console.log('[createClub] Club creation complete!');

    return {
      success: true,
      hostId: userId,
    };
  } catch (error) {
    console.error('[createClub] Unexpected error during club creation:', error);
    console.error('[createClub] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred',
    };
  }
}
