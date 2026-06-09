import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getSupabaseClient } from '@/storage/database/supabase-client';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
  // @ts-expect-error Stripe API version
  apiVersion: '2025-04-30.basil',
});

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
      .select('id, name, price_cents')
      .eq('id', categoryId)
      .maybeSingle();

    if (catError || !category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    // Use price from database (prevent price tampering)
    const actualPrice = category.price_cents;

    // Create Stripe Checkout Session
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.COZE_PROJECT_DOMAIN_DEFAULT || 'http://localhost:5000';
    const baseUrl = siteUrl.startsWith('http') ? siteUrl : `https://${siteUrl}`;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${category.name} - Vision Board Pack`,
              description: `Complete collection of ${categoryName} vision board images. Instant download ZIP.`,
            },
            unit_amount: actualPrice,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/checkout/cancel`,
      metadata: {
        categoryId,
        categoryName,
      },
    });

    // Create pending order in database
    const { error: orderError } = await client.from('orders').insert({
      category_id: categoryId,
      category_name: category.name,
      amount_cents: actualPrice,
      stripe_session_id: session.id,
      status: 'pending',
    });

    if (orderError) {
      console.error('Failed to create order:', orderError);
    }

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error('Checkout error:', err);
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 });
  }
}
