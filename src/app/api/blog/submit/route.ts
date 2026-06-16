import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// Validate BLOG_API_KEY from Authorization header
function validateApiKey(request: NextRequest): NextResponse | null {
  const apiKey = process.env.BLOG_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'BLOG_API_KEY not configured on server' }, { status: 500 });
  }

  const authHeader = request.headers.get('Authorization');
  if (!authHeader) {
    return NextResponse.json({ error: 'Missing Authorization header' }, { status: 401 });
  }

  const match = authHeader.match(/^Bearer\s+(.+)$/i);
  if (!match) {
    return NextResponse.json({ error: 'Invalid Authorization format. Use: Bearer <api-key>' }, { status: 401 });
  }

  if (match[1] !== apiKey) {
    return NextResponse.json({ error: 'Invalid API key' }, { status: 403 });
  }

  return null; // valid
}

// POST /api/blog/submit - Submit a new blog post (status = pending)
export async function POST(request: NextRequest) {
  // Validate API key
  const authError = validateApiKey(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const { title, slug, meta_description, meta_keywords, content, category, tags, cover_image, author } = body;

    // Required fields
    if (!title || !slug || !content) {
      return NextResponse.json(
        { error: `Missing required fields: ${[!title && 'title', !slug && 'slug', !content && 'content'].filter(Boolean).join(', ')}` },
        { status: 400 }
      );
    }

    // Validate slug format
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
      return NextResponse.json(
        { error: 'Invalid slug format. Use lowercase letters, numbers, and hyphens only (e.g., "how-to-create-vision-board")' },
        { status: 400 }
      );
    }

    // Check if slug already exists
    const supabase = getSupabaseClient();
    const { data: existing } = await supabase
      .from('blog_posts')
      .select('id, status')
      .eq('slug', slug)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: `Article with slug "${slug}" already exists (status: ${existing.status})` },
        { status: 409 }
      );
    }

    // Insert as pending
    const insertData: Record<string, unknown> = {
      title,
      slug,
      content,
      status: 'pending',
      meta_description: meta_description || null,
      meta_keywords: meta_keywords || null,
      category: category || 'guides',
      tags: tags || [],
      cover_image: cover_image || null,
      author: author || 'LXNUYYHYI',
    };

    const { data, error } = await supabase
      .from('blog_posts')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: `Database error: ${error.message}` }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Article submitted for review',
      post: {
        id: data.id,
        title: data.title,
        slug: data.slug,
        status: data.status,
        created_at: data.created_at,
      },
    }, { status: 201 });

  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
