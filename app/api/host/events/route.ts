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
    } = body;

    // Validate required fields
    if (!title || !event_date) {
      return NextResponse.json(
        { error: 'Title and event date are required' },
        { status: 400 }
      );
    }

    // Create event
    const { data: event, error } = await supabase
      .from('events')
      .insert({
        title,
        description: description || null,
        event_date,
        end_date: end_date || null,
        location: location || null,
        wines_theme: wines_theme || null,
        price: price ?? null,
        max_attendees: max_attendees ?? null,
        host_id: user.id,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating event:', error);
      return NextResponse.json(
        { error: 'Failed to create event' },
        { status: 500 }
      );
    }

    return NextResponse.json({ event }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/host/events:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
