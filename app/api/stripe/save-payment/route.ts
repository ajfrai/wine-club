import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@/lib/supabase/server';

function getStripe() {
  const secretKey = process.env.STRIPE_SECRET_KEY;

  if (!secretKey) {
    throw new Error('STRIPE_SECRET_KEY environment variable is not set');
  }

  if (!secretKey.startsWith('sk_')) {
    throw new Error('Invalid STRIPE_SECRET_KEY format - must start with sk_test_ or sk_live_');
  }

  return new Stripe(secretKey, {
    apiVersion: '2025-12-15.clover',
  });
}

export async function POST(req: NextRequest) {
  let stripe: Stripe;

  try {
    stripe = getStripe();
  } catch (error) {
    console.error('Stripe initialization error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to initialize Stripe' },
      { status: 500 }
    );
  }

  const supabase = await createClient();

  try {
    const { userId, paymentMethodId } = await req.json();

    if (!userId || !paymentMethodId) {
      return NextResponse.json(
        { error: 'User ID and payment method ID are required' },
        { status: 400 }
      );
    }

    // Get user data with stripe customer ID
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('stripe_customer_id')
      .eq('id', userId)
      .single();

    if (userError || !user || !user.stripe_customer_id) {
      return NextResponse.json(
        { error: 'User or Stripe customer not found' },
        { status: 404 }
      );
    }

    // Attach payment method to customer
    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: user.stripe_customer_id,
    });

    // Set as default payment method
    await stripe.customers.update(user.stripe_customer_id, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });

    // Update user record
    const { error: updateError } = await supabase
      .from('users')
      .update({
        has_payment_method: true,
        payment_setup_completed_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to update user payment status' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Payment method saved successfully',
    });
  } catch (error) {
    console.error('Save payment method error:', error);

    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json(
        {
          error: error.message,
          type: error.type,
          code: error.code,
        },
        { status: error.statusCode || 500 }
      );
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to save payment method' },
      { status: 500 }
    );
  }
}
