import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const category = searchParams.get('category');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const featured = searchParams.get('featured');

    const client = getSupabaseClient();

    let query = client
      .from('vision_images')
      .select('*')
      .eq('status', 'active');

    if (category) {
      // Look up category ID by slug
      const { data: catData, error: catError } = await client
        .from('categories')
        .select('id')
        .eq('slug', category)
        .maybeSingle();

      if (catError) throw new Error(`Failed to fetch category: ${catError.message}`);
      if (catData) {
        query = query.eq('category_id', catData.id);
      }
    }

    if (featured === 'true') {
      query = query.eq('is_featured', true);
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error } = await query
      .order('is_featured', { ascending: false })
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) throw new Error(`Failed to fetch images: ${error.message}`);

    return NextResponse.json({ images: data, page, limit });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to fetch images';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
