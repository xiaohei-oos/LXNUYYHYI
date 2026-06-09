import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { S3Storage } from 'coze-coding-dev-sdk';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const client = getSupabaseClient();

    // Find order by download token
    const { data: order, error } = await client
      .from('orders')
      .select('*')
      .eq('download_token', token)
      .maybeSingle();

    if (error || !order) {
      return NextResponse.json({ error: 'Invalid download link' }, { status: 404 });
    }

    if (order.status !== 'paid') {
      return NextResponse.json({ error: 'Payment not completed' }, { status: 403 });
    }

    if (order.download_count >= order.max_downloads) {
      return NextResponse.json({ error: 'Download limit reached' }, { status: 403 });
    }

    if (order.download_expires_at && new Date(order.download_expires_at) < new Date()) {
      return NextResponse.json({ error: 'Download link expired' }, { status: 403 });
    }

    // Get category zip file key
    const { data: category } = await client
      .from('categories')
      .select('zip_file_key, slug, name')
      .eq('id', order.category_id)
      .maybeSingle();

    if (!category?.zip_file_key) {
      return NextResponse.json({ error: 'Download file not available yet. Please contact support.' }, { status: 404 });
    }

    // Generate signed URL for download
    const storage = new S3Storage({
      endpointUrl: process.env.COZE_BUCKET_ENDPOINT_URL || '',
      accessKey: '',
      secretKey: '',
      bucketName: process.env.COZE_BUCKET_NAME || '',
      region: process.env.COZE_BUCKET_REGION || 'cn-beijing',
    });

    const downloadUrl = await storage.generatePresignedUrl({
      key: category.zip_file_key,
      expireTime: 3600,
    });

    // Update download count
    await client
      .from('orders')
      .update({
        download_count: order.download_count + 1,
        updated_at: new Date().toISOString(),
      })
      .eq('id', order.id);

    // Return JSON with download URL (frontend will handle the redirect via fetch+blob)
    return NextResponse.json({ downloadUrl, categoryName: category.name });
  } catch (err) {
    console.error('Download error:', err);
    return NextResponse.json({ error: 'Download failed' }, { status: 500 });
  }
}
