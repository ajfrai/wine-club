import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import NearbyClubsCarousel from '@/components/dashboard/NearbyClubsCarousel';
import WinesCarousel from '@/components/dashboard/WinesCarousel';
import EventsList from '@/components/dashboard/EventsList';
import { Wine, Event, NearbyClub } from '@/types/member.types';
import Link from 'next/link';

export default async function MemberDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch user's profile
  const { data: userProfile } = await supabase
    .from('users')
    .select('full_name')
    .eq('id', user.id)
    .single();

  // Fetch user's memberships
  const { data: membershipsData } = await supabase
    .from('memberships')
    .select('*')
    .eq('member_id', user.id)
    .eq('status', 'active')
    .order('joined_at', { ascending: false })
    .limit(3);

  // Fetch hosts for these memberships (memberships.host_id references users.id, not hosts.id)
  let memberships: any[] = [];
  if (membershipsData && membershipsData.length > 0) {
    const hostUserIds = membershipsData.map(m => m.host_id);
    const { data: hosts } = await supabase
      .from('hosts')
      .select(`
        user_id,
        host_code,
        club_address,
        about_club,
        latitude,
        longitude,
        user:users!hosts_user_id_fkey(full_name)
      `)
      .in('user_id', hostUserIds);

    const hostMap = new Map(hosts?.map(h => [h.user_id, h]) || []);
    memberships = membershipsData
      .map(m => ({ ...m, host: hostMap.get(m.host_id) || null }))
      .filter(m => m.host !== null);
  }

  // Fetch member location for nearby clubs
  const { data: memberProfile } = await supabase
    .from('members')
    .select('latitude, longitude')
    .eq('user_id', user.id)
    .single();

  let nearbyClubs: NearbyClub[] = [];
  if (memberProfile?.latitude && memberProfile?.longitude) {
    const { data } = await supabase.rpc('get_nearby_clubs', {
      member_lat: memberProfile.latitude,
      member_lon: memberProfile.longitude,
      radius_miles: 50,
    });
    nearbyClubs = data || [];
  }

  // Fetch joined club IDs for the carousel
  const joinedClubIds = memberships?.map((m) => m.host_id) || [];

  // Fetch featured wines
  const { data: featuredWines } = await supabase
    .from('wines')
    .select('*')
    .eq('is_featured', true)
    .order('featured_at', { ascending: false })
    .limit(6);

  // Fetch upcoming events from user's clubs
  const hostIds = memberships?.map((m) => m.host_id) || [];
  let upcomingEvents: Event[] = [];

  if (hostIds.length > 0) {
    const { data } = await supabase
      .from('events')
      .select(`
        *,
        host:users!events_host_id_fkey(full_name)
      `)
      .in('host_id', hostIds)
      .gte('event_date', new Date().toISOString())
      .order('event_date', { ascending: true })
      .limit(5);

    upcomingEvents = data || [];
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {userProfile?.full_name || 'Member'}!
        </h1>
        <p className="text-gray-600 mt-2">Here's what's happening with your wine clubs.</p>
      </div>

      {/* My Clubs Section */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">My Clubs</h2>
          <Link
            href="/dashboard/member/clubs"
            className="text-wine hover:text-wine-dark font-medium"
          >
            Browse All Clubs →
          </Link>
        </div>
        {memberships && memberships.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {memberships.map((membership) => {
              const host = membership.host;
              if (!host) return null;

              return (
                <Link
                  key={membership.id}
                  href={`/clubs/${host.host_code}`}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow block"
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {host.user?.full_name}'s Wine Club
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">{host.club_address}</p>
                  {host.about_club && (
                    <p className="text-sm text-gray-600 line-clamp-2">{host.about_club}</p>
                  )}
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-gray-600">You haven't joined any clubs yet.</p>
            <Link
              href="/dashboard/member/clubs"
              className="inline-block mt-4 px-6 py-2 bg-wine text-white rounded-lg hover:bg-wine-dark"
            >
              Browse Nearby Clubs
            </Link>
          </div>
        )}
      </section>

      {/* Browse Nearby Clubs Section */}
      {nearbyClubs.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Clubs Near You</h2>
            <Link
              href="/dashboard/member/clubs"
              className="text-wine hover:text-wine-dark font-medium"
            >
              View All →
            </Link>
          </div>
          <NearbyClubsCarousel
            initialClubs={nearbyClubs}
            initialJoinedClubIds={joinedClubIds}
          />
        </section>
      )}

      {/* Featured Wines Section */}
      {featuredWines && featuredWines.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Featured Wines</h2>
          <WinesCarousel wines={featuredWines} />
        </section>
      )}

      {/* Upcoming Events Section */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Upcoming Events</h2>
          <Link
            href="/dashboard/member/events"
            className="text-wine hover:text-wine-dark font-medium"
          >
            View All Events →
          </Link>
        </div>
        {upcomingEvents.length > 0 ? (
          <div className="space-y-4">
            {upcomingEvents.slice(0, 3).map((event) => (
              <div
                key={event.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{event.title}</h3>
                <p className="text-sm text-gray-600">
                  {new Date(event.event_date).toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                  })}
                </p>
                {event.location && (
                  <p className="text-sm text-gray-600 mt-1">{event.location}</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-gray-600">No upcoming events.</p>
          </div>
        )}
      </section>
    </div>
  );
}
