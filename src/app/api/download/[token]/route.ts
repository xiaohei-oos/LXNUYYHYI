import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { S3Storage } from 'coze-coding-dev-sdk';

const storage = new S3Storage({
  endpointUrl: process.env.COZE_BUCKET_ENDPOINT_URL,
  accessKey: '',
  secretKey: '',
  bucketName: process.env.COZE_BUCKET_NAME,
  region: 'cn-beijing',
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const client = getSupabaseClient();

    // Find order by download token
    const { data: order, error: orderError } = await client
      .from('orders')
      .select('*')
      .eq('download_token', token)
      .maybeSingle();

    if (orderError || !order) {
      return NextResponse.json({ error: 'Invalid download link' }, { status: 404 });
    }

    // Check payment status
    if (order.status !== 'paid') {
      return NextResponse.json({ error: 'Payment not completed' }, { status: 403 });
    }

    // Check expiry
    if (order.download_expires_at && new Date(order.download_expires_at) < new Date()) {
      return NextResponse.json({ error: 'Download link has expired' }, { status: 410 });
    }

    // Check download count
    if (order.download_count >= order.max_downloads) {
      return NextResponse.json({ error: 'Maximum download limit reached' }, { status: 429 });
    }

    // Get image info
    const { data: image, error: imgError } = await client
      .from('vision_images')
      .select('hd_image_key, title')
      .eq('id', order.image_id)
      .maybeSingle();

    if (imgError || !image) {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 });
    }

    // Generate signed URL for HD image download
    const signedUrl = await storage.generatePresignedUrl({
      key: image.hd_image_key,
      expireTime: 300, // 5 minutes
    });

    // Update download count
    await client
      .from('orders')
      .update({
        download_count: order.download_count + 1,
        updated_at: new Date().toISOString(),
      })
      .eq('id', order.id);

    return NextResponse.json({ url: signedUrl });
  } catch (err) {
    console.error('Download error:', err);
    const message = err instanceof Error ? err.message : 'Download failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
