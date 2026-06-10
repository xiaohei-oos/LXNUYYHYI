import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { requireAdmin } from '../_auth';

export async function GET(request: NextRequest) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const categoryId = searchParams.get('categoryId');

    const client = getSupabaseClient();
    let query = client
      .from('vision_images')
      .select('id, title, title_cn, thumbnail_url, hd_image_key, category_id')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ images: data || [] });
  } catch (err) {
    console.error('Admin images GET error:', err);
    return NextResponse.json({ error: 'Failed to fetch images' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const { categoryId, title, titleCn, hdImageKey, thumbnailUrl } = body;

    if (!categoryId || !title || !hdImageKey || !thumbnailUrl) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const client = getSupabaseClient();

    // Insert image
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
    console.error('Admin images POST error:', err);
    return NextResponse.json({ error: 'Failed to create image' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const idsParam = searchParams.get('ids');

    // Batch delete mode: ?ids=id1,id2,id3
    if (idsParam) {
      const ids = idsParam.split(',').filter(Boolean);
      if (ids.length === 0) {
        return NextResponse.json({ error: 'No ids provided' }, { status: 400 });
      }

      const client = getSupabaseClient();

      // Get images info before deleting (need keys for OSS cleanup)
      const { data: imgs } = await client
        .from('vision_images')
        .select('id, category_id, thumbnail_url, hd_image_key')
        .in('id', ids);

      // Delete from OSS
      if (imgs && imgs.length > 0) {
        const { ossDeleteFile, isOssKey } = await import('@/storage/oss-client');
        let ossDeleted = 0;
        let ossFailed = 0;

        for (const img of imgs) {
          if (img.thumbnail_url && isOssKey(img.thumbnail_url)) {
            try { await ossDeleteFile({ key: img.thumbnail_url }); ossDeleted++; }
            catch (e) { console.error('Batch: Failed to delete OSS thumbnail:', e); ossFailed++; }
          }
          if (img.hd_image_key && isOssKey(img.hd_image_key)) {
            try { await ossDeleteFile({ key: img.hd_image_key }); ossDeleted++; }
            catch (e) { console.error('Batch: Failed to delete OSS HD image:', e); ossFailed++; }
          }
        }
        console.log(`Batch delete OSS: ${ossDeleted} deleted, ${ossFailed} failed`);
      }

      // Delete from database in batches
      const BATCH_SIZE = 100;
      let dbDeleted = 0;
      for (let i = 0; i < ids.length; i += BATCH_SIZE) {
        const batch = ids.slice(i, i + BATCH_SIZE);
        const { error: delError, count } = await client
          .from('vision_images')
          .delete({ count: 'exact' })
          .in('id', batch);
        if (delError) {
          console.error('Batch delete DB error:', delError);
        } else {
          dbDeleted += count || batch.length;
        }
      }

      // Update image_count for affected categories
      if (imgs && imgs.length > 0) {
        const affectedCatIds = [...new Set(imgs.map(img => img.category_id))];
        for (const catId of affectedCatIds) {
          const { count } = await client
            .from('vision_images')
            .select('*', { count: 'exact', head: true })
            .eq('category_id', catId);
          await client
            .from('categories')
            .update({ image_count: count || 0 })
            .eq('id', catId);
        }
      }

      return NextResponse.json({
        success: true,
        deletedCount: dbDeleted,
        message: `已删除 ${dbDeleted} 张图片`,
      });
    }

    // Single delete mode: ?id=xxx
    if (!id) {
      return NextResponse.json({ error: 'Missing image id or ids' }, { status: 400 });
    }

    const client = getSupabaseClient();

    // Get image info before deleting (need keys to delete from OSS)
    const { data: img } = await client
      .from('vision_images')
      .select('category_id, thumbnail_url, hd_image_key')
      .eq('id', id)
      .maybeSingle();

    // Delete from OSS if keys exist (import dynamically to avoid circular)
    if (img) {
      const { ossDeleteFile, isOssKey } = await import('@/storage/oss-client');
      if (img.thumbnail_url && isOssKey(img.thumbnail_url)) {
        try {
          await ossDeleteFile({ key: img.thumbnail_url });
        } catch (e) {
          console.error('Failed to delete thumbnail from OSS:', e);
        }
      }

      if (img.hd_image_key && isOssKey(img.hd_image_key)) {
        try {
          await ossDeleteFile({ key: img.hd_image_key });
        } catch (e) {
          console.error('Failed to delete HD image from OSS:', e);
        }
      }
    }

    // Delete from database
    const { error } = await client
      .from('vision_images')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Update category image_count
    if (img?.category_id) {
      const { data: catData } = await client
        .from('categories')
        .select('image_count')
        .eq('id', img.category_id)
        .maybeSingle();

      if (catData) {
        await client
          .from('categories')
          .update({ image_count: Math.max(0, catData.image_count - 1) })
          .eq('id', img.category_id);
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Admin images DELETE error:', err);
    return NextResponse.json({ error: 'Failed to delete image' }, { status: 500 });
  }
}
