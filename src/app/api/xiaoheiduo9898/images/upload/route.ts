import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { ossUploadFile, ossGeneratePresignedUrl } from '@/storage/oss-client';

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
    // In production, you'd resize the image. For now, upload the same file as thumbnail
    const thumbnailKey = `thumbnails/${categorySlug}/${sanitized}-${timestamp}.jpg`;
    await ossUploadFile({
      fileContent: fileBuffer,
      key: thumbnailKey,
      contentType: file.type || 'image/jpeg',
    });

    // Generate a signed URL for the thumbnail (for admin preview)
    const thumbnailSignedUrl = await ossGeneratePresignedUrl({
      key: thumbnailKey,
      expireTime: 86400, // 24 hours
    });

    // Save to database - store the OSS key (not the signed URL)
    // thumbnail_url stores the key, will be resolved to signed URL on page render
    const client = getSupabaseClient();
    const { error } = await client.from('vision_images').insert({
      title: title || file.name.replace(/\.\w+$/, '').replace(/[-_]/g, ' '),
      title_cn: titleCn || null,
      category_id: categoryId,
      thumbnail_url: thumbnailKey,
      hd_image_key: hdImageKey,
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
      hdImageKey,
      thumbnailKey,
      thumbnailUrl: thumbnailSignedUrl,
    });
  } catch (err) {
    console.error('上传失败:', err);
    return NextResponse.json({ error: '上传失败，请重试' }, { status: 500 });
  }
}
