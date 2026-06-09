import { NextResponse } from 'next/server';
import { resolveImageUrl } from '@/storage/oss-client';

/**
 * Resolve OSS keys to signed URLs for client-side rendering
 * POST body: { keys: string[] }
 * Returns: { urls: string[] }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { keys } = body as { keys: string[] };

    if (!Array.isArray(keys)) {
      return NextResponse.json({ error: 'keys must be an array' }, { status: 400 });
    }

    const urls = await Promise.all(
      keys.map((key) => resolveImageUrl(key, 3600)) // 1 hour for admin
    );

    return NextResponse.json({ urls });
  } catch (err) {
    console.error('Resolve URLs error:', err);
    return NextResponse.json({ error: 'Failed to resolve URLs' }, { status: 500 });
  }
}
