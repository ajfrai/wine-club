export type UserRole = 'host' | 'member';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  full_name: string | null;
  stripe_customer_id: string | null;
  has_payment_method: boolean;
  payment_setup_completed_at: string | null;
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
  created_at: string;
  updated_at: string;
}

export interface HostSignupData {
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
  clubAddress: string;
  deliveryAddress: string;
  sameAsClubAddress: boolean;
  aboutClub?: string;
  winePreferences?: string;
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

export interface PaymentSetupData {
  paymentMethodId: string;
  userId: string;
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
