import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { requireAdmin } from '../_auth';

/**
 * GET /api/xiaoheiduo9898/dedup
 * Find duplicate images (same category_id + same title, keep the earliest one)
 */
export async function GET(request: NextRequest) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  try {
    const client = getSupabaseClient();

    // Fetch all images ordered by created_at (without join to avoid potential issues)
    // Note: Supabase defaults to max 1000 rows, so we paginate to get all
    const allImages: Array<{ id: string; title: string; thumbnail_url: string | null; hd_image_key: string | null; category_id: string; created_at: string }> = [];
    let page = 0;
    const PAGE_SIZE = 1000;
    let hasMore = true;

    while (hasMore) {
      const { data, error } = await client
        .from('vision_images')
        .select('id, title, thumbnail_url, hd_image_key, category_id, created_at')
        .order('created_at', { ascending: true })
        .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      if (data && data.length > 0) {
        allImages.push(...data);
      }

      hasMore = (data?.length || 0) === PAGE_SIZE;
      page++;
    }

    if (allImages.length === 0) {
      return NextResponse.json({ duplicateGroups: [], totalDuplicates: 0, totalGroups: 0 });
    }

    // Fetch categories for display names
    const { data: cats } = await client
      .from('categories')
      .select('id, name, name_cn');

    const catMap = new Map((cats || []).map(c => [c.id, c]));

    // Group by category_id + title, find duplicates
    const groupMap = new Map<string, typeof allImages>();
    for (const img of allImages) {
      const key = `${img.category_id}::${img.title}`;
      if (!groupMap.has(key)) {
        groupMap.set(key, []);
      }
      groupMap.get(key)!.push(img);
    }

    // For each group with more than 1 image, keep the first (earliest), rest are duplicates
    const duplicateGroups: Array<{
      title: string;
      categoryName: string;
      categoryNameCn: string;
      categoryId: string;
      keepId: string;
      duplicateIds: string[];
      duplicateCount: number;
    }> = [];

    let totalDuplicates = 0;

    for (const [, group] of groupMap) {
      if (group.length > 1) {
        const first = group[0];
        const cat = catMap.get(first.category_id);
        duplicateGroups.push({
          title: first.title,
          categoryName: cat?.name || 'Unknown',
          categoryNameCn: cat?.name_cn || '未知',
          categoryId: first.category_id,
          keepId: first.id,
          duplicateIds: group.slice(1).map(g => g.id),
          duplicateCount: group.length - 1,
        });
        totalDuplicates += group.length - 1;
      }
    }

    return NextResponse.json({
      duplicateGroups,
      totalDuplicates,
      totalGroups: duplicateGroups.length,
    });
  } catch (err) {
    console.error('Dedup GET error:', err);
    return NextResponse.json({ error: '查找重复图片失败' }, { status: 500 });
  }
}

/**
 * POST /api/xiaoheiduo9898/dedup
 * Execute deduplication: delete duplicate images from DB and OSS
 * Body: { categoryIds?: string[] } - optional filter by category IDs, if empty = all
 */
