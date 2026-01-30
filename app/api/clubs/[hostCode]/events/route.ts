import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ hostCode: string }> }
) {
  try {
    const supabase = await createClient();
    const { hostCode } = await params;

    // Get host by host_code
    const { data: hostData, error: hostError } = await supabase
      .from('hosts')
      .select('user_id')
      .eq('host_code', hostCode)
      .single();

    if (hostError || !hostData) {
      return NextResponse.json(
        { error: 'Club not found' },
        { status: 404 }
      );
    }

    // Get upcoming events for this host
    const { data: events, error: eventsError } = await supabase
      .from('events')
      .select(`
        id,
        title,
        description,
        event_date,
        end_date,
        location,
        wines_theme,
        price,
        max_attendees
      `)
      .eq('host_id', hostData.user_id)
      .gte('event_date', new Date().toISOString())
      .order('event_date', { ascending: true });

    if (eventsError) {
      console.error('Events fetch error:', eventsError);
      return NextResponse.json(
        { error: 'Failed to fetch events' },
        { status: 500 }
      );
    }

    // Get attendee counts for each event
    const eventsWithCounts = await Promise.all(
      (events || []).map(async (event) => {
        const { count } = await supabase
          .from('event_registrations')
          .select('*', { count: 'exact', head: true })
          .eq('event_id', event.id)
          .eq('status', 'registered');

        return {
          ...event,
          attendee_count: count || 0,
        };
      })
    );

    return NextResponse.json({ events: eventsWithCounts });
  } catch (error) {
    console.error('Events fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
