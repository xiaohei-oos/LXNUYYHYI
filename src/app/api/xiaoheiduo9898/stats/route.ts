import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { requireAdmin } from '../_auth';

export async function GET(request: NextRequest) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  try {
    const client = getSupabaseClient();

    const [imagesRes, ordersRes, paidOrdersRes] = await Promise.all([
      client.from('vision_images').select('id', { count: 'exact', head: true }),
      client.from('orders').select('id', { count: 'exact', head: true }),
      client.from('orders').select('amount_cents').eq('status', 'paid'),
    ]);

    const totalRevenue = (paidOrdersRes.data || []).reduce((sum: number, o: { amount_cents: number }) => sum + o.amount_cents, 0);

    return NextResponse.json({
      totalImages: imagesRes.count || 0,
      totalOrders: ordersRes.count || 0,
      totalRevenue,
      paidOrders: paidOrdersRes.data?.length || 0,
    });
  } catch (err) {
    console.error('Stats error:', err);
    return NextResponse.json({ totalImages: 0, totalOrders: 0, totalRevenue: 0, paidOrders: 0 }, { status: 500 });
  }
}
