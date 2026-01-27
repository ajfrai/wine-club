import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import DashboardHeader from '@/components/dashboard/DashboardHeader';

export default async function MemberDashboardLayout({
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

  const userName = userProfile?.full_name || user.email || 'User';
  const userRole = userProfile?.role || 'member';

  return (
    <div className="min-h-screen bg-sunburst-50">
      <DashboardHeader userName={userName} userRole={userRole} />
      <main className="p-8">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
