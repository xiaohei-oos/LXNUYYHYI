import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const session_id = searchParams.get('session_id');

    if (!session_id) {
      return NextResponse.json({ error: 'Missing session_id' }, { status: 400 });
    }

    const client = getSupabaseClient();
    const { data: order, error } = await client
      .from('orders')
      .select('*')
      .eq('stripe_session_id', session_id)
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
