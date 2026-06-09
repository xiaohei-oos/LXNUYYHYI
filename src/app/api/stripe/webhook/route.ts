import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
  apiVersion: '2026-05-27.dahlia',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature || !webhookSecret) {
    return NextResponse.json({ error: 'Missing signature or webhook secret' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Invalid signature';
    console.error('Webhook signature verification failed:', message);
    return NextResponse.json({ error: message }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const client = getSupabaseClient();

    try {
      // Update order status
      const { data: order, error: fetchError } = await client
        .from('orders')
        .select('*')
        .eq('stripe_session_id', session.id)
        .maybeSingle();

      if (fetchError) {
        console.error('Failed to fetch order:', fetchError.message);
        return NextResponse.json({ error: 'Order not found' }, { status: 404 });
      }

      if (order) {
        const { error: updateError } = await client
          .from('orders')
          .update({
            status: 'paid',
            email: session.customer_details?.email || order.email,
            stripe_payment_intent: session.payment_intent as string,
            updated_at: new Date().toISOString(),
          })
          .eq('id', order.id);

        if (updateError) {
          console.error('Failed to update order:', updateError.message);
        }

        // Increment download count on image
        const { error: imgUpdateError } = await client
          .from('vision_images')
          .update({
            download_count: (order as { download_count?: number }).download_count || 0 + 1,
          })
          .eq('id', order.image_id);

        if (imgUpdateError) {
          console.error('Failed to update image download count:', imgUpdateError.message);
        }
      }
    } catch (err) {
      console.error('Webhook processing error:', err);
      return NextResponse.json({ error: 'Processing failed' }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}
