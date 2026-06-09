import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { S3Storage } from 'coze-coding-dev-sdk';

export async function POST(request: Request) {
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

    // Generate S3 key for HD image
    const sanitized = title.replace(/\.\w+$/, '').replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
    const hdImageKey = `hd/${categorySlug}/${sanitized}-${Date.now()}.jpg`;

    // Upload to S3
    const storage = new S3Storage({
      endpointUrl: process.env.COZE_BUCKET_ENDPOINT_URL || '',
      accessKey: '',
      secretKey: '',
      bucketName: process.env.COZE_BUCKET_NAME || '',
      region: process.env.COZE_BUCKET_REGION || 'cn-beijing',
    });

    const uploadedKey = await storage.uploadFile({
      fileContent: fileBuffer,
      fileName: hdImageKey,
      contentType: file.type || 'image/jpeg',
    });

    // Generate a thumbnail URL using OSS image processing parameters
    // For now, use the same URL as thumbnail (will be resized via CSS on frontend)
    const thumbnailUrl = uploadedKey;

    // Save to database
    const client = getSupabaseClient();
    const { error } = await client.from('vision_images').insert({
      title: title || file.name.replace(/\.\w+$/, '').replace(/[-_]/g, ' '),
      title_cn: titleCn || null,
      category_id: categoryId,
      thumbnail_url: thumbnailUrl,
      hd_image_key: uploadedKey,
    });

    if (error) {
      console.error('数据库插入失败:', error);
      return NextResponse.json({ error: '数据库保存失败' }, { status: 500 });
    }

    // Update category image count
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

    return NextResponse.json({
      success: true,
      hdImageKey: uploadedKey,
      thumbnailUrl,
    });
  } catch (err) {
    console.error('上传失败:', err);
    return NextResponse.json({ error: '上传失败，请重试' }, { status: 500 });
  }
}
