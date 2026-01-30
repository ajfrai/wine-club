import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// PATCH - Update an event
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
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
      recurrence_count,
    } = body;

    // Verify event exists and user is the host
    const { data: existingEvent, error: fetchError } = await supabase
      .from('events')
      .select('id, host_id, is_recurring, recurrence_count, created_at')
      .eq('id', id)
      .single();

    if (fetchError || !existingEvent) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    if (existingEvent.host_id !== user.id) {
      return NextResponse.json(
        { error: 'You do not have permission to update this event' },
        { status: 403 }
      );
    }

    // Check if recurrence settings have changed
    const recurrenceChanged =
      is_recurring !== undefined &&
      (is_recurring !== existingEvent.is_recurring ||
       (is_recurring && recurrence_count !== existingEvent.recurrence_count));

    if (recurrenceChanged && existingEvent.is_recurring) {
      // When recurrence changes on a recurring event, we need to:
      // 1. Find all events in the same series (created together)
      // 2. Delete them all
      // 3. Recreate with new recurrence settings

      // Find all events in the same series (created within 1 second of each other)
      const createdAt = new Date(existingEvent.created_at);
      const createdAtStart = new Date(createdAt.getTime() - 1000);
      const createdAtEnd = new Date(createdAt.getTime() + 1000);

      const { data: seriesEvents, error: seriesError } = await supabase
        .from('events')
        .select('id')
        .eq('host_id', user.id)
        .eq('is_recurring', true)
        .gte('created_at', createdAtStart.toISOString())
        .lte('created_at', createdAtEnd.toISOString());

      if (seriesError) {
        console.error('Error finding series events:', seriesError);
        return NextResponse.json(
          { error: 'Failed to find series events' },
          { status: 500 }
        );
      }

      // Delete all events in the series
      const eventIds = seriesEvents?.map(e => e.id) || [];
      if (eventIds.length > 0) {
        const { error: deleteError } = await supabase
          .from('events')
          .delete()
          .in('id', eventIds);

        if (deleteError) {
          console.error('Error deleting series events:', deleteError);
          return NextResponse.json(
            { error: 'Failed to delete series events' },
            { status: 500 }
          );
        }
      }

      // Recreate series with new settings if still recurring
      if (is_recurring) {
        const eventsToCreate = [];
        const startDate = new Date(event_date);
        const endDateValue = end_date ? new Date(end_date) : null;
        const occurrences = recurrence_count || 12;

        for (let i = 0; i < occurrences; i++) {
          const eventDate = new Date(startDate);
          eventDate.setDate(startDate.getDate() + (i * 7));

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
            is_recurring: true,
            recurrence_count: occurrences,
            status: 'scheduled',
          });
        }

        const { data: newEvents, error: createError } = await supabase
          .from('events')
          .insert(eventsToCreate)
          .select();

        if (createError) {
          console.error('Error recreating series:', createError);
          return NextResponse.json(
            { error: 'Failed to recreate series' },
            { status: 500 }
          );
        }

        return NextResponse.json({
          events: newEvents,
          message: `Updated recurring series: ${newEvents.length} events`
        });
      } else {
        // If changing from recurring to non-recurring, create single event
        const { data: newEvent, error: createError } = await supabase
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
            is_recurring: false,
            recurrence_count: null,
            status: 'scheduled',
          })
          .select()
          .single();

        if (createError) {
          console.error('Error creating single event:', createError);
          return NextResponse.json(
            { error: 'Failed to create event' },
            { status: 500 }
          );
        }

        return NextResponse.json({ event: newEvent });
      }
    }

    // Normal update (no recurrence changes)
    const { data: event, error } = await supabase
      .from('events')
      .update({
        title,
        description: description || null,
        event_date,
        end_date: end_date || null,
        location: location || null,
        wines_theme: wines_theme || null,
        price: price ?? null,
        max_attendees: max_attendees ?? null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating event:', error);
      return NextResponse.json(
        { error: 'Failed to update event' },
        { status: 500 }
      );
    }

    return NextResponse.json({ event });
  } catch (error) {
    console.error('Error in PATCH /api/host/events/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete an event
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Verify event exists and user is the host
    const { data: existingEvent, error: fetchError } = await supabase
      .from('events')
      .select('id, host_id')
      .eq('id', id)
      .single();

    if (fetchError || !existingEvent) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    if (existingEvent.host_id !== user.id) {
      return NextResponse.json(
        { error: 'You do not have permission to delete this event' },
        { status: 403 }
      );
    }

    // Delete event (CASCADE will delete attendees)
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting event:', error);
      return NextResponse.json(
        { error: 'Failed to delete event' },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Error in DELETE /api/host/events/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
