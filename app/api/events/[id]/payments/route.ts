import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(
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
      .select('id, host_id, price')
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

    const body = await request.json();
    const { user_id, payment_method, payment_status, payment_date, amount } = body;

    // Create or update payment record
    const { data: payment, error: paymentError } = await supabase
      .from('event_payments')
      .upsert({
        event_id: id,
        user_id,
        amount: amount || event.price,
        payment_status: payment_status || 'paid',
        payment_method,
        payment_date: payment_date || new Date().toISOString(),
      }, {
        onConflict: 'event_id,user_id',
      })
      .select()
      .single();

    if (paymentError) {
      console.error('Error creating payment:', paymentError);
      return NextResponse.json(
        { error: 'Failed to create payment record' },
        { status: 500 }
      );
    }

    return NextResponse.json({ payment });
  } catch (error) {
    console.error('Payment creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
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
      .select('id, host_id, price')
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

    const body = await request.json();
    const { payment_id, user_id, payment_method, payment_status, payment_date, amount } = body;

    // Build update object
    const updates: any = {};
    if (payment_method !== undefined) updates.payment_method = payment_method;
    if (payment_status !== undefined) updates.payment_status = payment_status;
    if (payment_date !== undefined) updates.payment_date = payment_date;
    if (amount !== undefined) updates.amount = amount;

    let payment;

    if (payment_id) {
      // Update existing payment by ID
      const { data, error: updateError } = await supabase
        .from('event_payments')
        .update(updates)
        .eq('id', payment_id)
        .eq('event_id', id)
        .select()
        .single();

      if (updateError) {
        console.error('Error updating payment:', updateError);
        return NextResponse.json(
          { error: 'Failed to update payment record' },
          { status: 500 }
        );
      }
      payment = data;
    } else if (user_id) {
      // Create or update by user_id
      const { data, error: upsertError } = await supabase
        .from('event_payments')
        .upsert({
          event_id: id,
          user_id,
          amount: amount || event.price,
          ...updates,
        }, {
          onConflict: 'event_id,user_id',
        })
        .select()
        .single();

      if (upsertError) {
        console.error('Error upserting payment:', upsertError);
        return NextResponse.json(
          { error: 'Failed to update payment record' },
          { status: 500 }
        );
      }
      payment = data;
    } else {
      return NextResponse.json(
        { error: 'Either payment_id or user_id is required' },
        { status: 400 }
      );
    }

    return NextResponse.json({ payment });
  } catch (error) {
    console.error('Payment update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
