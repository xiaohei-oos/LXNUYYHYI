import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '../_auth';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// GET /api/xiaoheiduo9898/blog-settings - Get auto-publish settings
export async function GET(request: NextRequest) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('blog_settings')
    .select('*')
    .eq('id', 1)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Also get pending count
  const { count: pendingCount } = await supabase
    .from('blog_posts')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending');

  return NextResponse.json({
    settings: data,
    pendingCount: pendingCount || 0,
  });
}

// PUT /api/xiaoheiduo9898/blog-settings - Update auto-publish settings
export async function PUT(request: NextRequest) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const { auto_publish_enabled, auto_publish_interval_hours, auto_publish_count } = body;

    const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() };

    if (typeof auto_publish_enabled === 'boolean') {
      updateData.auto_publish_enabled = auto_publish_enabled;
    }
    if (typeof auto_publish_interval_hours === 'number' && auto_publish_interval_hours >= 1) {
      updateData.auto_publish_interval_hours = auto_publish_interval_hours;
    }
    if (typeof auto_publish_count === 'number' && auto_publish_count >= 1) {
      updateData.auto_publish_count = auto_publish_count;
    }

    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('blog_settings')
      .update(updateData)
      .eq('id', 1)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ settings: data });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
