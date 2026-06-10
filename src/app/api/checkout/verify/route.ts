import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// Verify order by PayPal order ID (stored in stripe_session_id field)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token'); // PayPal order ID

    if (!token) {
      return NextResponse.json({ error: 'Missing token' }, { status: 400 });
    }

    const client = getSupabaseClient();
    const { data: order, error } = await client
      .from('orders')
      .select('*')
      .eq('stripe_session_id', token)
      .maybeSingle();

    if (error || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({ order });
  } catch (err) {
    console.error('Verify error:', err);
    return NextResponse.json({ error: 'Failed to verify order' }, { status: 500 });
  }
}
