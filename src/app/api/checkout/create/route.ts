import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// PayPal API base URL
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

export async function POST(request: Request) {
  try {
    const { categoryId, categoryName, priceCents } = await request.json();

    if (!categoryId || !categoryName || !priceCents) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Verify category exists and get actual price from database
    const client = getSupabaseClient();
    const { data: category, error: catError } = await client
      .from('categories')
      .select('id, name, price_cents, slug')
      .eq('id', categoryId)
      .maybeSingle();

    if (catError || !category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    // Verify price
    const actualPrice = category.price_cents;
    if (priceCents !== actualPrice) {
      return NextResponse.json({ error: 'Price mismatch' }, { status: 400 });
    }

    const priceUSD = (actualPrice / 100).toFixed(2);

    // Get PayPal access token
    const accessToken = await getPayPalAccessToken();

    // Get base URL - prefer env var, fallback to request origin
    const siteUrl = process.env.COZE_PROJECT_DOMAIN_DEFAULT || '';
    const baseUrl = siteUrl.startsWith('http') ? siteUrl : (siteUrl ? `https://${siteUrl}` : '');
    const finalBaseUrl = baseUrl || new URL(request.url).origin;

    const orderRes = await fetch(`${PAYPAL_BASE}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [
          {
            description: `${category.name} - Vision Board Pack (Instant Download)`,
            custom_id: categoryId,
            amount: {
              currency_code: 'USD',
              value: priceUSD,
            },
          },
        ],
        application_context: {
          brand_name: 'LXNUYYHYI',
          locale: 'en-US',
          landing_page: 'BILLING',
          user_action: 'PAY_NOW',
          return_url: `${finalBaseUrl}/checkout/success`,
          cancel_url: `${finalBaseUrl}/checkout/cancel`,
        },
      }),
    });

    if (!orderRes.ok) {
      const err = await orderRes.text();
      console.error('PayPal create order error:', err);
      return NextResponse.json({ error: 'Failed to create PayPal order' }, { status: 500 });
    }

    const orderData = await orderRes.json();
    const paypalOrderId = orderData.id;

    // Find the approval URL from links
    const approvalLink = orderData.links?.find((l: { rel: string; href: string }) => l.rel === 'approve');
    const approvalUrl = approvalLink?.href;

    if (!approvalUrl) {
      console.error('No approval link found in PayPal response:', JSON.stringify(orderData));
      return NextResponse.json({ error: 'Failed to get PayPal approval URL' }, { status: 500 });
    }

    // Create pending order in database
    const { error: orderError } = await client.from('orders').insert({
      category_id: categoryId,
      category_name: category.name,
      amount_cents: actualPrice,
      stripe_session_id: paypalOrderId, // Stores PayPal order ID
      status: 'pending',
    });

    if (orderError) {
      console.error('Failed to create order:', orderError);
      // Don't fail the request, the PayPal order is already created
    }

    return NextResponse.json({ url: approvalUrl });
  } catch (err) {
    console.error('Checkout error:', err);
    const message = err instanceof Error && err.message.includes('credentials')
      ? 'PayPal is not configured. Please contact support.'
      : 'Failed to create checkout session';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
