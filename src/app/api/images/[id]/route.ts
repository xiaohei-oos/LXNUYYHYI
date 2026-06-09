import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const client = getSupabaseClient();

    const { data, error } = await client
      .from('vision_images')
      .select('*, categories:category_id(name, slug)')
      .eq('id', id)
      .eq('status', 'active')
      .maybeSingle();

    if (error) throw new Error(`Failed to fetch image: ${error.message}`);
    if (!data) return NextResponse.json({ error: 'Image not found' }, { status: 404 });

    return NextResponse.json({ image: data });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to fetch image';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
