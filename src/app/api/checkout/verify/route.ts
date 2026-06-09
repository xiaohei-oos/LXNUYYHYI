import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
  apiVersion: '2026-05-27.dahlia',
});

export async function GET(request: NextRequest) {
  try {
    const sessionId = request.nextUrl.searchParams.get('session_id');

    if (!sessionId) {
      return NextResponse.json({ error: 'Missing session_id' }, { status: 400 });
    }

    // Verify session with Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== 'paid') {
      return NextResponse.json({ error: 'Payment not completed' }, { status: 400 });
    }

    const client = getSupabaseClient();

    // Fetch order by session ID
    const { data: order, error: orderError } = await client
      .from('orders')
      .select('*, vision_images(id, title, thumbnail_url, print_size)')
      .eq('stripe_session_id', sessionId)
      .maybeSingle();

    if (orderError || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Update order status if still pending
    if (order.status === 'pending') {
      await client
        .from('orders')
        .update({
          status: 'paid',
          email: session.customer_details?.email || order.email,
          stripe_payment_intent: session.payment_intent as string,
          updated_at: new Date().toISOString(),
        })
        .eq('id', order.id);
    }

    const image = order.vision_images as unknown as {
      id: string;
      title: string;
      thumbnail_url: string;
      print_size: string;
    };

    return NextResponse.json({
      id: order.id,
      download_token: order.download_token,
      image: {
        id: image.id,
        title: image.title,
        thumbnail_url: image.thumbnail_url,
        print_size: image.print_size,
      },
    });
  } catch (err) {
    console.error('Verify error:', err);
    const message = err instanceof Error ? err.message : 'Verification failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