export async function POST(request: NextRequest) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  try {
    const body = await request.json().catch(() => ({}));
    const categoryFilter: string[] | undefined = body.categoryIds;

    const client = getSupabaseClient();

    // Fetch all images ordered by created_at (paginate to get all, Supabase default max 1000)
    const allImages: Array<{ id: string; title: string; thumbnail_url: string | null; hd_image_key: string | null; category_id: string; created_at: string }> = [];
    let page = 0;
    const PAGE_SIZE = 1000;
    let hasMore = true;

    while (hasMore) {
      let query = client
        .from('vision_images')
        .select('id, title, thumbnail_url, hd_image_key, category_id, created_at')
        .order('created_at', { ascending: true })
        .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

      if (categoryFilter && categoryFilter.length > 0) {
        // Need to re-apply filter for each page
        const { data, error } = await client
          .from('vision_images')
          .select('id, title, thumbnail_url, hd_image_key, category_id, created_at')
          .order('created_at', { ascending: true })
          .in('category_id', categoryFilter)
          .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

        if (error) {
          return NextResponse.json({ error: error.message }, { status: 500 });
        }
        if (data && data.length > 0) allImages.push(...data);
        hasMore = (data?.length || 0) === PAGE_SIZE;
        page++;
        continue;
      }

      const { data, error } = await query;

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      if (data && data.length > 0) allImages.push(...data);
      hasMore = (data?.length || 0) === PAGE_SIZE;
      page++;
    }

    // Group by category_id + title, find duplicates
    const groupMap = new Map<string, typeof allImages>();
    for (const img of allImages) {
      const key = `${img.category_id}::${img.title}`;
      if (!groupMap.has(key)) {
        groupMap.set(key, []);
      }
      groupMap.get(key)!.push(img);
    }

    // Collect all duplicate IDs to delete
    const idsToDelete: string[] = [];
    const imagesToDelete: Array<{ id: string; thumbnail_url: string | null; hd_image_key: string | null }> = [];

    for (const [, group] of groupMap) {
      if (group.length > 1) {
        // Keep the first (earliest), delete the rest
        for (let i = 1; i < group.length; i++) {
          idsToDelete.push(group[i].id);
          imagesToDelete.push({
            id: group[i].id,
            thumbnail_url: group[i].thumbnail_url,
            hd_image_key: group[i].hd_image_key,
          });
        }
      }
    }

    if (idsToDelete.length === 0) {
      return NextResponse.json({ success: true, deletedCount: 0, message: '没有发现重复图片' });
    }

    // Delete OSS files for duplicate images
    const { ossDeleteFile, isOssKey } = await import('@/storage/oss-client');
    let ossDeleted = 0;
    let ossFailed = 0;

    for (const img of imagesToDelete) {
      // Delete thumbnail from OSS
      if (img.thumbnail_url && isOssKey(img.thumbnail_url)) {
        try {
          await ossDeleteFile({ key: img.thumbnail_url });
          ossDeleted++;
        } catch (e) {
          console.error('Failed to delete OSS thumbnail:', e);
          ossFailed++;
        }
      }
      // Delete HD image from OSS
      if (img.hd_image_key && isOssKey(img.hd_image_key)) {
        try {
          await ossDeleteFile({ key: img.hd_image_key });
          ossDeleted++;
        } catch (e) {
          console.error('Failed to delete OSS HD image:', e);
          ossFailed++;
        }
      }
    }

    // Delete duplicate records from database in batches
    const BATCH_SIZE = 100;
    let dbDeleted = 0;

    for (let i = 0; i < idsToDelete.length; i += BATCH_SIZE) {
      const batch = idsToDelete.slice(i, i + BATCH_SIZE);
      const { error: delError } = await client
        .from('vision_images')
        .delete()
        .in('id', batch);

      if (delError) {
        console.error('Batch delete error:', delError);
      } else {
        dbDeleted += batch.length;
      }
    }

    // Update image_count for affected categories
    const affectedCategoryIds = new Set<string>();
    for (const img of imagesToDelete) {
      const found = allImages.find(i => i.id === img.id);
      if (found) affectedCategoryIds.add(found.category_id);
    }

    for (const catId of affectedCategoryIds) {
      if (!catId) continue;
      const { count } = await client
        .from('vision_images')
        .select('*', { count: 'exact', head: true })
        .eq('category_id', catId);

      await client
        .from('categories')
        .update({ image_count: count || 0 })
        .eq('id', catId);
    }

    return NextResponse.json({
      success: true,
      deletedCount: dbDeleted,
      ossDeleted,
      ossFailed,
      message: `已删除 ${dbDeleted} 条重复图片记录，OSS 文件清理完成（成功 ${ossDeleted}，失败 ${ossFailed}）`,
    });
  } catch (err) {
    console.error('Dedup POST error:', err);
    return NextResponse.json({ error: '去重操作失败' }, { status: 500 });
  }
}
