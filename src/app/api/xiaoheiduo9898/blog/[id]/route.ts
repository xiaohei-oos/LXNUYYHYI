import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '../../_auth';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// GET /api/xiaoheiduo9898/blog/[id] - Get a single blog post (admin)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  const { id } = await params;
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }

  return NextResponse.json({ post: data });
}

// PUT /api/xiaoheiduo9898/blog/[id] - Update a blog post
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  const { id } = await params;
  const body = await request.json();
  const { title, slug, meta_description, meta_keywords, cover_image, content, category, tags, status, author } = body;

  const supabase = getSupabaseClient();

  // Get current post
  const { data: current } = await supabase
    .from('blog_posts')
    .select('status, slug')
    .eq('id', id)
    .single();

  if (!current) {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 });
  }

  // Check slug uniqueness if slug changed
  if (slug && slug !== current.slug) {
    const { data: existing } = await supabase
      .from('blog_posts')
      .select('id')
      .eq('slug', slug)
      .single();
    if (existing) {
      return NextResponse.json({ error: 'Slug already exists' }, { status: 409 });
    }
  }

  const updateData: Record<string, unknown> = {
    ...(title !== undefined && { title }),
    ...(slug !== undefined && { slug }),
    ...(meta_description !== undefined && { meta_description }),
    ...(meta_keywords !== undefined && { meta_keywords }),
    ...(cover_image !== undefined && { cover_image }),
    ...(content !== undefined && { content }),
    ...(category !== undefined && { category }),
    ...(tags !== undefined && { tags }),
    ...(status !== undefined && { status }),
    ...(author !== undefined && { author }),
    updated_at: new Date().toISOString(),
  };

  // Set published_at when publishing for the first time
  if (status === 'published' && current.status !== 'published') {
    updateData.published_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from('blog_posts')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ post: data });
}

// DELETE /api/xiaoheiduo9898/blog/[id] - Delete a blog post
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  const { id } = await params;
  const supabase = getSupabaseClient();

  const { error } = await supabase
    .from('blog_posts')
    .delete()
    .eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
