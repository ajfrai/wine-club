/**
 * @deprecated UserRole is being deprecated in favor of capability-based access.
 * Use checkDualRoleStatus() to determine user capabilities instead.
 */
export type UserRole = 'host' | 'member';
export type ClubType = 'fixed' | 'multi_host';

export interface User {
  id: string;
  email: string;
  /**
   * @deprecated role is being deprecated in favor of capability-based access.
   * Capabilities are determined by table presence:
   * - hosts table presence → can manage clubs
   * - members table presence → can join clubs
   * Use checkDualRoleStatus() instead of checking this field.
   */
  role?: UserRole | null;
  full_name: string | null;
  created_at: string;
  updated_at: string;
}

export interface Host {
  id: string;
  user_id: string;
  club_type: ClubType;
  club_address: string | null;
  delivery_address: string | null;
  about_club: string | null;
  wine_preferences: string | null;
  host_code: string;
  latitude: number | null;
  longitude: number | null;
  venmo_username: string | null;
  paypal_username: string | null;
  zelle_handle: string | null;
  accepts_cash: boolean;
  join_mode: 'public' | 'request' | 'private';
  created_at: string;
  updated_at: string;
}

export interface HostSignupData {
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
  clubType: ClubType;
  clubAddress?: string;
  aboutClub?: string;
  winePreferences?: string;
  latitude?: number | null;
  longitude?: number | null;
}

export interface MemberSignupData {
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
  hostCode?: string;
  findNearbyHosts: boolean;
  // Optional location fields for proximity search
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  latitude?: number | null;
  longitude?: number | null;
}

export interface SignupResponse {
  success: boolean;
  error?: string;
  user?: User;
  host?: Host;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  error?: string;
  user?: User;
}
