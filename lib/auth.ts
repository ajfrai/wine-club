import { supabase } from './supabase';
import type { SignupResponse, HostSignupData, MemberSignupData } from '@/types/auth.types';

export async function signupHost(data: HostSignupData): Promise<SignupResponse> {
  try {
    // Step 1: Create auth user
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
      return {
        success: false,
        error: authError.message,
      };
    }

    if (!authData.user) {
      return {
        success: false,
        error: 'Failed to create user account',
      };
    }

    // Step 2: Update user profile with full name
    const { error: profileError } = await supabase
      .from('users')
      .update({ full_name: data.fullName })
      .eq('id', authData.user.id);

    if (profileError) {
      return {
        success: false,
        error: 'Failed to update user profile',
      };
    }

    // Step 3: Generate unique host code
    const { data: hostCodeData, error: hostCodeError } = await supabase
      .rpc('generate_host_code');

    if (hostCodeError || !hostCodeData) {
      return {
        success: false,
        error: 'Failed to generate host code',
      };
    }

    // Step 4: Create host profile
    const deliveryAddress = data.sameAsClubAddress
      ? data.clubAddress
      : data.deliveryAddress;

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
      return {
        success: false,
        error: 'Failed to create host profile',
      };
    }

    // Step 5: Fetch complete user data
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (userError) {
      return {
        success: false,
        error: 'Failed to fetch user data',
      };
    }

    return {
      success: true,
      user: userData,
      host: hostData,
    };
  } catch (error) {
    console.error('Host signup error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred',
    };
  }
}

export async function signupMember(data: MemberSignupData): Promise<SignupResponse> {
  try {
    // Step 1: Validate host code if provided
    if (data.hostCode && !data.findNearbyHosts) {
      const { data: hostData, error: hostError } = await supabase
        .from('hosts')
        .select('id')
        .eq('host_code', data.hostCode.toUpperCase())
        .single();

      if (hostError || !hostData) {
        return {
          success: false,
          error: 'Invalid host code. Please check and try again.',
        };
      }
    }

    // Step 2: Create auth user
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
      return {
        success: false,
        error: authError.message,
      };
    }

    if (!authData.user) {
      return {
        success: false,
        error: 'Failed to create user account',
      };
    }

    // Step 3: Update user profile with full name
    const { error: profileError } = await supabase
      .from('users')
      .update({ full_name: data.fullName })
      .eq('id', authData.user.id);

    if (profileError) {
      return {
        success: false,
        error: 'Failed to update user profile',
      };
    }

    // Step 4: Fetch complete user data
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (userError) {
      return {
        success: false,
        error: 'Failed to fetch user data',
      };
    }

    return {
      success: true,
      user: userData,
    };
  } catch (error) {
    console.error('Member signup error:', error);
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
