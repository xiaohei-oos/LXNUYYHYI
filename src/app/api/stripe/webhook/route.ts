import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getSupabaseClient } from '@/storage/database/supabase-client';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
  // @ts-expect-error Stripe API version
  apiVersion: '2025-04-30.basil',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature') || '';

  let event: Stripe.Event;

  try {
    if (webhookSecret) {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } else {
      // Fallback for development without webhook secret
      event = JSON.parse(body);
    }
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const sessionId = session.id;
    const paymentIntent = session.payment_intent as string;

    const client = getSupabaseClient();

    // Update order status to paid
    const { error } = await client
      .from('orders')
      .update({
        status: 'paid',
        stripe_payment_intent: paymentIntent,
        download_expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_session_id', sessionId);

    if (error) {
      console.error('Failed to update order:', error);
      return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
    }

    console.log(`Order paid: ${sessionId}`);
  }

  return NextResponse.json({ received: true });
}
