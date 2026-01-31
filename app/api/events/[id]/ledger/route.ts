import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify user is the host of this event
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('id, title, event_date, price, host_id')
      .eq('id', id)
      .single();

    if (eventError || !event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    if (event.host_id !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden - you are not the host of this event' },
        { status: 403 }
      );
    }

    // Get all attendees for this event
    const { data: attendees, error: attendeesError } = await supabase
      .from('event_attendees')
      .select(`
        id,
        user_id,
        status,
        users:user_id (
          id,
          full_name,
          email
        )
      `)
      .eq('event_id', id);

    if (attendeesError) {
      console.error('Error fetching attendees:', attendeesError);
      return NextResponse.json(
        { error: 'Failed to fetch attendees' },
        { status: 500 }
      );
    }

    // Get payment records for these attendees
    const userIds = attendees?.map((a) => a.user_id) || [];
    const { data: payments, error: paymentsError } = await supabase
      .from('event_payments')
      .select('*')
      .eq('event_id', id);

    if (paymentsError) {
      console.error('Error fetching payments:', paymentsError);
      return NextResponse.json(
        { error: 'Failed to fetch payments' },
        { status: 500 }
      );
    }

    // Create a map of user_id to payment
    const paymentMap = new Map(payments?.map((p) => [p.user_id, p]) || []);

    // Combine attendee and payment data
    const ledgerAttendees = attendees?.map((attendee) => {
      const payment = paymentMap.get(attendee.user_id);
      const userData = Array.isArray(attendee.users) ? attendee.users[0] : attendee.users;

      return {
        id: attendee.id,
        user_id: attendee.user_id,
        name: userData?.full_name || 'Unknown',
        email: userData?.email || '',
        rsvp_status: attendee.status || 'registered',
        payment_id: payment?.id || null,
        payment_status: payment?.payment_status || null,
        payment_amount: payment?.amount || event.price,
        payment_method: payment?.payment_method || null,
        payment_date: payment?.payment_date || null,
      };
    }) || [];

    // Calculate summary stats
    const paidCount = ledgerAttendees.filter((a) => a.payment_status === 'paid').length;
    const totalCollected = ledgerAttendees
      .filter((a) => a.payment_status === 'paid')
      .reduce((sum, a) => sum + (a.payment_amount || 0), 0);
    const totalExpected = event.price
      ? ledgerAttendees.filter((a) => a.rsvp_status !== 'cancelled').length * event.price
      : 0;

    return NextResponse.json({
      event_id: event.id,
      event_title: event.title,
      event_date: event.event_date,
      event_price: event.price,
      total_attendees: ledgerAttendees.filter((a) => a.rsvp_status !== 'cancelled').length,
      paid_count: paidCount,
      total_collected: totalCollected,
      total_expected: totalExpected,
      attendees: ledgerAttendees,
    });
  } catch (error) {
    console.error('Ledger fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
