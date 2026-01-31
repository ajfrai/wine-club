import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import { checkDualRoleStatus } from '@/lib/auth';

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

  // Fetch user profile and capability status
  const [{ data: userProfile }, dualRoleStatus] = await Promise.all([
    supabase.from('users').select('full_name').eq('id', user.id).single(),
    checkDualRoleStatus(user.id, supabase),
  ]);

  const userName = userProfile?.full_name || user.email || 'User';

  // Determine which dashboard context to use based on capabilities
  // Prefer host (club management) dashboard if user owns a club, otherwise member
  const currentDashboard: 'host' | 'member' = dualRoleStatus.hasHostProfile ? 'host' : 'member';

  return (
    <div className="min-h-screen bg-sunburst-50">
      <DashboardHeader
        userName={userName}
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
