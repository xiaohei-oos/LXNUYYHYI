import type { MetadataRoute } from 'next';
import { getSupabaseClient } from '@/storage/database/supabase-client';

const BASE_URL = 'https://lxnuyyhyi.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const client = getSupabaseClient();
  const { data: categories } = await client
    .from('categories')
    .select('slug, updated_at')
    .order('sort_order', { ascending: true });

  const categoryEntries: MetadataRoute.Sitemap = (categories || []).map((cat: { slug: string; updated_at: string }) => ({
    url: `${BASE_URL}/category/${cat.slug}`,
    lastModified: new Date(cat.updated_at),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  return [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    ...categoryEntries,
    {
      url: `${BASE_URL}/faq`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/terms`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/license`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.4,
    },
  ];
}
