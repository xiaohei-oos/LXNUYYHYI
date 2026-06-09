import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const categorySlug = searchParams.get('category');
  const limit = parseInt(searchParams.get('limit') || '20', 10);
  const offset = parseInt(searchParams.get('offset') || '0', 10);

  const client = getSupabaseClient();

  let query = client
    .from('vision_images')
    .select('*, categories(name, slug)')
    .order('sort_order', { ascending: true })
    .range(offset, offset + limit - 1);

  if (categorySlug) {
    // First get category id
    const { data: cat } = await client
      .from('categories')
      .select('id')
      .eq('slug', categorySlug)
      .maybeSingle();

    if (cat) {
      query = query.eq('category_id', cat.id);
    }
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ images: data });
}
