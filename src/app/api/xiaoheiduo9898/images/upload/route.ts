import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { ossUploadFile } from '@/storage/oss-client';
import { requireAdmin } from '../../_auth';

export async function POST(request: NextRequest) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const categoryId = formData.get('categoryId') as string;
    const categorySlug = formData.get('categorySlug') as string;
    const title = (formData.get('title') as string) || '';
    const titleCn = (formData.get('titleCn') as string) || '';

    if (!file || !categoryId || !categorySlug) {
      return NextResponse.json({ error: '缺少必要参数' }, { status: 400 });
    }

    // Read file buffer
    const fileBuffer = Buffer.from(await file.arrayBuffer());

    // Generate OSS key for HD image
    const sanitized = title.replace(/\.\w+$/, '').replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
    const timestamp = Date.now();
    const hdImageKey = `hd/${categorySlug}/${sanitized}-${timestamp}.jpg`;

    // Upload to Alibaba Cloud OSS
    await ossUploadFile({
      fileContent: fileBuffer,
      key: hdImageKey,
      contentType: file.type || 'image/jpeg',
    });

    // Also upload a thumbnail version (same file, different key prefix)
    const thumbnailKey = `thumbnails/${categorySlug}/${sanitized}-${timestamp}.jpg`;
    await ossUploadFile({
      fileContent: fileBuffer,
      key: thumbnailKey,
      contentType: file.type || 'image/jpeg',
    });

    // Generate thumbnail URL with OSS image processing
    const cdnDomain = `https://${process.env.OSS_BUCKET_NAME}.${process.env.OSS_ENDPOINT}`;
    const thumbnailUrl = `${cdnDomain}/${thumbnailKey}?x-oss-process=image/resize,w_600/quality,q_85`;

    // Insert into database
    const client = getSupabaseClient();
    const { data, error } = await client
      .from('vision_images')
      .insert({
        category_id: categoryId,
        title,
        title_cn: titleCn || null,
        hd_image_key: hdImageKey,
        thumbnail_url: thumbnailUrl,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Update category image_count
    const { data: catData } = await client
      .from('categories')
      .select('image_count')
      .eq('id', categoryId)
      .maybeSingle();

    if (catData) {
      await client
        .from('categories')
        .update({ image_count: catData.image_count + 1 })
        .eq('id', categoryId);
    }

    return NextResponse.json({ image: data });
  } catch (err) {
    console.error('Admin upload error:', err);
    return NextResponse.json({ error: '上传失败' }, { status: 500 });
  }
}
