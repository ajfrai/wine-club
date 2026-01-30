import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    // Get user's memberships to find clubs they belong to
    const { data: memberships, error: membershipsError } = await supabase
      .from('memberships')
      .select('host_id')
      .eq('member_id', user.id)
      .eq('status', 'active');

    if (membershipsError) {
      console.error('Error fetching memberships:', membershipsError);
      return NextResponse.json(
        { error: 'Failed to fetch memberships' },
        { status: 500 }
      );
    }

    const hostIds = memberships?.map((m) => m.host_id) || [];

    if (hostIds.length === 0) {
      return NextResponse.json({ events: [] });
    }

    // Fetch upcoming events from user's clubs with host info and attendee count
    const { data: events, error } = await supabase
      .from('events')
      .select(`
        *,
        host:users!events_host_id_fkey(full_name),
        attendee_count:event_attendees(count)
      `)
      .in('host_id', hostIds)
      .eq('status', 'scheduled')
      .gte('event_date', new Date().toISOString())
      .order('event_date', { ascending: true })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching upcoming events:', error);
      return NextResponse.json(
        { error: 'Failed to fetch upcoming events' },
        { status: 500 }
      );
    }

    // Check if user is registered for each event
    const eventIds = events?.map((e) => e.id) || [];
    const { data: registrations } = await supabase
      .from('event_attendees')
      .select('event_id')
      .eq('user_id', user.id)
      .in('event_id', eventIds);

    const registeredEventIds = new Set(registrations?.map((r) => r.event_id) || []);

    // Enhance events with registration status and format attendee count
    const enhancedEvents = events?.map((event) => ({
      ...event,
      user_registered: registeredEventIds.has(event.id),
      attendee_count: event.attendee_count?.[0]?.count || 0,
      host: event.host?.[0] || null,
    })) || [];

    return NextResponse.json({ events: enhancedEvents });
  } catch (error) {
    console.error('Upcoming events fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
