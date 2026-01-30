import { createClient } from '@/lib/supabase/server';
import { redirect, notFound } from 'next/navigation';
import { EventDetailClient } from '@/components/events/EventDetailClient';

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch event details
  const { data: event, error: eventError } = await supabase
    .from('events')
    .select(`
      *,
      host:users!events_host_id_fkey (
        id,
        full_name,
        hosts (
          host_code
        )
      )
    `)
    .eq('id', eventId)
    .single();

  if (eventError || !event) {
    notFound();
  }

  // Count attendees
  const { count: attendeeCount } = await supabase
    .from('event_attendees')
    .select('*', { count: 'exact', head: true })
    .eq('event_id', eventId)
    .eq('status', 'registered');

  // Check if user is registered
  const { data: userRegistration } = await supabase
    .from('event_attendees')
    .select('id, status')
    .eq('event_id', eventId)
    .eq('user_id', user.id)
    .maybeSingle();

  // Check if user is the host
  const isHost = event.host_id === user.id;

  // Get attendee list (only if user is the host)
  let attendees = null;
  if (isHost) {
    const { data: attendeesList } = await supabase
      .from('event_attendees')
      .select(`
        id,
        status,
        registered_at,
        user_id,
        users!event_attendees_user_id_fkey (
          id,
          full_name,
          email
        )
      `)
      .eq('event_id', eventId)
      .eq('status', 'registered')
      .order('registered_at', { ascending: true });

    // Transform the data to match expected type (users is returned as array from Supabase)
    attendees = (attendeesList || []).map((attendee: any) => ({
      id: attendee.id,
      status: attendee.status,
      registered_at: attendee.registered_at,
      users: Array.isArray(attendee.users) ? attendee.users[0] : attendee.users,
    }));
  }

  return (
    <EventDetailClient
      event={event}
      attendeeCount={attendeeCount || 0}
      isRegistered={!!userRegistration && userRegistration.status === 'registered'}
      isHost={isHost}
      attendees={attendees}
    />
  );
}
