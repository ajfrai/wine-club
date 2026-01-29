import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { Wine, Users, Settings, ExternalLink } from 'lucide-react';

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

  // Fetch member count
  const { count: memberCount } = await supabase
    .from('memberships')
    .select('*', { count: 'exact', head: true })
    .eq('host_id', user.id)
    .eq('status', 'active');

  const clubName = userProfile?.full_name ? `${userProfile.full_name}'s Wine Club` : 'Your Wine Club';

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-wine-dark mb-2">Host Dashboard</h1>
        <p className="text-gray-600">Welcome back, {userProfile?.full_name}!</p>
      </div>

      {/* Club Card - Primary CTA */}
      <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-wine">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-wine-light rounded-lg">
              <Wine className="w-6 h-6 text-wine" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">{clubName}</h2>
              <p className="text-gray-500">Code: <span className="font-mono font-semibold">{hostData?.host_code}</span></p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Users className="w-5 h-5" />
            <span className="font-semibold">{memberCount || 0}</span>
            <span>members</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/dashboard/host/club"
            className="inline-flex items-center gap-2 px-6 py-3 bg-wine text-white rounded-lg hover:bg-wine-dark transition-colors font-semibold"
          >
            <Settings className="w-4 h-4" />
            Manage Club
          </Link>
          <Link
            href={`/clubs/${hostData?.host_code}`}
            target="_blank"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            <ExternalLink className="w-4 h-4" />
            View Public Page
          </Link>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <p className="text-sm text-gray-500">Members</p>
          <p className="text-3xl font-bold text-wine">{memberCount || 0}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <p className="text-sm text-gray-500">Club Code</p>
          <p className="text-2xl font-mono font-bold text-gray-900">{hostData?.host_code}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <p className="text-sm text-gray-500">Host Since</p>
          <p className="text-xl font-semibold text-gray-900">
            {new Date(userProfile?.created_at || '').toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Coming Soon */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Coming Soon</h2>
        <p className="text-gray-600">
          Event management, wine selections, and payment tracking will be available here soon.
        </p>
      </div>
    </div>
  );
}
