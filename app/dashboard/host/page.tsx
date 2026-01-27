import { createClient } from '@/lib/supabase/server';

export default async function HostDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // Fetch user profile
  const { data: userProfile } = await supabase
    .from('users')
    .select('full_name, email, created_at')
    .eq('id', user.id)
    .single();

  // Fetch host data
  const { data: hostData } = await supabase
    .from('hosts')
    .select('host_code, club_address, about_club')
    .eq('user_id', user.id)
    .single();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-wine-dark mb-2">Host Dashboard</h1>
        <p className="text-gray-600">Welcome back, {userProfile?.full_name}!</p>
      </div>

      {/* User Info Card */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold text-gray-900">Your Profile</h2>
          <span className="px-3 py-1 bg-wine-dark text-white rounded-full text-sm font-medium">
            Host
          </span>
        </div>

        <div className="space-y-3">
          <div>
            <span className="text-sm text-gray-500">Name</span>
            <p className="text-gray-900 font-medium">{userProfile?.full_name}</p>
          </div>
          <div>
            <span className="text-sm text-gray-500">Email</span>
            <p className="text-gray-900 font-medium">{userProfile?.email}</p>
          </div>
          {hostData?.host_code && (
            <div>
              <span className="text-sm text-gray-500">Host Code</span>
              <p className="text-gray-900 font-medium font-mono">{hostData.host_code}</p>
            </div>
          )}
          {hostData?.club_address && (
            <div>
              <span className="text-sm text-gray-500">Club Address</span>
              <p className="text-gray-900 font-medium">{hostData.club_address}</p>
            </div>
          )}
          <div>
            <span className="text-sm text-gray-500">Member Since</span>
            <p className="text-gray-900 font-medium">
              {new Date(userProfile?.created_at || '').toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {/* Placeholder Content */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Coming Soon</h2>
        <p className="text-gray-600">
          Your host dashboard with event management, member lists, and wine selections will be available here soon.
        </p>
      </div>
    </div>
  );
}
