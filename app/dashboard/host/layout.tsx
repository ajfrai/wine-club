import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import DashboardHeader from '@/components/dashboard/DashboardHeader';

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

  // Fetch user profile
  const { data: userProfile } = await supabase
    .from('users')
    .select('full_name, role')
    .eq('id', user.id)
    .single();

  // Redirect members to their dashboard
  if (userProfile?.role === 'member') {
    redirect('/dashboard/member');
  }

  const userName = userProfile?.full_name || user.email || 'User';
  const userRole = userProfile?.role || 'host';

  return (
    <div className="min-h-screen bg-gradient-to-br from-sunburst-50 to-wine-light">
      <DashboardHeader userName={userName} userRole={userRole} />
      <main className="max-w-4xl mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}
