import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

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

    const { event_id } = await request.json();

    if (!event_id) {
      return NextResponse.json(
        { error: 'Event ID is required' },
        { status: 400 }
      );
    }

    // Verify event exists and is not cancelled
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('id, max_attendees, status')
      .eq('id', event_id)
      .single();

    if (eventError || !event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    if (event.status === 'cancelled') {
      return NextResponse.json(
        { error: 'This event has been cancelled' },
        { status: 400 }
      );
    }

    // Check if event is full
    if (event.max_attendees) {
      const { count } = await supabase
        .from('event_attendees')
        .select('*', { count: 'exact', head: true })
        .eq('event_id', event_id)
        .eq('status', 'registered');

      if (count && count >= event.max_attendees) {
        return NextResponse.json(
          { error: 'Event is fully booked' },
          { status: 400 }
        );
      }
    }

    // Register for event
    const { data: registration, error } = await supabase
      .from('event_attendees')
      .insert({
        event_id: event_id,
        user_id: user.id,
        status: 'registered',
      })
      .select()
      .single();

    if (error) {
      // Check for unique constraint violation
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'You are already registered for this event' },
          { status: 400 }
        );
      }
      console.error('Error registering for event:', error);
      return NextResponse.json(
        { error: 'Failed to register for event' },
        { status: 500 }
      );
    }

    return NextResponse.json({ registration });
  } catch (error) {
    console.error('Event registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
