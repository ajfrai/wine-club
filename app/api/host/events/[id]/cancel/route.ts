import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// POST - Cancel an event
export async function POST(
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

    // Verify the event exists and belongs to the host
    const { data: event, error: fetchError } = await supabase
      .from('events')
      .select('*')
      .eq('id', id)
      .eq('host_id', user.id)
      .single();

    if (fetchError || !event) {
      return NextResponse.json(
        { error: 'Event not found or unauthorized' },
        { status: 404 }
      );
    }

    // Update event status to cancelled
    const { data: updatedEvent, error: updateError } = await supabase
      .from('events')
      .update({
        status: 'cancelled',
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Error cancelling event:', updateError);
      return NextResponse.json(
        { error: 'Failed to cancel event' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      event: updatedEvent,
      message: 'Event cancelled successfully'
    });
  } catch (error) {
    console.error('Error in POST /api/host/events/[id]/cancel:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
