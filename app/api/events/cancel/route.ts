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

    // Update registration status to cancelled
    const { error } = await supabase
      .from('event_attendees')
      .update({ status: 'cancelled' })
      .eq('event_id', event_id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error cancelling registration:', error);
      return NextResponse.json(
        { error: 'Failed to cancel registration' },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: 'Registration cancelled successfully' });
  } catch (error) {
    console.error('Event cancellation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
