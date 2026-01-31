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

    // Get all charges created by this host (general charges and expenses)
    const { data: generalCharges, error: chargesError } = await supabase
      .from('charges')
      .select(`
        id,
        charge_type,
        title,
        amount,
        payment_status,
        payment_method,
        payment_date,
        due_date,
        member_id,
        transaction_type,
        users:member_id (
          full_name,
          email
        )
      `)
      .eq('host_id', user.id)
      .order('created_at', { ascending: false });

    if (chargesError) {
      console.error('Error fetching charges:', chargesError);
    }

    // Get all event payments for this host's events
    const { data: events, error: eventsError } = await supabase
      .from('events')
      .select('id, title, event_date, price')
      .eq('host_id', user.id);

    if (eventsError) {
      console.error('Error fetching events:', eventsError);
    }

    const eventIds = events?.map((e) => e.id) || [];
    let eventPayments: any[] = [];

    if (eventIds.length > 0) {
      const { data, error: paymentsError } = await supabase
        .from('event_payments')
        .select(`
          id,
          event_id,
          user_id,
          amount,
          payment_status,
          payment_method,
          payment_date,
          users:user_id (
            full_name,
            email
          )
        `)
        .in('event_id', eventIds);

      if (paymentsError) {
        console.error('Error fetching event payments:', paymentsError);
      } else {
        eventPayments = data || [];
      }
    }

    // Create event lookup map
    const eventMap = new Map(events?.map((e) => [e.id, e]) || []);

    // Combine all charges
    const allCharges = [
      // General charges and expenses
      ...(generalCharges?.map((charge) => {
        const userData = Array.isArray(charge.users) ? charge.users[0] : charge.users;
        return {
          id: charge.id,
          charge_type: charge.charge_type,
          title: charge.title,
          member_name: userData?.full_name || null,
          member_email: userData?.email || null,
          amount: parseFloat(charge.amount),
          payment_status: charge.payment_status,
          payment_method: charge.payment_method,
          payment_date: charge.payment_date,
          due_date: charge.due_date,
          event_date: null,
          transaction_type: charge.transaction_type || 'charge',
        };
      }) || []),
      // Event payments (always charges, never expenses)
      ...(eventPayments?.map((payment) => {
        const event = eventMap.get(payment.event_id);
        const userData = Array.isArray(payment.users) ? payment.users[0] : payment.users;
        return {
          id: payment.id,
          charge_type: 'event',
          title: event?.title || 'Unknown Event',
          member_name: userData?.full_name || 'Unknown',
          member_email: userData?.email || '',
          amount: parseFloat(payment.amount),
          payment_status: payment.payment_status,
          payment_method: payment.payment_method,
          payment_date: payment.payment_date,
          due_date: null,
          event_date: event?.event_date || null,
          transaction_type: 'charge',
        };
      }) || []),
    ];

    // Calculate summary with separate charges and expenses
    const charges = allCharges.filter((c) => c.transaction_type === 'charge');
    const expenses = allCharges.filter((c) => c.transaction_type === 'expense');

    const summary = {
      // Total charges (money owed to club)
      total_charges: charges.reduce((sum, c) => sum + c.amount, 0),
      total_charges_paid: charges
        .filter((c) => c.payment_status === 'paid')
        .reduce((sum, c) => sum + c.amount, 0),
      total_charges_unpaid: charges
        .filter((c) => c.payment_status === 'pending')
        .reduce((sum, c) => sum + c.amount, 0),

      // Total expenses (money club owes to members)
      total_expenses: expenses.reduce((sum, c) => sum + c.amount, 0),
      total_expenses_covered: expenses
        .filter((c) => c.payment_status === 'paid')
        .reduce((sum, c) => sum + c.amount, 0),
      total_expenses_uncovered: expenses
        .filter((c) => c.payment_status === 'pending')
        .reduce((sum, c) => sum + c.amount, 0),

      // Net balance (positive means club has money, negative means club owes money)
      net_balance: charges.reduce((sum, c) => sum + c.amount, 0) - expenses.reduce((sum, c) => sum + c.amount, 0),

      // Legacy fields for backward compatibility
      total_paid: allCharges
        .filter((c) => c.payment_status === 'paid')
        .reduce((sum, c) => sum + c.amount, 0),
      total_pending: allCharges
        .filter((c) => c.payment_status === 'pending')
        .reduce((sum, c) => sum + c.amount, 0),
      paid_count: allCharges.filter((c) => c.payment_status === 'paid').length,
      pending_count: allCharges.filter((c) => c.payment_status === 'pending').length,
    };

    return NextResponse.json({
      charges: allCharges,
      summary,
    });
  } catch (error) {
    console.error('Ledger fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
