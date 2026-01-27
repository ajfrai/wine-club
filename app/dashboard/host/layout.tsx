import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import { checkDualRoleStatus } from '@/lib/auth';

export default async function HostDashboardLayout({
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

  // Redirect users without host profile to member dashboard
  if (!dualRoleStatus.hasHostProfile) {
    redirect('/dashboard/member');
  }

  const userName = userProfile?.full_name || user.email || 'User';
  const userRole = userProfile?.role || 'host';

  return (
    <div className="min-h-screen bg-gradient-to-br from-sunburst-50 to-wine-light">
      <DashboardHeader
        userName={userName}
        userRole={userRole}
        isDualRole={dualRoleStatus.isDualRole}
        currentDashboard="host"
      />
      <main className="max-w-4xl mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}
