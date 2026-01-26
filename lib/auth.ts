import { supabase } from './supabase';
import type { SignupResponse, HostSignupData, MemberSignupData } from '@/types/auth.types';

export async function signupHost(data: HostSignupData): Promise<SignupResponse> {
  try {
    console.log('[signupHost] Starting host signup process');
    console.log('[signupHost] Email:', data.email);
    console.log('[signupHost] Full name:', data.fullName);
    console.log('[signupHost] Club address:', data.clubAddress);
    console.log('[signupHost] Same as club address:', data.sameAsClubAddress);

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

    // Step 2: Wait for trigger to create user profile, then update with full name
    console.log('[signupHost] Step 2: Waiting for user profile to be created by trigger');

    // Add a small delay to ensure trigger has completed
    await new Promise(resolve => setTimeout(resolve, 500));

    // Check if user profile exists
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id, full_name')
      .eq('id', authData.user.id)
      .single();

    console.log('[signupHost] User profile check:', { existingUser, checkError });

    // Update user profile with full name
    console.log('[signupHost] Updating user profile with full name');
    const { error: profileError } = await supabase
      .from('users')
      .update({ full_name: data.fullName })
      .eq('id', authData.user.id);

    if (profileError) {
      console.error('[signupHost] Step 2 failed: Profile update error:', profileError);
      console.error('[signupHost] Profile error details:', JSON.stringify(profileError, null, 2));
      return {
        success: false,
        error: `Failed to update user profile: ${profileError.message || JSON.stringify(profileError)}`,
      };
    }

    console.log('[signupHost] Step 2 success: Profile updated');

    // Step 3: Generate unique host code
    console.log('[signupHost] Step 3: Generating host code');
    const { data: hostCodeData, error: hostCodeError } = await supabase
      .rpc('generate_host_code');

    if (hostCodeError || !hostCodeData) {
      console.error('[signupHost] Step 3 failed: Host code error:', hostCodeError);
      console.error('[signupHost] Host code error details:', JSON.stringify(hostCodeError, null, 2));
      return {
        success: false,
        error: `Failed to generate host code: ${hostCodeError?.message || 'Unknown error'}`,
      };
    }

    console.log('[signupHost] Step 3 success: Host code generated:', hostCodeData);

    // Step 4: Create host profile
    console.log('[signupHost] Step 4: Creating host profile');
    const deliveryAddress = data.sameAsClubAddress
      ? data.clubAddress
      : data.deliveryAddress;

    console.log('[signupHost] Delivery address:', deliveryAddress);

    const { data: hostData, error: hostError } = await supabase
      .from('hosts')
      .insert({
        user_id: authData.user.id,
        club_address: data.clubAddress,
        delivery_address: deliveryAddress,
        about_club: data.aboutClub || null,
        wine_preferences: data.winePreferences || null,
        host_code: hostCodeData,
      })
      .select()
      .single();

    if (hostError) {
      console.error('[signupHost] Step 4 failed: Host profile error:', hostError);
      console.error('[signupHost] Host profile error details:', JSON.stringify(hostError, null, 2));
      return {
        success: false,
        error: `Failed to create host profile: ${hostError.message || JSON.stringify(hostError)}`,
      };
    }

    console.log('[signupHost] Step 4 success: Host profile created');

    // Step 5: Fetch complete user data
    console.log('[signupHost] Step 5: Fetching complete user data');
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (userError) {
      console.error('[signupHost] Step 5 failed: User data fetch error:', userError);
      console.error('[signupHost] User data error details:', JSON.stringify(userError, null, 2));
      return {
        success: false,
        error: `Failed to fetch user data: ${userError.message || JSON.stringify(userError)}`,
      };
    }

    console.log('[signupHost] Step 5 success: User data fetched');
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

export async function signupMember(data: MemberSignupData): Promise<SignupResponse> {
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
        console.error('[signupMember] Host code error details:', JSON.stringify(hostError, null, 2));
        return {
          success: false,
          error: `Invalid host code. Please check and try again. ${hostError?.message || ''}`,
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

    // Step 3: Wait for trigger to create user profile, then update with full name
    console.log('[signupMember] Step 3: Waiting for user profile to be created by trigger');

    // Add a small delay to ensure trigger has completed
    await new Promise(resolve => setTimeout(resolve, 500));

    // Check if user profile exists
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id, full_name')
      .eq('id', authData.user.id)
      .single();

    console.log('[signupMember] User profile check:', { existingUser, checkError });

    // Update user profile with full name
    console.log('[signupMember] Updating user profile with full name');
    const { error: profileError } = await supabase
      .from('users')
      .update({ full_name: data.fullName })
      .eq('id', authData.user.id);

    if (profileError) {
      console.error('[signupMember] Step 3 failed: Profile update error:', profileError);
      console.error('[signupMember] Profile error details:', JSON.stringify(profileError, null, 2));
      return {
        success: false,
        error: `Failed to update user profile: ${profileError.message || JSON.stringify(profileError)}`,
      };
    }

    console.log('[signupMember] Step 3 success: Profile updated');

    // Step 4: Fetch complete user data
    console.log('[signupMember] Step 4: Fetching complete user data');
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (userError) {
      console.error('[signupMember] Step 4 failed: User data fetch error:', userError);
      console.error('[signupMember] User data error details:', JSON.stringify(userError, null, 2));
      return {
        success: false,
        error: `Failed to fetch user data: ${userError.message || JSON.stringify(userError)}`,
      };
    }

    console.log('[signupMember] Step 4 success: User data fetched');
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
