import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// Validate API key from Authorization header against database + env fallback
async function validateApiKey(request: NextRequest): Promise<NextResponse | null> {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader) {
    return NextResponse.json({ error: 'Missing Authorization header' }, { status: 401 });
  }

  const match = authHeader.match(/^Bearer\s+(.+)$/i);
  if (!match) {
    return NextResponse.json({ error: 'Invalid Authorization format. Use: Bearer <api-key>' }, { status: 401 });
  }

  const providedKey = match[1];

  // 1. Check against database keys first
  const supabase = getSupabaseClient();
  const { data: keyRecord, error } = await supabase
    .from('blog_api_keys')
    .select('id, is_active, usage_count')
    .eq('api_key', providedKey)
    .eq('is_active', true)
    .single();

  if (!error && keyRecord) {
    // Update usage stats asynchronously
    supabase
      .from('blog_api_keys')
      .update({
        usage_count: (keyRecord.usage_count || 0) + 1,
        last_used_at: new Date().toISOString(),
      })
      .eq('id', keyRecord.id)
      .then(() => {});

    return null; // valid
  }

  // 2. Fallback: check environment variable
  const envApiKey = process.env.BLOG_API_KEY;
  if (envApiKey && providedKey === envApiKey) {
    return null;
  }

  return NextResponse.json({ error: 'Invalid or inactive API key' }, { status: 403 });
}

// PUT /api/blog/submit/[slug] - Update an existing blog post by slug (keeps current status or resets to pending)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  // Validate API key
  const authError = await validateApiKey(request);
  if (authError) return authError;

  try {
    const { slug } = await params;
    const body = await request.json();

    const supabase = getSupabaseClient();

    // Check if the post exists
    const { data: existing, error: findError } = await supabase
      .from('blog_posts')
      .select('id, status')
      .eq('slug', slug)
      .single();

    if (findError || !existing) {
      return NextResponse.json(
        { error: `Article with slug "${slug}" not found` },
        { status: 404 }
      );
    }

    // Build update data - only update provided fields
    const updateData: Record<string, unknown> = {};

    const allowedFields = ['title', 'content', 'meta_description', 'meta_keywords', 'category', 'tags', 'cover_image', 'author'];
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    // If post was previously rejected (draft with rejected_reason), reset to pending on re-submit
    if (existing.status === 'draft') {
      updateData.status = 'pending';
      updateData.rejected_reason = null;
    }

    // If post is published and content is changed, keep it published (author can decide to unpublish via admin)
    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('blog_posts')
      .update(updateData)
      .eq('id', existing.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: `Database error: ${error.message}` }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Article updated successfully',
      post: {
        id: data.id,
        title: data.title,
        slug: data.slug,
        status: data.status,
        updated_at: data.updated_at,
      },
    });

  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
