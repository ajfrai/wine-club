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

    // Get general charges for this member
    const { data: generalCharges, error: chargesError } = await supabase
      .from('charges')
      .select(`
        id,
        host_id,
        charge_type,
        title,
        description,
        amount,
        payment_status,
        payment_method,
        payment_date,
        due_date,
        hosts:host_id (
          user_id,
          host_code,
          users:user_id (
            full_name
          )
        )
      `)
      .eq('member_id', user.id)
      .order('created_at', { ascending: false });

    if (chargesError) {
      console.error('Error fetching charges:', chargesError);
    }

    // Get event payments for this member
    // First, find events from clubs the user is a member of
    const { data: memberships } = await supabase
      .from('memberships')
      .select('host_id')
      .eq('member_id', user.id)
      .eq('status', 'active');

    const hostIds = memberships?.map((m) => m.host_id) || [];
    let eventPayments: any[] = [];

    if (hostIds.length > 0) {
      // Get events from these hosts
      const { data: events } = await supabase
        .from('events')
        .select('id, title, event_date, host_id')
        .in('host_id', hostIds);

      const eventIds = events?.map((e) => e.id) || [];

      if (eventIds.length > 0) {
        // Get event payments for this user
        const { data: payments } = await supabase
          .from('event_payments')
          .select('*')
          .in('event_id', eventIds)
          .eq('user_id', user.id);

        // Create event lookup map
        const eventMap = new Map(events?.map((e) => [e.id, e]) || []);

        // Get host info for events
        const eventHostIds = [...new Set(events?.map((e) => e.host_id) || [])];
        const { data: hosts } = await supabase
          .from('hosts')
          .select('user_id, host_code, users:user_id(full_name)')
          .in('user_id', eventHostIds);

        const hostMap = new Map(hosts?.map((h) => [h.user_id, h]) || []);

        eventPayments = payments?.map((payment) => {
          const event = eventMap.get(payment.event_id);
          const host = event ? hostMap.get(event.host_id) : null;
          const hostUser = Array.isArray(host?.users) ? host.users[0] : host?.users;

          return {
            ...payment,
            event_title: event?.title || 'Unknown Event',
            event_date: event?.event_date || null,
            host_name: hostUser?.full_name || 'Unknown',
            host_code: host?.host_code || '',
          };
        }) || [];
      }
    }

    // Combine all charges
    const allCharges = [
      // General charges
      ...(generalCharges?.map((charge) => {
        const host = Array.isArray(charge.hosts) ? charge.hosts[0] : charge.hosts;
        const hostUser = host?.users ? (Array.isArray(host.users) ? host.users[0] : host.users) : null;

        return {
          id: charge.id,
          charge_type: charge.charge_type,
          title: charge.title,
          description: charge.description,
          host_name: hostUser?.full_name || 'Unknown',
          host_code: host?.host_code || '',
          amount: parseFloat(charge.amount),
          payment_status: charge.payment_status,
          payment_method: charge.payment_method,
          payment_date: charge.payment_date,
          due_date: charge.due_date,
          event_date: null,
        };
      }) || []),
      // Event payments
      ...(eventPayments?.map((payment) => ({
        id: payment.id,
        charge_type: 'event',
        title: payment.event_title,
        description: null,
        host_name: payment.host_name,
        host_code: payment.host_code,
        amount: parseFloat(payment.amount),
        payment_status: payment.payment_status,
        payment_method: payment.payment_method,
        payment_date: payment.payment_date,
        due_date: null,
        event_date: payment.event_date,
      })) || []),
    ];

    // Calculate summary
    const now = new Date();
    const thisYearStart = new Date(now.getFullYear(), 0, 1);

    const summary = {
      total_owed: allCharges
        .filter((c) => c.payment_status === 'pending')
        .reduce((sum, c) => sum + c.amount, 0),
      total_paid: allCharges
        .filter((c) => c.payment_status === 'paid' && new Date(c.payment_date || 0) >= thisYearStart)
        .reduce((sum, c) => sum + c.amount, 0),
      pending_count: allCharges.filter((c) => c.payment_status === 'pending').length,
      overdue_count: allCharges.filter((c) => {
        if (c.payment_status !== 'pending') return false;
        const dueDate = c.due_date || c.event_date;
        return dueDate && new Date(dueDate) < now;
      }).length,
    };

    return NextResponse.json({
      charges: allCharges,
      summary,
    });
  } catch (error) {
    console.error('Dues fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
