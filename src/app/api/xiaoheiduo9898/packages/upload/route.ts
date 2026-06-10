import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { ossUploadFile } from '@/storage/oss-client';
import { requireAdmin } from '../../_auth';

/**
 * Upload ZIP package for a category
 * POST /api/xiaoheiduo9898/packages/upload
 * FormData: file (ZIP), categoryId
 */
/**
 * Delete ZIP package for a category
 * DELETE /api/xiaoheiduo9898/packages/upload?categoryId=xxx
 */
export async function DELETE(request: NextRequest) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId');

    if (!categoryId) {
      return NextResponse.json({ error: '缺少 categoryId' }, { status: 400 });
    }

    const client = getSupabaseClient();

    // Get category info
    const { data: category, error: catError } = await client
      .from('categories')
      .select('id, name, zip_file_key')
      .eq('id', categoryId)
      .maybeSingle();

    if (catError || !category) {
      return NextResponse.json({ error: '分类不存在' }, { status: 404 });
    }

    if (!category.zip_file_key) {
      return NextResponse.json({ error: '该分类没有ZIP包' }, { status: 400 });
    }

    // Delete from OSS
    try {
      const { ossDeleteFile } = await import('@/storage/oss-client');
      await ossDeleteFile({ key: category.zip_file_key });
      console.log(`[PackageDelete] ZIP deleted from OSS: ${category.zip_file_key}`);
    } catch (err) {
      console.error('[PackageDelete] OSS delete error (continuing):', err);
    }

    // Clear zip_file_key in database
    const { error: updateError } = await client
      .from('categories')
      .update({ zip_file_key: null })
      .eq('id', categoryId);

    if (updateError) {
      console.error('[PackageDelete] Failed to update category:', updateError);
      return NextResponse.json({ error: '更新分类信息失败' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `${category.name} ZIP包已删除`,
    });
  } catch (err) {
    console.error('[PackageDelete] Error:', err);
    return NextResponse.json(
      { error: '删除ZIP失败: ' + (err instanceof Error ? err.message : String(err)) },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const categoryId = formData.get('categoryId') as string;

    if (!file || !categoryId) {
      return NextResponse.json({ error: '缺少必要参数（file 和 categoryId）' }, { status: 400 });
    }

    // Validate file type
    if (!file.name.endsWith('.zip')) {
      return NextResponse.json({ error: '请上传 ZIP 文件' }, { status: 400 });
    }

    const client = getSupabaseClient();

    // Get category info
    const { data: category, error: catError } = await client
      .from('categories')
      .select('id, slug, name, zip_file_key')
      .eq('id', categoryId)
      .maybeSingle();

    if (catError || !category) {
      return NextResponse.json({ error: '分类不存在' }, { status: 404 });
    }

    // Read file buffer
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const sizeMB = (fileBuffer.length / 1024 / 1024).toFixed(2);

    // Upload to OSS
    const zipKey = `zips/${category.slug}.zip`;
    await ossUploadFile({
      fileContent: fileBuffer,
      key: zipKey,
      contentType: 'application/zip',
    });

    console.log(`[PackageUpload] ZIP uploaded: ${zipKey} (${sizeMB} MB)`);

    // Delete old ZIP if key changed
    if (category.zip_file_key && category.zip_file_key !== zipKey) {
      try {
        const { ossDeleteFile } = await import('@/storage/oss-client');
        await ossDeleteFile({ key: category.zip_file_key });
        console.log(`[PackageUpload] Old ZIP deleted: ${category.zip_file_key}`);
      } catch {
        // Ignore delete errors
      }
    }

    // Update category
    const { error: updateError } = await client
      .from('categories')
      .update({ zip_file_key: zipKey })
      .eq('id', categoryId);

    if (updateError) {
      console.error('[PackageUpload] Failed to update category:', updateError);
      return NextResponse.json({ error: '更新分类信息失败' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      zipKey,
      sizeMB,
      message: `${category.name} ZIP包上传成功（${sizeMB} MB）`,
    });
  } catch (err) {
    console.error('[PackageUpload] Error:', err);
    return NextResponse.json(
      { error: '上传ZIP失败: ' + (err instanceof Error ? err.message : String(err)) },
      { status: 500 }
    );
  }
}
