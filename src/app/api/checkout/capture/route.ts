import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

const PAYPAL_BASE = process.env.PAYPAL_MODE === 'live'
  ? 'https://api-m.paypal.com'
  : 'https://api-m.sandbox.paypal.com';

async function getPayPalAccessToken(): Promise<string> {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('PayPal credentials not configured');
  }

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  const res = await fetch(`${PAYPAL_BASE}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`PayPal auth failed: ${err}`);
  }

  const data = await res.json();
  return data.access_token;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token'); // PayPal order ID

    if (!token) {
      return NextResponse.json({ error: 'Missing token' }, { status: 400 });
    }

    const client = getSupabaseClient();

    // Check if order already captured (idempotency)
    const { data: existingOrder } = await client
      .from('orders')
      .select('*')
      .eq('stripe_session_id', token)
      .maybeSingle();

    if (existingOrder && existingOrder.status === 'paid') {
      return NextResponse.json({ order: existingOrder });
    }

    // Capture the PayPal payment
    const accessToken = await getPayPalAccessToken();

    const captureRes = await fetch(`${PAYPAL_BASE}/v2/checkout/orders/${token}/capture`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!captureRes.ok) {
      const err = await captureRes.text();
      console.error('PayPal capture error:', err);
      return NextResponse.json({ error: 'Payment capture failed' }, { status: 500 });
    }

    const captureData = await captureRes.json();

    // Extract payer email and capture ID
    const payerEmail = captureData.payer?.email_address || null;
    const captureId = captureData.purchase_units?.[0]?.payments?.captures?.[0]?.id || null;

    // Update order status to paid
    const { error } = await client
      .from('orders')
      .update({
        status: 'paid',
        email: payerEmail,
        stripe_payment_intent: captureId, // Stores PayPal capture ID
        download_expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_session_id', token);

    if (error) {
      console.error('Failed to update order:', error);
      return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
    }

    // Return the updated order
    const { data: order } = await client
      .from('orders')
      .select('*')
      .eq('stripe_session_id', token)
      .maybeSingle();

    return NextResponse.json({ order });
  } catch (err) {
    console.error('Capture error:', err);
    return NextResponse.json({ error: 'Payment verification failed' }, { status: 500 });
  }
}
