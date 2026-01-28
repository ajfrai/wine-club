import { NextResponse } from 'next/server';
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

export async function GET() {
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
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user's stripe customer ID
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('stripe_customer_id, has_payment_method')
      .eq('id', user.id)
      .single();

    if (userError || !userData) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    if (!userData.stripe_customer_id || !userData.has_payment_method) {
      return NextResponse.json({
        hasPaymentMethod: false,
        paymentMethod: null,
      });
    }

    // Get customer's default payment method from Stripe
    const customer = await stripe.customers.retrieve(userData.stripe_customer_id) as Stripe.Customer;

    if (customer.deleted) {
      return NextResponse.json({
        hasPaymentMethod: false,
        paymentMethod: null,
      });
    }

    const defaultPaymentMethodId = customer.invoice_settings?.default_payment_method;

    if (!defaultPaymentMethodId) {
      return NextResponse.json({
        hasPaymentMethod: false,
        paymentMethod: null,
      });
    }

    // Get payment method details
    const paymentMethod = await stripe.paymentMethods.retrieve(
      typeof defaultPaymentMethodId === 'string' ? defaultPaymentMethodId : defaultPaymentMethodId.id
    );

    // Format response based on payment method type
    let paymentInfo: {
      type: string;
      brand?: string;
      last4?: string;
      expMonth?: number;
      expYear?: number;
      wallet?: string;
      email?: string;
    } = {
      type: paymentMethod.type,
    };

    if (paymentMethod.type === 'card' && paymentMethod.card) {
      paymentInfo = {
        ...paymentInfo,
        brand: paymentMethod.card.brand,
        last4: paymentMethod.card.last4,
        expMonth: paymentMethod.card.exp_month,
        expYear: paymentMethod.card.exp_year,
        wallet: paymentMethod.card.wallet?.type || undefined,
      };
    } else if (paymentMethod.type === 'paypal' && paymentMethod.paypal) {
      paymentInfo = {
        ...paymentInfo,
        email: paymentMethod.paypal.payer_email || undefined,
      };
    } else if (paymentMethod.type === 'link' && paymentMethod.link) {
      paymentInfo = {
        ...paymentInfo,
        email: paymentMethod.link.email || undefined,
      };
    }

    return NextResponse.json({
      hasPaymentMethod: true,
      paymentMethod: paymentInfo,
    });
  } catch (error) {
    console.error('Get payment method error:', error);

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
      { error: error instanceof Error ? error.message : 'Failed to get payment method' },
      { status: 500 }
    );
  }
}
