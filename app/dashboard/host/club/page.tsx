import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { ClubManagementView } from '@/components/host/ClubManagementView';

export default async function HostClubPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch host data with user info
  const { data: hostData, error: hostError } = await supabase
    .from('hosts')
    .select(`
      id,
      user_id,
      host_code,
      club_address,
      about_club,
      wine_preferences,
      venmo_username,
      paypal_username,
      zelle_handle,
      accepts_cash,
      join_mode,
      created_at
    `)
    .eq('user_id', user.id)
    .single();

  if (hostError || !hostData) {
    redirect('/dashboard/member');
  }

  // Fetch user's name for club display
  const { data: userData } = await supabase
    .from('users')
    .select('full_name')
    .eq('id', user.id)
    .single();

  // Fetch member count
  const { count: memberCount } = await supabase
    .from('memberships')
    .select('*', { count: 'exact', head: true })
    .eq('host_id', user.id)
    .eq('status', 'active');

  // Fetch pending requests count
  const { count: pendingCount } = await supabase
    .from('memberships')
    .select('*', { count: 'exact', head: true })
    .eq('host_id', user.id)
    .eq('status', 'pending');

  // Fetch upcoming events count
  const { count: upcomingEventsCount } = await supabase
    .from('events')
    .select('*', { count: 'exact', head: true })
    .eq('host_id', user.id)
    .gte('event_date', new Date().toISOString());

  // Fetch pending requests with user details
  const { data: rawPendingRequests } = await supabase
    .from('memberships')
    .select(`
      id,
      member_id,
      host_id,
      request_message,
      joined_at,
      users:member_id (
        id,
        full_name,
        email
      )
    `)
    .eq('host_id', user.id)
    .eq('status', 'pending')
    .order('joined_at', { ascending: false });

  // Transform to match PendingRequest type
  const pendingRequests = (rawPendingRequests || []).map((req: any) => ({
    id: req.id,
    member_id: req.member_id,
    host_id: req.host_id,
    request_message: req.request_message,
    joined_at: req.joined_at,
    user: {
      full_name: req.users?.full_name || 'Unknown',
      email: req.users?.email || '',
    },
  }));

  // Fetch member list
  const { data: members } = await supabase
    .from('memberships')
    .select(`
      id,
      created_at,
      users!memberships_member_id_fkey (
        id,
        full_name,
        email
      )
    `)
    .eq('host_id', user.id)
    .eq('status', 'active')
    .order('created_at', { ascending: false });

  const clubName = userData?.full_name ? `${userData.full_name}'s Wine Club` : 'Your Wine Club';

  // Get join mode label
  const joinModeLabels = {
    public: 'Anyone Can Join',
    request: 'Approval Required',
    private: 'Invite Only',
  };
  const joinModeLabel = joinModeLabels[hostData.join_mode as keyof typeof joinModeLabels] || 'Unknown';

  // Get host code description based on join mode
  const hostCodeDescription = hostData.join_mode === 'private'
    ? 'Your private join code (share with people you want to invite)'
    : 'Your club code (shown on public page)';

  return (
    <ClubManagementView
      clubName={clubName}
      hostCode={hostData.host_code}
      clubAddress={hostData.club_address}
      aboutClub={hostData.about_club}
      winePreferences={hostData.wine_preferences}
      memberCount={memberCount || 0}
      upcomingEventsCount={upcomingEventsCount || 0}
      pendingCount={pendingCount || 0}
      joinMode={hostData.join_mode}
      hostData={hostData}
      members={members || []}
      pendingRequests={pendingRequests}
      joinModeLabel={joinModeLabel}
      hostCodeDescription={hostCodeDescription}
    />
  );
}
