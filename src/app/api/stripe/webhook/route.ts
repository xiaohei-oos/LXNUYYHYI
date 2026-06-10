import { NextResponse } from 'next/server';

// PayPal uses capture flow instead of webhooks
// This endpoint is kept for compatibility but no longer processes Stripe events
export async function POST() {
  return NextResponse.json({ received: true });
}

export async function GET() {
  return NextResponse.json({ status: 'ok', provider: 'paypal' });
}
