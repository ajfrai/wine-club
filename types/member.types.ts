import { Host } from './auth.types';

export interface Member {
  id: string;
  user_id: string;
  address: string | null;
  city: string | null;
  state: string | null;
  zip_code: string | null;
  latitude: number | null;
  longitude: number | null;
  created_at: string;
  updated_at: string;
}

export interface Membership {
  id: string;
  member_id: string;
  host_id: string;
  status: 'active' | 'inactive' | 'pending';
  request_message?: string | null;
  joined_at: string;
  updated_at: string;
  host?: {
    user_id: string;
    host_code: string;
    club_address: string;
    about_club: string | null;
    latitude: number | null;
    longitude: number | null;
    join_mode: 'public' | 'request' | 'private';
  };
  host_name?: string;
}

export interface Wine {
  id: string;
  name: string;
  vineyard: string | null;
  vintage: number | null;
  varietal: string | null;
  region: string | null;
  description: string | null;
  tasting_notes: string | null;
  image_url: string | null;
  price: number | null;
  is_featured: boolean;
  featured_at: string | null;
  host_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Event {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  end_date: string | null;
  location: string | null;
  wines_theme: string | null;
  price: number | null;
  host_id: string;
  max_attendees: number | null;
  created_at: string;
  updated_at: string;
  host?: { full_name: string; host_code: string };
  attendee_count?: number;
  user_registered?: boolean;
}

export interface NearbyClub {
  host_id: string;
  host_name: string;
  host_code: string;
  club_address: string;
  about_club: string | null;
  wine_preferences: string | null;
  latitude: number;
  longitude: number;
  join_mode: 'public' | 'request' | 'private';
  distance: number; // miles
  member_count: number;
  hero_wine?: Wine | null;
  featured_wines?: Wine[];
  upcoming_events?: Event[];
}

export interface PendingRequest {
  id: string;
  member_id: string;
  host_id: string;
  request_message: string | null;
  joined_at: string;
  user: {
    full_name: string;
    email: string;
  };
}
