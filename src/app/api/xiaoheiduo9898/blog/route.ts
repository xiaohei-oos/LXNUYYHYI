import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '../_auth';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// GET /api/xiaoheiduo9898/blog - List all blog posts (admin)
export async function GET(request: NextRequest) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  const supabase = getSupabaseClient();
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const page = parseInt(searchParams.get('page') || '1');
  const pageSize = parseInt(searchParams.get('pageSize') || '20');

  let query = supabase
    .from('blog_posts')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false });

  if (status) {
    query = query.eq('status', status);
  }

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  query = query.range(from, to);

  const { data, error, count } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ posts: data, total: count, page, pageSize });
}

// POST /api/xiaoheiduo9898/blog - Create a new blog post
export async function POST(request: NextRequest) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  const body = await request.json();
  const { title, slug, meta_description, meta_keywords, cover_image, content, category, tags, status, author } = body;

  if (!title || !slug) {
    return NextResponse.json({ error: 'Title and slug are required' }, { status: 400 });
  }

  const supabase = getSupabaseClient();

  // Check slug uniqueness
  const { data: existing } = await supabase
    .from('blog_posts')
    .select('id')
    .eq('slug', slug)
    .single();

  if (existing) {
    return NextResponse.json({ error: 'Slug already exists' }, { status: 409 });
  }

  const insertData: Record<string, unknown> = {
    title,
    slug,
    meta_description: meta_description || null,
    meta_keywords: meta_keywords || [],
    cover_image: cover_image || null,
    content: content || '',
    category: category || 'guides',
    tags: tags || [],
    status: status || 'draft',
    author: author || 'LXNUYYHYI',
  };

  if (insertData.status === 'published') {
    insertData.published_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from('blog_posts')
    .insert(insertData)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ post: data });
}
