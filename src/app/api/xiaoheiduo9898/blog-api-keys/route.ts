import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '../_auth';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// Generate a random API key
function generateApiKey(): string {
  const chars = '0123456789abcdef';
  let key = 'sk-blog-';
  for (let i = 0; i < 32; i++) {
    key += chars[Math.floor(Math.random() * chars.length)];
  }
  return key;
}

// GET - List all API keys
export async function GET(request: NextRequest) {
  const adminCheck = await requireAdmin(request);
  if (adminCheck) return adminCheck;

  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('blog_api_keys')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Mask API keys for listing (show only last 4 chars)
  const masked = data.map((key: Record<string, unknown>) => ({
    ...key,
    api_key_masked: `sk-blog-****${(key.api_key as string).slice(-4)}`,
  }));

  return NextResponse.json({ keys: masked });
}

// POST - Create a new API key
export async function POST(request: NextRequest) {
  const adminCheck = await requireAdmin(request);
  if (adminCheck) return adminCheck;

  const body = await request.json();
  const { name, notes } = body;

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 });
  }

  const apiKey = generateApiKey();

  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('blog_api_keys')
    .insert({
      name: name.trim(),
      api_key: apiKey,
      notes: notes?.trim() || null,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Return the full API key only on creation
  return NextResponse.json({
    key: data,
    api_key: apiKey, // Full key, only shown once
    message: 'Please copy the API key now. It will not be shown again.',
  });
}

// PUT - Toggle active status
export async function PUT(request: NextRequest) {
  const adminCheck = await requireAdmin(request);
  if (adminCheck) return adminCheck;

  const body = await request.json();
  const { id, is_active } = body;

  if (!id) {
    return NextResponse.json({ error: 'ID is required' }, { status: 400 });
  }

  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('blog_api_keys')
    .update({ is_active: !!is_active })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ key: data });
}

// DELETE - Delete an API key
export async function DELETE(request: NextRequest) {
  const adminCheck = await requireAdmin(request);
  if (adminCheck) return adminCheck;

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'ID is required' }, { status: 400 });
  }

  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from('blog_api_keys')
    .delete()
    .eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
