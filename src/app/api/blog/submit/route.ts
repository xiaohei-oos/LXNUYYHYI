import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// Convert string or array to text[] for PostgreSQL compatibility
function toArray(value: unknown): string[] | null {
  if (!value) return null;
  if (Array.isArray(value)) return value.filter(Boolean);
  if (typeof value === 'string') {
    return value.split(',').map(s => s.trim()).filter(Boolean);
  }
  return null;
}

// Convert HTML content to Markdown for react-markdown rendering
function htmlToMarkdown(html: string): string {
  // Already looks like Markdown (no HTML tags) - return as-is
  if (!/<[a-z][\s\S]*?>/i.test(html)) return html;

  let md = html;

  // Headings
  md = md.replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n\n');
  md = md.replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n\n');
  md = md.replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n\n');
  md = md.replace(/<h4[^>]*>(.*?)<\/h4>/gi, '#### $1\n\n');
  md = md.replace(/<h5[^>]*>(.*?)<\/h5>/gi, '##### $1\n\n');
  md = md.replace(/<h6[^>]*>(.*?)<\/h6>/gi, '###### $1\n\n');

  // Bold & italic
  md = md.replace(/<(strong|b)[^>]*>(.*?)<\/\1>/gi, '**$2**');
  md = md.replace(/<(em|i)[^>]*>(.*?)<\/\1>/gi, '*$2*');

  // Links
  md = md.replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, '[$2]($1)');

  // Images
  md = md.replace(/<img[^>]*src="([^"]*)"[^>]*alt="([^"]*)"[^>]*\/?>/gi, '![$2]($1)');
  md = md.replace(/<img[^>]*src="([^"]*)"[^>]*\/?>/gi, '![]($1)');

  // Blockquotes
  md = md.replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi, (_, content: string) => {
    return content.trim().split('\n').map((line: string) => `> ${line}`).join('\n') + '\n\n';
  });

  // Unordered lists
  md = md.replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1\n');

  // Ordered lists - convert li items to numbered
  md = md.replace(/<ol[^>]*>([\s\S]*?)<\/ol>/gi, (_match, content: string) => {
    let idx = 0;
    return content.replace(/- (.*?)\n/g, () => `${++idx}. ${content}\n`);
  });

  // Remove remaining list tags
  md = md.replace(/<\/?(ul|ol|li)[^>]*>/gi, '');

  // Paragraphs
  md = md.replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n');

  // Line breaks
  md = md.replace(/<br\s*\/?>/gi, '\n');

  // Horizontal rules
  md = md.replace(/<hr\s*\/?>/gi, '\n---\n\n');

  // Remove any remaining HTML tags
  md = md.replace(/<\/?[a-z][^>]*>/gi, '');

  // Decode common HTML entities
  md = md.replace(/&amp;/g, '&');
  md = md.replace(/&lt;/g, '<');
  md = md.replace(/&gt;/g, '>');
  md = md.replace(/&quot;/g, '"');
  md = md.replace(/&#39;/g, "'");
  md = md.replace(/&nbsp;/g, ' ');

  // Clean up excessive newlines
  md = md.replace(/\n{3,}/g, '\n\n');

  return md.trim();
}

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
    // Update usage stats asynchronously (don't block the request)
    supabase
      .from('blog_api_keys')
      .update({
        usage_count: (keyRecord.usage_count || 0) + 1,
        last_used_at: new Date().toISOString(),
      })
      .eq('id', keyRecord.id)
      .then(() => {}); // fire and forget

    return null; // valid
  }

  // 2. Fallback: check environment variable BLOG_API_KEY for backward compatibility
  const envApiKey = process.env.BLOG_API_KEY;
  if (envApiKey && providedKey === envApiKey) {
    return null; // valid
  }

  return NextResponse.json({ error: 'Invalid or inactive API key' }, { status: 403 });
}

// POST /api/blog/submit - Submit a new blog post (status = pending)
export async function POST(request: NextRequest) {
  // Validate API key
  const authError = await validateApiKey(request);
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
      content: htmlToMarkdown(content),
      status: 'pending',
      meta_description: meta_description || null,
      meta_keywords: toArray(meta_keywords),
      category: category || 'guides',
      tags: toArray(tags) || [],
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
