import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import {
  ossUploadFile,
  ossDeleteFile,
  ossGeneratePresignedUrl,
  isOssKey,
  resolveImageUrl,
} from '@/storage/oss-client';
import { ZipArchive } from 'archiver';

async function generateZipBuffer(
  images: { hd_image_key: string | null; title: string | null }[]
): Promise<Buffer> {
  return new Promise(async (resolve, reject) => {
    const chunks: Buffer[] = [];
    const archive = new ZipArchive({ zlib: { level: 6 } });

    archive.on('data', (chunk: Buffer) => chunks.push(chunk));
    archive.on('end', () => resolve(Buffer.concat(chunks)));
    archive.on('error', reject);

    const uniqueNames = new Set<string>();
    let successCount = 0;

    for (let idx = 0; idx < images.length; idx++) {
      const img = images[idx];
      const key = img.hd_image_key;
      if (!key) continue;

      try {
        let imageUrl: string;
        if (isOssKey(key)) {
          imageUrl = await ossGeneratePresignedUrl({ key, expireTime: 600 });
        } else {
          imageUrl = await resolveImageUrl(key);
        }

        const imgRes = await fetch(imageUrl, { signal: AbortSignal.timeout(30000) });
        if (!imgRes.ok) {
          console.error(`Failed to download image ${key}: ${imgRes.status}`);
          continue;
        }
        const imgBuffer = Buffer.from(await imgRes.arrayBuffer());

        const ext = key.split('.').pop() || 'jpg';
        let baseName = img.title || `image_${idx + 1}`;
        baseName = baseName.replace(/[/\\?%*:|"<>]/g, '-');
        let fileName = `${baseName}.${ext}`;

        let counter = 1;
        while (uniqueNames.has(fileName.toLowerCase())) {
          fileName = `${baseName}_${counter}.${ext}`;
          counter++;
        }
        uniqueNames.add(fileName.toLowerCase());

        archive.append(imgBuffer, { name: fileName });
        successCount++;
      } catch (err) {
        console.error(`Error processing image ${key}:`, err);
      }
    }

    if (successCount === 0) {
      reject(new Error('No images could be added to the ZIP'));
      return;
    }

    archive.finalize();
  });
}

export async function POST(request: Request) {
  try {
    const { requireAdmin } = await import('../../_auth');
    const authError = requireAdmin(request as any);
    if (authError) return authError;

    const body = await request.json();
    const { categoryId } = body;

    if (!categoryId) {
      return NextResponse.json({ error: 'Missing categoryId' }, { status: 400 });
    }

    const client = getSupabaseClient();

    const { data: category, error: catError } = await client
      .from('categories')
      .select('id, slug, name, zip_file_key')
      .eq('id', categoryId)
      .maybeSingle();

    if (catError || !category) {
      return NextResponse.json({ error: '分类不存在' }, { status: 404 });
    }

    const { data: images, error: imgError } = await client
      .from('vision_images')
      .select('hd_image_key, title')
      .eq('category_id', categoryId);

    if (imgError || !images || images.length === 0) {
      return NextResponse.json({ error: '该分类下没有图片' }, { status: 400 });
    }

    console.log(`[PackageGen] Generating ZIP for ${category.name} (${images.length} images)`);

    const zipBuffer = await generateZipBuffer(images);
    const zipSizeMB = (zipBuffer.length / 1024 / 1024).toFixed(2);
    console.log(`[PackageGen] ZIP generated: ${zipSizeMB} MB`);

    const zipKey = `zips/${category.slug}.zip`;
    await ossUploadFile({
      fileContent: zipBuffer,
      key: zipKey,
      contentType: 'application/zip',
    });

    console.log(`[PackageGen] ZIP uploaded to OSS: ${zipKey}`);

    // Delete old ZIP if key changed
    if (category.zip_file_key && category.zip_file_key !== zipKey) {
      try {
        await ossDeleteFile({ key: category.zip_file_key });
      } catch {
        // Ignore delete errors for old ZIP
      }
    }

    const { error: updateError } = await client
      .from('categories')
      .update({ zip_file_key: zipKey })
      .eq('id', categoryId);

    if (updateError) {
      console.error('Failed to update category zip_file_key:', updateError);
      return NextResponse.json({ error: '更新分类ZIP路径失败' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      zipKey,
      sizeMB: zipSizeMB,
      imageCount: images.length,
      message: `成功生成 ${category.name} 的ZIP包（${images.length}张图片，${zipSizeMB} MB）`,
    });
  } catch (err) {
    console.error('Package generation error:', err);
    return NextResponse.json(
      { error: '生成ZIP失败: ' + (err instanceof Error ? err.message : '未知错误') },
      { status: 500 }
    );
  }
}
