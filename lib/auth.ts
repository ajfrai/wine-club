import type { SignupResponse, HostSignupData, MemberSignupData, LoginData, LoginResponse } from '@/types/auth.types';
import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Sign up a user who wants to create and manage a club.
 * Creates a user profile, host (club) profile, and member profile.
 *
 * Note: The 'role' field in auth metadata and users table is deprecated.
 * Capabilities are now determined by table presence (hosts, members tables).
 */
export async function signupHost(data: HostSignupData, supabase: SupabaseClient): Promise<SignupResponse> {
  try {
    console.log('[signupHost] Starting host signup process');
    console.log('[signupHost] Email:', data.email);
    console.log('[signupHost] Full name:', data.fullName);
    console.log('[signupHost] Club address:', data.clubAddress);

    // Step 1: Create auth user
    console.log('[signupHost] Step 1: Creating auth user in Supabase');
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          role: 'host',
          full_name: data.fullName,
        },
      },
    });

    if (authError) {
      console.error('[signupHost] Step 1 failed: Auth error:', authError);
      return {
        success: false,
        error: authError.message,
      };
    }

    if (!authData.user) {
      console.error('[signupHost] Step 1 failed: No user returned from auth');
      return {
        success: false,
        error: 'Failed to create user account',
      };
    }

    console.log('[signupHost] Step 1 success: User created with ID:', authData.user.id);

    // Step 2: Create user profile using RPC function (bypasses RLS)
    console.log('[signupHost] Step 2: Creating user profile');
    const { error: profileError } = await supabase
      .rpc('create_user_profile', {
        user_id: authData.user.id,
        user_email: data.email,
        user_role: 'host',
        user_full_name: data.fullName,
      });

    if (profileError) {
      console.error('[signupHost] Step 2 failed:', JSON.stringify(profileError, null, 2));
      return {
        success: false,
        error: 'Failed to create user profile',
      };
    }

    console.log('[signupHost] Step 2 success: Profile created');

    // Step 3: Generate unique host code
    console.log('[signupHost] Step 3: Generating host code');
    const { data: hostCodeData, error: hostCodeError } = await supabase
      .rpc('generate_host_code');

    if (hostCodeError || !hostCodeData) {
      console.error('[signupHost] Step 3 failed: Host code error:', hostCodeError);
      return {
        success: false,
        error: 'Failed to generate host code',
      };
    }

    console.log('[signupHost] Step 3 success: Host code generated:', hostCodeData);

    // Step 4: Use provided coordinates (from Google Places autocomplete)
    console.log('[signupHost] Step 4: Setting club coordinates');
    const latitude = data.latitude ?? null;
    const longitude = data.longitude ?? null;

    if (latitude && longitude) {
      console.log('[signupHost] Step 4 success: Using provided coordinates:', { latitude, longitude });
    } else if (data.clubType === 'fixed') {
      console.log('[signupHost] Step 4 warning: No coordinates provided, club will not appear in discovery');
    } else {
      console.log('[signupHost] Step 4 info: Multi-host club - coordinates not required');
    }

    // Step 5: Create host profile
    console.log('[signupHost] Step 5: Creating host profile');
    const { data: hostData, error: hostError } = await supabase
      .from('hosts')
      .insert({
        user_id: authData.user.id,
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
      console.error('[signupHost] Step 5 failed: Host profile error:', hostError);
      return {
        success: false,
        error: 'Failed to create host profile',
      };
    }

    console.log('[signupHost] Step 5 success: Host profile created');

    // Step 6: Auto-enroll host as a member (so they're part of their own club)
    console.log('[signupHost] Step 6: Creating member profile for host');
    const { error: memberError } = await supabase
      .from('members')
      .insert({
        user_id: authData.user.id,
        address: data.clubAddress || null,
      });

    if (memberError) {
      console.error('[signupHost] Step 6 warning: Member profile creation failed:', memberError);
      // Don't fail the signup, just log the warning - host profile is the primary requirement
    } else {
      console.log('[signupHost] Step 6 success: Member profile created for host');
    }

    // Step 7: Add host as a member of their own club
    console.log('[signupHost] Step 7: Adding host as member of their own club');
    const { error: membershipError } = await supabase
      .from('memberships')
      .insert({
        member_id: authData.user.id,
        host_id: authData.user.id,
        status: 'active',
      });

    if (membershipError) {
      console.error('[signupHost] Step 7 warning: Membership creation failed:', membershipError);
      // Don't fail the signup, just log the warning
    } else {
      console.log('[signupHost] Step 7 success: Host added as member of their own club');
    }

    // Step 8: Fetch complete user data
    console.log('[signupHost] Step 8: Fetching complete user data');
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (userError) {
      console.error('[signupHost] Step 8 failed: User data fetch error:', userError);
      return {
        success: false,
        error: 'Failed to fetch user data',
      };
    }

    console.log('[signupHost] Step 8 success: User data fetched');
    console.log('[signupHost] Signup complete!');

    return {
      success: true,
      user: userData,
      host: hostData,
    };
  } catch (error) {
    console.error('[signupHost] Unexpected error during signup:', error);
    console.error('[signupHost] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred',
    };
  }
}

/**
 * Sign up a user who wants to join clubs as a member.
 * Creates a user profile and optionally a member profile with location data.
 *
 * Note: The 'role' field in auth metadata and users table is deprecated.
 * Capabilities are now determined by table presence (hosts, members tables).
 */
