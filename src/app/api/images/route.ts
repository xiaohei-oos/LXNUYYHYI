import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { resolveImageUrl } from '@/storage/oss-client';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const categorySlug = searchParams.get('category');
  const limit = parseInt(searchParams.get('limit') || '24', 10);
  const offset = parseInt(searchParams.get('offset') || '0', 10);
  const resolve = searchParams.get('resolve') !== 'false'; // default: resolve URLs

  const client = getSupabaseClient();

  // First, get total count if this is the first page
  let totalCount: number | null = null;
  if (offset === 0 && categorySlug) {
    const { data: cat } = await client
      .from('categories')
      .select('image_count')
      .eq('slug', categorySlug)
      .maybeSingle();
    if (cat) {
      totalCount = cat.image_count;
    }
  }

  let query = client
    .from('vision_images')
    .select('id, title, thumbnail_url, sort_order')
    .order('sort_order', { ascending: true })
    .range(offset, offset + limit - 1);

  if (categorySlug) {
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

  // Resolve thumbnail URLs to signed URLs
  let images = data || [];
  if (resolve && images.length > 0) {
    const resolvedImages = await Promise.all(
      images.map(async (img: { id: string; title: string; thumbnail_url: string; sort_order: number }) => ({
        ...img,
        thumbnail_url: await resolveImageUrl(img.thumbnail_url, 86400),
      }))
    );
    images = resolvedImages;
  }

  return NextResponse.json({
    images,
    total: totalCount,
    hasMore: totalCount !== null ? offset + limit < totalCount : images.length === limit,
  });
}
