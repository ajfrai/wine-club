import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { data: host, error } = await supabase
      .from('hosts')
      .select('venmo_username, paypal_username, zelle_handle, accepts_cash, join_mode')
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching host settings:', error);
      return NextResponse.json(
        { error: 'Failed to fetch settings' },
        { status: 500 }
      );
    }

    if (!host) {
      return NextResponse.json(
        { error: 'Host profile not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ host });
  } catch (error) {
    console.error('Host settings fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { venmo_username, paypal_username, zelle_handle, accepts_cash, join_mode } = body;

    // Validate join_mode if provided
    if (join_mode && !['public', 'request', 'private'].includes(join_mode)) {
      return NextResponse.json(
        { error: 'Invalid join mode. Must be: public, request, or private' },
        { status: 400 }
      );
    }

    // Validate venmo_username: alphanumeric, underscores, hyphens, 5-30 chars, strip @ prefix
    let cleanedVenmo = venmo_username?.trim() || null;
    if (cleanedVenmo) {
      cleanedVenmo = cleanedVenmo.replace(/^@/, ''); // Strip @ prefix if present
      if (!/^[a-zA-Z0-9_-]{5,30}$/.test(cleanedVenmo)) {
        return NextResponse.json(
          { error: 'Venmo username must be 5-30 characters and contain only letters, numbers, underscores, or hyphens' },
          { status: 400 }
        );
      }
    }

    // Validate paypal_username: alphanumeric, underscores, hyphens, 3-20 chars
    let cleanedPaypal = paypal_username?.trim() || null;
    if (cleanedPaypal) {
      if (!/^[a-zA-Z0-9_-]{3,20}$/.test(cleanedPaypal)) {
        return NextResponse.json(
          { error: 'PayPal username must be 3-20 characters and contain only letters, numbers, underscores, or hyphens' },
          { status: 400 }
        );
      }
    }

    // Validate zelle_handle: valid email OR 10-digit phone
    let cleanedZelle = zelle_handle?.trim() || null;
    if (cleanedZelle) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const phoneRegex = /^\d{10}$/;
      // Normalize phone: remove all non-digits
      const normalizedPhone = cleanedZelle.replace(/\D/g, '');

      if (emailRegex.test(cleanedZelle)) {
        // Valid email, keep as-is
      } else if (phoneRegex.test(normalizedPhone)) {
        // Valid phone, store normalized
        cleanedZelle = normalizedPhone;
      } else {
        return NextResponse.json(
          { error: 'Zelle handle must be a valid email address or 10-digit phone number' },
          { status: 400 }
        );
      }
    }

    // Build update object with only provided fields
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (venmo_username !== undefined) updateData.venmo_username = cleanedVenmo;
    if (paypal_username !== undefined) updateData.paypal_username = cleanedPaypal;
    if (zelle_handle !== undefined) updateData.zelle_handle = cleanedZelle;
    if (accepts_cash !== undefined) updateData.accepts_cash = accepts_cash ?? false;
    if (join_mode !== undefined) updateData.join_mode = join_mode;

    const { data: host, error } = await supabase
      .from('hosts')
      .update(updateData)
      .eq('user_id', user.id)
      .select('venmo_username, paypal_username, zelle_handle, accepts_cash, join_mode')
      .single();

    if (error) {
      console.error('Error updating host settings:', error);
      return NextResponse.json(
        { error: 'Failed to update settings' },
        { status: 500 }
      );
    }

    return NextResponse.json({ host });
  } catch (error) {
    console.error('Host settings update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
