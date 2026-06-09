import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
  apiVersion: '2026-05-27.dahlia',
});

export async function POST(request: NextRequest) {
  try {
    const { imageId } = await request.json();

    if (!imageId) {
      return NextResponse.json({ error: 'Image ID is required' }, { status: 400 });
    }

    const client = getSupabaseClient();

    // Fetch image details
    const { data: image, error: imgError } = await client
      .from('vision_images')
      .select('*')
      .eq('id', imageId)
      .eq('status', 'active')
      .maybeSingle();

    if (imgError || !image) {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 });
    }

    // Determine the site URL for redirects
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ||
      process.env.COZE_PROJECT_DOMAIN_DEFAULT ||
      'http://localhost:5000';

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: image.title,
              description: `Vision board printable - ${image.print_size} | ${image.description?.slice(0, 100)}`,
              images: [image.thumbnail_url],
            },
            unit_amount: image.price_cents,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${siteUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/checkout/cancel`,
      metadata: {
        image_id: image.id,
      },
    });

    // Create order record
    const { error: orderError } = await client.from('orders').insert({
      image_id: image.id,
      stripe_session_id: session.id,
      amount_cents: image.price_cents,
      currency: 'usd',
      status: 'pending',
      download_expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    });

    if (orderError) {
      console.error('Failed to create order:', orderError.message);
    }

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error('Checkout error:', err);
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
