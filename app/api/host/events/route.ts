import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET - List all events for the host
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

    // Fetch all events created by this host
    const { data: events, error } = await supabase
      .from('events')
      .select(`
        *,
        event_attendees:event_attendees(count)
      `)
      .eq('host_id', user.id)
      .order('event_date', { ascending: true });

    if (error) {
      console.error('Error fetching events:', error);
      return NextResponse.json(
        { error: 'Failed to fetch events' },
        { status: 500 }
      );
    }

    // Format events with attendee count
    const formattedEvents = events.map(event => ({
      ...event,
      attendee_count: event.event_attendees?.[0]?.count || 0,
      event_attendees: undefined, // Remove the raw count data
    }));

    return NextResponse.json({ events: formattedEvents });
  } catch (error) {
    console.error('Error in GET /api/host/events:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create a new event
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      title,
      description,
      event_date,
      end_date,
      location,
      wines_theme,
      price,
      max_attendees,
      is_recurring,
    } = body;

    // Validate required fields
    if (!title || !event_date) {
      return NextResponse.json(
        { error: 'Title and event date are required' },
        { status: 400 }
      );
    }

    // Generate events array
    const eventsToCreate = [];
    const startDate = new Date(event_date);
    const endDateValue = end_date ? new Date(end_date) : null;
    const occurrences = is_recurring ? 52 : 1;

    for (let i = 0; i < occurrences; i++) {
      const eventDate = new Date(startDate);
      eventDate.setDate(startDate.getDate() + (i * 7)); // Add weeks

      let eventEndDate: Date | null = null;
      if (endDateValue) {
        eventEndDate = new Date(endDateValue);
        eventEndDate.setDate(endDateValue.getDate() + (i * 7));
      }

      eventsToCreate.push({
        title,
        description: description || null,
        event_date: eventDate.toISOString(),
        end_date: eventEndDate ? eventEndDate.toISOString() : null,
        location: location || null,
        wines_theme: wines_theme || null,
        price: price ?? null,
        max_attendees: max_attendees ?? null,
        host_id: user.id,
        is_recurring: is_recurring || false,
        status: 'scheduled',
      });
    }

    // Create event(s)
    const { data: events, error } = await supabase
      .from('events')
      .insert(eventsToCreate)
      .select();

    if (error) {
      console.error('Error creating event(s):', error);
      return NextResponse.json(
        { error: 'Failed to create event(s)' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      events,
      message: is_recurring ? `Created ${events.length} recurring events` : 'Event created'
    }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/host/events:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
