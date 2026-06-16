import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// GET /api/blog/auto-publish - Cron job endpoint for auto-publishing pending posts
// Called by Vercel Cron every hour. Checks blog_settings and publishes if interval has elapsed.
export async function GET(request: NextRequest) {
  // Validate cron secret
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get('Authorization');
  const urlSecret = new URL(request.url).searchParams.get('secret');

  if (cronSecret) {
    const providedSecret = authHeader?.replace(/^Bearer\s+/i, '') || urlSecret;
    if (providedSecret !== cronSecret) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  try {
    const supabase = getSupabaseClient();

    // Read settings
    const { data: settings, error: settingsError } = await supabase
      .from('blog_settings')
      .select('*')
      .eq('id', 1)
      .single();

    if (settingsError || !settings) {
      return NextResponse.json({ error: 'Failed to read blog settings', details: settingsError?.message }, { status: 500 });
    }

    // Check if auto-publish is enabled
    if (!settings.auto_publish_enabled) {
      return NextResponse.json({ message: 'Auto-publish is disabled', published: 0 });
    }

    // Check if enough time has elapsed since last auto-publish
    const now = new Date();
    const lastPublish = settings.last_auto_publish_at ? new Date(settings.last_auto_publish_at) : null;
    const intervalMs = settings.auto_publish_interval_hours * 60 * 60 * 1000;

    if (lastPublish && (now.getTime() - lastPublish.getTime()) < intervalMs) {
      const remainingMs = intervalMs - (now.getTime() - lastPublish.getTime());
      const remainingHours = (remainingMs / (60 * 60 * 1000)).toFixed(1);
      return NextResponse.json({
        message: `Not yet time. ${remainingHours} hours remaining.`,
        published: 0,
        next_publish_at: new Date(lastPublish.getTime() + intervalMs).toISOString(),
      });
    }

    // Find pending posts to publish (oldest first)
    const count = settings.auto_publish_count || 1;
    const { data: pendingPosts, error: fetchError } = await supabase
      .from('blog_posts')
      .select('id, slug, title')
      .eq('status', 'pending')
      .order('created_at', { ascending: true })
      .limit(count);

    if (fetchError) {
      return NextResponse.json({ error: 'Failed to fetch pending posts', details: fetchError.message }, { status: 500 });
    }

    if (!pendingPosts || pendingPosts.length === 0) {
      // Update last_auto_publish_at even if nothing to publish
      await supabase
        .from('blog_settings')
        .update({ last_auto_publish_at: now.toISOString(), updated_at: now.toISOString() })
        .eq('id', 1);

      return NextResponse.json({ message: 'No pending posts to publish', published: 0 });
    }

    // Publish them
    const postIds = pendingPosts.map((p: { id: string }) => p.id);
    const { error: publishError } = await supabase
      .from('blog_posts')
      .update({
        status: 'published',
        published_at: now.toISOString(),
        reviewed_at: now.toISOString(),
        updated_at: now.toISOString(),
      })
      .in('id', postIds);

    if (publishError) {
      return NextResponse.json({ error: 'Failed to publish posts', details: publishError.message }, { status: 500 });
    }

    // Update last_auto_publish_at
    await supabase
      .from('blog_settings')
      .update({ last_auto_publish_at: now.toISOString(), updated_at: now.toISOString() })
      .eq('id', 1);

    return NextResponse.json({
      message: `Auto-published ${pendingPosts.length} post(s)`,
      published: pendingPosts.length,
      posts: pendingPosts.map((p: { id: string; slug: string; title: string }) => ({
        id: p.id,
        slug: p.slug,
        title: p.title,
      })),
      next_publish_at: new Date(now.getTime() + intervalMs).toISOString(),
    });

  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