export async function signupMember(data: MemberSignupData, supabase: SupabaseClient): Promise<SignupResponse> {
  try {
    console.log('[signupMember] Starting member signup process');
    console.log('[signupMember] Email:', data.email);
    console.log('[signupMember] Full name:', data.fullName);
    console.log('[signupMember] Host code:', data.hostCode || 'None (finding nearby)');
    console.log('[signupMember] Find nearby hosts:', data.findNearbyHosts);

    // Step 1: Validate host code if provided
    if (data.hostCode && !data.findNearbyHosts) {
      console.log('[signupMember] Step 1: Validating host code:', data.hostCode.toUpperCase());
      const { data: hostData, error: hostError } = await supabase
        .from('hosts')
        .select('id')
        .eq('host_code', data.hostCode.toUpperCase())
        .single();

      if (hostError || !hostData) {
        console.error('[signupMember] Step 1 failed: Invalid host code:', hostError);
        return {
          success: false,
          error: 'Invalid host code. Please check and try again.',
        };
      }
      console.log('[signupMember] Step 1 success: Host code validated');
    } else {
      console.log('[signupMember] Step 1: Skipped (finding nearby hosts)');
    }

    // Step 2: Create auth user
    console.log('[signupMember] Step 2: Creating auth user in Supabase');
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          role: 'member',
          full_name: data.fullName,
        },
      },
    });

    if (authError) {
      console.error('[signupMember] Step 2 failed: Auth error:', authError);
      return {
        success: false,
        error: authError.message,
      };
    }

    if (!authData.user) {
      console.error('[signupMember] Step 2 failed: No user returned from auth');
      return {
        success: false,
        error: 'Failed to create user account',
      };
    }

    console.log('[signupMember] Step 2 success: User created with ID:', authData.user.id);

    // Step 3: Create user profile using RPC function (bypasses RLS)
    console.log('[signupMember] Step 3: Creating user profile');
    const { error: profileError } = await supabase
      .rpc('create_user_profile', {
        user_id: authData.user.id,
        user_email: data.email,
        user_role: 'member',
        user_full_name: data.fullName,
      });

    if (profileError) {
      console.error('[signupMember] Step 3 failed:', JSON.stringify(profileError, null, 2));
      return {
        success: false,
        error: 'Failed to create user profile',
      };
    }

    console.log('[signupMember] Step 3 success: Profile created');

    // Step 4: Create member profile with location data if provided
    if (data.findNearbyHosts && data.address) {
      console.log('[signupMember] Step 4: Creating member profile with location data');
      const { error: memberError } = await supabase
        .from('members')
        .insert({
          user_id: authData.user.id,
          address: data.address,
          city: data.city || null,
          state: data.state || null,
          zip_code: data.zip_code || null,
          latitude: data.latitude,
          longitude: data.longitude,
        });

      if (memberError) {
        console.error('[signupMember] Step 4 warning: Member profile creation failed:', memberError);
        // Don't fail the signup, just log the warning
      } else {
        console.log('[signupMember] Step 4 success: Member profile created with location');
      }
    } else {
      console.log('[signupMember] Step 4: Skipped member profile creation (no location data)');
    }

    // Step 5: Fetch complete user data
    console.log('[signupMember] Step 5: Fetching complete user data');
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (userError) {
      console.error('[signupMember] Step 5 failed: User data fetch error:', userError);
      return {
        success: false,
        error: 'Failed to fetch user data',
      };
    }

    console.log('[signupMember] Step 5 success: User data fetched');
    console.log('[signupMember] Signup complete!');

    return {
      success: true,
      user: userData,
    };
  } catch (error) {
    console.error('[signupMember] Unexpected error during signup:', error);
    console.error('[signupMember] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred',
    };
  }
}

export function generateHostCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export interface DualRoleStatus {
  hasHostProfile: boolean;
  hasMemberProfile: boolean;
  isDualRole: boolean;
}

export async function checkDualRoleStatus(userId: string, supabase: SupabaseClient): Promise<DualRoleStatus> {
  const [hostResult, memberResult] = await Promise.all([
    supabase.from('hosts').select('id').eq('user_id', userId).single(),
    supabase.from('members').select('id').eq('user_id', userId).single(),
  ]);

  const hasHostProfile = !!hostResult.data && !hostResult.error;
  const hasMemberProfile = !!memberResult.data && !memberResult.error;

  return {
    hasHostProfile,
    hasMemberProfile,
    isDualRole: hasHostProfile && hasMemberProfile,
  };
}

export async function login(data: LoginData, supabase: SupabaseClient): Promise<LoginResponse> {
  try {
    console.log('[login] Starting login process');
    console.log('[login] Email:', data.email);

    // Step 1: Sign in with Supabase auth
    console.log('[login] Step 1: Authenticating with Supabase');
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (authError) {
      console.error('[login] Step 1 failed: Auth error:', authError);
      return {
        success: false,
        error: 'Invalid email or password',
      };
    }

    if (!authData.user) {
      console.error('[login] Step 1 failed: No user returned');
      return {
        success: false,
        error: 'Login failed. Please try again.',
      };
    }

    console.log('[login] Step 1 success: User authenticated:', authData.user.id);

    // Step 2: Fetch user profile
    console.log('[login] Step 2: Fetching user profile');
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (userError || !userData) {
      console.error('[login] Step 2 failed: User profile error:', userError);
      return {
        success: false,
        error: 'Failed to load user profile',
      };
    }

    console.log('[login] Step 2 success: User profile loaded');
    console.log('[login] Login complete!');

    return {
      success: true,
      user: userData,
    };
  } catch (error) {
    console.error('[login] Unexpected error during login:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred',
    };
  }
}
