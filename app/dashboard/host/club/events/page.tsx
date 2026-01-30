import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { EventsManager } from '@/components/host/EventsManager';

export default async function HostEventsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Verify user is a host
  const { data: hostData, error: hostError } = await supabase
    .from('hosts')
    .select('id, club_address')
    .eq('user_id', user.id)
    .single();

  if (hostError || !hostData) {
    redirect('/dashboard/member');
  }

  return (
    <div className="min-h-screen bg-wine-light/20 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <EventsManager defaultLocation={hostData.club_address} />
      </div>
    </div>
  );
}
