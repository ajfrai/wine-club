import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import { checkDualRoleStatus } from '@/lib/auth';
import { cookies } from 'next/headers';

export default async function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    redirect('/login');
  }

  // Fetch user profile and dual-role status
  const [{ data: userProfile }, dualRoleStatus] = await Promise.all([
    supabase.from('users').select('full_name, role').eq('id', user.id).single(),
    checkDualRoleStatus(user.id, supabase),
  ]);

  const userName = userProfile?.full_name || user.email || 'User';
  const userRole = userProfile?.role || 'member';

  // Determine which dashboard context to use (default to user's primary role)
  const currentDashboard: 'host' | 'member' = userRole === 'host' ? 'host' : 'member';

  return (
    <div className="min-h-screen bg-sunburst-50">
      <DashboardHeader
        userName={userName}
        userRole={userRole}
        isDualRole={dualRoleStatus.isDualRole}
        currentDashboard={currentDashboard}
      />
      <main className="p-8">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
