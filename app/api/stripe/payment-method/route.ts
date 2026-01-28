import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@/lib/supabase/server';

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-12-15.clover',
  });
}

export async function GET() {
  const stripe = getStripe();
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
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get payment method' },
      { status: 500 }
    );
  }
}
