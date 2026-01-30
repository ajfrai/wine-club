import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Calendar, Users, Wine, Receipt, Settings } from 'lucide-react';
import { Tabs } from '@/components/ui/Tabs';
import { EventsTab } from '@/components/host/tabs/EventsTab';
import { MembersTab } from '@/components/host/tabs/MembersTab';
import { SettingsTab } from '@/components/host/tabs/SettingsTab';
import { WinesTab } from '@/components/host/tabs/WinesTab';
import { LedgerTab } from '@/components/host/tabs/LedgerTab';

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

  // Build tabs
  const tabs = [
    {
      id: 'events',
      label: 'Events',
      icon: <Calendar className="w-5 h-5" />,
      badge: upcomingEventsCount || 0,
      content: <EventsTab upcomingEventsCount={upcomingEventsCount || 0} />,
    },
    {
      id: 'wines',
      label: 'Wines',
      icon: <Wine className="w-5 h-5" />,
      content: <WinesTab />,
    },
    {
      id: 'ledger',
      label: 'Ledger',
      icon: <Receipt className="w-5 h-5" />,
      content: <LedgerTab />,
    },
    {
      id: 'members',
      label: 'Members',
      icon: <Users className="w-5 h-5" />,
      badge: hostData.join_mode === 'request' ? (pendingCount || 0) : undefined,
      content: (
        <MembersTab
          memberCount={memberCount || 0}
          members={members || []}
          pendingRequests={pendingRequests}
          pendingCount={pendingCount || 0}
          joinMode={hostData.join_mode}
        />
      ),
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <Settings className="w-5 h-5" />,
      content: (
        <SettingsTab
          hostData={hostData}
          joinModeLabel={joinModeLabel}
          hostCodeDescription={hostCodeDescription}
        />
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{clubName}</h1>
        <p className="text-gray-600 mt-1">Manage your club and members</p>
      </div>

      {/* Tabs */}
      <Tabs tabs={tabs} defaultTab="events" />
    </div>
  );
}
