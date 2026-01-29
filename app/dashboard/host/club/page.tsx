import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Users, MapPin, Wine, Settings } from 'lucide-react';
import { PaymentHandlesForm } from '@/components/settings/PaymentHandlesForm';
import { CopyHostCode } from '@/components/host/CopyHostCode';
import { PendingRequestsCard } from '@/components/host/PendingRequestsCard';
import { PrivacySettingsCard } from '@/components/host/PrivacySettingsCard';

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
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{clubName}</h1>
          <p className="text-gray-600 mt-1">Manage your club settings and members</p>
        </div>
        <Link
          href={`/clubs/${hostData.host_code}`}
          className="text-wine hover:text-wine-dark text-sm font-medium"
          target="_blank"
        >
          View public page →
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content - Left 2 columns */}
        <div className="lg:col-span-2 space-y-6">
          {/* Club Info Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Club Information</h2>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-500">Host Code</label>
                <div className="flex items-center gap-2 mt-1">
                  <code className="text-lg font-mono font-semibold text-wine bg-wine-light px-3 py-1 rounded">
                    {hostData.host_code}
                  </code>
                  <CopyHostCode hostCode={hostData.host_code} />
                </div>
                <p className="text-xs text-gray-500 mt-1">{hostCodeDescription}</p>
              </div>

              <div>
                <label className="text-sm text-gray-500">Privacy Setting</label>
                <p className="text-gray-900 font-medium">{joinModeLabel}</p>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <label className="text-sm text-gray-500">Location</label>
                  <p className="text-gray-900">{hostData.club_address}</p>
                </div>
              </div>

              {hostData.about_club && (
                <div>
                  <label className="text-sm text-gray-500">About</label>
                  <p className="text-gray-900 mt-1">{hostData.about_club}</p>
                </div>
              )}

              {hostData.wine_preferences && (
                <div className="flex items-start gap-3">
                  <Wine className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <label className="text-sm text-gray-500">Wine Preferences</label>
                    <p className="text-gray-900">{hostData.wine_preferences}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Privacy Settings Card */}
          <PrivacySettingsCard currentJoinMode={hostData.join_mode} />

          {/* Payment Settings Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Settings</h2>
            <p className="text-sm text-gray-600 mb-6">
              Configure how members can pay you. Members will see these options when they view your club.
            </p>
            <PaymentHandlesForm />
          </div>
        </div>

        {/* Sidebar - Right column */}
        <div className="space-y-6">
          {/* Stats Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <Users className="w-5 h-5 text-wine" />
              <h2 className="text-lg font-semibold text-gray-900">Members</h2>
            </div>
            <p className="text-3xl font-bold text-wine">{memberCount || 0}</p>
            <p className="text-sm text-gray-500">active members</p>
          </div>

          {/* Pending Requests Card */}
          {hostData.join_mode === 'request' && (
            <PendingRequestsCard
              pendingRequests={pendingRequests || []}
              pendingCount={pendingCount || 0}
            />
          )}

          {/* Member List Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Member List</h3>
            {members && members.length > 0 ? (
              <ul className="space-y-3">
                {members.map((membership: any) => (
                  <li key={membership.id} className="flex items-center justify-between text-sm">
                    <div>
                      <p className="font-medium text-gray-900">
                        {membership.users?.full_name || 'Unknown'}
                      </p>
                      <p className="text-gray-500 text-xs">
                        Joined {new Date(membership.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500">No members yet. Share your host code to invite people!</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
