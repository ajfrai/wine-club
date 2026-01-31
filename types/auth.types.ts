export type UserRole = 'host' | 'member';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  full_name: string | null;
  created_at: string;
  updated_at: string;
}

export interface Host {
  id: string;
  user_id: string;
  club_address: string;
  delivery_address: string;
  about_club: string | null;
  wine_preferences: string | null;
  host_code: string;
  venmo_username: string | null;
  paypal_username: string | null;
  zelle_handle: string | null;
  accepts_cash: boolean;
  created_at: string;
  updated_at: string;
}

export interface HostSignupData {
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
  clubAddress: string;
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
